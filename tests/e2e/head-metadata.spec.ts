import { expect, test } from "@playwright/test";

/**
 * Session 6 head-metadata parity pins (docs/remediation-plan-session6.md F5).
 * The live's per-route head was mapped on 2026-10-07 (all 8 routes):
 *
 *   /                title "SAAS Company", DEFAULT description,
 *                    og:url = canonical = the site root
 *   /login           title "SAAS Company", DEFAULT description,
 *                    og:url = canonical = …/login
 *   /faq … /refund-… title "X | SAAS Company",
 *                    description = "X on SAAS Company. {default}",
 *                    og:title = the page title, og:url = canonical = the route
 *
 * Session 31 R1 (D117): the sixth column (the canonical/og battery
 * surface) measured the live's descriptions EXACTLY — the content
 * routes' description part is HARD-CAPPED at 80 chars (cut mid-word,
 * trailing period: "…with an immersi."), while / and /login keep the
 * FULL 214-char default. The exact strings are pinned below (the S6
 * prefix-only pins could never see the cap).
 *
 * plus og:image + twitter:image (the live's URLs are DEAD — the clone's
 * self-hosted /og-image.png is the working superset) and a manifest link.
 * The live ships NO theme-color meta and NO viewport-fit.
 *
 * Session 7 F8: the live's login route also links an apple-touch-icon
 * (its URL is dead — the same storage-404 class as its favicon and
 * og:image). The clone ships the WORKING self-hosted superset app-wide:
 * <link rel="apple-touch-icon" href="…/favicon.svg"> on every route.
 */

const DEFAULT_DESC_PREFIX = "Your intelligent AI assistant that streamlines complex";

/** Session 31 R1 (D117): the live's measured EXACT descriptions — the
 *  content routes' 80-char cap (mid-word, trailing period) and the
 *  landing's full 214-char default. */
const TRUNCATED_TAIL = "Your intelligent AI assistant that streamlines complex workflows with an immersi.";
const DEFAULT_DESC_FULL =
  "Your intelligent AI assistant that streamlines complex workflows with an immersive, interactive experience. Automate tasks, gain deeper insights, and boost productivity with a seamless, visually stunning interface.";

const ROUTES: Array<{
  route: string;
  title: string;
  descPrefix: string;
  descExact: string;
  ogTitle: string;
}> = [
  { route: "/", title: "SAAS Company", descPrefix: DEFAULT_DESC_PREFIX, descExact: DEFAULT_DESC_FULL, ogTitle: "SAAS Company" },
  { route: "/login", title: "SAAS Company", descPrefix: DEFAULT_DESC_PREFIX, descExact: DEFAULT_DESC_FULL, ogTitle: "SAAS Company" },
  { route: "/faq", title: "FAQ | SAAS Company", descPrefix: "FAQ on SAAS Company. Your intelligent", descExact: `FAQ on SAAS Company. ${TRUNCATED_TAIL}`, ogTitle: "FAQ | SAAS Company" },
  { route: "/privacy", title: "Privacy | SAAS Company", descPrefix: "Privacy on SAAS Company. Your intelligent", descExact: `Privacy on SAAS Company. ${TRUNCATED_TAIL}`, ogTitle: "Privacy | SAAS Company" },
  { route: "/terms", title: "Terms | SAAS Company", descPrefix: "Terms on SAAS Company. Your intelligent", descExact: `Terms on SAAS Company. ${TRUNCATED_TAIL}`, ogTitle: "Terms | SAAS Company" },
  { route: "/accessibility", title: "Accessibility | SAAS Company", descPrefix: "Accessibility on SAAS Company. Your intellig", descExact: `Accessibility on SAAS Company. ${TRUNCATED_TAIL}`, ogTitle: "Accessibility | SAAS Company" },
  { route: "/refund-policy", title: "Refund Policy | SAAS Company", descPrefix: "Refund Policy on SAAS Company. Your intellig", descExact: `Refund Policy on SAAS Company. ${TRUNCATED_TAIL}`, ogTitle: "Refund Policy | SAAS Company" },
];

for (const r of ROUTES) {
  test(`head parity on ${r.route}`, async ({ page }) => {
    await page.goto(r.route);
    await page.waitForTimeout(300);

    const head = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null,
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? null,
      ogDesc: document.querySelector('meta[property="og:description"]')?.getAttribute("content") ?? null,
      twTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute("content") ?? null,
      twDesc: document.querySelector('meta[name="twitter:description"]')?.getAttribute("content") ?? null,
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? null,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null,
      twImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ?? null,
      manifest: document.querySelector('link[rel="manifest"]')?.getAttribute("href") ?? null,
      appleTouchIcon: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") ?? null,
      themeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? null,
      viewport: document.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? null,
    }));

    expect(head.title).toBe(r.title);
    expect(head.desc?.startsWith(r.descPrefix)).toBe(true);
    // Session 31 R1 (D117): the EXACT measured string — the content
    // routes' 80-char cap, the landing's full default. The prefix pin
    // above stays (the S6 record); this pin carries the length truth.
    expect(head.desc).toBe(r.descExact);
    expect(head.ogTitle).toBe(r.ogTitle);
    expect(head.ogDesc).toBe(head.desc); // og mirrors the description
    expect(head.twTitle).toBe(r.ogTitle);
    expect(head.twDesc).toBe(head.desc);

    // og:url + canonical resolve to THIS route against metadataBase (the
    // canonical origin — NEXT_PUBLIC_SITE_URL; the prerendered pages bake
    // it at build time, so assert the PATH structure + that they agree).
    const routePath = r.route === "/" ? "/" : r.route;
    expect(head.ogUrl).toBeTruthy();
    expect(new URL(head.ogUrl!).pathname).toBe(routePath);
    expect(head.canonical).toBe(head.ogUrl);

    // The image pair: the live's own URLs 404 — the clone ships the working
    // self-hosted superset; og + twitter share the same absolute URL.
    expect(head.ogImage).toContain("/og-image.png");
    expect(head.twImage).toBe(head.ogImage);

    // The manifest link (the live's Base44 PWA — self-hosted here).
    expect(head.manifest).toContain("/manifest.json");

    // Session 7 F8: the working apple-touch-icon superset (the live's own
    // URL is dead — storage 404, the D30 working-asset pattern).
    expect(head.appleTouchIcon).toContain("/favicon.svg");

    // The live ships NEITHER of these two.
    expect(head.themeColor).toBeNull();
    expect(head.viewport).not.toContain("viewport-fit");
  });
}
