import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 51 — THE TWENTY-SIXTH SURFACE (the PDF VECTOR/SCRATCH layer,
 * D177) + the 25th surface's ROUTE EXTENSIONS (the /login ERROR +
 * RESET-SUCCESS states' print story, D178 — which exposed THE FIRST
 * CLONE-GAP BUILD SINCE SESSION 47: the reset-success view's missing
 * MAIL-ICON BADGE) + the dashboard's authenticated print story (D179).
 *
 * THE MEASUREMENTS (research/recon-s51.mjs + the prototype instruments,
 * paired clone-vs-live through the SAME local Chromium):
 *
 * THE VECTOR LAYER (D177) — STRUCTURAL PARITY WITH THE DELTA FAMILIES
 * ROOT-CAUSED. The instrument: `qpdf --json --json-stream-data=inline`
 * (one call, every stream + dict as JSON — the D180 law: the qdf
 * text-parse approach is FRAGILE against binary streams carrying false
 * "N 0 obj" byte sequences; the JSON path is length-bounded by
 * construction). The census: per-page content-stream operator counts by
 * FAMILY (path/paint/clip/gs/xform/xobj/color/text) + the FORM XObjects'
 * {BBox, op-count} censuses SORTED.
 *
 * THE MEASURED RECORDS:
 *   /faq   12 forms, byte-identical {BBox, ops} censuses across sides.
 *   /login  7 forms: 6 byte-identical (the image placements + the chip)
 *          + the CARD form's registered text-segmentation delta
 *          (BT/Tf/Tm/ET 15 vs 16, Td 27 vs 26 — the same words split
 *          into different text blocks; the words D163-exact, the fonts
 *          D171-exact).
 *   /login  the page-content family census byte-identical:
 *          path 3, paint 3, clip 1, gs 11, xform 4, xobj 1.
 *   THE COLOR-VALUE ADJUDICATION: the distinct color-VALUE sets are
 *          IDENTICAL on both sides (the same palettes at print); the
 *          count deltas are (a) WHITE re-establishment frequency (the
 *          paint-order family) and (b) the ≤0.5/255 SERIALIZATION
 *          family (the live's lab()/oklab-computed endpoints vs the
 *          clone's pinned @theme integers — D134/D138 at the operator
 *          layer). The pin quantizes each component to the nearest
 *          1/64 — the serialization family merges, the re-establishment
 *          family bounds.
 *   /demo   the registered superset at the vector layer (the working
 *          page vs the live's 16-word SPA shell).
 *   /dashboard (the CLONE-side registration, D179): 292 words, 2 pages,
 *          VendSans-Light 9×, ZERO images (the all-vector dashboard),
 *          ZERO link annotations, 34 forms.
 *
 * THE RESET-SUCCESS BADGE (D178 — THE BUILD): the live's reset view
 * carries `div.mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100
 * rounded-full flex items-center justify-center` (64×64 at ≥sm, bg
 * rgb(241,245,249), radius 9999px) wrapping the lucide Mail icon
 * (`h-7 w-7 sm:h-8 sm:w-8 text-slate-700`, 32×32 at ≥sm, stroke-width 2,
 * color rgb(51,65,85)) above the heading block — 64 + 16 = the exact
 * 80px card-height delta the print story exposed (the state-tracked
 * raster 1359 -> 1609; the card 318 -> 398). The ERROR state measured
 * at FULL PARITY with no build (the 2927 state-tracked raster).
 */

const pdfFile = (name: string) => join(tmpdir(), `s51-pin-${name}.pdf`);

const dwell = async (page: import("@playwright/test").Page, route: string) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
};

const renderPdf = async (page: import("@playwright/test").Page, name: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(name);
  writeFileSync(file, buf);
  return file;
};

// ---------- the poppler family (the S49/S50 parsers, unchanged) ----------
const fontCensus = (file: string) => {
  const out = execFileSync("pdffonts", [file], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const lines = out.split("\n").slice(2).filter((l) => l.trim());
  const census: Record<string, number> = {};
  for (const line of lines) {
    const cols = line.trim().split(/\s{2,}/);
    if (cols.length < 6) continue;
    const family = cols[0].replace(/^[A-Z]{6}\+/, "");
    census[family] = (census[family] ?? 0) + 1;
  }
  return census;
};

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

const linkCensus = (file: string) => {
  const xml = execFileSync("pdftohtml", ["-xml", "-stdout", file], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const census: Record<string, number> = {};
  for (const m of xml.matchAll(/<a href="([^"]*)"/g)) {
    let href = m[1];
    if (href.includes("#")) href = "#" + href.split("#")[1];
    else href = href.replace(/^https?:\/\/[^/]+/, "");
    census[href] = (census[href] ?? 0) + 1;
  }
  return census;
};

const textWords = (file: string) => {
  const out = execFileSync("pdftotext", [file, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.trim().split(/\s+/).filter(Boolean).length;
};

/** The leading-space law honored (gotcha 60). */
const imageRows = (file: string) => {
  const out = execFileSync("pdfimages", ["-list", file], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^page\s+num\s+type/.test(l) && !/^-{10,}$/.test(l))
    .map((l) => l.split(/\s+/))
    .filter((c) => c.length >= 16);
};

const imageKey = (file: string) =>
  imageRows(file)
    .map((c) => `${c[0]}:${c[2]}:${c[3]}x${c[4]}:${c[5]}/${c[6]}c/${c[7]}bpc:${c[8]}:${c[9]}:${c[12]}ppi`)
    .sort();

// ---------- THE D177 INSTRUMENT: qpdf --json (the D180 law) ----------
const FAMILIES: Record<string, string[]> = {
  path: ["m", "l", "c", "v", "y", "re", "h"],
  paint: ["S", "s", "f", "F", "f*", "B", "B*", "b", "b*", "n"],
  clip: ["W", "W*"],
  gs: ["q", "Q", "gs"],
  xform: ["cm"],
  xobj: ["Do"],
  color: ["rg", "RG", "g", "G", "k", "K", "sc", "scn", "SC", "SCN", "cs", "CS"],
  text: ["BT", "ET", "Tf", "Td", "TD", "Tm", "T*", "Tj", "TJ", "Ts", "Tz", "Tw", "Tc"],
};
const OP_TO_FAMILY: Record<string, string> = {};
for (const [fam, ops] of Object.entries(FAMILIES)) for (const op of ops) OP_TO_FAMILY[op] = fam;

const familyCensus = (stream: string) => {
  const fams: Record<string, number> = {};
  for (const tok of stream.split(/[\s\n\r\t]+/)) {
    if (tok === "") continue;
    if (/^[\/(\[<>)\]]/.test(tok)) continue;
    const fam = OP_TO_FAMILY[tok];
    if (fam) fams[fam] = (fams[fam] ?? 0) + 1;
  }
  return fams;
};

/**
 * The color-VALUE census — the D177 adjudication instrument. Each
 * `r g b RG` / `r g b rg` operand triple recorded; quantized to the
 * nearest 1/32 per component (5-bit/channel — coarse enough to merge
 * the ≤0.5/255 lab() serialization family robustly [the 1/64
 * quantization straddles a rounding boundary: .9608 -> 61 vs .961 ->
 * 62 despite a 0.05/255 difference], fine enough to keep the palette's
 * real colors distinct); the white re-establishment family stays
 * visible as a COUNT delta on the SAME value.
 */
const colorValueCensus = (stream: string) => {
  const census: Record<string, number> = {};
  const re = /([\d.]+) ([\d.]+) ([\d.]+) (RG|rg)/g;
  let m;
  while ((m = re.exec(stream)) !== null) {
    const q = [m[1], m[2], m[3]]
      .map((v) => Math.round(Number(v) * 32))
      .join(",");
    const key = `${m[4]}(${q})`;
    census[key] = (census[key] ?? 0) + 1;
  }
  return census;
};

/**
 * The D177 census: per-page content-stream families + the color-value
 * census + the SORTED form-XObject {BBox, families} list (the per-render
 * resource-name allocation normalized out by keying on geometry).
 */
const vectorCensus = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 256 * 1024 * 1024,
  });
  const j = JSON.parse(readFileSync(jsonFile, "utf8"));
  const objs = j.qpdf["1"] as Record<string, { stream?: { data?: string; dict?: Record<string, unknown> } }>;

  const pages: { families: Record<string, number>; colors: Record<string, number> }[] = [];
  for (const pg of j.pages as { contents: string[] }[]) {
    const families: Record<string, number> = {};
    const colors: Record<string, number> = {};
    for (const ref of pg.contents) {
      const obj = objs[`obj:${ref}`];
      if (!obj?.stream?.data) continue;
      const data = Buffer.from(obj.stream.data, "base64").toString("latin1");
      for (const [f, n] of Object.entries(familyCensus(data))) families[f] = (families[f] ?? 0) + n;
      for (const [k, n] of Object.entries(colorValueCensus(data))) colors[k] = (colors[k] ?? 0) + n;
    }
    pages.push({ families, colors });
  }

  const forms: { bbox: string; families: Record<string, number> }[] = [];
  for (const obj of Object.values(objs)) {
    if (!obj.stream?.data) continue;
    const dict = obj.stream.dict as { "/Subtype"?: string; "/BBox"?: unknown } | undefined;
    if (dict?.["/Subtype"] !== "/Form") continue;
    const data = Buffer.from(obj.stream.data, "base64").toString("latin1");
    forms.push({ bbox: JSON.stringify(dict["/BBox"] ?? null), families: familyCensus(data) });
  }
  forms.sort((a, b) => a.bbox.localeCompare(b.bbox) || JSON.stringify(a.families).localeCompare(JSON.stringify(b.families)));
  return { pages, forms };
};

// ---------- the /login state drivers (the S50 pattern) ----------
const enterError = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.fill("#email", "s51-pin@test.local");
  await page.fill("#password", "wrong-password");
  await page.click("button[type=submit]");
  await page.waitForSelector('[role="alert"]');
  await page.waitForTimeout(400);
};

const enterReset = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Forgot password\?/ }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  await page.fill("#email", "s51-pin@test.local");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await page.getByRole("heading", { name: "Check your email" }).waitFor();
  await page.waitForTimeout(400);
};

test.describe("the reset-success badge (Session 51 — D178, the build)", () => {
  test("the badge's verbatim contract: the slate-100 circle + the lucide Mail at the measured classes + geometry", async ({ page }) => {
    await enterReset(page);
    const badge = page.locator("div.mx-auto.bg-slate-100.rounded-full");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveClass(/^mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center$/);
    const box = await badge.boundingBox();
    expect(box?.width).toBe(64); // sm:w-16 at 1280
    expect(box?.height).toBe(64);
    const cs = await badge.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, radius: s.borderRadius, display: s.display, ai: s.alignItems, jc: s.justifyContent };
    });
    expect(cs.bg).toBe("rgb(241, 245, 249)"); // slate-100 — the pinned v3 hex
    // gotcha 48: the FULL-RADIUS equivalence class — the live's v3 bundle
    // computes 9999px, v4's calc(infinity × 1px) serializes in SCIENTIFIC
    // NOTATION ("3.35544e+07px"); parse the float, never the string shape.
    expect(Number.parseFloat(cs.radius)).toBeGreaterThanOrEqual(9999);
    expect(cs.display).toBe("flex");
    expect(cs.ai).toBe("center");
    expect(cs.jc).toBe("center");
    // the Mail icon — the lucide contract (svg + rect + the envelope path)
    const svg = badge.locator("svg");
    await expect(svg).toHaveClass(/lucide-mail/);
    await expect(svg).toHaveClass(/h-7 w-7 sm:h-8 sm:w-8 text-slate-700/);
    const svgBox = await svg.boundingBox();
    expect(svgBox?.width).toBe(32); // sm:h-8 at 1280
    expect(svgBox?.height).toBe(32);
    const svgCs = await svg.evaluate((el) => ({ sw: getComputedStyle(el).strokeWidth, color: getComputedStyle(el).color }));
    expect(svgCs.sw).toBe("2px");
    expect(svgCs.color).toBe("rgb(51, 65, 85)"); // slate-700
    await expect(badge.locator("svg rect")).toHaveCount(1);
    await expect(badge.locator("svg path")).toHaveCount(1);
  });

  test("the reset card converges to the live's 398px (the 80px badge delta closed)", async ({ page }) => {
    await enterReset(page);
    const card = page.locator(".text-card-foreground");
    const box = await card.boundingBox();
    expect(Math.round(box?.height ?? 0)).toBe(398);
    // the wrapper structure: w-full > .space-y-4.sm:space-y-6 (the measured two-level)
    const inner = card.locator("div.w-full > div.space-y-4.sm\\:space-y-6");
    await expect(inner).toHaveCount(1);
  });

  test("the reset state's print story converges: the 1609 state-tracked raster + words 31 + the system fonts + the empty link set", async ({ page }) => {
    await enterReset(page);
    const file = await renderPdf(page, "reset");
    expect(imageKey(file)).toEqual(["1:image:1765x1609:gray/1c/8bpc:jpeg:no:300ppi"]);
    expect(textWords(file)).toBe(31);
    expect(fontCensus(file)).toEqual({ DejaVuSans: 2, "DejaVuSans-Bold": 1 });
    expect(linkCensus(file)).toEqual({});
    const meta = metaCensus(file);
    expect(meta.Title).toBe("SAAS Company");
    expect(meta.Pages).toBe("1");
    expect(meta.Creator).toBe("Chromium");
    expect(meta.Producer).toBe("Skia/PDF m153");
  });

  test("the error state's print story at parity: the 2927 state-tracked raster + the 6-image census + words 30", async ({ page }) => {
    await enterError(page);
    const file = await renderPdf(page, "error");
    expect(imageKey(file)).toEqual([
      "1:image:1168x168:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:1765x2927:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:329x329:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:413x413:gray/1c/8bpc:jpeg:no:300ppi",
      "1:image:754x675:rgb/3c/8bpc:image:no:300ppi",
      "1:smask:754x675:gray/1c/8bpc:image:no:300ppi",
    ]);
    expect(textWords(file)).toBe(30);
    expect(fontCensus(file)).toEqual({ DejaVuSans: 2, "DejaVuSans-Bold": 1 });
    expect(linkCensus(file)).toEqual({});
  });
});

test.describe("the vector/scratch layer (Session 51 — D177, the twenty-sixth surface)", () => {
  test("the /faq 12-form census byte-identical across sides (the {BBox, families} records)", async ({ page }) => {
    await dwell(page, "/faq");
    const c = vectorCensus(await renderPdf(page, "faq"));
    expect(c.forms.length).toBe(12);
    // the measured census: the two text-bearing forms + the divider/vector
    // forms, every BBox + family multiset at the registered values
    expect(c.forms.map((f) => f.bbox)).toEqual([
      "[0,0,1245,189]",
      "[0,0,1245,189]",
      "[0,0,1370,19]",
      "[0,0,1370,244]",
      "[0,0,1370,244]",
      "[0,0,2251,207]",
      "[0,0,2251,207]",
      "[0,0,2251,207]",
      "[0,0,2251,207]",
      "[0,0,2251,207]",
      "[0,0,267,82]",
      "[0,0,267,95]",
    ]);
    // the per-form family records (the representative spans)
    expect(c.forms[0].families).toEqual({ gs: 3, xform: 1, color: 2, text: 101 });
    expect(c.forms[2].families).toEqual({ gs: 3, xform: 1, color: 2, path: 68, paint: 1 });
    expect(c.forms[5].families).toEqual({ gs: 4, xform: 1, color: 4, path: 45, paint: 2 });
    expect(c.forms[10].families).toEqual({ gs: 4, xform: 1, color: 4, path: 29, paint: 2 });
  });

  test("the /login 7-form census: the 6 structural forms + the card form's registered text-segmentation delta", async ({ page }) => {
    await dwell(page, "/login");
    const c = vectorCensus(await renderPdf(page, "login"));
    expect(c.forms.length).toBe(7);
    const byBbox = (b: string) => c.forms.find((f) => f.bbox === b);
    // the card form — the registered delta: the structural families
    // byte-identical, the text family the segmentation record (15 blocks)
    const card = byBbox("[0,0,1798,2726]");
    expect(card?.families).toMatchObject({ gs: 90, path: 1030, clip: 27, paint: 51, xform: 15, xobj: 2 });
    expect(card?.families.text).toBeGreaterThanOrEqual(129); // 129-132: the run-segmentation family
    expect(card?.families.text).toBeLessThanOrEqual(132);
    // the chip + the image placements — byte-identical
    expect(byBbox("[0,0,301,301]")?.families).toEqual({ gs: 3, xform: 1, color: 3, path: 2, paint: 2 });
    expect(byBbox("[0,0,754,676]")?.families).toEqual({ gs: 3, xform: 1, color: 2, xobj: 1 });
    expect(byBbox("[18,15,1783,2711]")?.families).toEqual({ gs: 3, xform: 1, color: 2, xobj: 1 });
    expect(byBbox("[317,2070,1485,2238]")?.families).toEqual({ gs: 3, xform: 1, color: 2, xobj: 1 });
    expect(byBbox("[694,244,1107,657]")?.families).toEqual({ gs: 3, xform: 1, color: 2, xobj: 1 });
    expect(byBbox("[736,268,1065,597]")?.families).toEqual({ gs: 3, xform: 1, color: 2, xobj: 1 });
  });

  test("the /login page-content family census byte-identical", async ({ page }) => {
    await dwell(page, "/login");
    const c = vectorCensus(await renderPdf(page, "login-pc"));
    expect(c.pages[0].families).toEqual({ path: 3, paint: 3, clip: 1, gs: 11, xform: 4, xobj: 1, color: 5 });
  });

  test("the color-value census law: the /faq document-wide quantized value SET + the re-establishment bound", async ({ page }) => {
    await dwell(page, "/faq");
    const pdf = await renderPdf(page, "faq-cv");
    const c = vectorCensus(pdf);
    // the document-wide census: the page contents + every form's stream
    const docColors: Record<string, number> = {};
    for (const p of c.pages) for (const [k, n] of Object.entries(p.colors)) docColors[k] = (docColors[k] ?? 0) + n;
    const jsonFile = pdf.replace(/\.pdf$/, ".json");
    const j = JSON.parse(readFileSync(jsonFile, "utf8"));
    const objs = j.qpdf["1"] as Record<string, { stream?: { data?: string; dict?: { "/Subtype"?: string } } }>;
    for (const obj of Object.values(objs)) {
      if (!obj.stream?.data) continue;
      if (obj.stream.dict?.["/Subtype"] !== "/Form") continue;
      const data = Buffer.from(obj.stream.data, "base64").toString("latin1");
      for (const [k, n] of Object.entries(colorValueCensus(data))) docColors[k] = (docColors[k] ?? 0) + n;
    }
    // THE LAW: the quantized distinct SET — black + the grays + the
    // violets + white, the same families both sides would carry (this pin
    // holds the CLONE side's set; the paired equality is the battery's
    // column). 4 distinct fill values (the /faq record).
    const fills = Object.entries(docColors).filter(([k]) => k.startsWith("rg(")).map(([k]) => k);
    expect(new Set(fills).size).toBe(4);
    expect(fills).toContain("rg(32,32,32)"); // white
    expect(fills).toContain("rg(20,20,20)"); // the .6392/.64 gray family
    expect(fills).toContain("rg(27,0,32)"); // the .8353/.8333 violet family
    expect(fills).toContain("rg(0,0,0)"); // black
    // the re-establishment record: the clone's white count (the exact
    // deterministic count pinned — the paint-order family's fingerprint)
    expect(docColors["rg(32,32,32)"]).toBe(61);
    expect(docColors["RG(32,32,32)"]).toBe(61);
  });

  test("the /demo superset floor at the vector layer (the working page vs the live's SPA shell)", async ({ page }) => {
    await dwell(page, "/demo");
    const c = vectorCensus(await renderPdf(page, "demo"));
    expect(c.forms.length).toBe(12); // the live's shell carries ZERO forms
    expect(c.pages[0].families.path ?? 0).toBeGreaterThanOrEqual(683); // the live's shell: 113
    expect(c.pages[0].families.text ?? 0).toBeGreaterThanOrEqual(823); // the live's shell: 182
  });

  test("the error/reset alternates' vector censuses: the image-placement forms + the per-state card structure", async ({ page }) => {
    await enterError(page);
    const err = vectorCensus(await renderPdf(page, "err-vec"));
    await enterReset(page);
    const reset = vectorCensus(await renderPdf(page, "reset-vec"));
    // the error state carries the full default card + the banner: the
    // card form + the chip + the placements (7 forms family)
    expect(err.forms.length).toBeGreaterThanOrEqual(7);
    // the reset state's SHORT card: no form fields, the badge + heading +
    // alert + back button — the vector census proportionally smaller
    expect(reset.forms.filter((f) => f.bbox === "[0,0,1798,2726]").length).toBe(0);
  });
});

test.describe("the dashboard's authenticated print story (Session 51 — D179, the clone-side registration)", () => {
  test("the authed dashboard's print contract: 292 words / 2 pages / VendSans-Light 9x / the empty image + link sets", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    const file = await renderPdf(page, "dashboard");
    expect(textWords(file)).toBe(292);
    expect(metaCensus(file).Pages).toBe("2");
    expect(fontCensus(file)).toEqual({ "VendSans-Light": 9 });
    // the empty image set — the all-vector dashboard (the D174 law at the authed route)
    expect(imageRows(file).length).toBe(0);
    // the empty link set — the dashboard's actions are buttons (the D169 law)
    expect(linkCensus(file)).toEqual({});
    // the vector layer: the 34-form registration
    const c = vectorCensus(file);
    expect(c.forms.length).toBe(34);
  });
});
