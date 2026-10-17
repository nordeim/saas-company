import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 65 — THE FORTIETH SURFACE: the GRADIENT-FUNCTION VALUE LAYER
 * under the pinned-frame contract (D221, law-quality). The D220 attribution
 * gave the exact objects (the two organic-gradient hero-text elements);
 * THE S65 INSTRUMENT walked the FULL function interiors of both sides'
 * pinned landings (T=1700 + T=1000, qpdf --json, the pattern tree included):
 *
 * (a) THE FUNCTION-INTERIOR T-INVARIANCE LAW — every shading function
 *     interior on BOTH sides is BYTE-IDENTICAL across T (the live's 14:
 *     6 type-4 PostScript bodies + 8 axial exponentials; the clone's 10:
 *     4 + 6). The gradient STOP VALUES are NOT the animation carrier: the
 *     "organic gradient" family's phase lives entirely in the ALPHA layer
 *     (the D219 phase slots) — the color functions are constants. The
 *     pinned-determinism law now extends to the deepest interior layer
 *     measured (beneath the D220 SMask census, inside the functions).
 *
 * (b) THE CROSS-SIDE VALUE CONVERGENCE — the shared animated pair's
 *     constants converge to the same mathematical values at engine-specific
 *     float precision: the live's -.083333351 / .50000012 / .60000002 v the
 *     clone's -.083333373 / .50000024 / .59999925 (deltas <= 1.2e-7) + the
 *     clone's epsilon carriers (.00000063773246 / -.0000038263947) where
 *     the live prints plain 0 — the lightningcss v browser-engine
 *     computation residue, invisible at 8-bit rendering (the D59 hsl-float
 *     family's descendant, now inside the print pipeline's functions).
 *
 * (c) THE PATTERN-TREE T-STRUCTURE — the live's 7 v the clone's 6 tiling
 *     patterns, both structure-T-invariant; NO /Matrix on ANY pattern (the
 *     background-position is not an animated print carrier); the live's
 *     hero-band masked-chain pair ([0,62,596,587], the D220 family) absent
 *     on the clone — its hero gradients fill as full-page [0,0,596,843]
 *     tiles, mask-free.
 *
 * NO src/ fix required — engine-emission families with identical visuals.
 * This spec pins the CLONE side: the T-invariance (D221a), the function
 * census (D221b), the animated pair's exact constants (D221c), and the
 * pattern-tree law (D221d).
 *
 * The dwell contract: the S63/S64 pinned-frame form verbatim (1280x720 +
 * networkidle + 4000ms + pause-every-WAAPI-animation at T + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s65-pin-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63 spec, verbatim) ----------

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

// ---------- the qpdf interior reader (S64's reader + the function layer) ----------

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

const dataOf = (v: unknown): string | null => {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if ("stream" in o && o.stream && typeof o.stream === "object") {
    return ((o.stream as { data?: string }).data) ?? null;
  }
  if ("data" in o) return (o as { data?: string }).data ?? null;
  return null;
};

const decodeB64 = (s: string | null): string => {
  if (!s) return "";
  return Buffer.from(s, "base64").toString("latin1");
};

// ---------- the gradient-function census ----------

interface FuncInterior {
  type: unknown;
  C0?: unknown;
  C1?: unknown;
  N?: unknown;
  body?: string | null;
  bounds?: unknown;
  encode?: unknown;
  subs?: FuncInterior[];
}
interface ShadingEntry {
  patternType: number;
  shadingType: number;
  coords: number[] | null;
  function: FuncInterior | null;
}
interface TilingEntry {
  bbox: number[];
  xstep: unknown;
  ystep: unknown;
  matrix: unknown;
  fills: string[];
}

const funcInterior = (norm: Norm, fv: unknown): FuncInterior | null => {
  const fd = dictOf(norm, deref(norm, fv));
  if (!fd) return null;
  const ft = fd["/FunctionType"];
  if (ft === 2) {
    return { type: 2, C0: fd["/C0"], C1: fd["/C1"], N: fd["/N"] };
  }
  if (ft === 4) {
    return { type: 4, body: decodeB64(dataOf(deref(norm, fv))).trim() };
  }
  if (ft === 3) {
    // stitched: the sub-function chain joined at /Bounds (the hero-text
    // sheen ramps are two-exponential stitches, the S55 family)
    const subsRaw = fd["/Functions"];
    const subs = Array.isArray(subsRaw)
      ? subsRaw.map((s) => funcInterior(norm, s)).filter((x): x is FuncInterior => x !== null)
      : [];
    return { type: 3, bounds: fd["/Bounds"], encode: fd["/Encode"], subs };
  }
  return { type: ft };
};

const shadingCensus = (norm: Norm): ShadingEntry[] => {
  const out: ShadingEntry[] = [];
  for (const o of Object.values(norm)) {
    const d = dictOf(norm, o);
    if (!d || d["/PatternType"] !== 2) continue;
    const sh = dictOf(norm, deref(norm, d["/Shading"]));
    if (!sh) continue;
    out.push({
      patternType: 2,
      shadingType: (sh["/ShadingType"] as number) ?? -1,
      coords: Array.isArray(sh["/Coords"]) ? (sh["/Coords"] as number[]) : null,
      function: "/Function" in sh ? funcInterior(norm, sh["/Function"]) : null,
    });
  }
  return out;
};

const tilingCensus = (norm: Norm): TilingEntry[] => {
  const out: TilingEntry[] = [];
  for (const o of Object.values(norm)) {
    const d = dictOf(norm, o);
    if (!d || d["/PatternType"] !== 1) continue;
    const res = dictOf(norm, deref(norm, d["/Resources"]));
    const pats = res && "/Pattern" in res ? dictOf(norm, deref(norm, res["/Pattern"])) : null;
    out.push({
      bbox: Array.isArray(d["/BBox"]) ? (d["/BBox"] as number[]) : [],
      xstep: d["/XStep"],
      ystep: d["/YStep"],
      matrix: "/Matrix" in d ? d["/Matrix"] : null,
      fills: pats ? Object.keys(pats).sort() : [],
    });
  }
  return out;
};

/** The function census as a comparable VALUE multiset (the object numbers
 * renumber between prints on the clone — the interiors carry the truth). */
const functionValueCensus = (sh: ShadingEntry[]): string[] => {
  const vals: string[] = [];
  for (const s of sh) {
    if (s.shadingType === 2 && s.function?.type === 2) {
      vals.push(`ax:${JSON.stringify(s.coords)}:${JSON.stringify(s.function.C0)}:${JSON.stringify(s.function.C1)}`);
    } else if (s.shadingType === 1 && s.function?.type === 4) {
      vals.push(`fn:${s.function.body}`);
    }
  }
  return vals.sort();
};

// ---------- D221a: the function-interior T-invariance law ----------

test("D221a the function-interior T-invariance — the gradient stops are constants", async ({ page }) => {
  test.setTimeout(180_000);
  const a = await pinnedPrint(page, 1700, "ia");
  expect(a.pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const b = await pinnedPrint(page, 1000, "ib");
  const cA = functionValueCensus(shadingCensus(qpdfNorm(a.file, "ia")));
  const cB = functionValueCensus(shadingCensus(qpdfNorm(b.file, "ib")));
  // THE LAW: the full function census (the type-4 bodies + the axial
  // exponentials' C0/C1/Coords) is IDENTICAL across the two pinned frames —
  // compared BY VALUE (the object numbers renumber; the interiors do not)
  expect(cB.length, "the function count is T-invariant").toBe(cA.length);
  expect(cB, "the function-interior census is BYTE-IDENTICAL across T").toEqual(cA);
});

// ---------- D221b: the shading-function census ----------

test("D221b the shading-function census — 4 type-4 + 6 axial, the D220b families", async ({ page }) => {
  test.setTimeout(120_000);
  const { file } = await pinnedPrint(page, 1700, "sb");
  const sh = shadingCensus(qpdfNorm(file, "sb"));
  expect(sh.length, "the shading-pattern count (the D220b 10)").toBe(10);
  const byType: Record<number, number> = {};
  for (const s of sh) byType[s.shadingType] = (byType[s.shadingType] ?? 0) + 1;
  expect(byType, "4 function-based + 6 axial").toEqual({ 1: 4, 2: 6 });
  // the axial family decomposed to the FUNCTION level: 2 plain exponentials
  // + 4 STITCHED (two-exponential chains joined at Bounds [0.5] — the
  // hero-text sheen ramps [1,1,1]->[0.9765,0.9804,0.9843]->[1,1,1] the
  // symmetric pair over the 1332pt vertical extent, the S55 stitch family)
  const axial = sh
    .filter((s) => s.shadingType === 2)
    .map((s) => {
      const f = s.function!;
      if (f.type === 2) return `${s.coords!.join(",")}|exp:${JSON.stringify(f.C0)}->${JSON.stringify(f.C1)}`;
      if (f.type === 3) {
        const chain = f.subs!.map((x) => `${JSON.stringify(x.C0)}->${JSON.stringify(x.C1)}`).join(";");
        return `${s.coords!.join(",")}|stitch@${JSON.stringify(f.bounds)}:${chain}`;
      }
      return `${s.coords!.join(",")}|type${JSON.stringify(f.type)}`;
    })
    .sort();
  expect(axial, "the axial function family (2 exponential + 4 stitched)").toEqual([
    "0,0,0,128|exp:[0,0,0]->[1,1,1]",
    "0,0,0,1332|stitch@[0.5]:[1,1,1]->[0.9765,0.9804,0.9843];[0.9765,0.9804,0.9843]->[1,1,1]",
    "0,0,0,1332|stitch@[0.5]:[1,1,1]->[0.9765,0.9804,0.9843];[0.9765,0.9804,0.9843]->[1,1,1]",
    "0,0,40,40|exp:[0.2,0.2,0.2]->[0.1,0.1,0.1]",
    "0,0,499,0|stitch@[0.5]:[0,0,0]->[0.3,0.3,0.3];[0.3,0.3,0.3]->[0,0,0]",
    "0,0,795,0|stitch@[0.5]:[0.8,0.8,0.8]->[0.5,0.5,0.5];[0.5,0.5,0.5]->[0.3,0.3,0.3]",
  ]);
});

// ---------- D221c: the animated pair's exact constants ----------

test("D221c the animated gradient pair — the exact pinned constants, T-invariant", async ({ page }) => {
  test.setTimeout(180_000);
  const a = await pinnedPrint(page, 1700, "ca");
  const b = await pinnedPrint(page, 1000, "cb");
  const fnA = shadingCensus(qpdfNorm(a.file, "ca"))
    .map((s) => s.function?.body ?? "").filter(Boolean).sort();
  const fnB = shadingCensus(qpdfNorm(b.file, "cb"))
    .map((s) => s.function?.body ?? "").filter(Boolean).sort();
  expect(fnA.length, "the type-4 body count").toBe(4);
  expect(fnB, "the bodies are byte-identical twins across T").toEqual(fnA);
  // THE H1 GRADIENT (the @14s family): the exact constants — the live's
  // -.083333351/.100000001 converge at the clone's -.083333373/-.099999867
  // (delta <= 2.2e-8) + the epsilon carrier .00000063773246 (the live: 0)
  const h1 = fnA.find((b2) => b2.includes(".1667")) ?? "";
  expect(h1.length, "the h1 gradient body").toBeGreaterThan(300);
  expect(h1, "the h1 family constants").toContain("-.083333373 mul .1667 add");
  expect(h1, "the h1 epsilon carrier (the live prints 0)").toContain(".00000063773246 mul 0 add");
  expect(h1, "the h1 green channel slope").toContain("-.099999867 mul .2 add");
  expect(h1, "the h1 blue channel slope (the live's .100000001)").toContain("-.100000001 mul .2 add");
  expect(h1, "the h1 high-phase family").toContain(".0833 0 .1 .1");
  // THE SPAN GRADIENT (the @6s family): .50000024 (live .50000012) +
  // the epsilon carrier -.0000038263947 (live 0) + .59999925 (live .60000002)
  const span = fnA.find((b2) => b2.includes(".50000024")) ?? "";
  expect(span.length, "the span gradient body").toBeGreaterThan(400);
  expect(span, "the span violet slope (the live's .50000012)").toContain(".50000024 mul");
  expect(span, "the span epsilon carrier").toContain("-.0000038263947 mul");
  expect(span, "the span blue slope (the live's .60000002)").toContain(".59999925 mul");
  expect(span, "the span second-half anchors").toContain(".25 add");
  expect(span, "the span low-phase anchors").toContain(".3 add");
});

// ---------- D221d: the pattern-tree law ----------

test("D221d the pattern-tree law — 6 tilings, no /Matrix, no hero-band tiles", async ({ page }) => {
  test.setTimeout(120_000);
  const { file } = await pinnedPrint(page, 1700, "db");
  const til = tilingCensus(qpdfNorm(file, "db"));
  expect(til.length, "the tiling-pattern count (the live's 7 minus the masked pair)").toBe(6);
  // THE SINGLE-MATRIX LAW: exactly ONE tiling carries a /Matrix — the
  // border-shimmer strip's PLACEMENT matrix (a static transform, not an
  // animation carrier: identical at both pinned frames; every other
  // tiling is matrix-free — the background-position is not animated)
  const withMatrix = til.filter((t) => t.matrix !== null);
  expect(withMatrix.length, "exactly one /Matrix-bearing tiling").toBe(1);
  expect(withMatrix[0]!.bbox.join(","), "the shimmer strip's tile").toBe("0,0,738.00012,26.000122");
  expect(withMatrix[0]!.matrix, "the static placement matrix").toEqual([0.99999988, 0, 0, 0.9999972, 81, 946]);
  // THE HERO-BAND ABSENCE LAW: the live's masked-chain tiles over
  // [0,62,596,587] (the D220 pair) are absent — the clone's hero gradients
  // fill as full-page tiles
  expect(til.filter((t) => t.bbox.join(",") === "0,62,596,587"), "no hero-band tiles").toEqual([]);
  const fullPage = til.filter((t) => t.bbox.join(",") === "0,0,596,843");
  expect(fullPage.length, "the full-page tile family (the gradient carriers)").toBeGreaterThanOrEqual(3);
  // the logo tile (the 125x125 family) + the border-shimmer strip
  expect(til.map((t) => t.bbox.join(",")).sort(), "the bbox family census").toEqual([
    "0,0,201,201",
    "0,0,596,843",
    "0,0,596,843",
    "0,0,596,843",
    "0,0,738.00012,26.000122",
    "122,150,247,275",
  ]);
});
