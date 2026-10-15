import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 54 — THE TWENTY-NINTH SURFACE (the PDF RESOURCE-TARGET
 * INTERIOR layer, D187) + the TWO LAWS (the color-space EMPTY-SET +
 * the page-tree FLATNESS, D188) + the 28th surface's ROUTE EXTENSIONS
 * (the alternates' name tables + interiors).
 *
 * THE SURFACE SELECTION (the honest-measurement discipline): the
 * worklog's three 29th-surface candidates were ALL probed on the raw
 * shape FIRST (the lesson-88 law — research/recon-s54-probe*.mjs):
 *   (a) the COLOR-SPACE layer: measured EMPTY-SET on both sides — zero
 *       ICC streams, zero named /ColorSpace table entries, zero
 *       /Default* graphics-state overrides on EVERY route. All color
 *       flows through device-space operators (the D177 color families)
 *       + pattern fills. Registered as a LAW, not a surface.
 *   (b) the PAGE-TREE INHERITANCE layer: measured FLAT on both sides —
 *       zero intermediate /Pages nodes, zero inheritable attributes
 *       (/Resources, /MediaBox, /CropBox, /Rotate, /Group) on any
 *       non-leaf node. This proves the D184 per-page census complete
 *       by construction. Registered as a LAW.
 *   (c) the font SUBSET-TABLE layer (/Widths): measured RICH — the
 *       Type3 fonts carry full /Widths advance arrays (lengths 49-254)
 *       with byte-identical values across sides; /login instead carries
 *       the Type0/CIDFontType2 DejaVu family (no /Widths — the CID
 *       descendant tables). Folded INTO the 29th surface.
 * The decisive discovery: the D184 name tables' TARGETS — the
 * ExtGState dicts, the Pattern streams (tiling + shading), the fonts —
 * are a genuinely unmeasured INTERIOR layer.
 *
 * THE ALPHA-GRID LAW (D187's instrument correction, root-caused in
 * flight): the two pipelines serialize /ca /CA alphas differently
 * (raw CSS decimals 0.05/0.1/0.5 vs 8-bit-quantized 13/255/26/255/
 * 128/255) in BOTH directions per route — the first gs census read
 * DRIFT on every route; the diff showed every pair converging on the
 * SAME Math.round(a*255) grid point (12.75→13, 5.1→5, 127.5→128,
 * 25.5→26, 38.25→38, 178.5→179) — the 8-bit composite grid. The D134
 * oklab family's SIXTH sighting, at the alpha layer: rendering-
 * identical by construction. The census maps ca/CA through the grid;
 * everything else stays byte-exact.
 *
 * THE INSTRUMENT (research/recon-s54-instrument.mjs, ported):
 *   gsInteriorCensus  — OBJECT-LEVEL (the probe-2 catch: 9 of /login's
 *     14 ExtGStates are TYPELESS — /Type is optional per PDF 32000-1
 *     Table 59, and Skia omits it; most are referenced from FORM
 *     XObjects' nested /Resources, not the page name table — only the
 *     object-level census is complete).
 *   patternInteriorCensus — /PatternType-bearing dicts: tiling
 *     (PaintType/TilingType/XStep/YStep/BBox/streamLen) + shading
 *     (ShadingType/ColorSpace/Coords/Extend/Function shape).
 *   fontWidthsCensus — every font's /Widths (the subset-metric layer:
 *     lengths + advance sums + head/tail + ToUnicode + descriptor
 *     shape), order-insensitive (the D52 law).
 *   colorSpaceEmptySet + pageTreeFlatness — the two laws.
 *
 * THE MEASURED RECORDS (generated constants below — the recon's pin
 * file, determinism verified 2x): the stable seven at FULL INTERIOR
 * PARITY on the first honest fresh measurement; the landing's animated
 * buckets (gs 33/34, tiling 6/7, shading 10/14, fonts 10/10); /demo
 * the REGISTERED SUPERSET (gs 13 vs 3, fonts 7 vs 5); the dashboard's
 * authenticated interior fingerprint (gs 18, tiling 3 — the chart
 * stripes 325x9 + 26x9 + the 1906x553 table texture, shading 4 — the
 * brand-gradient family [0.5255,0.1412,1]→[0,0.3333,1], fonts 9).
 * The alternates: five per-state interior records + the name tables
 * (default /X35, error /X36 — the banner's +1, reset /X18, signup
 * /X22, forgot /X22; /G3 + /P4 on every state).
 */

const pdfFile = (name: string) => join(tmpdir(), `s54-pin-${name}.pdf`);

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

// ---------- THE D187 INSTRUMENT (the S54 recon port) ----------
type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};
type GsEntry = {
  shape: string; smask: string;
  BM: string | null; ca: number | null; CA: number | null; LW: number | null;
};
type TilingEntry = {
  paint: number; tiling: number; x: string; y: string; bbox: string; streamLen: number;
};
type ShadingEntry = {
  shadingType: number | null; cs: string; coords: string; extend: string; fn: string;
};
type PatternInterior = {
  tilingCount: number; shadingCount: number; tiling: TilingEntry[]; shading: ShadingEntry[];
};
type FontEntry = {
  subtype: string | null; fc: number | null; lc: number | null;
  widthsLen: number; widthsSum: number | null; widthsHead: string | null; widthsTail: string | null;
  toUnicode: boolean; fdShape: string | null;
};

const qpdfJson = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".s54.json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(readFileSync(jsonFile, "utf8")) as {
    qpdf: [unknown, Record<string, QpdfObj>];
  };
};
const dictOf = (o: QpdfObj | undefined | null) => o?.value ?? o?.stream?.dict ?? null;
const val = (v: unknown) => (v as { value?: unknown } | undefined)?.value ?? v;
const sortedJson = <T,>(arr: T[]) =>
  [...arr].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

/** The ExtGState key universe (PDF 32000-1 Table 59) — /Type OPTIONAL. */
const GS_KEYS = new Set([
  "/Type", "/LW", "/LJ", "/LC", "/ML", "/D", "/RI", "/FL", "/CA", "/ca",
  "/BM", "/SMask", "/SA", "/AIS", "/TK", "/Font", "/SP", "/OP", "/op",
  "/OPM", "/BG", "/BG2", "/UCR", "/UCR2", "/TR", "/TR2", "/HT",
]);
const GS_CHAR_KEYS = ["/ca", "/CA", "/BM", "/SMask", "/LW", "/SA", "/Font", "/OP", "/op", "/D", "/TR", "/TR2", "/HT", "/BG", "/BG2"];
const looksLikeExtGState = (d: Record<string, unknown>) => {
  const keys = Object.keys(d);
  if (keys.length === 0 || !keys.every((k) => GS_KEYS.has(k))) return false;
  if (d["/Type"] != null && d["/Type"] !== "/ExtGState") return false;
  return keys.some((k) => GS_CHAR_KEYS.includes(k));
};

/** (a) The ExtGState interiors — OBJECT-LEVEL, at the ALPHA GRID (the
 *  D187 law: ca/CA mapped through Math.round(v*255) — the 8-bit
 *  composite grid where both pipelines' serializations converge). */
const gsInteriorCensus = (file: string): { count: number; entries: GsEntry[] } => {
  const objs = qpdfJson(file).qpdf[1];
  const entries: GsEntry[] = [];
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d || typeof d !== "object" || !looksLikeExtGState(d)) continue;
    const smask = d["/SMask"];
    let smaskKind = "absent";
    if (smask === "/None") smaskKind = "None";
    else if (smask != null) {
      const sv = val(smask) as Record<string, unknown> | undefined;
      smaskKind = sv && typeof sv === "object" && sv["/S"]
        ? `${String(sv["/S"])}${sv["/TR"] != null ? "+TR" : ""}`
        : "other";
    }
    const g = (v: unknown) => (typeof v === "number" ? Math.round(v * 255) : null);
    entries.push({
      shape: Object.keys(d).filter((k) => k !== "/Type").sort().join(","),
      smask: smaskKind,
      BM: (val(d["/BM"]) as string | undefined) ?? null,
      ca: g(val(d["/ca"])),
      CA: g(val(d["/CA"])),
      LW: (val(d["/LW"]) as number | undefined) ?? null,
    });
  }
  return { count: entries.length, entries: sortedJson(entries) };
};

/** (b) The Pattern interiors — tiling + shading families. */
const patternInteriorCensus = (file: string): PatternInterior => {
  const objs = qpdfJson(file).qpdf[1];
  const tiling: TilingEntry[] = [];
  const shading: ShadingEntry[] = [];
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d || typeof d !== "object" || d["/PatternType"] == null) continue;
    if (d["/PatternType"] === 1) {
      tiling.push({
        paint: val(d["/PaintType"]) as number,
        tiling: val(d["/TilingType"]) as number,
        x: JSON.stringify(val(d["/XStep"])),
        y: JSON.stringify(val(d["/YStep"])),
        bbox: JSON.stringify(val(d["/BBox"])),
        streamLen: o?.stream?.data?.length ?? 0,
      });
    } else if (d["/PatternType"] === 2) {
      const sh = val(d["/Shading"]) as Record<string, unknown> | null | undefined;
      if (!sh) { shading.push({ shadingType: null, cs: "err", coords: "", extend: "", fn: "pattern-2-no-shading" }); continue; }
      const fn = sh["/Function"];
      let fnShape = "absent";
      const fv = val(fn) as Record<string, unknown> | undefined;
      if (typeof fn === "string" && /^\d+ \d+ R$/.test(fn)) fnShape = "ref";
      else if (fv?.["/FunctionType"] === 2) fnShape = "exp";
      else if (fv?.["/FunctionType"] === 3) fnShape = `stitch-${(val(fv["/Functions"]) as unknown[] | undefined)?.length ?? 0}`;
      else if (fv?.["/FunctionType"] === 4) fnShape = "ps-calc";
      shading.push({
        shadingType: (val(sh["/ShadingType"]) as number | undefined) ?? null,
        cs: JSON.stringify(val(sh["/ColorSpace"]) ?? null),
        coords: JSON.stringify(val(sh["/Coords"]) ?? null),
        extend: JSON.stringify(val(sh["/Extend"]) ?? null),
        fn: fnShape,
      });
    }
  }
  return {
    tilingCount: tiling.length, shadingCount: shading.length,
    tiling: sortedJson(tiling), shading: sortedJson(shading),
  };
};

/** (c) The font subset-metric layer — /Widths arrays, order-insensitive. */
const fontWidthsCensus = (file: string): { count: number; fonts: FontEntry[] } => {
  const objs = qpdfJson(file).qpdf[1];
  const fonts: FontEntry[] = [];
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d || (d as { "/Type"?: string })["/Type"] !== "/Font") continue;
    const w = val(d["/Widths"]) as number[] | undefined;
    const desc = val(d["/FontDescriptor"]);
    fonts.push({
      subtype: (val(d["/Subtype"]) as string | undefined) ?? null,
      fc: (val(d["/FirstChar"]) as number | undefined) ?? null,
      lc: (val(d["/LastChar"]) as number | undefined) ?? null,
      widthsLen: Array.isArray(w) ? w.length : 0,
      widthsSum: Array.isArray(w) ? w.reduce((a, b) => a + b, 0) : null,
      widthsHead: Array.isArray(w) ? JSON.stringify(w.slice(0, 4)) : null,
      widthsTail: Array.isArray(w) ? JSON.stringify(w.slice(-3)) : null,
      toUnicode: d["/ToUnicode"] != null,
      fdShape: desc && typeof desc === "object"
        ? Object.keys(desc as Record<string, unknown>).sort().join(",")
        : desc ? "ref" : null,
    });
  }
  return { count: fonts.length, fonts: sortedJson(fonts) };
};

/** (d) The COLOR-SPACE EMPTY-SET law (D188): zero ICC streams + zero
 *  named spaces + zero /Default* overrides on every page. */
const colorSpaceEmptySet = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  let iccStreams = 0, namedSpaces = 0, defaultEntries = 0;
  for (const o of Object.values(objs)) {
    if (o?.stream?.dict?.["/Subtype"] === "/ICCBased") iccStreams++;
    const d = dictOf(o);
    if (d && (d as { "/Type"?: string })["/Type"] === "/Page") {
      const res = val(d["/Resources"]) as Record<string, unknown> | null | undefined;
      const cs = val(res?.["/ColorSpace"]) as Record<string, unknown> | null | undefined;
      if (cs && typeof cs === "object") {
        for (const k of Object.keys(cs)) {
          if (k.startsWith("/Default")) defaultEntries++;
          else namedSpaces++;
        }
      }
      const gs = val(res?.["/ExtGState"]) as Record<string, unknown> | null | undefined;
      if (gs && typeof gs === "object") {
        for (const v of Object.values(gs)) {
          const gv = val(v) as Record<string, unknown> | null | undefined;
          if (gv && typeof gv === "object" && Object.keys(gv).some((k) => k.startsWith("/Default"))) defaultEntries++;
        }
      }
    }
  }
  return { iccStreams, namedSpaces, defaultEntries };
};

/** (e) The PAGE-TREE FLATNESS law (D188): zero inheritable attributes
 *  on intermediate /Pages nodes — the D184 census complete by
 *  construction. */
const pageTreeFlatness = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  const findings: unknown[] = [];
  let intermediateNodes = 0;
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d || (d as { "/Type"?: string })["/Type"] !== "/Pages") continue;
    const kids = (val(d["/Kids"]) ?? []) as unknown[];
    let hasPageKid = false, hasPagesKid = false;
    for (const kid of kids) {
      const m = typeof kid === "string" ? kid.match(/^(\d+) (\d+) R$/) : null;
      const kd = m ? dictOf(objs[`obj:${m[1]} ${m[2]} R`]) : null;
      if (kd && (kd as { "/Type"?: string })["/Type"] === "/Page") hasPageKid = true;
      if (kd && (kd as { "/Type"?: string })["/Type"] === "/Pages") hasPagesKid = true;
    }
    if (hasPagesKid) {
      intermediateNodes++;
      const inheritable = ["/Resources", "/MediaBox", "/CropBox", "/Rotate", "/Group"]
        .filter((k) => d[k] != null);
      if (inheritable.length) findings.push({ inheritable });
    }
    if (!hasPageKid && !hasPagesKid) findings.push({ err: "no-resolvable-kids" });
  }
  return { intermediateNodes, findings };
};

// ---------- the /login state drivers (the S50-S54 pattern) ----------
const PIN_EMAIL = "s54-pin@test.local"; // 17 chars — the recon's length (the interpolation law)
const enterDefault = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.waitForTimeout(600);
};
const enterError = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.fill("#email", PIN_EMAIL);
  await page.fill("#password", "wrong-password");
  await page.click("button[type=submit]");
  await page.waitForSelector('[role="alert"]');
  await page.waitForTimeout(400);
};
const enterReset = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Forgot password\?/ }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  await page.fill("#email", PIN_EMAIL);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await page.getByRole("heading", { name: "Check your email" }).waitFor();
  await page.waitForTimeout(400);
};
const enterSignup = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Sign up/ }).click();
  await page.waitForTimeout(500);
};
const enterForgot = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Forgot password\?/ }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  await page.waitForTimeout(400);
};

// GENERATED by research/gen-s54-spec-constants.js from the S54 recon pins —
// do not hand-edit; regenerate after any re-measurement.

// ---------- the stable seven's interior records (D187, alpha-grid) ----------
const INTERIOR: Record<string, { gs: GsEntry[]; pat: PatternInterior; fonts: FontEntry[] }> = {
  "/login": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 1
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 13,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 242,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 26,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 64,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 77,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "None",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 3,
          "tiling": [],
          "shading": [
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[-132.405762,187.20007,927.40576,936.79993]",
                      "extend": "[true,true]",
                      "fn": "exp"
                },
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[0,0,448,0]",
                      "extend": "[true,true]",
                      "fn": "stitch-2"
                },
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[0,0,96,96]",
                      "extend": "[true,true]",
                      "fn": "exp"
                }
          ]
    },
    fonts: [
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          }
    ],
  },
  "/faq": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": 128,
                "LW": 2
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 204,
                "CA": 204,
                "LW": 2
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 102,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 153,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 204,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 26,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 38,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 5,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 51,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 0,
          "tiling": [],
          "shading": []
    },
    fonts: [
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 183,
                "widthsLen": 184,
                "widthsSum": 6977,
                "widthsHead": "[581,0,0,0]",
                "widthsTail": "[0,0,203]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 185,
                "widthsLen": 186,
                "widthsSum": 12068,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[204,0,279]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 185,
                "widthsLen": 186,
                "widthsSum": 19100,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[204,0,279]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 192,
                "widthsLen": 193,
                "widthsSum": 17014,
                "widthsHead": "[581,641,0,0]",
                "widthsTail": "[0,0,513]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 224,
                "widthsLen": 225,
                "widthsSum": 9575,
                "widthsHead": "[583,655,0,0]",
                "widthsTail": "[0,0,231]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 229,
                "widthsLen": 230,
                "widthsSum": 18911,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[0,0,777]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 48,
                "widthsLen": 49,
                "widthsSum": 8705,
                "widthsHead": "[582,647,0,0]",
                "widthsTail": "[563,568,654]",
                "toUnicode": true,
                "fdShape": "ref"
          }
    ],
  },
  "/privacy": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": 128,
                "LW": 2
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 204,
                "CA": 204,
                "LW": 2
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 102,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 153,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 179,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 204,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 26,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 51,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 0,
          "tiling": [],
          "shading": []
    },
    fonts: [
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 183,
                "widthsLen": 184,
                "widthsSum": 5174,
                "widthsHead": "[583,0,0,0]",
                "widthsTail": "[0,0,203]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 183,
                "widthsLen": 184,
                "widthsSum": 6977,
                "widthsHead": "[581,0,0,0]",
                "widthsTail": "[0,0,203]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 185,
                "widthsLen": 186,
                "widthsSum": 19100,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[204,0,279]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 203,
                "widthsLen": 204,
                "widthsSum": 10828,
                "widthsHead": "[582,0,0,0]",
                "widthsTail": "[0,0,484]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 224,
                "widthsLen": 225,
                "widthsSum": 21034,
                "widthsHead": "[580,0,0,0]",
                "widthsTail": "[0,0,201]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 229,
                "widthsLen": 230,
                "widthsSum": 17753,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[0,0,777]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 48,
                "widthsLen": 49,
                "widthsSum": 8705,
                "widthsHead": "[582,647,0,0]",
                "widthsTail": "[563,568,654]",
                "toUnicode": true,
                "fdShape": "ref"
          }
    ],
  },
  "/terms": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": 128,
                "LW": 2
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 204,
                "CA": 204,
                "LW": 2
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 102,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 153,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 179,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 204,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 26,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 51,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 0,
          "tiling": [],
          "shading": []
    },
    fonts: [
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 183,
                "widthsLen": 184,
                "widthsSum": 6977,
                "widthsHead": "[581,0,0,0]",
                "widthsTail": "[0,0,203]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 185,
                "widthsLen": 186,
                "widthsSum": 19100,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[204,0,279]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 226,
                "widthsLen": 227,
                "widthsSum": 11774,
                "widthsHead": "[582,0,0,0]",
                "widthsTail": "[0,0,610]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 226,
                "widthsLen": 227,
                "widthsSum": 22867,
                "widthsHead": "[580,0,0,0]",
                "widthsTail": "[201,0,602]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 226,
                "widthsLen": 227,
                "widthsSum": 7370,
                "widthsHead": "[583,0,0,0]",
                "widthsTail": "[0,0,615]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 229,
                "widthsLen": 230,
                "widthsSum": 17753,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[0,0,777]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 48,
                "widthsLen": 49,
                "widthsSum": 8705,
                "widthsHead": "[582,647,0,0]",
                "widthsTail": "[563,568,654]",
                "toUnicode": true,
                "fdShape": "ref"
          }
    ],
  },
  "/refund-policy": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": 128,
                "LW": 2
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 204,
                "CA": 204,
                "LW": 2
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 102,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 153,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 179,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 204,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 26,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 51,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 0,
          "tiling": [],
          "shading": []
    },
    fonts: [
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 183,
                "widthsLen": 184,
                "widthsSum": 6977,
                "widthsHead": "[581,0,0,0]",
                "widthsTail": "[0,0,203]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 183,
                "widthsLen": 184,
                "widthsSum": 6988,
                "widthsHead": "[583,0,0,0]",
                "widthsTail": "[0,0,203]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 185,
                "widthsLen": 186,
                "widthsSum": 19100,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[204,0,279]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 203,
                "widthsLen": 204,
                "widthsSum": 10889,
                "widthsHead": "[582,0,0,0]",
                "widthsTail": "[0,0,484]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 208,
                "widthsLen": 209,
                "widthsSum": 21944,
                "widthsHead": "[580,0,0,0]",
                "widthsTail": "[0,306,306]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 229,
                "widthsLen": 230,
                "widthsSum": 17753,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[0,0,777]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 48,
                "widthsLen": 49,
                "widthsSum": 8705,
                "widthsHead": "[582,647,0,0]",
                "widthsTail": "[563,568,654]",
                "toUnicode": true,
                "fdShape": "ref"
          }
    ],
  },
  "/accessibility": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": 128,
                "LW": 2
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 204,
                "CA": 204,
                "LW": 2
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 102,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 153,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 179,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 204,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 26,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 51,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 0,
          "tiling": [],
          "shading": []
    },
    fonts: [
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 183,
                "widthsLen": 184,
                "widthsSum": 6977,
                "widthsHead": "[581,0,0,0]",
                "widthsTail": "[0,0,203]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 183,
                "widthsLen": 184,
                "widthsSum": 7798,
                "widthsHead": "[583,655,0,0]",
                "widthsTail": "[0,0,203]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 185,
                "widthsLen": 186,
                "widthsSum": 19100,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[204,0,279]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 196,
                "widthsLen": 197,
                "widthsSum": 15641,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[0,0,333]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 212,
                "widthsLen": 213,
                "widthsSum": 20158,
                "widthsHead": "[582,647,0,0]",
                "widthsTail": "[0,323,323]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 224,
                "widthsLen": 225,
                "widthsSum": 30393,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[0,379,201]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 229,
                "widthsLen": 230,
                "widthsSum": 17753,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[0,0,777]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 48,
                "widthsLen": 49,
                "widthsSum": 8705,
                "widthsHead": "[582,647,0,0]",
                "widthsTail": "[563,568,654]",
                "toUnicode": true,
                "fdShape": "ref"
          }
    ],
  },
  "/thank-you": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 102,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 0,
          "tiling": [],
          "shading": []
    },
    fonts: [
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 183,
                "widthsLen": 184,
                "widthsSum": 6100,
                "widthsHead": "[582,0,0,0]",
                "widthsTail": "[0,0,203]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 185,
                "widthsLen": 186,
                "widthsSum": 11737,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[204,0,279]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 185,
                "widthsLen": 186,
                "widthsSum": 14742,
                "widthsHead": "[580,633,0,0]",
                "widthsTail": "[204,0,279]",
                "toUnicode": true,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type3",
                "fc": 0,
                "lc": 190,
                "widthsLen": 191,
                "widthsSum": 7909,
                "widthsHead": "[583,0,0,0]",
                "widthsTail": "[0,0,289]",
                "toUnicode": true,
                "fdShape": "ref"
          }
    ],
  },
};

// ---------- the landing's animated-family buckets (both sides) ----------
const LANDING = {
  "gsClone": 33,
  "gsLive": 34,
  "patClone": {
    "t": 6,
    "s": 10
  },
  "patLive": {
    "t": 7,
    "s": 14
  },
  "fontsClone": 10,
  "fontsLive": 10
};

// ---------- the /demo superset floor ----------
const DEMO = {
  "gsClone": 13,
  "gsLive": 3,
  "fontsClone": 7,
  "fontsLive": 5
};

// ---------- the dashboard's authenticated interior fingerprint ----------
const DASHBOARD = {
  gs: [
      {
          "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 153,
          "CA": 153,
          "LW": 2
      },
      {
          "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 179,
          "CA": 179,
          "LW": 2
      },
      {
          "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 204,
          "CA": 204,
          "LW": 2
      },
      {
          "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 255,
          "CA": 255,
          "LW": 2
      },
      {
          "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 38,
          "CA": 38,
          "LW": 1
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 102,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 128,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 13,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 153,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 179,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 204,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 255,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 26,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 3,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 38,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 5,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 51,
          "CA": null,
          "LW": null
      },
      {
          "shape": "/BM,/ca",
          "smask": "absent",
          "BM": "/Normal",
          "ca": 77,
          "CA": null,
          "LW": null
      }
  ],
  pat: {
      "tilingCount": 3,
      "shadingCount": 4,
      "tiling": [
          {
              "paint": 1,
              "tiling": 1,
              "x": "1906",
              "y": "553",
              "bbox": "[0,0,1904,551]",
              "streamLen": 80
          },
          {
              "paint": 1,
              "tiling": 1,
              "x": "26",
              "y": "9",
              "bbox": "[0,0,24,7]",
              "streamLen": 72
          },
          {
              "paint": 1,
              "tiling": 1,
              "x": "325",
              "y": "9",
              "bbox": "[0,0,323,7]",
              "streamLen": 76
          }
      ],
      "shading": [
          {
              "shadingType": 2,
              "cs": "\"/DeviceRGB\"",
              "coords": "[0,0,262,0]",
              "extend": "[true,true]",
              "fn": "exp"
          },
          {
              "shadingType": 2,
              "cs": "\"/DeviceRGB\"",
              "coords": "[0,0,28,0]",
              "extend": "[true,true]",
              "fn": "exp"
          },
          {
              "shadingType": 2,
              "cs": "\"/DeviceRGB\"",
              "coords": "[0,0,28,0]",
              "extend": "[true,true]",
              "fn": "exp"
          },
          {
              "shadingType": 2,
              "cs": "\"/DeviceRGB\"",
              "coords": "[0,0,697,0]",
              "extend": "[true,true]",
              "fn": "exp"
          }
      ]
  },
  fontsCount: 9,
};

// ---------- the alternates' interior records (the route extensions) ----------
const ALT_INTERIOR: Record<string, { gs: GsEntry[]; pat: PatternInterior; fonts: FontEntry[] }> = {
  "default": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 1
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 13,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 242,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 26,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 64,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 77,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "None",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 3,
          "tiling": [],
          "shading": [
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[-132.405762,187.20007,927.40576,936.79993]",
                      "extend": "[true,true]",
                      "fn": "exp"
                },
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[0,0,448,0]",
                      "extend": "[true,true]",
                      "fn": "stitch-2"
                },
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[0,0,96,96]",
                      "extend": "[true,true]",
                      "fn": "exp"
                }
          ]
    },
    fonts: [
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          }
    ],
  },
  "error": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 1
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 13,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 179,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 242,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 26,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 64,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 77,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "None",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 3,
          "tiling": [],
          "shading": [
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[-132.405762,187.20007,927.40576,936.79993]",
                      "extend": "[true,true]",
                      "fn": "exp"
                },
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[0,0,448,0]",
                      "extend": "[true,true]",
                      "fn": "stitch-2"
                },
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[0,0,96,96]",
                      "extend": "[true,true]",
                      "fn": "exp"
                }
          ]
    },
    fonts: [
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          }
    ],
  },
  "reset": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 1
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 179,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 242,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 64,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "None",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 2,
          "tiling": [],
          "shading": [
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[-132.405762,187.20007,927.40576,936.79993]",
                      "extend": "[true,true]",
                      "fn": "exp"
                },
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[0,0,448,0]",
                      "extend": "[true,true]",
                      "fn": "stitch-2"
                }
          ]
    },
    fonts: [
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          }
    ],
  },
  "signup": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 1
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 13,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 242,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 64,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "None",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 2,
          "tiling": [],
          "shading": [
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[-132.405762,187.20007,927.40576,936.79993]",
                      "extend": "[true,true]",
                      "fn": "exp"
                },
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[0,0,448,0]",
                      "extend": "[true,true]",
                      "fn": "stitch-2"
                }
          ]
    },
    fonts: [
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          }
    ],
  },
  "forgot": {
    gs: [
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 1
          },
          {
                "shape": "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": 255,
                "LW": 2
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 128,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 13,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 242,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 255,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/BM,/ca",
                "smask": "absent",
                "BM": "/Normal",
                "ca": 64,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "/Luminosity",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          },
          {
                "shape": "/SMask",
                "smask": "None",
                "BM": null,
                "ca": null,
                "CA": null,
                "LW": null
          }
    ],
    pat: {
          "tilingCount": 0,
          "shadingCount": 2,
          "tiling": [],
          "shading": [
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[-132.405762,187.20007,927.40576,936.79993]",
                      "extend": "[true,true]",
                      "fn": "exp"
                },
                {
                      "shadingType": 2,
                      "cs": "\"/DeviceRGB\"",
                      "coords": "[0,0,448,0]",
                      "extend": "[true,true]",
                      "fn": "stitch-2"
                }
          ]
    },
    fonts: [
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/CIDFontType2",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": false,
                "fdShape": "ref"
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          },
          {
                "subtype": "/Type0",
                "fc": null,
                "lc": null,
                "widthsLen": 0,
                "widthsSum": null,
                "widthsHead": null,
                "widthsTail": null,
                "toUnicode": true,
                "fdShape": null
          }
    ],
  },
};
// =====================================================================
// THE TWENTY-NINTH SURFACE — the resource-target interior layer (D187)
// =====================================================================
test.describe("the PDF resource-target interior layer (Session 54 — D187, the twenty-ninth surface)", () => {
  test("the stable seven at FULL INTERIOR PARITY: the gs multiset at the alpha grid + the pattern interiors + the font subset-metrics", async ({ page }) => {
    for (const [route, rec] of Object.entries(INTERIOR)) {
      await dwell(page, route);
      const f = await renderPdf(page, `int-${route.replace(/\//g, "")}`);
      const gs = gsInteriorCensus(f);
      const pat = patternInteriorCensus(f);
      const fonts = fontWidthsCensus(f);
      expect(gs.entries, `${route} gs interiors (alpha-grid)`).toEqual(rec.gs);
      expect(pat.tiling, `${route} tiling interiors`).toEqual(rec.pat.tiling);
      expect(pat.shading, `${route} shading interiors`).toEqual(rec.pat.shading);
      expect(fonts.fonts, `${route} font subset-metrics`).toEqual(rec.fonts);
    }
  });

  test("THE COLOR-SPACE EMPTY-SET LAW + THE PAGE-TREE FLATNESS LAW on every public route", async ({ page }) => {
    for (const route of [...Object.keys(INTERIOR), "/"]) {
      await dwell(page, route);
      if (route === "/") await page.waitForTimeout(1200); // the animated settle
      const f = await renderPdf(page, `law-${route.replace(/\//g, "")}`);
      // (a) zero ICC streams + zero named color spaces + zero /Default*
      //     overrides — all color is device-space operators + patterns
      expect(colorSpaceEmptySet(f), `${route} the color-space empty-set`).toEqual({
        iccStreams: 0, namedSpaces: 0, defaultEntries: 0,
      });
      // (b) zero intermediate /Pages nodes + zero inheritable attributes
      //     — the D184 per-page census complete by construction
      const pt = pageTreeFlatness(f);
      expect(pt.findings, `${route} the page-tree flatness`).toEqual([]);
      expect(pt.intermediateNodes, `${route} intermediate nodes`).toBe(0);
    }
  });

  test("the landing's animated-family buckets + the /demo SUPERSET floor + the dashboard's authenticated interior fingerprint", async ({ page }) => {
    // the landing: the animated buckets (the S38 range law at the
    // interior layer — the entrance frame allocates different objects
    // run-to-run on BOTH sides)
    await dwell(page, "/");
    await page.waitForTimeout(1600);
    const lf = await renderPdf(page, "int-landing");
    const lgs = gsInteriorCensus(lf);
    const lpat = patternInteriorCensus(lf);
    const lfonts = fontWidthsCensus(lf);
    expect(lgs.count, "landing gs count bucket").toBeGreaterThanOrEqual(LANDING.gsClone - 3);
    expect(lgs.count).toBeLessThanOrEqual(LANDING.gsClone + 3);
    expect(lpat.tilingCount, "landing tiling bucket").toBeGreaterThanOrEqual(LANDING.patClone.t - 1);
    expect(lpat.tilingCount).toBeLessThanOrEqual(LANDING.patClone.t + 1);
    expect(lpat.shadingCount, "landing shading bucket").toBeGreaterThanOrEqual(LANDING.patClone.s - 2);
    expect(lpat.shadingCount).toBeLessThanOrEqual(LANDING.patClone.s + 2);
    expect(lfonts.count, "landing fonts (count-parity)").toBe(LANDING.fontsClone);
    expect(colorSpaceEmptySet(lf), "landing the color-space empty-set").toEqual({
      iccStreams: 0, namedSpaces: 0, defaultEntries: 0,
    });

    // /demo: the REGISTERED SUPERSET at the interior layer — the clone's
    // 2 working pages vs the live shell's 16 words
    await dwell(page, "/demo");
    const df = await renderPdf(page, "int-demo");
    const dgs = gsInteriorCensus(df);
    const dfonts = fontWidthsCensus(df);
    expect(dgs.count, "/demo gs superset floor").toBeGreaterThanOrEqual(DEMO.gsClone);
    expect(dfonts.count, "/demo font superset floor").toBeGreaterThanOrEqual(DEMO.fontsClone);
    expect(colorSpaceEmptySet(df), "/demo the color-space empty-set").toEqual({
      iccStreams: 0, namedSpaces: 0, defaultEntries: 0,
    });

    // the dashboard (authenticated, own context — the context-order law)
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    const dashFile = await renderPdf(page, "int-dash");
    const dshGs = gsInteriorCensus(dashFile);
    const dshPat = patternInteriorCensus(dashFile);
    const dshFonts = fontWidthsCensus(dashFile);
    expect(dshGs.entries, "dashboard gs interiors (alpha-grid)").toEqual(DASHBOARD.gs);
    expect(dshPat.tiling, "dashboard tiling interiors — the chart stripes").toEqual(DASHBOARD.pat.tiling);
    expect(dshPat.shading, "dashboard shading interiors — the brand-gradient family").toEqual(DASHBOARD.pat.shading);
    expect(dshFonts.count, "dashboard fonts").toBe(DASHBOARD.fontsCount);
    expect(colorSpaceEmptySet(dashFile), "dashboard the color-space empty-set").toEqual({
      iccStreams: 0, namedSpaces: 0, defaultEntries: 0,
    });
    expect(pageTreeFlatness(dashFile).findings, "dashboard the page-tree flatness").toEqual([]);
  });

  test("the determinism law: the interior censuses byte-identical across re-renders (the D181 discipline at the interior layer)", async ({ page }) => {
    for (const route of ["/login", "/faq"]) {
      await dwell(page, route);
      const a = await renderPdf(page, `det-a-${route.replace(/\//g, "")}`);
      await dwell(page, route);
      const b = await renderPdf(page, `det-b-${route.replace(/\//g, "")}`);
      expect(gsInteriorCensus(b).entries, `${route} gs deterministic`).toEqual(gsInteriorCensus(a).entries);
      expect(patternInteriorCensus(b), `${route} patterns deterministic`).toEqual(patternInteriorCensus(a));
      expect(fontWidthsCensus(b).fonts, `${route} fonts deterministic`).toEqual(fontWidthsCensus(a).fonts);
    }
  });
});

// =====================================================================
// THE 28TH SURFACE'S ROUTE EXTENSIONS — the alternates' name tables +
// interiors (D188), the five /login states
// =====================================================================
test.describe("the /login alternates' interiors + name tables (Session 54 — the D184 route extensions)", () => {
  test("the five states' interior records + the per-state name tables (default /X35, error /X36, reset /X18, signup /X22, forgot /X22)", async ({ page }) => {
    const drivers: [string, (p: import("@playwright/test").Page) => Promise<void>][] = [
      ["default", enterDefault], ["error", enterError], ["reset", enterReset],
      ["signup", enterSignup], ["forgot", enterForgot],
    ];
    // the per-state name tables (the D184 extension — the names encode
    // the referenced object numbers, so the byte-parity is the per-state
    // object-allocation record at the name layer)
    const NAME_TABLES: Record<string, Record<string, { perPage: number[]; union: string[] }>> = {
      default: { "/XObject": { perPage: [1], union: ["/X35"] }, "/ExtGState": { perPage: [1], union: ["/G3"] }, "/Pattern": { perPage: [1], union: ["/P4"] } },
      error: { "/XObject": { perPage: [1], union: ["/X36"] }, "/ExtGState": { perPage: [1], union: ["/G3"] }, "/Pattern": { perPage: [1], union: ["/P4"] } },
      reset: { "/XObject": { perPage: [1], union: ["/X18"] }, "/ExtGState": { perPage: [1], union: ["/G3"] }, "/Pattern": { perPage: [1], union: ["/P4"] } },
      signup: { "/XObject": { perPage: [1], union: ["/X22"] }, "/ExtGState": { perPage: [1], union: ["/G3"] }, "/Pattern": { perPage: [1], union: ["/P4"] } },
      forgot: { "/XObject": { perPage: [1], union: ["/X22"] }, "/ExtGState": { perPage: [1], union: ["/G3"] }, "/Pattern": { perPage: [1], union: ["/P4"] } },
    };
    for (const [name, driver] of drivers) {
      await driver(page);
      const f = await renderPdf(page, `alt-${name}`);
      const gs = gsInteriorCensus(f);
      const pat = patternInteriorCensus(f);
      const fonts = fontWidthsCensus(f);
      expect(gs.entries, `${name} gs interiors (alpha-grid)`).toEqual(ALT_INTERIOR[name].gs);
      expect(pat.tiling, `${name} tiling interiors`).toEqual(ALT_INTERIOR[name].pat.tiling);
      expect(pat.shading, `${name} shading interiors`).toEqual(ALT_INTERIOR[name].pat.shading);
      expect(fonts.fonts, `${name} font subset-metrics`).toEqual(ALT_INTERIOR[name].fonts);
      expect(colorSpaceEmptySet(f), `${name} the color-space empty-set`).toEqual({
        iccStreams: 0, namedSpaces: 0, defaultEntries: 0,
      });
      expect(pageTreeFlatness(f).findings, `${name} the page-tree flatness`).toEqual([]);
      // the name tables through the page's /Resources
      const nt = altNameTables(f);
      expect(nt, `${name} resource name tables`).toEqual(NAME_TABLES[name]);
    }
  });
});

/** The per-state name tables (the D184 instrument applied to a state
 *  render — the page's OWN /Resources categories; the flatness law
 *  above proves no inheritance hides anything). */
const altNameTables = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  const out: Record<string, { perPage: number[]; union: string[] }> = {};
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d || (d as { "/Type"?: string })["/Type"] !== "/Page") continue;
    const res = val(d["/Resources"]) as Record<string, unknown> | null | undefined;
    if (!res) continue;
    for (const cat of ["/XObject", "/Font", "/ExtGState", "/Pattern"]) {
      const tbl = val(res[cat]) as Record<string, unknown> | null | undefined;
      if (!tbl || typeof tbl !== "object" || Array.isArray(tbl)) continue;
      const names = Object.keys(tbl).filter((k) => k !== "/Type").sort();
      if (names.length === 0) continue;
      out[cat] ??= { perPage: [], union: [] };
      out[cat].perPage.push(names.length);
      out[cat].union.push(...names.filter((n) => !out[cat].union.includes(n)));
    }
  }
  for (const v of Object.values(out)) {
    v.perPage.sort((a, b) => a - b);
    v.union.sort();
  }
  return out;
};
