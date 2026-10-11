import { expect, test } from "@playwright/test";

/**
 * Session 38 — the navbar hover-shine gradientShift pins (the loop
 * inventory's WAAPI-layer catch, D143).
 *
 * The THIRTEENTH surface's WAAPI layer (every CSS animation's name,
 * duration, delay, and keyframe stops) caught the shine span's
 * gradientShift contract drifting on its first run, on every route that
 * carries the navbar:
 *
 *   D143 — the live's gradientShift is a FOUR-CORNER cycle with five
 *          keyframe stops — background-position (0% 50%) → (0% 0%) →
 *          (100% 50%) → (50% 100%) → (0% 50%), 6s ease-in-out infinite
 *          — the natural extreme positions of a 135deg gradient (each
 *          segment a straight line in position space: the left edge,
 *          the y=x/2 diagonal, the x+y=150 anti-diagonal, the y=x+50
 *          diagonal). The clone shipped a TWO-STOP sweep (0% 50% →
 *          100% 50% → back) — the shine's gradient travels a different
 *          path under hover, invisible to every prior surface (the
 *          span is opacity-0 at rest; the S37 hover twin measures
 *          color/border chrome, not background-position mid-flight).
 *
 * Extracted by hover-sampling the live's computed background-position
 * over 7s (research/probe-shine-keys-s38.mjs — the WAAPI layer does not
 * serialize background-position values, only the stop offsets) and
 * cross-checked against the segment geometry.
 */
test.describe("the hover-shine gradientShift pins (Session 38 D143)", () => {
  test("the shine span's gradientShift carries the live's FIVE-stop corner-cycle contract", async ({ page }) => {
    await page.goto("/");
    const contract = await page.evaluate(() => {
      const spans = [...document.querySelectorAll("span")].filter((s) =>
        (s.getAttribute("class") || "").includes("group-hover:opacity-100"));
      const el = spans[0] as HTMLElement | undefined;
      if (!el) return null;
      const anims = (el.getAnimations ? el.getAnimations() : []) as unknown[];
      const named = anims.filter((a) => (a as { animationName?: string }).animationName);
      if (!named.length) return null;
      const a = named[0] as { animationName: string; effect: { getTiming: () => { duration: number; delay: number }; getKeyframes: () => { offset: number }[] } };
      return {
        name: a.animationName,
        duration: a.effect.getTiming().duration,
        delay: a.effect.getTiming().delay,
        offsets: a.effect.getKeyframes().map((k) => k.offset),
      };
    });
    expect(contract, "the shine span exists and carries a CSS animation").not.toBeNull();
    expect(contract!.name).toBe("gradientShift");
    expect(contract!.duration).toBe(6000);
    expect(contract!.delay).toBe(0);
    expect(contract!.offsets).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  test("under REAL hover the shine's background-position visits the live's four corners (the D143 cycle)", async ({ page }) => {
    await page.goto("/");
    const box = await page.evaluate(() => {
      const spans = [...document.querySelectorAll("span")].filter((s) =>
        (s.getAttribute("class") || "").includes("group-hover:opacity-100"));
      const el = spans[0];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x, box!.y); // REAL hover — gotcha 16
    const seq = await page.evaluate(async () => {
      const spans = [...document.querySelectorAll("span")].filter((s) =>
        (s.getAttribute("class") || "").includes("group-hover:opacity-100"));
      const el = spans[0];
      const out: string[] = [];
      for (let k = 0; k < 52; k++) {
        out.push(getComputedStyle(el).backgroundPosition);
        await new Promise((r) => setTimeout(r, 135));
      }
      return out;
    });
    await page.mouse.move(4, 4);
    // 7.02s covers a full 6s cycle plus margin: the observed extremes must
    // touch all four corners within 6% (the sample grid is 135ms = 2.25%
    // of the cycle; the eased segments dwell near corners)
    const pts = (seq as string[]).map((v) => v.split(/\s+/).map(parseFloat));
    const near = (target: [number, number]) =>
      pts.some(([x, y]) => Math.abs(x - target[0]) <= 6 && Math.abs(y - target[1]) <= 6);
    expect(near([0, 50]), "the (0%,50%) corner").toBe(true);
    expect(near([0, 0]), "the (0%,0%) corner").toBe(true);
    expect(near([100, 50]), "the (100%,50%) corner").toBe(true);
    expect(near([50, 100]), "the (50%,100%) corner").toBe(true);
  });
});
