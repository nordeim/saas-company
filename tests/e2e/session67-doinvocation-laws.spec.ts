import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 67 — THE FORTY-SECOND SURFACE: the content-stream /XObject Do
 * INVOCATION LAYER under the pinned-frame contract (D223, law-quality).
 * The S66 /scn census measured WHERE patterns are invoked (every scn site
 * in a FORM XObject); this surface measures the sibling layer — WHERE the
 * document invokes its XObjects: every `<name> Do` site in every page,
 * form and tiling-pattern stream, the names resolved BY VALUE through each
 * OWNER's /Resources//XObject table (lessons 104/105: compare values,
 * never object identity or name tokens).
 *
 * (a) THE INVOCATION-SITE CENSUS — the clone: 24 sites = 19 form-container
 *     + 5 tiling-container, ZERO page-stream invocations, ZERO unresolved
 *     names, exactly ONE value invoked twice (the animated phase form),
 *     every other invoked value exactly once (the one-invocation law).
 *
 * (b) THE VALUE CENSUS — the invoked XObjects decompose to 11 FORM
 *     invocations (the 1169x149 strip family [the near-twin len4781, the
 *     len112, the len765 phase pair, the len67], the 179x83 len2098, the
 *     2023x532 len60, the 29x29 len1003, the 729x770 trio len2084/2106/
 *     2116) + 13 IMAGE invocations (the shared payload family incl. the
 *     6220800 video frame + the clone-only CSS-rasterized slivers
 *     len2214/57564/603/78 — the D125/S56 registered family).
 *
 * (c) THE SHARED PHASE FORM — the doubly-invoked 1169x149 form is an
 *     ANIMATED PILL whose emitted geometry differs by pinned frame
 *     (len765 at T=1700 -> len635 at T=1000 — the pill's m/l/c capsule
 *     path repositioned by the animation phase); the transition is the
 *     ONLY value change across frames (every image and every other form
 *     T-invariant by value — the len603 sliver included, present at BOTH
 *     frames on the clone where the live's is phase-dependent).
 *
 * (d) THE T-INVARIANCE BY VALUE — the full Do-invoked value multiset is
 *     identical across T=1700/T=1000 except the phase pair; the
 *     one-invocation law and the zero-unresolved law hold at both frames.
 *
 * The cross-side records (the S67 recon walk): the 1169x149 family's
 * object numbers ALIGN EXACTLY across sides (obj:42-52) with 5 of 6
 * streams byte-identical renormalized; the 729x770 trio byte-identical by
 * value across sides and T (the object renumbering family — clone
 * 87/93/95 v live 88/94/96); the near-twin's whole delta = ONE extra
 * `1 1 1 RG 1 1 1 rg` color re-establishment on the clone (18 chars, the
 * S51 white-re-establishment family at the form layer, zero visual
 * difference). NO src/ fix — engine-emission families with identical
 * visuals. This spec pins the CLONE side so any drift surfaces at the
 * gate. The dwell contract: the S63-66 pinned-frame form verbatim
 * (1280x720 + networkidle + 4000ms + pause-every-WAAPI-animation at T +
 * 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s67-do-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-66 form, verbatim) ----------

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

// ---------- the qpdf reader (the S63-66 form) ----------

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

// the D222d name-renormalization (the renumbering + epsilon families)
const normalizeStream = (s: string): string =>
  s
    .replace(/\/([XPG]|Cs\d?)[0-9]+/g, "/$1#")
    .replace(/-?\d*\.\d{7,}/g, (m) => Number(m).toFixed(6))
    .replace(/-?0\.000000\b/g, "0.000000");

// ---------- D223: the Do invocation census ----------

interface DoSite {
  obj: string;
  kind: "page" | "form" | "tiling";
  name: string;
  value: string;
}

/** Walk every page + form + tiling-pattern content stream; find the
 * `<name> Do` invocation sites; resolve each name through the OWNING
 * stream's /Resources//XObject table to the TARGET's VALUE identity
 * (/Subtype + /BBox + the renormalized stream length). */
const doCensus = (norm: Norm): DoSite[] => {
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
  const xobjValue = (ref: unknown): string => {
    const d = dictOf(norm, deref(norm, ref));
    if (!d) return "UNRESOLVED";
    const subtype = String(d["/Subtype"] ?? "?");
    const bbox = Array.isArray(d["/BBox"]) ? (d["/BBox"] as number[]).join(",") : "null";
    const stream = normalizeStream(decodeB64(dataOf(deref(norm, ref))));
    return `${subtype}:bbox[${bbox}]:len${stream.length}`;
  };
  const sites: DoSite[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const raw = dataOf(o);
    if (!raw) continue;
    const d = dictOf(norm, o);
    if (!d) continue;
    const isPage = d["/Type"] === "/Page";
    const isForm = d["/Subtype"] === "/Form" || d["/Subtype"] === "/PSForm";
    const isTiling = d["/PatternType"] === 1;
    if (!isPage && !isForm && !isTiling) continue;
    const stream = decodeB64(raw);
    const re = /(\/[A-Za-z0-9]+)\s+Do\b/g;
    for (const m of stream.matchAll(re)) {
      const name = m[1]!;
      const tab = tables.get(k) ?? {};
      sites.push({
        obj: k,
        kind: isPage ? "page" : isTiling ? "tiling" : "form",
        name,
        value: name in tab ? xobjValue(tab[name]) : "UNRESOLVED",
      });
    }
  }
  return sites;
};

// ---------- D223a: the invocation-site census ----------

test("D223a the invocation-site census — 24 sites (19 form + 5 tiling), zero page-stream, one dup", async ({ page }) => {
  test.setTimeout(180_000);
  const { file, pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const sites = doCensus(qpdfNorm(file, "a"));
  expect(sites.length, "the invocation-site count").toBe(24);
  expect(sites.filter((s) => s.kind === "page"), "ZERO page-stream invocations").toEqual([]);
  const byKind: Record<string, number> = {};
  for (const s of sites) byKind[s.kind] = (byKind[s.kind] ?? 0) + 1;
  expect(byKind, "the container-kind split").toEqual({ form: 19, tiling: 5 });
  expect(sites.every((s) => s.value !== "UNRESOLVED"), "every name resolves through its owner's table").toBe(true);
  // the one-invocation law: exactly ONE value invoked twice (the phase
  // form), every other invoked value exactly once
  const counts = new Map<string, number>();
  for (const s of sites) counts.set(s.value, (counts.get(s.value) ?? 0) + 1);
  const dups = [...counts.entries()].filter(([, n]) => n > 1);
  expect(dups, "exactly one doubly-invoked value (the phase form)").toEqual([
    ["/Form:bbox[0,0,1169,149]:len765", 2],
  ]);
});

// ---------- D223b: the value census ----------

test("D223b the value census — the 11 forms + the 13 images at the exact identities", async ({ page }) => {
  test.setTimeout(180_000);
  const { file } = await pinnedPrint(page, 1700, "b");
  const values = doCensus(qpdfNorm(file, "b"))
    .map((s) => s.value)
    .sort();
  const forms = values.filter((v) => v.startsWith("/Form:"));
  const images = values.filter((v) => v.startsWith("/Image:"));
  expect(forms.length, "the form-invocation count").toBe(11);
  expect(forms, "the form identities (the near-twin 4781 + the shared family)").toEqual([
    "/Form:bbox[0,0,1169,149]:len112",
    "/Form:bbox[0,0,1169,149]:len4781",
    "/Form:bbox[0,0,1169,149]:len67",
    "/Form:bbox[0,0,1169,149]:len765",
    "/Form:bbox[0,0,1169,149]:len765",
    "/Form:bbox[0,0,179,83]:len2098",
    "/Form:bbox[0,0,2023,532]:len60",
    "/Form:bbox[0,0,29,29]:len1003",
    "/Form:bbox[0,0,729,770]:len2084",
    "/Form:bbox[0,0,729,770]:len2106",
    "/Form:bbox[0,0,729,770]:len2116",
  ]);
  expect(images.length, "the image-invocation count").toBe(13);
  expect(images.map((v) => v.replace("/Image:bbox[null]:", "")), "the image payload lengths").toEqual([
    "len121203", "len2214", "len2502", "len3069", "len3082", "len3244050",
    "len329805", "len359985", "len3839", "len57564", "len603", "len6220800",
    "len78",
  ]);
});

// ---------- D223c: the shared phase form ----------

test("D223c the doubly-invoked 1169x149 form is the animated phase pair (len765 -> len635)", async ({ page }) => {
  test.setTimeout(180_000);
  const a = await pinnedPrint(page, 1700, "ca");
  const b = await pinnedPrint(page, 1000, "cb");
  const countsA = new Map<string, number>();
  for (const s of doCensus(qpdfNorm(a.file, "ca"))) {
    countsA.set(s.value, (countsA.get(s.value) ?? 0) + 1);
  }
  const countsB = new Map<string, number>();
  for (const s of doCensus(qpdfNorm(b.file, "cb"))) {
    countsB.set(s.value, (countsB.get(s.value) ?? 0) + 1);
  }
  // the phase pair at each frame: invoked twice, the ONLY value whose
  // identity changes across frames
  expect(countsA.get("/Form:bbox[0,0,1169,149]:len765"), "the phase form invoked twice at T=1700").toBe(2);
  expect(countsB.get("/Form:bbox[0,0,1169,149]:len635"), "the phase form invoked twice at T=1000").toBe(2);
  // every OTHER value is T-invariant: the multiset delta is exactly the pair
  const restA = [...countsA.entries()].filter(([v]) => v !== "/Form:bbox[0,0,1169,149]:len765").sort();
  const restB = [...countsB.entries()].filter(([v]) => v !== "/Form:bbox[0,0,1169,149]:len635").sort();
  expect(restB, "every other invoked value T-invariant (incl. the len603 sliver at BOTH frames)").toEqual(restA);
});

// ---------- D223d: the T-invariance by value over the full invoked tree ----------

test("D223d the Do census T-invariant by value except the phase pair; the laws hold at both frames", async ({ page }) => {
  test.setTimeout(180_000);
  const a = await pinnedPrint(page, 1700, "da");
  const b = await pinnedPrint(page, 1000, "db");
  const cA = doCensus(qpdfNorm(a.file, "da"));
  const cB = doCensus(qpdfNorm(b.file, "db"));
  expect(cB.length, "the site count T-invariant").toBe(cA.length);
  // the value multiset delta across frames is EXACTLY the phase pair
  // (normalize the phase token BEFORE sorting — len635 sorts before
  // len67 where len765 sorts after, breaking list alignment otherwise)
  const norm = (v: string) => v.replace(/len(765|635)/g, "lenPHASE");
  const valsA = cA.map((s) => norm(s.value)).sort().join("\n");
  const valsB = cB.map((s) => norm(s.value)).sort().join("\n");
  expect(valsB, "the full invoked tree identical by value modulo the phase pair").toEqual(valsA);
  // the structural laws hold at BOTH frames
  for (const c of [cA, cB]) {
    expect(c.filter((s) => s.kind === "page")).toEqual([]);
    expect(c.every((s) => s.value !== "UNRESOLVED")).toBe(true);
    const counts = new Map<string, number>();
    for (const s of c) counts.set(s.value, (counts.get(s.value) ?? 0) + 1);
    expect([...counts.values()].filter((n) => n > 1), "exactly one dup value at each frame").toEqual([2]);
  }
});
