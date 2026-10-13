import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 48 — THE BUILD-PIPELINE FONT FIX (D167) + the TWENTY-SECOND
 * surface's ROUTE EXTENSIONS (D168) + THE TWENTY-THIRD SURFACE (the
 * print-to-PDF LINK layer, D169) + the /login + /demo ENTRANCE
 * EMPTY-SET (D170).
 *
 * THE MEASUREMENTS (research/recon-s48.mjs + adj-s48a/b, paired
 * clone-vs-live):
 *
 * THE FONT-BUILD DRIFT (D167) — the session's headline. Google's css2
 * endpoint NOW dedupes every requested wght of Playfair Display to the
 * SAME variable-font gstatic URL (measured 2026-10-13), and Next
 * 16.4.0's Turbopack NextFontGoogleFontFileReplacer asserts "next/font/
 * google queries have exactly one entry" per URL query — the pulled
 * tree's `weight: ["400","500","600","700"]` produced four @font-face
 * src lines sharing one query and ABORTED the production build with 16
 * module-not-found errors. FIXED with `weight: "variable"` (the range
 * request returns ONE @font-face per subset covering every weight —
 * the semantically correct variable-font selection; the discrete range
 * form "400 700" is REJECTED by Turbopack's own validator). The
 * rendering contract is UNCHANGED: the family still registers as
 * "Playfair Display" and the built CSS now carries
 * `font-weight:400 900` — this spec pins that registration so a future
 * regression (back to discrete weights, or another supplier-side
 * change) surfaces RED instead of breaking the pipeline.
 *
 * THE PRINT-TEXT EXTENSIONS (D168) — the 22nd surface's route growth:
 * /terms 400 = 400, /accessibility 584 = 584, /refund-policy 295 =
 * 295, the 404 16 = 16 (all EXACT, pdftotext); /demo 101 vs the live's
 * 16-word SPA-shell 404 (the registered working-superset route).
 *
 * THE PDF LINK LAYER (D169 — the 23rd surface) — AT FULL PARITY ON ITS
 * FIRST MEASUREMENT. The instrument: poppler's `pdftohtml -xml` (the
 * same poppler family as the S47 pdftotext precedent — no python in
 * the test layer). The censuses (origins stripped, internal anchors
 * normalized to their #page targets):
 *   - the LANDING: 8 pages; {#5: 24, #6: 19, /faq: 12, #4: 11, #7: 9,
 *     #1: 6, /refund-policy: 2, /terms: 1, /privacy: 1,
 *     /accessibility: 1, /: 1} — the pymupdf cross-check reads the 48
 *     named destinations at `pricing`×18, `features`×9,
 *     `how-it-works`×8, `testimonials`×8 + 5 unnamed.
 *   - /faq: 2 pages; {#1: 5, /refund-policy: 4, /faq: 4, /terms: 1,
 *     /privacy: 1, /accessibility: 1} — the nav + footer set.
 *   - /thank-you: EXACTLY ONE link → / (the CTA anchor).
 *   - /login + the 404: the EMPTY SET (zero link annotations — the
 *     login bundle's bare card carries buttons, not anchors).
 *   - /demo: the clone's 14 links vs the live's ZERO — the registered
 *     working superset (never fix toward the empty shell).
 *
 * THE ENTRANCE EMPTY-SET (D170) — /login + /demo carry ZERO inline
 * motion carriers (no opacity-0/translateY styles) on EITHER side:
 * parity at the empty set (the S42 pattern).
 */

const pdfFile = (route: string) =>
  join(tmpdir(), `s48-pin${route.replace(/\//g, "_")}.pdf`);

/** The S47 print-text instrument (pdftotext — the CID-honest extractor). */
const pdfText = async (page: import("@playwright/test").Page, route: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(route);
  writeFileSync(file, buf);
  const text = execFileSync("pdftotext", [file, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * The S48 link-layer instrument: pdftohtml -xml over the page.pdf
 * output. Normalization: external hrefs lose their origin (the clone
 * serves :3100 here — the battery strips both origins the same way);
 * internal hrefs (named destinations) normalize to their #page target
 * (pdftohtml renders them as <file>.html#N — the file prefix is the
 * temp name and never meaningful).
 */
const pdfLinks = async (page: import("@playwright/test").Page, route: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(route);
  writeFileSync(file, buf);
  const xml = execFileSync(
    "pdftohtml",
    ["-xml", "-stdout", file],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const pages = (xml.match(/<page /g) ?? []).length;
  const census: Record<string, number> = {};
  for (const m of xml.matchAll(/<a href="([^"]*)"/g)) {
    let href = m[1];
    if (href.includes("#")) {
      href = "#" + href.split("#")[1];
    } else {
      href = href.replace(/^https?:\/\/[^/]+/, "");
    }
    census[href] = (census[href] ?? 0) + 1;
  }
  return { pages, census, total: Object.values(census).reduce((a, b) => a + b, 0) };
};

const dwell = async (page: import("@playwright/test").Page, route: string) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
};

test.describe("the build-pipeline font fix (Session 48 — D167)", () => {
  test("the served CSS registers Playfair Display as the VARIABLE face (400 900) + the DM Serif regular cut", async ({ page }) => {
    await dwell(page, "/");
    const cssUrls = await page.evaluate(() =>
      [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) =>
        (l as HTMLLinkElement).getAttribute("href") ?? "",
      ),
    );
    expect(cssUrls.length).toBeGreaterThan(0);
    let css = "";
    for (const href of cssUrls) {
      const abs = href.startsWith("http") ? href : new URL(href, page.url()).toString();
      css += await (await page.request.get(abs)).text();
    }
    // the variable registration — the fix's contract (a regression to
    // discrete weights re-breaks the Turbopack build; a silent supplier
    // change that alters the family/weights surfaces HERE first)
    expect(css).toMatch(
      /@font-face\{font-family:Playfair Display;font-style:normal;font-weight:400 900;font-display:swap;src:url\([^)]*woff2\)/,
    );
    // the DM Serif SINGLE regular cut (Session 51 re-versioned: the
    // live's css2 URL ships no ital axis — its italic Thrune wordmark
    // renders the browser's SYNTHESIZED OBLIQUE over the regular file,
    // so the clone loads the regular cut only; the italic @font-face
    // is GONE by design and its italic wordmark renders the identical
    // synthesized oblique — the print font census converged)
    expect(css).toMatch(
      /@font-face\{font-family:DM Serif Display;font-style:normal;font-weight:400;font-display:swap;src:url\([^)]*woff2\)/,
    );
    // the italic-cut ABSENCE guard (the Session-51 contract: loading
    // the true italic again would diverge from the live's rendered
    // glyphs at the print layer)
    expect(css).not.toMatch(
      /@font-face\{font-family:DM Serif Display;font-style:italic/,
    );
    // the self-hosted Vend Sans pair still ships (the body faces)
    expect(css).toMatch(/@font-face\{font-family:"?Vend Sans"?/);
    // the discrete-weight regression guard: NO per-weight Playfair faces
    const playfairFaces = css.match(/@font-face\{[^}]*font-family:Playfair Display[^}]*\}/g) ?? [];
    expect(playfairFaces.filter((f) => /font-weight:400[;}]/.test(f))).toHaveLength(0);
    expect(playfairFaces.filter((f) => /font-weight:700[;}]/.test(f))).toHaveLength(0);
  });

  test("the wordmark spans still resolve the Playfair/DM Serif chains (the rendering unchanged)", async ({ page }) => {
    await dwell(page, "/");
    for (const [name, family] of [
      ["Zphlix", '"Playfair Display"'],
      ["Melpyx", '"Playfair Display"'],
      ["Thrune", '"DM Serif Display"'],
    ] as const) {
      const el = page.locator("span").filter({ hasText: name }).first();
      await expect(el).toBeVisible();
      const ff = await el.evaluate((n) => getComputedStyle(n).fontFamily);
      expect(ff.startsWith(family)).toBe(true);
    }
  });
});

test.describe("the print-text route extensions (Session 48 — D168, the 22nd surface's growth)", () => {
  test("the remaining routes' PDF text at the measured parity (400/584/295/16)", async ({ page }) => {
    const anchors: Record<string, number> = {
      "/terms": 400,
      "/accessibility": 584,
      "/refund-policy": 295,
      "/session48-bogus-404": 16,
    };
    for (const [route, expected] of Object.entries(anchors)) {
      await dwell(page, route);
      const words = await pdfText(page, route);
      expect(words, `PDF text words on ${route}`).toBe(expected);
    }
  });

  test("the /demo superset floor (the working route — never the live's 16-word shell)", async ({ page }) => {
    await dwell(page, "/demo");
    const words = await pdfText(page, "/demo");
    expect(words).toBeGreaterThanOrEqual(95);
  });
});

test.describe("the PDF link layer (Session 48 — D169, the twenty-third surface)", () => {
  test("/thank-you carries EXACTLY ONE link → / (the CTA anchor)", async ({ page }) => {
    await dwell(page, "/thank-you");
    const { census, total, pages } = await pdfLinks(page, "/thank-you");
    expect(total).toBe(1);
    expect(census["/"]).toBe(1);
    expect(pages).toBe(1);
  });

  test("/login + the 404 carry ZERO link annotations (the empty set)", async ({ page }) => {
    for (const route of ["/login", "/session48-bogus-404"]) {
      await dwell(page, route);
      const { total } = await pdfLinks(page, route);
      expect(total, `link count on ${route}`).toBe(0);
    }
  });

  test("/faq carries the nav + footer link set (the measured census)", async ({ page }) => {
    await dwell(page, "/faq");
    const { census, pages } = await pdfLinks(page, "/faq");
    expect(pages).toBe(2);
    expect(census).toEqual({
      "#1": 5,
      "/refund-policy": 4,
      "/faq": 4,
      "/terms": 1,
      "/privacy": 1,
      "/accessibility": 1,
    });
  });

  test("the landing carries the full measured link census (URI set + internal page anchors)", async ({ page }) => {
    await dwell(page, "/");
    const { census, pages, total } = await pdfLinks(page, "/");
    expect(pages).toBe(8);
    expect(total).toBe(87);
    expect(census).toEqual({
      "#5": 24,
      "#6": 19,
      "/faq": 12,
      "#4": 11,
      "#7": 9,
      "#1": 6,
      "/refund-policy": 2,
      "/terms": 1,
      "/privacy": 1,
      "/accessibility": 1,
      "/": 1,
    });
  });

  test("/demo carries the working-superset link floor (the live's shell has ZERO)", async ({ page }) => {
    await dwell(page, "/demo");
    const { total } = await pdfLinks(page, "/demo");
    expect(total).toBeGreaterThanOrEqual(10);
  });

  test("the /login page count stays 1 + the landing 8 (the S42 records through the link instrument)", async ({ page }) => {
    await dwell(page, "/login");
    const login = await pdfLinks(page, "/login");
    expect(login.pages).toBe(1);
    await dwell(page, "/");
    const landing = await pdfLinks(page, "/");
    expect(landing.pages).toBe(8);
  });
});

test.describe("the /login + /demo entrance empty-set (Session 48 — D170)", () => {
  test("zero inline motion carriers on either route", async ({ page }) => {
    for (const route of ["/login", "/demo"]) {
      await dwell(page, route);
      const carriers = await page.evaluate(() =>
        [...document.querySelectorAll("*")].filter((el) => {
          const st = el.getAttribute("style") ?? "";
          return /opacity:\s*0/.test(st) || /translateY/.test(st);
        }).length,
      );
      expect(carriers, `motion carriers on ${route}`).toBe(0);
    }
  });
});
