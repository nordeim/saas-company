import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 75 — THE FIFTIETH SURFACE: THE /ToUnicode CMap INTERIORS
 * under the pinned-frame contract (D231, law-quality). The D230-registered
 * presence-only sibling measured BY VALUE — every Type3 font's
 * code-to-Unicode CMap stream (the bfchar/bfrange mapping tables), plus
 * the /CIDToGIDMap identity family, on both pinned frames.
 *
 * (a) THE SITE CENSUS — the clone: 10 Type3 fonts at [22,31,35,58,62,89,
 *     104,142,143,198] @T=1700, every font carrying a /ToUnicode CMap
 *     stream + /CIDToGIDMap /Identity. The CMap object numbers
 *     [249,260,318,349,403,430,458,475,506,523]; the byte lengths
 *     [559,416,840,624,798,590,581,501,605,476]; the bfchar entry
 *     census [12,8,24,16,21,16,11,10,13,8] (sum 139) + the bfrange
 *     entry census [4,0,12,5,10,3,6,2,6,2] (sum 50).
 *
 * (b) THE T-INVARIANCE + THE NUMBERING LAW — every CMap stream
 *     BYTE-IDENTICAL across T=1700/T=1000 (position-paired); ALL TEN
 *     CMap object numbers shift by EXACTLY -1 @T=1000 (249->248, ...,
 *     523->522 — the S68 phase-slot contraction propagates through the
 *     whole CMap allocation range: every CMap sits AFTER the vanishing
 *     ca230 phase-slot object, so the -1 hits all ten — the font-dict
 *     layer's last-four-only law [D230] contrasted with the CMap layer's
 *     all-ten law, the allocation-order family).
 *
 * (c) THE STRUCTURE LAWS — every CMap the uniform constants: the
 *     12-dict prologue (`/CIDInit /ProcSet findresource begin` + `12
 *     dict begin` + `begincmap`), /Registry (Adobe) + /Ordering (UCS) +
 *     /Supplement 0, /CMapName /Adobe-Identity-UCS, /CMapType 2, the
 *     single codespacerange `<00> <FF>`, the `endcmap` + defineresource
 *     epilogue; the EXPANDED mapped-code census [21,8,55,28,51,24,25,
 *     14,28,14] (sum 268 — the bfchar codes + the bfrange ranges
 *     expanded code-by-code).
 *
 * (d) THE VALUE LAWS — the multi-char ligature family: EXACTLY ONE
 *     multi-character Unicode target in the whole tree — font 62's
 *     `<79> <00660066>` (the "ff" ligature, U+0066 U+0066, split across
 *     its own SECOND bfchar block — the CMap grammar's 100-entry block
 *     limit never the trigger here; the block split the ligature's own
 *     family); the union Unicode vocabulary (the distinct mapped
 *     targets) at 67 distinct values, the printable-ASCII family +
 *     U+00A9 (©) + U+2014 (—); the 278-nonzero-width v 268-mapped-code
 *     delta (10 glyphs with widths but no Unicode mapping — the
 *     non-text glyph family: bullets, the space-class at unmapped
 *     codes, the D229 203/204 set-width pair).
 *
 * Cross-side (the S75 walk's record): ALL 10 CMap streams
 * BYTE-IDENTICAL ACROSS SIDES (sha-verified position-paired: the CMap
 * layer shared by both trees whole — the fifth consecutive font-family
 * layer at full byte parity after D228 glyph streams, D229 widths,
 * D230 descriptors; the live's numbering [254,265,323,354,408,435,
 * 463,480,511,528] frame-stable this run — the per-load baseline
 * family). NO src/ fix — the layer is at full byte parity.
 *
 * The dwell contract: the S63-74 pinned-frame form verbatim (1280x720 +
 * networkidle + 4000ms + pause-every-WAAPI-animation at T + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s75-t-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-74 form, verbatim) ----------

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

// ---------- the qpdf reader (the S63-74 form) ----------

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

// ---------- D231: the /ToUnicode CMap census ----------

interface CMapRec {
  fontNum: number;
  tuNum: number;
  len: number;
  bytes: string;
  cidgid: string;
  bfchar: number;
  bfrange: number;
  mappedCodes: number;
  multiChar: string[];
  uniValues: string[];
  structure: {
    prologue: boolean;
    registry: string;
    ordering: string;
    cmapName: string;
    cmapType: string;
    codespace: string;
    epilogue: boolean;
  };
}

const BF_PAIR = /^<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>$/gm;
const BR_TRIPLE = /^<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>$/gm;
const MULTI = /<([0-9A-Fa-f]{2})>\s*<([0-9A-Fa-f]{5,})>/g;

/** Walk every Type3 font: the /ToUnicode CMap stream, decoded + censused. */
const cmapCensus = (norm: Norm): CMapRec[] => {
  const out: CMapRec[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d) continue;
    if (val(d["/Type"]) !== "/Font" || val(d["/Subtype"]) !== "/Type3") continue;
    const fm = k.match(/^obj:(\d+)/);
    const fontNum = fm ? Number(fm[1]) : -1;

    // /CIDToGIDMap (the identity family)
    const cidgid = String(val(d["/CIDToGIDMap"] ?? ""));

    // the /ToUnicode stream
    const tu = deref(norm, d["/ToUnicode"]);
    const raw = tu && typeof tu === "object" && "stream" in (tu as QpdfObj)
      ? Buffer.from((tu as QpdfObj).stream?.data ?? "", "base64").toString("latin1")
      : "";
    // the CMap's own object number (find the key whose value IS the target)
    let tuNum = -1;
    for (const [k2, o2] of Object.entries(norm)) {
      if (o2 === tu) {
        const m2 = k2.match(/^obj:(\d+)/);
        tuNum = m2 ? Number(m2[1]) : -1;
        break;
      }
    }

    // the bfchar/bfrange blocks (ALL blocks — font 62 carries TWO bfchar
    // blocks, the second the ligature's own family)
    const bfBlocks = [...raw.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)];
    const brBlocks = [...raw.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)];
    let bfchar = 0;
    const uniValues: string[] = [];
    for (const b of bfBlocks) {
      BF_PAIR.lastIndex = 0;
      const pairs = [...b[1]!.matchAll(BF_PAIR)];
      bfchar += pairs.length;
      for (const p of pairs) {
        if (p[2]!.length <= 4) uniValues.push(p[2]!.toUpperCase());
      }
    }
    let bfrange = 0;
    let mappedCodes = bfchar;
    for (const b of brBlocks) {
      BR_TRIPLE.lastIndex = 0;
      const triples = [...b[1]!.matchAll(BR_TRIPLE)];
      bfrange += triples.length;
      for (const t of triples) {
        const lo = parseInt(t[1]!, 16);
        const hi = parseInt(t[2]!, 16);
        const u0 = parseInt(t[3]!, 16);
        mappedCodes += hi - lo + 1;
        for (let i = 0; i <= hi - lo; i++) {
          uniValues.push((u0 + i).toString(16).toUpperCase().padStart(4, "0"));
        }
      }
    }
    MULTI.lastIndex = 0;
    const multiChar = [...raw.matchAll(MULTI)].map((m) => `${m[1]}->${m[2]}`);

    out.push({
      fontNum,
      tuNum,
      len: raw.length,
      bytes: raw,
      cidgid,
      bfchar,
      bfrange,
      mappedCodes,
      multiChar,
      uniValues: [...new Set(uniValues)].sort(),
      structure: {
        prologue: raw.includes("/CIDInit /ProcSet findresource begin")
          && raw.includes("12 dict begin")
          && raw.includes("begincmap"),
        registry: /\/Registry \(([^)]*)\)/.exec(raw)?.[1] ?? "",
        ordering: /\/Ordering \(([^)]*)\)/.exec(raw)?.[1] ?? "",
        cmapName: /\/CMapName \/(\S+) def/.exec(raw)?.[1] ?? "",
        cmapType: /\/CMapType (\d+) def/.exec(raw)?.[1] ?? "",
        codespace: /begincodespacerange\s*([\s\S]*?)\s*endcodespacerange/
          .exec(raw)?.[1]?.replace(/\s+/g, " ") ?? "",
        epilogue: raw.includes("endcmap")
          && raw.includes("currentdict /CMap defineresource pop"),
      },
    });
  }
  return out.sort((a, b) => a.fontNum - b.fontNum);
};

// ---------- D231a: the site census ----------

test("D231a the CMap site census — 10 CMaps, the object numbers, the length + entry censuses, the /Identity family", async ({ page }) => {
  test.setTimeout(180_000);
  const { pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const maps = cmapCensus(qpdfNorm(pdfFile("a"), "a"));

  expect(maps.length, "the Type3 font count").toBe(10);

  // the font object numbers at T=1700 (the D229/D230 record)
  expect(maps.map((m) => m.fontNum), "the font object numbers").toEqual([
    22, 31, 35, 58, 62, 89, 104, 142, 143, 198,
  ]);

  // the CMap object numbers at T=1700 (the S75 walk's record)
  expect(maps.map((m) => m.tuNum), "the CMap object numbers").toEqual([
    249, 260, 318, 349, 403, 430, 458, 475, 506, 523,
  ]);

  // the byte-length census
  expect(maps.map((m) => m.len), "the CMap byte lengths").toEqual([
    559, 416, 840, 624, 798, 590, 581, 501, 605, 476,
  ]);

  // the bfchar + bfrange entry censuses (ALL blocks, the honest sums)
  expect(maps.map((m) => m.bfchar), "the bfchar entry census").toEqual([
    12, 8, 24, 16, 21, 16, 11, 10, 13, 8,
  ]);
  expect(maps.map((m) => m.bfrange), "the bfrange entry census").toEqual([
    4, 0, 12, 5, 10, 3, 6, 2, 6, 2,
  ]);

  // THE /IDENTITY FAMILY: every font's /CIDToGIDMap the identity map
  for (const m of maps) {
    expect(m.cidgid, `font#${m.fontNum} the /CIDToGIDMap identity`).toBe("/Identity");
    expect(m.len, `font#${m.fontNum} a non-empty CMap`).toBeGreaterThan(0);
  }
});

// ---------- D231b: the T-invariance + the numbering law ----------

test("D231b the full-byte T-invariance + the ALL-TEN -1 numbering law (the phase-slot contraction through the CMap range)", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "b");
  await pinnedPrint(page, 1000, "c");
  const A = cmapCensus(qpdfNorm(pdfFile("b"), "b"));
  const B = cmapCensus(qpdfNorm(pdfFile("c"), "c"));

  expect(A.length, "10 fonts @T=1700").toBe(10);
  expect(B.length, "10 fonts @T=1000").toBe(10);

  // THE FULL-BYTE T-INVARIANCE: every CMap stream byte-identical across
  // frames (position-paired)
  for (let i = 0; i < A.length; i++) {
    expect(B[i]!.bytes, `font#${A[i]!.fontNum} CMap byte-identical across frames`)
      .toBe(A[i]!.bytes);
  }

  // THE NUMBERING LAW: ALL TEN CMap objects shift by EXACTLY -1 @T=1000
  // (249->248, 260->259, ..., 523->522) — every CMap allocated AFTER the
  // vanishing ca230 phase-slot object, so the S68 contraction hits the
  // whole range (contrast the font-dict layer's last-four-only law)
  expect(A.map((m) => m.tuNum), "the CMap numbers @T=1700").toEqual([
    249, 260, 318, 349, 403, 430, 458, 475, 506, 523,
  ]);
  expect(B.map((m) => m.tuNum), "the CMap numbers @T=1000").toEqual([
    248, 259, 317, 348, 402, 429, 457, 474, 505, 522,
  ]);
  for (let i = 0; i < A.length; i++) {
    expect(B[i]!.tuNum, `font#${A[i]!.fontNum} CMap number at EXACTLY -1`)
      .toBe(A[i]!.tuNum - 1);
  }
});

// ---------- D231c: the structure laws ----------

test("D231c the uniform CMap structure — the 12-dict prologue, Adobe/UCS/Identity-UCS/type-2, the single <00>-<FF> codespace, the mapped-code census", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "d");
  const maps = cmapCensus(qpdfNorm(pdfFile("d"), "d"));

  // THE UNIFORM CONSTANTS on every CMap
  for (const m of maps) {
    expect(m.structure.prologue, `font#${m.fontNum} the CIDInit prologue`).toBe(true);
    expect(m.structure.registry, `font#${m.fontNum} Registry`).toBe("Adobe");
    expect(m.structure.ordering, `font#${m.fontNum} Ordering`).toBe("UCS");
    expect(m.structure.cmapName, `font#${m.fontNum} CMapName`).toBe("Adobe-Identity-UCS");
    expect(m.structure.cmapType, `font#${m.fontNum} CMapType`).toBe("2");
    expect(m.structure.codespace, `font#${m.fontNum} the codespace`).toBe("<00> <FF>");
    expect(m.structure.epilogue, `font#${m.fontNum} the defineresource epilogue`).toBe(true);
  }

  // THE EXPANDED MAPPED-CODE CENSUS (bfchar codes + bfrange ranges
  // expanded code-by-code — the honest mapping-count family)
  expect(maps.map((m) => m.mappedCodes), "the mapped-code census").toEqual([
    21, 8, 55, 28, 51, 24, 25, 14, 28, 14,
  ]);
});

// ---------- D231d: the value laws ----------

test("D231d the ligature law + the Unicode vocabulary + the width-mapping delta", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "e");
  const maps = cmapCensus(qpdfNorm(pdfFile("e"), "e"));

  // THE LIGATURE LAW: EXACTLY ONE multi-char Unicode target in the whole
  // tree — font 62's <79> <00660066> (the "ff" ligature, its own second
  // bfchar block)
  const allMulti = maps.flatMap((m) => m.multiChar);
  expect(allMulti, "the multi-char target family").toEqual(["79->00660066"]);
  expect(maps[4]!.fontNum, "the ligature carrier is font 62").toBe(62);

  // THE UNION UNICODE VOCABULARY: 67 distinct mapped targets — the
  // printable-ASCII family + U+00A9 (©) + U+2014 (—)
  const union = [...new Set(maps.flatMap((m) => m.uniValues))].sort();
  expect(union.length, "the union vocabulary size").toBe(67);
  expect(union).toContain("0020"); // space
  expect(union).toContain("0041"); // A
  expect(union).toContain("007A"); // z
  expect(union).toContain("00A9"); // ©
  expect(union).toContain("2014"); // —
  // no controls, no surrogates: the vocabulary bounded to printables + 2
  expect(union[0], "the vocabulary floor").toBe("0020");
  expect(union.every((u) => /^[0-9A-F]{4}$/.test(u)), "4-hex targets only").toBe(true);

  // THE WIDTH-MAPPING DELTA: 278 nonzero widths (the D229 census) v 268
  // mapped codes — exactly 10 glyphs with widths but no Unicode mapping
  // (the non-text glyph family)
  const totalMapped = maps.reduce((s, m) => s + m.mappedCodes, 0);
  expect(totalMapped, "the total mapped codes").toBe(268);
  expect(278 - totalMapped, "the non-mapped glyph count").toBe(10);
});
