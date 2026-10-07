"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scrolling — the reference runs Lenis 1.3.x with default
 * options (verified on the live: `window.lenis` present, `html.lenis`,
 * default wheel/touch feel). This wrapper reproduces it:
 *   - created once per page load, destroyed on unmount;
 *   - `autoRaf` drives the internal rAF loop (v1.1+ API);
 *   - skipped entirely under `prefers-reduced-motion: reduce` (the clone's
 *     reduced-motion doctrine — CSS smooth scrolling also collapses there).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ autoRaf: true });
    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
