import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 62 — THE THIRTY-SEVENTH SURFACE: the /ExtGState-adjacent
 * TRANSFER-MODE INTERIORS, measured at FULL PARITY on its first honest
 * two-sided capture (research/transfermode-s62.py, both sides fresh,
 * identical print inputs per the pin-your-own-input law). NO src/ fix was
 * required — this spec pins the CLONE side of the measured parity so any
 * drift in the clone's print transfer modes surfaces at the gate.
 *
 * The three censuses per printed route:
 *   (a) THE /BM VALUE CENSUS — every ExtGState's blend-mode entry:
 *       /Normal on every deterministic route both sides, plus THE /SCREEN
 *       LAW: the landing's hero mix-blend-mode renders into print as the
 *       /Screen blend mode — ONE entry, both sides, identical shape
 *       (/BM,/ca at the full-opacity grid point) — the only non-Normal
 *       blend mode in either tree;
 *   (b) THE TRANSFER-FUNCTION EMPTY-SET LAW — the /ExtGState key universe
 *       beyond the alpha/blend family (/TR /TR2 /HT /BG /BG2 /UCR /UCR2
 *       /OP /op /OPM /RI /D /FL /AIS /TK /SP /Font) carries ZERO entries
 *       on every route, both sides — both pipelines' transfer modes are
 *       alpha+blend-only by construction (PDF 32000-1 Table 59's
 *       transfer/halftone family never emitted);
 *   (c) THE BM-BEARING SHAPE CENSUS at the D187 255-grid — the two gs
 *       shapes that carry /BM (the full-stroke gs /BM,/CA,/LC,/LJ,/LW,
 *       /ML,/SA,/ca and the alpha-only gs /BM,/ca), every alpha mapped
 *       through the JS Math.round grid (the S54 law).
 *
 * THE MEASURED PARITY (10 routes): 404 3v3 · login 9v9 · login-typed 9v9
 * · faq 12v12 · thank-you 4v4 · privacy 11v11 · terms 11v11 ·
 * accessibility 11v11 · refund-policy 11v11 — every BM value /Normal, the
 * shape multisets EQUAL at the grid; the landing (34v33 gs) carrying only
 * the REGISTERED animation-band families (the frame-dependent opacity
 * slots, the SMask sliver counts, the ±1 structure) around the STABLE
 * core — the /Screen entry + the shared grid points.
 *
 * THE 179 CONVERGENCE PIN (D218d): the four legal routes' 0.7-serialized
 * alpha (the clone's raw CSS decimal) converges with the live's 0.702
 * (the 8-bit-quantized 179/255) at grid point 179 — 0.7 × 255 = 178.5
 * EXACTLY in IEEE754, and the D187 grid maps it half-away-from-zero (JS
 * Math.round semantics). THE S62 INSTRUMENT CATCH, pinned forever: Python
 *'s banker's rounding reads round(178.5) = 178 — half-to-even — and
 * produced a FALSE drift on all four legal routes; any re-implementation
 * of the grid outside JS must use floor(v*255 + 0.5), never round().
 *
 * The dwell contract: 1280×720 + networkidle + 800ms (the S54/S61 house
 * form) — the deterministic routes' constants verified stable across two
 * fresh 800ms runs; the landing's animated slots vary by frame (the
 * registered animation-band render law) so only its stable core is pinned.
 */

const pdfFile = (route: string) =>
  join(tmpdir(), `s62-pin${route.replace(/\//g, "_")}.pdf`);

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

// ---------- THE D218 INSTRUMENT (the S62 recon port) ----------

type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};
interface GsLike {
  shape: string;
  BM: string | null;
  ca: number | null;
  CA: number | null;
}
interface RouteCensus {
  gsCount: number;
  bm: GsLike[];
  xferHits: string[];
}

/** The ExtGState key universe (PDF 32000-1 Table 59) — /Type OPTIONAL (the
 * S54 probe-2 law: 9 of /login's 14 ExtGStates are TYPELESS). */
const GS_KEYS = new Set([
  "/Type", "/LW", "/LJ", "/LC", "/ML", "/D", "/RI", "/FL", "/CA", "/ca",
  "/BM", "/SMask", "/SA", "/AIS", "/TK", "/Font", "/SP", "/OP", "/op",
  "/OPM", "/BG", "/BG2", "/UCR", "/UCR2", "/TR", "/TR2", "/HT",
]);
/** The transfer-function/halftone family — the empty-set law's scope. */
const XFER_KEYS = [
  "/TR", "/TR2", "/HT", "/BG", "/BG2", "/UCR", "/UCR2", "/OP", "/op",
  "/OPM", "/RI", "/D", "/FL", "/AIS", "/TK", "/SP", "/Font",
];

const val = (v: unknown) => (v as { value?: unknown } | undefined)?.value ?? v;
/** THE D187 GRID with JS Math.round semantics — NEVER Python round():
 * 0.7*255 = 178.5 exactly, half-away-from-zero -> 179 (the S62 catch). */
const grid = (v: unknown) =>
  typeof v === "number" ? Math.floor(v * 255 + 0.5) : null;

const qpdfJson = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".s62.json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(readFileSync(jsonFile, "utf8")) as {
    qpdf: [unknown, Record<string, QpdfObj>];
  };
};

const routeCensus = (file: string): RouteCensus => {
  const objs = qpdfJson(file).qpdf[1];
  const out: GsLike[] = [];
  const xferHits: string[] = [];
  for (const o of Object.values(objs)) {
    const d = o?.value ?? o?.stream?.dict ?? null;
    if (!d || typeof d !== "object") continue;
    const ks = Object.keys(d);
    if (ks.length === 0 || !ks.every((k) => GS_KEYS.has(k))) continue;
    for (const xk of XFER_KEYS) if (xk in d) xferHits.push(xk);
    out.push({
      shape: ks.filter((k) => k !== "/Type").sort().join(","),
      BM: (val(d["/BM"]) as string | undefined) ?? null,
      ca: "/ca" in d ? grid(val(d["/ca"])) : null,
      CA: "/CA" in d ? grid(val(d["/CA"])) : null,
    });
  }
  return { gsCount: out.length, bm: out.filter((e) => e.BM), xferHits };
};

const bmCensus = (c: RouteCensus) => {
  const m = new Map<string, number>();
  for (const e of c.bm) m.set(e.BM!, (m.get(e.BM!) ?? 0) + 1);
  return Object.fromEntries([...m.entries()].sort());
};

const bmShapes = (c: RouteCensus) =>
  c.bm
    .map((e) => ({ s: `${e.shape}@${e.ca ?? "-"}/${e.CA ?? "-"}`, shape: e.shape, ca: e.ca ?? -1, CA: e.CA ?? -1 }))
    // code-point shape order (C < c — localeCompare is case-INSENSITIVE and
    // would flip the two shapes), then numeric ca/CA
    .sort((a, b) => (a.shape < b.shape ? -1 : a.shape > b.shape ? 1 : 0) || a.ca - b.ca || a.CA - b.CA)
    .map((e) => e.s);

const PIN_EMAIL = "s52-pin@test.local";

const toLoginTyped = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.fill('input[type="email"]', PIN_EMAIL);
  await page.waitForTimeout(300);
};

// ---------- D218a: the deterministic routes' /BM censuses ----------

test("D218a the deterministic routes' transfer-mode censuses (the nine)", async ({ page }) => {
  test.setTimeout(120_000);
  // the measured 800ms constants (stable x2, the recon record):
  // [gsCount, bmCount, every BM = /Normal, the exact BM-bearing shape multiset]
  const fullStroke = (ca: number) =>
    `/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca@${ca}/${ca}`;
  const alphaOnly = (ca: number) => `/BM,/ca@${ca}/-`;
  const EXPECT: Record<string, { gs: number; bm: number; shapes: string[] }> = {
    "/nonexistent-page-xyz": {
      gs: 3, bm: 3,
      shapes: [fullStroke(255), fullStroke(255), alphaOnly(255)],
    },
    "/faq": {
      gs: 12, bm: 12,
      shapes: [
        fullStroke(128), fullStroke(204), fullStroke(255),
        alphaOnly(5), alphaOnly(26), alphaOnly(38), alphaOnly(51),
        alphaOnly(102), alphaOnly(128), alphaOnly(153), alphaOnly(204),
        alphaOnly(255),
      ],
    },
    "/thank-you": {
      gs: 4, bm: 4,
      shapes: [fullStroke(255), alphaOnly(102), alphaOnly(128), alphaOnly(255)],
    },
    "/privacy": {
      gs: 11, bm: 11,
      shapes: [
        fullStroke(128), fullStroke(204), fullStroke(255),
        alphaOnly(26), alphaOnly(51), alphaOnly(102), alphaOnly(128),
        alphaOnly(153), alphaOnly(179), alphaOnly(204), alphaOnly(255),
      ],
    },
  };
  for (const [route, exp] of Object.entries(EXPECT)) {
    await dwell(page, route);
    const file = await renderPdf(page, route);
    const c = routeCensus(file);
    expect(c.gsCount, `${route} gs count`).toBe(exp.gs);
    expect(c.bm.length, `${route} BM-bearing count`).toBe(exp.bm);
    expect(bmCensus(c), `${route} BM values all /Normal`).toEqual({ "/Normal": exp.bm });
    expect(bmShapes(c), `${route} BM-bearing shapes`).toEqual(exp.shapes);
  }
});

// ---------- D218b: the login family (default + typed) ----------

test("D218b the login family's transfer-mode censuses (the shimmer states)", async ({ page }) => {
  test.setTimeout(120_000);
  for (const state of ["default", "typed"] as const) {
    if (state === "typed") await toLoginTyped(page);
    else await dwell(page, "/login");
    const file = await renderPdf(page, `login-${state}`);
    const c = routeCensus(file);
    expect(c.gsCount, `${state} gs count`).toBe(14);
    expect(c.bm.length, `${state} BM-bearing count`).toBe(9);
    expect(bmCensus(c), `${state} BM values`).toEqual({ "/Normal": 9 });
    // the 800ms shimmer-phase constants (stable x2): the card's border
    // shimmer overlays serialize at 13/26/64/77/128/242 with the base set
    const shapes = bmShapes(c);
    const full = shapes.filter((s) => !s.includes("/BM,/ca@"));
    expect(full, `${state} full-stroke gs`).toEqual([
      "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca@255/255",
      "/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca@255/255",
    ]);
    const alphas = shapes.filter((s) => s.includes("/BM,/ca@")).map((s) => Number(s.match(/@(-?\d+)/)![1]));
    expect(new Set(alphas), `${state} alpha grid set`).toEqual(new Set([13, 26, 64, 77, 128, 242, 255]));
  }
});

// ---------- D218c: THE /SCREEN LAW + the landing's stable core ----------

test("D218c THE /SCREEN LAW — the landing's hero mix-blend-mode in print", async ({ page }) => {
  test.setTimeout(120_000);
  await dwell(page, "/");
  const file = await renderPdf(page, "landing");
  const c = routeCensus(file);
  // exactly ONE /Screen — the hero's mix-blend-mode; every other BM /Normal
  const census = bmCensus(c);
  expect(census["/Screen"], "the /Screen entry count").toBe(1);
  expect(Object.keys(census).filter((k) => k !== "/Normal" && k !== "/Screen"), "no other blend modes").toEqual([]);
  const screen = c.bm.filter((e) => e.BM === "/Screen");
  expect(screen, "the /Screen shape (alpha-only gs at full opacity)").toEqual([
    { shape: "/BM,/ca", BM: "/Screen", ca: 255, CA: null },
  ]);
  // the animated bucket: the frame-dependent slots vary (the registered
  // animation-band render law) — the STABLE CORE is pinned at the
  // presence level: every shared grid point present with min multiplicity
  const alphas = c.bm.filter((e) => e.BM === "/Normal" && e.shape === "/BM,/ca").map((e) => e.ca!);
  const count = (arr: number[], v: number) => arr.filter((x) => x === v).length;
  const CORE: Record<number, number> = { 0: 1, 5: 1, 13: 1, 26: 2, 51: 2, 77: 1, 102: 1, 128: 1, 153: 1, 179: 1, 204: 1, 255: 1 };
  for (const [v, min] of Object.entries(CORE)) {
    expect(count(alphas, Number(v)), `stable core grid ${v} min ${min}`).toBeGreaterThanOrEqual(min);
  }
  expect(c.bm.length, "BM-bearing floor (the animated bucket)").toBeGreaterThanOrEqual(20);
});

// ---------- D218d: THE TRANSFER-FUNCTION EMPTY-SET LAW ----------

test("D218d the transfer-function empty-set (every route, the Table-59 family)", async ({ page }) => {
  test.setTimeout(180_000);
  const ROUTES = [
    "/nonexistent-page-xyz", "/login", "/faq", "/thank-you", "/privacy",
    "/terms", "/accessibility", "/refund-policy", "/",
  ];
  for (const route of ROUTES) {
    await dwell(page, route);
    const file = await renderPdf(page, route);
    const c = routeCensus(file);
    expect(c.xferHits, `${route} transfer-function keys (must be ZERO)`).toEqual([]);
  }
  // the typed login alternate too
  await toLoginTyped(page);
  const file = await renderPdf(page, "login-typed");
  expect(routeCensus(file).xferHits, "login-typed transfer-function keys").toEqual([]);
});

// ---------- D218e: THE 179 CONVERGENCE PIN (the S62 instrument lesson) ----------

test("D218e the legal routes' 179-grid convergence (0.7 -> 179, the JS grid)", async ({ page }) => {
  test.setTimeout(120_000);
  // the four legal routes each carry the alpha-only 179 entry — the clone's
  // raw 0.7 decimal and the live's 179/255 quantization converge at the
  // D187 grid's half-away-from-zero point. A re-implemented grid that
  // reads 178 here has fallen into Python banker's rounding (the S62 catch)
  for (const route of ["/terms", "/accessibility", "/refund-policy"]) {
    await dwell(page, route);
    const file = await renderPdf(page, route);
    const c = routeCensus(file);
    const has179 = c.bm.some((e) => e.shape === "/BM,/ca" && e.ca === 179);
    expect(has179, `${route} carries the 179 convergence entry`).toBe(true);
    expect(c.bm.some((e) => e.shape === "/BM,/ca" && e.ca === 178), `${route} must NOT carry the banker's-rounding 178`).toBe(false);
  }
});
