import { expect, test } from "@playwright/test";

/**
 * Session 39 — the scroll-dot period pins (the loop PERIOD layer's
 * first-run finding, D144).
 *
 * The period layer (real-timestamp trough-gap analysis over ~24s windows
 * — research/adj-fine-periods-s39.mjs) measured every member of the
 * landing's loop family at parity EXCEPT the hero's scroll indicator:
 *
 *   D144 — the live's bar cycles at 1.5s (measured 1498ms mean trough
 *          gap; the live's OWN BUNDLE reads
 *          `animate:{y:[0,8,0]}, transition:{duration:1.5, repeat:∞}` —
 *          research/adj-bundle-s39.mjs), while the clone's
 *          `--animate-scroll-dot` shipped 1.7s (Session 8's coarse rAF
 *          estimate, "≈1.7s period" — the same probe class this session
 *         's real-timestamp method supersedes). A 13% period difference
 *          in the dot's bounce rhythm, visible on every landing load.
 *
 * The fix: `scroll-dot 1.7s` → `scroll-dot 1.5s` in globals.css (both
 * carriers: the theme var and the utility class). These pins version the
 * corrected contract at BOTH layers: the WAAPI duration (the exact
 * authored value) and the sampled trough-gap period (the rendered
 * rhythm, real timestamps, the [1400, 1600]ms band = the sampling
 * granularity ±7%).
 */
test.describe("the scroll-dot period pins (Session 39 D144)", () => {
  test("the bar's CSSAnimation duration is the live's measured 1500ms", async ({ page }) => {
    await page.goto("/");
    const contract = await page.evaluate(() => {
      const el = document.querySelector(".animate-scroll-dot");
      if (!el) return null;
      const anims = (el as HTMLElement).getAnimations?.() ?? [];
      const named = anims.filter((a) => (a as { animationName?: string }).animationName);
      if (!named.length) return null;
      const a = named[0] as unknown as {
        animationName: string;
        effect: { getTiming: () => { duration: number; delay: number } };
      };
      return { name: a.animationName, duration: a.effect.getTiming().duration, delay: a.effect.getTiming().delay };
    });
    expect(contract, "the bar carries a CSS animation").not.toBeNull();
    expect(contract!.name).toBe("scroll-dot");
    expect(contract!.duration, "D144: the live's bundle authors 1.5s, not the S8 1.7s").toBe(1500);
  });

  test("the bar's sampled trough-gap period lands in [1400, 1600]ms", async ({ page }) => {
    await page.goto("/");
    // the bar is above the fold; give hydration a beat
    await page.waitForTimeout(1200);
    const period = await page.evaluate(async () => {
      const el = document.querySelector(".animate-scroll-dot");
      if (!el) return null;
      const readTy = () => {
        const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
        return m ? Number(m[1].split(",")[5]) : 0;
      };
      // ~11s window at ~30ms — real timestamps (performance.now), the
      // nominal-interval trap (timer clamping inflates gaps ~10%) avoided
      const seq: { t: number; v: number }[] = [];
      const t0 = performance.now();
      for (let i = 0; i < 360; i++) {
        seq.push({ t: performance.now() - t0, v: readTy() });
        await new Promise((r) => setTimeout(r, 30));
      }
      // troughs: local minima clearly below rest
      const troughs: { t: number; v: number }[] = [];
      for (let i = 1; i < seq.length - 1; i++) {
        if (seq[i].v <= seq[i - 1].v && seq[i].v <= seq[i + 1].v && seq[i].v < 2) troughs.push(seq[i]);
      }
      // merge plateaus (< 250ms apart)
      const merged: { t: number; v: number }[] = [];
      for (const tr of troughs) {
        if (merged.length && tr.t - merged[merged.length - 1].t < 250) {
          merged[merged.length - 1].v = Math.min(merged[merged.length - 1].v, tr.v);
        } else merged.push({ ...tr });
      }
      const gaps: number[] = [];
      for (let i = 1; i < merged.length; i++) gaps.push(merged[i].t - merged[i - 1].t);
      if (gaps.length < 3) return { gaps };
      // robust estimator: a missed shallow trough merges two cycles into
      // one ~2x gap — take the MEDIAN gap (a single miss can't move it)
      const sorted = [...gaps].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      return { period: median, gaps };
    });
    expect(period, "the bar cycles while sampled").not.toBeNull();
    expect(period!.gaps.length, "enough troughs for a median").toBeGreaterThanOrEqual(3);
    expect(period!.period!, "D144: the rendered rhythm is the live's 1.5s").toBeGreaterThanOrEqual(1350);
    expect(period!.period!).toBeLessThanOrEqual(1650);
  });

  test("the bar's amplitude is the live's authored 0..8px travel", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1200);
    const range = await page.evaluate(async () => {
      const el = document.querySelector(".animate-scroll-dot");
      if (!el) return null;
      const readTy = () => {
        const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
        return m ? Number(m[1].split(",")[5]) : 0;
      };
      let min = 0;
      let max = 0;
      for (let i = 0; i < 240; i++) {
        const v = readTy();
        min = Math.min(min, v);
        max = Math.max(max, v);
        await new Promise((r) => setTimeout(r, 25));
      }
      return { min, max };
    });
    expect(range, "the bar was sampled").not.toBeNull();
    expect(range!.min).toBeGreaterThanOrEqual(-0.5);
    expect(range!.max).toBeGreaterThan(7); // the live's authored 8px peak
    expect(range!.max).toBeLessThanOrEqual(8.5);
  });
});
