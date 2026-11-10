import { NextRequest, NextResponse } from "next/server";
import chromiumBinary from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import { getCurrentContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isAllowedBrowserApp, normalizeBrowserPolicy } from "@/lib/ai/browser-policy";

export const runtime = "nodejs";
export const maxDuration = 60;

type BrowserAction = "navigate" | "inspect" | "screenshot" | "click" | "fill" | "press" | "select";

function allowedOrigins(requestOrigin: string): Set<string> {
  const values = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.GROWTHSPACE_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    "https://growthspacecrm.vercel.app",
    "https://growthspace.sa",
    "https://www.growthspace.sa",
  ];
  if (process.env.NODE_ENV !== "production") {
    values.push("http://localhost:3000", "http://127.0.0.1:3000");
  }
  const origins = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    try {
      const url = new URL(value.includes("://") ? value : `https://${value}`);
      if (url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.hostname === "localhost" && url.protocol === "http:")) {
        origins.add(url.origin);
      }
    } catch { /* Ignore malformed deployment configuration. */ }
  }
  if (origins.has(requestOrigin)) return origins;
  return origins;
}

async function getWorkspace() {
  const ctx = await getCurrentContext();
  if (!ctx.userId || ctx.isDemo) {
    return { error: NextResponse.json({ error: "Sign in to use Growth AI's headless browser." }, { status: 401 }) };
  }

  const db = await createClient();
  const { data: membership } = await db
    .from("memberships")
    .select("org_id, role")
    .eq("user_id", ctx.userId)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return { error: NextResponse.json({ error: "Workspace membership could not be loaded." }, { status: 404 }) };
  }

  const { data: org, error } = await db
    .from("organizations")
    .select("id, browser_policy")
    .eq("id", membership.org_id)
    .maybeSingle();

  if (error || !org) {
    return { error: NextResponse.json({ error: "Workspace browser policy could not be loaded." }, { status: 500 }) };
  }

  return {
    db,
    membership,
    policy: normalizeBrowserPolicy(org.browser_policy),
  };
}

export async function POST(req: NextRequest) {
  const workspace = await getWorkspace();
  if ("error" in workspace) return workspace.error;

  const body = await req.json().catch(() => null);
  const action = (typeof body?.action === "string" ? body.action : "inspect") as BrowserAction;
  const validActions: BrowserAction[] = ["navigate", "inspect", "screenshot", "click", "fill", "press", "select"];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: "Unsupported browser action." }, { status: 400 });
  }

  if (!workspace.policy.enabled || !isAllowedBrowserApp("growthspace", workspace.policy)) {
    return NextResponse.json({
      error: "Headless browser access is disabled for this workspace. A workspace owner or admin can enable it in Settings.",
      code: "BROWSER_DISABLED",
    }, { status: 403 });
  }

  type RequestedStep = { action: "click" | "fill" | "press" | "select"; selector: string; value: string };
  const steps: RequestedStep[] = [];
  if (body?.steps !== undefined && !Array.isArray(body.steps)) {
    return NextResponse.json({ error: "Browser steps must be a list." }, { status: 400 });
  }
  for (const candidate of (Array.isArray(body?.steps) ? body.steps : []).slice(0, 12)) {
    const stepAction = candidate && typeof candidate.action === "string" ? candidate.action : "";
    const stepSelector = candidate && typeof candidate.selector === "string" ? candidate.selector.trim() : "";
    const stepValue = candidate && typeof candidate.value === "string" ? candidate.value.slice(0, 4000) : "";
    if (!["click", "fill", "press", "select"].includes(stepAction) || !stepSelector || stepSelector.length > 500) {
      return NextResponse.json({ error: "Every browser step needs a supported action and a valid selector." }, { status: 400 });
    }
    steps.push({ action: stepAction as RequestedStep["action"], selector: stepSelector, value: stepValue });
  }

  const mutatingAction = steps.length > 0 || ["click", "fill", "press", "select"].includes(action);
  if (mutatingAction && !workspace.policy.computer_access_enabled) {
    return NextResponse.json({
      error: "Website controls are disabled. A workspace owner or admin must enable computer-level actions in Settings.",
      code: "BROWSER_CONTROLS_DISABLED",
    }, { status: 403 });
  }
  if (mutatingAction && workspace.policy.require_confirmation && body?.confirmed !== true) {
    return NextResponse.json({
      error: "Confirm the website action before running it.",
      code: "CONFIRMATION_REQUIRED",
    }, { status: 409 });
  }

  const requestOrigin = req.nextUrl.origin;
  const origins = allowedOrigins(requestOrigin);
  if (!origins.has(requestOrigin)) {
    return NextResponse.json({
      error: "This deployment host is not approved for authenticated browser access. Configure NEXT_PUBLIC_SITE_URL or GROWTHSPACE_SITE_URL for the canonical GrowthSpace website.",
    }, { status: 403 });
  }

  const requestedUrl = typeof body?.url === "string" && body.url.trim()
    ? body.url.trim()
    : `${requestOrigin}/dashboard`;
  let target: URL;
  try {
    target = new URL(requestedUrl, requestOrigin);
  } catch {
    return NextResponse.json({ error: "Enter a valid website URL." }, { status: 400 });
  }
  if (target.origin !== requestOrigin || target.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && target.protocol === "http:")) {
    return NextResponse.json({
      error: "For security, the headless browser can only open this GrowthSpace website. External websites are not allowed in the authenticated workspace session.",
    }, { status: 400 });
  }

  const selector = typeof body?.selector === "string" ? body.selector.trim().slice(0, 500) : "";
  const value = typeof body?.value === "string" ? body.value.slice(0, 4000) : "";

  let browser: Awaited<ReturnType<typeof playwright.launch>> | null = null;
  try {
    browser = await playwright.launch({
      args: chromiumBinary.args,
      executablePath: await chromiumBinary.executablePath(),
      headless: true,
      timeout: 20_000,
    });

    const context = await browser.newContext({
      viewport: { width: 1365, height: 960 },
      deviceScaleFactor: 1,
      ignoreHTTPSErrors: false,
    });

    const cookies = req.cookies.getAll().map(({ name, value: cookieValue }) => ({
      name,
      value: cookieValue,
      url: requestOrigin,
      httpOnly: false,
      secure: target.protocol === "https:",
      sameSite: "Lax" as const,
    }));
    if (cookies.length) await context.addCookies(cookies);

    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    page.setDefaultNavigationTimeout(15_000);

    // Keep every top-level navigation inside the authenticated GrowthSpace
    // origin, even when a page, form, or redirect attempts to leave it.
    await context.route("**/*", async (route) => {
      const request = route.request();
      if (request.isNavigationRequest()) {
        try {
          const navigation = new URL(request.url());
          if (navigation.origin !== requestOrigin || navigation.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && navigation.protocol === "http:")) {
            await route.abort("blockedbyclient");
            return;
          }
        } catch {
          await route.abort("blockedbyclient");
          return;
        }
      }
      await route.continue();
    });

    await page.goto(target.toString(), { waitUntil: "domcontentloaded" });

    // Recreate the same stable selectors returned by inspection. Every
    // request gets a fresh browser context, so markers must be rehydrated.
    await page.evaluate(() => {
      Array.from(document.querySelectorAll("a,button,input,textarea,select,[role='button'],[role='link']"))
        .slice(0, 100)
        .forEach((element, index) => {
          element.setAttribute("data-growth-ai-target", "growth-ai-target-" + index);
        });
    });

    const actionQueue = steps.length
      ? steps
      : ["click", "fill", "press", "select"].includes(action)
        ? [{ action: action as RequestedStep["action"], selector, value }]
        : [];

    for (const step of actionQueue) {
      if (!step.selector) {
        return NextResponse.json({ error: "Provide the CSS selector shown in the page inspection before running this action." }, { status: 400 });
      }
      const locator = page.locator(step.selector).first();
      if (step.action === "click") await locator.click();
      if (step.action === "fill") await locator.fill(step.value);
      if (step.action === "press") await locator.press(step.value || "Enter");
      if (step.action === "select") await locator.selectOption(step.value);
      await page.waitForLoadState("domcontentloaded", { timeout: 3000 }).catch(() => null);
    }

    await page.waitForTimeout(150);
    const result = await page.evaluate(() => {
      const body = document.body;
      const elements = Array.from(document.querySelectorAll("a,button,input,textarea,select,[role='button'],[role='link']"))
        .slice(0, 100)
        .map((element, index) => {
          const node = element as HTMLAnchorElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          const tag = node.tagName.toLowerCase();
          const text = (node.getAttribute("aria-label") || node.getAttribute("placeholder") || node.getAttribute("title") || node.innerText || node.getAttribute("name") || "").trim().replace(/\s+/g, " ").slice(0, 120);
          // Stamp a per-inspection selector: bare nth-of-type selectors can
          // point to a different button when similar controls repeat.
          const marker = "growth-ai-target-" + index;
          node.setAttribute("data-growth-ai-target", marker);
          const selector = '[data-growth-ai-target="' + marker + '"]';
          return {
            tag,
            selector,
            text,
            type: "type" in node ? String(node.type || "") : "",
            placeholder: node.getAttribute("placeholder") || "",
            href: tag === "a" ? (node as HTMLAnchorElement).href : "",
            disabled: "disabled" in node ? Boolean(node.disabled) : false,
          };
        });
      return {
        title: document.title || "GrowthSpace",
        text: (body?.innerText || "").slice(0, 14_000),
        elements,
      };
    });

    const screenshot = action === "screenshot" || action === "inspect" || action === "navigate"
      ? (await page.screenshot({ type: "png", fullPage: false })).toString("base64")
      : undefined;

    return NextResponse.json({
      ok: true,
      action,
      url: page.url(),
      title: result.title,
      text: result.text,
      elements: result.elements,
      screenshot: screenshot ? `data:image/png;base64,${screenshot}` : undefined,
      controlsEnabled: workspace.policy.computer_access_enabled,
      hostScoped: true,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Headless browser request failed.";
    console.error("Growth AI headless browser failed:", message);
    return NextResponse.json({
      error: message.includes("Executable doesn't exist") || message.includes("executablePath")
        ? "Headless Chromium is not available in this deployment bundle. Check the Vercel function tracing configuration."
        : "The headless browser could not complete that action. Check the URL or selector and try again.",
    }, { status: 502 });
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }
}
