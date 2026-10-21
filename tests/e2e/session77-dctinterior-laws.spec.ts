import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 77 — THE FIFTY-SECOND SURFACE: THE DCT INTERIOR STRUCTURE
 * LAYER under the pinned-frame contract (D233, law quality). The DCT
 * family's unmeasured remainder: the four grayscale logo JPEGs' own
 * INTERIOR marker chains — the APP0/JFIF header, the DQT quantization
 * table VALUES, the SOF0 sampling contract, the DHT Huffman
 * code-length signatures, the SOS scan header — decoded segment by
 * segment, measured on the two-sided pinned walk (both sides at
 * T=1700 + T=1000).
 *
 * (a) THE SITE CENSUS — 4 DCT images at [23, 28, 119, 123] @T=1700
 *     (the grayscale logo family: 626x204, 710x288, 541x160,
 *     625x245); the tail pair [119, 123] shifting by EXACTLY -1
 *     @T=1000 (118, 122 — the S68 phase-slot contraction at the DCT
 *     layer, the same allocation-order family as D231/D232).
 *
 * (b) THE PAYLOAD BYTE LAW — all four payloads byte-identical across
 *     frames (T-invariant: 3082/3839/2502/3069 bytes at the exact
 *     shas) — the DCT family is the STABLE-SHARED CORE (no animation
 *     carrier, no per-load capture): cross-side the same four shas
 *     (the S57 payload-bucket law re-verified at the interior layer's
 *     foundation).
 *
 * (c) THE UNIFORM STRUCTURE LAWS — every image: the minimal APP0
 *     (len 16, "JFIF", v1.1, units 0, density 1x1, no thumbnail); the
 *     ONE shared DQT (pq0 tq0, len 67, the 64-entry table at the
 *     standard IJG luminance values — sha 266e783fc548, min 10, max
 *     121, first8 [16,11,12,14,12,10,16,14]); the SOF0 baseline
 *     contract (FFC0, len 11, 8-bit, ncomps 1, id 1, hv 0x11 — no
 *     subsampling, tq 0); the SOS full-spectrum sequential scan (ns 1,
 *     cs 1, dc 0, ac 0, ss 0, se 63, ah 0, al 0).
 *
 * (d) THE DHT SIGNATURE LAW — the per-image Huffman tables form a
 *     PER-DIMS SIGNATURE (the encoder's per-image optimization, NOT
 *     the standard K3/K5 tables): the DC shapes in TWO families (the
 *     [1,0,2,3,1,1] pair on 626x204 + 541x160; the [1,0,3,1,1,1] pair
 *     on 710x288 + 625x245); the AC shapes four distinct custom
 *     tables (totals 16/10/16/9). Cross-side the signatures identical
 *     (the S77 walk's two-sided record).
 *
 * The dwell contract: the S63-76 pinned-frame form verbatim (1280x720 +
 * networkidle + 4000ms + pause-every-WAAPI-animation at T + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s77-t-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-76 form, verbatim) ----------

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

// ---------- the qpdf reader (the S63-76 form) ----------

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

const dictOf = (v: unknown): Record<string, unknown> | null => {
  void 0;
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

const dataOf = (v: unknown): string | null => {
  if (!v || typeof v !== "object") return null;
  const o = v as QpdfObj;
  if ("stream" in o && o.stream && typeof o.stream === "object") {
    return (o.stream as { data?: string }).data ?? null;
  }
  return null;
};

const decodeB64 = (s: string | null): Buffer =>
  s ? Buffer.from(s, "base64") : Buffer.alloc(0);

const shaOf = (b: Buffer): string =>
  createHash("sha256").update(b).digest("hex").slice(0, 12);

// ---------- D233: the JPEG interior decode ----------

interface DqtRec { pq: number; tq: number; tableSha: string; min: number; max: number; first8: number[]; }
interface DhtRec { tc: number; th: number; total: number; countsSig: string; }
interface Interior {
  markers: string[];
  app0: { len: number; id: string; ver: string; units: number; xdensity: number; ydensity: number; thumbW: number; thumbH: number } | null;
  dqt: DqtRec[];
  sof: { marker: string; len: number; precision: number; height: number; width: number; ncomps: number; comps: { id: number; hv: number; tq: number }[] } | null;
  dht: DhtRec[];
  sos: { ns: number; comps: { cs: number; dc: number; ac: number }[]; ss: number; se: number; ah: number; al: number } | null;
}

const jpegInterior = (buf: Buffer): Interior => {
  let i = 2; // past SOI
  const out: Interior = { markers: [], app0: null, dqt: [], sof: null, dht: [], sos: null };
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1]!;
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
    if (m === 0xd9) break; // EOI (after the scan — not reached pre-SOS)
    if (m === 0xda) { // SOS
      const len = buf.readUInt16BE(i + 2);
      const ns = buf[i + 4]!;
      const comps: { cs: number; dc: number; ac: number }[] = [];
      for (let c = 0; c < ns; c++) {
        comps.push({ cs: buf[i + 5 + c * 2]!, dc: buf[i + 6 + c * 2]! >> 4, ac: buf[i + 6 + c * 2]! & 0xf });
      }
      const p = i + 5 + ns * 2;
      out.sos = { ns, comps, ss: buf[p]!, se: buf[p + 1]!, ah: buf[p + 2]! >> 4, al: buf[p + 2]! & 0xf };
      void len;
      break;
    }
    const len = buf.readUInt16BE(i + 2);
    if (m === 0xe0) { // APP0 JFIF — payload = "JFIF\0" + ver(2) + units(1) + density(4) + thumb(2)
      out.app0 = {
        len,
        id: buf.subarray(i + 4, i + 9).toString("latin1").replace(/\0/g, ""),
        ver: `${buf[i + 9]}.${buf[i + 10]}`,
        units: buf[i + 11]!,
        xdensity: buf.readUInt16BE(i + 12),
        ydensity: buf.readUInt16BE(i + 14),
        thumbW: buf[i + 16]!, thumbH: buf[i + 17]!,
      };
    } else if (m === 0xdb) { // DQT
      const pq = buf[i + 4]! >> 4, tq = buf[i + 4]! & 0xf;
      const table: number[] = [];
      for (let q = 0; q < 64; q++) table.push(buf[i + 5 + q]!);
      out.dqt.push({
        pq, tq,
        tableSha: shaOf(buf.subarray(i + 5, i + 2 + len)),
        min: Math.min(...table), max: Math.max(...table), first8: table.slice(0, 8),
      });
    } else if (m === 0xc0 || m === 0xc1 || m === 0xc2) { // SOF
      const comps: { id: number; hv: number; tq: number }[] = [];
      for (let c = 0; c < buf[i + 9]!; c++) {
        const off = i + 10 + c * 3;
        comps.push({ id: buf[off]!, hv: buf[off + 1]!, tq: buf[off + 2]! });
      }
      out.sof = {
        marker: `FF${m.toString(16).toUpperCase()}`, len,
        precision: buf[i + 4]!,
        height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7),
        ncomps: buf[i + 9]!, comps,
      };
    } else if (m === 0xc4) { // DHT
      const tc = buf[i + 4]! >> 4, th = buf[i + 4]! & 0xf;
      const counts: number[] = [];
      for (let c = 0; c < 16; c++) counts.push(buf[i + 5 + c]!);
      out.dht.push({ tc, th, total: counts.reduce((a, b) => a + b, 0), countsSig: counts.join(",") });
    }
    out.markers.push(`FF${m.toString(16).toUpperCase()}:${len}`);
    i += 2 + len;
  }
  return out;
};

interface DctRec {
  num: number;
  dims: string;
  bytes: number;
  sha: string;
  interior: Interior;
}

const dctCensus = (norm: Norm): DctRec[] => {
  const out: DctRec[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(o);
    if (!d || val(d["/Subtype"]) !== "/Image") continue;
    const f = d["/Filter"] !== undefined ? JSON.stringify(val(d["/Filter"])) : "none";
    if (!f.includes("DCT")) continue;
    const buf = decodeB64(dataOf(o));
    out.push({
      num: Number(k.match(/^obj:(\d+)/)?.[1] ?? -1),
      dims: `${String(val(d["/Width"]))}x${String(val(d["/Height"]))}`,
      bytes: buf.length,
      sha: shaOf(buf),
      interior: jpegInterior(buf),
    });
  }
  return out.sort((a, b) => a.num - b.num);
};

// ---------- D233a: the site census + the tail -1 numbering ----------

test("D233a the DCT site census — 4 grayscale JPEGs, the shared prefix [23,28], the tail -1 numbering law", async ({ page }) => {
  test.setTimeout(180_000);
  const { pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  await pinnedPrint(page, 1000, "a10");
  const a = dctCensus(qpdfNorm(pdfFile("a"), "a"));
  const b = dctCensus(qpdfNorm(pdfFile("a10"), "a10"));

  expect(a.length, "the DCT image census").toBe(4);
  expect(a.map((i) => i.num), "the object numbers @T=1700").toEqual([23, 28, 119, 123]);
  expect(a.map((i) => i.dims), "the dims census").toEqual(["626x204", "710x288", "541x160", "625x245"]);
  expect(a.map((i) => i.bytes), "the byte-length census").toEqual([3082, 3839, 2502, 3069]);

  // the shared prefix [23, 28] frame-stable; the tail [119, 123] -> -1 @T=1000
  expect(b.map((i) => i.num), "the tail -1 numbering law @T=1000 (the S68 family at the DCT layer)").toEqual([23, 28, 118, 122]);
  expect(b.map((i) => i.dims), "the dims census frame-stable").toEqual(a.map((i) => i.dims));
});

// ---------- D233b: the payload byte law (T-invariance) ----------

test("D233b the payload byte law — all four payloads T-invariant (the stable-shared core family)", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "b17");
  await pinnedPrint(page, 1000, "b10");
  const a = dctCensus(qpdfNorm(pdfFile("b17"), "b17"));
  const b = dctCensus(qpdfNorm(pdfFile("b10"), "b10"));

  // the exact payload shas @T=1700 (the S77 walk's measured values)
  expect(a.map((i) => i.sha), "the payload shas @T=1700").toEqual([
    "b6f14f7d62a1", "31aa41087b8a", "794329e30b31", "8f9387344f24",
  ]);
  // T-invariance: every payload byte-identical across frames
  expect(b.map((i) => i.sha), "the payload shas @T=1000 (T-INVARIANT)").toEqual(a.map((i) => i.sha));
  expect(b.map((i) => i.bytes), "the byte lengths T-invariant").toEqual(a.map((i) => i.bytes));
});

// ---------- D233c: the uniform structure laws (APP0 + DQT + SOF + SOS) ----------

test("D233c the uniform structure laws — the minimal APP0, the ONE shared DQT (the IJG luminance values), the SOF0/SOS contracts", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "c");
  const a = dctCensus(qpdfNorm(pdfFile("c"), "c"));
  expect(a.length).toBe(4);

  for (const im of a) {
    const it = im.interior;
    // the head chain: APP0 -> DQT -> SOF0, then exactly two DHTs, then (SOS)
    expect(it.markers.slice(0, 3), `obj ${im.num} the head chain APP0->DQT->SOF0`).toEqual(["FFE0:16", "FFDB:67", "FFC0:11"]);
    expect(it.markers.filter((m) => m.startsWith("FFC4")), `obj ${im.num} exactly two DHT segments`).toHaveLength(2);
    expect(it.markers.length, `obj ${im.num} the segment census (5 marker segments pre-SOS)`).toBe(5);

    // the minimal APP0/JFIF header
    expect(it.app0, `obj ${im.num} the APP0`).toEqual({
      len: 16, id: "JFIF", ver: "1.1", units: 0, xdensity: 1, ydensity: 1, thumbW: 0, thumbH: 0,
    });

    // the ONE shared DQT (the standard IJG luminance table)
    expect(it.dqt, `obj ${im.num} the DQT census`).toEqual([{
      pq: 0, tq: 0, tableSha: "266e783fc548", min: 10, max: 121,
      first8: [16, 11, 12, 14, 12, 10, 16, 14],
    }]);

    // the SOF0 baseline grayscale contract
    expect(it.sof && it.sof.marker, `obj ${im.num} the SOF marker`).toBe("FFC0");
    expect(it.sof?.len).toBe(11);
    expect(it.sof?.precision).toBe(8);
    expect(it.sof?.ncomps).toBe(1);
    expect(it.sof?.comps, `obj ${im.num} the sampling (1x1, no subsampling)`).toEqual([{ id: 1, hv: 17, tq: 0 }]);

    // the SOS full-spectrum sequential scan
    expect(it.sos, `obj ${im.num} the SOS`).toEqual({
      ns: 1, comps: [{ cs: 1, dc: 0, ac: 0 }], ss: 0, se: 63, ah: 0, al: 0,
    });
  }

  // the SOF dims agree with the image dict dims
  const dimsPairs = a.map((im) => `${im.interior.sof?.width}x${im.interior.sof?.height}`);
  expect(dimsPairs, "the SOF dims = the dict dims").toEqual(a.map((im) => im.dims));
});

// ---------- D233d: the DHT signature law ----------

test("D233d the DHT signature law — the per-dims Huffman census, the DC two-family split, the custom AC tables", async ({ page }) => {
  test.setTimeout(180_000);
  await pinnedPrint(page, 1700, "d");
  const a = dctCensus(qpdfNorm(pdfFile("d"), "d"));
  expect(a.length).toBe(4);

  // the per-dims DHT signatures (DC|AC code-length counts)
  const sig = (im: DctRec) => im.interior.dht.map((h) => `${h.tc}${h.th}:${h.countsSig}`).join(" | ");
  expect(sig(a[0]!), "626x204 the DHT signature").toBe(
    "00:1,0,2,3,1,1,0,0,0,0,0,0,0,0,0,0 | 10:1,0,1,2,6,2,3,1,0,0,0,0,0,0,0,0"
  );
  expect(sig(a[1]!), "710x288 the DHT signature").toBe(
    "00:1,0,3,1,1,1,0,0,0,0,0,0,0,0,0,0 | 10:1,0,1,5,1,1,1,0,0,0,0,0,0,0,0,0"
  );
  expect(sig(a[2]!), "541x160 the DHT signature").toBe(
    "00:1,0,2,3,1,1,0,0,0,0,0,0,0,0,0,0 | 10:1,0,1,3,4,2,3,1,1,0,0,0,0,0,0,0"
  );
  expect(sig(a[3]!), "625x245 the DHT signature").toBe(
    "00:1,0,3,1,1,1,0,0,0,0,0,0,0,0,0,0 | 10:1,0,1,5,1,1,0,0,0,0,0,0,0,0,0,0"
  );

  // the DC two-family law: [1,0,2,3,1,1] on 626x204 + 541x160; [1,0,3,1,1,1] on 710x288 + 625x245
  const dcSigs = a.map((im) => im.interior.dht[0]!.countsSig);
  expect(dcSigs[0]).toBe(dcSigs[2]);
  expect(dcSigs[1]).toBe(dcSigs[3]);
  expect(dcSigs[0]).not.toBe(dcSigs[1]);

  // the AC four-distinct law (the per-image custom tables — NOT the standard K5)
  const acSigs = new Set(a.map((im) => im.interior.dht[1]!.countsSig));
  expect(acSigs.size, "the AC tables all four distinct").toBe(4);

  // the totals census
  expect(a.map((im) => im.interior.dht[0]!.total), "the DC totals").toEqual([8, 7, 8, 7]);
  expect(a.map((im) => im.interior.dht[1]!.total), "the AC totals").toEqual([16, 10, 16, 9]);
});
