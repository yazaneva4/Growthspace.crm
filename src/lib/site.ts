/**
 * Canonical public URL of the deployment. Uses the production vercel.app
 * alias by default; set NEXT_PUBLIC_SITE_URL when a custom domain is added
 * and every absolute URL (OG tags, sitemap, robots) follows automatically.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://growthspacecrm.vercel.app";

export const SITE_NAME = "GrowthSpace";
export const SITE_DESCRIPTION =
  "The AI that answers your customers in their own dialect — autonomous Arabic + English replies across WhatsApp, Instagram, X, email and phone calls, with always-on growth analytics. Built for Saudi Arabia.";
