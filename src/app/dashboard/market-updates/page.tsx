const checks = [
  {
    label: "GrowthSpace and Saudi competitors",
    detail: "Newly verified: SIDF Academy offered a 14 October executive webinar on AI’s effects on work, decision-making, productivity, and value creation; no official company contact-detail change was found.",
    href: "https://academy.sidf.gov.sa/Webinars/Webinar-Course?CourseId=154",
  },
  {
    label: "Vision 2030 / Human Capability Development",
    detail: "Newly verified: SASO’s 14 October AI standards forum agenda includes an SDAIA case study, a live autonomous-vehicle demonstration, and private-sector AI presentations.",
    href: "https://www.saso.gov.sa/en/mediacenter/events/pages/saso-events-403.aspx",
  },
  {
    label: "Supabase",
    detail: "Newly verified: Declarative Schemas 2.0 uses pg-delta so generated migrations now capture RLS policies, grants, view settings, partitions, domains, and extension-managed objects.",
    href: "https://supabase.com/blog/declarative-schemas-2-0-pg-delta",
  },
  {
    label: "Vercel, GitHub, and Resend",
    detail: "The new GitHub Copilot for JetBrains controls and Vercel storage terms are listed above. No newer material Resend update was verified in this check.",
    href: "https://github.blog/changelog/2026-10-10-new-controls-and-chat-improvements-in-copilot-for-jetbrains/",
  },
];

export default function MarketUpdatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm font-medium text-emerald-700">Verified public sources</p>
        <h1 className="mt-1 text-3xl font-bold">Market updates</h1>
        <p className="mt-2 text-sm text-slate-500">
          Saudi workforce intelligence verified 25 October 2026; older technology updates are retained below for reference.
        </p>
      </header>

      <section aria-labelledby="growthspace-intelligence" className="space-y-4">
        <div>
          <h2 id="growthspace-intelligence" className="text-xl font-semibold">GrowthSpace · Saudi market intelligence</h2>
          <p className="mt-1 text-sm text-slate-500">Verified 25 October 2026 · Source publication dates shown below · <a className="text-emerald-700 underline" href="https://github.com/yazaneva4/Growthspace.crm/blob/claude/growth-inspector-saudi-int7vg/intelligence/reports/2026-10-25.md">Full dated report</a></p>
        </div>
        {[
          { date: "2026-10-19", title: "HRSD reports progress in the Skills Accelerator", change: "HRSD reports 590+ training programs across 10+ priority sectors and 44,000+ trainees enrolled in AI skills training. Its target is to develop skills for more than 300,000 beneficiaries; the next phase includes sector skills surveys and stronger outcome measurement.", impact: "Develop practical AI leadership and role-specific learning with measurable workplace outcomes. Treat 300,000 as a target, not a completed count.", source: "Saudi Press Agency", href: "https://www.spa.gov.sa/en/N2705101" },
          { date: "2026-10-19", title: "Saudi EXIM launches an export business accelerator for 50 enterprises", change: "A program running 18 October–17 December combines specialized consultations, training, and networking to help enterprises prepare for international markets and understand export financing and insurance.", impact: "Explore export-readiness and commercial-leadership workshops for SMEs; this announcement does not mean procurement is open.", source: "Saudi Press Agency", href: "https://www.spa.gov.sa/en/N2705064" },
          { date: "2026-10-19", title: "Future Investment Initiative postponed until 2027", change: "Organizers postponed FII, scheduled for 26–29 October 2026, until 2027. A replacement date was not announced in the cited report; this supersedes earlier hybrid-format plans.", impact: "Reconfirm conference-linked executive meetings and training commitments, and retain hybrid delivery options. This is a scheduling change, not evidence of reduced training demand.", source: "Reuters", href: "https://www.reuters.com/world/middle-east/saudi-fii-postpones-flagship-conference-until-2027-2026-10-19/" },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl border border-emerald-200 bg-white p-5">
            <time dateTime={item.date} className="text-xs text-slate-500">{item.date} · {item.source}</time>
            <h3 className="mt-2 font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-700">{item.change}</p>
            <p className="mt-2 text-sm text-emerald-800"><strong>GrowthSpace implication:</strong> {item.impact}</p>
            <a className="mt-2 inline-block text-sm text-emerald-700 underline" href={item.href} target="_blank" rel="noreferrer">Read dated source</a>
          </article>
        ))}
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950">
          <strong>Top 3 actions:</strong> (1) Test measurable applied-AI leadership training; (2) validate SME export-readiness learning demand; (3) reschedule FII-linked plans and retain hybrid delivery.
        </div>
      </section>

      <section aria-labelledby="confirmed-heading" className="space-y-4">
        <h2 id="confirmed-heading" className="text-xl font-semibold">Confirmed update</h2>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub Actions · Supply-chain security</span>
            <time dateTime="2026-10-14" className="text-xs text-slate-500">14 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Workflow lockfiles can pin Actions and transitive dependencies</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub Actions workflow lockfiles are in public preview. They let repositories keep readable tag or branch references while executions use reviewed commit SHAs for actions, reusable workflows, and transitive dependencies. GrowthSpace can evaluate the gh actions-lock extension on its review branch; dependencies still need security review before locking.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-14-github-actions-workflow-lockfiles-in-public-preview/" target="_blank" rel="noreferrer">
            Read GitHub’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Managed WAF</span>
            <time dateTime="2026-10-14" className="text-xs text-slate-500">14 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Emergency rule blocks an actively exploited RCE pattern</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare added a blocking rule to its Managed Ruleset for active exploitation of a critical remote-code-execution pattern involving invalid path sequences. GrowthSpace should confirm the managed rule is enabled and review WAF events for unexpected blocking.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-14-emergency-waf-release/" target="_blank" rel="noreferrer">
            Read Cloudflare’s emergency notice
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · .NET observability</span>
            <time dateTime="2026-10-14" className="text-xs text-slate-500">14 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Supabase .NET SDK adds native traces and metrics</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The official Supabase .NET SDK now emits System.Diagnostics traces and metrics for Auth, Postgrest, Storage, and Functions, with Realtime not yet covered. It strips query strings from recorded URLs and does not tag tokens, credentials, or payloads. This is useful only if GrowthSpace has .NET clients; the current web application needs no change.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog/dotnet-opentelemetry-support" target="_blank" rel="noreferrer">
            Read Supabase’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Saudi Arabia · Executive AI learning</span>
            <time dateTime="2026-10-14" className="text-xs text-slate-500">14 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">SIDF Academy links AI adoption to decisions and value creation</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            SIDF Academy listed a virtual seminar titled “From Generation to Decision: How Artificial Intelligence Is Reshaping How We Work and Make Decisions.” Its outcomes focus on AI’s role in future work, decision-making, productivity, work quality, and the shift from productivity to value creation. This is a relevant Saudi benchmark for GrowthSpace executive-learning and business-AI positioning.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://academy.sidf.gov.sa/Webinars/Webinar-Course?CourseId=154" target="_blank" rel="noreferrer">
            View SIDF Academy’s course page
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Saudi Arabia · AI standards</span>
            <time dateTime="2026-10-14" className="text-xs text-slate-500">14 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">SASO agenda connects AI standards with deployed use cases</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            SASO’s official 10th Standards Forum agenda includes an SDAIA AI case study, a live autonomous-vehicle demonstration from the Ministry of Transport and Logistics, an AI application presentation by MOZN, and a panel with government and private-sector participants. For GrowthSpace, this strengthens the case for executive content that pairs AI governance and trust with practical sector use cases.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://www.saso.gov.sa/en/mediacenter/events/pages/saso-events-403.aspx" target="_blank" rel="noreferrer">
            View SASO’s official agenda
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · Database migrations</span>
            <time dateTime="2026-10-13" className="text-xs text-slate-500">13 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Declarative Schemas 2.0 captures RLS and grant changes</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase’s CLI now uses the open-source pg-delta diff engine for Declarative Schemas 2.0. Generated migrations can include RLS-policy changes, grants, view settings, partitions, domains, and extension-managed objects that the previous migra-based workflow skipped. New CLI projects use 2.0 by default; existing projects must opt in. GrowthSpace should evaluate the opt-in on a review branch and inspect generated migrations before applying them.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/blog/declarative-schemas-2-0-pg-delta" target="_blank" rel="noreferrer">
            Read Supabase’s announcement
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · Agent workflow</span>
            <time dateTime="2026-10-13" className="text-xs text-slate-500">13 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Grok Bot can hand scoped Supabase changes to Cursor</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase joined the SpaceXAI Partner Network and documented a workflow in which a request made to Grok Bot is handed to Cursor, which can query the database, inspect schemas and logs, run code, and deploy Edge Functions through the Supabase MCP server. This is optional agent tooling, not a required GrowthSpace change; teams adopting it should keep requests scoped and run Supabase security and performance advisors after schema changes.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/blog/ship-changes-to-your-supabase-backend-with-grok-bot" target="_blank" rel="noreferrer">
            Read Supabase’s announcement
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Logpush</span>
            <time dateTime="2026-10-13" className="text-xs text-slate-500">13 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Logpush can transform logs before export</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare Logpush now supports Transformers: SQL queries that filter records, redact sensitive fields, and reshape output before it reaches a destination. GrowthSpace needs no change unless it exports Cloudflare logs; if it does, this can reduce downstream processing and prevent unnecessary fields from leaving Cloudflare.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://blog.cloudflare.com/transformers-on-logpush/" target="_blank" rel="noreferrer">
            Read Cloudflare’s announcement
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · TLS compatibility</span>
            <time dateTime="2026-10-12" className="text-xs text-slate-500">12 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Legacy TLS 1.2 cipher suites will be removed</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase will stop offering four outdated CBC-mode TLS 1.2 cipher suites on project HTTP APIs from 10 November 2026 at the earliest. Auth, Data API, Storage, Realtime, and Edge Functions are affected; TLS 1.3 and database connections are unchanged. Modern GrowthSpace clients should be unaffected, but any legacy or embedded client should be checked before the deadline.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog/cbc-tls-ciphers-deprecated" target="_blank" rel="noreferrer">
            Read Supabase’s notice
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Managed WAF</span>
            <time dateTime="2026-10-12" className="text-xs text-slate-500">12 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Managed rules add TanStack XSS and Atlassian file-access detections</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare added blocking detections for CVE-2026-102989, a reflected XSS issue affecting TanStack, and CVE-2026-21589, an arbitrary file-access issue affecting Atlassian products. GrowthSpace needs no application change if it does not use the affected products; Cloudflare Managed Rules users should confirm the new rules are present and monitor for false positives.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-12-waf-release/" target="_blank" rel="noreferrer">
            Read Cloudflare’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · API Shield</span>
            <time dateTime="2026-10-12" className="text-xs text-slate-500">12 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">API Shield schema learning can now run on demand</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare now lets API Shield users manually start a zone-wide schema-learning run after sending representative test traffic, instead of waiting for the weekly schedule. The dashboard shows zone and operation-level learning status and results. GrowthSpace needs no change unless it uses API Shield schema validation; if it does, this can shorten testing and rollout checks.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-12-manual-schema-learning/" target="_blank" rel="noreferrer">
            Read Cloudflare’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Saudi Arabia · Workforce and AI standards</span>
            <time dateTime="2026-10-11" className="text-xs text-slate-500">11 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Saudi forums focus on knowledge localization and trusted AI</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The 12th Riyadh Economic Forum, opening 12 October, will review a study on transferring and localizing knowledge among Saudi personnel to strengthen national capabilities and organizational performance. SASO will also host its 10th Standards Forum on 14 October, focused on AI standards, application reliability, performance, privacy, and advanced use cases. These create timely themes for GrowthSpace capability-development and responsible-business-AI content.
          </p>
          <div className="mt-3 flex flex-wrap gap-4">
            <a className="text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://www.spa.gov.sa/en/N2698506" target="_blank" rel="noreferrer">Riyadh Economic Forum notice</a>
            <a className="text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://www.spa.gov.sa/en/N2698608" target="_blank" rel="noreferrer">SASO forum notice</a>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · DNSSEC</span>
            <time dateTime="2026-10-11" className="text-xs text-slate-500">11 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">DNS root key rolls over to KSK-2024</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The DNS root is scheduled to switch its signing key to KSK-2024 today. Cloudflare says websites using Cloudflare DNS, 1.1.1.1, or Gateway DNS require no action because those services already trust the new key. GrowthSpace needs no change unless it operates a separate DNSSEC-validating resolver, which should be checked for the KSK-2024 trust anchor.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://blog.cloudflare.com/root-ksk-2024-rollover/" target="_blank" rel="noreferrer">
            Read Cloudflare’s notice
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">GitHub · Copilot for JetBrains</span>
            <time dateTime="2026-10-10" className="text-xs text-slate-500">10 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">JetBrains Copilot adds MCP startup control and drops IDE 2025.1</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            GitHub added a setting that can disable automatic MCP server startup for Copilot and Claude in JetBrains IDEs, plus enterprise-managed default agent models and faster diagnostic fixes. GitHub also ended support for JetBrains IDE 2025.1, so the plugin now requires version 2025.2 or later. GrowthSpace needs no application-code change; JetBrains users should update their IDE before updating the plugin.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://github.blog/changelog/2026-10-10-new-controls-and-chat-improvements-in-copilot-for-jetbrains/" target="_blank" rel="noreferrer">
            Read GitHub’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Supabase · Agent tooling</span>
            <time dateTime="2026-10-10" className="text-xs text-slate-500">10 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Supabase MCP server moves to a hosted OAuth endpoint</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabase now hosts its MCP server at https://mcp.supabase.com/mcp. Compatible clients connect through browser-based OAuth 2, without running the server through npx or supplying a personal access token. This is optional development tooling and does not require a GrowthSpace application change.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://supabase.com/changelog/supabase-mcp-hosted" target="_blank" rel="noreferrer">
            Read Supabase’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Workers AI</span>
            <time dateTime="2026-10-09" className="text-xs text-slate-500">9 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Clef decision models gain multimodal input, lower pricing, and faster serving</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare released the open-weight Clef-omni decision model for text, images, audio, and video. It also cut hosted Clef-flash input pricing from $0.09 to $0.038 per million tokens while reducing its hosted context window from 64k to 24k, and reported faster hosted Clef inference. These are optional Workers AI capabilities; GrowthSpace needs no change unless it evaluates decision-model routing or classification.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://blog.cloudflare.com/clef-faster-cheaper-multimodal/" target="_blank" rel="noreferrer">
            Read Cloudflare’s announcement
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · Agent tooling</span>
            <time dateTime="2026-10-10" className="text-xs text-slate-500">10 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Cloudflare API MCP server now serves Cloudflare skills</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare’s API MCP server now exposes Cloudflare skills through the Skills over MCP extension. Compatible MCP clients can discover them with skills/list and read their files from skill URLs after connecting to https://mcp.cloudflare.com/mcp. This is optional agent tooling and does not require a GrowthSpace application change.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-10-cloudflare-mcp-skills/" target="_blank" rel="noreferrer">
            Read Cloudflare’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">Vercel · Storage billing</span>
            <time dateTime="2026-10-09" className="text-xs text-slate-500">9 October 2026 · newly verified in this check</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">Existing Pro teams move to paid deployment storage and 30-day retention</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vercel says Deployment Storage and Functions Storage billing will begin for all Pro teams at $0.10 per GB-month. Deployments older than 30 days will start being deleted on 23 October unless a team opts out in its retention settings. Deleted deployments cannot be used for rollback. GrowthSpace should review its Vercel retention settings and storage usage before 23 October if it runs on a Pro team.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://vercel.com/changelog/deployment-storage-pricing-expands-to-existing-teams" target="_blank" rel="noreferrer">
            Read Vercel’s changelog
          </a>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Cloudflare · HTTP analytics</span>
            <time dateTime="2026-10-09" className="text-xs text-slate-500">9 October 2026</time>
          </div>
          <h3 className="mt-3 text-lg font-semibold">HTTP/3 client cancellations are reported consistently as 499</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cloudflare now stops affected HTTP/3 requests sooner when clients cancel them and records those requests as status 499 across all plans. Analytics and logs may therefore show more 499 responses even though client failures have not increased. GrowthSpace needs no code change, but availability metrics should not count client-cancelled 499 responses as server errors.
          </p>
          <a className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4" href="https://developers.cloudflare.com/changelog/post/2026-10-09-http3-499-reporting-improvement/" target="_blank" rel="noreferrer">
            Read Cloudflare’s changelog
          </a>
        </article>
      </section>

      <section aria-labelledby="checks-heading" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <h2 id="checks-heading" className="text-lg font-semibold">Other source checks</h2>
        <ul className="mt-3 divide-y divide-slate-200">
          {checks.map((source) => (
            <li key={source.label} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div>
                <p className="text-sm font-medium">{source.label}</p>
                <p className="mt-0.5 text-sm text-slate-600">{source.detail}</p>
              </div>
              <a className="shrink-0 text-sm text-emerald-700 underline underline-offset-4" href={source.href} target="_blank" rel="noreferrer">
                Official source
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
          This is a dated snapshot of verified public information. No guesses or private data are included.
        </p>
      </section>
    </div>
  );
}
