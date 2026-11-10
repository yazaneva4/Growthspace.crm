# Deploying GrowthSpace to Vercel

> The existing GitHub repo is `yazaneva4/Growth-Inspector` until the repository is renamed in GitHub Settings. The production site is https://growthspacecrm.vercel.app.

The app is build-ready. Deployment needs your Vercel account (it can't be done
from the agent sandbox — no Vercel auth token here).

## Option A — Git integration (recommended, one-time)

1. Go to https://vercel.com/new and **import** the GitHub repo
   `yazaneva4/Growth-Inspector`.
2. Vercel auto-detects Next.js — no build settings needed.
3. Add the environment variables below, then **Deploy**.
4. Every push to the branch then deploys automatically.

## Option B — Vercel CLI (from your machine)

```bash
npm i -g vercel
vercel link          # pick/create the project
vercel env add ...   # add the variables below (or set them in the dashboard)
vercel --prod
```

## Option C — GitHub Actions (in this repo)

`.github/workflows/deploy.yml` deploys to Vercel on push. To enable it:

1. Create a Vercel token: https://vercel.com/account/tokens
2. Run `vercel link` once locally to generate `.vercel/project.json`, which
   contains `orgId` and `projectId`.
3. In GitHub → **Settings → Secrets and variables → Actions**, add secrets:
   - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
4. Add a repo **variable** `ENABLE_VERCEL_DEPLOY` = `true` (the workflow skips
   cleanly until this is set, so CI stays green meanwhile).
5. Set the app env vars (below) in the **Vercel project settings**.

`.github/workflows/ci.yml` runs lint + build on every push regardless.

## Environment variables

| Variable | Secret? | Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | no | `https://ttjzmmqalbfeybysmqko.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no (publishable) | `sb_publishable_LztXbrEa4Evw12Iehs4H5A_ivQU-ZOz` |
| `ANTHROPIC_API_KEY` | **yes** | your Anthropic key — enables the responder + the AI report |
| `SUPABASE_SERVICE_ROLE_KEY` | **yes** | from Supabase → Project Settings → API → service_role. Needed for live platform webhook ingestion, and for the sign-in self-heal below |
| `META_VERIFY_TOKEN` | yes | any string; must match your Meta webhook config |

The two `NEXT_PUBLIC_*` values are safe to expose — the publishable key is
protected by Row-Level Security. Email + password login works with just those
two; the AI responder lights up once `ANTHROPIC_API_KEY` is set.

## Fix signup: confirmation emails going to localhost / rate-limited

Every fresh Supabase project defaults its Auth **Site URL** to
`http://localhost:3000`. Until you change it, confirmation-email links point
at localhost (broken for anyone but local dev), and repeated failed attempts
can trip Supabase's shared-mailer rate limit. This is a one-time Supabase
dashboard fix — there's no API for it, so it can't be automated:

**Authentication → URL Configuration:**
- **Site URL** → `https://<your-app>.vercel.app`
- **Redirect URLs** → add `https://<your-app>.vercel.app/auth/callback` and
  `https://<your-app>.vercel.app/**`

Once set, confirmation links resolve correctly and email verification keeps
working as intended — signups do still require confirming their email
before they can sign in, which is the correct behavior for a real,
multi-tenant product.

With `SUPABASE_SERVICE_ROLE_KEY` set, sign-in also **self-heals** any single
account that got stuck unconfirmed before this was fixed (e.g. from testing
before the Site URL was set): `/api/auth/force-confirm` only ever confirms an
account after verifying the caller supplied the *correct password* for it
(a real sign-in attempt against the account, not a bare email lookup) — so it
can't be used to confirm an account you don't control.

## Google sign-in (one-time, optional)

The "Continue with Google" button is hidden by default so users never hit a
"provider is not enabled" error. To turn it on:

1. Google Cloud Console → create an **OAuth 2.0 Client ID** (Web application).
2. Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Supabase dashboard → **Authentication → Providers → Google** → paste the
   Client ID + Secret, enable it.
4. Supabase → **Authentication → URL Configuration** → add your site URL and
   `https://<your-app>.vercel.app/auth/callback` to the redirect allow-list.
5. Set `NEXT_PUBLIC_GOOGLE_ENABLED=true` in Vercel and redeploy — the button
   appears on `/login` (it routes through `/auth/callback`, which already
   exchanges the code for a session).

## Email channel (real inbound + outbound)

- **Outbound replies:** set `RESEND_API_KEY` (resend.com) and `EMAIL_FROM`
  (a verified sender on your domain). The email adapter sends via Resend; with
  no key it dry-runs (logs) so the demo still works.
- **Inbound email:** point your provider's inbound-parse webhook at
  `https://<your-app>/api/webhooks/email`. The adapter accepts Postmark,
  SendGrid and Mailgun payload shapes and threads by sender address.

## WhatsApp & Instagram (real sending, not just receiving)

Both webhooks already parse inbound messages — this turns on actually
*sending* the AI's replies back, via Meta's Graph API.

1. Meta for Developers → your app → generate a **System User access token**
   with `whatsapp_business_messaging` and `instagram_manage_messages`
   permissions.
2. Set `META_ACCESS_TOKEN` in Vercel. Without it, sends are logged (dry-run)
   instead of delivered — the responder pipeline still runs end to end.
3. Point the WhatsApp webhook at `https://<your-app>/api/webhooks/whatsapp`
   and the Instagram webhook at `https://<your-app>/api/webhooks/instagram`
   (verify token = `META_VERIFY_TOKEN`).
4. Register each connected number/account as a `connected_accounts` row
   (platform `whatsapp` / `instagram`, `external_id` = the WABA
   phone_number_id / IG-connected Page id) for the workspace it belongs to.

WhatsApp only allows free-form replies within the 24h window after the
customer's last message (Meta policy) — fine for the normal reactive flow,
but template messages for outside that window aren't implemented.

## Publishing to X (the agent can post, not just reply)

Beyond answering inbound messages, the agent can actively publish content —
either exactly what you give it, or a post it drafts itself from a topic
(e.g. something the trend radar surfaced), in the workspace's brand voice.

1. X Developer Portal → your App → **Keys and tokens** → generate an
   **Access Token & Secret with Read and Write** permission (this signs
   requests as your account via OAuth 1.0a).
2. Set `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` in Vercel.
3. Sign in, then:
   ```bash
   curl -X POST https://<your-app>/api/social/post \
     -H "Content-Type: application/json" \
     --cookie "<your session cookie>" \
     -d '{"platform":"x","topic":"Ramadan delivery hours this week"}'
   ```
   Pass `"text"` instead of `"topic"` to publish exact text; add
   `"replyToId":"<tweet id>"` to reply to a specific post/comment instead of
   posting standalone. Without the X keys set, this returns the drafted text
   without publishing (`dryRun: true`) so it's safe to try before going live.

Note: this uses one set of X credentials for the whole deployment (post *as*
one account), not a per-customer "connect your own X account" OAuth flow —
suited to a single brand or an agency's own accounts today.

## Voice calls (Twilio)

The AI can answer phone calls: it listens (Twilio's built-in speech
recognition), thinks (the same responder engine as the other channels, with a
short-spoken-reply style), and talks back (Twilio text-to-speech, Arabic +
English). No custom telephony/WebSocket infrastructure needed — every turn is
a normal, stateless webhook request, which fits serverless cleanly.

1. Buy a Twilio number (or use an existing one) and note it in **E.164**
   format, e.g. `+9665XXXXXXXX`.
2. Sign in to your GrowthSpace workspace and call:
   ```bash
   curl -X POST https://<your-app>/api/voice/register \
     -H "Content-Type: application/json" \
     --cookie "<your session cookie>" \
     -d '{"phone":"+9665XXXXXXXX","displayName":"Main line"}'
   ```
   (Or run the equivalent request from the browser console while signed in —
   `fetch` automatically sends your session cookie.) This links the number to
   your workspace so incoming calls resolve to your brand voice + settings.
3. In the Twilio console, set the number's:
   - **Voice webhook (A CALL COMES IN):** `POST https://<your-app>/api/voice`
   - **Status Callback URL** (optional but recommended): `POST https://<your-app>/api/voice/status`
4. Set `TWILIO_AUTH_TOKEN` (Twilio console → Account → Auth Token) in Vercel
   so incoming webhook requests are verified as genuinely from Twilio.
5. Call the number. The AI greets in Arabic + English, listens, replies out
   loud, and keeps the conversation going until you hang up or it needs to
   hand off to a human (politely ends the call and logs an escalation with
   the transcript for your team to follow up).

Every call is stored exactly like the other channels — a `conversations` row
(platform `call`) with `messages` for each turn — so the existing responder
guardrails, brand-voice settings, and escalation logic all apply unchanged.

### Better transcription with Whisper (optional)

Twilio's built-in speech recognition works out of the box, but its Saudi
dialect accuracy is inconsistent. Switch to **OpenAI Whisper** for meaningfully
better transcription of Khaleeji/Najdi dialect and Arabic/English
code-switching:

1. Set `TWILIO_ACCOUNT_SID` (Twilio console → Account → Account SID) and
   `TWILIO_AUTH_TOKEN` (already set above) — needed to download the call
   recording.
2. Set `OPENAI_API_KEY` (platform.openai.com → API keys).
3. Redeploy. With all three set, calls automatically switch from
   `<Gather input="speech">` to recording each turn (`<Record>`) and
   transcribing it via Whisper before the AI responds — no other change to
   the call flow. Check `/api/health` → `whisper_transcription: true` to
   confirm it's active.

## After deploy

- `/login` — sign up or sign in with email + password.
- `/careers` — public apply form.
- Real inbound traffic reaches the responder via `/api/webhooks/[platform]`
  (e.g. `/api/webhooks/whatsapp`, `/api/webhooks/instagram`, `/api/webhooks/email`)
  once the corresponding provider webhook is configured, and via `/api/voice`
  for phone calls.
- `POST /api/social/post` lets the signed-in workspace publish to X.
- `GET /api/health` reports which integrations are actually configured.
