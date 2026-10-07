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
