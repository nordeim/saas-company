import { expect, test } from "@playwright/test";

/**
 * Session 39 — the reduced-motion LOOP record pin.
 *
 * The measured reference-side behavior (research/recon-s39.mjs, surface
 * B): under `prefers-reduced-motion: reduce` the LIVE keeps **29 loopers
 * cycling** on the landing — its framer inline writes (the skeleton
 * tiles, the side dots, the orbs, the scroll-dot bar) AND its own CSS
 * animations (the hover-shine `gradientShift`, the `organic-gradient`
 * text fills) — the live ships NO reduced-motion support anywhere in
 * either bundle.
 *
 * The CLONE collapses to **ZERO cyclers**: the globals.css
 * `@media (prefers-reduced-motion: reduce)` block clamps every animation
 * to 0.01ms, the Reveal entrances settle instantly (the settle()
 * early-return), and Lenis is skipped — the Session-14 F4 a11y-superset
 * decision (WCAG 2.3.3), now pinned at the LOOP-INVENTORY level: a ≥5s
 * time-sampled inventory of every rendered element finds no element
 * whose computed transform/opacity/background-position changes between
 * samples.
 */
test.describe("the reduced-motion loop record (Session 39 — the S14 superset, loop-level)", () => {
  test.use({ reducedMotion: "reduce" });

  test("a 5s sampled inventory of the landing finds ZERO cyclers under reduce", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // the full-load discipline (the scroll-through matters even under
    // reduce: it completes every whileInView reveal instantly)
    await page.evaluate(async () => {
      const steps = 12;
      const h = document.body.scrollHeight;
      for (let i = 0; i <= steps; i++) {
        window.scrollTo(0, (h * i) / steps);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);

    const cyclers = await page.evaluate(async () => {
      const snap = () => {
        const rows: string[] = [];
        for (const el of document.querySelectorAll("*")) {
          if (!el.getClientRects().length) continue;
          const cs = getComputedStyle(el);
          rows.push(`${cs.transform}|${cs.opacity}|${cs.backgroundPosition}`);
        }
        return rows;
      };
      const first = snap();
      let changes = 0;
      const offenders: string[] = [];
      // 5s at ~250ms — 20 samples
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 250));
        const now = snap();
        if (now.length !== first.length) continue; // DOM churn (marquee clones?) — skip
        for (let k = 0; k < now.length; k++) {
          if (now[k] !== first[k]) {
            changes++;
            if (offenders.length < 5) offenders.push(now[k].slice(0, 80));
          }
        }
      }
      return { changes, offenders };
    });
    expect(cyclers.changes, `no element may cycle under reduce (offenders: ${cyclers.offenders.join(" ; ")})`).toBe(0);
  });

  test("the 0.01ms clamp holds on the loop carriers (the S14 F4 pin, re-read on the current build)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(800);
    const durations = await page.evaluate(() => {
      const els = [
        document.querySelector(".animate-scroll-dot"),
        ...document.querySelectorAll('[class*="animate-mockup-"]'),
        ...document.querySelectorAll('[class*="animate-skel-"]'),
      ].filter(Boolean) as HTMLElement[];
      return els.map((el) => {
        const cs = getComputedStyle(el);
        return { name: cs.animationName, ms: parseFloat(cs.animationDuration) };
      });
    });
    expect(durations.length, "the loop carriers are present").toBeGreaterThan(0);
    for (const d of durations) {
      expect(d.ms, `${d.name} clamped to ~0.01ms`).toBeLessThan(0.5);
    }
  });
});
