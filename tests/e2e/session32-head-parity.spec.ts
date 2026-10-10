import { expect, test } from "@playwright/test";

/**
 * Session 32 R3 (D122) — the 404's duplicate-tag normalization.
 *
 * The S31 one-shot effect set the 404's canonical + og:url through
 * FIRST-MATCH selectors (`document.querySelector`) — and the drift
 * battery's seventh-column follow-up found the rendered 404 carrying
 * TWO of each: the static prerender ships one canonical + one og:url
 * (resolved against the internal `/_not-found` route id), and Next 16's
 * client-side metadata resolution APPENDS its own copies during
 * hydration. The effect mutated the first of each and never saw the
 * second — leaving a canonical link referencing `/_not-found` (a URL
 * that does not exist) beside the corrected one. The live ships EXACTLY
 * ONE canonical, ONE og:url, and ONE twitter:url on its unknown routes,
 * all pointing at the requested URL (the SPA head-manager's
 * per-location pattern).
 *
 * The fix normalizes ALL instances per tag: the FIRST element mutates to
 * the requested URL, the REST are REMOVED — the rendered end-state is
 * exactly one of each (the live's shape). These pins read the COUNTS,
 * not just the first match — the duplicate class can never hide behind
 * a first-match read again.
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts AFTER session31-head-parity.spec.ts and BEFORE
 * session32-membership.spec.ts. No auth flows — the unknown routes are
 * public.
 */

test.describe("the 404's head-tag trio, exactly once each (Session 32 R3 — the seventh column's follow-up)", () => {
  test("an unknown route ships EXACTLY ONE canonical, og:url, and twitter:url — all the requested URL", async ({ page }) => {
    await page.goto("/does-not-exist-s32");
    // The mount effect's one post-hydration commit.
    await page.waitForTimeout(500);

    const tags = await page.evaluate(() => ({
      canonicalCount: document.querySelectorAll('link[rel="canonical"]').length,
      canonicals: [...document.querySelectorAll('link[rel="canonical"]')].map((l) => l.getAttribute("href")),
      ogUrlCount: document.querySelectorAll('meta[property="og:url"]').length,
      ogUrls: [...document.querySelectorAll('meta[property="og:url"]')].map((m) => m.getAttribute("content")),
      twUrlCount: document.querySelectorAll('meta[name="twitter:url"]').length,
      twUrls: [...document.querySelectorAll('meta[name="twitter:url"]')].map((m) => m.getAttribute("content")),
      expected: window.location.origin + window.location.pathname + window.location.search,
    }));

    // Pre-fix (RED): canonicalCount 2 + ogUrlCount 2 (the
    // hydration-inserted /_not-found copies survive the first-match
    // effect) and twUrlCount 0 (the tag did not exist).
    expect(tags.canonicalCount).toBe(1);
    expect(tags.ogUrlCount).toBe(1);
    expect(tags.twUrlCount).toBe(1);

    // The one of each points at the ACTUAL requested URL (the live's
    // SPA head-manager pattern — never the internal /_not-found id).
    expect(tags.canonicals[0]).toBe(tags.expected);
    expect(tags.ogUrls[0]).toBe(tags.expected);
    expect(tags.twUrls[0]).toBe(tags.expected);
    expect(tags.canonicals[0]).toContain("/does-not-exist-s32");
  });

  test("the normalized trio stays stable on the terminal view (no re-insertion after the settle)", async ({ page }) => {
    await page.goto("/another-missing-s32");
    await page.waitForTimeout(600);

    const read = () =>
      page.evaluate(() => ({
        canonicalCount: document.querySelectorAll('link[rel="canonical"]').length,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        ogUrlCount: document.querySelectorAll('meta[property="og:url"]').length,
        ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? null,
        twUrlCount: document.querySelectorAll('meta[name="twitter:url"]').length,
        twUrl: document.querySelector('meta[name="twitter:url"]')?.getAttribute("content") ?? null,
      }));

    const first = await read();
    await page.waitForTimeout(600);
    const second = await read();

    expect(first.canonical).toContain("/another-missing-s32");
    expect(first.ogUrl).toBe(first.canonical);
    expect(first.twUrl).toBe(first.canonical);
    // The counts hold after the settle — nothing re-inserts the removed
    // hydration copies on the terminal view.
    expect(second.canonicalCount).toBe(1);
    expect(second.ogUrlCount).toBe(1);
    expect(second.twUrlCount).toBe(1);
    expect(second.canonical).toBe(first.canonical);
    expect(second.ogUrl).toBe(first.ogUrl);
    expect(second.twUrl).toBe(first.twUrl);
  });
});
