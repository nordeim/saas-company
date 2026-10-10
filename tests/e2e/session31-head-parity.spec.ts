import { expect, test } from "@playwright/test";

/**
 * Session 31 R2 (D118) — the 404 route's canonical + og:url parity.
 *
 * The drift battery's sixth column (the canonical/og surface — new this
 * session) caught the clone's unknown routes shipping Next.js's DEFAULT
 * URL resolution for the not-found boundary: both `link[rel=canonical]`
 * and `meta[property=og:url]` resolved against the INTERNAL route id
 * `/_not-found` — a URL that does not exist, pointed at by a canonical
 * link (wrong by any standard: a canonical should reference a real,
 * indexable URL). The live's unknown routes ship both tags pointing at
 * the ACTUAL requested URL (the SPA head-manager's per-location pattern,
 * measured: `https://saas-company.base44.app/does-not-exist-404`).
 *
 * The fix reproduces the SPA's behavior through the not-found page's
 * client mount (a one-shot effect — `location` is immutable on a
 * terminal 404 view, so the tags fill in and STAY; navigating away via
 * Go Home routes to a real route whose own metadata renders fresh —
 * Next's client router overwrites the tags on the transition, so the
 * mutation never leaks past the 404).
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts BEFORE session31-chart-edge.spec.ts. No auth flows — the
 * unknown routes are public.
 */

test.describe("the 404's canonical + og:url (Session 31 R2 — the sixth column's second catch)", () => {
  test("an unknown route's canonical + og:url point at the REQUESTED URL (the live's SPA head-manager pattern)", async ({ page }) => {
    await page.goto("/does-not-exist-s31");
    // The mount effect's one post-hydration commit.
    await page.waitForTimeout(500);

    const tags = await page.evaluate(() => ({
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? null,
      expected: window.location.origin + window.location.pathname + window.location.search,
    }));

    // Pre-fix (RED): both read ".../_not-found" — the internal route id.
    // Post-fix (GREEN): both equal the actual requested URL.
    expect(tags.canonical).toBe(tags.expected);
    expect(tags.ogUrl).toBe(tags.expected);
    expect(tags.canonical).toContain("/does-not-exist-s31");
  });

  test("the tags stay stable on the terminal view (location is immutable on a 404 — no re-navigation rewrites them)", async ({ page }) => {
    await page.goto("/another-missing-s31");
    await page.waitForTimeout(600);

    const read = () =>
      page.evaluate(() => ({
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? null,
      }));

    const first = await read();
    await page.waitForTimeout(600);
    const second = await read();

    expect(first.canonical).toContain("/another-missing-s31");
    expect(second.canonical).toBe(first.canonical);
    expect(second.ogUrl).toBe(first.ogUrl);
  });
});
