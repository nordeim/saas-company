import { expect, test } from "@playwright/test";

/**
 * Session 37 — the background-image gradient parity pins (the style
 * inventory's gradient layer, first-run findings D138–D140).
 *
 * The gradient layer compares every rendered element's computed
 * background-image through the gradient contract (function family,
 * direction grammar, stops as color tuples + positions). Its FIRST RUN
 * caught three families on the landing + login:
 *
 *   D138 — Tailwind v4's default gradient interpolation directive: the
 *          engine emits `--tw-gradient-position: to bottom right in oklab`
 *          where the live's v3 bundle ships NO directive — and the
 *          directive is a REAL rendering difference (oklab interpolates
 *          a different mid-ramp than the v3 default sRGB), fixed by
 *          overriding the five USED bg-gradient-to-* utilities
 *          (t / r / b / l / br — the app's actual usage) to the
 *          directive-free position value.
 *   D139 — v4's explicit stop positions (`--tw-gradient-from-position:
 *          0%` etc.): the from/to positions ride the SAME override
 *          (the stops string without the position vars); the VIA-stops
 *          positions are VALUE-identical to the auto-spaced defaults
 *          (0% / 50% / 100% for a 3-stop) — the battery's position
 *          equivalence class, never invented positions.
 *   D140 — the `lab()` stop spelling on the two remaining unpinned
 *          "exact match" tokens used as gradient stops: slate-100 (the
 *          login main gradient's to-stop) and gray-50 (the features
 *          section's via stop) — pinned per the slate-200 byte-stability
 *          precedent.
 *
 * The color-mix ALPHA stops (from-black/80, from-primary/20,
 * from-white/[0.08] …) serialize as oklab(...) on the clone where the
 * live ships rgba(...) — probed IN VIVO: VALUE-IDENTICAL (maxDelta
 * ≤ 0.044 through the oklab→sRGB conversion), the gotcha-4 law at the
 * gradient-stop layer; the battery normalizes them and the pins assert
 * the directive-free form.
 */
test.describe("the gradient byte-parity pins (Session 37 D138–D140)", () => {
  test("the mockup chart bars render the live's directive-free 2-stop gradient (from-primary to-accent)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y <= H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    const bar = page.locator(".flex-1.rounded-t.bg-gradient-to-t").first();
    await expect(bar).toBeVisible();
    await expect(bar).toHaveCSS(
      "background-image",
      "linear-gradient(to top, rgb(134, 36, 255), rgb(0, 85, 255))",
    );
  });

  test("the testimonial avatar tiles render the live's byte-exact to-bottom-right gradient", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y <= H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    // .from-violet (the exact token) excludes the problem orb's
    // from-violet/40 — the testimonial avatars ride the PINNED tokens.
    const avatar = page.locator(".w-10.h-10.rounded-full.bg-gradient-to-br.from-violet").first();
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveCSS(
      "background-image",
      "linear-gradient(to right bottom, rgb(213, 0, 255), rgb(147, 51, 234))",
    );
    // the color-mix siblings (from-violet/40 …) stay directive-free too —
    // the value-normalized family (oklab stops, maxDelta ≤ 0.044 probed).
    const orb = page.locator(".w-10.h-10.rounded-full.bg-gradient-to-br.border").first();
    const orbBg = await orb.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(orbBg).not.toContain("in oklab");
  });

  test("the hero's bottom fade renders the live's default-direction gradient (byte-exact)", async ({ page }) => {
    await page.goto("/");
    const fade = page.locator(".absolute.bottom-0.inset-x-0.h-32.bg-gradient-to-b").first();
    await expect(fade).toBeVisible();
    await expect(fade).toHaveCSS(
      "background-image",
      "linear-gradient(rgba(0, 0, 0, 0), rgb(0, 0, 0))",
    );
  });

  test("the features section's via-gradient carries pinned-token rgb stops and no directive (D140 gray-50)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y <= H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    const section = page.locator("section.bg-gradient-to-b").first();
    await expect(section).toBeVisible();
    const bg = await section.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).not.toContain("in oklab");
    expect(bg).not.toContain("lab(");
    expect(bg).toContain("rgb(249, 250, 251)"); // gray-50 pinned — never a lab() spelling
  });

  test("the hero's readability via-gradient (color-mix stops) is directive-free (D138)", async ({ page }) => {
    await page.goto("/");
    const veil = page.locator(".absolute.inset-0.bg-gradient-to-r.from-black\\/80").first();
    await expect(veil).toBeVisible();
    const bg = await veil.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).not.toContain("in oklab");
    expect(bg.startsWith("linear-gradient(to right,")).toBe(true);
  });

  test("the login main gradient renders the live's byte-exact slate wash (D140 slate-100)", async ({ page }) => {
    await page.goto("/login");
    const main = page.locator("main.bg-gradient-to-br");
    await expect(main).toBeVisible();
    await expect(main).toHaveCSS(
      "background-image",
      "linear-gradient(to right bottom, rgb(248, 250, 252), rgb(241, 245, 249))",
    );
  });

  test("the login logo chip's gradient renders the live's byte-exact slate stops", async ({ page }) => {
    await page.goto("/login");
    const chip = page.locator("span.bg-gradient-to-br.from-slate-100").first();
    await expect(chip).toBeVisible();
    await expect(chip).toHaveCSS(
      "background-image",
      "linear-gradient(to right bottom, rgb(241, 245, 249), rgb(226, 232, 240))",
    );
  });
});
