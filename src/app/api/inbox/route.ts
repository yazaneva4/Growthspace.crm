import { requestText } from "@/lib/request-input";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleInbound } from "@/lib/orchestrator";
import { AIUnavailableError } from "@/lib/ai/responder";
import { tooManyRequests } from "@/lib/rate-limit";

export const maxDuration = 30;

/**
 * Demo/sandbox inbound endpoint. Real customer email should use
 * /api/inbox/email/webhook, which authenticates the mail provider webhook
 * and preserves email identity/thread metadata.
 *
 * This route performs trusted server-side ingestion, so it uses the
 * service-role client. The browser never receives that key.
 */
export async function POST(req: NextRequest) {
  // No session is required here (the dashboard simulator is usable in the demo
  // workspace), so throttle per client: every call writes rows and spends AI.
  if (tooManyRequests(req, "inbox", 30)) {
    return NextResponse.json(
      { error: "Too many messages, please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }
  const body = await req.json().catch(() => null);
  const message = requestText(body?.message).slice(0, 4000);
  if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

  const channel: "email" | "sandbox" = body?.channel === "email" ? "email" : "sandbox";
  const accountExternalId = channel === "email" ? "support-inbox" : "demo-sandbox";
  const customerHandle: string = typeof body?.customerHandle === "string"
    ? body.customerHandle.trim().toLowerCase()
    : channel === "email" ? "visitor@example.com" : "demo_visitor";
  const customerEmail = channel === "email" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerHandle)
    ? customerHandle
    : undefined;

  const db = createServiceClient();
  try {
    const result = await handleInbound({
      platform: channel,
      accountExternalId,
      customerHandle,
      customerEmail,
      customerName: body?.customerName,
      body: message,
      subject: typeof body?.subject === "string" ? body.subject.trim() : undefined,
      externalMessageId: typeof body?.externalMessageId === "string" ? body.externalMessageId.trim() : undefined,
      inReplyTo: typeof body?.inReplyTo === "string" ? body.inReplyTo.trim() : undefined,
      receivedAt: new Date().toISOString(),
    }, db);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    if (err instanceof AIUnavailableError) return NextResponse.json({ error: err.message }, { status: 503 });
    console.error(err);
    return NextResponse.json({ error: "pipeline failed", detail: String(err) }, { status: 500 });
  }
}
