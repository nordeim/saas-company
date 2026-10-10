/**
 * SEO helpers — the reference's per-route head pattern (Session 6 F5).
 *
 * The live emits, on every content route: `og:title` = the page title,
 * `description` = `"{Page} on SAAS Company. {default description}"` (the
 * five content routes; `/` and `/login` keep the default description
 * verbatim), and `og:url` = `canonical` = the route itself. Measured from
 * the live's per-route head map (docs/remediation-plan-session6.md).
 */

import type { Metadata } from "next";
import { PLANS } from "./pricing";
import { FAQ_ITEMS } from "./faq-content";

export const SITE_NAME = "SAAS Company";

export const DEFAULT_DESCRIPTION =
  "Your intelligent AI assistant that streamlines complex workflows with an immersive, interactive experience. Automate tasks, gain deeper insights, and boost productivity with a seamless, visually stunning interface.";

/**
 * Build a content route's description the way the reference does:
 * `pageDescription("FAQ")` → "FAQ on SAAS Company. {default}".
 * `pageDescription(null)` → the default description (root + /login pattern).
 */
export function pageDescription(page: string | null): string {
  if (page === null) return DEFAULT_DESCRIPTION;
  const name = page.trim();
  if (!name) return DEFAULT_DESCRIPTION;
  return `${name} on ${SITE_NAME}. ${DEFAULT_DESCRIPTION}`;
}

/** The full og:title the live renders: "FAQ | SAAS Company" (or the site
 *  name on `/` and `/login`). */
export function pageTitle(page: string | null): string {
  if (page === null) return SITE_NAME;
  const name = page.trim();
  if (!name) return SITE_NAME;
  return `${name} | ${SITE_NAME}`;
}

/**
 * A route's metadata assembled the way the reference's head manager does:
 * per-page title/description/og:*, self-referencing canonical + og:url
 * ("./" resolves against the route's own URL), and the og/twitter image
 * pair (the live's own image URL is DEAD — the self-hosted /og-image.png
 * is the working superset).
 *
 * `page === null` (the root and /login) keeps the DEFAULT description and
 * the site-name title while still pinning canonical + og:url to the route.
 */
export function routeMetadata(page: string | null): Metadata {
  const description = pageDescription(page);
  const fullTitle = pageTitle(page);
  return {
    ...(page !== null && page.trim() !== "" ? { title: page.trim() } : {}),
    description,
    alternates: { canonical: "./" },
    openGraph: {
      title: fullTitle,
      description,
      url: "./",
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/og-image.png"],
    },
  };
}

/**
 * Session 29 R1 — the canonical public origin as a single helper (the
 * sitemap.ts/robots.ts source of truth, named): NEXT_PUBLIC_SITE_URL in
 * production, the dev origin otherwise. The JSON-LD builders below read
 * it so the structured-data URLs can never drift from the sitemap's.
 */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Session 29 R1 (D113) — the landing's JSON-LD structured-data graph: a
 * schema.org @graph of Organization + WebSite + SoftwareApplication,
 * linked through stable @id anchors (the WebSite and the application
 * both point at the Organization as publisher). The reference ships NO
 * structured data (a Base44-hosted SPA — no parity constraint, the D62
 * family): this is the SEO SUPERSET the production-ready clone adds.
 *
 * The content-as-code law governs every fact: the application
 * description IS DEFAULT_DESCRIPTION (never a re-typed copy), and the
 * offers DERIVE from `PLANS` (src/lib/pricing.ts) — each plan with a
 * non-null monthlyPrice becomes an Offer at that price (Free $0, Pro
 * $49); Enterprise's null price ("Custom") is OMITTED (an Offer without
 * a price is invalid schema, and inventing a "0" would be a lie — the
 * honest omission, like the pricing card's own "Custom" caption).
 *
 * Pure and unit-tested (seo.test.ts); rendered on the landing through
 * src/components/site/json-ld.tsx.
 */
export function landingStructuredData(): Record<string, unknown> {
  const base = siteUrl();
  const organizationId = `${base}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url: base,
        logo: `${base}/og-image.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: SITE_NAME,
        url: base,
        publisher: { "@id": organizationId },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${base}/#software`,
        name: "NovaAI",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: DEFAULT_DESCRIPTION,
        url: base,
        publisher: { "@id": organizationId },
        offers: PLANS.filter((plan) => plan.monthlyPrice !== null).map((plan) => ({
          "@type": "Offer",
          name: plan.name,
          price: String(plan.monthlyPrice),
          priceCurrency: "USD",
        })),
      },
    ],
  };
}

/**
 * Session 29 R1 (D113) — the FAQ route's JSON-LD: a schema.org FAQPage
 * whose entities derive VERBATIM from FAQ_ITEMS (src/lib/faq-content.ts
 * — the reference-captured copy; content integrity is the
 * content-as-code law). Rendered on /faq through
 * src/components/site/json-ld.tsx.
 */
export function faqStructuredData(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
