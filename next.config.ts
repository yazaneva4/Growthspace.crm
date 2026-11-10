import type { NextConfig } from "next";

// Production hardening headers applied to every route.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const retiredVercelHosts = [
  "growthspaceksa.vercel.app",
  "growthspace-ksa.vercel.app",
  "growth-inspector.vercel.app",
  "growthspace-yazaneva4-3470s-projects.vercel.app",
  "growthspace-git-claude-growth-i-27fd9c-yazaneva4-3470s-projects.vercel.app",
];

const nextConfig: NextConfig = {
  // Chromium is a native server binary; keep it out of the webpack bundle and
  // explicitly trace its compressed runtime assets into the browser function.
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    "/api/agent/browser/run": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  // Any old GrowthSpace alias lands on the one canonical public domain.
  async redirects() {
    return retiredVercelHosts.map((hostname) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: hostname }],
      destination: "https://growthspacecrm.vercel.app/:path*",
      permanent: true,
    }));
  },
  async headers() {
    return [
      { source: "/(.*)", headers: [...securityHeaders, { key: "X-Frame-Options", value: "DENY" }] },
      { source: "/growth-ai-pulse-orb.html", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] },
    ];
  },
};

export default nextConfig;
