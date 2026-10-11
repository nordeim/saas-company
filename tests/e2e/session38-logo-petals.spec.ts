import { expect, test } from "@playwright/test";

/**
 * Session 38 — the logo petal choreography pins (the loop inventory's
 * first-run finding, D142).
 *
 * The THIRTEENTH surface (the LOOP inventory — library-agnostic
 * animation parity: time-sampled computed values, so CSS keyframes AND
 * the live's framer inline writes both surface as cyclers) caught the
 * logo petals' drift on its FIRST RUN, on every route that carries the
 * logo:
 *
 *   D142 — the live's four petals slide AXIS-ALIGNED, each along its own
 *          cardinal axis, amplitude 12.84px (user units), with the stop
 *          shape 0%: 0 → 30%: peak → 50%: peak (hold) → 80%: 0 → 100%: 0
 *          (hold), 3s ease-in-out infinite, the ew/we petals delayed a
 *          full period (3000ms — they sit out the first ns/sn cycle):
 *            ns: translateY(+12.84px)   sn: translateY(−12.84px)
 *            ew: translateX(−12.84px)   we: translateX(+12.84px)
 *          The clone shipped a DIAGONAL 3px jitter (translate(3px, −3px)
 *          family) with a DIFFERENT stop shape (0%, 40%, 100%: 0;
 *          50%: peak) — amplitude 4.28x off, direction rotated 45°.
 *
 * Extracted definitively through the Web Animations API
 * (`el.getAnimations()[0].effect.getKeyframes()` — the exact offsets and
 * transform values; research/probe-logo-keys-s38.mjs) and verified by
 * 60-sample matrix-range probes over 3.3s (research/probe-logo-css2-s38.mjs).
 * The function SPELLINGS are pinned verbatim — the live serializes the
 * ns/sn petals as translateY(...) and the ew/we petals as single-arg
 * translate(...); the WAAPI keyframe strings compare byte-identically
 * only when the authored CSS uses the same spellings.
 */
const PETALS = [
  { sel: ".anim-logo-ns",  name: "logo-ns",  delay: 0,    peak: "translateY(12.84px)" },
  { sel: ".anim-logo-ew",  name: "logo-ew",  delay: 3000, peak: "translate(-12.84px)" },
  { sel: ".anim-logo-sn",  name: "logo-sn",  delay: 0,    peak: "translateY(-12.84px)" },
  { sel: ".anim-logo-we",  name: "logo-we",  delay: 3000, peak: "translate(12.84px)" },
  { sel: ".anim-flogo-ns", name: "flogo-ns", delay: 0,    peak: "translateY(12.84px)" },
  { sel: ".anim-flogo-ew", name: "flogo-ew", delay: 3000, peak: "translate(-12.84px)" },
  { sel: ".anim-flogo-sn", name: "flogo-sn", delay: 0,    peak: "translateY(-12.84px)" },
  { sel: ".anim-flogo-we", name: "flogo-we", delay: 3000, peak: "translate(12.84px)" },
];
const REST = (p: (typeof PETALS)[number]) =>
  p.peak.startsWith("translateY") ? "translateY(0px)" : "translate(0px)";

test.describe("the logo petal choreography pins (Session 38 D142)", () => {
  for (const p of PETALS) {
    test(`the ${p.sel} petal carries the live's measured WAAPI keyframe contract`, async ({ page }) => {
      await page.goto("/");
      const contract = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const anims = ((el as HTMLElement).getAnimations ? (el as HTMLElement).getAnimations() : []) as unknown[];
        const named = anims.filter((a) => (a as { animationName?: string }).animationName);
        if (!named.length) return null;
        const a = named[0] as { animationName: string; effect: { getTiming: () => { duration: number; delay: number }; getKeyframes: () => { offset: number; transform: string; easing: string }[] } };
        return {
          name: a.animationName,
          duration: a.effect.getTiming().duration,
          delay: a.effect.getTiming().delay,
          keys: a.effect.getKeyframes().map((k) => ({
            offset: k.offset,
            transform: k.transform,
            easing: k.easing,
          })),
        };
      }, p.sel);
      expect(contract, `the ${p.sel} petal exists and carries a CSS animation`).not.toBeNull();
      expect(contract!.name).toBe(p.name);
      expect(contract!.duration).toBe(3000);
      expect(contract!.delay).toBe(p.delay);
      // the live's stop shape: five stops, peak held 30%-50%, rest held 80%-100%
      expect(contract!.keys.map((k) => k.offset)).toEqual([0, 0.3, 0.5, 0.8, 1]);
      expect(contract!.keys.map((k) => k.transform)).toEqual([
        REST(p), p.peak, p.peak, REST(p), REST(p),
      ]);
      // the per-segment easing (the class shorthand's ease-in-out, applied
      // to each interior keyframe by CSSOM)
      expect(contract!.keys[1].easing).toBe("ease-in-out");
      expect(contract!.keys[2].easing).toBe("ease-in-out");
      expect(contract!.keys[3].easing).toBe("ease-in-out");
    });
  }

  test("the ns petal's sampled matrix RANGE reaches the live's ±12.84px axis amplitude (D142)", async ({ page }) => {
    await page.goto("/");
    const range = await page.evaluate(async () => {
      const el = document.querySelector(".anim-logo-ns");
      if (!el) return null;
      let tyMin = 1e9, tyMax = -1e9, txMin = 1e9, txMax = -1e9;
      for (let k = 0; k < 46; k++) {
        const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
        if (m) {
          const v = m[1].split(",").map(Number);
          txMin = Math.min(txMin, v[4]); txMax = Math.max(txMax, v[4]);
          tyMin = Math.min(tyMin, v[5]); tyMax = Math.max(tyMax, v[5]);
        }
        await new Promise((r) => setTimeout(r, 75));
      }
      return { tx: [txMin, txMax], ty: [tyMin, tyMax] };
    });
    expect(range).not.toBeNull();
    // AXIS-ALIGNED: the ns petal moves in y ONLY (the old drift cycled tx+ty)
    expect(Math.abs(range!.tx[0])).toBeLessThan(0.6);
    expect(Math.abs(range!.tx[1])).toBeLessThan(0.6);
    // the amplitude: the 3.45s window covers a full 3s cycle — the peak is
    // reachable at both ends; 12.2 tolerates the sample-grid miss
    expect(range!.ty[1]).toBeGreaterThan(12.2);
    expect(range!.ty[0]).toBeGreaterThan(-0.6);
  });

  test("the ew petal's sampled matrix RANGE reaches −12.84px on the x axis (the full-period delay honored)", async ({ page }) => {
    await page.goto("/");
    const range = await page.evaluate(async () => {
      const el = document.querySelector(".anim-logo-ew");
      if (!el) return null;
      let txMin = 1e9, txMax = -1e9, tyMin = 1e9, tyMax = -1e9;
      for (let k = 0; k < 46; k++) {
        const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
        if (m) {
          const v = m[1].split(",").map(Number);
          txMin = Math.min(txMin, v[4]); txMax = Math.max(txMax, v[4]);
          tyMin = Math.min(tyMin, v[5]); tyMax = Math.max(tyMax, v[5]);
        }
        await new Promise((r) => setTimeout(r, 75));
      }
      return { tx: [txMin, txMax], ty: [tyMin, tyMax] };
    });
    expect(range).not.toBeNull();
    expect(Math.abs(range!.ty[0])).toBeLessThan(0.6);
    expect(Math.abs(range!.ty[1])).toBeLessThan(0.6);
    expect(range!.tx[0]).toBeLessThan(-12.2);
    expect(range!.tx[1]).toBeGreaterThan(-0.6);
  });
});
