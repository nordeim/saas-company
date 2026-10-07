import { expect, test } from "@playwright/test";

/**
 * Session 11 F2 — the hydration-health suite. The 404 route is a statically
 * prerendered CLIENT component: its pathname-quoting span rendered EMPTY on
 * the server and refilled at hydration, tripping React #418 (a text
 * mismatch) — the page then re-rendered client-side from scratch with a
 * console pageerror on EVERY unknown route. The live's 404 is a clean
 * client-rendered SPA surface (zero console/page errors). These pins hold
 * the clone to the same contract: any route that renders must hydrate
 * without errors, and the 404's pathname must still appear (the Session-3
 * visual pin lives in brand-parity.spec.ts).
 */
test.describe("hydration health (Session-11 F2)", () => {
  test("the 404 page hydrates with ZERO page errors (no React #418)", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));
    await page.goto("/definitely-not-a-session11-route");
    await page.waitForTimeout(1500); // hydration + the post-mount commit
    expect(pageErrors, `pageerrors: ${pageErrors.join(" | ")}`).toEqual([]);
    // and the pathname still quotes post-mount (the remediated contract)
    await expect(page.locator("p.text-slate-600 span.font-medium.text-slate-700")).toHaveText(
      '"definitely-not-a-session11-route"',
    );
  });

  test("the 404's server HTML ships the empty-quote placeholder (the static prerender contract)", async ({ request }) => {
    const res = await request.get("/another-missing-route");
    expect(res.status()).toBe(404);
    const html = await res.text();
    // The server/prerendered HTML must agree with the hydration render:
    // the pathname span renders empty quotes (the mount-gated state), so
    // React hydrates the SAME tree it served.
    expect(html).toContain("The page");
    expect(html).not.toContain('another-missing-route"'); // the pathname never leaks into the static HTML
  });

  test("every core route hydrates with zero page errors", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));
    for (const route of ["/", "/login", "/faq", "/privacy", "/terms", "/accessibility", "/refund-policy"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);
    }
    expect(pageErrors, `pageerrors: ${pageErrors.join(" | ")}`).toEqual([]);
  });
});
