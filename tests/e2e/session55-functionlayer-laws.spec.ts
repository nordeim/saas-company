/**
 * Session 55 — THE THIRTIETH SURFACE (D190 — the PDF /Function layer:
 * the gradient math at the function-dict granularity) + THE 29TH
 * SURFACE'S ROUTE EXTENSION (D191 — the /SMask G-stream interiors: the
 * luminosity-mask Form XObjects' own resource chains) + THE THREE LAWS
 * (D192 — the /Metadata XMP EMPTY-SET, the /PieceInfo EMPTY-SET, and
 * the tiling patterns' nested-Resources FLATNESS on the stable seven).
 *
 * A REGISTRATION session (the S45/S48/S49/S50/S52/S53/S54 pattern):
 * the recon measured BOTH sides at full parity on the first honest
 * fresh measurement — ZERO src/ changes; the pins register the record.
 *
 * THE INSTRUMENT LAWS honored:
 *  - THE INLINE-STORAGE LAW (the lesson-88 family's seventh sighting):
 *    on /login the gradient functions live INSIDE the shading pattern
 *    dicts (PatternType 2 -> /Shading -> /Function as an INLINE dict) —
 *    an object-level probe measures EMPTY; the only complete census
 *    resolves through the shading patterns AND walks the standalone
 *    objects (the landing stores 5-7 as separate objects — both shapes
 *    must be censused).
 *  - the typeless-object law (shape-based ExtGState detection, PDF
 *    32000-1 Table 59 — /Type is OPTIONAL; Skia omits it).
 *  - the SMask recursion terminates at IMAGE XObjects (the G-forms
 *    reference image masks — one level, no deeper nesting).
 *
 * THE MEASURED RECORDS (generated constants below — the recon's pin
 * file research/recon-s55-state.json, determinism verified 2x): the
 * stable seven at FULL FUNCTION + G-STREAM PARITY (/login the only
 * gradient-bearing route: 3 functions [2 exponential + 1 stitching
 * with a 2-sub chain] + 4 G-streams, all byte-identical incl. the
 * /C0 /C1 endpoint values, the /Bounds [0.5] /Encode [0,1,0,1]
 * stitching arrays, the G-forms' BBoxes + nested name tables
 * [/G3 + the 5-member ProcSet + the image XObjects] + the 84-byte
 * luminosity streams); the six content routes EMPTY-SET at both layers
 * (registered as the law: the print pipeline emits no gradient
 * functions and no soft masks on the content routes); the landing's
 * animated-family buckets (fn through 10 [clone] / 14 [live],
 * standalone 5/7, gs 10/12, nestedTiling 6/7 — the S38 range law);
 * /demo the superset floor (0/0 at both layers — the live's 16-word
 * shell); the dashboard's authenticated fingerprint (4 exponential
 * functions — the brand-gradient family [0.5255,0.1412,1] ->
 * [0,0.3333,1], 3 nested-tiling patterns). The alternates: default/
 * error carry the full 3-function + 4-G-stream set; reset 2+1; signup
 * and forgot 2+2 — all five states identical across sides.
 */
import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DEMO_EMAIL = "demo@novaai.app";
const DEMO_PASSWORD = "Demo1234!";

const pdfFile = (name: string) => join(tmpdir(), `s55-pin-${name}.pdf`);

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

// ---------- THE D190/D191 INSTRUMENT (the S55 recon port) ----------
type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};
type FnEntry = {
  k: string; dom: string; c0?: string; c1?: string; n?: string;
  bounds?: string; enc?: string; subs?: FnEntry[];
};
type GsGEntry = {
  s: string; tr: boolean; bbox: string; subtype: string; matrix: boolean;
  resCats: string; imageRefs: number; formRefs: number;
  streamLen: number; streamHead: string;
};
type LawsShape = {
  metadataStreams: number; catalogMetadataRefs: number;
  pieceInfo: number; nestedTilingResources: number;
};

const qpdfJson = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".s55.json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(readFileSync(jsonFile, "utf8")) as {
    qpdf: [unknown, Record<string, QpdfObj>];
  };
};
const dictOf = (o: QpdfObj | undefined | null) => o?.value ?? o?.stream?.dict ?? null;
const val = (v: unknown) => (v as { value?: unknown } | undefined)?.value ?? v;
const refNum = (r: unknown) =>
  typeof r === "string" ? (r.match(/^(\d+) \d+ R$/) || [])[1] : undefined;
const sortedJson = <T,>(arr: T[]) =>
  [...arr].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

/** (a) THE THIRTIETH SURFACE — one function's interior (inline dict or
 *  ref resolved): the exponential family (Domain/C0/C1/N) + the
 *  stitching family (Domain/Bounds/Encode/sub-chains). */
const fnInterior = (fnRaw: unknown, objs: Record<string, QpdfObj>): FnEntry | null => {
  let f = fnRaw as Record<string, unknown> | undefined;
  const num = refNum(val(fnRaw));
  if (num) f = dictOf(objs[`obj:${num} 0 R`]) ?? undefined;
  const d = val(f) as Record<string, unknown> | null | undefined;
  if (!d || typeof d !== "object" || d["/FunctionType"] == null) return null;
  const t = val(d["/FunctionType"]);
  if (t === 2) {
    return {
      k: "exp", dom: JSON.stringify(val(d["/Domain"])),
      c0: JSON.stringify(val(d["/C0"]) ?? null),
      c1: JSON.stringify(val(d["/C1"]) ?? null),
      n: JSON.stringify(val(d["/N"])),
    };
  }
  if (t === 3) {
    const subs = (val(d["/Functions"]) ?? []) as unknown[];
    return {
      k: "stitch", dom: JSON.stringify(val(d["/Domain"])),
      bounds: JSON.stringify(val(d["/Bounds"]) ?? null),
      enc: JSON.stringify(val(d["/Encode"]) ?? null),
      subs: (Array.isArray(subs) ? subs : [])
        .map((s) => fnInterior(s, objs))
        .filter((x): x is FnEntry => x != null),
    };
  }
  if (t === 4) return { k: "ps", dom: JSON.stringify(val(d["/Domain"])) };
  return { k: `t${String(t)}`, dom: "" };
};

/** The COMPLETE function census: through the shading patterns (the
 *  inline-storage law) + the standalone objects — order-insensitive. */
const functionCensus = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  const through: FnEntry[] = [];
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d || d["/PatternType"] !== 2) continue;
    const sh = val(d["/Shading"]) as Record<string, unknown> | null | undefined;
    if (!sh || typeof sh !== "object") continue;
    const fn = fnInterior(sh["/Function"], objs);
    if (fn) through.push(fn);
  }
  let standalone = 0;
  const standaloneFns: FnEntry[] = [];
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d || d["/FunctionType"] == null) continue;
    standalone++;
    const fn = fnInterior(d, objs);
    if (fn) standaloneFns.push(fn);
  }
  return {
    throughShading: through.length,
    standalone,
    all: sortedJson([...through, ...standaloneFns]),
  };
};

/** (b) THE 29TH EXTENSION — the /SMask G-stream interiors: the host
 *  ExtGState's /S /TR + the G-form's BBox/Subtype/Matrix + the nested
 *  resource name tables (ProcSet kept as the sorted VALUES — the
 *  index-enumeration artifact) + the stream's head bytes. */
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

const smaskGCensus = (file: string): { count: number; entries: GsGEntry[] } => {
  const objs = qpdfJson(file).qpdf[1];
  const out: GsGEntry[] = [];
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d || !looksLikeExtGState(d)) continue;
    const sm = val(d["/SMask"]) as Record<string, unknown> | null | undefined;
    if (!sm || typeof sm !== "object" || !sm["/G"]) continue;
    const gNum = refNum(val(sm["/G"]));
    if (!gNum) continue;
    const gObj = objs[`obj:${gNum} 0 R`];
    const gDict = dictOf(gObj);
    if (!gDict) continue;
    const gRes = (val(gDict["/Resources"]) ?? {}) as Record<string, unknown>;
    const cats: Record<string, unknown> = {};
    let imageRefs = 0, formRefs = 0;
    if (gRes && typeof gRes === "object") {
      for (const [cat, entries] of Object.entries(gRes)) {
        const ev = val(entries);
        if (Array.isArray(ev)) {
          cats[cat] = [...ev].sort();
        } else if (ev && typeof ev === "object") {
          cats[cat] = Object.keys(ev as Record<string, unknown>).sort();
          if (cat === "/XObject") {
            for (const r of Object.values(ev as Record<string, unknown>)) {
              const rn = refNum(val(r));
              if (!rn) continue;
              const xDict = dictOf(objs[`obj:${rn} 0 R`]);
              const st = val(xDict?.["/Subtype"]);
              if (st === "/Image") imageRefs++;
              else if (st === "/Form") formRefs++;
            }
          }
        } else {
          cats[cat] = String(ev);
        }
      }
    }
    out.push({
      s: String(val(sm["/S"])),
      tr: sm["/TR"] != null,
      bbox: JSON.stringify(val(gDict["/BBox"])),
      subtype: String(val(gDict["/Subtype"])),
      matrix: gDict["/Matrix"] != null,
      resCats: JSON.stringify(cats),
      imageRefs, formRefs,
      streamLen: gObj?.stream?.data?.length ?? 0,
      streamHead: (gObj?.stream?.data ?? "").slice(0, 44),
    });
  }
  return { count: out.length, entries: sortedJson(out) };
};

/** (c) THE THREE LAWS — the /Metadata XMP empty-set + the /PieceInfo
 *  empty-set + the tiling patterns' nested-Resources flatness count. */
const lawsCensus = (file: string): LawsShape => {
  const objs = qpdfJson(file).qpdf[1];
  let metadataStreams = 0, catalogMetadataRefs = 0, pieceInfo = 0, nestedTilingResources = 0;
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d) continue;
    if (d["/Type"] === "/Metadata" || (o?.stream && d["/Type"] === "/XML")) metadataStreams++;
    if (d["/Type"] === "/Catalog" && d["/Metadata"] != null) catalogMetadataRefs++;
    if (d["/PieceInfo"] != null) pieceInfo++;
    if (d["/PatternType"] === 1) {
      const res = val(d["/Resources"]) as Record<string, unknown> | null | undefined;
      if (res && typeof res === "object" && Object.keys(res).length > 0) nestedTilingResources++;
    }
  }
  return { metadataStreams, catalogMetadataRefs, pieceInfo, nestedTilingResources };
};

// ---------- the /login state drivers (the S50-S55 pattern) ----------
const PIN_EMAIL = "s55-pin@test.local"; // 17 chars — the recon's length (the interpolation law)
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
  await page.getByRole("heading", { name: /Create your account/ }).waitFor();
  await page.waitForTimeout(500);
};
const enterForgot = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Forgot password\?/ }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  await page.waitForTimeout(500);
};

// ---------- THE GENERATED CONSTANTS (research/gen-s55-spec-constants.js —
// the zero-transcription discipline) ----------
// ---------- the stable seven: the function + G-stream interiors ----------
const FN_STABLE: Record<string, { through: number; standalone: number; all: FnEntry[] }> = {
  "/login": { through: 3, standalone: 0, all: [
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.9451,0.9608,0.9765]",
          "c1": "[0.8863,0.9098,0.9412]",
          "n": "1"
        },
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.9725,0.9804,0.9882]",
          "c1": "[0.9451,0.9608,0.9765]",
          "n": "1"
        },
        {
          "k": "stitch",
          "dom": "[0,1]",
          "bounds": "[0.5]",
          "enc": "[0,1,0,1]",
          "subs": [
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.8863,0.9098,0.9412]",
              "c1": "[0.7961,0.8353,0.8824]",
              "n": "1"
            },
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.7961,0.8353,0.8824]",
              "c1": "[0.8863,0.9098,0.9412]",
              "n": "1"
            }
          ]
        }
      ] },
  "/faq": { through: 0, standalone: 0, all: [] },
  "/privacy": { through: 0, standalone: 0, all: [] },
  "/terms": { through: 0, standalone: 0, all: [] },
  "/refund-policy": { through: 0, standalone: 0, all: [] },
  "/accessibility": { through: 0, standalone: 0, all: [] },
  "/thank-you": { through: 0, standalone: 0, all: [] },
};

// ---------- the stable seven: the /SMask G-stream interiors ----------
const GS_STABLE: Record<string, { count: number; entries: GsGEntry[] }> = {
  "/login": { count: 4, entries: [
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[18,15,1783,2711]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X5\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxNzY1IDAgMCAtMjY5NiAxOCAyNzExIGNtCjAgMCAw"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[317,2070,1485,2238]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X14\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxMTY4IDAgMCAtMTY4IDMxNyAyMjM4IGNtCjAgMCAw"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[694,244,1107,657]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X28\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQo0MTMgMCAwIC00MTMgNjk0IDY1NyBjbQowIDAgMCBS"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[736,268,1065,597]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X24\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQozMjkgMCAwIC0zMjkgNzM2IDU5NyBjbQowIDAgMCBS"
        }
      ] },
  "/faq": { count: 0, entries: [] },
  "/privacy": { count: 0, entries: [] },
  "/terms": { count: 0, entries: [] },
  "/refund-policy": { count: 0, entries: [] },
  "/accessibility": { count: 0, entries: [] },
  "/thank-you": { count: 0, entries: [] },
};

// ---------- the landing's animated-family buckets (the S38 range law) ----------
const LANDING = { fnThrough: 10, fnStandalone: 5, gs: 10, nestedTiling: 6 };

// ---------- the /demo floor (function + G-stream layers) ----------
const DEMO = { fnThrough: 0, fnStandalone: 0, gs: 0 };

// ---------- the dashboard's authenticated fingerprint ----------
const DASHBOARD = { fn: [
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.5255,0.1412,1]",
          "c1": "[0,0.3333,1]",
          "n": "1"
        },
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.5255,0.1412,1]",
          "c1": "[0,0.3333,1]",
          "n": "1"
        },
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.5255,0.1412,1]",
          "c1": "[0,0.3333,1]",
          "n": "1"
        },
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.5255,0.1412,1]",
          "c1": "[0,0.3333,1]",
          "n": "1"
        }
      ], nestedTiling: 3 };

// ---------- the five /login alternates ----------
const ALT: Record<string, { fn: FnEntry[]; gsCount: number; gs: GsGEntry[] }> = {
  default: { fn: [
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.9451,0.9608,0.9765]",
          "c1": "[0.8863,0.9098,0.9412]",
          "n": "1"
        },
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.9725,0.9804,0.9882]",
          "c1": "[0.9451,0.9608,0.9765]",
          "n": "1"
        },
        {
          "k": "stitch",
          "dom": "[0,1]",
          "bounds": "[0.5]",
          "enc": "[0,1,0,1]",
          "subs": [
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.8863,0.9098,0.9412]",
              "c1": "[0.7961,0.8353,0.8824]",
              "n": "1"
            },
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.7961,0.8353,0.8824]",
              "c1": "[0.8863,0.9098,0.9412]",
              "n": "1"
            }
          ]
        }
      ], gsCount: 4, gs: [
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[18,15,1783,2711]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X5\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxNzY1IDAgMCAtMjY5NiAxOCAyNzExIGNtCjAgMCAw"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[317,2070,1485,2238]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X14\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxMTY4IDAgMCAtMTY4IDMxNyAyMjM4IGNtCjAgMCAw"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[694,244,1107,657]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X28\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQo0MTMgMCAwIC00MTMgNjk0IDY1NyBjbQowIDAgMCBS"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[736,268,1065,597]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X24\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQozMjkgMCAwIC0zMjkgNzM2IDU5NyBjbQowIDAgMCBS"
        }
      ] },
  error: { fn: [
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.9451,0.9608,0.9765]",
          "c1": "[0.8863,0.9098,0.9412]",
          "n": "1"
        },
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.9725,0.9804,0.9882]",
          "c1": "[0.9451,0.9608,0.9765]",
          "n": "1"
        },
        {
          "k": "stitch",
          "dom": "[0,1]",
          "bounds": "[0.5]",
          "enc": "[0,1,0,1]",
          "subs": [
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.8863,0.9098,0.9412]",
              "c1": "[0.7961,0.8353,0.8824]",
              "n": "1"
            },
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.7961,0.8353,0.8824]",
              "c1": "[0.8863,0.9098,0.9412]",
              "n": "1"
            }
          ]
        }
      ], gsCount: 4, gs: [
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[18,15,1783,2942]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X5\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxNzY1IDAgMCAtMjkyNyAxOCAyOTQyIGNtCjAgMCAw"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[317,2301,1485,2469]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X14\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxMTY4IDAgMCAtMTY4IDMxNyAyNDY5IGNtCjAgMCAw"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[694,244,1107,657]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X28\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQo0MTMgMCAwIC00MTMgNjk0IDY1NyBjbQowIDAgMCBS"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[736,267,1065,596]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X24\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQozMjkgMCAwIC0zMjkgNzM2IDU5NiBjbQowIDAgMCBS"
        }
      ] },
  reset: { fn: [
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.9725,0.9804,0.9882]",
          "c1": "[0.9451,0.9608,0.9765]",
          "n": "1"
        },
        {
          "k": "stitch",
          "dom": "[0,1]",
          "bounds": "[0.5]",
          "enc": "[0,1,0,1]",
          "subs": [
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.8863,0.9098,0.9412]",
              "c1": "[0.7961,0.8353,0.8824]",
              "n": "1"
            },
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.7961,0.8353,0.8824]",
              "c1": "[0.8863,0.9098,0.9412]",
              "n": "1"
            }
          ]
        }
      ], gsCount: 1, gs: [
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[18,15,1783,1624]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X5\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxNzY1IDAgMCAtMTYwOSAxOCAxNjI0IGNtCjAgMCAw"
        }
      ] },
  signup: { fn: [
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.9725,0.9804,0.9882]",
          "c1": "[0.9451,0.9608,0.9765]",
          "n": "1"
        },
        {
          "k": "stitch",
          "dom": "[0,1]",
          "bounds": "[0.5]",
          "enc": "[0,1,0,1]",
          "subs": [
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.8863,0.9098,0.9412]",
              "c1": "[0.7961,0.8353,0.8824]",
              "n": "1"
            },
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.7961,0.8353,0.8824]",
              "c1": "[0.8863,0.9098,0.9412]",
              "n": "1"
            }
          ]
        }
      ], gsCount: 2, gs: [
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[18,15,1783,1848]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X5\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxNzY1IDAgMCAtMTgzMyAxOCAxODQ4IGNtCjAgMCAw"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[317,1319,1485,1475]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X14\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxMTY4IDAgMCAtMTU2IDMxNyAxNDc1IGNtCjAgMCAw"
        }
      ] },
  forgot: { fn: [
        {
          "k": "exp",
          "dom": "[0,1]",
          "c0": "[0.9725,0.9804,0.9882]",
          "c1": "[0.9451,0.9608,0.9765]",
          "n": "1"
        },
        {
          "k": "stitch",
          "dom": "[0,1]",
          "bounds": "[0.5]",
          "enc": "[0,1,0,1]",
          "subs": [
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.8863,0.9098,0.9412]",
              "c1": "[0.7961,0.8353,0.8824]",
              "n": "1"
            },
            {
              "k": "exp",
              "dom": "[0,1]",
              "c0": "[0.7961,0.8353,0.8824]",
              "c1": "[0.8863,0.9098,0.9412]",
              "n": "1"
            }
          ]
        }
      ], gsCount: 2, gs: [
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[18,15,1783,1548]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X5\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxNzY1IDAgMCAtMTUzMyAxOCAxNTQ4IGNtCjAgMCAw"
        },
        {
          "s": "/Luminosity",
          "tr": false,
          "bbox": "[317,1019,1485,1175]",
          "subtype": "/Form",
          "matrix": false,
          "resCats": "{\"/ExtGState\":[\"/G3\"],\"/ProcSet\":[\"/ImageB\",\"/ImageC\",\"/ImageI\",\"/PDF\",\"/Text\"],\"/XObject\":[\"/X15\"]}",
          "imageRefs": 1,
          "formRefs": 0,
          "streamLen": 84,
          "streamHead": "cQoxMTY4IDAgMCAtMTU2IDMxNyAxMTc1IGNtCjAgMCAw"
        }
      ] },
};



// =====================================================================
// THE THIRTIETH SURFACE + THE 29TH EXTENSION + THE THREE LAWS
// (Session 55 — D190/D191/D192)
// =====================================================================
test.describe("the PDF function layer + the SMask G-stream interiors (Session 55 — D190/D191, the thirtieth surface + the 29th's route extension)", () => {
  test("the stable seven at FULL FUNCTION + G-STREAM PARITY: the gradient math + the luminosity-mask forms' resource chains", async ({ page }) => {
    for (const route of ["/login", "/faq", "/privacy", "/terms", "/refund-policy", "/accessibility", "/thank-you"]) {
      await dwell(page, route);
      const f = await renderPdf(page, `fn-${route.replace(/\//g, "")}`);
      const fn = functionCensus(f);
      const gs = smaskGCensus(f);
      expect(fn.throughShading, `${route} functions through the shadings`).toBe(FN_STABLE[route].through);
      expect(fn.standalone, `${route} standalone function objects`).toBe(FN_STABLE[route].standalone);
      expect(fn.all, `${route} the function interiors (C0/C1 endpoints, N exponents, Bounds/Encode stitching arrays)`).toEqual(FN_STABLE[route].all);
      expect(gs.count, `${route} the SMask G-stream count`).toBe(GS_STABLE[route].count);
      expect(gs.entries, `${route} the G-stream interiors (BBox + nested name tables + stream head)`).toEqual(GS_STABLE[route].entries);
    }
  });

  test("THE THREE LAWS on every public route: the /Metadata XMP EMPTY-SET + the /PieceInfo EMPTY-SET + the tiling nested-Resources FLATNESS", async ({ page }) => {
    for (const route of ["/login", "/faq", "/privacy", "/terms", "/refund-policy", "/accessibility", "/thank-you", "/", "/demo", "/thank-you"]) {
      await dwell(page, route);
      if (route === "/") await page.waitForTimeout(800); // the animated-family dwell
      const f = await renderPdf(page, `laws-${route.replace(/\//g, "")}`);
      const laws = lawsCensus(f);
      expect(laws.metadataStreams, `${route} the XMP /Metadata streams (empty-set law)`).toBe(0);
      expect(laws.catalogMetadataRefs, `${route} the catalog /Metadata refs (empty-set law)`).toBe(0);
      expect(laws.pieceInfo, `${route} the /PieceInfo entries (empty-set law)`).toBe(0);
      // the tiling nested-resources flatness: ZERO on the stable seven
      // (the content routes' tiling patterns are self-contained); the
      // landing's animated bucket + the dashboard's chart stripes the
      // registered exceptions (below)
      if (route !== "/") {
        expect(laws.nestedTilingResources, `${route} the tiling patterns' nested /Resources (flatness law)`).toBe(0);
      } else {
        expect(laws.nestedTilingResources, "the landing's nested-tiling animated bucket").toBeGreaterThanOrEqual(LANDING.nestedTiling - 1);
        expect(laws.nestedTilingResources).toBeLessThanOrEqual(LANDING.nestedTiling + 1);
      }
    }
  });

  test("the landing's animated-family buckets + the /demo floor + the dashboard's authenticated fingerprint", async ({ page }) => {
    // the landing: the animated buckets (the S38 range law at the
    // function layer — the entrance frames allocate different objects
    // run-to-run on BOTH sides)
    await dwell(page, "/");
    await page.waitForTimeout(1600);
    const lf = await renderPdf(page, "fn-landing");
    const lfn = functionCensus(lf);
    const lgs = smaskGCensus(lf);
    expect(lfn.throughShading, "landing fn-through animated bucket").toBeGreaterThanOrEqual(LANDING.fnThrough - 3);
    expect(lfn.throughShading).toBeLessThanOrEqual(LANDING.fnThrough + 4);
    expect(lfn.standalone, "landing fn-standalone animated bucket").toBeGreaterThanOrEqual(LANDING.fnStandalone - 2);
    expect(lfn.standalone).toBeLessThanOrEqual(LANDING.fnStandalone + 2);
    expect(lgs.count, "landing gs animated bucket").toBeGreaterThanOrEqual(LANDING.gs - 2);
    expect(lgs.count).toBeLessThanOrEqual(LANDING.gs + 2);
    expect(lawsCensus(lf).metadataStreams, "landing the XMP empty-set").toBe(0);
    expect(lawsCensus(lf).pieceInfo, "landing the PieceInfo empty-set").toBe(0);

    // /demo: the superset floor at the function + G-stream layers —
    // BOTH sides measure zero (the live's 16-word shell carries no
    // gradients; the clone's 2 working pages' mockup gradients don't
    // reach the print pipeline)
    await dwell(page, "/demo");
    const df = await renderPdf(page, "fn-demo");
    const dfn = functionCensus(df);
    const dgs = smaskGCensus(df);
    expect(dfn.throughShading + dfn.standalone, "/demo the function floor").toBe(DEMO.fnThrough + DEMO.fnStandalone);
    expect(dgs.count, "/demo the G-stream floor").toBe(DEMO.gs);
    expect(lawsCensus(df).metadataStreams, "/demo the XMP empty-set").toBe(0);
    expect(lawsCensus(df).pieceInfo, "/demo the PieceInfo empty-set").toBe(0);

    // the dashboard (authenticated, own context — the context-order law)
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    const dashFile = await renderPdf(page, "fn-dash");
    const dfn2 = functionCensus(dashFile);
    expect(dfn2.all, "dashboard the authenticated function fingerprint — the brand-gradient family").toEqual(DASHBOARD.fn);
    expect(dfn2.throughShading, "dashboard fn-through").toBe(DASHBOARD.fn.length);
    expect(lawsCensus(dashFile).nestedTilingResources, "dashboard the nested-tiling count (the chart stripes + the table texture)").toBe(DASHBOARD.nestedTiling);
    expect(lawsCensus(dashFile).metadataStreams, "dashboard the XMP empty-set").toBe(0);
    expect(lawsCensus(dashFile).pieceInfo, "dashboard the PieceInfo empty-set").toBe(0);
  });

  test("the determinism law: the function + G-stream censuses byte-identical across re-renders (the D181 discipline)", async ({ page }) => {
    for (const route of ["/login", "/faq"]) {
      await dwell(page, route);
      const a = await renderPdf(page, `det-a-${route.replace(/\//g, "")}`);
      await dwell(page, route);
      const b = await renderPdf(page, `det-b-${route.replace(/\//g, "")}`);
      expect(functionCensus(b).all, `${route} functions deterministic`).toEqual(functionCensus(a).all);
      expect(smaskGCensus(b).entries, `${route} G-streams deterministic`).toEqual(smaskGCensus(a).entries);
      expect(lawsCensus(b), `${route} laws deterministic`).toEqual(lawsCensus(a));
    }
  });
});

// =====================================================================
// THE ALTERNATES — the five /login states' function + G-stream records
// (Session 55 — the D190/D191 route extensions)
// =====================================================================
test.describe("the /login alternates' function + G-stream records (Session 55)", () => {
  test("the five states' function interiors + G-stream interiors (default/error the full 3+4 set; reset 2+1; signup/forgot 2+2)", async ({ page }) => {
    const drivers: [string, (p: import("@playwright/test").Page) => Promise<void>][] = [
      ["default", enterDefault], ["error", enterError], ["reset", enterReset],
      ["signup", enterSignup], ["forgot", enterForgot],
    ];
    for (const [name, driver] of drivers) {
      await driver(page);
      const f = await renderPdf(page, `fn-alt-${name}`);
      const fn = functionCensus(f);
      const gs = smaskGCensus(f);
      expect(fn.all, `${name} the function interiors`).toEqual(ALT[name].fn);
      expect(gs.count, `${name} the G-stream count`).toBe(ALT[name].gsCount);
      expect(gs.entries, `${name} the G-stream interiors`).toEqual(ALT[name].gs);
      expect(lawsCensus(f).metadataStreams, `${name} the XMP empty-set`).toBe(0);
      expect(lawsCensus(f).pieceInfo, `${name} the PieceInfo empty-set`).toBe(0);
      expect(lawsCensus(f).nestedTilingResources, `${name} the tiling nested-flatness`).toBe(0);
    }
  });
});

