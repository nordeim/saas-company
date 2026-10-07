"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { revealProgress, revealState } from "@/lib/motion";

/**
 * Scroll-entrance wrapper — the reference's framer-motion mechanism,
 * re-implemented rAF-driven (Session 8, docs/remediation-plan-session8.md
 * R1). The live animates `initial {opacity: 0, y} → {opacity: 1, y: 0}`
 * with easing cubic-bezier(0, 0, 0.58, 1) (framer's `easeOut`, measured),
 * writing inline `opacity`/`transform` per frame; the settled inline state
 * is exactly `opacity: 1; transform: none;`.
 *
 * Why NOT CSS transitions (the Session-8 lesson): putting transition
 * classes on the child corrupts it — the child's own hover transitions
 * (transition-colors 0.15s / transition-all 0.3s) share the same cascade,
 * so the entrance's duration/easing/delay leaked into every hover, and on
 * transition-colors children the entrance itself snapped (opacity/transform
 * were not in the winning property list). This component never adds
 * classes: it only writes the two inline properties, so the child's own
 * transitions stay intact.
 *
 * `prefers-reduced-motion` settles instantly — the intentional a11y
 * superset (the live's framer entrances RUN under reduced motion; the
 * clone collapses them — PAD ledger).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 600,
  y = 24,
  as: Tag = "div",
  mode = "inview",
  style,
}: {
  children: ReactNode;
  className?: string;
  /** ms before the entrance starts (opacity stays 0 through the window). */
  delay?: number;
  /** ms of animation (the live: 300–800 per element). */
  duration?: number;
  /** Initial translateY offset (the live: 15–60 per element). */
  y?: number;
  as?: "div" | "section" | "span" | "p" | "h1" | "h2";
  /** "inview" waits for intersection (once); "mount" starts after mount. */
  mode?: "inview" | "mount";
  /** Extra inline styles (merged BEFORE the motion state so the settled write keeps them). */
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  // "hidden" → "done": React's virtual style tracks the endpoints only.
  // Mid-flight values are written imperatively by the rAF loop — a parent
  // re-render during the animation re-writes only the last virtual value
  // (opacity 0), so React never fights the loop; the "done" transition
  // writes exactly what the loop just wrote (no flash).
  const [phase, setPhase] = useState<"hidden" | "done">("hidden");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let raf = 0;
    let io: IntersectionObserver | null = null;

    const settle = () => {
      el.style.opacity = "1";
      el.style.transform = "none";
      setPhase("done");
    };
    const start = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const p = revealProgress(now - t0, { delay, duration });
        const s = revealState(p, y);
        el.style.opacity = String(s.opacity);
        el.style.transform = s.transform;
        if (p < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          settle();
        }
      };
      raf = requestAnimationFrame(tick);
    };

    // The a11y superset: the live's framer entrances run under reduced
    // motion (measured identical curves); the clone collapses them —
    // content appears instantly, no animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle();
      return () => {
        cancelled = true;
      };
    }

    if (mode === "mount" || typeof IntersectionObserver === "undefined") {
      start();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              io?.disconnect();
              start();
              break;
            }
          }
        },
        { threshold: 0 },
      );
      io.observe(el);
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [delay, duration, mode, y]);

  const motionStyle: CSSProperties =
    phase === "done"
      ? { opacity: 1, transform: "none" }
      : { opacity: 0, transform: `translateY(${y}px)` };

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      /* omit the attribute entirely when empty — the live's unclassed
         motion wrappers carry NO class attribute (not class="") */
      className={className || undefined}
      style={{ ...style, ...motionStyle }}
    >
      {children}
    </Tag>
  );
}
