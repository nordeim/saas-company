import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 68 — THE FORTY-THIRD SURFACE: the content-stream `gs`
 * EXTGSTATE-INVOCATION LAYER under the pinned-frame contract (D224,
 * law-quality). The third name-table sibling: S66 measured the /Pattern
 * table's scn invocations, S67 the /XObject table's Do invocations —
 * this surface measures WHERE the document invokes its EXTGSTATE
 * graphics states: every `<name> gs` site in every page, form and
 * tiling-pattern stream, the names resolved BY VALUE through each
 * OWNER's /Resources//ExtGState table (lessons 104/105/106: compare
 * values, never object identity or name tokens).
 *
 * (a) THE INVOCATION-SITE CENSUS — the clone: 132 sites = 124
 *     form-container + 8 tiling-container, ZERO page-stream, ZERO
 *     unresolved names, at BOTH pinned frames (132/132).
 *
 * (b) THE VALUE CENSUS — the invoked gs values decompose to 18 distinct
 *     identities: the full-stroke-fill family (/BM,/CA,/LC,/LJ,/LW,/ML,
 *     /SA,/ca at ca204 x3 + ca255 x13 + ca26 x1), the plain alpha family
 *     (ca255 x43, ca26 x30, ca153 x8, ca51 x6, ca128 x3, ca5 x3, and the
 *     singles ca13/ca179/ca204/ca230/ca77), the ONE /Screen blend (ca255),
 *     and the SMask-bearing states (8 /Luminosity + 2 /Alpha + 6 /None —
 *     the /None object invoked SIX times: the S64 @51 dedup family
 *     measured at the invocation layer).
 *
 * (c) THE PHASE-SLOT LAW — the animated 1169x149 phase form carries
 *     DIFFERENT gs invocations per pinned frame: the ca230 slot present
 *     at T=1700 and ABSENT at T=1000, and the ca128 slot GAINED at
 *     T=1000 (3 -> 4 multiset-wide) — the first phase-dependent gs
 *     INVOCATION record, measured IDENTICALLY on both sides (the S67
 *     shared-phase-form family extended to the gs layer).
 *
 * (d) THE T-INVARIANCE BY VALUE — 16 of 18 values T-invariant across
 *     T=1700/T=1000; only the two phase slots move (ca230 1->0, ca128
 *     3->4); the total 132 = 132; the zero-page-stream and
 *     zero-unresolved laws hold at both frames.
 *
 * The cross-side records (the S68 recon walk): 16 of 18 values at
 * IDENTICAL multiplicities at T=1700 — the deepest invocation-layer
 * parity yet measured. The two cross-side deltas: the clone's ca255 +3
 * (the border-shimmer tiling's 2 clone-only invocations — the D125/S56
 * CSS-rasterized family at the gs layer — plus the dashboard-mockup
 * form's +1, 19 v 18) and the live's /Luminosity +2 (the D220 hero-band
 * mask-gradient pair — the two organic-gradient hero text elements —
 * independently confirmed at the invocation layer). The live's own
 * totals: 131@T1700 -> 130@T1000 (123 form stable; the tiling 8->7, one
 * emission-unstable tiling invocation — the same print-jitter family
 * the S67 Do-layer len603 sliver belongs to). NO src/ fix —
 * engine-emission families with identical visuals. This spec pins the
 * CLONE side so any drift surfaces at the gate. The dwell contract: the
 * S63-67 pinned-frame form verbatim (1280x720 + networkidle + 4000ms +
 * pause-every-WAAPI-animation at T + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s68-gs-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-67 form, verbatim) ----------

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

// ---------- the qpdf reader (the S63-67 form) ----------

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

/** THE D187 GRID with JS Math.round semantics — floor(v*255 + 0.5), never
 * round() (gotcha 72b). */
const grid = (v: unknown): number | null =>
  typeof v === "number" ? Math.floor(v * 255 + 0.5) : null;

// ---------- D224: the gs invocation census ----------

interface GsSite {
  obj: string;
  kind: "page" | "form" | "tiling";
  name: string;
  value: string;
  ca: number | null;
}

/** Walk every page + form + tiling-pattern content stream; find the
 * `<name> gs` invocation sites; resolve each name through the OWNING
 * stream's /Resources//ExtGState table to the TARGET's VALUE identity
 * (the dict shape + /BM + the gridded /ca + /CA + the /SMask kind). */
const gsCensus = (norm: Norm): GsSite[] => {
  // the owner -> name -> ExtGState tables
  const tables = new Map<string, Record<string, unknown>>();
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d) continue;
    const res = dictOf(norm, deref(norm, d["/Resources"]));
    const egs = res
      ? (dictOf(norm, deref(norm, res["/ExtGState"])) as Record<string, unknown> | null)
      : null;
    if (egs) tables.set(k, egs);
  }
  const gsValue = (ref: unknown): { value: string; ca: number | null } => {
    const d = dictOf(norm, deref(norm, ref));
    if (!d) return { value: "UNRESOLVED", ca: null };
    const shape = Object.keys(d)
      .filter((k) => k !== "/Type")
      .sort()
      .join(",");
    const bm = "/BM" in d ? String(val(d["/BM"])) : "-";
    const ca = "/ca" in d ? grid(val(d["/ca"])) : null;
    const CA = "/CA" in d ? grid(val(d["/CA"])) : null;
    let smask = "-";
    if ("/SMask" in d) {
      if (d["/SMask"] === "/None") {
        smask = "SM:None";
      } else {
        const smd = dictOf(norm, deref(norm, d["/SMask"]));
        smask = `SM:${smd ? String(val(smd["/S"])) : "?"}`;
      }
    }
    return {
      value: `gs{${shape}}:${bm}:ca${ca ?? "-"}:CA${CA ?? "-"}:${smask}`,
      ca,
    };
  };
  const sites: GsSite[] = [];
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
    const re = /(\/[A-Za-z0-9]+)\s+gs\b/g;
    for (const m of stream.matchAll(re)) {
      const name = m[1]!;
      const tab = tables.get(k) ?? {};
      const target = name in tab ? gsValue(tab[name]) : { value: "UNRESOLVED", ca: null };
      sites.push({
        obj: k,
        kind: isPage ? "page" : isTiling ? "tiling" : "form",
        name,
        value: target.value,
        ca: target.ca,
      });
    }
  }
  return sites;
};

const multiset = (values: string[]): Record<string, number> => {
  const m: Record<string, number> = {};
  for (const v of values) m[v] = (m[v] ?? 0) + 1;
  return m;
};

// ---------- D224a: the invocation-site census ----------

test("D224a the invocation-site census — 132 sites (124 form + 8 tiling), zero page-stream, zero unresolved", async ({ page }) => {
  test.setTimeout(180_000);
  const { file, pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const sites = gsCensus(qpdfNorm(file, "a"));
  expect(sites.length, "the invocation-site count").toBe(132);
  expect(sites.filter((s) => s.kind === "page"), "ZERO page-stream invocations").toEqual([]);
  const byKind: Record<string, number> = {};
  for (const s of sites) byKind[s.kind] = (byKind[s.kind] ?? 0) + 1;
  expect(byKind, "the container-kind split").toEqual({ form: 124, tiling: 8 });
  expect(
    sites.every((s) => s.value !== "UNRESOLVED"),
    "every name resolves through its owner's /ExtGState table",
  ).toBe(true);
});

// ---------- D224b: the value census ----------

test("D224b the value census — the 18 identities at the exact multiplicities", async ({ page }) => {
  test.setTimeout(180_000);
  const { file } = await pinnedPrint(page, 1700, "b");
  const m = multiset(gsCensus(qpdfNorm(file, "b")).map((s) => s.value));
  expect(Object.keys(m).length, "the distinct-value count").toBe(18);
  // the full-stroke-fill family (17 = 3 + 13 + 1)
  expect(m["gs{/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca}:/Normal:ca204:CA204:-"]).toBe(3);
  expect(m["gs{/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca}:/Normal:ca255:CA255:-"]).toBe(13);
  expect(m["gs{/BM,/CA,/LC,/LJ,/LW,/ML,/SA,/ca}:/Normal:ca26:CA26:-"]).toBe(1);
  // the plain alpha family
  expect(m["gs{/BM,/ca}:/Normal:ca255:CA-:-"]).toBe(43);
  expect(m["gs{/BM,/ca}:/Normal:ca26:CA-:-"]).toBe(30);
  expect(m["gs{/BM,/ca}:/Normal:ca153:CA-:-"]).toBe(8);
  expect(m["gs{/BM,/ca}:/Normal:ca51:CA-:-"]).toBe(6);
  expect(m["gs{/BM,/ca}:/Normal:ca128:CA-:-"]).toBe(3);
  expect(m["gs{/BM,/ca}:/Normal:ca5:CA-:-"]).toBe(3);
  expect(m["gs{/BM,/ca}:/Normal:ca13:CA-:-"]).toBe(1);
  expect(m["gs{/BM,/ca}:/Normal:ca179:CA-:-"]).toBe(1);
  expect(m["gs{/BM,/ca}:/Normal:ca204:CA-:-"]).toBe(1);
  expect(m["gs{/BM,/ca}:/Normal:ca230:CA-:-"]).toBe(1);
  expect(m["gs{/BM,/ca}:/Normal:ca77:CA-:-"]).toBe(1);
  // the ONE /Screen blend (the S62 /SCREEN law's only invocation-layer sighting)
  expect(m["gs{/BM,/ca}:/Screen:ca255:CA-:-"]).toBe(1);
  // the SMask-bearing states — the /None object invoked SIX times (the
  // S64 @51 dedup family at the invocation layer)
  expect(m["gs{/SMask}:-:ca-:CA-:SM:/Alpha"]).toBe(2);
  expect(m["gs{/SMask}:-:ca-:CA-:SM:/Luminosity"]).toBe(8);
  expect(m["gs{/SMask}:-:ca-:CA-:SM:None"]).toBe(6);
});

// ---------- D224c: the phase-slot law ----------

test("D224c the phase-slot law — the ca230 slot vanishes and the ca128 slot is gained inside the 1169x149 phase form", async ({ page }) => {
  test.setTimeout(240_000);
  const a = await pinnedPrint(page, 1700, "c1");
  const b = await pinnedPrint(page, 1000, "c2");
  const na = qpdfNorm(a.file, "c1");
  const nb = qpdfNorm(b.file, "c2");
  const ma = multiset(gsCensus(na).map((s) => s.value));
  const mb = multiset(gsCensus(nb).map((s) => s.value));

  // the ca230 phase slot: present at T=1700, ABSENT at T=1000
  expect(ma["gs{/BM,/ca}:/Normal:ca230:CA-:-"], "ca230 @T=1700").toBe(1);
  expect(mb["gs{/BM,/ca}:/Normal:ca230:CA-:-"] ?? 0, "ca230 @T=1000 (absent)").toBe(0);
  // the ca128 phase slot: GAINED at T=1000 (3 -> 4)
  expect(ma["gs{/BM,/ca}:/Normal:ca128:CA-:-"], "ca128 @T=1700").toBe(3);
  expect(mb["gs{/BM,/ca}:/Normal:ca128:CA-:-"], "ca128 @T=1000 (+1, the phase form)").toBe(4);

  // the slots live INSIDE the animated 1169x149 phase form: find the
  // form whose gs invocation set differs across frames and pin that BOTH
  // deltas attribute to it (the container-level attribution)
  const byContainer = (norm: Norm) => {
    const sites = gsCensus(norm);
    const out = new Map<string, Array<number | null>>();
    for (const s of sites) {
      const d = dictOf(norm, norm[s.obj]);
      const bbox = d && Array.isArray(d["/BBox"]) ? (d["/BBox"] as unknown[]).map((x) => val(x)).join(",") : "?";
      const key = `${s.kind}:${bbox}`;
      if (!out.has(key)) out.set(key, []);
      out.get(key)!.push(s.ca);
    }
    return out;
  };
  const caIn = (m: Map<string, Array<number | null>>, key: string, ca: number) =>
    (m.get(key) ?? []).filter((x) => x === ca).length;
  const A = byContainer(na);
  const B = byContainer(nb);
  const phaseKey = "form:0,0,1169,149";
  expect(caIn(A, phaseKey, 230), "the phase form carries the ca230 @T=1700").toBe(1);
  expect(caIn(B, phaseKey, 230), "the phase form's ca230 gone @T=1000").toBe(0);
  expect(caIn(A, phaseKey, 128), "the phase form's ca128 @T=1700").toBe(0);
  expect(caIn(B, phaseKey, 128), "the phase form GAINS the ca128 @T=1000").toBe(1);
  // every OTHER container's ca-set is frame-stable
  const stableKeys = [...A.keys()].filter((k) => k !== phaseKey);
  for (const k of stableKeys) {
    expect(
      JSON.stringify([...(A.get(k) ?? [])].sort()),
      `container ${k} ca-set T-invariant`,
    ).toBe(JSON.stringify([...(B.get(k) ?? [])].sort()));
  }
});

// ---------- D224d: the T-invariance by value ----------

test("D224d the T-invariance by value — 16 of 18 values T-invariant; only the two phase slots move; the laws hold at both frames", async ({ page }) => {
  test.setTimeout(240_000);
  const a = await pinnedPrint(page, 1700, "d1");
  const b = await pinnedPrint(page, 1000, "d2");
  const ma = multiset(gsCensus(qpdfNorm(a.file, "d1")).map((s) => s.value));
  const mb = multiset(gsCensus(qpdfNorm(b.file, "d2")).map((s) => s.value));

  expect(Object.keys(ma).length, "18 distinct values @T=1700").toBe(18);
  expect(Object.keys(mb).length, "17 distinct values @T=1000 (the ca230 slot gone; the ca128 slot's +1 changes a multiplicity, not the key set)").toBe(17);

  // exactly TWO values move — the phase slots
  const moved = new Set([
    ...Object.keys(ma).filter((k) => (mb[k] ?? 0) !== ma[k]),
    ...Object.keys(mb).filter((k) => (ma[k] ?? 0) !== mb[k]),
  ]);
  expect([...moved].sort(), "the only movers are the two phase slots").toEqual([
    "gs{/BM,/ca}:/Normal:ca128:CA-:-",
    "gs{/BM,/ca}:/Normal:ca230:CA-:-",
  ]);
  // the totals hold across frames
  const totalA = Object.values(ma).reduce((x, y) => x + y, 0);
  const totalB = Object.values(mb).reduce((x, y) => x + y, 0);
  expect(totalA, "132 invocations @T=1700").toBe(132);
  expect(totalB, "132 invocations @T=1000").toBe(132);

  // the structural laws hold at BOTH frames
  for (const [m, tag] of [[ma, "1700"], [mb, "1000"]] as const) {
    void m;
    void tag;
  }
  const sa = gsCensus(qpdfNorm(a.file, "d1"));
  const sb = gsCensus(qpdfNorm(b.file, "d2"));
  for (const [sites, tag] of [[sa, "T=1700"], [sb, "T=1000"]] as const) {
    expect(sites.filter((s) => s.kind === "page"), `zero page-stream @${tag}`).toEqual([]);
    expect(
      sites.every((s) => s.value !== "UNRESOLVED"),
      `every name resolves @${tag}`,
    ).toBe(true);
    const byKind: Record<string, number> = {};
    for (const s of sites) byKind[s.kind] = (byKind[s.kind] ?? 0) + 1;
    expect(byKind, `the container-kind split @${tag}`).toEqual({ form: 124, tiling: 8 });
  }
});
