import { expect, test } from "@playwright/test";

/**
 * Session 37 — the transition-timing parity pins (the battery's TWELFTH
 * surface, first-run finding D137).
 *
 * The surface measures the computed transition record per interactive
 * element (property list STRIPPED of v4's inert --tw-* custom-property
 * family, durations as ms floats, easing canonicalized). Its FIRST RUN
 * caught the live's LOGIN bundle emitting `.transition-colors` with the
 * legacy `-webkit-text-decoration-color` alias — SEVEN properties —
 * while the live's SPA bundle (every other route) and the clone's
 * Session-8 F3 override ship SIX:
 *
 *   live /login:  color, background-color, border-color,
 *                 text-decoration-color, fill, stroke,
 *                 -webkit-text-decoration-color
 *   clone /login: color, background-color, border-color,
 *                 text-decoration-color, fill, stroke
 *
 * The alias resolves to the same Blink property as the standard
 * `text-decoration-color` in current Chromium — visually inert — so this
 * is the byte-stability family (the slate-200 precedent): pinned for
 * computed parity, scoped to the login route ONLY (the live's own
 * scoping — its login css bundle differs from its SPA bundle).
 */
test.describe("the transition-colors property list (Session 37 D137)", () => {
  test("the login 'Forgot password?' button carries the live's 7-property list incl. the -webkit- alias", async ({ page }) => {
    await page.goto("/login");
    const btn = page.getByRole("button", { name: "Forgot password?" });
    await expect(btn).toBeVisible();
    await expect(btn).toHaveCSS(
      "transition-property",
      "color, background-color, border-color, text-decoration-color, fill, stroke, -webkit-text-decoration-color",
    );
  });

  test("the login 'Need an account? Sign up' button carries the same 7-property list", async ({ page }) => {
    await page.goto("/login");
    const btn = page.getByRole("button", { name: "Need an account? Sign up" });
    await expect(btn).toBeVisible();
    await expect(btn).toHaveCSS(
      "transition-property",
      "color, background-color, border-color, text-decoration-color, fill, stroke, -webkit-text-decoration-color",
    );
  });

  test("the ROUTE SCOPING holds: the landing's transition-colors elements keep the 6-property list (no -webkit- alias)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y <= H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    const nav = page.getByRole("link", { name: "Pricing" }).first();
    await expect(nav).toBeVisible();
    await expect(nav).toHaveCSS(
      "transition-property",
      "color, background-color, border-color, text-decoration-color, fill, stroke",
    );
  });
});
