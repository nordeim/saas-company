import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 70 — THE FORTY-FIFTH SURFACE: the TILING-PATTERN STREAM
 * INTERIORS under the pinned-frame contract (D226, law-quality). The S65
 * gradient-value walk measured the shading patterns' function interiors and
 * registered the six-tiling census + the single-/Matrix law at the OBJECT
 * level; the S66 scn-invocation walk touched the tiling streams' invocation
 * sites (the /X97 -> /X96 renumbering inside the streams). THIS surface
 * walks the tiling patterns' OWN painting streams on the animated landing,
 * both pinned frames — every PatternType-1 object: the dict (BBox + XStep +
 * YStep + /Matrix) + the raw stream bytes + the operator census + the
 * nested name tables, resolved BY VALUE (lessons 103/104: the refs are
 * strings; compare values, never object identity or name tokens).
 *
 * (a) THE SITE CENSUS — the clone: 6 tiling interiors = 4 in the
 *     tiling-painting family (`/Pattern cs /P# scn + re + f*`) + 2 in the
 *     q/Q-wrapped form-placing family (`q cm RG rg /G3 gs /X# Do Q`). The
 *     bbox multiset: [0,0,596,843] x3 (the page-wide trio — three streams
 *     sharing ONE normalized identity, differing only in their /G#+/P#
 *     name pairs), [0,0,201,201] (the logo tile), [0,0,738.00012,26.000122]
 *     (the border-shimmer strip — the ONE /Matrix carrier), [122,150,247,275]
 *     (the icon tile). Exactly ONE tiling carries a /Matrix
 *     ([0.99999988,0,0,0.9999972,81,946] — the shimmer strip's static
 *     placement, the S65 single-matrix law measured at the interior layer).
 *
 * (b) THE HELD PAIR + THE RENUMBERING-BY-FOUR — obj:13/obj:19 (the
 *     page-wide pair) hold their object numbers at BOTH pinned frames with
 *     byte-identical streams (positioned before the vanishing ca230
 *     phase-slot object — the S68 law). The four tilings whose OBJECT
 *     numbers shift (101/147/153/173 -> 100/146/152/172) each move by
 *     EXACTLY -1, and their ONLY stream delta is the name token (the
 *     normalized identities frame-stable — the S66 renumbering law inside
 *     the tiling streams).
 *
 * (c) THE LOGO-TILE DECOMPOSITION + THE 2^-24/2^-25 EPSILON LAW — the
 *     logo tile paints TWO Do placements: the full-size flip
 *     (`201 0 0 -201 0 201 cm ... /G3 gs /X# Do Q`) + an epsilon-scale
 *     second placement whose cm carries the T-DEPENDENT DETERMINISTIC
 *     carrier: exactly `-.000000059604645 0 .000000059604645` (= 2^-24) at
 *     T=1700 v `-.000000029802322 0 .000000029802322` (= 2^-25) at T=1000 —
 *     the logo-petal scale animation's float residue at the pinned frame
 *     (sub-pixel, invisible), verified deterministic across the a/b print
 *     pair. The live's counterpart paints ONE placement (len 59 v the
 *     clone's 144) — the D125 animated-petals form family, cross-side.
 *
 * (d) THE SHIMMER-STRIP INTERIOR — the clone-only tiling (the live has NO
 *     [0,0,738,26] tile; its counterpart is the hero-band pair
 *     [0,62,596,587] x2 — the D220 family, live-only). The interior's
 *     five-part structure: the full-size /X# Do + the shimmer-blue re-fill
 *     (`.1059 .2902 1 RG` over the `.000122070313`-unit sliver — 2^-13) +
 *     two epsilon-scale Do placements; T-invariant by value (the
 *     name-renumbering the only delta).
 *
 * The cross-side records (the S70 recon walk): obj 13/19 byte-identical
 * ACROSS SIDES at the same object numbers; the icon tile + the page-wide
 * third normalized-identical cross-side (name-shifted only); the live's
 * seven tilings ALL frame-stable at held numbers with raw byte-identical
 * streams (the renumbering law's two-sided asymmetry — the live's
 * phase-slot contraction sits outside its tiling numbering). NO src/ fix —
 * engine-emission families with identical visuals. This spec pins the
 * CLONE side so any drift surfaces at the gate. The dwell contract: the
 * S63-69 pinned-frame form verbatim (1280x720 + networkidle + 4000ms +
 * pause-every-WAAPI-animation at T + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s70-t-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-69 form, verbatim) ----------

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

// ---------- the qpdf reader (the S63-69 form) ----------

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

const deref = (norm: Norm, v: unknown): unknown => {
  const r = asRef(v);
  return r === null ? v : norm[`obj:${r}`] ?? null;
};

const decodeB64 = (s: string | null): string => {
  if (!s) return "";
  return Buffer.from(s, "base64").toString("latin1");
};

const val = (v: unknown): unknown =>
  (v as { value?: unknown } | undefined)?.value ?? v;

// ---------- D226: the tiling-pattern stream interior census ----------

interface Tiling {
  objNum: number;
  stream: string;
  bbox: string;
  xstep: string;
  ystep: string;
  matrix: string | null;
}

/** Walk every PatternType-1 object: the dict geometry + the decoded
 * painting stream (its own interior — NOT the content streams that invoke
 * it). */
const tCensus = (norm: Norm): Tiling[] => {
  const out: Tiling[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d || typeof d !== "object") continue;
    if (val(d["/PatternType"]) !== 1) continue;
    const m = k.match(/^obj:(\d+)/);
    const stream = decodeB64(o.stream?.data ?? null);
    out.push({
      objNum: m ? Number(m[1]) : -1,
      stream,
      bbox: Array.isArray(d["/BBox"])
        ? (d["/BBox"] as unknown[]).map((x) => val(x)).join(",")
        : "?",
      xstep: String(val(d["/XStep"])),
      ystep: String(val(d["/YStep"])),
      matrix: Array.isArray(d["/Matrix"])
        ? (d["/Matrix"] as unknown[]).map((x) => val(x)).join(",")
        : null,
    });
  }
  return out.sort((a, b) => a.objNum - b.objNum);
};

/** The operator-family classifier: the two canonical tiling-stream shapes —
 * the tiling-painting family (a /P# scn + re + f* — the gradient fills) and
 * the q/Q-wrapped form-placing family (nested /X# Do placements). */
const familyOf = (s: string): string => {
  if (s.includes("scn") && s.includes("f*")) return "tilingPainting";
  if (s.includes("Do") && s.includes("q\n") && s.includes("Q\n")) return "formPlacing";
  return "other";
};

/** The name-renumbering normalization (lesson 104): /P149 -> /P#,
 * /X97 -> /X#, /G172 -> /G# — the VALUE identity beneath the
 * name-allocation renumbering. */
const normNames = (s: string): string => s.replace(/\/([PGX])(\d+)\b/g, "/$1#");

const multiset = (values: string[]): Record<string, number> => {
  const m: Record<string, number> = {};
  for (const v of values) m[v] = (m[v] ?? 0) + 1;
  return m;
};

// ---------- D226a: the site census ----------

test("D226a the tiling-interior site census — 6 streams (4 tiling-painting + 2 form-placing), the bbox multiset, the ONE /Matrix carrier", async ({ page }) => {
  test.setTimeout(180_000);
  const { file, pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const ts = tCensus(qpdfNorm(file, "a"));
  expect(ts.length, "the tiling-interior count").toBe(6);

  // the two operator families at the exact split
  expect(multiset(ts.map((t) => familyOf(t.stream))), "the operator-family split").toEqual({
    tilingPainting: 4,
    formPlacing: 2,
  });
  expect(ts.every((t) => familyOf(t.stream) !== "other"), "zero unclassified streams").toBe(true);

  // the bbox multiset: the page-wide trio + the logo tile + the shimmer
  // strip + the icon tile
  expect(multiset(ts.map((t) => t.bbox)), "the bbox multiset").toEqual({
    "0,0,596,843": 3,
    "0,0,201,201": 1,
    "0,0,738.00012,26.000122": 1,
    "122,150,247,275": 1,
  });

  // the steps mirror the bboxes (the XStep/YStep just past each bbox extent)
  const pageWide = ts.filter((t) => t.bbox === "0,0,596,843");
  expect(pageWide.every((t) => t.xstep === "598" && t.ystep === "845"), "the page-wide steps").toBe(true);
  const logo = ts.find((t) => t.bbox === "0,0,201,201");
  expect(logo!.xstep, "the logo-tile XStep").toBe("203");
  expect(logo!.ystep, "the logo-tile YStep").toBe("203");

  // THE SINGLE-MATRIX LAW: exactly ONE tiling carries a /Matrix — the
  // shimmer strip's static placement (the S65 law at the interior layer)
  const withMatrix = ts.filter((t) => t.matrix !== null);
  expect(withMatrix.length, "exactly one /Matrix carrier").toBe(1);
  expect(withMatrix[0]!.bbox, "the /Matrix carrier is the shimmer strip").toBe("0,0,738.00012,26.000122");
  expect(withMatrix[0]!.matrix, "the shimmer strip's static /Matrix").toBe("0.99999988,0,0,0.9999972,81,946");

  // the page-wide trio share ONE normalized identity (the /G#+/P# name
  // pairs the only difference — the gs/pattern per-instance naming)
  const trioIdentities = new Set(pageWide.map((t) => normNames(t.stream)));
  expect(trioIdentities.size, "the page-wide trio one normalized identity").toBe(1);
});

// ---------- D226b: the held pair + the renumbering-by-four ----------

test("D226b obj 13/19 hold with byte-identical streams at both frames; the four shifted tilings move by exactly -1 with name-only deltas", async ({ page }) => {
  test.setTimeout(240_000);
  const a = await pinnedPrint(page, 1700, "b1");
  const b = await pinnedPrint(page, 1000, "b2");
  const A = tCensus(qpdfNorm(a.file, "b1"));
  const B = tCensus(qpdfNorm(b.file, "b2"));

  expect(A.length, "6 tilings @T=1700").toBe(6);
  expect(B.length, "6 tilings @T=1000").toBe(6);

  // the held pair: the page-wide 13/19 hold their numbers + raw bytes
  for (const n of [13, 19]) {
    const ta = A.find((t) => t.objNum === n);
    const tb = B.find((t) => t.objNum === n);
    expect(ta, `obj:${n} present @T=1700`).toBeTruthy();
    expect(tb, `obj:${n} present @T=1000 (number held)`).toBeTruthy();
    expect(tb!.stream, `obj:${n} stream byte-identical across frames`).toBe(ta!.stream);
    expect(tb!.bbox, `obj:${n} bbox stable`).toBe(ta!.bbox);
  }

  // the four renumbered tilings: matched by bbox, the object numbers shift
  // by EXACTLY -1 (the S68 ca230 phase-slot contraction one layer up), and
  // the ONLY stream delta is the name token
  const renumbered: Array<[string, number, number]> = [
    // [bbox, objNum@1700, objNum@1000]
    ["0,0,201,201", 101, 100],
    ["0,0,738.00012,26.000122", 147, 146],
    ["122,150,247,275", 153, 152],
    ["0,0,596,843", 173, 172],
  ];
  for (const [bbox, n17, n10] of renumbered) {
    const ta = A.find((t) => t.bbox === bbox && t.objNum === n17);
    const tb = B.find((t) => t.bbox === bbox && t.objNum === n10);
    expect(ta, `${bbox} at obj:${n17} @T=1700`).toBeTruthy();
    expect(tb, `${bbox} at obj:${n10} @T=1000 (shifted -1)`).toBeTruthy();
    expect(n17 - n10, `${bbox} shifts by exactly -1`).toBe(1);
    // the shimmer strip + the icon tile + the page-wide third: the
    // normalized identity frame-stable (name-renumbering the only delta)
    if (bbox !== "0,0,201,201") {
      expect(normNames(tb!.stream), `${bbox} normalized value frame-stable`).toBe(normNames(ta!.stream));
      expect(tb!.stream, `${bbox} raw streams differ (the renumbering family)`).not.toBe(ta!.stream);
    }
  }

  // the T-invariance by value across the full set modulo the logo tile's
  // epsilon carrier (D226c's law): the OTHER five tilings' normalized
  // multiset frame-stable
  const mA = multiset(A.filter((t) => t.bbox !== "0,0,201,201").map((t) => `${t.bbox}|${normNames(t.stream)}`));
  const mB = multiset(B.filter((t) => t.bbox !== "0,0,201,201").map((t) => `${t.bbox}|${normNames(t.stream)}`));
  expect(mB, "the non-logo normalized multiset T-invariant").toEqual(mA);
});

// ---------- D226c: the logo-tile decomposition + the epsilon law ----------

test("D226c the logo tile — TWO Do placements (the full-size flip + the epsilon-scale second), the epsilon carrier exactly 2^-24 @T=1700 v 2^-25 @T=1000", async ({ page }) => {
  test.setTimeout(240_000);
  const a = await pinnedPrint(page, 1700, "c1");
  const b = await pinnedPrint(page, 1000, "c2");
  const A = tCensus(qpdfNorm(a.file, "c1"));
  const B = tCensus(qpdfNorm(b.file, "c2"));

  const logoA = A.find((t) => t.bbox === "0,0,201,201");
  const logoB = B.find((t) => t.bbox === "0,0,201,201");
  expect(logoA, "the logo tile @T=1700 (obj:101)").toBeTruthy();
  expect(logoB, "the logo tile @T=1000 (obj:100)").toBeTruthy();
  expect(logoA!.objNum, "the logo tile's number @T=1700").toBe(101);
  expect(logoB!.objNum, "the logo tile's number @T=1000 (shifted -1)").toBe(100);

  // the form-placing family + the TWO Do placements (the live's counterpart
  // paints ONE — the D125 animated-petals family, cross-side)
  expect(familyOf(logoA!.stream), "the logo tile a form-placing stream").toBe("formPlacing");
  expect((logoA!.stream.match(/Do/g) ?? []).length, "TWO Do placements @T=1700").toBe(2);
  expect((logoB!.stream.match(/Do/g) ?? []).length, "TWO Do placements @T=1000").toBe(2);
  expect(logoA!.stream.length, "the two-placement stream length").toBe(144);
  expect(logoB!.stream.length, "the length frame-stable").toBe(144);

  // the FIRST placement: the full-size flip, frame-stable modulo the /X name
  const firstA = logoA!.stream.split("Q\n")[0] + "Q\n";
  const firstB = logoB!.stream.split("Q\n")[0] + "Q\n";
  expect(firstA, "the first placement the full-size flip").toContain("201 0 0 -201 0 201 cm");
  expect(firstA, "the first placement's gs").toContain("/G3 gs");
  expect(normNames(firstB), "the first placement frame-stable (name only)").toBe(normNames(firstA));

  // THE EPSILON LAW: the second placement's cm carries the deterministic
  // T-dependent carrier — exactly 2^-24 @T=1700 v 2^-25 @T=1000 (the
  // petal-scale animation's float residue at the pinned frame)
  expect(logoA!.stream, "the epsilon carrier @T=1700").toContain(
    "201 0 0 -.000000059604645 0 .000000059604645 cm",
  );
  expect(logoB!.stream, "the epsilon carrier @T=1000").toContain(
    "201 0 0 -.000000029802322 0 .000000029802322 cm",
  );
  // the raw streams differ across frames BEYOND the name tokens (the
  // epsilon the real delta — the one non-name T-dependence at this layer)
  expect(normNames(logoB!.stream), "the logo tile's normalized value T-DEPENDENT").not.toBe(normNames(logoA!.stream));
});

// ---------- D226d: the shimmer-strip interior ----------

test("D226d the shimmer strip — the clone-only tiling's five-part interior: the full-size Do + the shimmer-blue sliver re-fill + two epsilon placements", async ({ page }) => {
  test.setTimeout(240_000);
  const a = await pinnedPrint(page, 1700, "d1");
  const b = await pinnedPrint(page, 1000, "d2");
  const A = tCensus(qpdfNorm(a.file, "d1"));
  const B = tCensus(qpdfNorm(b.file, "d2"));

  const stripA = A.find((t) => t.bbox === "0,0,738.00012,26.000122");
  const stripB = B.find((t) => t.bbox === "0,0,738.00012,26.000122");
  expect(stripA, "the shimmer strip @T=1700 (obj:147)").toBeTruthy();
  expect(stripB, "the shimmer strip @T=1000 (obj:146)").toBeTruthy();
  expect(stripA!.objNum, "the strip's number @T=1700").toBe(147);
  expect(stripB!.objNum, "the strip's number @T=1000 (shifted -1)").toBe(146);

  // the five-part structure: the full-size Do + the re-fill + TWO epsilon
  // Do placements (3 Do total)
  expect((stripA!.stream.match(/Do/g) ?? []).length, "THREE Do placements").toBe(3);
  expect(stripA!.stream.length, "the strip's stream length").toBe(271);

  // the full-size placement first
  expect(stripA!.stream, "the full-size flip first").toContain("738 0 0 -26 0 26 cm");

  // THE SHIMMER-BLUE RE-FILL: `.1059 .2902 1 RG` over the 2^-13-unit sliver
  // (rgb(27,74,255) — the border-shimmer blue, 4-decimal print granularity)
  expect(stripA!.stream, "the shimmer-blue fill").toContain(".1059 .2902 1 RG");
  expect(stripA!.stream, "the sliver re-fill").toContain("738 26 .000122070313 .000122070313 re");

  // the T-invariance by value: the interior frame-stable modulo the /X names
  expect(normNames(stripB!.stream), "the strip's normalized value frame-stable").toBe(normNames(stripA!.stream));
  expect(stripB!.stream, "the raw delta the name-renumbering only").not.toBe(stripA!.stream);

  // the static /Matrix identical at both frames (the S65 single-matrix law)
  expect(stripB!.matrix, "the /Matrix frame-stable").toBe("0.99999988,0,0,0.9999972,81,946");
  expect(stripA!.matrix, "the /Matrix present @1700").toBe(stripB!.matrix);
});
