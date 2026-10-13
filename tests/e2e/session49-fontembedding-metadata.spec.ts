import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 49 — THE TWENTY-FOURTH SURFACE (the font-EMBEDDING layer,
 * D171) + its measured sibling (the PDF METADATA layer, D172) + the
 * 23rd surface's ROUTE EXTENSIONS (the four content-route link
 * censuses + the named-destination tables, D173).
 *
 * THE MEASUREMENTS (research/recon-s49.mjs + named-dests-s49.py +
 * stability-s49.mjs, paired clone-vs-live through the SAME local
 * Chromium — never stale PDFs across instrument versions):
 *
 * THE FONT-EMBEDDING LAYER (D171) — AT FULL PARITY ON ITS FIRST
 * MEASUREMENT (the S45/S48 registration pattern: pin, no build). The
 * instrument: poppler's pdffonts. Normalization: the subset prefix
 * (^[A-Z]{6}+) is a per-render Skia artifact — stripped; the object-ID
 * column dropped. The censuses (family x subset count x type x
 * encoding) byte-identical on 9/10 probed routes:
 *   / VendSans-Light 10x Type 3/Custom; /faq /privacy /terms
 *   /refund-policy 7x each; /accessibility 8x; /thank-you 4x; the 404
 *   5x; /login DejaVuSans 2x + DejaVuSans-Bold 1x CID TrueType/
 *   Identity-H (the login card's system-ui stack falling back to the
 *   headless DejaVu — IDENTICAL on both sides; the computed-family
 *   parity independently confirmed at the print layer).
 *   /demo: the clone's 7x vs the live's 5x — the REGISTERED working
 *   superset (never fix toward the empty shell).
 * The embedding contract: emb=yes sub=yes uni=yes for EVERY face on
 * EVERY route on BOTH sides. The type split is lawful and stable:
 * @font-face webfonts (Vend Sans) embed as Type 3/Custom; system-stack
 * fonts (DejaVu) as CID TrueType/Identity-H. STABILITY PROVEN three
 * ways (the S48 stale renders, the S49 fresh renders, and a dedicated
 * re-render probe — 10/7/2+1 exact on every measurement): the subset
 * counts are deterministic under the pinned Chromium and safe to pin.
 * No Playfair/DM Serif faces in ANY route's PDF — the wordmarks are
 * below-fold un-revealed entrances at print time (the S47 convergence
 * record), so no serif face is painted.
 *
 * THE PARSER COLUMN LAW (learned in flight — the first ph3 parse
 * returned an EMPTY census): pdffonts' TYPE column can carry a space
 * ("CID TrueType"), so a per-column \S+ regex silently parses nothing
 * — and an empty-equals-empty comparison reads as false PARITY. The
 * honest column split is on 2+ SPACES (\s{2,}) with the "yes yes yes"
 * flag triplet and the trailing "obj gen" pair handled as units.
 *
 * THE PDF METADATA LAYER (D172) — parity on 9/10 routes with
 * CreationDate/ModDate (per-render timestamps) and File size (a
 * derived byte count, not an information-dictionary property)
 * normalized out BY CONSTRUCTION (the parse drops them). Identical:
 * Title (the print-time document title = the page's <title> — the
 * head-parity surface re-confirmed at the metadata layer), Creator
 * "Chromium", Producer "Skia/PDF m153", Pages (the S42 records),
 * Tagged/Form/JavaScript/Encrypted, PDF version 1.4, A4 page size.
 * /demo: the registered superset (Title "Book a Demo | SAAS Company"
 * vs the shell's "SAAS Company"; Pages 2/1).
 *
 * THE 23RD SURFACE'S ROUTE EXTENSIONS (D173) — the four unpinned
 * content-route link censuses at FULL PARITY (the pdftohtml
 * censuses, origins stripped, internal anchors normalized to #page
 * targets) + the named-destination TABLES through poppler's
 * `pdfinfo -dests` (the landing: p1 unnamed + features@p4 +
 * how-it-works@p5 + pricing@p6 + testimonials@p7; the content routes
 * the single unnamed p1 destination each). The link-NAME census
 * (pymupdf) stays a recon-recorded measurement — no python in the
 * test layer; the spec pins the poppler dest-table projection.
 */

const pdfFile = (route: string) =>
  join(tmpdir(), `s49-pin${route.replace(/\//g, "_")}.pdf`);

const dwell = async (page: import("@playwright/test").Page, route: string) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
};

const renderPdf = async (page: import("@playwright/test").Page, route: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(route);
  writeFileSync(file, buf);
  return file;
};

/**
 * The D171 instrument: pdffonts over the page.pdf output. The PARSER
 * COLUMN LAW: split on 2+ spaces ("CID TrueType" carries a space;
 * "yes yes yes" and the "obj gen" pair stay single/2-spaced units) —
 * a per-column \S+ regex silently returns an EMPTY census.
 */
const fontCensus = (file: string) => {
  const out = execFileSync("pdffonts", [file], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const lines = out.split("\n").slice(2).filter((l) => l.trim());
  const census: Record<
    string,
    { count: number; types: Record<string, number>; encodings: Record<string, number>; flags: string[] }
  > = {};
  for (const line of lines) {
    const cols = line.trim().split(/\s{2,}/);
    if (cols.length < 6) continue;
    const [name, type, encoding, flagTriplet] = cols;
    const family = name.replace(/^[A-Z]{6}\+/, "");
    const e = (census[family] ??= { count: 0, types: {}, encodings: {}, flags: [] });
    e.count += 1;
    e.types[type] = (e.types[type] ?? 0) + 1;
    e.encodings[encoding] = (e.encodings[encoding] ?? 0) + 1;
    e.flags.push(flagTriplet);
  }
  return census;
};

/**
 * The D172 instrument: pdfinfo with CreationDate/ModDate/File size
 * dropped BY CONSTRUCTION (per-render noise, never a document
 * property) — the comparison can never accidentally depend on them.
 */
const metaCensus = (file: string) => {
  const out = execFileSync("pdfinfo", [file], { encoding: "utf8", maxBuffer: 1024 * 1024 });
  const meta: Record<string, string> = {};
  for (const line of out.split("\n")) {
    const m = line.match(/^([A-Za-z ]+):\s+(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    if (key === "CreationDate" || key === "ModDate" || key === "File size") continue;
    meta[key] = m[2].trim();
  }
  return meta;
};

/** The D173 dest-table instrument: pdfinfo -dests (poppler-only). */
const destTable = (file: string) => {
  const out = execFileSync("pdfinfo", ["-dests", file], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });
  const table: Record<string, string> = {};
  for (const line of out.split("\n")) {
    const m = line.match(/^\s*(\d+)\s+\[.*\]\s+"(.*)"\s*$/);
    if (!m) continue;
    table[`p${m[1]}`] = m[2];
  }
  return table;
};

/** The S48 link-layer instrument (pdftohtml -xml — unchanged). */
const linkCensus = (file: string) => {
  const xml = execFileSync("pdftohtml", ["-xml", "-stdout", file], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
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
  return { census, total: Object.values(census).reduce((a, b) => a + b, 0) };
};

test.describe("the font-embedding layer (Session 49 — D171, the twenty-fourth surface)", () => {
  test("the per-route family censuses at the measured deterministic counts", async ({ page }) => {
    const anchors: Record<string, Record<string, number>> = {
      "/": { "VendSans-Light": 10 },
      "/faq": { "VendSans-Light": 7 },
      "/privacy": { "VendSans-Light": 7 },
      "/terms": { "VendSans-Light": 7 },
      "/accessibility": { "VendSans-Light": 8 },
      "/refund-policy": { "VendSans-Light": 7 },
      "/thank-you": { "VendSans-Light": 4 },
      "/session49-bogus-404": { "VendSans-Light": 5 },
    };
    for (const [route, expected] of Object.entries(anchors)) {
      await dwell(page, route);
      const file = await renderPdf(page, route);
      const census = fontCensus(file);
      const counts = Object.fromEntries(
        Object.entries(census).map(([fam, e]) => [fam, e.count]),
      );
      expect(counts, `font census on ${route}`).toEqual(expected);
    }
  });

  test("the /login system-stack census (DejaVu 2x + Bold 1x — the computed-family parity at the print layer)", async ({ page }) => {
    await dwell(page, "/login");
    const file = await renderPdf(page, "/login");
    const census = fontCensus(file);
    const counts = Object.fromEntries(
      Object.entries(census).map(([fam, e]) => [fam, e.count]),
    );
    expect(counts).toEqual({ DejaVuSans: 2, "DejaVuSans-Bold": 1 });
    // the system-stack type split: CID TrueType / Identity-H
    expect(census.DejaVuSans.types).toEqual({ "CID TrueType": 2 });
    expect(census.DejaVuSans.encodings).toEqual({ "Identity-H": 2 });
    expect(census["DejaVuSans-Bold"].types).toEqual({ "CID TrueType": 1 });
  });

  test("the embedding contract: every face emb/sub/uni yes + the webfont type split", async ({ page }) => {
    await dwell(page, "/");
    const webfont = fontCensus(await renderPdf(page, "/"));
    expect(webfont["VendSans-Light"].types).toEqual({ "Type 3": 10 });
    expect(webfont["VendSans-Light"].encodings).toEqual({ Custom: 10 });
    await dwell(page, "/login");
    const system = fontCensus(await renderPdf(page, "/login"));
    // every flag triplet on every face: "yes yes yes"
    for (const e of [...Object.values(webfont), ...Object.values(system)]) {
      for (const f of e.flags) expect(f).toBe("yes yes yes");
    }
  });

  test("the /demo working-superset floor (VendSans-Light >= the live's 5x shell census)", async ({ page }) => {
    await dwell(page, "/demo");
    const census = fontCensus(await renderPdf(page, "/demo"));
    expect(census["VendSans-Light"].count).toBeGreaterThanOrEqual(5);
    // the ONLY family — the same face the live's shell paints
    expect(Object.keys(census)).toEqual(["VendSans-Light"]);
  });

  test("the subset-prefix law: every raw face name carries the Skia per-subset tag", async ({ page }) => {
    await dwell(page, "/thank-you");
    const file = await renderPdf(page, "/thank-you");
    const out = execFileSync("pdffonts", [file], { encoding: "utf8" });
    const rows = out.split("\n").slice(2).filter((l) => l.trim());
    expect(rows.length).toBeGreaterThanOrEqual(4);
    for (const row of rows) {
      const name = row.trim().split(/\s{2,}/)[0];
      expect(name, `subset-tagged face name: ${name}`).toMatch(/^[A-Z]{6}\+\S+$/);
    }
  });
});

test.describe("the PDF metadata layer (Session 49 — D172)", () => {
  test("the per-route metadata censuses at the measured parity (dates + size normalized by construction)", async ({ page }) => {
    const anchors: Record<string, { Title: string; Pages: string }> = {
      "/": { Title: "SAAS Company", Pages: "8" },
      "/faq": { Title: "FAQ | SAAS Company", Pages: "2" },
      "/privacy": { Title: "Privacy | SAAS Company", Pages: "2" },
      "/terms": { Title: "Terms | SAAS Company", Pages: "2" },
      "/accessibility": { Title: "Accessibility | SAAS Company", Pages: "3" },
      "/refund-policy": { Title: "Refund Policy | SAAS Company", Pages: "2" },
      "/thank-you": { Title: "Thank You | SAAS Company", Pages: "1" },
      "/login": { Title: "SAAS Company", Pages: "1" },
      "/session49-bogus-404": { Title: "SAAS Company", Pages: "1" },
    };
    for (const [route, expected] of Object.entries(anchors)) {
      await dwell(page, route);
      const meta = metaCensus(await renderPdf(page, route));
      expect(meta.Title, `Title on ${route}`).toBe(expected.Title);
      expect(meta.Pages, `Pages on ${route}`).toBe(expected.Pages);
      // the constant document properties (the shared Chromium/Skia
      // render path — both sides measured identical in the recon)
      expect(meta.Creator).toBe("Chromium");
      expect(meta.Producer).toBe("Skia/PDF m153");
      expect(meta["PDF version"]).toBe("1.4");
      expect(meta.Tagged).toBe("no");
      expect(meta.Form).toBe("none");
      expect(meta.JavaScript).toBe("no");
      expect(meta.Encrypted).toBe("no");
      expect(meta["Page size"]).toBe("595.92 x 842.88 pts (A4)");
      expect(meta["Page rot"]).toBe("0");
    }
  });

  test("the /demo superset record (the working route's title + page count)", async ({ page }) => {
    await dwell(page, "/demo");
    const meta = metaCensus(await renderPdf(page, "/demo"));
    expect(meta.Title).toBe("Book a Demo | SAAS Company");
    expect(meta.Pages).toBe("2");
  });
});

test.describe("the 23rd surface's route extensions (Session 49 — D173)", () => {
  test("the four content-route link censuses (the measured sets, byte-identical to the live)", async ({ page }) => {
    const anchors: Record<string, Record<string, number>> = {
      "/terms": { "/faq": 7, "#1": 6, "/privacy": 1, "/terms": 1, "/accessibility": 1, "/refund-policy": 2 },
      "/privacy": { "/privacy": 1, "#1": 7, "/faq": 5, "/terms": 1, "/accessibility": 3, "/refund-policy": 2 },
      "/accessibility": { "/faq": 5, "#1": 5, "/privacy": 1, "/terms": 1, "/accessibility": 1, "/refund-policy": 4 },
      "/refund-policy": { "/faq": 4, "#1": 5, "/privacy": 1, "/terms": 1, "/accessibility": 1, "/refund-policy": 4 },
    };
    for (const [route, expected] of Object.entries(anchors)) {
      await dwell(page, route);
      const { census } = linkCensus(await renderPdf(page, route));
      expect(census, `link census on ${route}`).toEqual(expected);
    }
  });

  test("the named-destination tables (pdfinfo -dests): the landing's four named + the content routes' single unnamed", async ({ page }) => {
    await dwell(page, "/");
    const landing = destTable(await renderPdf(page, "/"));
    expect(landing).toEqual({
      p1: "",
      p4: "features",
      p5: "how-it-works",
      p6: "pricing",
      p7: "testimonials",
    });
    for (const route of ["/terms", "/privacy", "/accessibility", "/refund-policy"]) {
      await dwell(page, route);
      const table = destTable(await renderPdf(page, route));
      expect(table, `dest table on ${route}`).toEqual({ p1: "" });
    }
  });
});
