import { expect, test } from "@playwright/test";

/**
 * Navbar scroll behavior (Session 4 parity audit).
 *
 * Measured on the live across scrollY 0→6000 (incl. real wheel scrolling):
 *  1. The nav is `bg-transparent` at EVERY scroll position — it never gains
 *     a background/blur/border (the old scrolled-glass bar was an invention;
 *     it survived earlier sessions because full-page screenshots only draw
 *     the nav over the dark hero).
 *  2. Scroll-spy: the nav link of the current section gets a pill
 *     (bg-white/30 dark mode, bg-black/15 light mode) + solid text; the
 *     inactive links stay 60%.
 *  3. Adaptive light/dark: while the nav band (0–72px) overlaps the white
 *     features section, the logo fill, link text, Log In button and the
 *     center pill swap to black variants; the Get Started pill stays
 *     white/black.
 */

const SECTION_LINK_LABELS = ["Features", "How It Works", "Pricing", "Testimonials"];

/** Accept an alpha color in either spelling — v4 serializes alpha colors
 * through oklab (the D6 rule; rendering-identical to rgba). Parses the
 * alpha and the lightness channel: black ≈ L 0, white ≈ L 1. */
function expectAlphaColor(
  actual: string,
  kind: "black" | "white" | "transparent",
  alpha: number
) {
  if (kind === "transparent") {
    expect(
      actual === "rgba(0, 0, 0, 0)" || actual === "oklab(0 0 0 / 0)",
      `expected transparent, got ${actual}`
    ).toBe(true);
    return;
  }
  const rgbaM = actual.match(/^rgba\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)$/);
  if (rgbaM) {
    const [r, g, b, a] = [+rgbaM[1], +rgbaM[2], +rgbaM[3], +rgbaM[4]];
    expect(Math.abs(a - alpha)).toBeLessThan(0.02);
    const want = kind === "black" ? 0 : 255;
    for (const c of [r, g, b]) expect(Math.abs(c - want)).toBeLessThan(2);
    return;
  }
  const labM = actual.match(/^oklab\(([\d.e-]+) ([-\d.e]+) ([-\d.e]+)(?: \/ ([\d.]+))?\)$/);
  expect(labM, `unparseable color: ${actual}`).not.toBeNull();
  if (!labM) return;
  const L = +labM[1];
  const a = labM[4] !== undefined ? +labM[4] : 1;
  expect(Math.abs(a - alpha), `alpha of ${actual}`).toBeLessThan(0.02);
  const wantL = kind === "black" ? 0 : 1;
  expect(Math.abs(L - wantL), `lightness of ${actual}`).toBeLessThan(0.01);
}

test.describe("navbar scroll behavior (Session 4)", () => {
  test("the nav never gains a background at any scroll depth", async ({ page }) => {
    await page.goto("/");
    for (const y of [40, 1200, 3400, 5200, 6500]) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(350);
      const bg = await page.evaluate(
        () => getComputedStyle(document.querySelector("nav")!).backgroundColor
      );
      expect(bg, `nav bg at scrollY=${y}`).toBe("rgba(0, 0, 0, 0)");
    }
  });

  test("over the white features section the chrome swaps to light mode", async ({ page }) => {
    await page.goto("/");
    // 3400: the features section (top 3323) fills the nav band.
    await page.evaluate(() => window.scrollTo(0, 3400));
    await page.waitForTimeout(450);
    const light = await page.evaluate(() => {
      const nav = document.querySelector("nav")!;
      const logo = nav.querySelector("a svg")!;
      const links = [...nav.querySelectorAll('a[href^="#"]')];
      const active = links.find((a) => a.textContent!.trim().startsWith("Features"))!;
      const inactive = links.find((a) => a.textContent!.trim().startsWith("Pricing"))!;
      // The center pill is the only div in the nav with rounded-full.
      const pill = nav.querySelector("div.rounded-full")!;
      const login = [...nav.querySelectorAll("button")].find((b) =>
        b.textContent!.trim() === "Log In"
      )!;
      return {
        logoColor: getComputedStyle(logo).color,
        activeColor: getComputedStyle(active).color,
        activeBg: getComputedStyle(active).backgroundColor,
        inactiveColor: getComputedStyle(inactive).color,
        pillBg: getComputedStyle(pill).backgroundColor,
        loginColor: getComputedStyle(login).color,
      };
    });
    // Light mode: black logo/login, black/10 pill; the ACTIVE link is solid
    // black on a black/15 pill, the inactive ones sit at black/60.
    expect(light.logoColor).toBe("rgb(0, 0, 0)");
    expect(light.activeColor).toBe("rgb(0, 0, 0)");
    expectAlphaColor(light.activeBg, "black", 0.15);
    expectAlphaColor(light.inactiveColor, "black", 0.6);
    expectAlphaColor(light.pillBg, "black", 0.1);
    expectAlphaColor(light.loginColor, "black", 0.8);
  });

  test("scroll-spy highlights the section in view and swaps back to dark", async ({ page }) => {
    await page.goto("/");
    // Features in view (light mode): Features pill on (black/15).
    await page.evaluate(() => window.scrollTo(0, 3400));
    await page.waitForTimeout(450);
    const spy = await page.evaluate(() => {
      const links = [...document.querySelectorAll('nav a[href^="#"]')];
      const pick = (label: string) =>
        links.find((a) => a.textContent!.trim().startsWith(label))!;
      return {
        featuresBg: getComputedStyle(pick("Features")).backgroundColor,
        pricingBg: getComputedStyle(pick("Pricing")).backgroundColor,
      };
    });
    // Features is the ACTIVE section at 3400 (non-transparent pill);
    // Pricing is inactive (fully transparent).
    expect(spy.featuresBg === "rgba(0, 0, 0, 0)" || spy.featuresBg === "oklab(0 0 0 / 0)").toBe(false);
    expectAlphaColor(spy.pricingBg, "transparent", 0);

    // Pricing in view (dark mode): Pricing pill white/30, Features clear.
    await page.evaluate(() => window.scrollTo(0, 5200));
    await page.waitForTimeout(450);
    const spyDark = await page.evaluate(() => {
      const links = [...document.querySelectorAll('nav a[href^="#"]')];
      const pick = (label: string) =>
        links.find((a) => a.textContent!.trim().startsWith(label))!;
      return {
        featuresBg: getComputedStyle(pick("Features")).backgroundColor,
        pricingBg: getComputedStyle(pick("Pricing")).backgroundColor,
        pricingColor: getComputedStyle(pick("Pricing")).color,
        logoColor: getComputedStyle(document.querySelector("nav a svg")!).color,
      };
    });
    expectAlphaColor(spyDark.pricingBg, "white", 0.3);
    expect(spyDark.pricingColor).toBe("rgb(255, 255, 255)");
    expectAlphaColor(spyDark.featuresBg, "transparent", 0);
    expect(spyDark.logoColor).toBe("rgb(255, 255, 255)");
  });

  test("at the top nothing is highlighted and the chrome is dark", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(400);
    const state = await page.evaluate((labels: string[]) => {
      const links = [...document.querySelectorAll('nav a[href^="#"]')].filter(
        (a) => labels.includes(a.textContent!.trim())
      );
      const highlighted = links.filter(
        (a) =>
          getComputedStyle(a).backgroundColor !== "rgba(0, 0, 0, 0)" &&
          getComputedStyle(a).backgroundColor !== "oklab(0 0 0 / 0)"
      );
      return {
        highlighted: highlighted.length,
        logoColor: getComputedStyle(document.querySelector("nav a svg")!).color,
      };
    }, SECTION_LINK_LABELS);
    expect(state.highlighted).toBe(0);
    expect(state.logoColor).toBe("rgb(255, 255, 255)");
  });
});
