import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 74 — THE FORTY-NINTH SURFACE: THE /FontBBox + /FontDescriptor
 * LAYER under the pinned-frame contract (D230, law-quality). The D229
 * walk's remaining unmeasured dict siblings — the same 10 Type3 fonts'
 * BOUNDING-BOX arrays + the full DESCRIPTOR dicts (the /FontName subset
 * identity, the /Flags, the weight classes, the metric constants), plus
 * the two remaining font-dict siblings' PRESENCE (/CIDToGIDMap +
 * /ToUnicode), measured BY VALUE on both pinned frames.
 *
 * (a) THE SITE CENSUS — the clone: 10 fonts at [22,31,35,58,62,89,104,
 *     142,143,198] @T=1700; every font the 12-key dict shape
 *     [/CIDToGIDMap,/CharProcs,/Encoding,/FirstChar,/FontBBox,
 *     /FontDescriptor,/FontMatrix,/LastChar,/Subtype,/ToUnicode,/Type,
 *     /Widths] + the 10-key descriptor shape [/CapHeight,/Flags,
 *     /FontFamily,/FontName,/FontStretch,/FontWeight,/ItalicAngle,
 *     /StemV,/Type,/XHeight]; the per-font FontBBox census
 *     [[16,215,786,-771],[33,15,801,-760],[12,215,821,-760],
 *     [16,215,827,-771],[16,215,819,-760],[23,215,833,-779],
 *     [14,15,840,-789],[13,47,697,-760],[12,215,821,-760],
 *     [15,15,632,-715]].
 *
 * (b) THE T-INVARIANCE + THE NUMBERING LAW — every font's FontBBox +
 *     descriptor values identical across T=1700/T=1000 (position-paired);
 *     the LAST FOUR fonts shift by EXACTLY -1 @T=1000 (104->103,
 *     142->141, 143->142, 198->197 — the S68 phase-slot law measured at
 *     the descriptor layer, the same -1 family as D228/D229).
 *
 * (c) THE WEIGHT-SIGNATURE LAW — the per-font /FontWeight census
 *     [500,600,400,500,400,600,700,500,400,600] with the 1:1 metric
 *     maps: the StemV map {400->109, 500->125, 600->141, 700->156} and
 *     the XHeight map {400->550, 500->553, 600->556, 700->560}; the
 *     uniform constants: Flags=4, CapHeight=-700, ItalicAngle=0,
 *     FontStretch=/Normal, FontFamily='u:Vend Sans Light' (the
 *     self-hosted face's own family string), Type=/FontDescriptor.
 *
 * (d) THE SUBSET-IDENTITY LAW — the /FontName census the A-J subset
 *     prefix family [/AAAAAA+/BAAAAA+/CAAAAA+/DAAAAA+/EAAAAA+/FAAAAA+/
 *     GAAAAA+/HAAAAA+/IAAAAA+/JAAAAA+ all + VendSans-Light] — ten
 *     distinct subset tags over ONE family (the descriptor-layer
 *     identity of the D228 10-font set: every font the same Vend Sans
 *     Light face at a different weight/subset).
 *
 * Cross-side (the S74 walk's record): ALL 10 fonts' FontBBox + descriptor
 * values value-identical ACROSS SIDES (position-paired; the live's
 * numbering [22,31,35,58,63,90,102,139,140,203] this run — the per-load
 * baseline family, the numbering diverging after the fourth font while
 * the VALUES stay identical, the D229 law carried). NO src/ fix — the
 * layer is at full value parity.
 *
 * The dwell contract: the S63-73 pinned-frame form verbatim (1280x720 +
 * networkidle + 4000ms + pause-every-WAAPI-animation at T + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s74-t-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-73 form, verbatim) ----------

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

// ---------- the qpdf reader (the S63-73 form) ----------

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
  const o = v as QpdfObj;
  if ("value" in o && o.value && typeof o.value === "object" && !Array.isArray(o.value)) {
    return o.value as Record<string, unknown>;
  }
  if ("stream" in o && o.stream && typeof o.stream === "object") {
    return (o.stream as { dict?: Record<string, unknown> }).dict ?? null;
  }
  return v as Record<string, unknown>;
};

const val = (v: unknown): unknown =>
  (v as { value?: unknown } | undefined)?.value ?? v;

const deref = (norm: Norm, v: unknown): unknown => {
  const r = asRef(val(v));
  if (r === null) return val(v);
  const m = /^(\d+) (\d+) R$/.exec(r);
  return m ? norm[`obj:${m[1]} ${m[2]} R`] ?? norm[`obj:${m[1]}`] ?? null : null;
};

// ---------- D230: the FontBBox + FontDescriptor census ----------

interface DescRec {
  objNum: number;
  fontKeys: string[];
  bbox: number[];
  descKeys: string[];
  name: string;
  flags: number;
  weight: number;
  capHeight: number;
  xHeight: number;
  stemV: number;
  italicAngle: number;
  stretch: string;
  family: string;
  type: string;
}

const DESC_KEYS = [
  "/CapHeight", "/Flags", "/FontFamily", "/FontName", "/FontStretch",
  "/FontWeight", "/ItalicAngle", "/StemV", "/Type", "/XHeight",
];

/** Walk every Type3 font dict: the /FontBBox array + the resolved
 * /FontDescriptor's full value set. */
const descCensus = (norm: Norm): DescRec[] => {
  const out: DescRec[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d) continue;
    if (val(d["/Type"]) !== "/Font" || val(d["/Subtype"]) !== "/Type3") continue;
    const fd = dictOf(norm, deref(norm, d["/FontDescriptor"]));
    if (!fd) continue;
    const m = k.match(/^obj:(\d+)/);
    out.push({
      objNum: m ? Number(m[1]) : -1,
      fontKeys: Object.keys(d).sort(),
      bbox: (Array.isArray(d["/FontBBox"]) ? (d["/FontBBox"] as unknown[]) : []).map(
        (x) => Number(val(x)),
      ),
      descKeys: Object.keys(fd).sort(),
      name: String(val(fd["/FontName"])),
      flags: Number(val(fd["/Flags"])),
      weight: Number(val(fd["/FontWeight"])),
      capHeight: Number(val(fd["/CapHeight"])),
      xHeight: Number(val(fd["/XHeight"])),
      stemV: Number(val(fd["/StemV"])),
      italicAngle: Number(val(fd["/ItalicAngle"])),
      stretch: String(val(fd["/FontStretch"])),
      family: String(val(fd["/FontFamily"])),
      type: String(val(fd["/Type"])),
    });
  }
  return out.sort((a, b) => a.objNum - b.objNum);
};

// ---------- D230a: the site census ----------

test("D230a the descriptor site census — 10 fonts, the 12-key dict shape, the 10-key descriptor, the FontBBox census", async ({ page }) => {
  test.setTimeout(180_000);
  const { pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const fonts = descCensus(qpdfNorm(pdfFile("a"), "a"));

  expect(fonts.length, "the Type3 font count").toBe(10);

  // the object numbers at T=1700 (the D229 record)
  expect(fonts.map((f) => f.objNum), "the font object numbers").toEqual([
    22, 31, 35, 58, 62, 89, 104, 142, 143, 198,
  ]);

  // every font the 12-key dict shape — the D229 walk's keys + the three
  // siblings this surface registers (/FontBBox + /FontDescriptor +
  // /CIDToGIDMap + /ToUnicode present on every font)
  for (const f of fonts) {
    expect(f.fontKeys, `font#${f.objNum} the font-dict key shape`).toEqual([
      "/CIDToGIDMap", "/CharProcs", "/Encoding", "/FirstChar", "/FontBBox",
      "/FontDescriptor", "/FontMatrix", "/LastChar", "/Subtype", "/ToUnicode",
      "/Type", "/Widths",
    ]);
    expect(f.descKeys, `font#${f.objNum} the descriptor key shape`).toEqual(DESC_KEYS);
    expect(f.bbox.length, `font#${f.objNum} the 4-number FontBBox`).toBe(4);
  }

  // the per-font FontBBox census (the values extracted from the walk)
  expect(fonts.map((f) => f.bbox.join(",")), "the FontBBox census").toEqual([
    "16,215,786,-771", "33,15,801,-760", "12,215,821,-760", "16,215,827,-771",
    "16,215,819,-760", "23,215,833,-779", "14,15,840,-789", "13,47,697,-760",
    "12,215,821,-760", "15,15,632,-715",
  ]);
});

// ---------- D230b: the T-invariance + the numbering law ----------

test("D230b the full-value T-invariance + the last-four -1 numbering law (the S68 phase-slot family at the descriptor layer)", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "b");
  await pinnedPrint(page, 1000, "c");
  const A = descCensus(qpdfNorm(pdfFile("b"), "b"));
  const B = descCensus(qpdfNorm(pdfFile("c"), "c"));

  expect(A.length, "10 fonts @T=1700").toBe(10);
  expect(B.length, "10 fonts @T=1000").toBe(10);

  // THE FULL-VALUE T-INVARIANCE: every font's FontBBox + descriptor values
  // identical across frames (position-paired)
  for (let i = 0; i < A.length; i++) {
    const { objNum: _a, ...va } = A[i]!;
    const { objNum: _b, ...vb } = B[i]!;
    void _a; void _b;
    expect(vb, `font#${A[i]!.objNum} value-identical across frames`).toEqual(va);
  }

  // THE NUMBERING LAW: the LAST FOUR fonts shift by EXACTLY -1 @T=1000
  // (104->103, 142->141, 143->142, 198->197) — the S68 phase-slot law
  // measured at the descriptor layer, the same -1 family as D228/D229
  expect(A.map((f) => f.objNum), "the numbers @T=1700").toEqual([
    22, 31, 35, 58, 62, 89, 104, 142, 143, 198,
  ]);
  expect(B.map((f) => f.objNum), "the numbers @T=1000").toEqual([
    22, 31, 35, 58, 62, 89, 103, 141, 142, 197,
  ]);
});

// ---------- D230c: the weight-signature law ----------

test("D230c the weight-signature law — [500,600,400,500,400,600,700,500,400,600] with the 1:1 StemV/XHeight metric maps", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "d");
  const fonts = descCensus(qpdfNorm(pdfFile("d"), "d"));

  // THE WEIGHT SIGNATURE: the per-font weight census
  expect(fonts.map((f) => f.weight), "the /FontWeight census").toEqual([
    500, 600, 400, 500, 400, 600, 700, 500, 400, 600,
  ]);

  // THE 1:1 METRIC MAPS: StemV and XHeight are pure functions of the
  // weight class — {400,500,600,700} -> {109,125,141,156} StemV and
  // {550,553,556,560} XHeight (sorted by weight — the map's CONTENT the
  // law, never the insertion order)
  const byWeight = <T>(pick: (f: DescRec) => T) =>
    [...new Map(fonts.map((f) => [f.weight, pick(f)] as const)).entries()].sort(
      ([a], [b]) => Number(a) - Number(b),
    );
  expect(byWeight((f) => f.stemV), "the StemV-by-weight map").toEqual([
    [400, 109], [500, 125], [600, 141], [700, 156],
  ]);
  expect(byWeight((f) => f.xHeight), "the XHeight-by-weight map").toEqual([
    [400, 550], [500, 553], [600, 556], [700, 560],
  ]);

  // THE UNIFORM CONSTANTS on every descriptor
  for (const f of fonts) {
    expect(f.flags, `font#${f.objNum} Flags`).toBe(4);
    expect(f.capHeight, `font#${f.objNum} CapHeight`).toBe(-700);
    expect(f.italicAngle, `font#${f.objNum} ItalicAngle`).toBe(0);
    expect(f.stretch, `font#${f.objNum} FontStretch`).toBe("/Normal");
    expect(f.family, `font#${f.objNum} FontFamily`).toBe("u:Vend Sans Light");
    expect(f.type, `font#${f.objNum} Type`).toBe("/FontDescriptor");
  }
});

// ---------- D230d: the subset-identity law ----------

test("D230d the /FontName subset-identity law — the A-J prefix family over ONE face (VendSans-Light)", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "e");
  const fonts = descCensus(qpdfNorm(pdfFile("e"), "e"));

  // THE A-J SUBSET PREFIX FAMILY: ten distinct subset tags (the PDF
  // subset-tag alphabet AAAAAA..JAAAAA) over ONE family+face — the
  // descriptor-layer identity of the D228 10-font set
  expect(fonts.map((f) => f.name), "the /FontName census").toEqual([
    "/AAAAAA+VendSans-Light", "/BAAAAA+VendSans-Light", "/CAAAAA+VendSans-Light",
    "/DAAAAA+VendSans-Light", "/EAAAAA+VendSans-Light", "/FAAAAA+VendSans-Light",
    "/GAAAAA+VendSans-Light", "/HAAAAA+VendSans-Light", "/IAAAAA+VendSans-Light",
    "/JAAAAA+VendSans-Light",
  ]);

  // every name the <6-char subset tag>+<ONE face> form — ten subsets, one
  // face (the D228/D229 walk's 10 fonts are all Vend Sans Light)
  for (const f of fonts) {
    expect(f.name, `font#${f.objNum} the subset-tag form`).toMatch(
      /^\/[A-J]AAAAA\+VendSans-Light$/,
    );
  }

  // THE FAMILY-STRING LAW: the FontFamily the face's own string with the
  // engine's registered prefix — 'u:Vend Sans Light' (gotcha 5's
  // self-hosted face at the descriptor layer)
  expect(new Set(fonts.map((f) => f.family)), "the FontFamily uniform").toEqual(
    new Set(["u:Vend Sans Light"]),
  );
});
