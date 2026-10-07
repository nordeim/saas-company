/**
 * The reference's entrance-motion engine (Session 8, docs/remediation-plan-
 * session8.md R1). The live animates its scroll entrances with
 * framer-motion: a rAF loop writing inline `opacity`/`transform` per frame,
 * easing its named `easeOut` — extracted from the live's bundle as
 * `cP = na(0, 0, .58, 1)` (cubic-bezier(0, 0, 0.58, 1)) and verified by
 * fitting ten sampled frames of the live's pricing-card entrance ramp
 * (MAE 0.014). These pure helpers drive the `Reveal` component; the
 * previous CSS-transition implementation is gone (Session-8 F1: it snapped
 * entrances on transition-colors children and corrupted their hover
 * transitions through the shared `transition-*` cascade).
 */

/** Solve a CSS cubic-bezier easing curve for its y value at progress t. */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (t: number) => number {
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    // bisection on the x polynomial — 40 iterations pin x to <1e-7
    let lo = 0;
    let hi = 1;
    let s = t;
    for (let i = 0; i < 40; i++) {
      const cx =
        3 * x1 * (1 - s) * (1 - s) * s +
        3 * x2 * (1 - s) * s * s +
        s * s * s;
      if (Math.abs(cx - t) < 1e-7) break;
      if (cx < t) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return (
      3 * y1 * (1 - s) * (1 - s) * s +
      3 * y2 * (1 - s) * s * s +
      s * s * s
    );
  };
}

/** The live's entrance easing: framer-motion's `easeOut` (cubic-bezier(0, 0, 0.58, 1)). */
export const easeOut = cubicBezier(0, 0, 0.58, 1);

/**
 * The entrance timeline: 0 through the delay window, then linear through
 * the animation window, clamped at 1. (`revealState` applies the easing —
 * framer interpolates the eased value against wall-clock progress the same
 * way.)
 */
export function revealProgress(
  elapsedMs: number,
  opts: { delay: number; duration: number },
): number {
  const { delay, duration } = opts;
  if (duration <= 0) return 1;
  const t = (elapsedMs - delay) / duration;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

/**
 * The per-frame inline-style values: eased opacity, the remaining travel as
 * `translateY(<(1 - eased) * y>px)`. The settled state is EXACTLY the
 * live's framer residue: `opacity: 1; transform: none;` (verified on the
 * live's settled problem card — no transition-delay, no will-change).
 */
export function revealState(
  progress: number,
  y: number,
): { opacity: number; transform: string } {
  const eased = easeOut(progress);
  if (progress >= 1) return { opacity: 1, transform: "none" };
  return {
    opacity: eased,
    transform: `translateY(${(1 - eased) * y}px)`,
  };
}
