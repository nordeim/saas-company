import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 69 — THE FORTY-FOURTH SURFACE: the /SMask G-STREAM INTERIORS
 * under the pinned-frame contract (D225, law-quality). The S64 dict census
 * measured the /SMask entries at the dict level (the 13v11 pair
 * element-attributed); the S55 extension measured the G-streams on /login
 * only (the 84-byte streams, 4/4 byte-identical). THIS surface walks the
 * mask groups' OWN painting streams on the animated landing, both pinned
 * frames — every /SMask's /G form XObject: the BBox + the stream bytes +
 * the operator families + the nested resource tables, resolved BY VALUE
 * (lessons 103/104: the refs are strings; compare values, never object
 * identity or name tokens).
 *
 * (a) THE SITE CENSUS — the clone: 10 G-streams = 8 /Luminosity + 2
 *     /Alpha, every /G a /Transparency group form, every stream one of
 *     THREE operator shapes: the tiling-painting family
 *     (`/Pattern cs /P# scn + re + f*` — 4), the form-placing family
 *     (`q cm RG rg /G3 gs /X# Do Q` — 5, incl. the /Alpha Do-placement),
 *     and the plain-fill family (`RG rg /G3 gs re f` — 1, the /TR-bearing
 *     /Alpha re-fill). The bbox multiset: [0,0,596,843] x3 (the page-wide
 *     gradient pair + the third), [698,973,1324,1177] + [656,949,1366,1237]
 *     (the video-mockup placing pair), [0,0,1169,149] x2 (the animated
 *     phase form's /Alpha pair), [52,30,593,190] + [10,6,635,251] (the
 *     dashboard-mockup pair), [122,150,247,275] (the logo tile).
 *
 * (b) THE ALIGNED-BYTE-IDENTICAL SIX — the G-streams at object numbers
 *     12/18/26/30/47/48 hold their object numbers at BOTH pinned frames
 *     AND their stream bytes are frame-identical (the raw T-invariance):
 *     the page-wide tiling pair (12/18), the mockup-placing pair (26/30),
 *     the phase form's /Alpha pair (47/48). Their position BEFORE the
 *     vanishing ca230 phase-slot object keeps their numbers fixed.
 *
 * (c) THE T-INVARIANCE BY VALUE + THE RENUMBERING-BY-ONE LAW — all 10
 *     G-streams frame-stable after the name-renumbering normalization
 *     (/P150 -> /P149, /P170 -> /P169, /X119 -> /X118, /X123 -> /X122 —
 *     the S66 name-renumbering-in-stream law measured INSIDE the mask
 *     streams). The four masks whose OBJECT numbers shift (122/125/152/172
 *     -> 121/124/151/171) move by EXACTLY -1: the S68 ca230 phase-slot
 *     contraction (the gs census 33 -> 32) removes one object before them,
 *     shifting every later number down — the renumbering magnitude
 *     ATTRIBUTED to the phase-slot law one layer up.
 *
 * (d) THE /Alpha PAIR DECOMPOSITION — obj:47: the re-fill variant (len 43,
 *     `RG rg /G3 gs 0 0 1169 149 re f`), its /SMask dict the ONE carrying
 *     /TR (the S64 {1 exch sub} alpha-inverting transfer at the same
 *     object number both frames); obj:48: the /X43 Do-placement variant
 *     (len 33), painting the shared phase form. Both byte-identical
 *     across frames. The phase dependence lives in the PLACED form's own
 *     emission (the S67 len765->len635 law, one level deeper) — the mask
 *     interiors are the STABLE layer beneath it.
 *
 * The cross-side records (the S69 recon walk): the live's 12 = the clone's
 * 10 + the hero-band pair [0,62,596,587] (the D220 family independently
 * confirmed at the G-stream interior layer — two /Luminosity masks painting
 * /P# gradient tilings); the shared six byte-identical ACROSS SIDES at the
 * aligned numbers; 10/10 shared-bbox values at identical normalized
 * identities at T=1700. NO src/ fix — engine-emission families with
 * identical visuals. This spec pins the CLONE side so any drift surfaces
 * at the gate. The dwell contract: the S63-68 pinned-frame form verbatim
 * (1280x720 + networkidle + 4000ms + pause-every-WAAPI-animation at T +
 * 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s69-g-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-68 form, verbatim) ----------

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

// ---------- the qpdf reader (the S63-68 form) ----------

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

const val = (v: unknown): unknown =>
  (v as { value?: unknown } | undefined)?.value ?? v;

// ---------- D225: the /SMask G-stream interior census ----------

interface GStream {
  gs: string;
  objNum: number;
  kind: string;
  bbox: string;
  groupS: string;
  stream: string;
  smaskKeys: string;
}

const GS_KEYS = new Set([
  "/Type", "/LW", "/LJ", "/LC", "/ML", "/D", "/RI", "/FL", "/CA", "/ca",
  "/BM", "/SMask", "/SA", "/AIS", "/TK", "/Font", "/SP", "/OP", "/op",
  "/OPM", "/BG", "/BG2", "/UCR", "/UCR2", "/TR", "/TR2", "/HT",
]);

/** Walk every gs-like object carrying a non-None /SMask; resolve its /G
 * form XObject's interior (BBox + /Group/S + the decoded stream + the
 * /SMask dict's own key shape). */
const gCensus = (norm: Norm): GStream[] => {
  const out: GStream[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d || typeof d !== "object") continue;
    const ks = Object.keys(d);
    if (ks.length === 0 || !ks.every((x) => GS_KEYS.has(x))) continue;
    if (!("/SMask" in d) || d["/SMask"] === "/None") continue;
    const smd = dictOf(norm, deref(norm, d["/SMask"]));
    if (!smd) continue;
    const kind = String(val(smd["/S"]));
    const g = dictOf(norm, deref(norm, smd["/G"]));
    if (!g) continue;
    const bbox = Array.isArray(g["/BBox"])
      ? (g["/BBox"] as unknown[]).map((x) => val(x)).join(",")
      : "?";
    const groupD = dictOf(norm, deref(norm, g["/Group"]));
    const groupS = groupD ? String(val(groupD["/S"])) : "-";
    const stream = decodeB64(dataOf(deref(norm, smd["/G"])));
    const m = k.match(/^obj:(\d+)/);
    out.push({
      gs: k,
      objNum: m ? Number(m[1]) : -1,
      kind,
      bbox,
      groupS,
      stream,
      smaskKeys: Object.keys(smd).sort().join(","),
    });
  }
  return out;
};

/** The operator-family classifier: the four canonical G-stream shapes —
 * the tiling-painting family (scn + f*), the q/Q-wrapped form-placing
 * family, the bare-Do placement (obj:48 — a Do with NO q/Q wrapper), and
 * the plain re-fill (obj:47). */
const familyOf = (s: string): string => {
  if (s.includes("scn") && s.includes("f*")) return "tilingPainting";
  if (s.includes("Do") && s.includes("q\n") && s.includes("Q\n")) return "formPlacing";
  if (s.includes("Do")) return "bareDo";
  if (s.includes("re\n") && s.includes("f\n")) return "plainFill";
  return "other";
};

/** The name-renumbering normalization (lesson 104): /P150 -> /P#,
 * /X119 -> /X#, /G3 -> /G# — the VALUE identity beneath the
 * name-allocation renumbering. */
const normNames = (s: string): string => s.replace(/\/([PGX])(\d+)\b/g, "/$1#");

const multiset = (values: string[]): Record<string, number> => {
  const m: Record<string, number> = {};
  for (const v of values) m[v] = (m[v] ?? 0) + 1;
  return m;
};

// ---------- D225a: the site census ----------

test("D225a the G-stream site census — 10 streams (8 /Luminosity + 2 /Alpha), every /G a /Transparency group, the three operator families", async ({ page }) => {
  test.setTimeout(180_000);
  const { file, pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const gs = gCensus(qpdfNorm(file, "a"));
  expect(gs.length, "the G-stream count").toBe(10);
  expect(multiset(gs.map((g) => g.kind)), "the /S kind split").toEqual({
    "/Luminosity": 8,
    "/Alpha": 2,
  });
  // every /G a transparency group form
  expect(gs.every((g) => g.groupS === "/Transparency"), "every /G a /Transparency group").toBe(true);
  // the bbox multiset (the 7 distinct bboxes at exact multiplicities)
  expect(multiset(gs.map((g) => g.bbox)), "the bbox multiset").toEqual({
    "0,0,596,843": 3,
    "698,973,1324,1177": 1,
    "656,949,1366,1237": 1,
    "0,0,1169,149": 2,
    "52,30,593,190": 1,
    "10,6,635,251": 1,
    "122,150,247,275": 1,
  });
  // the four operator families at the exact split (the bare-Do placement
  // its own shape — obj:48's Do carries no q/Q wrapper)
  expect(multiset(gs.map((g) => familyOf(g.stream))), "the operator-family split").toEqual({
    tilingPainting: 4,
    formPlacing: 4,
    plainFill: 1,
    bareDo: 1,
  });
  expect(gs.every((g) => familyOf(g.stream) !== "other"), "zero unclassified streams").toBe(true);
});

// ---------- D225b: the aligned-byte-identical six ----------

test("D225b the aligned six — obj 12/18/26/30/47/48 hold their numbers at both frames with byte-identical G-streams", async ({ page }) => {
  test.setTimeout(240_000);
  const a = await pinnedPrint(page, 1700, "b1");
  const b = await pinnedPrint(page, 1000, "b2");
  const A = gCensus(qpdfNorm(a.file, "b1"));
  const B = gCensus(qpdfNorm(b.file, "b2"));

  const byNum = (gs: GStream[], n: number) => gs.find((g) => g.objNum === n);
  for (const n of [12, 18, 26, 30, 47, 48]) {
    const ga = byNum(A, n);
    const gb = byNum(B, n);
    expect(ga, `obj:${n} present @T=1700`).toBeTruthy();
    expect(gb, `obj:${n} present @T=1000 (number held)`).toBeTruthy();
    expect(gb!.stream, `obj:${n} G-stream byte-identical across frames`).toBe(ga!.stream);
    expect(gb!.bbox, `obj:${n} bbox stable`).toBe(ga!.bbox);
    expect(gb!.kind, `obj:${n} kind stable`).toBe(ga!.kind);
  }
});

// ---------- D225c: the T-invariance by value + the renumbering-by-one law ----------

test("D225c the T-invariance by value — all 10 frame-stable after name normalization; the four renumbered masks shift by exactly -1", async ({ page }) => {
  test.setTimeout(240_000);
  const a = await pinnedPrint(page, 1700, "c1");
  const b = await pinnedPrint(page, 1000, "c2");
  const A = gCensus(qpdfNorm(a.file, "c1"));
  const B = gCensus(qpdfNorm(b.file, "c2"));

  expect(A.length, "10 G-streams @T=1700").toBe(10);
  expect(B.length, "10 G-streams @T=1000").toBe(10);

  // the VALUE multiset (kind + bbox + normalized stream) identical across frames
  const mA = multiset(A.map((g) => `${g.kind}|${g.bbox}|${normNames(g.stream)}`));
  const mB = multiset(B.map((g) => `${g.kind}|${g.bbox}|${normNames(g.stream)}`));
  expect(mB, "the name-normalized value multiset T-invariant").toEqual(mA);

  // the four renumbering masks: matched by (kind, bbox), the object number
  // shifts by EXACTLY -1 (the S68 ca230 phase-slot contraction, gs 33->32,
  // removes one object before them)
  const renumbered: Array<[string, string, number, number]> = [
    // [kind, bbox, objNum@1700, objNum@1000]
    ["/Luminosity", "52,30,593,190", 122, 121],
    ["/Luminosity", "10,6,635,251", 125, 124],
    ["/Luminosity", "122,150,247,275", 152, 151],
    ["/Luminosity", "0,0,596,843", 172, 171],
  ];
  for (const [kind, bbox, n17, n10] of renumbered) {
    const ga = A.find((g) => g.kind === kind && g.bbox === bbox && g.objNum === n17);
    const gb = B.find((g) => g.kind === kind && g.bbox === bbox && g.objNum === n10);
    expect(ga, `${bbox} at obj:${n17} @T=1700`).toBeTruthy();
    expect(gb, `${bbox} at obj:${n10} @T=1000 (shifted -1)`).toBeTruthy();
    // the ONLY stream delta is the name token (the normalized identity equal)
    expect(normNames(gb!.stream), `${bbox} normalized value frame-stable`).toBe(normNames(ga!.stream));
    expect(gb!.stream, `${bbox} raw streams differ (the renumbering family)`).not.toBe(ga!.stream);
  }
});

// ---------- D225d: the /Alpha pair decomposition ----------

test("D225d the /Alpha pair — obj:47 the /TR-bearing re-fill + obj:48 the /X43 Do-placement, both byte-stable; the /TR key the differentiator", async ({ page }) => {
  test.setTimeout(240_000);
  const a = await pinnedPrint(page, 1700, "d1");
  const b = await pinnedPrint(page, 1000, "d2");
  const A = gCensus(qpdfNorm(a.file, "d1"));
  const B = gCensus(qpdfNorm(b.file, "d2"));

  const pick47 = (gs: GStream[]) => gs.find((g) => g.objNum === 47 && g.kind === "/Alpha");
  const pick48 = (gs: GStream[]) => gs.find((g) => g.objNum === 48 && g.kind === "/Alpha");
  const a47 = pick47(A), a48 = pick48(A), b47 = pick47(B), b48 = pick48(B);
  expect(a47 && a48 && b47 && b48, "the /Alpha pair at obj:47/48 both frames").toBeTruthy();

  // obj:47 — the re-fill variant: the plain-fill shape, len 43, its /SMask
  // dict the ONE carrying /TR (the S64 {1 exch sub} alpha-inverting
  // transfer at the fixed object number)
  expect(familyOf(a47!.stream), "obj:47 the plain-fill family").toBe("plainFill");
  expect(a47!.stream.length, "obj:47 stream length").toBe(43);
  expect(a47!.smaskKeys, "obj:47's /SMask dict carries /TR").toBe("/G,/S,/TR,/Type");
  // obj:48 — the BARE-Do placement variant painting the shared phase form
  // (a Do with no q/Q wrapper — its own operator shape)
  expect(familyOf(a48!.stream), "obj:48 the bare-Do family").toBe("bareDo");
  expect(a48!.stream.length, "obj:48 stream length").toBe(33);
  expect(a48!.stream, "obj:48 paints the /X43 phase form").toContain("/X43 Do");
  expect(a48!.smaskKeys, "obj:48's /SMask dict has NO /TR").toBe("/G,/S,/Type");

  // both byte-identical across frames (the /TR transfer + the placement stable)
  expect(b47!.stream, "obj:47 byte-identical across frames").toBe(a47!.stream);
  expect(b48!.stream, "obj:48 byte-identical across frames").toBe(a48!.stream);

  // the /TR differentiator: exactly ONE of the 10 G-streams' /SMask dicts
  // carries the /TR key — obj:47
  expect(
    A.filter((g) => g.smaskKeys.includes("/TR")).map((g) => g.objNum),
    "the ONE /TR-bearing /SMask",
  ).toEqual([47]);
});
