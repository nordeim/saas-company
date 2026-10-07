import { expect, test } from "@playwright/test";

// Mobile navigation (390×844) — the highest-regression-risk chrome, measured
// against the reference: fixed 56px nav, burger swap, the black/95 blur
// dropdown with 44px rows, navigation + close-on-click, and the md pill.

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("fixed nav renders logo left, burger right; no center pill below md", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
    await expect(nav).toHaveCSS("position", "fixed");
    await expect(nav).toHaveCSS("z-index", "50");

    const logo = nav.locator("a[href='/']").first();
    await expect(logo).toBeVisible();
    const burger = nav.getByRole("button", { name: /open menu/i });
    await expect(burger).toBeVisible();
    // The desktop center pill is hidden below md (the right-actions block
    // carries `hidden` too — scope to the first match).
    const pill = nav.locator("div.hidden").first();
    await expect(pill).toBeHidden();
  });

  test("burger opens the dropdown with the reference rows", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await nav.getByRole("button", { name: /open menu/i }).tap();

    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    // The panel: near-black blur + hairline bottom border (measured).
    // Tailwind v4 serializes bg-black/95 through oklab — visually identical
    // to rgba(0,0,0,0.95) (the v4 serialization note in the PAD).
    const menuBg = await menu.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(menuBg).toMatch(/oklab\(0 0 0 \/ 0\.95\)|rgba\(0, 0, 0, 0\.95\)/);

    // The seven rows in the reference order.
    const rows = [
      ["Features", "#features"],
      ["How It Works", "#how-it-works"],
      ["Pricing", "#pricing"],
      ["Testimonials", "#testimonials"],
      ["FAQ", "/faq"],
    ] as const;
    for (const [label, href] of rows) {
      await expect(menu.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
    }
    await expect(menu.getByRole("button", { name: "Log In", exact: true })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Get Started", exact: true })).toHaveAttribute("href", "#pricing");
  });

  test("rows render at the measured 44px height", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await nav.getByRole("button", { name: /open menu/i }).tap();
    const rows = page.locator("#mobile-menu a, #mobile-menu button");
    await expect(rows.first()).toBeVisible();
    const heights = await rows.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().height)),
    );
    expect(heights).toHaveLength(7);
    for (const h of heights) expect(h).toBe(44);
  });

  test("burger icon swaps to X while open; Escape closes", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    const burger = nav.getByRole("button", { name: /open menu/i });
    await burger.tap();
    await expect(nav.getByRole("button", { name: /close menu/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mobile-menu")).toHaveCount(0);
  });

  test("tapping a link closes the menu and navigates to the anchor", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await nav.getByRole("button", { name: /open menu/i }).tap();
    await page.locator("#mobile-menu").getByRole("link", { name: "Pricing", exact: true }).tap();

    await expect(page).toHaveURL(/#pricing$/);
    await expect(page.locator("#mobile-menu")).toHaveCount(0);
  });

  test("Log In routes to /login", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await nav.getByRole("button", { name: /open menu/i }).tap();
    await page.locator("#mobile-menu").getByRole("button", { name: "Log In", exact: true }).tap();
    await expect(page).toHaveURL(/\/login$/);
  });

  // Session 7 F7 (docs/remediation-plan-session7.md): the resize-while-open
  // failure class — crossing the md boundary with the menu open used to
  // leave the page scroll-locked (body overflow:hidden persisted while the
  // panel was CSS-hidden at md). The navbar now closes the menu when the
  // (min-width: 768px) media query starts matching.
  test("resizing across md while open closes the menu and restores body scroll", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await nav.getByRole("button", { name: /open menu/i }).tap();
    await expect(page.locator("#mobile-menu")).toBeVisible();

    await page.setViewportSize({ width: 1200, height: 900 });
    await page.waitForTimeout(400);

    // The panel unmounts and the body scroll-lock lifts.
    await expect(page.locator("#mobile-menu")).toHaveCount(0);
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe("");
  });
});

test.describe("tablet navigation (768)", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("center pill nav and right actions appear; burger hides", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    for (const label of ["Features", "How It Works", "Pricing", "Testimonials", "FAQ"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole("button", { name: "Log In", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Get Started", exact: true })).toBeVisible();
    await expect(nav.getByRole("button", { name: /open menu/i })).toBeHidden();
    // The center pill carries the glass background (measured bg-white/10).
    // v4 serializes white through oklab — rendering-identical to
    // rgba(255,255,255,0.1); accept either computed spelling.
    const pill = nav.locator("div.hidden").first();
    await expect(pill).toBeVisible();
    const pillBg = await pill.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(pillBg).toMatch(/rgba\(255, 255, 255, 0\.1\)|oklab\([^)]+ \/ 0\.1\)/);
  });
});
