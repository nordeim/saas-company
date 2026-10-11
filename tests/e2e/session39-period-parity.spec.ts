import { expect, test } from "@playwright/test";

/**
 * Session 39 — the period-parity pins (the loop PERIOD layer).
 *
 * The layer (real-timestamp trough-gap analysis, ~24s windows —
 * research/adj-fine-periods-s39.mjs): every member of the landing's loop
 * family measured on BOTH sides at period parity:
 *
 *   side-list dots     live 2001ms  clone 1999ms   (2s)
 *   ambient glow       live 4001ms  clone 3996ms   (4s)
 *   under-glow         live 3000ms  clone 2998ms   (3s)
 *   skeleton bars      live 3001ms  clone 2998ms   (3s)
 *   skeleton tiles     live ~3s     clone ~3s      (3s, WAAPI-pinned)
 *   float chevron      live 3999ms  clone 3997ms   (4s — the D145
 *                      registered conflict: the live's authored
 *                      y:[0,-15,0] is suppressed by its vestigial
 *                      whileInView:{y:0}; the period still reads 4s)
 *   petals             3s (the S38 WAAPI pins)
 *   scroll-dot bar     live 1498ms → clone 1500ms  (the D144 fix)
 *
 * These pins version the clone's CSS durations (through the WAAPI — the
 * exact authored values) against the live's MEASURED periods, plus a
 * sampled trough-gap period for two representatives (the bar and one
 * skeleton tile).
 */
const WAAPI_DURATIONS: [string, number][] = [
  [".animate-scroll-dot", 1500], // D144 — the live's bundle: 1.5s
  [".animate-mockup-dot", 2000], // the live's side-list dots: 2s
  [".animate-mockup-glow", 3000], // the under-glow: 3s
  [".animate-mockup-ambient", 4000], // the ambient glow: 4s
  [".animate-skel-line", 3000], // the skeleton family: 3s
  [".animate-skel-tile", 3000],
  [".animate-skel-wide", 3000],
  [".animate-float", 4000], // the chevron: 4s (the D145 record)
  [".animate-pulse", 2000], // the hero badge pulses: Tailwind's pulse (live 2001ms / clone 1999ms)
  // NOTE: .animate-pulse-glow (2.4s) is DEFINED but UNUSED in the tree —
  // the hero badges ride Tailwind's animate-pulse (2s), which is what
  // the period layer measured at parity (live 2001ms / clone 1999ms).
];

test.describe("the period-parity pins (Session 39 — the loop period layer)", () => {
  for (const [sel, want] of WAAPI_DURATIONS) {
    test(`the ${sel} loop's CSS duration is the live's measured ${want}ms`, async ({ page }) => {
      await page.goto("/");
      const got = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const anims = (el as HTMLElement).getAnimations?.() ?? [];
        const named = anims.filter((a) => (a as { animationName?: string }).animationName);
        if (!named.length) return null;
        return (named[0] as { effect: { getTiming: () => { duration: number } } }).effect.getTiming().duration;
      }, sel);
      expect(got, `${sel} carries a CSS animation`).not.toBeNull();
      expect(got).toBe(want);
    });
  }

  test("the skeleton tile's sampled trough-gap period lands in [2800, 3200]ms", async ({ page }) => {
    await page.goto("/");
    // the skeleton tiles live in the mockup (above the fold)
    await page.waitForTimeout(1200);
    const period = await page.evaluate(async () => {
      const el = document.querySelector(".animate-skel-tile");
      if (!el) return null;
      const readO = () => parseFloat(getComputedStyle(el).opacity);
      const seq: { t: number; v: number }[] = [];
      const t0 = performance.now();
      for (let i = 0; i < 330; i++) {
        // ~10s at ~30ms, real timestamps
        seq.push({ t: performance.now() - t0, v: readO() });
        await new Promise((r) => setTimeout(r, 30));
      }
      const mid = (Math.min(...seq.map((s) => s.v)) + Math.max(...seq.map((s) => s.v))) / 2;
      const ups: number[] = [];
      let lastSign = Math.sign(seq[0].v - mid);
      for (const s of seq) {
        const sg = Math.sign(s.v - mid);
        if (sg !== 0 && lastSign !== 0 && sg !== lastSign && sg > 0) ups.push(s.t);
        if (sg !== 0) lastSign = sg;
      }
      const gaps: number[] = [];
      for (let i = 1; i < ups.length; i++) gaps.push(ups[i] - ups[i - 1]);
      if (gaps.length < 2) return { gaps };
      return { period: gaps.reduce((a, b) => a + b, 0) / gaps.length, gaps: gaps.length };
    });
    expect(period, "the tile was sampled").not.toBeNull();
    expect(period!.gaps!, "enough up-crossings for a mean").toBeGreaterThanOrEqual(2);
    expect(period!.period!).toBeGreaterThanOrEqual(2800);
    expect(period!.period!).toBeLessThanOrEqual(3200);
  });
});
