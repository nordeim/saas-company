import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 52 — THE TWENTY-SEVENTH SURFACE (the PDF STRUCTURAL layer,
 * D181) + the 26th surface's ROUTE EXTENSIONS (the /login alternates'
 * POST-BUILD vector censuses — the S51 badge build's convergence
 * verified at the operator layer, D182) + the 404-route DOM datum.
 *
 * THE MEASUREMENTS (research/recon-s52.mjs + the rootcause + stability
 * probes, paired clone-vs-live through the SAME local Chromium):
 *
 * THE STRUCTURAL LAYER (D181) — FULL PARITY ON ITS FIRST HONEST
 * MEASUREMENT. The instrument: `qpdf --json --json-stream-data=inline`
 * read at the STRUCTURAL layer (the D180 law's binary, now at the
 * catalog granularity — the D183 shape law: the objects live under
 * qpdf[1]["obj:N 0 R"], plain objects wrapped in .value, streams in
 * .stream.{data,dict}; the catalog located BY ITS /Type, never by a
 * guessed traversal — the lesson-88 fifth sighting: a guessed
 * traversal returns empty-equals-empty false parity).
 *
 * THE MEASURED RECORDS (clone-side registrations; the paired live
 * comparisons live in the drift battery):
 *   catalog keys  {/Dests,/Pages,/Type,/ViewerPreferences} on the
 *                anchor-bearing routes (landing, /faq, /privacy,
 *                /terms, /refund-policy, /accessibility — the /Dests
 *                presence tracking the D169 named-destination record);
 *                {/Pages,/Type,/ViewerPreferences} on the anchor-free
 *                routes (/login, /thank-you) and the dashboard; the
 *                CLONE's /demo carries /Dests (its 14 links — the
 *                superset at the catalog-key layer too; the live's
 *                73-object SPA shell carries none).
 *   THE EMPTY-SET CONTRACT: /MarkInfo, /StructTreeRoot, /Outlines and
 *                /Lang ALL ABSENT on both sides, every route —
 *                Chromium's print pipeline emits neither tagged-PDF
 *                structure trees nor bookmarks (the D170 empty-set
 *                pattern at the structural layer).
 *   /ViewerPreferences  {/DisplayDocTitle: true, /Type:
 *                /ViewerPreferences} identical across sides, every
 *                route.
 *   object counts (deterministic 2x per route): /login 51, /faq 241,
 *                /privacy 234, /terms 242, /refund-policy 239,
 *                /accessibility 315, /thank-you 101, the landing 523
 *                (clone-side deterministic; the live's 530 its own
 *                animated frame state — the S38 range law at the
 *                object-allocation layer); the dashboard 292.
 *   /demo        the REGISTERED SUPERSET at the structural layer: the
 *                clone's 260 objects vs the live's 73 (the working
 *                page vs the 16-word SPA shell).
 *
 * THE ALTERNATES' POST-BUILD CONVERGENCE (D182): the S51 badge build
 * verified holding — the reset state's state-tracked raster 1765x1609,
 * words 31, fonts, page families and color-VALUE sets all at parity;
 * the card form's 30-op text-family delta ROOT-CAUSED AT THE GLYPH
 * LEVEL: both sides carry EXACTLY 6 BT blocks with blocks 1-5
 * byte-identical; the single delta is block 0 — the same 16 glyphs in
 * the same order ("Check your email") where the clone emits 16
 * single-glyph Tj ops + 15 Td repositions and the live emits ONE
 * combined Tj + 0 Td (15 + 15 = exactly the 30-op delta — the
 * registered D177 text-run segmentation family at glyph granularity;
 * registration, never a build). The card form's text-family count is
 * INTERPOLATION-DEPENDENT (the reset view paints the typed email: the
 * 21-char recon measurement reads 76/136, the spec's 18-char pin
 * input reads 74/134 — the run-segmentation family; every pin binds
 * the spec's own input). The error state: the 7-form census with the
 * card form's text 134 (the registered segmentation-delta family vs
 * the live's 139).
 *
 * THE 404-ROUTE DOM DATUM: a nonexistent route renders 16 DOM words
 * with the h1 "404" / h2 "Page Not Found" / Go Home contract on BOTH
 * sides (the live's SPA-404 mirrored — the DOM layer behind the
 * standing D168 print-text record).
 */

const pdfFile = (name: string) => join(tmpdir(), `s52-pin-${name}.pdf`);

const dwell = async (page: import("@playwright/test").Page, route: string) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
};

const renderPdf = async (page: import("@playwright/test").Page, name: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(name);
  writeFileSync(file, buf);
  return file;
};

// ---------- THE D181 INSTRUMENT: the structural census (qpdf --json) ----------
type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};

const qpdfJson = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(readFileSync(jsonFile, "utf8")) as {
    qpdf: [unknown, Record<string, QpdfObj>];
    outlines?: unknown[];
    acroform?: { hasacroform?: boolean; fields?: unknown[] };
    encrypt?: { capabilities?: unknown };
    pagelabels?: unknown[];
  };
};

/**
 * The structural census (the D183 shape law): the catalog located BY ITS
 * /Type under qpdf[1] (plain objects in .value) — a traversal that has
 * not been shown a non-empty input is not trusted (the lesson-88 law).
 */
const structuralCensus = (file: string) => {
  const j = qpdfJson(file);
  const objs = j.qpdf[1];
  const objCount = Object.keys(objs).length;
  let catalog: Record<string, unknown> | null = null;
  for (const o of Object.values(objs)) {
    const d = o.value ?? o.stream?.dict;
    if ((d as { "/Type"?: string } | undefined)?.["/Type"] === "/Catalog") {
      catalog = d as Record<string, unknown>;
      break;
    }
  }
  if (!catalog) throw new Error(`no /Catalog found in ${file} — the instrument lost the catalog (the D183 law)`);
  return {
    objCount,
    catalogKeys: Object.keys(catalog).sort(),
    markInfo: catalog["/MarkInfo"] ?? null,
    structTree: catalog["/StructTreeRoot"] ?? null,
    outlinesKey: catalog["/Outlines"] ?? null,
    lang: catalog["/Lang"] ?? null,
    viewerPrefs: catalog["/ViewerPreferences"] ?? null,
    topLevel: {
      outlines: j.outlines ?? null,
      hasAcroForm: j.acroform?.hasacroform ?? null,
      encryptCaps: !!j.encrypt?.capabilities,
      pagelabels: j.pagelabels ?? null,
    },
  };
};

// ---------- THE D177 instrument (the S51 vector census, unchanged) ----------
const FAMILIES: Record<string, string[]> = {
  path: ["m", "l", "c", "v", "y", "re", "h"],
  paint: ["S", "s", "f", "F", "f*", "B", "B*", "b", "b*", "n"],
  clip: ["W", "W*"],
  gs: ["q", "Q", "gs"],
  xform: ["cm"],
  xobj: ["Do"],
  color: ["rg", "RG", "g", "G", "k", "K", "sc", "scn", "SC", "SCN", "cs", "CS"],
  text: ["BT", "ET", "Tf", "Td", "TD", "Tm", "T*", "Tj", "TJ", "Ts", "Tz", "Tw", "Tc"],
};
const OP_TO_FAMILY: Record<string, string> = {};
for (const [fam, ops] of Object.entries(FAMILIES)) for (const op of ops) OP_TO_FAMILY[op] = fam;

const familyCensus = (stream: string) => {
  const fams: Record<string, number> = {};
  for (const tok of stream.split(/[\s\n\r\t]+/)) {
    if (tok === "") continue;
    if (/^[\/(\[<>)\]]/.test(tok)) continue;
    const fam = OP_TO_FAMILY[tok];
    if (fam) fams[fam] = (fams[fam] ?? 0) + 1;
  }
  return fams;
};

const vectorCensus = (file: string) => {
  const j = qpdfJson(file);
  const objs = j.qpdf[1];
  const forms: { bbox: string; families: Record<string, number> }[] = [];
  for (const obj of Object.values(objs)) {
    if (!obj.stream?.data) continue;
    const dict = obj.stream.dict as { "/Subtype"?: string; "/BBox"?: unknown } | undefined;
    if (dict?.["/Subtype"] !== "/Form") continue;
    const data = Buffer.from(obj.stream.data, "base64").toString("latin1");
    forms.push({ bbox: JSON.stringify(dict["/BBox"] ?? null), families: familyCensus(data) });
  }
  forms.sort((a, b) => a.bbox.localeCompare(b.bbox) || JSON.stringify(a.families).localeCompare(JSON.stringify(b.families)));
  return { forms };
};

/**
 * The glyph-run block census (the D182 adjudication instrument): the
 * card form's BT..ET regions with per-block Tf/Td/Tj op counts + the
 * shown-glyph counts (the Tj strings' CID glyphs).
 */
const textBlocks = (file: string, bbox: string) => {
  const j = qpdfJson(file);
  const objs = j.qpdf[1];
  let card: QpdfObj | undefined;
  for (const o of Object.values(objs)) {
    if (!o.stream?.data) continue;
    const dict = o.stream.dict as { "/Subtype"?: string; "/BBox"?: unknown } | undefined;
    if (dict?.["/Subtype"] === "/Form" && JSON.stringify(dict["/BBox"]) === bbox) card = o;
  }
  if (!card?.stream?.data) throw new Error(`no form at BBox ${bbox} in ${file}`);
  const data = Buffer.from(card.stream.data, "base64").toString("latin1");
  const blocks: { tf: number; td: number; tj: number; glyphs: number }[] = [];
  const btRe = /BT([\s\S]*?)ET/g;
  let m;
  while ((m = btRe.exec(data)) !== null) {
    const body = m[1];
    let glyphs = 0;
    const hexRe = /<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ|'|")/g;
    let mm;
    while ((mm = hexRe.exec(body)) !== null) glyphs += mm[1].replace(/\s/g, "").length / 4;
    const litRe = /\(((?:\\.|[^\\()])*)\)\s*(?:Tj|TJ|'|")/g;
    while ((mm = litRe.exec(body)) !== null) glyphs += mm[1].length;
    blocks.push({
      tf: (body.match(/\bTf\b/g) || []).length,
      td: (body.match(/\bTd\b/g) || []).length,
      tj: (body.match(/\bTj\b/g) || []).length,
      glyphs: Math.round(glyphs),
    });
  }
  return blocks;
};

// ---------- the /login state drivers (the S50/S51 pattern) ----------
const enterError = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.fill("#email", "s52-pin@test.local");
  await page.fill("#password", "wrong-password");
  await page.click("button[type=submit]");
  await page.waitForSelector('[role="alert"]');
  await page.waitForTimeout(400);
};

const enterReset = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Forgot password\?/ }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  await page.fill("#email", "s52-pin@test.local");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await page.getByRole("heading", { name: "Check your email" }).waitFor();
  await page.waitForTimeout(400);
};

// =====================================================================
// THE TWENTY-SEVENTH SURFACE — the PDF structural layer (D181)
// =====================================================================
test.describe("the PDF structural layer (Session 52 — D181, the twenty-seventh surface)", () => {
  const ANCHOR_ROUTES = ["/faq", "/privacy", "/terms", "/refund-policy", "/accessibility"];
  const ANCHOR_FREE = ["/login", "/thank-you"];

  test("the catalog key sets: the anchor-bearing vs anchor-free families (the /Dests presence tracking the D169 link record)", async ({ page }) => {
    for (const route of ANCHOR_ROUTES) {
      await dwell(page, route);
      const s = structuralCensus(await renderPdf(page, `cat-anchor-${route.replace(/\//g, "")}`));
      expect(s.catalogKeys, route).toEqual(["/Dests", "/Pages", "/Type", "/ViewerPreferences"]);
    }
    for (const route of ANCHOR_FREE) {
      await dwell(page, route);
      const s = structuralCensus(await renderPdf(page, `cat-free-${route.replace(/\//g, "")}`));
      expect(s.catalogKeys, route).toEqual(["/Pages", "/Type", "/ViewerPreferences"]);
    }
    // the landing carries /Dests (the 87-anchor + 48-named-destination record)
    await dwell(page, "/");
    await page.waitForTimeout(1600); // the animated entrance settle
    const landing = structuralCensus(await renderPdf(page, "cat-landing"));
    expect(landing.catalogKeys).toEqual(["/Dests", "/Pages", "/Type", "/ViewerPreferences"]);
  });

  test("the tagged/outline EMPTY-SET CONTRACT: /MarkInfo, /StructTreeRoot, /Outlines and /Lang all absent on every public route (the D170 pattern at the structural layer)", async ({ page }) => {
    for (const route of ["/", "/login", "/faq", "/privacy", "/terms", "/refund-policy", "/accessibility", "/thank-you", "/demo"]) {
      await dwell(page, route);
      await page.waitForTimeout(route === "/" ? 1600 : 400);
      const s = structuralCensus(await renderPdf(page, `empty-${route.replace(/\//g, "") || "root"}`));
      expect(s.markInfo, `${route} /MarkInfo`).toBeNull();
      expect(s.structTree, `${route} /StructTreeRoot`).toBeNull();
      expect(s.outlinesKey, `${route} /Outlines`).toBeNull();
      expect(s.lang, `${route} /Lang`).toBeNull();
    }
  });

  test("the /ViewerPreferences contract + the top-level structural views (outlines [], acroform empty, encrypt capabilities, pagelabels [])", async ({ page }) => {
    await dwell(page, "/faq");
    const s = structuralCensus(await renderPdf(page, "vp-faq"));
    expect(s.viewerPrefs).toEqual({ "/DisplayDocTitle": true, "/Type": "/ViewerPreferences" });
    expect(s.topLevel.outlines).toEqual([]);
    expect(s.topLevel.hasAcroForm).toBe(false);
    expect(s.topLevel.encryptCaps).toBe(true);
    expect(s.topLevel.pagelabels).toEqual([]);
  });

  test("the object-count registrations (deterministic per route — the 2x-verified records)", async ({ page }) => {
    const EXPECT: [string, number][] = [
      ["/login", 51],
      ["/faq", 241],
      ["/privacy", 234],
      ["/terms", 242],
      ["/refund-policy", 239],
      ["/accessibility", 315],
      ["/thank-you", 101],
    ];
    for (const [route, count] of EXPECT) {
      await dwell(page, route);
      const s = structuralCensus(await renderPdf(page, `obj-${route.replace(/\//g, "")}`));
      expect(s.objCount, `${route} object count`).toBe(count);
    }
    // the landing: the ANIMATED-FORM bucket (the S38 range law at the
    // object-allocation layer — the entrance/glow animations allocate
    // different object counts per frame state: 523 AND 525 measured
    // clone-side across runs, the live's own 530; bucketed like the S50
    // entrance-frame raster and the S51 glow jitter — the stable routes
    // above carry the exact pins)
    await dwell(page, "/");
    await page.waitForTimeout(1600);
    const landingObjs = structuralCensus(await renderPdf(page, "obj-landing")).objCount;
    expect(landingObjs).toBeGreaterThanOrEqual(515);
    expect(landingObjs).toBeLessThanOrEqual(535);
  });

  test("the /demo structural SUPERSET floor (the working page vs the live's 73-object SPA shell — the superset at the CATALOG-KEY layer too: the clone's 14 links carry /Dests, the live's shell does not)", async ({ page }) => {
    await dwell(page, "/demo");
    const s = structuralCensus(await renderPdf(page, "obj-demo"));
    expect(s.objCount).toBeGreaterThanOrEqual(250);
    expect(s.catalogKeys).toEqual(["/Dests", "/Pages", "/Type", "/ViewerPreferences"]);
  });

  test("the dashboard's authenticated structural contract (the D179 registration at the structural layer)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    const s = structuralCensus(await renderPdf(page, "obj-dash"));
    expect(s.catalogKeys).toEqual(["/Pages", "/Type", "/ViewerPreferences"]);
    expect(s.markInfo).toBeNull();
    expect(s.structTree).toBeNull();
    expect(s.outlinesKey).toBeNull();
    expect(s.objCount).toBe(292);
  });
});

// =====================================================================
// THE 26TH SURFACE'S ROUTE EXTENSIONS — the alternates' post-build
// convergence at the operator layer (D182)
// =====================================================================
test.describe("the /login alternates' post-build convergence (Session 52 — D182)", () => {
  test("the reset state's card-form 6-block census: the per-glyph block-0 decomposition + the byte-identical tail blocks (the D177 family at glyph granularity)", async ({ page }) => {
    await enterReset(page);
    const file = await renderPdf(page, "reset-blocks");
    // the card form's family census — the S51 convergence holding
    const v = vectorCensus(file);
    expect(v.forms.length).toBe(2);
    expect(v.forms[0].bbox).toBe("[0,0,1798,1639]");
    expect(v.forms[0].families).toEqual({ gs: 36, path: 354, clip: 8, paint: 18, color: 25, xform: 6, text: 74 });
    expect(v.forms[1].bbox).toBe("[18,15,1783,1624]");
    expect(v.forms[1].families).toEqual({ gs: 3, xform: 1, color: 2, xobj: 1 });
    // THE GLYPH-RUN BLOCK CENSUS: 6 BT blocks; block 0 the per-glyph
    // decomposition (16 single-glyph Tj + 15 Td repositions — the clone's
    // emission of "Check your email"), blocks 1-5 the live-identical runs.
    // The census is INTERPOLATION-DEPENDENT (the email's length changes the
    // run segmentation — the D177 family; the pin binds the spec's own
    // s52-pin@test.local input, measured deterministic 3x).
    const blocks = textBlocks(file, "[0,0,1798,1639]");
    expect(blocks.length).toBe(6);
    expect(blocks[0]).toEqual({ tf: 1, td: 15, tj: 16, glyphs: 16 });
    expect([blocks[1], blocks[2], blocks[3], blocks[4], blocks[5]]).toEqual([
      { tf: 1, td: 3, tj: 4, glyphs: 41 },
      { tf: 1, td: 0, tj: 1, glyphs: 18 },
      { tf: 1, td: 0, tj: 1, glyphs: 15 },
      { tf: 1, td: 2, tj: 3, glyphs: 46 },
      { tf: 1, td: 2, tj: 3, glyphs: 42 },
    ]);
  });

  test("the error state's card-form census: text 134 + the 7-form family (the registered segmentation-delta family vs the live's 139)", async ({ page }) => {
    await enterError(page);
    const file = await renderPdf(page, "error-vec");
    const v = vectorCensus(file);
    expect(v.forms.length).toBe(7);
    const card = v.forms.find((f) => f.bbox === "[0,0,1798,2957]");
    expect(card?.families).toEqual({ gs: 97, path: 1128, clip: 28, paint: 54, color: 71, xform: 16, text: 134, xobj: 2 });
  });
});

// =====================================================================
// THE 404-ROUTE DOM DATUM (the new standing record)
// =====================================================================
test.describe("the 404-route DOM datum (Session 52 — the D168 record at the DOM layer)", () => {
  test("a nonexistent route renders the 16-word 404 shell (the h1 404 / h2 Page Not Found / Go Home contract)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/s52-nonexistent-route-probe", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const words = await page.evaluate(() => document.body.innerText.trim().split(/\s+/).filter(Boolean).length);
    expect(words).toBe(16);
    await expect(page.getByRole("heading", { level: 1, name: "404" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Page Not Found" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go Home" })).toBeVisible();
  });
});
