import { createHmac, timingSafeEqual } from "node:crypto";
import { sendEmail } from "@/lib/email/send";

export const runtime = "nodejs";
const PRODUCTION_APP_URL = "https://growthspacecrm.vercel.app";

function secretBytes() {
  const raw = process.env.AUTH_EMAIL_HOOK_SECRET;
  if (!raw) throw new Error("AUTH_EMAIL_HOOK_SECRET is not configured");
  const encoded = raw.replace(/^v1,whsec_/, "");
  return Buffer.from(encoded, "base64");
}

function verifySignature(body: string, headers: Headers) {
  const secret = secretBytes();
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature");
  if (!id || !timestamp || !signatures) return false;
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;
  const signed = `${id}.${timestamp}.${body}`;
  const expected = createHmac("sha256", secret).update(signed).digest("base64");
  return signatures.split(" ").some((value) => {
    const supplied = Buffer.from(value.replace(/^v1,/, ""));
    const wanted = Buffer.from(expected);
    return supplied.length === wanted.length && timingSafeEqual(supplied, wanted);
  });
}

function appUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured && /^https:\/\//i.test(configured) && !/localhost|127\.0\.0\.1/i.test(configured)) return configured;
  return PRODUCTION_APP_URL;
}

function emailContent(action: string, tokenHash: string) {
  const callback = `${appUrl()}/auth/callback`;
  const type = action === "signup" ? "email" : action;
  const link = tokenHash
    ? `${callback}?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}&next=%2Fdashboard%2Finbox`
    : "";
  const labels: Record<string, string> = {
    signup: "Confirm your GrowthSpace account",
    magiclink: "Sign in to GrowthSpace",
    recovery: "Reset your GrowthSpace password",
    invite: "Your GrowthSpace invitation",
    email_change: "Confirm your new GrowthSpace email",
    reauthentication: "Confirm your GrowthSpace session",
  };
  const subject = labels[action] ?? "Continue with GrowthSpace";
  const text = `${subject}\n\nUse this secure link to continue:\n${link}\n\nIf you did not request this, you can ignore this email.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><div style="font-weight:700;font-size:20px">GrowthSpace</div><h2>${subject}</h2><p>Use the secure button below to continue.</p><p><a href="${link}" style="display:inline-block;padding:12px 18px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px">Continue securely</a></p><p style="color:#64748b;font-size:13px">This email does not contain a sign-in code. If you did not request this, you can ignore it.</p></div>`;
  return { subject, text, html };
}

export async function POST(request: Request) {
  const body = await request.text();
  try {
    if (!verifySignature(body, request.headers)) return Response.json({ error: "Invalid webhook signature" }, { status: 401 });

    const payload = JSON.parse(body) as {
      user?: { email?: string };
      email_data?: { token_hash?: string; email_action_type?: string };
    };
    const to = payload.user?.email?.trim();
    const data = payload.email_data;
    if (!to || !data?.email_action_type) return Response.json({ error: "Invalid email hook payload" }, { status: 400 });

    const content = emailContent(data.email_action_type, data.token_hash ?? "");
    const sent = await sendEmail({ to, subject: content.subject, text: content.text, html: content.html });
    if (!sent) return Response.json({ error: "App email transport is not configured" }, { status: 503 });
    return Response.json({});
  } catch (error) {
    console.error("[auth-email-hook] failed", error);
    return Response.json({ error: "Email delivery failed" }, { status: 500 });
  }
}
