import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 66 — THE FORTY-FIRST SURFACE: the content-stream /scn
 * PATTERN-INVOCATION LAYER under the pinned-frame contract (D222,
 * law-quality). The S65 pattern-tree law measured the pattern OBJECTS;
 * this surface measures WHERE the document invokes them — every
 * `/Pattern cs` + `<name> scn` site in every page + form stream, the
 * names resolved BY VALUE through each owner's /Resources//Pattern
 * table (lesson 104: the clone's object numbers renumber between
 * prints; the interiors do not).
 *
 * (a) THE INVOCATION-SITE CENSUS — every scn site lives in a FORM
 *     XObject (ZERO page-stream invocations), and every invoked
 *     pattern is invoked EXACTLY ONCE (the one-invocation-per-pattern
 *     law). The clone: 7 sites = 3 tilings + 4 shadings.
 *
 * (b) THE SHADING-INVOCATION VALUE MIRROR — the 4 axial shading
 *     invocations carry the D221b family values VERBATIM at the
 *     invocation layer: the [0,0,0,128] black->white exponential, the
 *     [0,0,40,40] 0.2->0.1 exponential, the [0,0,499,0] and
 *     [0,0,795,0] stitched two-exponential chains at Bounds [0.5] —
 *     the same mathematical values the live invokes (the cross-side
 *     mirror measured on the S66 recon walk).
 *
 * (c) THE TILING-INVOCATION BBOX CENSUS — the logo tile [0,0,201,201]
 *     + the icon tile [122,150,247,275] (both invoked on the live too)
 *     + the border-shimmer strip [0,0,738.00012,26.000122] (the
 *     single-Matrix tiling, D221d); NO hero-band [0,62,596,587]
 *     invocation (the live's masked-chain pair [0,0,128,0] /
 *     [128,0,0,0] is the D220 family the clone prints mask-free).
 *
 * (d) THE T-INVARIANCE WITH THE NAME-RENUMBERING LAW — the invocation
 *     census is byte-identical across T=1700/T=1000 BY VALUE; the
 *     tiling streams differ across prints ONLY in nested name tokens
 *     (/X97 Do -> /X96 Do — the name-allocation renumbering INSIDE
 *     the pattern streams, beneath the S65 object-level law) + engine
 *     float epsilon at degenerate subatomic scales (1e-8 — the second
 *     logo paint's near-zero cm scale).
 *
 * NO src/ fix required — engine-emission families with identical
 * visuals. This spec pins the CLONE side so any drift surfaces at the
 * gate. The dwell contract: the S63/S64/S65 pinned-frame form verbatim
 * (1280x720 + networkidle + 4000ms + pause-every-WAAPI-animation at T
 * + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s66-scn-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-65 form, verbatim) ----------

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

// ---------- the qpdf reader (the S65 reader + the invocation layer) ----------

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

// ---------- the function-interior reader (the S65 form) ----------

interface FuncInterior {
  type: unknown;
  C0?: unknown;
  C1?: unknown;
  bounds?: unknown;
  subs?: FuncInterior[];
}

const funcInterior = (norm: Norm, fv: unknown): FuncInterior | null => {
  const fd = dictOf(norm, deref(norm, fv));
  if (!fd) return null;
  const ft = fd["/FunctionType"];
  if (ft === 2) {
    return { type: 2, C0: fd["/C0"], C1: fd["/C1"] };
  }
  if (ft === 4) {
    return { type: 4 };
  }
  if (ft === 3) {
    const subsRaw = fd["/Functions"];
    const subs = Array.isArray(subsRaw)
      ? subsRaw.map((s) => funcInterior(norm, s)).filter((x): x is FuncInterior => x !== null)
      : [];
    return { type: 3, bounds: fd["/Bounds"], subs };
  }
  return { type: ft };
};

// ---------- D222: the /scn invocation census ----------

interface ScnSite {
  obj: string;
  kind: "page" | "form";
  name: string;
  value: string;
}

/** Walk every page + form content stream; find the `/Pattern cs ... <name>
 * scn` invocation sites; resolve each name through the owner stream's
 * /Resources//Pattern table to the TARGET pattern's VALUE identity. */
const scnCensus = (norm: Norm): ScnSite[] => {
  // the owner -> name -> ref tables
  const tables = new Map<string, Record<string, unknown>>();
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d) continue;
    const res = dictOf(norm, deref(norm, d["/Resources"]));
    const pats = res ? (dictOf(norm, deref(norm, res["/Pattern"])) as Record<string, unknown> | null) : null;
    if (pats) tables.set(k, pats);
  }
  const patternValue = (ref: unknown): string => {
    const d = dictOf(norm, deref(norm, ref));
    if (!d) return "UNRESOLVED";
    const pt = d["/PatternType"];
    if (pt === 1) {
      const bbox = Array.isArray(d["/BBox"]) ? (d["/BBox"] as number[]) : [];
      return `t1:bbox[${bbox.join(",")}]`;
    }
    if (pt === 2) {
      const sh = dictOf(norm, deref(norm, d["/Shading"]));
      if (!sh) return "t2:?";
      const fn = "/Function" in sh ? funcInterior(norm, sh["/Function"]) : null;
      return `t2:st${String(sh["/ShadingType"])}:coords[${(Array.isArray(sh["/Coords"]) ? (sh["/Coords"] as number[]) : []).join(",")}]:fn:${JSON.stringify(fn)}`;
    }
    return `t${String(pt)}`;
  };
  const sites: ScnSite[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const raw = dataOf(o);
    if (!raw) continue;
    const d = dictOf(norm, o);
    if (!d) continue;
    const isPage = d["/Type"] === "/Page";
    const isForm = d["/Subtype"] === "/Form" || d["/Subtype"] === "/PSForm";
    if (!isPage && !isForm) continue;
    const stream = decodeB64(raw);
    const re = /\/Pattern\s+cs([\s\S]*?)((\/[A-Za-z0-9]+)\s+scn)/g;
    for (const m of stream.matchAll(re)) {
      const name = m[3]!;
      const tab = tables.get(k) ?? {};
      sites.push({
        obj: k,
        kind: isPage ? "page" : "form",
        name,
        value: name in tab ? patternValue(tab[name]) : "UNRESOLVED",
      });
    }
  }
  return sites;
};

// ---------- D222d: the name-renormalizing stream identity ----------

/** The tiling stream identity with the nested name tokens normalized away
 * (/X<n> /P<n> /G<n> /Cs<n> /Cs<n>CS — the name-allocation renumbering)
 * + the engine float epsilon quantized to 1e-6 (the degenerate subatomic
 * scales: .0000000596 v .0000000298 both quantize to 0.000000). */
const normalizeStream = (s: string): string =>
  s
    .replace(/\/([XPG]|Cs\d?)[0-9]+/g, "/$1#")
    .replace(/-?\d*\.\d{7,}/g, (m) => Number(m).toFixed(6))
    .replace(/-?0\.000000\b/g, "0.000000");

interface TilingStream {
  bbox: string;
  identity: string;
}

const tilingStreams = (norm: Norm): TilingStream[] => {
  const out: TilingStream[] = [];
  for (const o of Object.values(norm)) {
    const d = dictOf(norm, o);
    if (!d || d["/PatternType"] !== 1) continue;
    const bbox = (Array.isArray(d["/BBox"]) ? (d["/BBox"] as number[]) : []).join(",");
    out.push({ bbox, identity: normalizeStream(decodeB64(dataOf(o))) });
  }
  return out.sort((a, b) => a.bbox.localeCompare(b.bbox));
};

// ---------- D222a: the invocation-site census ----------

test("D222a the invocation-site census — 7 form sites, zero page-stream, one per pattern", async ({ page }) => {
  test.setTimeout(180_000);
  const { file, pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const sites = scnCensus(qpdfNorm(file, "a"));
  expect(sites.length, "the invocation-site count (3 tilings + 4 shadings)").toBe(7);
  expect(sites.filter((s) => s.kind === "page"), "ZERO page-stream invocations").toEqual([]);
  expect(new Set(sites.map((s) => s.kind)), "every site in a FORM XObject").toEqual(new Set(["form"]));
  expect(new Set(sites.map((s) => s.value)).size, "every invoked pattern invoked EXACTLY ONCE").toBe(7);
  expect(sites.every((s) => s.value !== "UNRESOLVED"), "every name resolves through its owner's table").toBe(true);
});

// ---------- D222b: the shading-invocation value mirror ----------

test("D222b the shading invocations carry the D221b family values at the fill sites", async ({ page }) => {
  test.setTimeout(120_000);
  const { file } = await pinnedPrint(page, 1700, "b");
  const shadings = scnCensus(qpdfNorm(file, "b"))
    .map((s) => s.value)
    .filter((v) => v.startsWith("t2:"))
    .sort();
  expect(shadings.length, "the shading-invocation count").toBe(4);
  expect(shadings).toEqual([
    't2:st2:coords[0,0,0,128]:fn:{"type":2,"C0":[0,0,0],"C1":[1,1,1]}',
    't2:st2:coords[0,0,40,40]:fn:{"type":2,"C0":[0.2,0.2,0.2],"C1":[0.1,0.1,0.1]}',
    't2:st2:coords[0,0,499,0]:fn:{"type":3,"bounds":[0.5],"subs":[{"type":2,"C0":[0,0,0],"C1":[0.3,0.3,0.3]},{"type":2,"C0":[0.3,0.3,0.3],"C1":[0,0,0]}]}',
    't2:st2:coords[0,0,795,0]:fn:{"type":3,"bounds":[0.5],"subs":[{"type":2,"C0":[0.8,0.8,0.8],"C1":[0.5,0.5,0.5]},{"type":2,"C0":[0.5,0.5,0.5],"C1":[0.3,0.3,0.3]}]}',
  ]);
});

// ---------- D222c: the tiling-invocation bbox census ----------

test("D222c the tiling invocations — logo + icon + the shimmer strip, no hero-band", async ({ page }) => {
  test.setTimeout(120_000);
  const { file } = await pinnedPrint(page, 1700, "c");
  const tilings = scnCensus(qpdfNorm(file, "c"))
    .map((s) => s.value)
    .filter((v) => v.startsWith("t1:"))
    .sort();
  expect(tilings.length, "the tiling-invocation count").toBe(3);
  expect(tilings, "the bbox census (the live's 2 shared + the clone's shimmer strip)").toEqual([
    "t1:bbox[0,0,201,201]",
    "t1:bbox[0,0,738.00012,26.000122]",
    "t1:bbox[122,150,247,275]",
  ]);
  // NO hero-band invocation — the live's masked-chain pair ([0,0,128,0] /
  // [128,0,0,0], the D220 family) is ABSENT: the clone paints the same
  // visual mask-free (the full-page gradient tiles, the D221d law)
  expect(
    tilings.filter((v) => v.includes("0,62,596,587")),
    "no hero-band tiles at the invocation layer",
  ).toEqual([]);
});

// ---------- D222d: the T-invariance with the name-renumbering law ----------

test("D222d the invocation census is T-invariant by value; the tiling streams renumber-only", async ({ page }) => {
  test.setTimeout(180_000);
  const a = await pinnedPrint(page, 1700, "da");
  const b = await pinnedPrint(page, 1000, "db");
  const cA = scnCensus(qpdfNorm(a.file, "da"));
  const cB = scnCensus(qpdfNorm(b.file, "db"));
  // THE INVOCATION CENSUS: byte-identical BY VALUE across the frames
  // (the name tokens renumber on the clone — P101@1700 -> P100@1000 —
  // the resolved values do not)
  expect(cB.length).toBe(cA.length);
  expect([...cB.map((s) => s.value)].sort()).toEqual([...cA.map((s) => s.value)].sort());
  // THE TILING-STREAM RENUMBERING LAW: with the nested name tokens
  // normalized (/X# /P# /G#) + the 1e-6 epsilon quantized, every tiling
  // stream is byte-identical across the frames — the S65 object-level
  // law now measured INSIDE the pattern streams
  const tA = tilingStreams(qpdfNorm(a.file, "da"));
  const tB = tilingStreams(qpdfNorm(b.file, "db"));
  expect(tB.map((t) => t.bbox), "the tiling bbox family is T-invariant").toEqual(tA.map((t) => t.bbox));
  expect(
    tB.map((t) => t.identity),
    "the renormalized tiling streams are byte-identical across T",
  ).toEqual(tA.map((t) => t.identity));
  // the honest raw check: the UN-normalized streams DO differ across
  // prints (the renumbering + the epsilon) — pinning that they differ
  // only in those families would overreach; the normalized identity is
  // the durable contract. The census covers the FULL tiling tree (the
  // D221d six), of which exactly three carry scn invocation sites (D222c)
  expect(tA.length).toBe(6);
});
