import { requestText } from "@/lib/request-input";
import { NextRequest, NextResponse } from "next/server";
import { respondBestAvailable, AIUnavailableError } from "@/lib/ai/responder";
import type { BrandVoice, ReplyMode } from "@/lib/types";
import { tooManyRequests } from "@/lib/rate-limit";

// Allow up to 30s for the AI call (and any fallback tiers) so a slow provider
// doesn't get killed early and surface as a "crash" to the user.
export const maxDuration = 30;

/**
 * Live demo endpoint: runs the full responder pipeline on a single message
 * without touching the database. Tries Claude, then Gemini — always a real
 * AI-generated reply; never demo/canned text.
 */
const DEMO_VOICE: BrandVoice = {
  tone: "Friendly, warm, professional Saudi brand. Uses light, respectful Khaleeji dialect.",
  facts:
    "Working hours: 10am–10pm Sat–Thu. Delivery across KSA in 2–4 days. Returns within 7 days. We sell premium oud and perfumes.",
  guardrails: ["Never promise discounts not approved by the team"],
  examples: [
    {
      customer: "How much is the oud?",
      reply: "Hello! 🌿 Our oud starts from 250 SAR. Want me to send you the full list?",
    },
  ],
};

export async function POST(req: NextRequest) {
  if (tooManyRequests(req, "simulate", 20)) {
    return NextResponse.json(
      { error: "Too many messages, please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }
  const body = await req.json().catch(() => null);
  const message = requestText(body?.message).slice(0, 2000);
  if (!message?.trim()) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const replyMode: ReplyMode = body?.replyMode ?? "autonomous";
  const threshold: number =
    typeof body?.threshold === "number" ? body.threshold : 0.75;
  const history: { author: string; body: string }[] = body?.history ?? [];
  const customerName: string | null =
    typeof body?.customerName === "string" ? body.customerName : null;

  try {
    const result = await respondBestAvailable(message, {
      voice: DEMO_VOICE,
      replyMode,
      threshold,
      history,
      customerName,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AIUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error(err);
    return NextResponse.json(
      { error: "responder failed", detail: String(err) },
      { status: 500 },
    );
  }
}
