import { describe, expect, it } from "vitest";

import { easeOut, revealProgress, revealState } from "./motion";

/**
 * Session-8 motion-engine pins (docs/remediation-plan-session8.md R1).
 *
 * The reference animates its scroll entrances with framer-motion: a rAF
 * loop writing inline opacity/transform per frame, easing
 * cubic-bezier(0, 0, 0.58, 1) (framer's named `easeOut` — extracted from
 * the live's bundle as `cP=na(0,0,.58,1)` and verified by fitting ten
 * sampled frames of the live's entrance ramp, MAE 0.014). These pure
 * helpers drive the rewritten `Reveal` component; the previous
 * CSS-transition implementation is gone (Session-8 F1).
 */

describe("easeOut — the live's entrance easing (cubic-bezier(0, 0, 0.58, 1))", () => {
  it("hits the endpoints exactly", () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
  });

  it("matches the live's measured curve at the quartiles", () => {
    // Pinned from the bezier solver: these are the values the live's
    // rendered opacity ramp passes through (fit MAE 0.014 over ten
    // sampled frames of the pricing-card entrance).
    expect(easeOut(0.25)).toBeCloseTo(0.378138, 4);
    expect(easeOut(0.5)).toBeCloseTo(0.684643, 4);
    expect(easeOut(0.75)).toBeCloseTo(0.906535, 4);
  });

  it("is monotonic (an entrance never moves backwards)", () => {
    let prev = -1;
    for (let i = 0; i <= 100; i++) {
      const v = easeOut(i / 100);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it("is ease-OUT (the first quartile outruns linear)", () => {
    expect(easeOut(0.25)).toBeGreaterThan(0.25);
  });
});

describe("revealProgress — the delay/duration timeline", () => {
  it("stays at 0 through the delay window", () => {
    expect(revealProgress(-50, { delay: 400, duration: 600 })).toBe(0);
    expect(revealProgress(0, { delay: 400, duration: 600 })).toBe(0);
    expect(revealProgress(399, { delay: 400, duration: 600 })).toBe(0);
  });

  it("advances linearly through the animation window", () => {
    expect(revealProgress(400, { delay: 400, duration: 600 })).toBe(0);
    expect(revealProgress(700, { delay: 400, duration: 600 })).toBeCloseTo(0.5, 6);
    expect(revealProgress(1000, { delay: 400, duration: 600 })).toBe(1);
  });

  it("clamps at 1 past the end", () => {
    expect(revealProgress(5000, { delay: 0, duration: 600 })).toBe(1);
  });

  it("treats a zero duration as instantly complete", () => {
    expect(revealProgress(0, { delay: 0, duration: 0 })).toBe(1);
  });
});

describe("revealState — the per-frame inline style values", () => {
  it("renders the initial (pre-reveal) state", () => {
    expect(revealState(0, 30)).toEqual({ opacity: 0, transform: "translateY(30px)" });
  });

  it("renders the settled state exactly like the live (opacity: 1; transform: none)", () => {
    expect(revealState(1, 30)).toEqual({ opacity: 1, transform: "none" });
  });

  it("interpolates mid-flight: eased opacity, remaining travel as translateY", () => {
    const mid = revealState(0.5, 30);
    expect(mid.opacity).toBeCloseTo(0.684643, 4);
    // (1 - eased) * y — the live's MutationObserver showed exactly this
    // shape: translateY(17.7654px) at ~59% progress on a 43px travel.
    expect(mid.transform).toBe(`translateY(${(1 - easeOut(0.5)) * 30}px)`);
  });

  it("never emits the old CSS-transition residue (no transition-delay)", () => {
    const keys = Object.keys(revealState(1, 30));
    expect(keys).toEqual(["opacity", "transform"]);
  });
});
