import { expect, test } from "@playwright/test";

/**
 * Session 7 typography-parity pins (docs/remediation-plan-session7.md
 * F1–F5). The Session-7 audit surveyed the TYPOGRAPHY layer for the first
 * time — computed `letter-spacing` and first-resolved `font-family` of
 * every text element, live vs clone:
 *
 *   1. The reference's SPA css bundle DOUBLES Tailwind's two widest
 *      tracking steps — `tracking-wider` renders 0.1em and
 *      `tracking-widest` renders 0.2em on the live (measured: the 12px
 *      hero badge at 1.2px, the 14px "Trusted by" label at 2.8px, the
 *      12px section eyebrows at 2.4px). The clone ships v4 defaults
 *      (0.05em / 0.1em) — half the reference's tracking on every eyebrow.
 *      Fixed by overriding `--tracking-wider`/`--tracking-widest` in the
 *      @theme block (F1).
 *   2. The live's /login loads its OWN css bundle with the STANDARD scale
 *      (its "or" divider computes 0.6px at 12px) — the login route pins
 *      `--tracking-wider: 0.05em` back in its scoped style (F2).
 *   3. The live's three serif wordmarks carry INLINE font-family styles —
 *      Zphlix/Melpyx "Playfair Display", Thrune "DM Serif Display" (the
 *      clone rendered all three Playfair-first via `font-serif`; F3).
 *   4. The Testimonials H2 carries `tracking-tight` on the live (−0.025em
 *      → −1.2px at 48px); the clone had `tracking-normal` (F4).
 *   5. The Gasparyan logo img carries `alt="Logo"` on the live (F5).
 */

test.describe("tracking scale (Session-7 F1)", () => {
  test("hero badge renders tracking-wider at the live's 0.1em (1.2px at 12px)", async ({ page }) => {
    await page.goto("/");
    const badge = page.getByText("Now in Public Beta", { exact: false }).first();
    await expect(badge).toBeVisible();
    await expect(badge).toHaveCSS("letter-spacing", "1.2px");
  });

  test("trusted-by label renders tracking-widest at the live's 0.2em (2.8px at 14px)", async ({ page }) => {
    await page.goto("/");
    const label = page.getByText("Trusted by 5,000+ teams worldwide").first();
    await expect(label).toBeVisible();
    await expect(label).toHaveCSS("letter-spacing", "2.8px");
  });

  test("section eyebrows render tracking-widest at the live's 0.2em (2.4px at 12px)", async ({ page }) => {
    await page.goto("/");
    // The HOW IT WORKS eyebrow (text-xs → 12px × 0.2em = 2.4px).
    const eyebrow = page.locator("span", { hasText: "How It Works" }).filter({
      hasNot: page.locator("a"),
    }).first();
    await expect(eyebrow).toBeVisible();
    const ls = await eyebrow.evaluate((el) => getComputedStyle(el).letterSpacing);
    const fs = await eyebrow.evaluate((el) => getComputedStyle(el).fontSize);
    expect(fs).toBe("12px");
    expect(ls).toBe("2.4px");
  });

  test("the FAQ page eyebrow renders the same 0.2em scale (2.4px at 12px)", async ({ page }) => {
    await page.goto("/faq");
    const eyebrow = page.locator("span", { hasText: "FAQ" }).first();
    await expect(eyebrow).toBeVisible();
    expect(await eyebrow.evaluate((el) => getComputedStyle(el).letterSpacing)).toBe("2.4px");
  });
});

test.describe("login tracking pin (Session-7 F2)", () => {
  test("the login 'or' divider keeps the login bundle's STANDARD scale (0.6px at 12px)", async ({ page }) => {
    await page.goto("/login");
    const divider = page.locator("span", { hasText: "or" }).first();
    await expect(divider).toBeVisible();
    await expect(divider).toHaveCSS("letter-spacing", "0.6px");
  });
});

test.describe("logo-cloud wordmarks (Session-7 F3)", () => {
  test("Thrune renders DM Serif Display like the live's inline style", async ({ page }) => {
    await page.goto("/");
    const thrune = page.locator("span").filter({ hasText: "Thrune" }).first();
    await expect(thrune).toBeVisible();
    const ff = await thrune.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(ff.startsWith('"DM Serif Display"')).toBe(true);
  });

  test("Zphlix and Melpyx render Playfair Display like the live's inline styles", async ({ page }) => {
    await page.goto("/");
    for (const name of ["Zphlix", "Melpyx"]) {
      const el = page.locator("span").filter({ hasText: name }).first();
      await expect(el).toBeVisible();
      const ff = await el.evaluate((n) => getComputedStyle(n).fontFamily);
      expect(ff.startsWith('"Playfair Display"')).toBe(true);
    }
  });

  test("the wordmark spans carry the live's class-less inline-style pattern (no font-serif)", async ({ page }) => {
    await page.goto("/");
    for (const name of ["Zphlix", "Thrune", "Melpyx"]) {
      const el = page.locator("span").filter({ hasText: name }).first();
      const info = await el.evaluate((n) => ({
        cls: n.className,
        style: n.getAttribute("style") ?? "",
      }));
      // The live's spans have NO font class — the family comes from the
      // inline style (measured on the live's DOM).
      expect(info.cls).not.toContain("font-serif");
      expect(info.style).toContain("font-family");
    }
  });
});

test.describe("testimonials typography + ARIA (Session-7 F4/F6)", () => {
  test("the section H2 renders the live's tracking-tight (−1.2px at 48px)", async ({ page }) => {
    await page.goto("/");
    const h2 = page.getByRole("heading", { name: "Loved by Teams Everywhere" });
    await expect(h2).toBeVisible();
    await expect(h2).toHaveCSS("letter-spacing", "-1.2px");
  });

  test("star rows carry VALID accessible names (role=img, decorative stars)", async ({ page }) => {
    await page.goto("/");
    const firstRow = page.locator('div[aria-label="5 out of 5 stars"]').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow).toHaveAttribute("role", "img");
    const stars = firstRow.locator("svg");
    const starCount = await stars.count();
    expect(starCount).toBe(5);
    for (let i = 0; i < starCount; i++) {
      await expect(stars.nth(i)).toHaveAttribute("aria-hidden", "true");
    }
  });
});

test.describe("logo-cloud image alt (Session-7 F5)", () => {
  test("the Gasparyan logo carries the live's alt='Logo'", async ({ page }) => {
    await page.goto("/");
    const img = page.locator("img").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("alt", "Logo");
  });
});
