/**
 * Session 58 — THE THIRTY-THIRD SURFACE (D198 — the content streams'
 * TEXT-POSITION layer: every Td/Tm/TJ positioning record tokenized, the
 * glyph runs positioned, and the pages compared at the LINE level —
 * (y, x0, runs, glyph-hash), the blocks merged per baseline so the ±2
 * BT/Tm page-layer re-blocking family (the D125 engine structure, stable
 * per side) absorbs into the honest comparable census) + THE LOGIN-LOCAL
 * H2-H6 TRACKING FIX (D199 — the reference's SPA bundle ships a base
 * 'h1..h6 { letter-spacing: .02em }' rule but its LOGIN bundle does not:
 * the three alternate-state h2s computed +0.48px here vs normal on the
 * live, measured at the print text-position layer as +3.84..4.57pt x-origin
 * shifts with identical glyph hashes + the per-glyph 16/19/19-run
 * decompositions vs the live's single merged run; the fix — the
 * login-local h2-h6 pin — converged the alternates to FULL line-level
 * parity and the S52 D182 record to the merged truth) + THE FOUR LAWS
 * (D200-D203: the /HT empty-set law [no halftone key in any
 * resources-referenced /ExtGState on any route, both sides]; the
 * /OpenAction + /PageMode null law [the catalog view layer]; the ICC
 * empty-set law [zero ICC streams/refs on all five /login alternates,
 * both sides — the S56 shape-law detection extended]; the gs VALUE-layer
 * parity law [the /SA /LW /LC /LJ /ML values at exact multiset parity on
 * every route]) + THE MUTATION COLUMN (D204 — the dashboard's print
 * payload tracks the data: +1 shading pattern per new chart row until the
 * CHART_ROWS ceiling, objects growing deterministically, gs/tilings
 * stable, the YStep fractional-pixel family, A===A2 at every step).
 *
 * THE INSTRUMENT LAWS honored:
 *  - THE HEX-GLYPH LAW (the lesson-88 family, 9th sighting): the glyph
 *    strings are HEX (<01> Tj) — a paren-only regex reads every block as
 *    empty; both forms parsed.
 *  - THE BASE64-STREAM LAW (the S57 record): the qpdf-JSON stream data is
 *    base64 for binary streams; decode with the PDF-operator
 *    disambiguation.
 *  - THE PIN-YOUR-OWN-INPUT LAW (the D182 record): the login-family
 *    censuses are INTERPOLATION-DEPENDENT — the pins bind the spec's own
 *    s52-pin@test.local input (the same constant the session52 spec
 *    binds).
 *  - THE FRESH-CONTEXT LAW (the S57 record): the public renders run on
 *    clean contexts; the authenticated dashboard renders LAST on its own.
 *
 * THE MEASURED RECORDS (generated constants below — research/
 * gen-s58-spec-constants.js from the cached renders, research/renders/):
 * the six deterministic content routes at FULL LINE-LEVEL PARITY with the
 * live (23/6/36/39/34/64 lines, every (y, x0, runs, glyphs) equal); the
 * landing's 23-line STABLE CORE (the entrance-gated below-fold family
 * bucketed — a varying pair paints on some renders); the alternates
 * reset/signup/forgot at FULL parity POST-FIX (6/9/7 lines); the
 * default/error pair carrying the two registered ±1 run-split lines
 * (y=701: 7v6 runs, y=348: 1v2 runs — same glyph hashes, the D177
 * segmentation family); the 404's y=586 line carrying the registered
 * 2-space-glyph emission delta (58v60 runs, the live emits B7 spaces at
 * the quote boundaries — pdftotext byte-identical, the D161 adjudication
 * family); /demo the 27-line superset floor over the live's 4-line shell.
 */
import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

const DEMO_EMAIL = "demo@novaai.app";
const DEMO_PASSWORD = "Demo1234!";
const PIN_EMAIL = "s52-pin@test.local";

const pdfFile = (name: string) => join(tmpdir(), `s58-pin-${name}.pdf`);

const dwell = async (page: import("@playwright/test").Page, route: string) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.waitForTimeout(route === "/" ? 1600 : 900);
};

const renderPdf = async (page: import("@playwright/test").Page, name: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(name);
  writeFileSync(file, buf);
  return file;
};

// ---------- THE D198 INSTRUMENT (the text-position layer) ----------
type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};

const OPS_RE =
  /(?:^|\s)(?:q|Q|cm|re|W|W\*|n|f|f\*|B|B\*|b|b\*|S|s|c|v|y|h|m|l|rg|RG|k|K|g|G|gs|scn|SCN|sc|SC|sh|BT|ET|Tj|TJ|Tf|Td|TD|Tm|Do)(?:\s|$)/;
const qpdfJson = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".s58.json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 512 * 1024 * 1024,
  });
  return JSON.parse(readFileSync(jsonFile, "utf8")) as {
    qpdf: [unknown, Record<string, QpdfObj>];
  };
};
const dictOf = (o: QpdfObj | undefined | null) => o?.value ?? o?.stream?.dict ?? null;
const val = (v: unknown) => (v as { value?: unknown } | undefined)?.value ?? v;
const refNum = (r: unknown) =>
  typeof r === "string" ? (r.match(/^(\d+) \d+ R$/) || [])[1] : undefined;
const sha = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);

/** THE BASE64-STREAM LAW: decode only when the plain form has NO pdf
 * operators AND the decoded form DOES (a plain ASCII stream is also
 * base64-alphabet clean). */
const decodeStreamData = (s: string) => {
  if (typeof s !== "string" || s.length === 0) return "";
  if (OPS_RE.test(s)) return s;
  try {
    const d = Buffer.from(s, "base64").toString("latin1");
    if (OPS_RE.test(d)) return d;
  } catch {
    /* not base64 */
  }
  return s;
};

type GlyphRun = { x: number; y: number; size: number; hex: string };

/** THE HEX-GLYPH LAW: the glyph strings are HEX — parse both <hex> and
 * (literal) forms; track the text line offset through Tm/Td/TD/T* and
 * collect every positioned run. */
const parseText = (data: string): GlyphRun[] => {
  const runs: GlyphRun[] = [];
  let size = 0, tx = 0, ty = 0, lead = 0;
  const tokRe = /(<[0-9A-Fa-f\s]*>)|(\((?:\\.|[^\\()])*\))|(-?\d*\.?\d+)|(\/[^\s/\[\]<>()]+)|(\[)|(\])|([A-Za-z*'"]+)/g;
  const stack: { t: string; v: string | number }[] = [];
  let m;
  while ((m = tokRe.exec(data)) !== null) {
    if (m[1]) { stack.push({ t: "hex", v: m[1] }); continue; }
    if (m[2]) { stack.push({ t: "lit", v: m[2] }); continue; }
    if (m[3]) { stack.push({ t: "num", v: parseFloat(m[3]) }); continue; }
    if (m[4]) { stack.push({ t: "name", v: m[4] }); continue; }
    if (m[5] || m[6]) continue;
    const op = m[7];
    if (op === "BT") { tx = 0; ty = 0; stack.length = 0; continue; }
    if (op === "ET") { stack.length = 0; continue; }
    if (op === "Tf") { const sz = stack[stack.length - 1]; if (sz?.t === "num") size = sz.v as number; stack.length = 0; continue; }
    if (op === "Tm") {
      const nums = stack.filter((t) => t.t === "num").map((t) => t.v as number);
      if (nums.length >= 6) { tx = nums[4]; ty = nums[5]; if (nums[3]) size = Math.abs(nums[3]); }
      stack.length = 0; continue;
    }
    if (op === "Td" || op === "TD") {
      const nums = stack.filter((t) => t.t === "num").map((t) => t.v as number);
      if (nums.length >= 2) { tx += nums[0]; ty += nums[1]; if (op === "TD") lead = -nums[1]; }
      stack.length = 0; continue;
    }
    if (op === "T*") { ty -= lead; stack.length = 0; continue; }
    if (op === "Tj") {
      const a = stack[stack.length - 1];
      if (a?.t === "hex" || a?.t === "lit")
        runs.push({ x: tx, y: ty, size, hex: a.t === "hex" ? String(a.v).replace(/[\s<>]/g, "") : Buffer.from(String(a.v).slice(1, -1), "latin1").toString("hex") });
      stack.length = 0; continue;
    }
    if (op === "TJ") {
      for (const t of stack) {
        if (t.t === "hex" || t.t === "lit")
          runs.push({ x: tx, y: ty, size, hex: t.t === "hex" ? String(t.v).replace(/[\s<>]/g, "") : Buffer.from(String(t.v).slice(1, -1), "latin1").toString("hex") });
      }
      stack.length = 0; continue;
    }
    stack.length = 0;
  }
  return runs;
};

type LineRec = { y: number; size: number; x0: number; runs: number; glyphs: string };

/** THE LINE-LEVEL RECORD: the runs merged per (y, size) baseline — the
 * re-blocking family absorbed; the honest comparable census. */
const lineRecords = (streams: string[]): LineRec[] => {
  const all: GlyphRun[] = [];
  for (const data of streams) all.push(...parseText(data));
  const byLine = new Map<string, GlyphRun[]>();
  for (const r of all) {
    const key = `${Math.round(r.y * 10) / 10}|${Math.round(r.size * 10) / 10}`;
    if (!byLine.has(key)) byLine.set(key, []);
    byLine.get(key)!.push(r);
  }
  const lines = [...byLine.entries()].map(([, rs]) => ({
    y: Math.round(rs[0].y * 100) / 100,
    size: Math.round(rs[0].size * 100) / 100,
    x0: Math.round(Math.min(...rs.map((r) => r.x)) * 100) / 100,
    runs: rs.length,
    glyphs: sha(rs.map((r) => r.hex).join("")),
  }));
  lines.sort((a, b) => b.y - a.y || a.x0 - b.x0);
  return lines;
};

const streamSets = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  const pages: string[] = [];
  const forms: string[] = [];
  for (const key of Object.keys(objs)) {
    const o = objs[key];
    const d = dictOf(o);
    if (!d) continue;
    const t = d["/Type"] ? val(d["/Type"]) : null;
    const st = d["/Subtype"] ? val(d["/Subtype"]) : null;
    if (t === "/Page") {
      const c = val(d["/Contents"]);
      const refs = Array.isArray(c) ? c : c ? [c] : [];
      for (const r of refs) {
        const n = refNum(typeof r === "object" ? JSON.stringify(r) : r);
        const sd = n ? objs[`obj:${n} 0 R`] : null;
        if (sd?.stream?.data) pages.push(decodeStreamData(String(sd.stream.data)));
      }
    } else if (st === "/Form" && o?.stream?.data) {
      forms.push(decodeStreamData(String(o.stream.data)));
    }
  }
  return { pages, forms };
};

// ---------- THE D200/D203 INSTRUMENTS (the gs + ICC layers) ----------
const gsRows = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  const rows: string[] = [];
  const seen = new Set<string>();
  const walk = (d: Record<string, unknown> | null) => {
    const res = val(d?.["/Resources"]) as Record<string, unknown> | null;
    if (!res || typeof res !== "object") return;
    const gs = val(res["/ExtGState"]) as Record<string, unknown> | null;
    if (!gs || typeof gs !== "object") return;
    for (const ref of Object.values(gs)) {
      const n = refNum(typeof ref === "object" ? JSON.stringify(ref) : ref);
      if (!n) continue;
      const key = `obj:${n} 0 R`;
      if (seen.has(key)) continue;
      seen.add(key);
      const g = dictOf(objs[key]) as Record<string, unknown> | null;
      if (!g) continue;
      rows.push(
        Object.keys(g).sort().join(",") +
          "|" +
          ["SA", "LW", "LC", "LJ", "ML", "HT"]
            .map((k) => (g["/" + k] !== undefined ? JSON.stringify(val(g["/" + k])) : "absent"))
            .join(","),
      );
    }
  };
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d) continue;
    const t = d["/Type"] ? val(d["/Type"]) : null;
    const st = d["/Subtype"] ? val(d["/Subtype"]) : null;
    if (t === "/Page" || st === "/Form") walk(d as Record<string, unknown>);
  }
  return rows.sort();
};

const iccRow = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  let images = 0, icc = 0, refs = 0;
  const seen = new Set<string>();
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d || (d["/Subtype"] ? val(d["/Subtype"]) : null) !== "/Image") continue;
    images++;
    const cs = val(d["/ColorSpace"]) as unknown[] | null;
    if (Array.isArray(cs) && val(cs[0]) === "/ICCBased") {
      const n = refNum(typeof cs[1] === "object" ? JSON.stringify(cs[1]) : cs[1]);
      if (n) {
        refs++;
        if (!seen.has(n)) {
          seen.add(n);
          icc++;
        }
      }
    }
  }
  return { images, icc, refs };
};

// ---------- THE D201 INSTRUMENT (the catalog view layer) ----------
const catalogCensus = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  let catalog: Record<string, unknown> | null = null;
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (d && d["/Type"] && val(d["/Type"]) === "/Catalog") {
      catalog = d as Record<string, unknown>;
      break;
    }
  }
  if (!catalog) return null;
  const vp = catalog["/ViewerPreferences"] ? val(catalog["/ViewerPreferences"]) : null;
  const vpDict = vp && typeof vp === "object" && !Array.isArray(vp) ? (vp as Record<string, unknown>) : null;
  return {
    keys: Object.keys(catalog).sort(),
    openAction: catalog["/OpenAction"] !== undefined ? JSON.stringify(val(catalog["/OpenAction"])) : null,
    pageMode: catalog["/PageMode"] !== undefined ? JSON.stringify(val(catalog["/PageMode"])) : null,
    viewerPrefs: vpDict
      ? JSON.stringify(Object.fromEntries(Object.entries(vpDict).map(([k, v]) => [k, val(v)])))
      : null,
  };
};

// ---------- THE D204 INSTRUMENT (the mutation columns) ----------
const mutationColumns = (file: string) => {
  const objs = qpdfJson(file).qpdf[1];
  let grads = 0;
  const tilings: { xstep: string; ystep: string; len: number }[] = [];
  const gsSeen = new Set<string>();
  const walkRes = (d: Record<string, unknown> | null) => {
    const res = val(d?.["/Resources"]) as Record<string, unknown> | null;
    if (!res || typeof res !== "object") return;
    const gs = val(res["/ExtGState"]) as Record<string, unknown> | null;
    if (!gs || typeof gs !== "object") return;
    for (const ref of Object.values(gs)) {
      const n = refNum(typeof ref === "object" ? JSON.stringify(ref) : ref);
      if (n) gsSeen.add(n);
    }
  };
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if (!d) continue;
    if (d["/Shading"] !== undefined && d["/PatternType"] !== undefined) grads++;
    if (val(d["/PatternType"]) === 1) {
      const data = o.stream?.data ? Buffer.from(o.stream.data, "base64").toString("latin1") : "";
      tilings.push({
        xstep: JSON.stringify(val(d["/XStep"])),
        ystep: JSON.stringify(val(d["/YStep"])),
        len: data.length,
      });
    }
    const t = d["/Type"] ? val(d["/Type"]) : null;
    const st = d["/Subtype"] ? val(d["/Subtype"]) : null;
    if (t === "/Page" || st === "/Form") walkRes(d as Record<string, unknown>);
  }
  tilings.sort((a, b) => a.len - b.len);
  return { objects: Object.keys(objs).length, grads, gs: gsSeen.size, tilings };
};

// ---------- the /login state drivers (the S52/S57 patterns; THE
// PIN-YOUR-OWN-INPUT LAW — the s52-pin@test.local constant) ----------
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
const PAGES_LINES = {
 "/faq": [
  {
   "y": 1257,
   "size": 1,
   "x0": 24,
   "runs": 32,
   "glyphs": "6f2a70fda65e"
  },
  {
   "y": 1159,
   "size": 1,
   "x0": 516.75,
   "runs": 6,
   "glyphs": "b99925238954"
  },
  {
   "y": 1139,
   "size": 1,
   "x0": 516.75,
   "runs": 6,
   "glyphs": "c4232aa85603"
  },
  {
   "y": 1103,
   "size": 1,
   "x0": 432,
   "runs": 10,
   "glyphs": "93eb783a0369"
  },
  {
   "y": 1087,
   "size": 1,
   "x0": 695.25,
   "runs": 12,
   "glyphs": "81558e23d13f"
  },
  {
   "y": 1071,
   "size": 1,
   "x0": 432,
   "runs": 25,
   "glyphs": "ae3f64bf2e54"
  },
  {
   "y": 1052,
   "size": 1,
   "x0": 686.25,
   "runs": 11,
   "glyphs": "43b757ebdeed"
  },
  {
   "y": 1039,
   "size": 1,
   "x0": 432,
   "runs": 20,
   "glyphs": "4d7fbd591116"
  },
  {
   "y": 1036,
   "size": 1,
   "x0": 686.25,
   "runs": 12,
   "glyphs": "9759e40e134b"
  },
  {
   "y": 1020,
   "size": 1,
   "x0": 686.25,
   "runs": 7,
   "glyphs": "bd01c7856b2b"
  },
  {
   "y": 1007,
   "size": 1,
   "x0": 432,
   "runs": 22,
   "glyphs": "90d444eae27e"
  },
  {
   "y": 1004,
   "size": 1,
   "x0": 686.25,
   "runs": 14,
   "glyphs": "8968bb289be1"
  },
  {
   "y": 999,
   "size": 1,
   "x0": 24,
   "runs": 44,
   "glyphs": "e08d900075cc"
  },
  {
   "y": 971,
   "size": 1,
   "x0": 432,
   "runs": 27,
   "glyphs": "28b2262f25b1"
  },
  {
   "y": 698,
   "size": 1,
   "x0": 62.5,
   "runs": 41,
   "glyphs": "1bb116dcd4c7"
  },
  {
   "y": 620,
   "size": 1,
   "x0": 62.5,
   "runs": 25,
   "glyphs": "340a99a3a2ab"
  },
  {
   "y": 542,
   "size": 1,
   "x0": 62.5,
   "runs": 37,
   "glyphs": "4e65fd1ae0f1"
  },
  {
   "y": 464,
   "size": 1,
   "x0": 62.5,
   "runs": 33,
   "glyphs": "2f12768d22fe"
  },
  {
   "y": 386,
   "size": 1,
   "x0": 62.5,
   "runs": 30,
   "glyphs": "bab3e39025fb"
  },
  {
   "y": 276,
   "size": 1,
   "x0": 141,
   "runs": 62,
   "glyphs": "5ebd5834c775"
  },
  {
   "y": 232,
   "size": 1,
   "x0": 79.3,
   "runs": 28,
   "glyphs": "6194fea4f619"
  },
  {
   "y": 172,
   "size": 1,
   "x0": 383.39,
   "runs": 3,
   "glyphs": "94862a821edd"
  },
  {
   "y": 41,
   "size": 1,
   "x0": 558.03,
   "runs": 28,
   "glyphs": "d2831af7fb7d"
  }
 ],
 "/thank-you": [
  {
   "y": 737,
   "size": 1,
   "x0": 335,
   "runs": 12,
   "glyphs": "ef5273ab5a3d"
  },
  {
   "y": 667,
   "size": 1,
   "x0": 182,
   "runs": 69,
   "glyphs": "3489d8ad1132"
  },
  {
   "y": 612,
   "size": 1,
   "x0": 208.5,
   "runs": 47,
   "glyphs": "a94c936f275f"
  },
  {
   "y": 584,
   "size": 1,
   "x0": 189.5,
   "runs": 51,
   "glyphs": "70a5c6d894b7"
  },
  {
   "y": 540,
   "size": 1,
   "x0": 265.22,
   "runs": 11,
   "glyphs": "4049c2df3494"
  },
  {
   "y": 492,
   "size": 1,
   "x0": 296.63,
   "runs": 7,
   "glyphs": "a52376daaf5b"
  }
 ],
 "/privacy": [
  {
   "y": 1325,
   "size": 1,
   "x0": 24,
   "runs": 32,
   "glyphs": "6f2a70fda65e"
  },
  {
   "y": 1223,
   "size": 1,
   "x0": 516.75,
   "runs": 6,
   "glyphs": "b99925238954"
  },
  {
   "y": 1203,
   "size": 1,
   "x0": 432,
   "runs": 16,
   "glyphs": "a4be66b9063b"
  },
  {
   "y": 1187,
   "size": 1,
   "x0": 695.25,
   "runs": 12,
   "glyphs": "81558e23d13f"
  },
  {
   "y": 1171,
   "size": 1,
   "x0": 432,
   "runs": 25,
   "glyphs": "ae3f64bf2e54"
  },
  {
   "y": 1152,
   "size": 1,
   "x0": 686.25,
   "runs": 11,
   "glyphs": "43b757ebdeed"
  },
  {
   "y": 1139,
   "size": 1,
   "x0": 432,
   "runs": 20,
   "glyphs": "4d7fbd591116"
  },
  {
   "y": 1136,
   "size": 1,
   "x0": 686.25,
   "runs": 12,
   "glyphs": "9759e40e134b"
  },
  {
   "y": 1120,
   "size": 1,
   "x0": 686.25,
   "runs": 7,
   "glyphs": "bd01c7856b2b"
  },
  {
   "y": 1107,
   "size": 1,
   "x0": 432,
   "runs": 22,
   "glyphs": "90d444eae27e"
  },
  {
   "y": 1104,
   "size": 1,
   "x0": 686.25,
   "runs": 14,
   "glyphs": "8968bb289be1"
  },
  {
   "y": 1099,
   "size": 1,
   "x0": 24,
   "runs": 44,
   "glyphs": "e08d900075cc"
  },
  {
   "y": 1071,
   "size": 1,
   "x0": 432,
   "runs": 27,
   "glyphs": "28b2262f25b1"
  },
  {
   "y": 928,
   "size": 1,
   "x0": 24,
   "runs": 5,
   "glyphs": "ba7ad2e7023c"
  },
  {
   "y": 902,
   "size": 1,
   "x0": 24,
   "runs": 101,
   "glyphs": "8e7ace170f2b"
  },
  {
   "y": 876,
   "size": 1,
   "x0": 24,
   "runs": 99,
   "glyphs": "118274027045"
  },
  {
   "y": 850,
   "size": 1,
   "x0": 24,
   "runs": 103,
   "glyphs": "dd6db3cef078"
  },
  {
   "y": 824,
   "size": 1,
   "x0": 24,
   "runs": 107,
   "glyphs": "f749c39e6129"
  },
  {
   "y": 798,
   "size": 1,
   "x0": 24,
   "runs": 104,
   "glyphs": "614bd1ae4db1"
  },
  {
   "y": 756,
   "size": 1,
   "x0": 24,
   "runs": 37,
   "glyphs": "c4639205819c"
  },
  {
   "y": 684,
   "size": 1,
   "x0": 24,
   "runs": 104,
   "glyphs": "6748aeac4e34"
  },
  {
   "y": 658,
   "size": 1,
   "x0": 24,
   "runs": 104,
   "glyphs": "ea70ff261830"
  },
  {
   "y": 616,
   "size": 1,
   "x0": 24,
   "runs": 98,
   "glyphs": "95eb00831f58"
  },
  {
   "y": 590,
   "size": 1,
   "x0": 24,
   "runs": 102,
   "glyphs": "74c675fe6df4"
  },
  {
   "y": 564,
   "size": 1,
   "x0": 24,
   "runs": 106,
   "glyphs": "1e3fa921e1d2"
  },
  {
   "y": 538,
   "size": 1,
   "x0": 24,
   "runs": 108,
   "glyphs": "0e9abf9968ff"
  },
  {
   "y": 496,
   "size": 1,
   "x0": 24,
   "runs": 27,
   "glyphs": "374d55da152f"
  },
  {
   "y": 424,
   "size": 1,
   "x0": 24,
   "runs": 47,
   "glyphs": "6863859d7377"
  },
  {
   "y": 398,
   "size": 1,
   "x0": 24,
   "runs": 100,
   "glyphs": "43abb1948f1a"
  },
  {
   "y": 372,
   "size": 1,
   "x0": 24,
   "runs": 98,
   "glyphs": "819b1dc6a17a"
  },
  {
   "y": 346,
   "size": 1,
   "x0": 24,
   "runs": 99,
   "glyphs": "811559013457"
  },
  {
   "y": 320,
   "size": 1,
   "x0": 24,
   "runs": 105,
   "glyphs": "7af39ac1ba09"
  },
  {
   "y": 294,
   "size": 1,
   "x0": 24,
   "runs": 103,
   "glyphs": "672cd597fa31"
  },
  {
   "y": 207,
   "size": 1,
   "x0": 24,
   "runs": 18,
   "glyphs": "6a662f8f2728"
  },
  {
   "y": 168,
   "size": 1,
   "x0": 24,
   "runs": 14,
   "glyphs": "226dcce7c7f5"
  },
  {
   "y": 41,
   "size": 1,
   "x0": 558.03,
   "runs": 28,
   "glyphs": "d2831af7fb7d"
  }
 ],
 "/terms": [
  {
   "y": 1433,
   "size": 1,
   "x0": 24,
   "runs": 32,
   "glyphs": "6f2a70fda65e"
  },
  {
   "y": 1331,
   "size": 1,
   "x0": 516.75,
   "runs": 6,
   "glyphs": "b99925238954"
  },
  {
   "y": 1311,
   "size": 1,
   "x0": 432,
   "runs": 16,
   "glyphs": "a4be66b9063b"
  },
  {
   "y": 1295,
   "size": 1,
   "x0": 695.25,
   "runs": 12,
   "glyphs": "81558e23d13f"
  },
  {
   "y": 1279,
   "size": 1,
   "x0": 432,
   "runs": 25,
   "glyphs": "ae3f64bf2e54"
  },
  {
   "y": 1260,
   "size": 1,
   "x0": 686.25,
   "runs": 11,
   "glyphs": "43b757ebdeed"
  },
  {
   "y": 1247,
   "size": 1,
   "x0": 432,
   "runs": 20,
   "glyphs": "4d7fbd591116"
  },
  {
   "y": 1244,
   "size": 1,
   "x0": 686.25,
   "runs": 12,
   "glyphs": "9759e40e134b"
  },
  {
   "y": 1228,
   "size": 1,
   "x0": 686.25,
   "runs": 7,
   "glyphs": "bd01c7856b2b"
  },
  {
   "y": 1215,
   "size": 1,
   "x0": 432,
   "runs": 22,
   "glyphs": "90d444eae27e"
  },
  {
   "y": 1212,
   "size": 1,
   "x0": 686.25,
   "runs": 14,
   "glyphs": "8968bb289be1"
  },
  {
   "y": 1207,
   "size": 1,
   "x0": 24,
   "runs": 44,
   "glyphs": "e08d900075cc"
  },
  {
   "y": 1179,
   "size": 1,
   "x0": 432,
   "runs": 27,
   "glyphs": "28b2262f25b1"
  },
  {
   "y": 1022,
   "size": 1,
   "x0": 24,
   "runs": 38,
   "glyphs": "f67d9bfbfed7"
  },
  {
   "y": 996,
   "size": 1,
   "x0": 24,
   "runs": 101,
   "glyphs": "2eaf329de24c"
  },
  {
   "y": 970,
   "size": 1,
   "x0": 24,
   "runs": 102,
   "glyphs": "1567d6119478"
  },
  {
   "y": 944,
   "size": 1,
   "x0": 24,
   "runs": 99,
   "glyphs": "dd8e04d8f7a1"
  },
  {
   "y": 918,
   "size": 1,
   "x0": 24,
   "runs": 99,
   "glyphs": "231284d4f5fe"
  },
  {
   "y": 876,
   "size": 1,
   "x0": 24,
   "runs": 35,
   "glyphs": "ed83a24dad96"
  },
  {
   "y": 804,
   "size": 1,
   "x0": 24,
   "runs": 40,
   "glyphs": "03013e82907d"
  },
  {
   "y": 778,
   "size": 1,
   "x0": 24,
   "runs": 110,
   "glyphs": "62ef07ab2e19"
  },
  {
   "y": 752,
   "size": 1,
   "x0": 24,
   "runs": 103,
   "glyphs": "af8a6c3b276f"
  },
  {
   "y": 710,
   "size": 1,
   "x0": 24,
   "runs": 94,
   "glyphs": "03cd98966a86"
  },
  {
   "y": 684,
   "size": 1,
   "x0": 24,
   "runs": 95,
   "glyphs": "7cdf8c6127fa"
  },
  {
   "y": 658,
   "size": 1,
   "x0": 24,
   "runs": 94,
   "glyphs": "22332f26c16e"
  },
  {
   "y": 616,
   "size": 1,
   "x0": 24,
   "runs": 78,
   "glyphs": "52fd309f4ee6"
  },
  {
   "y": 590,
   "size": 1,
   "x0": 24,
   "runs": 105,
   "glyphs": "7532aba66f13"
  },
  {
   "y": 564,
   "size": 1,
   "x0": 24,
   "runs": 101,
   "glyphs": "55f5d5789952"
  },
  {
   "y": 538,
   "size": 1,
   "x0": 24,
   "runs": 103,
   "glyphs": "572076edc833"
  },
  {
   "y": 496,
   "size": 1,
   "x0": 24,
   "runs": 31,
   "glyphs": "38a26edae25c"
  },
  {
   "y": 424,
   "size": 1,
   "x0": 24,
   "runs": 40,
   "glyphs": "ee23d527d098"
  },
  {
   "y": 398,
   "size": 1,
   "x0": 24,
   "runs": 101,
   "glyphs": "a8d0cc412ab7"
  },
  {
   "y": 372,
   "size": 1,
   "x0": 24,
   "runs": 100,
   "glyphs": "5b57f9985bd0"
  },
  {
   "y": 346,
   "size": 1,
   "x0": 24,
   "runs": 99,
   "glyphs": "95eb37ca8bcc"
  },
  {
   "y": 320,
   "size": 1,
   "x0": 24,
   "runs": 104,
   "glyphs": "bb4c5457857e"
  },
  {
   "y": 294,
   "size": 1,
   "x0": 24,
   "runs": 103,
   "glyphs": "672cd597fa31"
  },
  {
   "y": 207,
   "size": 1,
   "x0": 24,
   "runs": 18,
   "glyphs": "6a662f8f2728"
  },
  {
   "y": 168,
   "size": 1,
   "x0": 24,
   "runs": 18,
   "glyphs": "ea211db9233b"
  },
  {
   "y": 41,
   "size": 1,
   "x0": 558.03,
   "runs": 28,
   "glyphs": "d2831af7fb7d"
  }
 ],
 "/refund-policy": [
  {
   "y": 1257,
   "size": 1,
   "x0": 24,
   "runs": 32,
   "glyphs": "6f2a70fda65e"
  },
  {
   "y": 1159,
   "size": 1,
   "x0": 516.75,
   "runs": 6,
   "glyphs": "b99925238954"
  },
  {
   "y": 1139,
   "size": 1,
   "x0": 516.75,
   "runs": 6,
   "glyphs": "c4232aa85603"
  },
  {
   "y": 1109,
   "size": 1,
   "x0": 432,
   "runs": 10,
   "glyphs": "93eb783a0369"
  },
  {
   "y": 1093,
   "size": 1,
   "x0": 695.25,
   "runs": 12,
   "glyphs": "81558e23d13f"
  },
  {
   "y": 1077,
   "size": 1,
   "x0": 432,
   "runs": 25,
   "glyphs": "ae3f64bf2e54"
  },
  {
   "y": 1058,
   "size": 1,
   "x0": 686.25,
   "runs": 11,
   "glyphs": "43b757ebdeed"
  },
  {
   "y": 1045,
   "size": 1,
   "x0": 432,
   "runs": 20,
   "glyphs": "4d7fbd591116"
  },
  {
   "y": 1042,
   "size": 1,
   "x0": 686.25,
   "runs": 12,
   "glyphs": "9759e40e134b"
  },
  {
   "y": 1026,
   "size": 1,
   "x0": 686.25,
   "runs": 7,
   "glyphs": "bd01c7856b2b"
  },
  {
   "y": 1013,
   "size": 1,
   "x0": 432,
   "runs": 22,
   "glyphs": "90d444eae27e"
  },
  {
   "y": 1010,
   "size": 1,
   "x0": 686.25,
   "runs": 14,
   "glyphs": "8968bb289be1"
  },
  {
   "y": 1005,
   "size": 1,
   "x0": 24,
   "runs": 44,
   "glyphs": "e08d900075cc"
  },
  {
   "y": 977,
   "size": 1,
   "x0": 432,
   "runs": 27,
   "glyphs": "28b2262f25b1"
  },
  {
   "y": 834,
   "size": 1,
   "x0": 24,
   "runs": 15,
   "glyphs": "d4f4ceb085ee"
  },
  {
   "y": 808,
   "size": 1,
   "x0": 24,
   "runs": 106,
   "glyphs": "52a718a0ac26"
  },
  {
   "y": 782,
   "size": 1,
   "x0": 24,
   "runs": 105,
   "glyphs": "bebfbfb4e03e"
  },
  {
   "y": 740,
   "size": 1,
   "x0": 24,
   "runs": 36,
   "glyphs": "098124754200"
  },
  {
   "y": 668,
   "size": 1,
   "x0": 24,
   "runs": 46,
   "glyphs": "67258f4eeaae"
  },
  {
   "y": 642,
   "size": 1,
   "x0": 24,
   "runs": 101,
   "glyphs": "7e0211d90509"
  },
  {
   "y": 616,
   "size": 1,
   "x0": 24,
   "runs": 104,
   "glyphs": "9352d9c46960"
  },
  {
   "y": 590,
   "size": 1,
   "x0": 24,
   "runs": 102,
   "glyphs": "7e562896d278"
  },
  {
   "y": 564,
   "size": 1,
   "x0": 24,
   "runs": 98,
   "glyphs": "db8faf5400e9"
  },
  {
   "y": 538,
   "size": 1,
   "x0": 24,
   "runs": 100,
   "glyphs": "a805d45c901b"
  },
  {
   "y": 496,
   "size": 1,
   "x0": 24,
   "runs": 26,
   "glyphs": "9a9ea92331ff"
  },
  {
   "y": 424,
   "size": 1,
   "x0": 24,
   "runs": 35,
   "glyphs": "ab139b90ec60"
  },
  {
   "y": 398,
   "size": 1,
   "x0": 24,
   "runs": 98,
   "glyphs": "2bca7ac078e8"
  },
  {
   "y": 372,
   "size": 1,
   "x0": 24,
   "runs": 102,
   "glyphs": "e95fd17779d2"
  },
  {
   "y": 346,
   "size": 1,
   "x0": 24,
   "runs": 99,
   "glyphs": "811559013457"
  },
  {
   "y": 320,
   "size": 1,
   "x0": 24,
   "runs": 104,
   "glyphs": "a7a210b622c7"
  },
  {
   "y": 294,
   "size": 1,
   "x0": 24,
   "runs": 103,
   "glyphs": "672cd597fa31"
  },
  {
   "y": 207,
   "size": 1,
   "x0": 24,
   "runs": 18,
   "glyphs": "6a662f8f2728"
  },
  {
   "y": 168,
   "size": 1,
   "x0": 24,
   "runs": 13,
   "glyphs": "7f4a0fad61e5"
  },
  {
   "y": 41,
   "size": 1,
   "x0": 558.03,
   "runs": 28,
   "glyphs": "d2831af7fb7d"
  }
 ],
 "/accessibility": [
  {
   "y": 2381,
   "size": 1,
   "x0": 24,
   "runs": 32,
   "glyphs": "6f2a70fda65e"
  },
  {
   "y": 2283,
   "size": 1,
   "x0": 516.75,
   "runs": 6,
   "glyphs": "b99925238954"
  },
  {
   "y": 2263,
   "size": 1,
   "x0": 516.75,
   "runs": 6,
   "glyphs": "c4232aa85603"
  },
  {
   "y": 2231,
   "size": 1,
   "x0": 432,
   "runs": 10,
   "glyphs": "93eb783a0369"
  },
  {
   "y": 2215,
   "size": 1,
   "x0": 695.25,
   "runs": 12,
   "glyphs": "81558e23d13f"
  },
  {
   "y": 2199,
   "size": 1,
   "x0": 432,
   "runs": 25,
   "glyphs": "ae3f64bf2e54"
  },
  {
   "y": 2180,
   "size": 1,
   "x0": 686.25,
   "runs": 11,
   "glyphs": "43b757ebdeed"
  },
  {
   "y": 2167,
   "size": 1,
   "x0": 432,
   "runs": 20,
   "glyphs": "4d7fbd591116"
  },
  {
   "y": 2164,
   "size": 1,
   "x0": 686.25,
   "runs": 12,
   "glyphs": "9759e40e134b"
  },
  {
   "y": 2148,
   "size": 1,
   "x0": 686.25,
   "runs": 7,
   "glyphs": "bd01c7856b2b"
  },
  {
   "y": 2135,
   "size": 1,
   "x0": 432,
   "runs": 22,
   "glyphs": "90d444eae27e"
  },
  {
   "y": 2132,
   "size": 1,
   "x0": 686.25,
   "runs": 14,
   "glyphs": "8968bb289be1"
  },
  {
   "y": 2127,
   "size": 1,
   "x0": 24,
   "runs": 44,
   "glyphs": "e08d900075cc"
  },
  {
   "y": 2099,
   "size": 1,
   "x0": 432,
   "runs": 27,
   "glyphs": "28b2262f25b1"
  },
  {
   "y": 1956,
   "size": 1,
   "x0": 24,
   "runs": 62,
   "glyphs": "67d6c6d820ad"
  },
  {
   "y": 1926,
   "size": 1,
   "x0": 24,
   "runs": 48,
   "glyphs": "647768ab130c"
  },
  {
   "y": 1896,
   "size": 1,
   "x0": 24,
   "runs": 51,
   "glyphs": "77800ca83e9a"
  },
  {
   "y": 1866,
   "size": 1,
   "x0": 24,
   "runs": 39,
   "glyphs": "452c5b449825"
  },
  {
   "y": 1824,
   "size": 1,
   "x0": 24,
   "runs": 64,
   "glyphs": "3a9245a82cbb"
  },
  {
   "y": 1798,
   "size": 1,
   "x0": 24,
   "runs": 103,
   "glyphs": "b6bcc886e08a"
  },
  {
   "y": 1756,
   "size": 1,
   "x0": 24,
   "runs": 33,
   "glyphs": "963b7c6963dc"
  },
  {
   "y": 1684,
   "size": 1,
   "x0": 24,
   "runs": 59,
   "glyphs": "7aa2c264f1fc"
  },
  {
   "y": 1658,
   "size": 1,
   "x0": 24,
   "runs": 103,
   "glyphs": "b8d59e5ca052"
  },
  {
   "y": 1632,
   "size": 1,
   "x0": 24,
   "runs": 107,
   "glyphs": "ee9afed17abc"
  },
  {
   "y": 1606,
   "size": 1,
   "x0": 24,
   "runs": 108,
   "glyphs": "8e72764dae89"
  },
  {
   "y": 1580,
   "size": 1,
   "x0": 24,
   "runs": 103,
   "glyphs": "1fc770cab255"
  },
  {
   "y": 1554,
   "size": 1,
   "x0": 24,
   "runs": 102,
   "glyphs": "4681de6858cb"
  },
  {
   "y": 1512,
   "size": 1,
   "x0": 24,
   "runs": 9,
   "glyphs": "fedc00f42c1b"
  },
  {
   "y": 1480,
   "size": 1,
   "x0": 24,
   "runs": 59,
   "glyphs": "a8a58af7c8e2"
  },
  {
   "y": 1408,
   "size": 1,
   "x0": 24,
   "runs": 94,
   "glyphs": "76957292b5c0"
  },
  {
   "y": 1382,
   "size": 1,
   "x0": 24,
   "runs": 107,
   "glyphs": "548742d25477"
  },
  {
   "y": 1356,
   "size": 1,
   "x0": 24,
   "runs": 105,
   "glyphs": "8dfc3d8be996"
  },
  {
   "y": 1314,
   "size": 1,
   "x0": 24,
   "runs": 42,
   "glyphs": "16346f1c574b"
  },
  {
   "y": 1282,
   "size": 1,
   "x0": 24,
   "runs": 58,
   "glyphs": "6918c19953d4"
  },
  {
   "y": 1210,
   "size": 1,
   "x0": 47,
   "runs": 62,
   "glyphs": "c9b8d51614ed"
  },
  {
   "y": 1176,
   "size": 1,
   "x0": 47,
   "runs": 37,
   "glyphs": "2b4b3bd303ba"
  },
  {
   "y": 1142,
   "size": 1,
   "x0": 47,
   "runs": 68,
   "glyphs": "592a2075fc89"
  },
  {
   "y": 1116,
   "size": 1,
   "x0": 47,
   "runs": 32,
   "glyphs": "bb0f9b719fc1"
  },
  {
   "y": 1082,
   "size": 1,
   "x0": 47,
   "runs": 58,
   "glyphs": "77484abb9605"
  },
  {
   "y": 1048,
   "size": 1,
   "x0": 47,
   "runs": 41,
   "glyphs": "8c16302529b5"
  },
  {
   "y": 1014,
   "size": 1,
   "x0": 47,
   "runs": 28,
   "glyphs": "ae84dba9676c"
  },
  {
   "y": 980,
   "size": 1,
   "x0": 47,
   "runs": 74,
   "glyphs": "abad0b5531fb"
  },
  {
   "y": 938,
   "size": 1,
   "x0": 24,
   "runs": 65,
   "glyphs": "4bd00f174484"
  },
  {
   "y": 912,
   "size": 1,
   "x0": 24,
   "runs": 98,
   "glyphs": "0748dad4d42e"
  },
  {
   "y": 886,
   "size": 1,
   "x0": 24,
   "runs": 107,
   "glyphs": "479f29283f4d"
  },
  {
   "y": 860,
   "size": 1,
   "x0": 24,
   "runs": 108,
   "glyphs": "cc802bf81045"
  },
  {
   "y": 818,
   "size": 1,
   "x0": 24,
   "runs": 38,
   "glyphs": "e0376cbe1a45"
  },
  {
   "y": 746,
   "size": 1,
   "x0": 24,
   "runs": 58,
   "glyphs": "632713a3103d"
  },
  {
   "y": 720,
   "size": 1,
   "x0": 24,
   "runs": 103,
   "glyphs": "f04a1322477b"
  },
  {
   "y": 694,
   "size": 1,
   "x0": 24,
   "runs": 107,
   "glyphs": "68cc1219233a"
  },
  {
   "y": 652,
   "size": 1,
   "x0": 24,
   "runs": 25,
   "glyphs": "f141378a5514"
  },
  {
   "y": 580,
   "size": 1,
   "x0": 24,
   "runs": 39,
   "glyphs": "b9bb9d481d22"
  },
  {
   "y": 554,
   "size": 1,
   "x0": 24,
   "runs": 101,
   "glyphs": "4ca58ccf886d"
  },
  {
   "y": 512,
   "size": 1,
   "x0": 24,
   "runs": 57,
   "glyphs": "ce13ee0389d9"
  },
  {
   "y": 470,
   "size": 1,
   "x0": 24,
   "runs": 23,
   "glyphs": "cff137f54d5b"
  },
  {
   "y": 398,
   "size": 1,
   "x0": 24,
   "runs": 6,
   "glyphs": "fea737d5302c"
  },
  {
   "y": 372,
   "size": 1,
   "x0": 24,
   "runs": 105,
   "glyphs": "b53b4a4f3254"
  },
  {
   "y": 330,
   "size": 1,
   "x0": 24,
   "runs": 39,
   "glyphs": "4dbc325cfec0"
  },
  {
   "y": 304,
   "size": 1,
   "x0": 24,
   "runs": 102,
   "glyphs": "d438d059087e"
  },
  {
   "y": 262,
   "size": 1,
   "x0": 24,
   "runs": 20,
   "glyphs": "51958a3dfd17"
  },
  {
   "y": 236,
   "size": 1,
   "x0": 24,
   "runs": 107,
   "glyphs": "bc70852e3cd0"
  },
  {
   "y": 210,
   "size": 1,
   "x0": 24,
   "runs": 107,
   "glyphs": "3b32c6d9fca1"
  },
  {
   "y": 168,
   "size": 1,
   "x0": 24,
   "runs": 23,
   "glyphs": "cff137f54d5b"
  },
  {
   "y": 41,
   "size": 1,
   "x0": 558.03,
   "runs": 39,
   "glyphs": "145686a1ad4f"
  }
 ]
};

const LANDING_CORE = [
 {
  "y": 8783,
  "size": 1,
  "x0": 24,
  "runs": 32,
  "glyphs": "6f2a70fda65e"
 },
 {
  "y": 8681,
  "size": 1,
  "x0": 516.75,
  "runs": 6,
  "glyphs": "b99925238954"
 },
 {
  "y": 8661,
  "size": 1,
  "x0": 432,
  "runs": 16,
  "glyphs": "a4be66b9063b"
 },
 {
  "y": 8645,
  "size": 1,
  "x0": 695.25,
  "runs": 12,
  "glyphs": "81558e23d13f"
 },
 {
  "y": 8629,
  "size": 1,
  "x0": 432,
  "runs": 25,
  "glyphs": "ae3f64bf2e54"
 },
 {
  "y": 8610,
  "size": 1,
  "x0": 686.25,
  "runs": 11,
  "glyphs": "43b757ebdeed"
 },
 {
  "y": 8597,
  "size": 1,
  "x0": 432,
  "runs": 20,
  "glyphs": "4d7fbd591116"
 },
 {
  "y": 8594,
  "size": 1,
  "x0": 686.25,
  "runs": 12,
  "glyphs": "9759e40e134b"
 },
 {
  "y": 8578,
  "size": 1,
  "x0": 686.25,
  "runs": 7,
  "glyphs": "bd01c7856b2b"
 },
 {
  "y": 8565,
  "size": 1,
  "x0": 432,
  "runs": 22,
  "glyphs": "90d444eae27e"
 },
 {
  "y": 8562,
  "size": 1,
  "x0": 686.25,
  "runs": 14,
  "glyphs": "8968bb289be1"
 },
 {
  "y": 8557,
  "size": 1,
  "x0": 24,
  "runs": 44,
  "glyphs": "e08d900075cc"
 },
 {
  "y": 8529,
  "size": 1,
  "x0": 432,
  "runs": 27,
  "glyphs": "28b2262f25b1"
 },
 {
  "y": 4835,
  "size": 1,
  "x0": 68,
  "runs": 26,
  "glyphs": "c9304b63a762"
 },
 {
  "y": 4791,
  "size": 1,
  "x0": 68,
  "runs": 25,
  "glyphs": "341b831d069b"
 },
 {
  "y": 4730,
  "size": 1,
  "x0": 24,
  "runs": 44,
  "glyphs": "2da4fa4a3f08"
 },
 {
  "y": 4704,
  "size": 1,
  "x0": 24,
  "runs": 47,
  "glyphs": "841bbf361651"
 },
 {
  "y": 4678,
  "size": 1,
  "x0": 24,
  "runs": 36,
  "glyphs": "1c2e1f9e5a03"
 },
 {
  "y": 4636,
  "size": 1,
  "x0": 24,
  "runs": 11,
  "glyphs": "4e137c89e49a"
 },
 {
  "y": 4596,
  "size": 1,
  "x0": 24,
  "runs": 16,
  "glyphs": "d08537a45691"
 },
 {
  "y": 4531,
  "size": 1,
  "x0": 57,
  "runs": 18,
  "glyphs": "92f56bf87cd9"
 },
 {
  "y": 2838,
  "size": 1,
  "x0": 116.33,
  "runs": 31,
  "glyphs": "80cafb48de13"
 },
 {
  "y": 41,
  "size": 1,
  "x0": 558.03,
  "runs": 94,
  "glyphs": "ba781b982e2a"
 }
];

const L404_LINES = [
 {
  "y": 692,
  "size": 1,
  "x0": 381,
  "runs": 7,
  "glyphs": "7c73268edfda"
 },
 {
  "y": 612,
  "size": 1,
  "x0": 355.5,
  "runs": 12,
  "glyphs": "390bdf380007"
 },
 {
  "y": 586,
  "size": 1,
  "x0": 176.5,
  "runs": 58,
  "glyphs": "97bc0072970f"
 },
 {
  "y": 548,
  "size": 1,
  "x0": 309.13,
  "runs": 14,
  "glyphs": "ff45f59ce767"
 },
 {
  "y": 479,
  "size": 1,
  "x0": 330.33,
  "runs": 3,
  "glyphs": "bd8af8270662"
 }
];

const DEMO_LINES = [
 {
  "y": 1325,
  "size": 1,
  "x0": 24,
  "runs": 32,
  "glyphs": "6f2a70fda65e"
 },
 {
  "y": 1223,
  "size": 1,
  "x0": 516.75,
  "runs": 6,
  "glyphs": "b99925238954"
 },
 {
  "y": 1203,
  "size": 1,
  "x0": 432,
  "runs": 16,
  "glyphs": "a4be66b9063b"
 },
 {
  "y": 1187,
  "size": 1,
  "x0": 695.25,
  "runs": 12,
  "glyphs": "81558e23d13f"
 },
 {
  "y": 1171,
  "size": 1,
  "x0": 432,
  "runs": 25,
  "glyphs": "ae3f64bf2e54"
 },
 {
  "y": 1152,
  "size": 1,
  "x0": 686.25,
  "runs": 11,
  "glyphs": "43b757ebdeed"
 },
 {
  "y": 1139,
  "size": 1,
  "x0": 432,
  "runs": 20,
  "glyphs": "4d7fbd591116"
 },
 {
  "y": 1136,
  "size": 1,
  "x0": 686.25,
  "runs": 12,
  "glyphs": "9759e40e134b"
 },
 {
  "y": 1113,
  "size": 1,
  "x0": 686.25,
  "runs": 7,
  "glyphs": "bd01c7856b2b"
 },
 {
  "y": 1100,
  "size": 1,
  "x0": 432,
  "runs": 22,
  "glyphs": "90d444eae27e"
 },
 {
  "y": 1097,
  "size": 1,
  "x0": 686.25,
  "runs": 14,
  "glyphs": "8968bb289be1"
 },
 {
  "y": 1092,
  "size": 1,
  "x0": 24,
  "runs": 44,
  "glyphs": "e08d900075cc"
 },
 {
  "y": 1064,
  "size": 1,
  "x0": 432,
  "runs": 27,
  "glyphs": "28b2262f25b1"
 },
 {
  "y": 869,
  "size": 1,
  "x0": 346,
  "runs": 14,
  "glyphs": "99ba0adedb0c"
 },
 {
  "y": 721,
  "size": 1,
  "x0": 119.5,
  "runs": 37,
  "glyphs": "9d8b4203a13e"
 },
 {
  "y": 678,
  "size": 1,
  "x0": 102.5,
  "runs": 18,
  "glyphs": "535afb76d28f"
 },
 {
  "y": 623,
  "size": 1,
  "x0": 119.5,
  "runs": 9,
  "glyphs": "a5ed6c959f20"
 },
 {
  "y": 580,
  "size": 1,
  "x0": 102.5,
  "runs": 18,
  "glyphs": "d345ee7f8c41"
 },
 {
  "y": 525,
  "size": 1,
  "x0": 119.5,
  "runs": 15,
  "glyphs": "10def7368593"
 },
 {
  "y": 482,
  "size": 1,
  "x0": 102.5,
  "runs": 5,
  "glyphs": "460882c7ca89"
 },
 {
  "y": 427,
  "size": 1,
  "x0": 119.5,
  "runs": 12,
  "glyphs": "3ddf77738c66"
 },
 {
  "y": 384,
  "size": 1,
  "x0": 102.5,
  "runs": 4,
  "glyphs": "b96da8546f13"
 },
 {
  "y": 272,
  "size": 1,
  "x0": 355,
  "runs": 11,
  "glyphs": "437907025db9"
 },
 {
  "y": 244,
  "size": 1,
  "x0": 62.5,
  "runs": 85,
  "glyphs": "a987d8eced7f"
 },
 {
  "y": 200,
  "size": 1,
  "x0": 262.09,
  "runs": 11,
  "glyphs": "c309c6058089"
 },
 {
  "y": 140,
  "size": 1,
  "x0": 376.19,
  "runs": 4,
  "glyphs": "f70d8251396a"
 },
 {
  "y": 41,
  "size": 1,
  "x0": 558.03,
  "runs": 28,
  "glyphs": "d2831af7fb7d"
 }
];

const ALT_LINES = {
 "default": [
  {
   "y": 701,
   "size": 1,
   "x0": 39.5,
   "runs": 7,
   "glyphs": "34faddef2135"
  },
  {
   "y": 655,
   "size": 1,
   "x0": 199.63,
   "runs": 1,
   "glyphs": "37a3aa5d54f5"
  },
  {
   "y": 587,
   "size": 1,
   "x0": 80.5,
   "runs": 1,
   "glyphs": "6ade6f734228"
  },
  {
   "y": 545,
   "size": 1,
   "x0": 190.8,
   "runs": 3,
   "glyphs": "1887ab9f4fde"
  },
  {
   "y": 493,
   "size": 1,
   "x0": 80.5,
   "runs": 2,
   "glyphs": "efcc37151bef"
  },
  {
   "y": 451,
   "size": 1,
   "x0": 204.08,
   "runs": 1,
   "glyphs": "f22297f93de0"
  },
  {
   "y": 406,
   "size": 1,
   "x0": 214,
   "runs": 2,
   "glyphs": "db2439f16dc6"
  },
  {
   "y": 348,
   "size": 1,
   "x0": 145.25,
   "runs": 1,
   "glyphs": "99e603718500"
  },
  {
   "y": 277,
   "size": 1,
   "x0": 148.31,
   "runs": 1,
   "glyphs": "0618867a07d3"
  },
  {
   "y": 240,
   "size": 1,
   "x0": 147.86,
   "runs": 7,
   "glyphs": "1ed4955c55d3"
  },
  {
   "y": 204,
   "size": 1,
   "x0": 80.05,
   "runs": 15,
   "glyphs": "95c9f707ebc3"
  },
  {
   "y": 104,
   "size": 1,
   "x0": 214.84,
   "runs": 1,
   "glyphs": "727350de59be"
  }
 ],
 "error": [
  {
   "y": 775,
   "size": 1,
   "x0": 39.5,
   "runs": 7,
   "glyphs": "34faddef2135"
  },
  {
   "y": 729,
   "size": 1,
   "x0": 199.63,
   "runs": 1,
   "glyphs": "37a3aa5d54f5"
  },
  {
   "y": 658,
   "size": 1,
   "x0": 133.86,
   "runs": 2,
   "glyphs": "ef02077fcd2e"
  },
  {
   "y": 587,
   "size": 1,
   "x0": 80.5,
   "runs": 1,
   "glyphs": "4b102b2bfc67"
  },
  {
   "y": 545,
   "size": 1,
   "x0": 190.8,
   "runs": 3,
   "glyphs": "1887ab9f4fde"
  },
  {
   "y": 493,
   "size": 1,
   "x0": 80.5,
   "runs": 1,
   "glyphs": "e0767fe1cd0a"
  },
  {
   "y": 451,
   "size": 1,
   "x0": 204.08,
   "runs": 1,
   "glyphs": "f22297f93de0"
  },
  {
   "y": 406,
   "size": 1,
   "x0": 214,
   "runs": 2,
   "glyphs": "db2439f16dc6"
  },
  {
   "y": 348,
   "size": 1,
   "x0": 145.25,
   "runs": 1,
   "glyphs": "99e603718500"
  },
  {
   "y": 277,
   "size": 1,
   "x0": 148.31,
   "runs": 1,
   "glyphs": "0618867a07d3"
  },
  {
   "y": 240,
   "size": 1,
   "x0": 147.86,
   "runs": 7,
   "glyphs": "1ed4955c55d3"
  },
  {
   "y": 204,
   "size": 1,
   "x0": 80.05,
   "runs": 15,
   "glyphs": "95c9f707ebc3"
  },
  {
   "y": 104,
   "size": 1,
   "x0": 214.84,
   "runs": 1,
   "glyphs": "727350de59be"
  }
 ],
 "reset": [
  {
   "y": 353,
   "size": 1,
   "x0": 183.94,
   "runs": 1,
   "glyphs": "895600409df4"
  },
  {
   "y": 292,
   "size": 1,
   "x0": 81.19,
   "runs": 3,
   "glyphs": "8a3ee27a15b9"
  },
  {
   "y": 272,
   "size": 1,
   "x0": 57.59,
   "runs": 3,
   "glyphs": "095fe2ec6746"
  },
  {
   "y": 209,
   "size": 1,
   "x0": 149.34,
   "runs": 1,
   "glyphs": "e0767fe1cd0a"
  },
  {
   "y": 185,
   "size": 1,
   "x0": 56.14,
   "runs": 4,
   "glyphs": "5d99de5aeaea"
  },
  {
   "y": 152,
   "size": 1,
   "x0": 107.06,
   "runs": 1,
   "glyphs": "8d2058101e46"
  }
 ],
 "signup": [
  {
   "y": 413,
   "size": 1,
   "x0": 170.13,
   "runs": 2,
   "glyphs": "d58567d74899"
  },
  {
   "y": 353,
   "size": 1,
   "x0": 80.5,
   "runs": 3,
   "glyphs": "6a979e827a5c"
  },
  {
   "y": 313,
   "size": 1,
   "x0": 160.98,
   "runs": 6,
   "glyphs": "232801d80091"
  },
  {
   "y": 267,
   "size": 1,
   "x0": 80.5,
   "runs": 1,
   "glyphs": "d301be6ed9b3"
  },
  {
   "y": 227,
   "size": 1,
   "x0": 190.8,
   "runs": 3,
   "glyphs": "1887ab9f4fde"
  },
  {
   "y": 181,
   "size": 1,
   "x0": 80.5,
   "runs": 2,
   "glyphs": "efcc37151bef"
  },
  {
   "y": 141,
   "size": 1,
   "x0": 204.08,
   "runs": 1,
   "glyphs": "f22297f93de0"
  },
  {
   "y": 100,
   "size": 1,
   "x0": 86.39,
   "runs": 1,
   "glyphs": "ffaa2b8a483c"
  },
  {
   "y": 63,
   "size": 1,
   "x0": 63.5,
   "runs": 1,
   "glyphs": "895600409df4"
  }
 ],
 "forgot": [
  {
   "y": 317,
   "size": 1,
   "x0": 171.3,
   "runs": 2,
   "glyphs": "35cccdb854e0"
  },
  {
   "y": 253,
   "size": 1,
   "x0": 80.5,
   "runs": 2,
   "glyphs": "efcc37151bef"
  },
  {
   "y": 213,
   "size": 1,
   "x0": 204.08,
   "runs": 1,
   "glyphs": "f22297f93de0"
  },
  {
   "y": 165,
   "size": 1,
   "x0": 142.17,
   "runs": 3,
   "glyphs": "45185f1730db"
  },
  {
   "y": 141,
   "size": 1,
   "x0": 44.91,
   "runs": 1,
   "glyphs": "f000a876a770"
  },
  {
   "y": 108,
   "size": 1,
   "x0": 81.41,
   "runs": 1,
   "glyphs": "4bc131d38d07"
  },
  {
   "y": 63,
   "size": 1,
   "x0": 63.5,
   "runs": 1,
   "glyphs": "895600409df4"
  }
 ]
};

const GS_ROWS = {
 "404": [
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,1,0,0,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent"
 ],
 "root": [
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,1,0,0,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,1,0,0,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,0,0,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent"
 ],
 "login": [
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,1,0,0,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent",
  "/SMask,/Type|absent,absent,absent,absent,absent,absent"
 ],
 "faq": [
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent"
 ],
 "thankyou": [
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent"
 ],
 "privacy": [
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent"
 ],
 "terms": [
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent"
 ],
 "refund": [
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent"
 ],
 "accessibility": [
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent"
 ],
 "demo": [
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,1,0,0,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca|true,2,1,1,4,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent",
  "/BM,/ca|absent,absent,absent,absent,absent,absent"
 ]
};

const ICC_ROWS = {
 "default": {
  "images": 6,
  "icc": 0,
  "refs": 0
 },
 "error": {
  "images": 6,
  "icc": 0,
  "refs": 0
 },
 "reset": {
  "images": 1,
  "icc": 0,
  "refs": 0
 },
 "signup": {
  "images": 2,
  "icc": 0,
  "refs": 0
 },
 "forgot": {
  "images": 2,
  "icc": 0,
  "refs": 0
 }
};

const MUTATION = {
 "base": {
  "objects": 292,
  "grads": 4,
  "gs": 18,
  "tilings": [
   {
    "xstep": "26",
    "ystep": "9",
    "len": 54
   },
   {
    "xstep": "325",
    "ystep": "9",
    "len": 55
   },
   {
    "xstep": "1906",
    "ystep": "553",
    "len": 59
   }
  ]
 },
 "step1": {
  "objects": 306,
  "grads": 5,
  "gs": 18,
  "tilings": [
   {
    "xstep": "1906",
    "ystep": "553",
    "len": 59
   },
   {
    "xstep": "26",
    "ystep": "9.0001221",
    "len": 140
   },
   {
    "xstep": "325",
    "ystep": "9.0001221",
    "len": 142
   }
  ]
 },
 "step2": {
  "objects": 317,
  "grads": 6,
  "gs": 18,
  "tilings": [
   {
    "xstep": "26",
    "ystep": "9",
    "len": 54
   },
   {
    "xstep": "325",
    "ystep": "9",
    "len": 55
   },
   {
    "xstep": "1906",
    "ystep": "553",
    "len": 59
   }
  ]
 }
};


// =====================================================================
// (1) THE LOGIN-LOCAL H2-H6 TRACKING FIX (D199 — the RED->BUILD->GREEN pin)
// =====================================================================
test.describe("the login-local heading tracking (Session 58 — D199)", () => {
  test("the three alternate-state h2s compute letter-spacing normal (the live's login bundle ships no base heading tracking) + the signin h1 keeps tracking-tight", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    // the signin h1 KEEPS its explicit tracking-tight (the S7 parity
    // record — computed -0.75px at the 30px sm:text-3xl)
    const h1 = page.getByRole("heading", { name: "Welcome to SAAS Company" });
    expect(await h1.evaluate((el) => getComputedStyle(el).letterSpacing)).toBe("-0.75px");
    // signup state
    await page.getByRole("button", { name: /Sign up/ }).click();
    const signup = page.getByRole("heading", { name: /Create your account/ });
    await signup.waitFor();
    expect(await signup.evaluate((el) => getComputedStyle(el).letterSpacing)).toBe("normal");
    // forgot state (fresh default first — the signup card has no forgot button)
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Forgot password\?/ }).click();
    const forgot = page.getByRole("heading", { name: "Reset your password" });
    await forgot.waitFor();
    expect(await forgot.evaluate((el) => getComputedStyle(el).letterSpacing)).toBe("normal");
    // reset-success state
    await page.fill("#email", PIN_EMAIL);
    await page.getByRole("button", { name: "Send reset link" }).click();
    const reset = page.getByRole("heading", { name: "Check your email" });
    await reset.waitFor();
    expect(await reset.evaluate((el) => getComputedStyle(el).letterSpacing)).toBe("normal");
  });
});

// =====================================================================
// (2) THE 33RD SURFACE — the pages' line-level records
// =====================================================================
test.describe("the text-position layer (Session 58 — D198, the thirty-third surface)", () => {
  test("the six deterministic content routes at FULL LINE-LEVEL PARITY: every (y, x0, runs, glyph-hash) record equal (the ±2 BT/Tm re-blocking absorbed by the line merge)", async ({ page }) => {
    for (const [route, pin] of Object.entries(PAGES_LINES)) {
      await dwell(page, route);
      const f = await renderPdf(page, `s58-pages-${route.replace(/\W/g, "")}`);
      const lines = lineRecords(streamSets(f).pages);
      expect(lines, `${route} the line-level records (${pin.length} lines)`).toEqual(pin as LineRec[]);
    }
  });

  test("the landing's 23-line STABLE CORE (the entrance-gated below-fold family bucketed — a varying pair paints on some renders)", async ({ page }) => {
    await dwell(page, "/");
    const f = await renderPdf(page, "s58-pages-landing");
    const lines = lineRecords(streamSets(f).pages);
    // the stable-core SUBSET: every core line present on every render
    for (const core of LANDING_CORE as LineRec[]) {
      const hit = lines.find((l) => l.y === core.y && l.x0 === core.x0 && l.runs === core.runs && l.glyphs === core.glyphs);
      expect(hit, `the landing core line y=${core.y} x0=${core.x0} present`).toBeDefined();
    }
    // the floor: at least the core, at most core + the entrance family
    expect(lines.length, "the landing line count within the entrance band").toBeGreaterThanOrEqual((LANDING_CORE as LineRec[]).length);
    expect(lines.length, "the landing line count within the entrance band (upper)").toBeLessThanOrEqual(31);
  });

  test("the 404's line records (the y=586 quote line at the clone's 58-run emission — the registered 2-space-glyph delta vs the live's 60, pdftotext byte-identical)", async ({ page }) => {
    await dwell(page, "/s58-render-nonexistent");
    const lines = lineRecords(streamSets(await renderPdf(page, "s58-pages-404")).pages);
    expect(lines).toEqual(L404_LINES as LineRec[]);
  });

  test("the /demo 27-line superset floor (the live's shell renders 4 lines — the registered superset)", async ({ page }) => {
    await dwell(page, "/demo");
    const lines = lineRecords(streamSets(await renderPdf(page, "s58-pages-demo")).pages);
    expect(lines).toEqual(DEMO_LINES as LineRec[]);
  });

  test("the five /login alternates' FORM line records (reset/signup/forgot at FULL post-fix parity; default/error carrying the two registered ±1 run-split lines)", async ({ page }) => {
    const drivers: [string, (p: import("@playwright/test").Page) => Promise<void>][] = [
      ["default", enterDefault], ["error", enterError], ["reset", enterReset],
      ["signup", enterSignup], ["forgot", enterForgot],
    ];
    for (const [state, driver] of drivers) {
      await driver(page);
      const f = await renderPdf(page, `s58-alt-${state}`);
      const lines = lineRecords(streamSets(f).forms);
      expect(lines, `alt-${state} the form line records`).toEqual((ALT_LINES as Record<string, LineRec[]>)[state]);
    }
  });

  test("the determinism law: the line records byte-identical across re-renders (faq pages + the reset form, fresh contexts)", async ({ page }) => {
    await dwell(page, "/faq");
    const a1 = lineRecords(streamSets(await renderPdf(page, "s58-det-faq-a")).pages);
    await dwell(page, "/faq");
    const a2 = lineRecords(streamSets(await renderPdf(page, "s58-det-faq-b")).pages);
    expect(JSON.stringify(a2), "the /faq line records deterministic").toBe(JSON.stringify(a1));
    await enterReset(page);
    const b1 = lineRecords(streamSets(await renderPdf(page, "s58-det-reset-a")).forms);
    await enterReset(page);
    const b2 = lineRecords(streamSets(await renderPdf(page, "s58-det-reset-b")).forms);
    expect(JSON.stringify(b2), "the reset form line records deterministic").toBe(JSON.stringify(b1));
  });
});

// =====================================================================
// (3) THE MUTATION COLUMN (D204 — the dashboard's payload under live data)
// =====================================================================
test.describe("the dashboard's mutation column (Session 58 — D204)", () => {
  test("the print payload TRACKS THE DATA: +1 shading pattern per new chart row until the CHART_ROWS ceiling, objects deterministic, gs/tilings stable, the round-trip back to base", async ({ page }) => {
    test.setTimeout(180_000);
    // THE FRESH-CONTEXT LAW: the authenticated dashboard renders on its
    // own context (the login -> dashboard flow)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL(/\/dashboard$/, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);

    const renderColumns = async (name: string) => {
      const f = await renderPdf(page, name);
      return mutationColumns(f);
    };
    // the base (the six seed workflows -> six chart rows)
    expect(await renderColumns("s58-mut-base")).toEqual(MUTATION.base);
    // mint row 1 -> seven rows
    const r1 = await page.request.post("/api/workflows", { data: { name: "S58 mutation probe row 1" } });
    const b1 = await r1.json();
    expect(r1.ok() && b1?.ok, "the mutation POST accepted").toBe(true);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1400);
    expect(await renderColumns("s58-mut-1")).toEqual(MUTATION.step1);
    // mint row 2 -> eight rows (the CHART_ROWS ceiling)
    const r2 = await page.request.post("/api/workflows", { data: { name: "S58 mutation probe row 2" } });
    const b2 = await r2.json();
    expect(r2.ok() && b2?.ok, "the second mutation POST accepted").toBe(true);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1400);
    expect(await renderColumns("s58-mut-2")).toEqual(MUTATION.step2);
    // THE CLEANUP CASCADE (the session31 pattern) + the round-trip: the
    // columns return to the base record after the mints are deleted
    try {
      for (const body of [b1, b2]) {
        const del = await page.request.delete(`/api/workflows/${body?.data?.id}`);
        expect(del.ok(), `the cleanup DELETE ${body?.data?.id}`).toBe(true);
      }
    } finally {
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(1400);
    }
    expect(await renderColumns("s58-mut-clean")).toEqual(MUTATION.base);
  });
});

// =====================================================================
// (4) THE FOUR LAWS (D200-D203)
// =====================================================================
test.describe("the four laws (Session 58 — D200-D203)", () => {
  test("THE GS VALUE-LAYER LAW + THE /HT EMPTY-SET: the /SA /LW /LC /LJ /ML values at exact multiset parity on every route (clone-side pins, live-verified in the recon); /demo the 13-row superset floor", async ({ page }) => {
    for (const [name, pin] of Object.entries(GS_ROWS)) {
      const route =
        name === "root" ? "/" :
        name === "thankyou" ? "/thank-you" :
        name === "refund" ? "/refund-policy" :
        name === "404" ? "/s58-render-nonexistent" :
        "/" + name;
      await dwell(page, route);
      const rows = gsRows(await renderPdf(page, `s58-gs-${name}`));
      expect(rows, `${name} the gs value multiset (${pin.length} rows)`).toEqual(pin as string[]);
      // THE /HT EMPTY-SET LAW: no halftone key anywhere
      expect(rows.every((r) => !r.includes("/HT")), `${name} the /HT empty-set law`).toBe(true);
    }
  });

  test("THE CATALOG VIEW LAYER: /OpenAction + /PageMode null on every route + the /ViewerPreferences value identical", async ({ page }) => {
    const routes = ["/", "/login", "/faq", "/thank-you", "/privacy", "/terms", "/refund-policy", "/accessibility", "/demo", "/s58-render-nonexistent"];
    for (const route of routes) {
      await dwell(page, route);
      const c = catalogCensus(await renderPdf(page, `s58-cat-${route.replace(/\W/g, "")}`));
      expect(c, `${route} the catalog census`).not.toBeNull();
      expect(c!.openAction, `${route} /OpenAction null`).toBeNull();
      expect(c!.pageMode, `${route} /PageMode null`).toBeNull();
      // THE VP KEY-STRING FORM: the qpdf-JSON dict keys + the /Type value
      // carry the raw "/" prefixes — the census stringifies them as-is
      expect(c!.viewerPrefs, `${route} the /ViewerPreferences value`).toBe('{"\/DisplayDocTitle":true,"\/Type":"\/ViewerPreferences"}');
    }
  });

  test("THE ICC EMPTY-SET LAW + the alternates' image counts (zero ICC streams/refs on all five states; the 6/6/1/2/2 floor re-verified)", async ({ page }) => {
    const drivers: [string, (p: import("@playwright/test").Page) => Promise<void>][] = [
      ["default", enterDefault], ["error", enterError], ["reset", enterReset],
      ["signup", enterSignup], ["forgot", enterForgot],
    ];
    for (const [state, driver] of drivers) {
      await driver(page);
      const c = iccRow(await renderPdf(page, `s58-icc-${state}`));
      expect(c, `alt-${state} the ICC empty-set law + the image floor`).toEqual((ICC_ROWS as Record<string, { images: number; icc: number; refs: number }>)[state]);
    }
  });
});
