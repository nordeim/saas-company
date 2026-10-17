import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 64 — THE THIRTY-NINTH SURFACE: the /SMask-in-gs INTERIOR
 * DECOMPOSITION under the pinned-frame contract (D220, law-quality). The
 * S63/D219 record left the pinned landing's two T-INVARIANT structural
 * deltas unattributed: the live's /SMask pair (13 v 11) and the clone's
 * extra @51 alpha slot (2 v 1). THE S64 INSTRUMENT decomposed both to the
 * element level (research/smask-*-s64.py, both sides pinned at T=1700):
 *
 * (a) THE 13v11 PAIR ATTRIBUTED — the live's two extra /SMask entries are
 *     gs objects set by TILING PATTERNS that fill FUNCTION-BASED GRADIENTS
 *     (shadingType 1, the two pinned organic-gradient phases) over the
 *     hero band [0, 62, 596, 587], each masked through a /Luminosity group
 *     painting an AXIAL GRADIENT IN THE OPPOSITE DIRECTION ([0,0,128,0] v
 *     [128,0,0,0]) — the two organic-gradient hero text elements (the h1
 *     @14s + the gradient span @6s, D219's own census) printed by the
 *     live's engine as gradient-through-gradient-mask chains. The clone
 *     prints the IDENTICAL visual (D217 word census, S58 text positions,
 *     D219 alpha core all EQUAL) through mask-free paths — 4 fewer
 *     shading patterns (10 v 14).
 *
 * (b) THE @51 SLOT ATTRIBUTED — both sides draw the same 0.2-alpha
 *     decorations (the hero-band path + the four card forms at identical
 *     geometry); the LIVE dedups them into ONE gs object reused across
 *     five owner contexts, the CLONE emits TWO (the hero-band path's gs +
 *     the card forms' gs) — same /BM,/ca shape, same /Normal, same value:
 *     a pure object-identity dedup family, no visual difference.
 *
 * (c) THE /TR INTERIOR DISCOVERY — the shared /Alpha SMask carries a
 *     funcType-4 transfer function `{1 exch sub}` (Domain [0,1]) — an
 *     alpha-INVERTING transfer INSIDE the mask, the first transfer
 *     function found anywhere in either tree. The D218 top-level
 *     transfer-function empty-set law is untouched: this is the SMask
 *     INTERIOR layer, beneath every prior census's scan depth.
 *
 * NO src/ fix required — engine-emission families with identical visuals.
 * This spec pins the CLONE side of the decomposition: the SMask interior
 * census (D220a), the shading-pattern census (D220b), the @51 dedup
 * split (D220c), and the /TR inversion law (D220d).
 *
 * The dwell contract: the S63 pinned-frame form verbatim (1280x720 +
 * networkidle + 4000ms + pause-every-WAAPI-animation at T=1700 + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s64-pin-${name}.pdf`);

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

// ---------- the qpdf interior reader (base64 streams + string refs) ----------

type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};
type Norm = Record<string, QpdfObj>;

const asRef = (v: unknown): string | null =>
  typeof v === "string" && /^\d+ \d+ R$/.test(v) ? v : null;

const qpdfNorm = (file: string): Norm => {
  const jsonFile = file.replace(/\.pdf$/, ".s64.json");
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

const GS_KEYS = new Set([
  "/Type", "/LW", "/LJ", "/LC", "/ML", "/D", "/RI", "/FL", "/CA", "/ca",
  "/BM", "/SMask", "/SA", "/AIS", "/TK", "/Font", "/SP", "/OP", "/op",
  "/OPM", "/BG", "/BG2", "/UCR", "/UCR2", "/TR", "/TR2", "/HT",
]);

const isGsLike = (d: Record<string, unknown>) =>
  Object.keys(d).length > 0 && Object.keys(d).every((k) => GS_KEYS.has(k));

// ---------- the interior census ----------

interface SmaskEntry {
  kind: string; // "/None" | "/Luminosity" | "/Alpha"
  bbox: number[] | null;
  hasTr: boolean;
  gsKeys: string[];
}
interface ShadingEntry {
  patternType: number;
  shadingType: number;
  coords: number[] | null;
  domain: number[] | null;
}
interface InteriorCensus {
  smask: SmaskEntry[];
  smaskByKind: Record<string, number>;
  smaskBboxMultiset: Record<string, number>;
  shading: ShadingEntry[];
  shadingCoordsMultiset: Record<string, number>;
  heroBandMaskedFills: number;
  at51: Array<{ shape: string; bm: unknown; owners: number }>;
  alphaTr: { funcType: unknown; domain: unknown; stream: string } | null;
}

const bboxKey = (b: unknown) => (Array.isArray(b) ? (b as number[]).join(",") : "null");

const interiorCensus = (file: string): InteriorCensus => {
  const norm = qpdfNorm(file);

  // the SMask-bearing gs objects, decomposed
  const smask: SmaskEntry[] = [];
  let alphaTr: InteriorCensus["alphaTr"] = null;
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o) ?? (o as { value?: Record<string, unknown> }).value ?? null;
    if (!d || typeof d !== "object" || !isGsLike(d) || !("/SMask" in d)) continue;
    const sm = d["/SMask"];
    if (sm === "/None") {
      smask.push({ kind: "/None", bbox: null, hasTr: false, gsKeys: Object.keys(d).filter((x) => x !== "/Type").sort() });
      continue;
    }
    const smd = dictOf(norm, deref(norm, sm));
    if (!smd) continue;
    const kind = String(smd["/S"] ?? "?");
    const g = dictOf(norm, deref(norm, smd["/G"]));
    const bbox = Array.isArray(g?.["/BBox"]) ? (g!["/BBox"] as number[]) : null;
    const hasTr = "/TR" in smd;
    if (hasTr && kind === "/Alpha" && !alphaTr) {
      const trd = dictOf(norm, deref(norm, smd["/TR"]));
      alphaTr = {
        funcType: trd?.["/FunctionType"] ?? null,
        domain: trd?.["/Domain"] ?? null,
        stream: decodeB64(dataOf(deref(norm, smd["/TR"]))),
      };
    }
    smask.push({
      kind,
      bbox,
      hasTr,
      gsKeys: Object.keys(d).filter((x) => x !== "/Type").sort(),
    });
    // count owner refs only once per gs object (k unused; kept for debug)
    void k;
  }

  // the shading patterns (PatternType 2)
  const shading: ShadingEntry[] = [];
  for (const o of Object.values(norm)) {
    const d = dictOf(norm, o);
    if (!d || d["/PatternType"] !== 2) continue;
    const sh = dictOf(norm, deref(norm, d["/Shading"]));
    shading.push({
      patternType: 2,
      shadingType: (sh?.["/ShadingType"] as number) ?? -1,
      coords: Array.isArray(sh?.["/Coords"]) ? (sh!["/Coords"] as number[]) : null,
      domain: Array.isArray(sh?.["/Domain"]) ? (sh!["/Domain"] as number[]) : null,
    });
  }

  // the hero-band masked fills: any stream that sets an SMask'd gs then
  // fills over [0, 62, 596, 587] (the live's masked gradient chains — the
  // clone must have NONE)
  let heroBandMaskedFills = 0;
  for (const o of Object.values(norm)) {
    const s = decodeB64(dataOf(o));
    if (!s || !/0 62 596 525 re/.test(s)) continue;
    // is the gs set in this stream SMask-bearing?
    const d = dictOf(norm, o);
    const res = d ? dictOf(norm, deref(norm, d["/Resources"])) : null;
    const egs = res ? dictOf(norm, deref(norm, res["/ExtGState"])) : null;
    const m = s.match(/\/(\w+)\s+gs/);
    if (m && egs) {
      const ref = egs[`/${m[1]}`];
      const gd = dictOf(norm, deref(norm, ref));
      if (gd && isGsLike(gd) && "/SMask" in gd) heroBandMaskedFills++;
    }
  }

  // the @51 dedup split: ca=0.2 /BM,/ca gs objects + their owner counts
  const at51: InteriorCensus["at51"] = [];
  const ownerIndex = new Map<string, number>();
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d) continue;
    const res = dictOf(norm, deref(norm, d["/Resources"]));
    if (!res) continue;
    const egs = dictOf(norm, deref(norm, res["/ExtGState"]));
    if (!egs) continue;
    for (const [nm, ref] of Object.entries(egs)) {
      void nm;
      const rk = asRef(ref);
      if (!rk) continue;
      const key = `obj:${rk}`;
      ownerIndex.set(key, (ownerIndex.get(key) ?? 0) + 1);
    }
  }
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o) ?? (o as { value?: Record<string, unknown> }).value ?? null;
    if (!d || !isGsLike(d) || !("/ca" in d)) continue;
    const ca = d["/ca"];
    if (typeof ca !== "number" || Math.abs(ca - 0.2) > 1e-9) continue;
    const shape = Object.keys(d).filter((x) => x !== "/Type").sort().join(",");
    if (shape !== "/BM,/ca") continue; // the multiset members only
    at51.push({ shape, bm: d["/BM"], owners: ownerIndex.get(k) ?? 0 });
  }

  const smaskByKind: Record<string, number> = {};
  for (const e of smask) smaskByKind[e.kind] = (smaskByKind[e.kind] ?? 0) + 1;
  const smaskBboxMultiset: Record<string, number> = {};
  for (const e of smask) {
    if (e.kind === "/None") continue;
    const key = bboxKey(e.bbox);
    smaskBboxMultiset[key] = (smaskBboxMultiset[key] ?? 0) + 1;
  }
  const shadingCoordsMultiset: Record<string, number> = {};
  for (const e of shading) {
    const key = `${e.shadingType}:${bboxKey(e.coords)}`;
    shadingCoordsMultiset[key] = (shadingCoordsMultiset[key] ?? 0) + 1;
  }

  return {
    smask,
    smaskByKind,
    smaskBboxMultiset,
    shading,
    shadingCoordsMultiset,
    heroBandMaskedFills,
    at51,
    alphaTr,
  };
};

// ---------- D220a: the SMask interior census ----------

test("D220a the SMask interior census — 11 decomposed (8 Luminosity + 2 Alpha + 1 None)", async ({ page }) => {
  test.setTimeout(120_000);
  const { pinned } = await pinnedPrint(page, 1700, "int");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const c = interiorCensus(pdfFile("int"));
  // THE KIND CENSUS: the clone's 11 = 8 /Luminosity + the /Alpha PAIR (the
  // /TR-bearing mask + its plain sibling) + the explicit /None. The live's
  // 13 = these 11 + TWO /Luminosity chains over the hero band (the
  // masked gradient-text family — D220b's absence law)
  expect(c.smask.length, "the SMask-bearing gs count (the D219b T-invariant 11)").toBe(11);
  expect(c.smaskByKind, "the kind decomposition").toEqual({ "/Luminosity": 8, "/None": 1, "/Alpha": 2 });
  // THE BBOX SIGNATURE MULTISET (the shared 11's regions — the live's 13
  // adds two [0,62,596,587] entries this multiset must NOT contain)
  expect(c.smaskBboxMultiset, "the mask-region multiset").toEqual({
    "0,0,596,843": 3,
    "698,973,1324,1177": 1,
    "656,949,1366,1237": 1,
    "0,0,1169,149": 2,
    "52,30,593,190": 1,
    "10,6,635,251": 1,
    "122,150,247,275": 1,
  });
});

// ---------- D220b: the shading-pattern census + the hero-band law ----------

test("D220b the shading census — 10 patterns, the masked gradient chains absent", async ({ page }) => {
  test.setTimeout(120_000);
  await pinnedPrint(page, 1700, "shade");
  const c = interiorCensus(pdfFile("shade"));
  // THE SHADING CENSUS: the clone's 10 (the live's 14 = these + the two
  // masked gradient-text chains: P180/P181 + P186/P187, the 13v11 pair's
  // payload — 2 function-based fills + their 2 axial mask gradients)
  expect(c.shading.length, "the shading-pattern count (the live's 14 minus the masked pair)").toBe(10);
  // the family inventory at the value level (shadingType + Coords):
  // 4 function-based (type 1, no Coords) + the axial family
  expect(c.shadingCoordsMultiset, "the shading family multiset").toEqual({
    "1:null": 4,
    "2:0,0,795,0": 1,
    "2:0,0,0,128": 1,
    "2:0,0,0,1332": 2,
    "2:0,0,40,40": 1,
    "2:0,0,499,0": 1,
  });
  // THE HERO-BAND LAW: no SMask'd fill over [0,62,596,587] on the clone —
  // the live's gradient-through-gradient-mask chains are the live-only
  // emission family (the identical visual prints mask-free here)
  expect(c.heroBandMaskedFills, "no masked hero-band fills on the clone").toBe(0);
});

// ---------- D220c: the @51 dedup split ----------

test("D220c the @51 slot attributed — the dedup family split (1 + >=3 owners)", async ({ page }) => {
  test.setTimeout(120_000);
  await pinnedPrint(page, 1700, "at51");
  const c = interiorCensus(pdfFile("at51"));
  // THE DEDUP FAMILY: exactly TWO ca=0.2 /BM,/ca /Normal gs objects on the
  // clone (the live's ONE object serves all five owner contexts — same
  // value, same shape, the pure object-identity dedup delta of D219b's
  // @51 x2 structural slot)
  expect(c.at51.length, "the @51 multiset members (the D219b x2)").toBe(2);
  expect(c.at51.every((e) => e.shape === "/BM,/ca" && e.bm === "/Normal"), "both /Normal alpha-only").toBe(true);
  const owners = c.at51.map((e) => e.owners).sort((a, b) => a - b);
  // the split: the hero-band path's gs (ONE owner) + the card forms' gs
  // (the four card-form owners) — the live's single G39 spans all five
  expect(owners[0], "the hero-band gs has a single owner").toBe(1);
  expect(owners[1], "the card-forms gs has the card owners").toBeGreaterThanOrEqual(3);
});

// ---------- D220d: the /TR inversion law ----------

test("D220d the /TR interior — the shared /Alpha mask's {1 exch sub} inversion", async ({ page }) => {
  test.setTimeout(120_000);
  await pinnedPrint(page, 1700, "tr");
  const c = interiorCensus(pdfFile("tr"));
  // THE FIRST TRANSFER FUNCTION IN EITHER TREE — inside the /Alpha SMask
  // (the D218 top-level empty-set law untouched: this is the interior
  // layer beneath every prior census's scan depth)
  expect(c.alphaTr, "the /Alpha mask carries a /TR").not.toBeNull();
  expect(c.alphaTr!.funcType, "a PostScript calculator function").toBe(4);
  expect(c.alphaTr!.domain, "the unit domain").toEqual([0, 1]);
  expect(c.alphaTr!.stream, "the alpha-INVERTING body").toBe("{1 exch sub}");
});
