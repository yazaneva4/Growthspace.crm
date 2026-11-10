import { requestText } from "@/lib/request-input";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServiceClient, serviceKeyConfigured } from "@/lib/supabase/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";
import { tooManyRequests } from "@/lib/rate-limit";

/**
 * Self-healing for any account stuck unconfirmed (e.g. created before the
 * auto-confirm trigger existed). Only confirms the account if the caller
 * proves they know the correct password for that email — a plain
 * sign-in attempt against the anon client distinguishes "wrong password"
 * (rejected) from "correct password, just unconfirmed" (the specific error
 * this heals), so this can't be used to confirm an arbitrary email you
 * don't control. Requires SUPABASE_SERVICE_ROLE_KEY; no-ops otherwise.
 */
export async function POST(req: NextRequest) {
  // Each call verifies a password, so cap the guessing rate per client.
  if (tooManyRequests(req, "force-confirm", 10)) {
    return NextResponse.json({ fixed: false, error: "Too many attempts" }, { status: 429 });
  }
  if (!serviceKeyConfigured()) {
    return NextResponse.json({ fixed: false });
  }

  const body = await req.json().catch(() => null);
  const email = requestText(body?.email).toLowerCase();
  const password = body?.password as string | undefined;
  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  // Prove the caller knows the password before touching anything.
  const anon = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { error: signInError } = await anon.auth.signInWithPassword({ email, password });
  if (!signInError) {
    // Already confirmed and working — nothing to fix.
    return NextResponse.json({ fixed: true });
  }
  if (!/email not confirmed/i.test(signInError.message)) {
    // Wrong password or some other issue — do not confirm.
    return NextResponse.json({ fixed: false });
  }

  const admin = createServiceClient();
  const { data, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    return NextResponse.json({ fixed: false });
  }
  const user = data.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    return NextResponse.json({ fixed: false });
  }

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });
  return NextResponse.json({ fixed: !error });
}
