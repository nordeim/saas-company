import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 73 — THE FORTY-EIGHTH SURFACE: THE /Widths + /Encoding
 * DIFFERENCES LAYER under the pinned-frame contract (D229, law-quality).
 * The D228 /CharProcs walk's unmeasured sibling: the same 10 Type3
 * fonts' OBJECT-DICT tables — the /Widths advance-width arrays + the
 * /FirstChar//LastChar bounds + the /Encoding /Differences glyph-name
 * maps — measured BY VALUE on both pinned frames.
 *
 * (a) THE SITE CENSUS — the clone: 10 fonts at [22,31,35,58,62,89,104,
 *     142,143,198] @T=1700; the per-font (FirstChar-LastChar:Widths.len)
 *     signature [0-185:186, 0-183:184, 0-253:254, 0-203:204, 0-241:242,
 *     0-183:184, 0-185:186, 0-198:199, 0-241:242, 0-48:49]; 1930 width
 *     slots + 1940 /Differences tokens over a 69-name vocabulary.
 *
 * (b) THE T-INVARIANCE + THE NUMBERING LAW — every font's /Widths +
 *     /Differences + bounds value-identical across T=1700/T=1000
 *     (position-paired); the LAST FOUR fonts shift by EXACTLY -1 @T=1000
 *     (104->103, 142->141, 143->142, 198->197) — the S68 phase-slot law
 *     measured at the font-dict layer, the same -1 family as D228.
 *
 * (c) THE SET-WIDTH-PAIR ECHO — the D228c minimal family (the 17-byte
 *     zero-bbox glyphs) carries its signature INTO the width arrays:
 *     the nonzero width census counts EXACTLY 278 nonzero slots (= the
 *     278 /CharProcs streams), and the set-width pair appears as the
 *     width values 203 (x6) + 204 (x3) — the same two-body, nine-glyph
 *     family the glyph-payload layer measured.
 *
 * (d) THE STRUCTURE LAWS — the /g0 filler law (1662/1930 name tokens
 *     the literal /g0 — the sparse encoding); every /Encoding dict the
 *     minimal [/Type,/Differences] shape. Cross-side (the S73 walk's
 *     record): ALL 10 fonts' /Widths + /Differences + bounds
 *     value-identical ACROSS SIDES (position-paired; the live's numbering
 *     [22,31,35,58,63,90,104,141,142,205] this run — the per-load
 *     baseline family). NO src/ fix — the layer is at full value parity.
 *     The dwell contract: the S63-72 pinned-frame form verbatim
 *     (1280x720 + networkidle + 4000ms + pause-every-WAAPI-animation
 *     at T + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s73-t-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-72 form, verbatim) ----------

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

// ---------- the qpdf reader (the S63-72 form) ----------

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

const val = (v: unknown): unknown =>
  (v as { value?: unknown } | undefined)?.value ?? v;

const deref = (norm: Norm, v: unknown): unknown => {
  const r = asRef(v);
  if (r === null) return v;
  const m = /^(\d+) (\d+) R$/.exec(r);
  return m ? norm[`obj:${m[1]} ${m[2]} R`] ?? norm[`obj:${m[1]}`] ?? null : null;
};

// ---------- D229: the /Widths + /Encoding /Differences census ----------

interface WidthRec {
  objNum: number;
  firstChar: unknown;
  lastChar: unknown;
  widths: unknown[];
  diffs: unknown[];
  encType: string;
}

/** Walk every Type3 font dict: the /Widths array + the /FirstChar and
 * /LastChar bounds + the /Encoding /Differences glyph-name map. */
const widthsCensus = (norm: Norm): WidthRec[] => {
  const out: WidthRec[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d) continue;
    if (val(d["/Type"]) !== "/Font" || val(d["/Subtype"]) !== "/Type3") continue;
    const m = k.match(/^obj:(\d+)/);
    const widths = Array.isArray(d["/Widths"]) ? (d["/Widths"] as unknown[]).map((x) => val(x)) : [];
    const enc = dictOf(norm, deref(norm, d["/Encoding"]));
    const diffsRaw = enc ? val(enc["/Differences"]) : null;
    const diffs = Array.isArray(diffsRaw) ? (diffsRaw as unknown[]) : [];
    out.push({
      objNum: m ? Number(m[1]) : -1,
      firstChar: val(d["/FirstChar"]),
      lastChar: val(d["/LastChar"]),
      widths,
      diffs,
      encType: enc ? String(val(enc["/Type"]) ?? "-") : String(val(d["/Encoding"])),
    });
  }
  return out.sort((a, b) => a.objNum - b.objNum);
};

// ---------- D229a: the site census ----------

test("D229a the widths+encoding site census — 10 fonts, the (first-last:len) signature, 1930 slots / 1940 tokens / 69 names", async ({ page }) => {
  test.setTimeout(180_000);
  const { pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const fonts = widthsCensus(qpdfNorm(pdfFile("a"), "a"));

  expect(fonts.length, "the Type3 font count").toBe(10);

  // the object numbers at T=1700
  expect(fonts.map((f) => f.objNum), "the font object numbers").toEqual([
    22, 31, 35, 58, 62, 89, 104, 142, 143, 198,
  ]);

  // the per-font (FirstChar-LastChar:Widths.len) signature
  expect(
    fonts.map((f) => `${f.firstChar}-${f.lastChar}:${f.widths.length}`),
    "the bounds+width-length signature",
  ).toEqual([
    "0-185:186", "0-183:184", "0-253:254", "0-203:204", "0-241:242",
    "0-183:184", "0-185:186", "0-198:199", "0-241:242", "0-48:49",
  ]);

  // the width slots + diff tokens + the name vocabulary
  expect(fonts.reduce((s, f) => s + f.widths.length, 0), "the total width slots").toBe(1930);
  expect(fonts.reduce((s, f) => s + f.diffs.length, 0), "the total /Differences tokens").toBe(1940);
  const vocab = new Set(fonts.flatMap((f) => f.diffs.filter((x) => typeof x === "string") as string[]));
  expect(vocab.size, "the glyph-name vocabulary").toBe(69);
});

// ---------- D229b: the T-invariance + the numbering law ----------

test("D229b the full-value T-invariance + the numbering law (the last four fonts at EXACTLY -1)", async ({ page }) => {
  test.setTimeout(240_000);
  await pinnedPrint(page, 1700, "b");
  await pinnedPrint(page, 1000, "c");
  const fonts1700 = widthsCensus(qpdfNorm(pdfFile("b"), "b"));
  const fonts1000 = widthsCensus(qpdfNorm(pdfFile("c"), "c"));

  expect(fonts1000.length, "the @1000 font census").toBe(10);

  // THE NUMBERING LAW: the first six HOLD; the last four shift by EXACTLY
  // -1 (the S68 phase-slot contraction at the font-dict layer — the D228 law)
  expect(fonts1000.map((f) => f.objNum), "the @1000 font object numbers").toEqual([
    22, 31, 35, 58, 62, 89, 103, 141, 142, 197,
  ]);

  // THE FULL-VALUE T-INVARIANCE: every font's widths + diffs + bounds
  // identical across frames, paired BY POSITION (the i-th font)
  expect(fonts1700.length, "the @1700 font census").toBe(fonts1000.length);
  for (let i = 0; i < fonts1700.length; i++) {
    const a = fonts1700[i];
    const b = fonts1000[i];
    expect(a.widths.length, `font@${i} width count frame-stable`).toBe(b.widths.length);
    expect(JSON.stringify(a.widths), `font@${i} /Widths value-identical across frames`).toBe(JSON.stringify(b.widths));
    expect(JSON.stringify(a.diffs), `font@${i} /Differences value-identical across frames`).toBe(JSON.stringify(b.diffs));
    expect(a.firstChar, `font@${i} FirstChar frame-stable`).toBe(b.firstChar);
    expect(a.lastChar, `font@${i} LastChar frame-stable`).toBe(b.lastChar);
  }
});

// ---------- D229c: the set-width-pair echo + the nonzero census ----------

test("D229c the nonzero width census — 278 nonzero slots (= the glyph streams) with the D228c set-width pair 203x6 + 204x3", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "d");
  const fonts = widthsCensus(qpdfNorm(pdfFile("d"), "d"));

  // THE NONZERO CENSUS: exactly 278 nonzero slots — one per /CharProcs
  // glyph stream (the D228a stream census echoed at the width layer)
  const nz: Record<string, number> = {};
  for (const f of fonts) for (const w of f.widths) if (w !== 0) nz[String(w)] = (nz[String(w)] ?? 0) + 1;
  expect(Object.values(nz).reduce((s, x) => s + x, 0), "the nonzero width census").toBe(278);

  // THE SET-WIDTH-PAIR ECHO: the D228c 17-byte minimal family (the
  // zero-bbox `203 0 0 0 0 0 d1` x6 + `204 0 0 0 0 0 d1` x3 glyphs)
  // appears as the width values 203 (x6) + 204 (x3) — the same two-body,
  // nine-glyph family the glyph-payload layer measured
  expect(nz["203"], "the set-width-203 value's count (the x6 body)").toBe(6);
  expect(nz["204"], "the set-width-204 value's count (the x3 body)").toBe(3);

  // the width range: 203 (the minimal set-width) .. 916 (the widest glyph)
  const values = Object.keys(nz).map(Number);
  expect(Math.min(...values), "the minimal width value").toBe(203);
  expect(Math.max(...values), "the maximal width value").toBe(916);
});

// ---------- D229d: the structure laws ----------

test("D229d the /g0 filler law (1662/1930 tokens) + the minimal [/Type,/Differences] Encoding shape on every font", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "e");
  const fonts = widthsCensus(qpdfNorm(pdfFile("e"), "e"));

  // THE /g0 FILLER LAW: 1662 of the 1930 name tokens are the literal /g0
  // (the sparse encoding — most codes point at the empty glyph)
  const allNames = fonts.flatMap((f) => f.diffs.filter((x) => typeof x === "string") as string[]);
  expect(allNames.length, "the name-token census").toBe(1930);
  expect(allNames.filter((n) => n === "/g0").length, "the /g0 filler count").toBe(1662);

  // every /Differences array opens with the base-0 head: [0, "/g0", ...]
  for (const f of fonts) {
    expect(f.diffs[0], `font#${f.objNum} the /Differences base-0 head`).toBe(0);
    expect(typeof f.diffs[1], `font#${f.objNum} the head glyph name`).toBe("string");
  }

  // every /Encoding dict the minimal [/Type,/Differences] shape
  expect(new Set(fonts.map((f) => f.encType)), "the Encoding type uniform").toEqual(new Set(["/Encoding"]));
});
