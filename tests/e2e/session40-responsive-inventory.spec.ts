import { expect, test } from "@playwright/test";

/**
 * Session 40 — the responsive-inventory pins (the battery's FIFTEENTH
 * surface: the responsive breakpoint inventory).
 *
 * The surface (research/probe-responsive-s40.mjs +
 * probe-responsive-dwell-s40.mjs, paired clone-vs-live at 390/768/1024/
 * 1440): the same element set measured per breakpoint, DWELL-loaded —
 * gotcha 52e, this session's law: **a viewport change re-renders and
 * re-arms the below-fold whileInView entrances**, so every breakpoint
 * re-measure needs its own scroll-and-hold pass. The un-dwelled first
 * probe read the live's problem-section card at 262×311 (its UNFIRED
 * initial scale(.95)) vs the clone's true 276×327 — a 5% geometry
 * fiction that cascaded +30px into every section below. Under dwell both
 * sides settle at `transform: none` with byte-identical rects.
 *
 * The measured parity contract (the live's own resting geometry):
 *   - nav height 56px at 390, 72px at ≥768 (both sides);
 *   - the burger visible below md, hidden at ≥768; 7 desktop nav links
 *     at ≥768 vs 1 (the logo) at 390;
 *   - ZERO horizontal overflow at every width on both sides;
 *   - document heights (landing): 10092 / 7748 / 7544 / 7498 at
 *     390 / 768 / 1024 / 1440 — byte-identical across sides;
 *   - element counts clone+1 at every width: the `<main>` landmark,
 *     the registered a11y superset (the live has none).
 *
 * These pins version the CLONE side of the contract so a future
 * regression (a Tailwind v4 breakpoint bug, a stray overflow, a broken
 * menu flip) surfaces loudly at every width.
 */

const WIDTHS = [390, 768, 1024, 1440] as const;

test.describe("the responsive-inventory pins (Session 40 — the fifteenth surface)", () => {
  test("the nav-height contract: 56px at 390, 72px at every width ≥768", async ({ page }) => {
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      await page.waitForTimeout(600);
      const h = await page.evaluate(() => {
        const nav = document.querySelector("nav");
        return nav ? Math.round(nav.getBoundingClientRect().height) : -1;
      });
      expect(h, `nav height at w=${w}`).toBe(w < 768 ? 56 : 72);
    }
  });

  test("the md visibility flip: burger below 768, the 7 desktop nav links at ≥768", async ({ page }) => {
    // 390: the burger renders, the desktop links do not
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(600);
    const mobile = await page.evaluate(() => {
      const burger = [...document.querySelectorAll("button")].find((b) =>
        /(^|\s)md:hidden(\s|$)/.test(b.getAttribute("class") || ""),
      );
      const nav = document.querySelector("nav");
      const links = nav ? [...nav.querySelectorAll("a")].filter((a) => a.getBoundingClientRect().width > 0) : [];
      const bs = burger ? getComputedStyle(burger) : null;
      return {
        burgerShown: !!burger && burger.getBoundingClientRect().width > 0 && bs!.display !== "none",
        navLinks: links.length,
      };
    });
    expect(mobile.burgerShown, "the burger is rendered at 390").toBe(true);
    expect(mobile.navLinks, "only the logo link is visible at 390").toBe(1);

    // 768 / 1024 / 1440: the desktop nav, no burger
    for (const w of [768, 1024, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(400);
      const desktop = await page.evaluate(() => {
        const burger = [...document.querySelectorAll("button")].find((b) =>
          /(^|\s)md:hidden(\s|$)/.test(b.getAttribute("class") || ""),
        );
        const nav = document.querySelector("nav");
        const links = nav ? [...nav.querySelectorAll("a")].filter((a) => a.getBoundingClientRect().width > 0) : [];
        const bs = burger ? getComputedStyle(burger) : null;
        return {
          burgerHidden: !burger || burger.getBoundingClientRect().width === 0 || bs!.display === "none",
          navLinks: links.length,
        };
      });
      expect(desktop.burgerHidden, `the burger is hidden at w=${w}`).toBe(true);
      expect(desktop.navLinks, `the desktop nav links at w=${w}`).toBe(7);
    }
  });

  test("ZERO horizontal overflow at every breakpoint (the landing)", async ({ page }) => {
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      await page.waitForTimeout(700);
      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflowX, `no horizontal overflow at w=${w}`).toBe(0);
    }
  });

  test("ZERO horizontal overflow at every breakpoint (/login)", async ({ page }) => {
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/login");
      await page.waitForTimeout(600);
      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflowX, `no horizontal overflow on /login at w=${w}`).toBe(0);
      const inputs = await page.evaluate(
        () => [...document.querySelectorAll("input")].filter((i) => i.getBoundingClientRect().width > 0).length,
      );
      expect(inputs, `the login inputs stay visible at w=${w}`).toBe(2);
    }
  });

  test("the <main> landmark renders exactly once (the registered a11y superset)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(600);
    const mains = await page.evaluate(() => document.querySelectorAll("main").length);
    expect(mains, "the live has no <main>; the clone's landmark is the documented superset").toBe(1);
  });

  test("the per-breakpoint document heights (the parity anchors, tolerance ±32px)", async ({ page }) => {
    const anchors: Record<number, number> = { 390: 10092, 768: 7748, 1024: 7544, 1440: 7498 };
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      await page.waitForTimeout(700);
      const docH = await page.evaluate(() => document.documentElement.scrollHeight);
      expect(Math.abs(docH - anchors[w]), `document height at w=${w} (anchor ${anchors[w]})`).toBeLessThanOrEqual(32);
    }
  });

  test("the problem-section mockup card settles at transform:none under dwell (the gotcha-52e contract)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(800);
    // DWELL: bring the below-fold showcase into view and HOLD — the
    // entrance must FIRE and settle (a transient pass reads the
    // pre-entrance state: the live's unfired scale(.95) fiction).
    await page.evaluate(() => {
      const card = document.querySelector("a.relative.mx-auto");
      card?.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(1200); // dwell + settle (the springs ring)
    const state = await page.evaluate(() => {
      const card = document.querySelector("a.relative.mx-auto");
      if (!card) return { err: "no card" };
      const col = card.parentElement!;
      const showcase = card.closest(".p-8.md\\:p-12");
      const r = card.getBoundingClientRect();
      return {
        colTransform: getComputedStyle(col).transform,
        showcaseTransform: showcase ? getComputedStyle(showcase).transform : "no-wrapper",
        w: Math.round(r.width),
        h: Math.round(r.height),
        opacity: getComputedStyle(card).opacity,
      };
    });
    expect(state.err).toBeUndefined();
    expect((state as { colTransform: string }).colTransform).toBe("none");
    // the showcase Reveal (y=30, 800ms) must have FIRED and settled —
    // the un-dwelled state reads matrix(1,0,0,1,0,30), the fiction the
    // live's scale(.95) twin made this session's law
    expect((state as { showcaseTransform: string }).showcaseTransform).toBe("none");
    expect((state as { w: number }).w).toBe(276);
    expect((state as { h: number }).h).toBe(327);
  });
});
