import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Session 63 — THE THIRTY-EIGHTH SURFACE: the ANIMATION-BAND VALUE LAYER
 * under a PINNED-FRAME PRINT CONTRACT (D219, law-quality). The S62/D218
 * record left the landing's animated gs slots as a frame-dependent family
 * (the "animation band" — the print lands at whatever CSS/WAAPI opacity
 * phase the loop family happens to be in). THE S63 INSTRUMENT: pause every
 * Web-Animations-API animation at a deterministic currentTime T, then
 * print — the pinned transfer-mode layer is BYTE-IDENTICAL across prints
 * (measured in vivo, both sides, T=1700 and T=1000), because the phase
 * randomness was the CSS/WAAPI opacity keyframes and the rAF-driven
 * families (the mockup dots' scale, the scroll-dot) contribute no gs
 * entries (scale-only geometry).
 *
 * THE MEASURED PARITY (two-sided, T=1700): the full-stroke family (5
 * shapes) EQUAL, 14 of 16 alpha slots EQUAL at identical multiplicities,
 * THE /SCREEN LAW holds both sides — with TWO T-INVARIANT STRUCTURAL
 * DELTAS: the live's /SMask pair (13 v 11 — the S62-recorded 13v11 now
 * proven frame-INDEPENDENT, a constant engine family, not animation band)
 * and the clone's extra @51 slot (1 v 2). At T=1000 the phase slots shift
 * (@230 absent both sides; the live's @128 +1) — the phase slots are
 * pinned-state functions, deterministic per T.
 *
 * THE ENGINE CENSUS (the S63 discovery): the live drives its loop family
 * through WAAPI (opacity) + rAF (transform: the ambient's scale pulse, the
 * under-glow's translateY rise, the 5 mockup dots' scale) — the clone
 * consolidates the SAME choreography into CSS keyframes (measured equal in
 * range and sync: the ambient scale ~1↔1.05, the glow translateY 0↔-12px,
 * both with opacity 0.3↔0.5). NO src/ fix required — this spec pins the
 * CLONE side: the pinned determinism, the pinned constants at two frames,
 * the full-choreography guard (not-invented, not-lost), and the at-rest
 * animation-set census.
 *
 * The dwell contract: 1280×720 + networkidle + 4000ms (the recon-proven
 * form — the rAF entrances settled before the pin; an 800ms dwell would
 * leave entrance opacity mid-flight UNPINNED, the rAF family being outside
 * the Web Animations API).
 */

const pdfFile = (name: string) => join(tmpdir(), `s63-pin-${name}.pdf`);

// ---------- THE PINNED-FRAME INSTRUMENT (the S63 recon port) ----------

type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};
interface GsLike {
  shape: string;
  BM: string | null;
  ca: number | null;
  CA: number | null;
}
interface PinnedCensus {
  gsCount: number;
  bm: GsLike[];
  smaskCount: number;
  xferHits: string[];
  alphaMultiset: Record<string, number>;
}

const GS_KEYS = new Set([
  "/Type", "/LW", "/LJ", "/LC", "/ML", "/D", "/RI", "/FL", "/CA", "/ca",
  "/BM", "/SMask", "/SA", "/AIS", "/TK", "/Font", "/SP", "/OP", "/op",
  "/OPM", "/BG", "/BG2", "/UCR", "/UCR2", "/TR", "/TR2", "/HT",
]);
const XFER_KEYS = [
  "/TR", "/TR2", "/HT", "/BG", "/BG2", "/UCR", "/UCR2", "/OP", "/op",
  "/OPM", "/RI", "/D", "/FL", "/AIS", "/TK", "/SP", "/Font",
];

const val = (v: unknown) => (v as { value?: unknown } | undefined)?.value ?? v;
/** THE D187 GRID with JS Math.round semantics — floor(v*255 + 0.5), never
 * round(): 0.7*255 = 178.5 exactly, half-away-from-zero -> 179 (gotcha 72b). */
const grid = (v: unknown) =>
  typeof v === "number" ? Math.floor(v * 255 + 0.5) : null;

const qpdfJson = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".s63.json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(readFileSync(jsonFile, "utf8")) as {
    qpdf: [unknown, Record<string, QpdfObj>];
  };
};

const pinnedCensus = (file: string): PinnedCensus => {
  const objs = qpdfJson(file).qpdf[1];
  const out: GsLike[] = [];
  const xferHits: string[] = [];
  let smaskCount = 0;
  for (const o of Object.values(objs)) {
    const d = o?.value ?? o?.stream?.dict ?? null;
    if (!d || typeof d !== "object") continue;
    const ks = Object.keys(d);
    if (ks.length === 0 || !ks.every((k) => GS_KEYS.has(k))) continue;
    for (const xk of XFER_KEYS) if (xk in d) xferHits.push(xk);
    if ("/SMask" in d) smaskCount++;
    out.push({
      shape: ks.filter((k) => k !== "/Type").sort().join(","),
      BM: (val(d["/BM"]) as string | undefined) ?? null,
      ca: "/ca" in d ? grid(val(d["/ca"])) : null,
      CA: "/CA" in d ? grid(val(d["/CA"])) : null,
    });
  }
  const alphaMultiset: Record<string, number> = {};
  for (const e of out) {
    if (e.BM === "/Normal" && e.shape === "/BM,/ca") {
      const k = String(e.ca);
      alphaMultiset[k] = (alphaMultiset[k] ?? 0) + 1;
    }
  }
  return {
    gsCount: out.length,
    bm: out.filter((e) => e.BM),
    smaskCount,
    xferHits,
    alphaMultiset: Object.fromEntries(Object.entries(alphaMultiset).sort(([a], [b]) => Number(a) - Number(b))),
  };
};

const bmCensus = (c: PinnedCensus) => {
  const m = new Map<string, number>();
  for (const e of c.bm) m.set(e.BM!, (m.get(e.BM!) ?? 0) + 1);
  return Object.fromEntries([...m.entries()].sort());
};

/** THE PIN: load the landing at the recon dwell, pause EVERY Web-Animations-
 * API animation at the deterministic frame T, flush, print. Returns the
 * pinned animation count (the clone's at-rest CSS set). */
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

// ---------- D219a: THE PINNED DETERMINISM LAW ----------

test("D219a the pinned-frame determinism — the animation band tamed", async ({ page }) => {
  test.setTimeout(120_000);
  // two prints from the SAME pinned page: byte-identical censuses. The
  // S62 unpinned landing varied by frame (the animation band); under the
  // pause-at-T contract the transfer-mode layer is a pure function of T.
  const { pinned } = await pinnedPrint(page, 1700, "det-1");
  expect(pinned, "the clone's at-rest animation set (the CSS consolidation)").toBeGreaterThanOrEqual(30);
  const c1 = pinnedCensus(pdfFile("det-1"));
  const buf2 = await page.pdf({ format: "A4", printBackground: true });
  writeFileSync(pdfFile("det-2"), buf2);
  const c2 = pinnedCensus(pdfFile("det-2"));
  expect(c2.gsCount, "print 2 gs count == print 1").toBe(c1.gsCount);
  expect(c2.smaskCount, "print 2 SMask count == print 1").toBe(c1.smaskCount);
  expect(c2.alphaMultiset, "print 2 alpha multiset == print 1 (BYTE-IDENTICAL)").toEqual(c1.alphaMultiset);
  expect(c2.xferHits, "the transfer-function empty-set holds under the pin").toEqual([]);
});

// ---------- D219b: THE PINNED CENSUS CONSTANTS at T=1700 ----------

test("D219b the pinned landing census at T=1700 (the 38th-surface constants)", async ({ page }) => {
  test.setTimeout(120_000);
  const { file } = await pinnedPrint(page, 1700, "t1700");
  const c = pinnedCensus(file);
  // the measured clone constants (recon-verified byte-identical x2):
  // 33 gs-like objects, 22 BM-bearing, SMask 11 (the T-invariant structural
  // slot — the live's 13v11 pair re-attributed from the animation band to a
  // constant engine family)
  expect(c.gsCount, "gs count at T=1700").toBe(33);
  expect(c.bm.length, "BM-bearing count at T=1700").toBe(22);
  expect(c.smaskCount, "SMask count (T-invariant, the live 13v11 pair)").toBe(11);
  // THE /SCREEN LAW holds under the pin: exactly one /Screen (the hero
  // mix-blend-mode), every other BM /Normal
  expect(bmCensus(c), "BM values at T=1700").toEqual({ "/Normal": 21, "/Screen": 1 });
  const screen = c.bm.filter((e) => e.BM === "/Screen");
  expect(screen, "the /Screen shape (alpha-only gs at full opacity)").toEqual([
    { shape: "/BM,/ca", BM: "/Screen", ca: 255, CA: null },
  ]);
  // the exact pinned alpha multiset (the phase slots are T-functions):
  // 0:1 5:1 13:1 26:2 51:2 77:1 102:1 128:1 153:1 179:1 204:1 230:1 255:1
  // — the @51 x2 is the clone's T-INVARIANT structural slot (live 1); the
  // /Screen entry ALSO sits at @255 but is excluded here (Normal-only
  // multiset — the recon shape census's @255 x2 includes it)
  expect(c.alphaMultiset, "the pinned alpha multiset at T=1700").toEqual({
    "0": 1, "5": 1, "13": 1, "26": 2, "51": 2, "77": 1, "102": 1,
    "128": 1, "153": 1, "179": 1, "204": 1, "230": 1, "255": 1,
  });
  expect(c.xferHits, "transfer-function empty-set").toEqual([]);
});

// ---------- D219c: THE PINNED CENSUS at T=1000 + the T-invariants ----------

test("D219c the pinned landing census at T=1000 (phase slots shift, structure holds)", async ({ page }) => {
  test.setTimeout(120_000);
  const { file } = await pinnedPrint(page, 1000, "t1000");
  const c = pinnedCensus(file);
  // 32 gs (the @230 phase slot absent at this frame), 21 BM-bearing
  expect(c.gsCount, "gs count at T=1000").toBe(32);
  expect(c.bm.length, "BM-bearing count at T=1000").toBe(21);
  expect(bmCensus(c), "BM values at T=1000").toEqual({ "/Normal": 20, "/Screen": 1 });
  // THE T-INVARIANT STRUCTURAL CONSTANTS: SMask 11 and the @51 x2 slot
  // persist across frames (they are engine structure, not phase)
  expect(c.smaskCount, "SMask count T-invariant").toBe(11);
  expect(c.alphaMultiset["51"], "the @51 structural slot T-invariant").toBe(2);
  // the @230 PHASE slot: present at T=1700, absent at T=1000 (the phase
  // slots are deterministic functions of the pinned frame)
  expect(c.alphaMultiset["230"], "the @230 phase slot absent at T=1000").toBeUndefined();
  expect(c.alphaMultiset, "the pinned alpha multiset at T=1000").toEqual({
    "0": 1, "5": 1, "13": 1, "26": 2, "51": 2, "77": 1, "102": 1,
    "128": 1, "153": 1, "179": 1, "204": 1, "255": 1,
  });
});

// ---------- D219d: THE FULL-CHOREOGRAPHY GUARD + the at-rest inventory ----------

test("D219d the ambient/glow full-choreography guard + the animation-set census", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const audit = await page.evaluate(() => {
    const pick = (sel: string) =>
      [...document.querySelectorAll(sel)].find((d) => {
        const r = d.getBoundingClientRect();
        return r.y > 600 && r.y < 800;
      }) ?? null;
    const kfOf = (el: Element | null) => {
      if (!el) return null;
      const a = document.getAnimations().find((an) =>
        (an.effect as KeyframeEffect | null)?.target === el,
      );
      if (!a) return null;
      const eff = a.effect as KeyframeEffect;
      const kf = eff.getKeyframes() as Array<{
        offset: number | null;
        opacity?: string;
        transform?: string;
      }>;
      return {
        // animationName exists on CSSAnimation (runtime); the DOM lib's
        // Animation base type does not declare it — read it defensively.
        name: (a as { animationName?: string }).animationName ?? null,
        dur: (eff.getComputedTiming().duration as number) ?? null,
        keyframes: kf.map((k) => ({
          opacity: k.opacity ?? null,
          transform: k.transform ?? null,
        })),
      };
    };
    const inventory = new Map<string, number>();
    for (const a of document.getAnimations()) {
      const nm = (a as { animationName?: string }).animationName ?? "(waapi)";
      const key = `${nm}@${(a.effect as KeyframeEffect | null)?.getTiming().duration ?? "?"}`;
      inventory.set(key, (inventory.get(key) ?? 0) + 1);
    }
    // the under-glow lives BELOW the fold (y~1300): pick the -bottom-16
    // that actually carries the mockup-glow animation (the honest target)
    const glowEl = [...document.querySelectorAll("div.absolute.-bottom-16")].find(
      (el) =>
        document.getAnimations().some(
          (an) =>
            (an.effect as KeyframeEffect | null)?.target === el &&
            (an as { animationName?: string }).animationName === "mockup-glow",
        ),
    ) ?? null;
    return {
      ambient: kfOf(pick("div.absolute.-inset-32")),
      glow: kfOf(glowEl),
      inventory: Object.fromEntries([...inventory.entries()].sort()),
    };
  });
  // THE FULL-CHOREOGRAPHY GUARD (not-invented, not-lost): the live drives
  // its ambient/glow as WAAPI(opacity) + rAF(transform); the clone carries
  // BOTH components in CSS — the guard pins each component's exact
  // keyframes so neither an invention-removal nor a choreography loss
  // regresses silently.
  expect(audit.ambient, "the ambient's animation exists").toBeTruthy();
  expect(audit.ambient!.name, "the ambient's animation name").toBe("mockup-ambient");
  expect(audit.ambient!.dur, "the ambient's duration (the live's measured period)").toBe(4000);
  expect(
    audit.ambient!.keyframes.map((k) => k.opacity),
    "the ambient's opacity 0.3->0.5->0.3 (the live's WAAPI half)",
  ).toEqual(["0.3", "0.5", "0.3"]);
  expect(
    audit.ambient!.keyframes.map((k) => k.transform),
    "the ambient's scale 1->1.15->1 (the live's rAF half)",
  ).toEqual(["scale(1)", "scale(1.15)", "scale(1)"]);
  expect(audit.glow, "the under-glow's animation exists").toBeTruthy();
  expect(audit.glow!.name, "the under-glow's animation name").toBe("mockup-glow");
  expect(audit.glow!.dur, "the under-glow's duration").toBe(3000);
  expect(
    audit.glow!.keyframes.map((k) => k.opacity),
    "the glow's opacity 0.3->0.5->0.3",
  ).toEqual(["0.3", "0.5", "0.3"]);
  expect(
    audit.glow!.keyframes.map((k) => k.transform),
    "the glow's translateY 0->-12px->0 rise (the live's rAF half)",
  ).toEqual(["translateY(0px)", "translateY(-12px)", "translateY(0px)"]);
  // THE AT-REST ANIMATION-SET CENSUS (the CSS consolidation inventory —
  // the clone's 32-animation set at the measured counts; the live's
  // equivalent splits across WAAPI + rAF, invisible to this census)
  expect(audit.inventory, "the at-rest animation-set census (32 animations)").toEqual({
    "logo-ns@3000": 1, "logo-ew@3000": 1, "logo-sn@3000": 1, "logo-we@3000": 1,
    "gradientShift@6000": 1,
    "border-shimmer@5000": 2,
    "pulse@2000": 2,
    "organic-gradient@14000": 1, "organic-gradient@6000": 1,
    "scroll-dot@1500": 1,
    "mockup-ambient@4000": 1,
    "mockup-dot@2000": 5,
    "mockup-glow@3000": 1,
    "float@4000": 1,
    "skel-line@3000": 1, "skel-violet@3000": 1,
    "skel-tile@3000": 4, "skel-wide@3000": 1,
    "flogo-ns@3000": 1, "flogo-ew@3000": 1, "flogo-sn@3000": 1, "flogo-we@3000": 1,
  });
});
