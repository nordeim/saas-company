import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 53 — THE TWENTY-EIGHTH SURFACE (the PDF's per-page RESOURCE
 * name-table layer, D184) + the 27th surface's ROUTE EXTENSIONS (the
 * /login alternates' structural censuses + the dashboard's
 * authenticated structural census at depth, D185).
 *
 * THE MEASUREMENTS (research/recon-s53.mjs + recon-s53b + the
 * probe-shape + ph4-debug instruments, paired clone-vs-live through
 * the SAME local Chromium — each recon phase a self-contained
 * boot-work-kill unit, the D186 reaper law):
 *
 * THE RESOURCE LAYER (D184) — FULL PARITY at BYTE-IDENTICAL NAME
 * TABLES on the stable seven. The instrument: `qpdf --json
 * --json-stream-data=inline` read at the RESOURCE granularity — every
 * /Type /Page's /Resources name tables censused per category
 * (/XObject, /Font, /ExtGState, /ColorSpace, /Pattern, /Shading,
 * /Properties), the page tree resolved from the catalog's /Pages
 * through the STRING-FORM refs ("N 0 R" — the raw shape dumped before
 * the census was trusted, the lesson-88 discipline).
 *
 * THE MEASURED RECORDS (clone-side registrations; the paired live
 * comparisons live in the drift battery):
 *   the names encode the referenced OBJECT NUMBERS (/X12 → obj 12),
 *   so the byte-identical name tables are the D181 object-count parity
 *   proven at the name-allocation layer — the two print pipelines
 *   allocate the SAME object numbers to the SAME resources.
 *   the landing: count-level parity (XObject 34/34, Font 7/7,
 *   ExtGState 11/11, per-page multisets identical) with the
 *   name-level animated family (the D181 523/530 bucket propagating
 *   to the names; the Pattern union clone 5 vs live 7 — bucketed).
 *   /demo: the REGISTERED SUPERSET (12 XObjects across 2 working
 *   pages vs the live shell's ZERO).
 *   the dashboard: the authenticated fingerprint — XObjects 13/17
 *   (union 30), Fonts 5/7 (union 7), GStates 6/9 (union 10), Patterns
 *   6 (the charts' fills).
 *
 * THE ALTERNATES' STRUCTURAL LAYER (D185) — the five /login states'
 * catalog keys + object counts IDENTICAL across sides: default 51,
 * error 52 (the banner's +1), reset 34 (the success card's smaller
 * tree), signup 38, forgot 38 — all untagged/outline-free/Lang-free.
 * The dashboard's structural census at depth: 292 objects, the SAME
 * /ViewerPreferences, the top-level views identical to the public
 * routes (the authenticated layer carrying the public contract).
 */

const pdfFile = (name: string) => join(tmpdir(), `s53-pin-${name}.pdf`);

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

// ---------- THE D184 INSTRUMENT: the resource name-table census ----------
type QpdfObj = {
  value?: Record<string, unknown>;
  stream?: { data?: string; dict?: Record<string, unknown> };
};
type ResSummary = Record<string, { perPage: number[]; union: string[] }>;

const qpdfJson = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(readFileSync(jsonFile, "utf8")) as {
    qpdf: [unknown, Record<string, QpdfObj>];
  };
};

const RES_CATEGORIES = ["/XObject", "/Font", "/ExtGState", "/ColorSpace", "/Pattern", "/Shading", "/Properties"];

/**
 * The resource census: every /Type /Page's /Resources name tables.
 * The traversal resolves the STRING-FORM refs ("N 0 R") from the
 * catalog's /Pages — a shape shown a non-empty input first (the raw
 * dump: /Resources inline, names {"/G13": "13 0 R", ...}, /ProcSet an
 * array — excluded, it is not a name table).
 */
const resourceCensus = (file: string) => {
  const j = qpdfJson(file);
  const objs = j.qpdf[1];
  const dictOf = (o: QpdfObj | undefined | null) => o?.value ?? o?.stream?.dict ?? null;
  const resolve = (ref: unknown): QpdfObj | null => {
    if (typeof ref === "string") {
      const m = ref.match(/^(\d+) (\d+) R$/);
      return m ? (objs[`obj:${m[1]} ${m[2]} R`] ?? null) : null;
    }
    return null;
  };
  let catalog: Record<string, unknown> | null = null;
  for (const o of Object.values(objs)) {
    const d = dictOf(o);
    if ((d as { "/Type"?: string } | undefined)?.["/Type"] === "/Catalog") {
      catalog = d as Record<string, unknown>;
      break;
    }
  }
  if (!catalog) throw new Error(`no /Catalog found in ${file} — the instrument lost the catalog (the D183 law)`);
  const pages: Record<string, string[]>[] = [];
  const collectPages = (ref: unknown, seen: Set<string>) => {
    const d = typeof ref === "string" ? dictOf(resolve(ref)) : (ref as Record<string, unknown> | null);
    if (!d) return;
    const t = (d as { "/Type"?: string })["/Type"];
    if (t === "/Pages") {
      for (const kid of ((d as { "/Kids"?: unknown[] })["/Kids"] ?? [])) collectPages(kid, seen);
    } else if (t === "/Page") {
      const res = ((d as Record<string, unknown>)["/Resources"] ?? null) as Record<string, unknown> | null;
      const entry: Record<string, string[]> = {};
      if (res && typeof res === "object") {
        for (const cat of RES_CATEGORIES) {
          const tbl = (res[cat] ?? null) as Record<string, unknown> | null;
          if (tbl && typeof tbl === "object" && !Array.isArray(tbl)) {
            const names = Object.keys(tbl).filter((k) => k !== "/Type").sort();
            if (names.length > 0) entry[cat] = names;
          }
        }
      }
      pages.push(entry);
    }
  };
  collectPages(catalog["/Pages"], new Set());
  if (pages.length === 0) throw new Error(`no pages resolved in ${file} — the traversal is untrusted (the lesson-88 law)`);
  const cats: ResSummary = {};
  for (const p of pages) {
    for (const [cat, names] of Object.entries(p)) {
      cats[cat] ??= { perPage: [], union: [] };
      cats[cat].perPage.push(names.length);
      cats[cat].union.push(...names.filter((n) => !cats[cat].union.includes(n)));
    }
  }
  for (const v of Object.values(cats)) {
    v.perPage.sort((a, b) => a - b);
    v.union.sort();
  }
  return { pageCount: pages.length, cats };
};

// ---------- THE D181 instrument (the structural census, S52 port) ----------
const structuralCensus = (file: string) => {
  const j = qpdfJson(file);
  const objs = j.qpdf[1];
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
    objCount: Object.keys(objs).length,
    catalogKeys: Object.keys(catalog).sort(),
    markInfo: catalog["/MarkInfo"] ?? null,
    structTree: catalog["/StructTreeRoot"] ?? null,
    outlinesKey: catalog["/Outlines"] ?? null,
    lang: catalog["/Lang"] ?? null,
    viewerPrefs: catalog["/ViewerPreferences"] ?? null,
  };
};

// ---------- the /login state drivers (the S50-S52 pattern) ----------
const PIN_EMAIL = "s53-pin@test.local"; // 18 chars — the recon's length (the interpolation law)
const enterError = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.fill("#email", PIN_EMAIL);
  await page.fill("#password", "wrong-password");
  await page.click("button[type=submit]");
  await page.waitForSelector('[role="alert"]');
  await page.waitForTimeout(400);
};
const enterReset = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Forgot password\?/ }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  await page.fill("#email", PIN_EMAIL);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await page.getByRole("heading", { name: "Check your email" }).waitFor();
  await page.waitForTimeout(400);
};
const enterSignup = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Sign up/ }).click();
  await page.waitForTimeout(500);
};
const enterForgot = async (page: import("@playwright/test").Page) => {
  await dwell(page, "/login");
  await page.getByRole("button", { name: /Forgot password\?/ }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  await page.waitForTimeout(400);
};

// =====================================================================
// THE TWENTY-EIGHTH SURFACE — the per-page resource name tables (D184)
// =====================================================================
test.describe("the PDF resource name-table layer (Session 53 — D184, the twenty-eighth surface)", () => {
  test("the stable seven at byte-identical name tables (the D181 object parity at the name-allocation layer)", async ({ page }) => {
    // the measured records — generated from research/recon-s53-state.json
    // (no eye transcription; the live comparison lives in the battery)
    const EXPECT: [string, number, ResSummary][] = [
      ["/login", 1, { "/XObject": { perPage: [1], union: ["/X35"] }, "/ExtGState": { perPage: [1], union: ["/G3"] }, "/Pattern": { perPage: [1], union: ["/P4"] } }],
      ["/faq", 2, {
        "/XObject": { perPage: [3, 9], union: ["/X12", "/X16", "/X17", "/X18", "/X19", "/X20", "/X26", "/X27", "/X29", "/X43", "/X45", "/X46"] },
        "/Font": { perPage: [3, 7], union: ["/F21", "/F22", "/F23", "/F25", "/F5", "/F7", "/F9"] },
        "/ExtGState": { perPage: [5, 6], union: ["/G10", "/G13", "/G24", "/G3", "/G4", "/G44", "/G6", "/G8"] },
      }],
      ["/privacy", 2, {
        "/XObject": { perPage: [3, 4], union: ["/X17", "/X18", "/X19", "/X28", "/X30", "/X32", "/X33"] },
        "/Font": { perPage: [3, 7], union: ["/F12", "/F14", "/F15", "/F4", "/F6", "/F8", "/F9"] },
        "/ExtGState": { perPage: [7, 7], union: ["/G10", "/G11", "/G13", "/G16", "/G20", "/G29", "/G3", "/G31", "/G5", "/G7"] },
      }],
      ["/terms", 2, {
        "/XObject": { perPage: [3, 4], union: ["/X13", "/X14", "/X15", "/X26", "/X28", "/X30", "/X31"] },
        "/Font": { perPage: [4, 5], union: ["/F11", "/F22", "/F24", "/F4", "/F6", "/F8", "/F9"] },
        "/ExtGState": { perPage: [5, 8], union: ["/G10", "/G12", "/G16", "/G21", "/G23", "/G27", "/G29", "/G3", "/G5", "/G7"] },
      }],
      ["/refund-policy", 2, {
        "/XObject": { perPage: [3, 4], union: ["/X17", "/X20", "/X21", "/X22", "/X37", "/X39", "/X40"] },
        "/Font": { perPage: [3, 7], union: ["/F12", "/F14", "/F19", "/F4", "/F6", "/F8", "/F9"] },
        "/ExtGState": { perPage: [5, 8], union: ["/G10", "/G11", "/G13", "/G15", "/G18", "/G23", "/G3", "/G38", "/G5", "/G7"] },
      }],
      ["/accessibility", 3, {
        "/XObject": { perPage: [3, 3, 4], union: ["/X13", "/X14", "/X17", "/X27", "/X29", "/X30", "/X31", "/X45", "/X47", "/X48"] },
        "/Font": { perPage: [3, 5, 6], union: ["/F11", "/F16", "/F23", "/F25", "/F4", "/F6", "/F8", "/F9"] },
        "/ExtGState": { perPage: [5, 5, 7], union: ["/G10", "/G12", "/G18", "/G24", "/G28", "/G3", "/G46", "/G5", "/G7"] },
      }],
      ["/thank-you", 1, {
        "/Font": { perPage: [4], union: ["/F10", "/F5", "/F7", "/F9"] },
        "/ExtGState": { perPage: [4], union: ["/G3", "/G4", "/G6", "/G8"] },
      }],
    ];
    for (const [route, pageCount, cats] of EXPECT) {
      await dwell(page, route);
      const c = resourceCensus(await renderPdf(page, `res-${route.replace(/\//g, "")}`));
      expect(c.pageCount, `${route} pageCount`).toBe(pageCount);
      expect(c.cats, `${route} resource name tables`).toEqual(cats);
    }
  });

  test("the landing: COUNT-level parity with the name-level animated family (the D181 523/530 bucket at the resource layer — the names drift, the counts hold)", async ({ page }) => {
    await dwell(page, "/");
    await page.waitForTimeout(1600); // the animated entrance settle
    const c = resourceCensus(await renderPdf(page, "res-landing"));
    expect(c.pageCount).toBe(8);
    // the count-parity contract: union counts + per-page multisets
    // identical across sides (the recon: clone 34/7/11 = live 34/7/11)
    expect(c.cats["/XObject"].union.length).toBe(34);
    expect(c.cats["/XObject"].perPage).toEqual([3, 3, 3, 4, 4, 5, 5, 7]);
    expect(c.cats["/Font"].union.length).toBe(7);
    expect(c.cats["/Font"].perPage).toEqual([1, 1, 1, 1, 1, 2, 4, 5]);
    expect(c.cats["/ExtGState"].union.length).toBe(11);
    expect(c.cats["/ExtGState"].perPage).toEqual([2, 2, 2, 2, 3, 3, 5, 8]);
    // the Pattern union: the ANIMATED-FORM bucket (the clone measured
    // 5 names, the live's own frame state 7 — the S38 range law at the
    // resource-name layer; bucketed like the D181 landing object count)
    expect(c.cats["/Pattern"].union.length).toBeGreaterThanOrEqual(4);
    expect(c.cats["/Pattern"].union.length).toBeLessThanOrEqual(8);
  });

  test("the /demo resource SUPERSET floor (the working page's 12 XObjects across 2 pages vs the live shell's ZERO — the superset at the resource layer)", async ({ page }) => {
    await dwell(page, "/demo");
    const c = resourceCensus(await renderPdf(page, "res-demo"));
    expect(c.pageCount).toBe(2);
    expect(c.cats["/XObject"].union.length).toBe(12);
    expect(c.cats["/XObject"].perPage).toEqual([4, 8]);
    expect(c.cats["/Font"].union.length).toBe(7);
    expect(c.cats["/ExtGState"].union.length).toBe(9);
  });

  test("the dashboard's authenticated resource fingerprint (XObjects 13/17, Fonts 5/7, GStates 6/9, Patterns 6 — the charts' fills at the resource layer)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    const c = resourceCensus(await renderPdf(page, "res-dash"));
    expect(c.pageCount).toBe(2);
    expect(c.cats["/XObject"].perPage).toEqual([13, 17]);
    expect(c.cats["/XObject"].union.length).toBe(30);
    expect(c.cats["/Font"].perPage).toEqual([5, 7]);
    expect(c.cats["/Font"].union.length).toBe(7);
    expect(c.cats["/ExtGState"].perPage).toEqual([6, 9]);
    expect(c.cats["/ExtGState"].union.length).toBe(10);
    expect(c.cats["/Pattern"].perPage).toEqual([6]);
    expect(c.cats["/Pattern"].union.length).toBe(6);
  });

  test("the determinism law: the resource censuses byte-identical across re-renders (the D181 discipline at the resource layer)", async ({ page }) => {
    for (const route of ["/faq", "/login"]) {
      await dwell(page, route);
      const a = resourceCensus(await renderPdf(page, `det-a-${route.replace(/\//g, "")}`));
      await dwell(page, route);
      const b = resourceCensus(await renderPdf(page, `det-b-${route.replace(/\//g, "")}`));
      expect(JSON.stringify(b), route).toBe(JSON.stringify(a));
    }
  });
});

// =====================================================================
// THE 27TH SURFACE'S ROUTE EXTENSIONS — the alternates' structural
// censuses + the dashboard's authenticated structural depth (D185)
// =====================================================================
test.describe("the /login alternates' structural censuses + the dashboard at depth (Session 53 — D185)", () => {
  test("the five /login states' per-state object-allocation fingerprint (default 51, error 52, reset 34, signup 38, forgot 38 — identical across sides; all untagged/outline-free/Lang-free)", async ({ page }) => {
    const states: [string, number, (p: import("@playwright/test").Page) => Promise<void>][] = [
      ["default", 51, async (p) => { await dwell(p, "/login"); }],
      ["error", 52, enterError],
      ["reset", 34, enterReset],
      ["signup", 38, enterSignup],
      ["forgot", 38, enterForgot],
    ];
    for (const [label, objCount, driver] of states) {
      await driver(page);
      const s = structuralCensus(await renderPdf(page, `alt-${label}`));
      expect(s.catalogKeys, `${label} catalog keys`).toEqual(["/Pages", "/Type", "/ViewerPreferences"]);
      expect(s.objCount, `${label} object count`).toBe(objCount);
      expect(s.markInfo, `${label} /MarkInfo`).toBeNull();
      expect(s.structTree, `${label} /StructTreeRoot`).toBeNull();
      expect(s.outlinesKey, `${label} /Outlines`).toBeNull();
      expect(s.lang, `${label} /Lang`).toBeNull();
    }
  });

  test("the dashboard's authenticated structural census AT DEPTH (292 objects + the public /ViewerPreferences + the empty-set contract under auth)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    const s = structuralCensus(await renderPdf(page, "dash-depth"));
    expect(s.objCount).toBe(292);
    expect(s.catalogKeys).toEqual(["/Pages", "/Type", "/ViewerPreferences"]);
    expect(s.viewerPrefs).toEqual({ "/DisplayDocTitle": true, "/Type": "/ViewerPreferences" });
    expect(s.markInfo).toBeNull();
    expect(s.structTree).toBeNull();
    expect(s.outlinesKey).toBeNull();
    expect(s.lang).toBeNull();
  });
});
