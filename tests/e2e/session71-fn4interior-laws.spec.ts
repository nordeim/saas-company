import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 71 — THE FORTY-SIXTH SURFACE: THE TYPE-4 FUNCTION-STREAM
 * INTERIORS under the pinned-frame contract (D227, law-quality). The S55
 * function-layer walk measured the shading functions' DICT interiors (the
 * exponential Domain/C0/C1/N endpoints + the stitching, stored inline);
 * the S65 gradient-value walk measured the animated pair's pinned constants
 * at the value layer; the S70 tiling-interior walk measured the /P# painting
 * streams. THIS surface walks the TYPE-4 FUNCTION BODIES themselves — the
 * {pop dup ...} POSTFIX COLOR PROGRAMS the shading dicts reference — on the
 * animated landing, both pinned frames, every FunctionType-4 object: the
 * dict (Domain/Range) + the FULL program body + the operator census +
 * the embedded stop values, resolved BY VALUE (lessons 103/104).
 *
 * (a) THE SITE CENSUS — the clone: 5 fn4 bodies = the SHARED TRIO (obj
 *     8 the 332-byte alpha ramp; obj 14 the 233-byte black fade; obj 46
 *     the 12-byte `{1 exch sub}` — the S64 /TR inversion family) + THE
 *     ANIMATED PAIR (obj 148 the h1 gradient fn, obj 168 the span
 *     gradient fn). The Domain/Range contracts at the exact print values.
 *
 * (b) THE FULL-BYTE T-INVARIANCE + THE NUMBERING LAWS — every body
 *     byte-identical across T=1700/T=1000 (NO name-renumbering at this
 *     layer — the bodies carry zero /Name references, unlike the tiling
 *     and G-stream layers). The trio HELD at 8/14/46 at both frames; the
 *     pair shifted by EXACTLY -1 (148->147, 168->167 — the S68 ca230
 *     phase-slot contraction one layer up, the same attribution as the
 *     S69/S70 shifted objects).
 *
 * (c) THE TRIO'S EXACT BODIES — the three cross-side-shared programs at
 *     the exact bytes: obj 46 `{1 exch sub}`; obj 8 the two-branch ramp
 *     (the `-.60000002 mul .8 add` / `-.39999998 mul .5 add` stops + the
 *     div-normalization tail); obj 14 the black fade (the null middle +
 *     the same tail). These three bodies are BYTE-IDENTICAL ACROSS SIDES
 *     at the SAME object numbers (the S71 watch's cross-side record —
 *     the deepest cross-side parity: same numbers + same bytes + both
 *     frames); pinning the clone's copies pins the shared bodies.
 *
 * (d) THE ANIMATED PAIR + THE EPSILON CARRIERS — obj 148 (len 349, the
 *     h1 sheen) + obj 168 (len 452, the span sheen): the D222 registered
 *     float-precision family at the function-body layer — the clone's
 *     epsilon carriers (`-.083333373`, `.00000063773246`, `-.099999867`,
 *     `-.100000001`, `.50000024`, `-.0000038263947`, `.59999925`,
 *     `-.50000024`, `-.59999925`) where the live's shorter programs print
 *     the rounded mirrors (`.083333351`-family, len 321/403 — the
 *     engine-emission float-precision divergence, identical visuals, the
 *     D221/D222 masking laws). Both bodies T-INVARIANT (the animation
 *     phase lives in the alpha layer, NOT in the stop values — the S65
 *     law measured at the body layer) + print-deterministic (the a/b
 *     pair). NO src/ fix — engine-emission families with identical
 *     visuals. This spec pins the CLONE side so any drift surfaces at
 *     the gate. The dwell contract: the S63-70 pinned-frame form
 *     verbatim (1280x720 + networkidle + 4000ms +
 *     pause-every-WAAPI-animation at T + 150ms).
 */

const pdfFile = (name: string) => join(tmpdir(), `s71-t-${name}.pdf`);

// ---------- the pinned-frame instrument (the S63-70 form, verbatim) ----------

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

// ---------- the qpdf reader (the S63-70 form) ----------

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

const decodeB64 = (s: string | null): string => {
  if (!s) return "";
  return Buffer.from(s, "base64").toString("latin1");
};

const val = (v: unknown): unknown =>
  (v as { value?: unknown } | undefined)?.value ?? v;

// ---------- D227: the type-4 function-body census ----------

interface Fn4 {
  objNum: number;
  program: string;
  domain: string;
  range: string;
}

/** Walk every FunctionType-4 object: the dict (Domain/Range) + the decoded
 * program body (the {pop dup ...} postfix color program — its own interior,
 * the deepest layer of the shading tree). */
const fnCensus = (norm: Norm): Fn4[] => {
  const out: Fn4[] = [];
  for (const [k, o] of Object.entries(norm)) {
    const d = dictOf(norm, o);
    if (!d || typeof d !== "object") continue;
    if (val(d["/FunctionType"]) !== 4) continue;
    const m = k.match(/^obj:(\d+)/);
    out.push({
      objNum: m ? Number(m[1]) : -1,
      program: decodeB64(o.stream?.data ?? null),
      domain: Array.isArray(d["/Domain"])
        ? (d["/Domain"] as unknown[]).map((x) => val(x)).join(",")
        : "?",
      range: Array.isArray(d["/Range"])
        ? (d["/Range"] as unknown[]).map((x) => val(x)).join(",")
        : "?",
    });
  }
  return out.sort((a, b) => a.objNum - b.objNum);
};

/** The postfix-operator census (the ps operators inside the braces). */
const PS_OPS = /\b(dup|exch|pop|sub|add|mul|le|lt|gt|ge|eq|ne|abs|and|or|not|if|ifelse|copy|index|roll|min|max|sqrt|sin|cos|atan|exp|log|ln|neg|idiv|mod|round|truncate|cvi|cvr)\b/g;
const opCensus = (program: string): Record<string, number> => {
  const ops: Record<string, number> = {};
  for (const m of program.matchAll(PS_OPS)) ops[m[1]] = (ops[m[1]] ?? 0) + 1;
  return ops;
};

// ---------- D227a: the site census ----------

test("D227a the fn4 site census — 5 bodies (the shared trio 8/14/46 + the animated pair 148/168), the Domain/Range contracts", async ({ page }) => {
  test.setTimeout(180_000);
  const { file, pinned } = await pinnedPrint(page, 1700, "a");
  expect(pinned, "the at-rest animation set").toBeGreaterThanOrEqual(30);
  const fns = fnCensus(qpdfNorm(file, "a"));

  expect(fns.length, "the fn4 body count").toBe(5);

  // the object-number census at T=1700: the trio + the pair
  expect(fns.map((f) => f.objNum), "the object numbers").toEqual([8, 14, 46, 148, 168]);

  // the length census: 332 (alpha ramp) + 233 (black fade) + 12 ({1 exch sub}) + 349 (h1) + 452 (span)
  expect(fns.map((f) => f.program.length), "the body lengths").toEqual([332, 233, 12, 349, 452]);

  // the Domain/Range contracts at the exact print values
  const byObj = Object.fromEntries(fns.map((f) => [f.objNum, f]));
  expect(byObj[8].domain, "obj:8 Domain").toBe("0,0.99958074,-0.00020122528,1.41363525");
  expect(byObj[8].range, "obj:8 Range").toBe("0,1,0,1,0,1");
  expect(byObj[14].domain, "obj:14 Domain").toBe("-7.7824998,0.99875003,-6.2083335,0");
  expect(byObj[14].range, "obj:14 Range").toBe("0,1,0,1,0,1");
  expect(byObj[46].domain, "obj:46 Domain").toBe("0,1");
  expect(byObj[46].range, "obj:46 Range").toBe("0,1");
  expect(byObj[148].domain, "obj:148 Domain").toBe("1.1920929e-7,1,-0.49999994,0.49999994");
  expect(byObj[148].range, "obj:148 Range").toBe("0,1,0,1,0,1");
  expect(byObj[168].domain, "obj:168 Domain").toBe("-0.29659319,1.29592526,-0.19270563,2.0597994");
  expect(byObj[168].range, "obj:168 Range").toBe("0,1,0,1,0,1");

  // the operator census: every body's ps-operator multiset (the ramp's
  // roll x5 + the {1 exch sub}'s minimal exch+sub pair)
  const ops46 = opCensus(byObj[46].program);
  expect(ops46, "obj:46 the minimal operator set").toEqual({ exch: 1, sub: 1 });
  const ops8 = opCensus(byObj[8].program);
  expect(ops8.roll, "obj:8 the div-normalization tail's 5 rolls").toBe(5);
  expect(ops8.ifelse, "obj:8 the two ifelse guards").toBe(2);
  const ops14 = opCensus(byObj[14].program);
  expect(ops14.roll, "obj:14 the tail's 5 rolls").toBe(5);
  expect(ops14.mul ?? 0, "obj:14 the black fade's null middle (zero muls)").toBe(0);
});

// ---------- D227b: the full-byte T-invariance + the numbering laws ----------

test("D227b every fn4 body byte-identical across frames; the trio HELD at 8/14/46; the pair shifted by exactly -1; zero name tokens in the bodies", async ({ page }) => {
  test.setTimeout(240_000);
  const a = await pinnedPrint(page, 1700, "b1");
  const b = await pinnedPrint(page, 1000, "b2");
  const A = fnCensus(qpdfNorm(a.file, "b1"));
  const B = fnCensus(qpdfNorm(b.file, "b2"));

  expect(A.length, "5 bodies @T=1700").toBe(5);
  expect(B.length, "5 bodies @T=1000").toBe(5);

  // THE FULL-BYTE T-INVARIANCE: every body byte-identical across frames
  // (paired by Domain — the structural identity; the bodies carry no name
  // tokens at all, so no renumbering normalization is needed at this layer)
  for (const fa of A) {
    const fb = B.find((f) => f.domain === fa.domain && f.range === fa.range);
    expect(fb, `obj:${fa.objNum}'s frame pair (Domain [${fa.domain}])`).toBeTruthy();
    expect(fb!.program, `obj:${fa.objNum} byte-identical across frames`).toBe(fa.program);
  }
  // zero /Name references inside any body (the no-renumbering law)
  for (const f of [...A, ...B]) {
    expect(/\/(P|X|G|F)\d+\b/.test(f.program), `obj:${f.objNum} carries no name tokens`).toBe(false);
  }

  // THE NUMBERING LAWS: the trio HELD at both frames
  expect(B.filter((f) => [8, 14, 46].includes(f.objNum)).length, "the trio held @T=1000").toBe(3);
  // the pair shifted by EXACTLY -1 (148->147, 168->167)
  const h1a = A.find((f) => f.objNum === 148);
  const h1b = B.find((f) => f.objNum === 147);
  expect(h1a, "the h1 fn @T=1700 (obj:148)").toBeTruthy();
  expect(h1b, "the h1 fn @T=1000 (obj:147, shifted -1)").toBeTruthy();
  expect(h1b!.program, "the h1 fn byte-identical across the shift").toBe(h1a!.program);
  const spanA = A.find((f) => f.objNum === 168);
  const spanB = B.find((f) => f.objNum === 167);
  expect(spanA, "the span fn @T=1700 (obj:168)").toBeTruthy();
  expect(spanB, "the span fn @T=1000 (obj:167, shifted -1)").toBeTruthy();
  expect(spanB!.program, "the span fn byte-identical across the shift").toBe(spanA!.program);
});

// ---------- D227c: the trio's exact bodies (the cross-side-shared programs) ----------

test("D227c the shared trio's exact bodies — obj:46 {1 exch sub}; obj:8 the two-branch alpha ramp; obj:14 the black fade; the shared div-normalization tail", async ({ page }) => {
  test.setTimeout(180_000);
  const { file } = await pinnedPrint(page, 1700, "c1");
  const fns = fnCensus(qpdfNorm(file, "c1"));
  const byObj = Object.fromEntries(fns.map((f) => [f.objNum, f]));

  // obj:46 — the S64 /TR inversion family, the exact 12-byte body
  expect(byObj[46].program, "obj:46 the exact body").toBe("{1 exch sub}");

  // obj:8 — the two-branch alpha ramp: the exact head + both stop branches
  expect(byObj[8].program.startsWith("{pop\ndup 0 le {pop 0 0 0 .8 0} if"), "obj:8 the exact head").toBe(true);
  expect(byObj[8].program, "obj:8 the first stop branch").toContain("0 sub 0 exch 0 exch 0 exch -.60000002 mul .8 add");
  expect(byObj[8].program, "obj:8 the second stop branch").toContain(".5 sub 0 exch 0 exch 0 exch -.39999998 mul .5 add");
  expect(byObj[8].program, "obj:8 the above-1 clamp").toContain("0 gt {0 0 0 .3} if");

  // obj:14 — the black fade: the null middle (the constant-black ramp)
  expect(byObj[14].program.startsWith("{pop\ndup 0 le {pop 0 0 0 0 0} if"), "obj:14 the exact head").toBe(true);
  expect(byObj[14].program, "obj:14 the null middle").toContain("0 sub 0 exch 0 exch 0 exch \n0");
  expect(byObj[14].program, "obj:14 the above-1 clamp").toContain("0 gt {0 0 0 1} if");

  // THE SHARED TAIL: the div-normalization program (identical in all
  // three bodies — the family's shared emission)
  const TAIL = "dup abs 0.00001 lt{ pop pop pop pop 0 0 0 }{ dup 3 1 roll div 4 1 roll dup 3 1 roll div 4 1 roll div 3 1 roll} ifelse";
  for (const n of [8, 14]) {
    expect(byObj[n].program.endsWith(TAIL + "\n}"), `obj:${n} the shared div-normalization tail`).toBe(true);
  }
});

// ---------- D227d: the animated pair + the epsilon carriers ----------

test("D227d the animated pair — obj:148 the h1 sheen (len 349) + obj:168 the span sheen (len 452): the epsilon carriers at the exact print values, both frames byte-stable", async ({ page }) => {
  test.setTimeout(240_000);
  const a = await pinnedPrint(page, 1700, "d1");
  const b = await pinnedPrint(page, 1000, "d2");
  const A = fnCensus(qpdfNorm(a.file, "d1"));
  const B = fnCensus(qpdfNorm(b.file, "d2"));

  const h1 = A.find((f) => f.objNum === 148);
  const span = A.find((f) => f.objNum === 168);
  expect(h1, "the h1 sheen fn @T=1700 (obj:148)").toBeTruthy();
  expect(span, "the span sheen fn @T=1700 (obj:168)").toBeTruthy();
  expect(h1!.program.length, "the h1 body length").toBe(349);
  expect(span!.program.length, "the span body length").toBe(452);

  // THE H1'S EPSILON CARRIERS (the D222 family at the body layer): the
  // four float-precision stops where the live prints the rounded mirrors
  expect(h1!.program, "the h1 first stop").toContain("dup -.083333373 mul .1667 add");
  expect(h1!.program, "the h1 second stop (the epsilon carrier the live prints 0 for)").toContain("dup .00000063773246 mul 0 add");
  expect(h1!.program, "the h1 third stop").toContain("dup -.099999867 mul .2 add");
  expect(h1!.program, "the h1 fourth stop").toContain("-.100000001 mul .2 add");
  expect(h1!.program, "the h1 below-0 clamp").toContain("dup 0 le {pop .1667 0 .2 .2 0} if");
  expect(h1!.program, "the h1 above-1 clamp").toContain("0 gt {.0833 0 .1 .1} if");

  // THE SPAN'S EPSILON CARRIERS: the mirrored stop pairs (both branches)
  expect(span!.program, "the span first-half stop 1").toContain("dup .50000024 mul exch");
  expect(span!.program, "the span first-half stop 2 (the 2.4e-7-scale epsilon)").toContain("dup -.0000038263947 mul exch");
  expect(span!.program, "the span first-half stop 3").toContain("dup .59999925 mul exch .60000002 mul");
  expect(span!.program, "the span second-half stop 1").toContain("dup -.50000024 mul .25 add");
  expect(span!.program, "the span second-half stop 2").toContain("dup .0000038263947 mul 0 add");
  expect(span!.program, "the span second-half stop 3").toContain("dup -.59999925 mul .3 add exch -.60000002 mul .3 add");

  // THE T-INVARIANCE (the S65 law at the body layer): both bodies
  // byte-identical across the frames — the animation phase lives in the
  // alpha layer, NOT in the stop values
  const h1b = B.find((f) => f.objNum === 147);
  const spanB = B.find((f) => f.objNum === 167);
  expect(h1b!.program, "the h1 body frame-stable").toBe(h1!.program);
  expect(spanB!.program, "the span body frame-stable").toBe(span!.program);
});
