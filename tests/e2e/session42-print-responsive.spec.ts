import { expect, test } from "@playwright/test";

/**
 * Session 42 — the print-surface + responsive-route-extension pins
 * (the battery's SEVENTEENTH surface + the fifteenth surface's route
 * growth).
 *
 * The print surface (research/recon-s42.mjs + adj-s42.mjs A1, paired
 * clone-vs-live at FOUR layers): the CSSOM rule scan (zero @media print
 * rules in any stylesheet), the DOCUMENT scan (zero link/style elements
 * carrying a media attribute — the blind-spot layer: a <link
 * media="print"> sheet's top-level rules are NOT CSSMediaRule, so the
 * rule scan alone cannot see them), the COMPUTED scan (under
 * emulateMedia print, zero style deltas on the key elements), and the
 * RENDER scan (page.pdf page counts identical across sides on 7 of 8
 * public routes — /demo clone-2 vs live-1 is the REGISTERED
 * working-superset route: the live soft-404s it). **The empty-set
 * contract at exact parity: neither side ships any print styling, and
 * the print render matches.** No superset addition — print restyling
 * would be a VISIBLE deviation from the reference's printed output;
 * the registered superset families are functional features and
 * invisible-at-rest a11y, never output changes.
 *
 * The responsive route extension (research/recon-s42.mjs R3 +
 * recon2-s42.mjs, paired clone-vs-live, DWELL-loaded per gotcha 52e):
 * /faq + all four legal routes at 390/768/1024/1440 — EXACT PARITY on
 * every field: nav 56px @390 / 72px @≥768, the burger (the SHARED
 * md:hidden selector — gotcha 47: the live's bare burger carries no
 * aria-controls) visible at 390 / hidden at ≥768, nav links 1/7, ZERO
 * horizontal overflow, document heights byte-identical per width:
 * /faq 1641/1309/1285/1285, /privacy 2205/1461/1359/1359, /terms
 * 2383/1503/1479/1479, /accessibility 3747/2471/2421/2421,
 * /refund-policy 1955/1315/1291/1291; /privacy's h1 at 128px from the
 * top at every width.
 *
 * These pins version the CLONE side of the contracts so a future
 * regression (an added print rule, a stray overflow, a broken menu
 * flip, a reflowed legal page) surfaces loudly.
 */

const WIDTHS = [390, 768, 1024, 1440] as const;

// the parity anchors: route -> { width -> document height }
const DOC_HEIGHTS: Record<string, Record<number, number>> = {
  "/faq": { 390: 1641, 768: 1309, 1024: 1285, 1440: 1285 },
  "/privacy": { 390: 2205, 768: 1461, 1024: 1359, 1440: 1359 },
  "/terms": { 390: 2383, 768: 1503, 1024: 1479, 1440: 1479 },
  "/accessibility": { 390: 3747, 768: 2471, 1024: 2421, 1440: 2421 },
  "/refund-policy": { 390: 1955, 768: 1315, 1024: 1291, 1440: 1291 },
};

async function readNav(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const nav = document.querySelector("nav");
    const burger = nav
      ? [...nav.querySelectorAll("button")].find((b) => /(^|\s)md:hidden(\s|$)/.test(b.getAttribute("class") || ""))
      : null;
    const links = nav ? [...nav.querySelectorAll("a")].filter((a) => a.getBoundingClientRect().width > 0) : [];
    const bs = burger ? getComputedStyle(burger) : null;
    return {
      navH: nav ? Math.round(nav.getBoundingClientRect().height) : -1,
      burgerVisible: !!burger && burger.getBoundingClientRect().width > 0 && bs!.display !== "none",
      navLinks: links.length,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      docH: document.documentElement.scrollHeight,
    };
  });
}

test.describe("the print-surface pins (Session 42 — the seventeenth surface)", () => {
  test("the print empty-set: zero @media print rules AND zero media-attributed link/style elements", async ({ page }) => {
    for (const route of ["/", "/faq", "/privacy"]) {
      await page.goto(route);
      await page.waitForTimeout(800);
      const scan = await page.evaluate(() => {
        // layer 1 — the CSSOM rule scan (CSSMediaRule with a print condition)
        let printRules = 0;
        for (const sheet of document.styleSheets) {
          let rules; try { rules = sheet.cssRules; } catch { continue; }
          if (!rules) continue;
          for (const rule of rules) {
            if (rule.type === CSSRule.MEDIA_RULE && /\bprint\b/i.test(rule.conditionText || "")) printRules++;
          }
        }
        // layer 2 — the DOCUMENT scan (the blind-spot layer: a
        // <link media="print"> sheet's top-level rules are NOT media rules)
        const mediaAttributed = [...document.querySelectorAll("link[rel~='stylesheet'], style")].filter(
          (el) => !!el.getAttribute("media"),
        ).length;
        const nonDefaultSheetMedia = [...document.styleSheets].filter((s) => {
          try { return s.media.mediaText && !/screen/i.test(s.media.mediaText); } catch { return false; }
        }).length;
        return { printRules, mediaAttributed, nonDefaultSheetMedia };
      });
      expect(scan.printRules, `@media print rules on ${route}`).toBe(0);
      expect(scan.mediaAttributed, `link/style elements with a media attribute on ${route}`).toBe(0);
      expect(scan.nonDefaultSheetMedia, `adopted sheets with non-screen media on ${route}`).toBe(0);
    }
  });

  test("the print-emulation computed contract: no style deltas under print media", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    const readKeyStyles = () =>
      page.evaluate(() => {
        const pick = (sel: string) => {
          const el = document.querySelector(sel);
          if (!el) return "null";
          const cs = getComputedStyle(el);
          return [cs.display, cs.visibility, cs.color, cs.backgroundColor, cs.position].join("|");
        };
        return {
          body: pick("body"),
          nav: pick("nav"),
          h1: pick("h1"),
          footer: pick("footer"),
          section: pick("section"),
          input: pick("input"),
        };
      });
    const screen = await readKeyStyles();
    await page.emulateMedia({ media: "print" });
    await page.waitForTimeout(400);
    const print = await readKeyStyles();
    await page.emulateMedia({ media: null });
    for (const el of Object.keys(screen)) {
      expect(print[el as keyof typeof print], `${el}: no print-media restyling (the live ships none either)`).toBe(screen[el as keyof typeof screen]);
    }
  });

  test("the PDF page-count contract (the real print pipeline)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const anchors: Record<string, number> = {
      "/": 8,
      "/login": 1,
      "/faq": 2,
      "/privacy": 2,
      "/accessibility": 3,
      // the registered working-superset route: the live soft-404s /demo
      // (its PDF is 1 page of 404 chrome); the clone renders the
      // demo-request surface at 2 — D73/D146
      "/demo": 2,
    };
    for (const [route, expectedPages] of Object.entries(anchors)) {
      await page.goto(route);
      await page.waitForTimeout(800);
      const pdf = await page.pdf({ format: "A4", printBackground: true });
      const text = pdf.toString("latin1");
      const pages = (text.match(/\/Type[\s]*\/Page[^s]/g) || []).length;
      expect(pages, `PDF page count on ${route}`).toBe(expectedPages);
    }
  });
});

test.describe("the responsive-route-extension pins (Session 42 — the fifteenth surface's route growth)", () => {
  test("/faq + /privacy: the nav contract, zero overflow, and the docH anchors at all four widths", async ({ page }) => {
    for (const route of ["/faq", "/privacy"]) {
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(route);
        await page.waitForTimeout(700);
        const d = await readNav(page);
        expect(d.navH, `${route} nav height at w=${w}`).toBe(w < 768 ? 56 : 72);
        expect(d.navLinks, `${route} visible nav links at w=${w}`).toBe(w < 768 ? 1 : 7);
        expect(d.overflowX, `${route} zero horizontal overflow at w=${w}`).toBe(0);
        const anchor = DOC_HEIGHTS[route]![w]!;
        expect(Math.abs(d.docH - anchor), `${route} document height at w=${w} (anchor ${anchor})`).toBeLessThanOrEqual(32);
      }
    }
  });

  test("/privacy's h1 sits at 128px from the top at every width (the measured parity geometry)", async ({ page }) => {
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/privacy");
      await page.waitForTimeout(600);
      const top = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        return h1 ? Math.round(h1.getBoundingClientRect().top + window.scrollY) : -1;
      });
      expect(Math.abs(top - 128), `/privacy h1 top at w=${w}`).toBeLessThanOrEqual(8);
    }
  });

  test("the legal-route docH sweep: /terms, /accessibility, /refund-policy at all four widths", async ({ page }) => {
    for (const route of ["/terms", "/accessibility", "/refund-policy"]) {
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(route);
        await page.waitForTimeout(600);
        const d = await readNav(page);
        expect(d.navH, `${route} nav height at w=${w}`).toBe(w < 768 ? 56 : 72);
        expect(d.overflowX, `${route} zero horizontal overflow at w=${w}`).toBe(0);
        const anchor = DOC_HEIGHTS[route]![w]!;
        expect(Math.abs(d.docH - anchor), `${route} document height at w=${w} (anchor ${anchor})`).toBeLessThanOrEqual(32);
      }
    }
  });

  test("the burger md:hidden flip on the legal routes (the shared selector — gotcha 47)", async ({ page }) => {
    for (const route of ["/terms", "/accessibility", "/refund-policy"]) {
      // 390: the burger renders
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto(route);
      await page.waitForTimeout(600);
      const at390 = await readNav(page);
      expect(at390.burgerVisible, `${route} burger visible at 390`).toBe(true);
      // 1440: display none
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(400);
      const at1440 = await readNav(page);
      expect(at1440.burgerVisible, `${route} burger hidden at 1440`).toBe(false);
      expect(at1440.navLinks, `${route} the 7 desktop links at 1440`).toBe(7);
    }
  });
});
