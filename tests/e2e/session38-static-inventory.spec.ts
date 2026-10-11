import { expect, test } from "@playwright/test";

/**
 * Session 38 — the static-inventory pins (the three S38 candidate
 * surfaces, measured GREEN and versioned here so a future regression
 * surfaces loudly).
 *
 *   R3-a — the TRANSITION COMPANIONS: will-change / backface-visibility /
 *          transform-style / isolation. Measured on EVERY rendered element
 *          of every route, both sides: ZERO non-default carriers
 *          (research/recon2-s38.mjs — the isolation DEFAULT is `auto`,
 *          not `isolate`; the first probe's filter bug, caught and fixed).
 *          The sentinel pins the interactives: any future stray will-change
 *          or backface-visibility on an interactive fails here.
 *   R3-b — the FONT-FAMILY STACK inventory: the FULL computed stack (not
 *          just the first family — the S35 column's firstFamily() limit)
 *          per text-bearing element. Measured: 4 distinct stacks, byte-
 *          identical counts on both sides across all eight routes — the
 *          landing's three (Vend Sans body, Playfair Display + DM Serif
 *          Display display faces) and the login route's system stack with
 *          the emoji fallbacks (the live's /login bundle ships the v3
 *          default stack there).
 *   R3-c — the RADIAL/CONIC gradient carriers: ZERO on either side (the
 *          mockup's "orb glows" are linear bg-gradient-to-r + blur-3xl).
 *          Battery-side only — the empty-set adjudication lives in
 *          docs/remediation-plan-session38.md.
 */
const LANDING_STACKS = [
  '"Vend Sans", sans-serif',
  '"Playfair Display", serif',
  '"DM Serif Display", serif',
];
const LOGIN_STACK =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

test.describe("the static-inventory pins (Session 38 R3)", () => {
  test("every rendered interactive carries the DEFAULT companions (will-change auto, backface visible, transform-style flat, isolation auto)", async ({ page }) => {
    await page.goto("/");
    const carriers = await page.evaluate(() => {
      const out: unknown[] = [];
      for (const el of document.querySelectorAll("a, button")) {
        if (!el.getClientRects().length) continue;
        const cs = getComputedStyle(el);
        if (cs.willChange !== "auto" || cs.backfaceVisibility !== "visible" ||
            cs.transformStyle !== "flat" || cs.isolation !== "auto") {
          out.push({ text: (el.textContent || "").trim().slice(0, 30), wc: cs.willChange, bf: cs.backfaceVisibility, ts: cs.transformStyle, iso: cs.isolation });
        }
      }
      return out;
    });
    expect(carriers, `non-default companion carriers: ${JSON.stringify(carriers)}`).toEqual([]);
  });

  test("NO rendered element anywhere on the landing carries a non-default companion (the empty-set contract, all-elements sweep)", async ({ page }) => {
    await page.goto("/");
    const carriers = await page.evaluate(() => {
      const out: unknown[] = [];
      for (const el of document.querySelectorAll("body *")) {
        if (!el.getClientRects().length) continue;
        const cs = getComputedStyle(el);
        if (cs.willChange !== "auto" || cs.backfaceVisibility !== "visible" ||
            cs.transformStyle !== "flat" || cs.isolation !== "auto") {
          out.push({ tag: el.tagName, cls: (el.getAttribute("class") || "").slice(0, 50), wc: cs.willChange, bf: cs.backfaceVisibility, ts: cs.transformStyle, iso: cs.isolation });
        }
      }
      return out;
    });
    expect(carriers, `non-default companion carriers: ${JSON.stringify(carriers.slice(0, 5))}`).toEqual([]);
  });

  test("the landing's font-family STACK inventory: exactly the live's three stacks with the live's carrier counts", async ({ page }) => {
    await page.goto("/");
    const stacks = await page.evaluate(() => {
      const fonts = {};
      for (const el of document.querySelectorAll("body *")) {
        if (!el.getClientRects().length) continue;
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && !!n.textContent?.trim());
        if (!hasText) continue;
        const f = getComputedStyle(el).fontFamily;
        fonts[f] = (fonts[f] || 0) + 1;
      }
      return fonts;
    });
    const entries = Object.entries(stacks).sort();
    expect(entries.map(([k]) => k)).toEqual([...LANDING_STACKS].sort());
    // the live's measured carrier counts (recon-s38: x163 / x2 / x1)
    const byStack = Object.fromEntries(entries);
    expect(byStack['"Vend Sans", sans-serif']).toBe(163);
    expect(byStack['"Playfair Display", serif']).toBe(2);
    expect(byStack['"DM Serif Display", serif']).toBe(1);
  });

  test("the login route's font stack is the live's full SYSTEM stack (emoji fallbacks included)", async ({ page }) => {
    await page.goto("/login");
    const stacks = await page.evaluate(() => {
      const fonts = {};
      for (const el of document.querySelectorAll("body *")) {
        if (!el.getClientRects().length) continue;
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && !!n.textContent?.trim());
        if (!hasText) continue;
        const f = getComputedStyle(el).fontFamily;
        fonts[f] = (fonts[f] || 0) + 1;
      }
      return fonts;
    });
    const entries = Object.entries(stacks);
    expect(entries.length).toBe(1);
    expect(entries[0][0]).toBe(LOGIN_STACK);
    expect(entries[0][1]).toBe(11);
  });

  test("the content routes carry the single Vend Sans stack (the dark-route contract)", async ({ page }) => {
    for (const route of ["/faq", "/privacy", "/terms", "/accessibility", "/refund-policy"]) {
      await page.goto(route);
      const stacks = await page.evaluate(() => {
        const fonts = {};
        for (const el of document.querySelectorAll("body *")) {
          if (!el.getClientRects().length) continue;
          const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && !!n.textContent?.trim());
          if (!hasText) continue;
          const f = getComputedStyle(el).fontFamily;
          fonts[f] = (fonts[f] || 0) + 1;
        }
        return fonts;
      });
      expect(Object.keys(stacks), `${route}`).toEqual(['"Vend Sans", sans-serif']);
    }
  });
});
