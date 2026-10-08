import { expect, test } from "@playwright/test";

/**
 * The reduced-motion contract (Session 14 F4 — pin-only: the probe
 * verified the behavior CLEAN before this suite existed; these pins keep
 * it that way).
 *
 * Two mechanisms must hold for `prefers-reduced-motion: reduce` users:
 *
 * 1. CONTENT VISIBILITY — `Reveal` settles instantly on mount (the
 *    settle() early-return BEFORE the IntersectionObserver path). The
 *    catastrophic regression this pins against: any change that makes
 *    entrances wait for intersection under reduced motion would strand
 *    below-fold content at opacity:0 for those users — invisible
 *    sections, permanently, with nothing red in any other suite.
 *
 * 2. LOOP COLLAPSE — the globals.css `@media (prefers-reduced-motion:
 *    reduce)` block clamps every animation to 0.01ms (the mockup's
 *    pulsing loops, the scroll dot, the skeleton shapes).
 *
 * The intentional superset note (PAD ledger): the live's framer entrances
 * RUN under reduced motion; the clone collapses them — the a11y-superset
 * decision, pinned here.
 */

test.describe("reduced motion (Session-14 F4)", () => {
  test.use({ reducedMotion: "reduce" });

  test("(a) the landing's below-fold entrances are settled WITHOUT scrolling", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Give hydration a moment — then NO scroll pass: under reduced motion
    // every Reveal must already be at its settled state.
    await page.waitForTimeout(1500);
    const belowFold = await page.evaluate(() => {
      const probes = [
        ...document.querySelectorAll("h2"),
        ...document.querySelectorAll("footer h3"),
      ];
      return probes
        .filter((el) => el.getBoundingClientRect().top > 900)
        .slice(0, 6)
        .map((el) => {
          let node: Element | null = el;
          let opacity = 1;
          while (node && node instanceof Element) {
            const o = parseFloat(getComputedStyle(node).opacity);
            if (!Number.isNaN(o)) opacity *= o;
            node = node.parentElement;
          }
          return { text: (el.textContent || "").trim().slice(0, 30), opacity };
        });
    });
    expect(belowFold.length).toBeGreaterThanOrEqual(4);
    for (const p of belowFold) {
      expect(p.opacity, `"${p.text}" visible without scrolling`).toBe(1);
    }
  });

  test("(b) the CSS loops collapse to the 0.01ms clamp", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(800);
    // The hero's scroll indicator dot (animate-scroll-dot) and the
    // mockup's ambient loops (animate-mockup-*) are always-present
    // looping elements on the landing. The clamp's computed value
    // serializes in SCIENTIFIC NOTATION ("1e-05s" on this Chromium —
    // NOT the authored "0.01ms"), so compare the parsed milliseconds.
    const durations = await page.evaluate(() => {
      const els = [
        document.querySelector(".animate-scroll-dot"),
        ...document.querySelectorAll('[class*="animate-mockup-"]'),
      ].filter(Boolean) as HTMLElement[];
      return els.map((el) => ({
        name: getComputedStyle(el).animationName,
        ms: parseFloat(getComputedStyle(el).animationDuration) * 1000,
      }));
    });
    expect(durations.length).toBeGreaterThan(0);
    for (const d of durations) {
      expect(d.name, "the loop's keyframe is still attached").not.toBe("none");
      expect(d.ms, `loop clamped under reduced motion (got ${d.ms}ms)`).toBeLessThanOrEqual(0.02);
    }
  });

  test("(c) the /faq accordion rows render visible", async ({ page }) => {
    await page.goto("/faq");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1200);
    const rows = await page.evaluate(() => {
      const items = [...document.querySelectorAll('[data-state]')].slice(0, 5);
      return items.map((el) => getComputedStyle(el).opacity);
    });
    expect(rows.length).toBeGreaterThanOrEqual(3);
    for (const o of rows) {
      expect(o).toBe("1");
    }
    // And the FAQ heading block itself (a Reveal wrapper).
    const heading = page.getByRole("heading", { name: "Questions? We've Got Answers" });
    await expect(heading).toBeVisible();
  });
});
