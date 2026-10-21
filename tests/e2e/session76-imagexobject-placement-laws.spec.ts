import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 76 — THE FIFTY-FIRST SURFACE: THE NESTED IMAGE-XObject
 * PLACEMENT CONTEXTS under the pinned-frame contract (D232, law quality).
 * The D125/S56/S57-registered object-level image family's UNMEASURED
 * REMAINDER: the placement contexts — WHICH owner streams (page/form/
 * tiling) place WHICH images through Do, at WHAT cm transforms — plus
 * the payload byte-value layer across frames.
 *
 * (a) THE SITE CENSUS — the clone: 18 image objects at [4,23,28,37,38,
 *     40,41,53,54,97,98,99,100,119,123,144,145,146] @T=1700; the dims
 *     census [1920x1080, 626x204, 710x288, 1047x105 x2, 1165x103 x2,
 *     2025x534 x2, 201x201 x2, 201x1 x2, 541x160, 625x245, 738x26,
 *     1x26, 738x1]; the PLACEMENT census 13 = 8 form + 5 tiling; the
 *     SMask pair census 5 ([37,38],[40,41],[53,54],[97,98],[99,100]);
 *     the DCT family 4; the ICC singleton 1 (obj 4's /ICCBased).
 *
 * (b) THE T-INVARIANCE + THE NUMBERING LAW — the T-invariant payload
 *     family (12 images) byte-identical across T=1700/T=1000; the
 *     frame-dependent family 6 (obj 4 the video poster + the animation
 *     carriers); the NINE images from 97 on ALL shift by EXACTLY -1
 *     @T=1000 (97->96 .. 146->145 — the S68 phase-slot contraction at
 *     the image layer: the whole tail after obj 54 sits after the
 *     vanishing ca230 phase-slot object, the same allocation-order
 *     family as the D231 CMap layer's all-ten law).
 *
 * (c) THE PLACEMENT VALUE CENSUS — the 13 placements' owner-kind +
 *     target-dims + full cm transforms, exact (the six shared form
 *     placements + the logo tile + the two grayscale logo DCTs + the
 *     201x1 sliver + the shimmer trio); the epsilon-scale family: the
 *     201x1's petal carrier at EXACTLY 2^-24 @T=1700 (the D226 law at
 *     the image layer), the shimmer slivers at 2^-13.
 *
 * (d) THE ANIMATION-CARRIER LAW — the frame-dependent family {obj 4
 *     the video poster, the 1047x105 pair BOTH members, the 2025x534
 *     RGB, the 201x201 RGB, the 201x1 RGB}: in the three carrier pairs
 *     the /DeviceRGB member is the frame-dependent carrier while its
 *     /DeviceGray alpha mate is T-invariant; the 1047x105 pair the
 *     BOTH-carry exception; the 1165x103 pair the STATIC pair. The
 *     clone-only family = the 201x1 pair (603/201 bytes) + the shimmer
 *     trio (738x26=57564, 1x26=78, 738x1=2214) — the D125-registered
 *     form-nested superset.
 *
 * Cross-side (the S76 walk's record): ALL NINE of the live's placements
 * have IDENTICAL clone counterparts by value (target dims + the full
 * 6-number cm transform) — the live 13 images / 9 placements {8 form +
 * 1 tiling} a strict SUBSET of the clone's 18 / 13; the shared T-
 * invariant payloads byte-identical cross-side (12 shas); the
 * run-dependent family {obj 4 the video poster, the logo-tile RGB} the
 * per-load captures. NO src/ fix — the layer is at full placement
 * parity with the clone the registered superset.
 *
 * The dwell contract: the S63-75 pinned-frame form verbatim (1280x720 +
 * networkidle + 4000ms + pause-every-WAAPI-animation at T + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s76-t-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-75 form, verbatim) ----------

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

// ---------- the qpdf reader (the S63-75 form) ----------

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

const dataOf = (v: unknown): string | null => {
  if (!v || typeof v !== "object") return null;
  const o = v as QpdfObj;
  if ("stream" in o && o.stream && typeof o.stream === "object") {
    return (o.stream as { data?: string }).data ?? null;
  }
  return null;
};

const decodeB64 = (s: string | null): string =>
  s ? Buffer.from(s, "base64").toString("latin1") : "";

const shaOf = (b: string): string =>
  createHash("sha256").update(b).digest("hex").slice(0, 12);

// ---------- D232: the image + placement census ----------

interface ImageRec {
  num: number;
  w: number;
  h: number;
  cs: string;
  filter: string;
  smask: boolean;
  bytes: number;
  sha: string;
}

interface PlacementRec {
  owner: number;
  ownerKind: "page" | "form" | "tiling";
  name: string;
  imageNum: number;
  imageW: number;
  imageH: number;
  cm: string;
}

const imageCensus = (norm: Norm): ImageRec[] => {
  const out: ImageRec[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d || val(d["/Subtype"]) !== "/Image") continue;
    const payload = decodeB64(dataOf(o));
    const num = Number(k.match(/^obj:(\d+)/)?.[1] ?? -1);
    const filterRaw = val(d["/Filter"]);
    out.push({
      num,
      w: Number(val(d["/Width"])),
      h: Number(val(d["/Height"])),
      cs: String(val(d["/ColorSpace"])),
      filter: filterRaw === undefined ? "none" : String(filterRaw),
      smask: "/SMask" in d,
      bytes: payload.length,
      sha: shaOf(payload),
    });
  }
  return out.sort((a, b) => a.num - b.num);
};

const placementCensus = (norm: Norm): PlacementRec[] => {
  const images = new Map(imageCensus(norm).map((i) => [i.num, i]));
  // the owner -> name -> XObject tables
  const tables = new Map<string, Record<string, unknown>>();
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d) continue;
    const res = dictOf(norm, deref(norm, d["/Resources"]));
    const xo = res
      ? (dictOf(norm, deref(norm, res["/XObject"])) as Record<string, unknown> | null)
      : null;
    if (xo) tables.set(k, xo);
  }
  const out: PlacementRec[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const raw = dataOf(o);
    if (!raw) continue;
    const d = dictOf(norm, o);
    if (!d) continue;
    const isPage = val(d["/Type"]) === "/Page";
    const isForm = val(d["/Subtype"]) === "/Form" || val(d["/Subtype"]) === "/PSForm";
    const isTiling = val(d["/PatternType"]) === 1;
    if (!isPage && !isForm && !isTiling) continue;
    const stream = decodeB64(raw);
    for (const m of stream.matchAll(/(\/[A-Za-z0-9]+)\s+Do\b/g)) {
      const name = m[1]!;
      const tab = tables.get(k) ?? {};
      if (!(name in tab)) continue;
      const ref = asRef(val(tab[name]));
      const targetDict = ref ? dictOf(norm, norm[`obj:${ref}`] ?? null) : null;
      if (!targetDict || val(targetDict["/Subtype"]) !== "/Image") continue;
      const target = images.get(Number(ref!.split(" ")[0]));
      if (!target) continue;
      const idx = m.index ?? 0;
      const window = stream.slice(Math.max(0, idx - 260), idx);
      const cms = [
        ...window.matchAll(
          /([\d.\-]+) ([\d.\-]+) ([\d.\-]+) ([\d.\-]+) ([\d.\-]+) ([\d.\-]+) cm/g,
        ),
      ];
      out.push({
        owner: Number(k.match(/^obj:(\d+)/)?.[1] ?? -1),
        ownerKind: isPage ? "page" : isTiling ? "tiling" : "form",
        name,
        imageNum: target.num,
        imageW: target.w,
        imageH: target.h,
        cm: cms.length ? cms[cms.length - 1]!.slice(1).join(" ") : "none",
      });
    }
  }
  return out.sort((a, b) => a.owner - b.owner || a.imageNum - b.imageNum);
};

// ---------- D232a: the site census ----------

test("D232a the image+placement site census — 18 images, 13 placements {8 form + 5 tiling}, the 5 SMask pairs", async ({ page }) => {
  test.setTimeout(180_000);
  const { pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const norm = qpdfNorm(pdfFile("a"), "a");
  const images = imageCensus(norm);
  const placements = placementCensus(norm);

  expect(images.length, "the image object census (the D125 family)").toBe(18);
  expect(images.map((i) => i.num), "the image object numbers").toEqual([
    4, 23, 28, 37, 38, 40, 41, 53, 54, 97, 98, 99, 100, 119, 123, 144, 145, 146,
  ]);
  expect(images.map((i) => `${i.w}x${i.h}`), "the dims census").toEqual([
    "1920x1080", "626x204", "710x288", "1047x105", "1047x105", "1165x103",
    "1165x103", "2025x534", "2025x534", "201x201", "201x201", "201x1",
    "201x1", "541x160", "625x245", "738x26", "1x26", "738x1",
  ]);

  // the placement census: 13 = 8 form + 5 tiling, ZERO page-stream
  expect(placements.length, "the placement census").toBe(13);
  expect(placements.filter((p) => p.ownerKind === "page"), "ZERO page-stream placements").toEqual([]);
  const byKind: Record<string, number> = {};
  for (const p of placements) byKind[p.ownerKind] = (byKind[p.ownerKind] ?? 0) + 1;
  expect(byKind, "the owner-kind split").toEqual({ form: 8, tiling: 5 });

  // the SMask pair census: 5 RGB+Gray pairs at identical dims
  const paired = new Set<number>();
  for (const i of images) {
    if (paired.has(i.num)) continue;
    const mate = images.find(
      (j) => !paired.has(j.num) && j.num !== i.num && j.w === i.w && j.h === i.h && j.smask !== i.smask,
    );
    if (mate) { paired.add(i.num); paired.add(mate.num); }
  }
  expect(paired.size, "the SMask pair census (5 pairs = 10 images)").toBe(10);

  // the DCT family + the ICC singleton
  expect(images.filter((i) => i.filter.includes("DCT")).length, "the DCTDecode family").toBe(4);
  expect(images.filter((i) => i.cs.includes("ICCBased")).length, "the ICC singleton").toBe(1);
});

// ---------- D232b: the T-invariance + the numbering law ----------

test("D232b the payload T-invariance + the nine-image -1 numbering law", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "b17");
  await pinnedPrint(page, 1000, "b10");
  const a = imageCensus(qpdfNorm(pdfFile("b17"), "b17"));
  const b = imageCensus(qpdfNorm(pdfFile("b10"), "b10"));

  // the T-invariant family: 12 images byte-identical across frames
  const bShas = new Set(b.map((i) => i.sha));
  const tInv = a.filter((i) => bShas.has(i.sha));
  expect(tInv.length, "the T-invariant payload census").toBe(12);
  // the frame-dependent family: 6 (the video poster + the animation carriers)
  const frameDep = a.filter((i) => !bShas.has(i.sha)).map((i) => i.num);
  expect(frameDep, "the frame-dependent family (the carriers)").toEqual([4, 37, 38, 53, 97, 99]);

  // THE NINE-IMAGE -1 LAW: every image from 97 on shifts by EXACTLY -1
  expect(a.length).toBe(b.length);
  const deltas = a.map((i, k) => b[k]!.num - i.num);
  expect(deltas.slice(0, 9), "the shared prefix [4..54] frame-stable").toEqual([
    0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  expect(deltas.slice(9), "the nine-tail ALL at -1 (the S68 phase-slot family)").toEqual([
    -1, -1, -1, -1, -1, -1, -1, -1, -1,
  ]);
});

// ---------- D232c: the placement value census ----------

test("D232c the placement value census — the exact cm transforms + the epsilon family", async ({ page }) => {
  test.setTimeout(180_000);
  const { pinned } = await pinnedPrint(page, 1700, "c");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const placements = placementCensus(qpdfNorm(pdfFile("c"), "c"));

  // the exact placement records (owner-kind + target dims + the cm)
  expect(
    placements.map((p) => `${p.ownerKind}:${p.imageW}x${p.imageH}:${p.cm}`),
    "the placement value census @T=1700",
  ).toEqual([
    "form:1920x1080:6243.75 0 0 -3512.5 -1881.25 3512.5",
    "form:626x204:626 0 0 -204 698 1177",
    "form:710x288:710 0 0 -288 656 1237",
    "form:1047x105:1047 0 0 -105 61 127",
    "form:1165x103:1165 0 0 -103 2 126",
    "form:2025x534:2025 0 0 -534 -1 533",
    "tiling:201x201:201 0 0 -201 0 201",
    "tiling:201x1:201 0 0 -.000000059604645 0 .000000059604645",
    "form:541x160:541 0 0 -160 52 190",
    "form:625x245:625 0 0 -245 10 251",
    "tiling:738x26:738 0 0 -26 0 26",
    "tiling:1x26:.000122070313 0 0 -26 738 26",
    "tiling:738x1:738 0 0 -.000122070313 0 26.000122",
  ]);

  // THE EPSILON FAMILY: the 201x1 sliver's petal-scale carrier at EXACTLY
  // 2^-24 @T=1700 (the D226 law measured at the image layer)
  const sliver = placements.find((p) => p.imageW === 201 && p.imageH === 1);
  expect(sliver, "the 201x1 sliver placement exists").toBeTruthy();
  expect(Math.abs(Number(sliver!.cm.split(" ")[3])), "the petal-scale epsilon at 2^-24").toBeCloseTo(2 ** -24, 12);

  // the shimmer slivers at 2^-13 (the D226 shimmer family)
  const shimmerEps = placements.find((p) => p.imageW === 1 && p.imageH === 26);
  expect(Number(shimmerEps!.cm.split(" ")[0]), "the shimmer epsilon at 2^-13").toBeCloseTo(2 ** -13, 9);
});

// ---------- D232d: the animation-carrier law ----------

test("D232d the animation-carrier law — the RGB carrier v the Gray alpha mate + the clone-only family", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "d17");
  await pinnedPrint(page, 1000, "d10");
  const a = imageCensus(qpdfNorm(pdfFile("d17"), "d17"));
  const b = imageCensus(qpdfNorm(pdfFile("d10"), "d10"));
  const bShas = new Set(b.map((i) => i.sha));
  const isTInv = (num: number) => {
    const rec = a.find((i) => i.num === num);
    return rec ? bShas.has(rec.sha) : false;
  };

  // THE ANIMATION-CARRIER LAW, the honest per-pair census: the frame-
  // dependent family is {obj 4, the 1047x105 pair BOTH members, the
  // 2025x534 RGB, the 201x201 RGB, the 201x1 RGB} — in the three
  // carrier pairs ([53,54],[97,98],[99,100]) the /DeviceRGB member is
  // the frame-dependent carrier while its /DeviceGray alpha mate is
  // T-invariant; the 1047x105 pair [37,38] the registered BOTH-carry
  // exception; the 1165x103 pair [40,41] the STATIC pair (neither
  // member carries)
  const pairs: Array<[number, number, "carrier" | "both" | "static"]> = [
    [37, 38, "both"],
    [40, 41, "static"],
    [53, 54, "carrier"],
    [97, 98, "carrier"],
    [99, 100, "carrier"],
  ];
  for (const [rgb, gray, kind] of pairs) {
    const rgbRec = a.find((i) => i.num === rgb)!;
    const grayRec = a.find((i) => i.num === gray)!;
    expect(rgbRec.cs, `obj ${rgb} the RGB member`).toBe("/DeviceRGB");
    expect(grayRec.cs, `obj ${gray} the Gray alpha mate`).toBe("/DeviceGray");
    expect(grayRec.smask, `obj ${gray} carries no SMask of its own`).toBe(false);
    if (kind === "carrier") {
      expect(isTInv(rgb), `obj ${rgb} the RGB carrier (frame-dependent)`).toBe(false);
      expect(isTInv(gray), `obj ${gray} the Gray mate T-invariant`).toBe(true);
    } else if (kind === "both") {
      expect(isTInv(rgb), "obj 37 the pair exception (both carry)").toBe(false);
      expect(isTInv(gray), "obj 38 the pair exception (both carry)").toBe(false);
    } else {
      expect(isTInv(rgb), "obj 40 the static pair T-invariant").toBe(true);
      expect(isTInv(gray), "obj 41 the static pair T-invariant").toBe(true);
    }
  }

  // THE CLONE-ONLY FAMILY: the 201x1 pair + the shimmer trio (the D125
  // form-nested superset — the live's 13-image census has none of these)
  const slivers = a.filter((i) => (i.w === 201 && i.h === 1) || i.w === 738 || (i.w === 1 && i.h === 26));
  expect(slivers.map((i) => `${i.num}:${i.w}x${i.h}:${i.bytes}`), "the clone-only sliver family").toEqual([
    "99:201x1:603",
    "100:201x1:201",
    "144:738x26:57564",
    "145:1x26:78",
    "146:738x1:2214",
  ]);
  // the clone-only family's T-profile: obj 99 the 201x1 RGB CARRIER
  // (frame-dependent — the registered carrier family), the other four
  // the static T-invariant slivers
  expect(isTInv(99), "obj 99 the sliver's RGB carrier (frame-dependent)").toBe(false);
  for (const s of [100, 144, 145, 146]) {
    expect(isTInv(s), `obj ${s} the static sliver T-invariant`).toBe(true);
  }
});
