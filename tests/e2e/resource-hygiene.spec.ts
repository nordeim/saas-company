import { expect, test } from "@playwright/test";

/**
 * Session 12 F2 — the resource-hygiene suite. React 19's Float emits an
 * automatic `<link rel="preload" as="image">` for the eager Gasparyan
 * `<img>` rendered in the landing's SSR shell — and the Next.js router's
 * RSC prefetch carries that head link into EVERY navbar-bearing route
 * (the logo `<Link href="/">`), where the image never renders: a console
 * warning ("preloaded but not used") + a wasted fetch on /faq, /privacy,
 * /terms, /accessibility, /refund-policy, and /dashboard. The live's SPA
 * ships no preload and no such warning (its gasparyan img is eager, no
 * preload link, no route-prefetch injection).
 *
 * The fix (Session-12 R2): `loading="lazy"` on the logo-cloud img — proven
 * by a controlled rebuild experiment to suppress the Float preload
 * emission entirely. The logo cloud is below the fold; a 4KB local SVG
 * appears instantly on scroll-near; the visible layer is unchanged.
 */
test.describe("resource hygiene (Session-12 F2)", () => {
  test("the RSC prefetch injects NO gasparyan preload into /faq (and no console warning)", async ({ page }) => {
    const warns: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "warning" && /preload/i.test(m.text())) warns.push(m.text().slice(0, 120));
    });
    await page.goto("/faq", { waitUntil: "domcontentloaded" });
    // The router's prefetch of / (logo Link in the navbar) lands within a
    // couple of seconds; Chrome's unused-preload warning fires a few
    // seconds after load — dwell long enough to catch both if present.
    await page.waitForTimeout(5000);
    const injected = await page.evaluate(
      () => document.querySelectorAll('link[href*="gasparyan"]').length,
    );
    expect(injected, "gasparyan <link> elements in /faq head").toBe(0);
    expect(warns, `preload warnings: ${warns.join(" | ")}`).toEqual([]);
  });

  test("the logo-cloud img still loads when scrolled into view (lazy, visible parity)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500); // hydration
    await page.evaluate(() => {
      const img = document.querySelector('img[src*="gasparyan"]');
      img?.scrollIntoView({ block: "center" });
    });
    // A lazy 4KB local SVG loads near-instantly once in view.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const img = document.querySelector('img[src*="gasparyan"]') as HTMLImageElement | null;
          return img ? img.complete && img.naturalWidth > 0 : false;
        }),
      )
      .toBe(true);
  });
});
