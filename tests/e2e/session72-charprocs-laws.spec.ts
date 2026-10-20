import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 72 — THE FORTY-SEVENTH SURFACE: THE /CharProcs GLYPH-STREAM
 * INTERIORS under the pinned-frame contract (D228, law-quality). The S71
 * richness probe surfaced this layer as the corrected premise of the
 * font-subset candidate: the live ships NO /FontFile at all — all 10
 * fonts are Type3, the glyph payload living in the /CharProcs streams.
 * THIS surface walks every font's /CharProcs table on the animated
 * landing, both pinned frames, every glyph stream decoded BY VALUE (the
 * program bytes — the d1 set-width + bbox + the full bezier path).
 *
 * (a) THE SITE CENSUS — the clone: 10 Type3 fonts at the object numbers
 *     [22,31,35,58,62,89,104,142,143,198] @T=1700; the per-font
 *     glyph-count signature [22,9,56,29,52,25,26,15,29,15]; 278 streams
 *     total / 163 distinct bodies / 228846 bytes / lengths 17-3932; the
 *     FontMatrix uniform [0.00100000005,0,0,-0.00100000005,0,0] on every
 *     font (the y-flip + the 2^-10-scale family).
 *
 * (b) THE T-INVARIANCE + THE NUMBERING LAW — every glyph body
 *     byte-identical across T=1700/T=1000 (paired BY POSITION: the i-th
 *     font of each frame + the glyph name); the numbering law — the
 *     LAST FOUR fonts shift by EXACTLY -1 @T=1000 (104->103, 142->141,
 *     143->142, 198->197) while the first six HOLD — the S68 ca230
 *     phase-slot contraction measured at the font layer (the same -1
 *     law as every shifted layer since S69).
 *
 * (c) THE SHARED-BODY DEDUP FAMILIES — 163 distinct bodies carrying 278
 *     stream slots: 76 shared families, the maximum sharing 6 (one body
 *     painted by six glyphs); the 17-byte minimal family — the zero-bbox
 *     `203 0 0 0 0 0 d1` glyphs (9 streams) shared across fonts.
 *     Cross-side (the S72 walk's record): ALL 163 distinct bodies
 *     byte-identical ACROSS SIDES, all 278 per-glyph streams identical
 *     position+name paired — the deepest cross-side parity yet measured
 *     (the whole font payload layer shared by both trees).
 *
 * (d) THE GLYPH PROGRAM STRUCTURE — the operator census at exact
 *     equality: d1=278 (every glyph the set-width + bbox form), d0=0
 *     (the d0 form absent entirely), f=269, f*=0, m=462, c=2955, l=1964,
 *     h=462 — identical on the live side. NO src/ fix — the layer is at
 *     full byte parity. This spec pins the CLONE side so any drift
 *     surfaces at the gate. The dwell contract: the S63-71 pinned-frame
 *     form verbatim (1280x720 + networkidle + 4000ms +
 *     pause-every-WAAPI-animation at T + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s72-t-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-71 form, verbatim) ----------

const pinnedPrint = async (
  page: import("@playwright/test").Page,
  t: number,
  name: string,
) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  const pinned = await page.evaluate((tt) => {
    const anims = document.getAnimations();
    for (const a of anims) {
      try {
        a.pause();
        a.currentTime = tt;
      } catch {
        /* transition-like effects are not pinnable — none in the loop family */
      }
    }
    return anims.length;
  }, t);
  await page.waitForTimeout(150);
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(name);
  writeFileSync(file, buf);
  return { file, pinned };
};

// ---------- the qpdf reader (the S63-71 form) ----------

type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};
type Norm = Record<string, QpdfObj>;

const asRef = (v: unknown): string | null =>
  typeof v === "string" && /^\d+ \d+ R$/.test(v) ? v : null;

const qpdfNorm = (file: string, tag: string): Norm => {
  const jsonFile = file.replace(/\.pdf$/, `.${tag}.json`);
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(readFileSync(jsonFile, "utf8")).qpdf[1] as Norm;
};

const dictOf = (norm: Norm, v: unknown): Record<string, unknown> | null => {
  void norm;
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  if ("value" in o && o.value && typeof o.value === "object" && !Array.isArray(o.value)) {
    return o.value as Record<string, unknown>;
  }
  if ("stream" in o && o.stream && typeof o.stream === "object") {
    return ((o.stream as { dict?: Record<string, unknown> }).dict) ?? null;
  }
  return o;
};

const decodeB64 = (s: string | null): string => {
  if (!s) return "";
  return Buffer.from(s, "base64").toString("latin1");
};

const val = (v: unknown): unknown =>
  (v as { value?: unknown } | undefined)?.value ?? v;

const dataOf = (v: unknown): string | null => {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if ("stream" in o && o.stream && typeof o.stream === "object") {
    return ((o.stream as { data?: string }).data) ?? null;
  }
  return null;
};

const deref = (norm: Norm, v: unknown): unknown => {
  const r = asRef(v);
  if (r === null) return v;
  const m = /^(\d+) (\d+) R$/.exec(r);
  return m ? norm[`obj:${m[1]} ${m[2]} R`] ?? norm[`obj:${m[1]}`] ?? null : null;
};

// ---------- D228: the /CharProcs glyph-stream census ----------

interface FontRec {
  objNum: number;
  glyphs: Array<{ name: string; program: string }>;
  fontMatrix: string;
}

/** Walk every Type3 font: the /CharProcs table's per-glyph painting
 * programs (the d1 set-width + bbox + the bezier path — each glyph its
 * own little content stream). */
const fontCensus = (norm: Norm): FontRec[] => {
  const out: FontRec[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d) continue;
    if (val(d["/Type"]) !== "/Font" || val(d["/Subtype"]) !== "/Type3") continue;
    const cp = d["/CharProcs"];
    const cpDict =
      cp && typeof cp === "object" && !Array.isArray(cp)
        ? (cp as Record<string, unknown>)
        : dictOf(norm, deref(norm, cp));
    const glyphs: Array<{ name: string; program: string }> = [];
    if (cpDict) {
      for (const [name, g] of Object.entries(cpDict)) {
        const gObj = deref(norm, g);
        const data = dataOf(gObj);
        if (data !== null) glyphs.push({ name, program: decodeB64(data) });
      }
    }
    const fm = Array.isArray(d["/FontMatrix"])
      ? (d["/FontMatrix"] as unknown[]).map((x) => val(x)).join(",")
      : "?";
    const m = k.match(/^obj:(\d+)/);
    out.push({ objNum: m ? Number(m[1]) : -1, glyphs, fontMatrix: fm });
  }
  return out.sort((a, b) => a.objNum - b.objNum);
};

// ---------- D228a: the site census ----------

test("D228a the glyph-stream site census — 10 fonts, the signature [22,9,56,29,52,25,26,15,29,15], 278/163, the uniform FontMatrix", async ({ page }) => {
  test.setTimeout(180_000);
  const { pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const fonts = fontCensus(qpdfNorm(pdfFile("a"), "a"));

  expect(fonts.length, "the Type3 font count").toBe(10);

  // the object numbers at T=1700
  expect(fonts.map((f) => f.objNum), "the font object numbers").toEqual([
    22, 31, 35, 58, 62, 89, 104, 142, 143, 198,
  ]);

  // the per-font glyph-count signature
  expect(fonts.map((f) => f.glyphs.length), "the glyph-count signature").toEqual([
    22, 9, 56, 29, 52, 25, 26, 15, 29, 15,
  ]);

  // the stream + distinct census + the byte total + the length range
  const programs = fonts.flatMap((f) => f.glyphs.map((g) => g.program));
  expect(programs.length, "the stream census").toBe(278);
  expect(new Set(programs).size, "the distinct-body census").toBe(163);
  expect(programs.reduce((a, p) => a + p.length, 0), "the total bytes").toBe(228846);
  const lens = programs.map((p) => p.length);
  expect(Math.min(...lens), "the minimal length").toBe(17);
  expect(Math.max(...lens), "the maximal length").toBe(3932);

  // the FontMatrix uniformity (the y-flip + the 2^-10-scale family)
  expect(new Set(fonts.map((f) => f.fontMatrix)), "one FontMatrix on every font").toEqual(
    new Set(["0.00100000005,0,0,-0.00100000005,0,0"]),
  );
});

// ---------- D228b: the T-invariance + the numbering law ----------

test("D228b the full-byte T-invariance (position-paired) + the numbering law (the last four fonts at EXACTLY -1)", async ({ page }) => {
  test.setTimeout(240_000);
  await pinnedPrint(page, 1700, "b");
  await pinnedPrint(page, 1000, "c");
  const fonts1700 = fontCensus(qpdfNorm(pdfFile("b"), "b"));
  const fonts1000 = fontCensus(qpdfNorm(pdfFile("c"), "c"));

  expect(fonts1000.length, "the @1000 font census").toBe(10);

  // THE NUMBERING LAW: the first six fonts HOLD; the last four shift by
  // EXACTLY -1 (the S68 ca230 phase-slot contraction at the font layer)
  expect(fonts1000.map((f) => f.objNum), "the @1000 font object numbers").toEqual([
    22, 31, 35, 58, 62, 89, 103, 141, 142, 197,
  ]);

  // THE FULL-BYTE T-INVARIANCE: every glyph body byte-identical across
  // frames, paired BY POSITION (the i-th font) + the glyph name
  expect(fonts1700.length, "the @1700 font census").toBe(fonts1000.length);
  for (let i = 0; i < fonts1700.length; i++) {
    const a = fonts1700[i];
    const b = fonts1000[i];
    expect(a.glyphs.length, `font@${i} glyph count frame-stable`).toBe(b.glyphs.length);
    const byName = new Map(b.glyphs.map((g) => [g.name, g.program]));
    for (const g of a.glyphs) {
      expect(byName.get(g.name), `font@${i} ${g.name} byte-identical across frames`).toBe(g.program);
    }
  }
});

// ---------- D228c: the shared-body dedup families ----------

test("D228c the dedup families — 163 bodies carrying 278 slots, 76 shared, max sharing 6, the 17-byte zero-bbox d1 family", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "d");
  const fonts = fontCensus(qpdfNorm(pdfFile("d"), "d"));
  const use = new Map<string, string[]>();
  for (const f of fonts) {
    for (const g of f.glyphs) {
      if (!use.has(g.program)) use.set(g.program, []);
      use.get(g.program)!.push(`${f.objNum}:${g.name}`);
    }
  }
  expect(use.size, "the distinct-body census").toBe(163);
  const shared = [...use.values()].filter((v) => v.length > 1);
  expect(shared.length, "the shared-family census").toBe(76);
  expect(Math.max(...[...use.values()].map((v) => v.length)), "the maximum sharing").toBe(6);

  // THE MINIMAL FAMILY: the 17-byte zero-bbox d1 glyphs — TWO shared
  // bodies, the set-width pair 203 (6 glyphs: the fonts 22/31/58/89/
  // 104/142) + 204 (3 glyphs: the fonts 35/62/143) = 9 streams (the
  // space-class character at two font-size classes)
  const min17 = [...use.keys()].filter((p) => p.length === 17);
  expect(min17.length, "the 17-byte family: two shared bodies").toBe(2);
  expect(min17.includes("203 0 0 0 0 0 d1\n"), "the set-width-203 body").toBe(true);
  expect(min17.includes("204 0 0 0 0 0 d1\n"), "the set-width-204 body").toBe(true);
  expect(use.get("203 0 0 0 0 0 d1\n")!.length, "the 203 body's sharing count").toBe(6);
  expect(use.get("204 0 0 0 0 0 d1\n")!.length, "the 204 body's sharing count").toBe(3);

  // a rich glyph carries the full d1 + bezier form (the width + bbox head)
  const rich = fonts[2].glyphs.find((g) => g.program.length === 3932);
  expect(rich, "the 3932-byte maximal glyph present").toBeTruthy();
  expect(rich!.program, "the rich glyph's d1 head").toMatch(
    /^[\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ d1\n/,
  );
});

// ---------- D228d: the glyph program structure ----------

test("D228d the operator census — d1=278 / d0=0 / f=269 / m=462 / c=2955 / l=1964 / h=462 (the live-identical counts)", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "e");
  const fonts = fontCensus(qpdfNorm(pdfFile("e"), "e"));
  const programs = fonts.flatMap((f) => f.glyphs.map((g) => g.program));

  // every glyph opens with the d1 set-width + bbox form
  const D1_HEAD = /^[\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ [\d.-]+ d1\n/;
  expect(programs.every((p) => D1_HEAD.test(p)), "every glyph a d1 head").toBe(true);
  // the d0 form ABSENT entirely
  expect(programs.some((p) => / d0\n/.test(p)), "the d0 empty-set").toBe(false);

  const count = (re: RegExp) => programs.reduce((a, p) => a + (p.match(re) ?? []).length, 0);
  expect(count(/\bf\b/g), "the f fills").toBe(269);
  expect(count(/f\*/g), "the f* fills (the even-odd family empty)").toBe(0);
  expect(count(/\bm\b/g), "the m moves").toBe(462);
  expect(count(/\bc\b/g), "the c curves").toBe(2955);
  expect(count(/\bl\b/g), "the l lines").toBe(1964);
  expect(count(/\bh\b/g), "the h closes").toBe(462);
});
