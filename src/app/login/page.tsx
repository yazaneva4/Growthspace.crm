"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

declare global { interface Window { turnstile?: { render: (el: HTMLElement, opts: { sitekey: string; action: string; callback: (token: string) => void; "error-callback": () => void; "expired-callback": () => void }) => string; reset: (id?: string) => void } } }

type Mode = "signin" | "signup";
type Step = "email" | "method" | "security";
const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const PRODUCTION_APP_URL = "https://growthspacecrm.vercel.app";

function origin() { return typeof window === "undefined" ? PRODUCTION_APP_URL : window.location.origin; }

export default function LoginPage() {
  const router = useRouter();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [securityConfigured, setSecurityConfigured] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [deviceLive, setDeviceLive] = useState(false);

  useEffect(() => { if (new URLSearchParams(window.location.search).get("error") === "link") setError("That sign-in link expired or was opened on a different device or browser than the one that requested it. Request a new link and open it on the same device."); }, []);

  useEffect(() => { setPasskeySupported(typeof window !== "undefined" && !!window.PublicKeyCredential && !!navigator.credentials?.get); }, []);

  // Realtime auth state for device/passkey sign-in only
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setDeviceLive(true);
        setSecurityConfigured(true);
        setNotice("Device sign-in live. Redirecting…");
        router.replace("/dashboard/inbox");
        router.refresh();
      }
      if (event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        setDeviceLive(true);
      }
    });
    return () => { subscription.unsubscribe(); };
  }, [router]);

  useEffect(() => {
    if (step !== "method" || !turnstileReady || !turnstileSiteKey || !turnstileRef.current || !window.turnstile) return;
    if (widgetRef.current) { window.turnstile.reset(widgetRef.current); return; }
    widgetRef.current = window.turnstile.render(turnstileRef.current, { sitekey: turnstileSiteKey, action: "growthspace_auth", callback: (token) => { setTurnstileToken(token); setError(null); }, "error-callback": () => setTurnstileToken(null), "expired-callback": () => setTurnstileToken(null) });
    return () => { if (widgetRef.current && window.turnstile) window.turnstile.reset(widgetRef.current); widgetRef.current = null; setTurnstileToken(null); };
  }, [step, turnstileReady]);

  async function verifyTurnstile() {
    if (!turnstileSiteKey) throw new Error("Bot verification is not configured yet.");
    if (!turnstileToken) throw new Error("Please complete the bot verification first.");
    const res = await fetch("/api/auth/turnstile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ "cf-turnstile-response": turnstileToken, action: "growthspace_auth" }) });
    const result = await res.json().catch(() => null);
    setTurnstileToken(null); if (widgetRef.current && window.turnstile) window.turnstile.reset(widgetRef.current);
    if (!res.ok || !result?.ok) throw new Error(result?.error ?? "Bot verification failed.");
  }

  function friendly(message: string) {
    if (/invalid.*password|invalid login credentials/i.test(message)) return "The email or password is incorrect.";
    if (/email_not_confirmed|confirm.*email/i.test(message)) return "This account still requires email confirmation. No verification code is used; confirmation is by email link.";
    if (/passkey_disabled/i.test(message)) return "Passkey sign-in is not enabled for this project yet.";
    return message;
  }

  /** Maps a WebAuthn failure to its real cause using Supabase's error code and the browser's DOMException name. */
  function passkeyMessage(e: unknown, action: "sign-in" | "setup") {
    const err = e as { name?: string; code?: string; message?: string; cause?: { name?: string } } | null;
    const code = err?.code ?? "";
    const name = err?.cause?.name ?? err?.name ?? "";
    if (code === "ERROR_CEREMONY_ABORTED") return "Another passkey prompt is still open. Close it and try again.";
    if (code === "ERROR_INVALID_DOMAIN" || code === "ERROR_INVALID_RP_ID" || name === "SecurityError") return "Passkeys cannot be used on this web address. Open GrowthSpace on its official HTTPS address and try again.";
    if (code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED" || name === "InvalidStateError") return "A passkey for this account is already saved on this device.";
    if (code === "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT" || code === "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT" || code === "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG" || name === "NotSupportedError") return "This device or security key does not support passkey sign-in.";
    if (name === "NotAllowedError") return action === "sign-in" ? "The passkey prompt was cancelled or timed out. Try again. If this device has no passkey saved for GrowthSpace, use your password or a magic link." : "Passkey setup was cancelled or timed out. Try again.";
    return friendly(err?.message ?? (action === "sign-in" ? "Passkey sign-in failed" : "Security setup failed"));
  }

  async function signInPassword() {
    if (!email.trim()) throw new Error("Enter your email address.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    await verifyTurnstile();
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (authError) throw authError;
    router.replace("/dashboard/inbox"); router.refresh();
  }

  async function signUp() {
    if (!email.trim()) throw new Error("Enter your email address.");
    if (!name.trim()) throw new Error("Enter your name.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    await verifyTurnstile();
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options: { emailRedirectTo: `${origin()}/auth/callback?next=/dashboard/inbox`, data: { full_name: name.trim() } } });
    if (authError) throw authError;
    if (!data.session) throw new Error("Account created. Check your email and follow the confirmation link, then return to GrowthSpace. No verification code is used.");
    setNotice("Account created. Now configure the secure sign-in method available on this device."); setStep("security");
  }

    async function requestMagicLink() {
    setBusy(true); setError(null); setNotice(null); setMagicLinkSent(false);
    try {
      if (!email.trim()) throw new Error("Enter your email address.");
      if (!turnstileToken) throw new Error("Please complete the bot verification first.");
      const res = await fetch("/api/auth/magic-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase(), turnstileToken }) });
      const result = await res.json().catch(() => null);
      setTurnstileToken(null); if (widgetRef.current && window.turnstile) window.turnstile.reset(widgetRef.current);
      if (!res.ok) throw new Error(result?.error ?? "Could not send a sign-in link.");
      setMagicLinkSent(true);
      setNotice(result?.message ?? "If an account exists for that address, a sign-in link is on its way.");
    } catch (e) { setError(friendly(e instanceof Error ? e.message : "Could not send a sign-in link.")); }
    finally { setBusy(false); }
  }

async function passkeySignIn() {
    setBusy(true); setError(null);
    try {
      if (!passkeySupported) throw new Error("This browser does not support passkeys.");
      await verifyTurnstile();
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPasskey();
      if (authError) throw authError;
      setDeviceLive(true);
      setNotice("Device sign-in live.");
      // Auth state change listener handles the realtime redirect
    } catch (e) {
      setError(passkeyMessage(e, "sign-in"));
      setBusy(false);
    }
  }

  async function registerPasskey() {
    if (!passkeySupported) return;
    setBusy(true); setError(null);
    try {
      const supabase = createClient();
      const { error: passkeyError } = await supabase.auth.registerPasskey();
      if (passkeyError) throw passkeyError;
      setSecurityConfigured(true);
      setDeviceLive(true);
      setNotice("Secure device sign-in is configured and live. Your biometric data and private authenticator key stay on the device.");
    } catch (e) {
      setError(passkeyMessage(e, "setup"));
    } finally {
      setBusy(false);
    }
  }

  async function google() { setBusy(true); setError(null); const supabase = createClient(); const { error: authError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origin()}/auth/callback?next=/dashboard/inbox` } }); if (authError) { setError(friendly(authError.message)); setBusy(false); } }

  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setError(null); setNotice(null); try { if (mode === "signin") await signInPassword(); else await signUp(); } catch (err) { setError(friendly(err instanceof Error ? err.message : "Authentication failed")); setBusy(false); } }

  return <main className="flex min-h-screen items-center justify-center bg-white px-6 text-slate-950"><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer onLoad={() => setTurnstileReady(true)} /><div className="w-full max-w-sm space-y-7"><div className="flex justify-center"><Logo variant="light" size={56} /></div><div className="text-center"><h1 className="text-xl font-bold">{step === "security" ? "Secure your account" : mode === "signin" ? "Welcome back" : "Create your account"}</h1><p className="mt-1 text-sm text-slate-500">{step === "security" ? "Configure device sign-in" : step === "email" ? "Enter your email to continue" : mode === "signin" ? "Choose a sign-in method" : "Email, name, password, and bot verification"}</p></div>
    {googleEnabled && step === "email" && <button onClick={google} disabled={busy} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium">Continue with Google</button>}
    {step === "email" && <div className="space-y-3"><form onSubmit={(e) => { e.preventDefault(); setError(null); if (!email.trim()) return setError("Enter your email address."); setStep("method"); }} className="space-y-3"><input autoFocus required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.sa" autoComplete="email" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" /><button disabled={busy} className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white">Continue</button></form><button type="button" onClick={() => { setMode("signup"); setStep("method"); setError(null); }} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium">Create account</button></div>}
    {step === "method" && <div className="space-y-4"><button onClick={() => { setStep("email"); setError(null); }} className="text-sm text-slate-500">← {email}</button>{mode === "signup" ? <form onSubmit={submit} className="space-y-3"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" autoComplete="email" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" /><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" /><input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" /><div ref={turnstileRef} className="cf-turnstile flex justify-center" /><button disabled={busy} className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white">{busy ? "Creating account…" : "Create account"}</button></form> : <><form onSubmit={submit} className="space-y-3"><input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" /><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me</label><div ref={turnstileRef} className="cf-turnstile flex justify-center" /><button disabled={busy} className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white">{busy ? "Signing in…" : "Sign in with password"}</button></form><button type="button" onClick={requestMagicLink} disabled={busy || magicLinkSent} className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 disabled:opacity-50">{busy ? "Sending link…" : magicLinkSent ? "Link sent" : "Email me a magic link"}</button><button onClick={passkeySignIn} disabled={busy || !passkeySupported} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold disabled:opacity-50">{deviceLive ? "Device sign-in live" : "Use passkey / device biometric"}</button></>}</div>}
    {step === "security" && <div className="space-y-4"><div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"><p className="font-semibold">Account</p><p className="mt-2">{email}</p><p className="text-slate-500">{name}</p>{deviceLive && <p className="mt-2 text-xs font-medium text-emerald-600">● Device sign-in live</p>}</div>{passkeySupported ? <button onClick={registerPasskey} disabled={busy || securityConfigured} className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{securityConfigured ? (deviceLive ? "Device sign-in configured · live" : "Device sign-in configured") : busy ? "Setting up…" : "Set up passkey / device unlock"}</button> : <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Passkeys are not available in this browser.</p>}<button onClick={() => { router.replace("/dashboard/inbox"); router.refresh(); }} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium">Continue to GrowthSpace</button><p className="text-xs text-slate-500">Windows Hello, Touch ID, Face ID, fingerprint, or another supported device unlock may be used by the platform. GrowthSpace does not receive biometric data or private authenticator keys.</p></div>}
    {error && <p className="text-xs text-red-600">{error}</p>}{notice && <p className="text-xs text-emerald-600">{notice}</p>}<div className="text-center"><Link href="/" className="text-xs text-slate-500">← Back home</Link></div></div></main>;
}
