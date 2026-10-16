/**
 * Session 59 — THE THIRTY-FOURTH SURFACE (D205–D212): the PDF
 * COLOR-FILL VALUE layer + the color-TOKEN syntax families.
 *
 * THE SURFACE SELECTION (the lesson-88 raw-shape discipline): the S58
 * worklog's THIRTY-FOURTH-surface trio probed on the cached renders —
 * the /Kids page-tree VALUE layer measured IDENTICAL on every
 * deterministic route (the S54 flatness law's value-level complement;
 * /demo the registered 2v1 superset + the clone's /Annots superset
 * pageKeys) and the /DecodeParms family measured the EMPTY-SET LAW
 * (zero /DecodeParms on every stream, both sides, every route) — both
 * registered as LAWS; the PDFTOHTML -XML per-word layer measured RICH:
 * every word's (x, y, w, h, font) at EXACT parity on every deterministic
 * route, but the FONTSPEC COLORS exposed TWO new value families — the
 * violet #d500ff v #d400ff (root + faq) and the near-black #09090a v
 * #08080a (alt-error) — each a ±1/255-channel delta at IDENTICAL
 * positions/sizes, root-caused through the PDF fill operators
 * (clone `.8353 0 1 rg` v live `.8333 0 1 rg`) to THE TOKEN SYNTAX
 * DIVERGENCE: the live's palette ships hsl-COMPONENT tokens
 * (`--violet: 290 100% 50%` consumed as `hsl(var(--violet))`) whose
 * sRGB conversion carries FLOAT precision (R = 5/6 = .8333 =
 * 212.5/255), while the clone's mirror rounded each to 8-bit HEX
 * (#d500ff = 213/255 = .8353) — the CSSOM serialization rounds BOTH to
 * rgb(213,0,255), masking the delta at every DOM layer; ONLY the print
 * pipeline's float operators reveal it.
 *
 * THE FULL FAMILY SET (the comprehensive fill census, every stream,
 * every route, both sides — 21 differing value-pairs of 42 distinct
 * fills, decoded to SIX syntax/precision families + the count-only
 * re-blocking/entrance families + the /demo superset):
 *  D205 THE VIOLET SYNTAX LAW — `--color-violet: #d500ff` → the live's
 *      `hsl(290 100% 50%)`; 17 fills across routes (.8353 → .8333);
 *      the badge / the Apply CTA / the faq h1.
 *  D206 THE MUTED-FOREGROUND SYNTAX LAW — `#a3a3a3` → the live's
 *      `hsl(0 0% 64%)`; 5 fills (.6392 → .64); the faq chevrons.
 *  D207 THE LOGIN NEAR-BLACK SYNTAX LAW — the login-local
 *      `#09090b` (zinc-950 hex) → the live login bundle's
 *      `hsl(240 10% 3.9%)`; 2 fills (.0353,.0353,.0431 →
 *      .0351,.0351,.0429); the typed input text + the card foreground.
 *  D208 THE LOGIN NEAR-WHITE SYNTAX LAW — the login-local
 *      `#f4f4f5` (zinc-100 hex) → the live login bundle's
 *      `hsl(240 4.8% 95.9%)`; 3 fills (.9569,.9569,.9608 →
 *      .957,.957,.961); the light surfaces.
 *  D209 THE RED-50 OKLCH-LEAK LAW — the error banner's bg computed
 *      oklab(0.971 0.0124 0.0039 / .7) = v4's UNPINNED red-50 (the
 *      s9 v3-hex palette pins covered red-200..700 but MISSED the 50
 *      step) while the live ships the v3 hex rgba(254,242,242,.7);
 *      the fill .9967,.9496,.9496 → .9961,.949,.949. THE FIX: pin
 *      `--color-red-50: #fef2f2` (the s9 roundtrap family's residual).
 *  D210 THE GREEN-50 OKLCH-LEAK LAW — the same for the success banner
 *      (the reset flow's "Check your email" state): pin
 *      `--color-green-50: #f0fdf4`; the fill .9413,.9923,.957 →
 *      .9412,.9922,.9569.
 *  D211 THE INERT-TOKEN CONVERGENCE — the globals card/border/input
 *      tokens (#0f0f0f/#242424 → the live :root's hsl(0 0% 6%) /
 *      hsl(0 0% 14%)) and the dark --color-muted (#161616 → the live
 *      :root's hsl(240 5% 12%)) — every one INERT (no un-overridden
 *      consumer on any route; the dark muted's only consumer sits
 *      under the login route's local light override) but converged for
 *      token-table honesty; every conversion is 8-bit-transparent
 *      (15.3→15, 35.7→36, 163.2→163, 212.5→213, 8.95→9).
 *  D212 THE NOT-FIX GUARDS (the :root-vs-.dark adjudication) — the
 *      live's SPA css ships BOTH blocks (`:root{--primary: 267 100%
 *      57%}` + `.dark{--primary: 290 100% 50%}`) and NEVER MOUNTS
 *      .dark (verified on the DOM: html/body class empty both sides),
 *      so the RENDERING primary is #8624ff (hsl 267° — measured at the
 *      glow gradient stops: rgba(134,36,255,.2), IDENTICAL on both
 *      sides), the RENDERING destructive is the :root's #ef4444 (hsl(0
 *      84.2% 60.2%), the .dark 127,29,29 inert), and the ring token
 *      mirrors the live LOGIN bundle's :root (hsl(240 10% 3.9%), the
 *      S9 F2 pin; the SPA :root's 290° ring serves the outline-color
 *      base rule, mirrored separately since S5 F3). These three are
 *      pinned HERE so a future "helpful" token alignment cannot drift
 *      them to the inert .dark values (the exact trap this session's
 *      reconciliation instrument fell into first).
 *
 * THE INSTRUMENT LAWS honored:
 *  - THE PIN-YOUR-OWN-INPUT LAW (D182): the login-family censuses bind
 *    the spec's own probe input (probe-s58@test.local — the same email
 *    the S58 battery's live cache carries, per gotcha 68's
 *    render-input identity law).
 *  - THE FRESH-CONTEXT LAW: the public renders on clean contexts; the
 *    login-family states in sequence on one context.
 *  - THE FILTERED-STREAM LAW: the fill census reads every stream
 *    (page + form XObjects) through qpdf --show-object
 *    --filtered-stream-data — NOT the JSON inline data (the S57
 *    base64-stream law).
 *
 * THE 8-BIT TRANSPARENCY GUARD: every syntax conversion pins the
 * UNCHANGED computed styles (the badge rgb(213,0,255); the input text
 * rgb(9,9,11)) — the fix converges the FLOAT layer without moving a
 * single rendered 8-bit value.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const PROBE_EMAIL = "probe-s58@test.local";
const PROBE_PASSWORD = "definitely-wrong-password";
const pdfFile = (name: string) => join(tmpdir(), `s59-pin-${name}.pdf`);

const renderPdf = async (page: import("@playwright/test").Page, name: string) => {
  const buf = await page.pdf({ format: "A4", printBackground: true });
  const file = pdfFile(name);
  writeFileSync(file, buf);
  return file;
};

// THE FILTERED-STREAM FILL CENSUS (the instrument): every stream object
// through qpdf --filtered-stream-data, the rg/scn/sc fills collected as
// 4-decimal-truncated multisets (the PDF's own serialization granularity).
const fillCensus = (file: string) => {
  const jsonFile = file.replace(/\.pdf$/, ".s59.json");
  execFileSync("qpdf", ["--json", "--json-stream-data=inline", file, jsonFile], {
    maxBuffer: 512 * 1024 * 1024,
  });
  const j = JSON.parse(readFileSync(jsonFile, "utf8"));
  const objs = (j as any).qpdf[1] as Record<string, any>;
  const fills = new Map<string, number>();
  for (const [k, o] of Object.entries(objs)) {
    if (!o?.stream?.dict) continue;
    const num = k.replace(/^obj:/, "").replace(/ 0 R$/, "");
    let data: string;
    try {
      data = execFileSync("qpdf", ["--show-object=" + num, "--filtered-stream-data", file], {
        maxBuffer: 256 * 1024 * 1024,
        encoding: "latin1",
      });
    } catch {
      continue;
    }
    const re = /([\d.]+) ([\d.]+) ([\d.]+) (?:rg|scn|sc)\b/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(data))) {
      const trunc = (x: string) => (x.length > 6 ? x.slice(0, 6) : x);
      const key = `${trunc(m[1])},${trunc(m[2])},${trunc(m[3])}`;
      fills.set(key, (fills.get(key) ?? 0) + 1);
    }
  }
  return fills;
};
const has = (fills: Map<string, number>, key: string) => (fills.get(key) ?? 0) > 0;

test.setTimeout(120_000);

// ---------- D205/D206: the public-route syntax laws (on /faq) ----------
test("D205/D206 the violet + muted-foreground syntax laws (the /faq fills carry the live's hsl floats)", async ({ page }) => {
  await page.goto("/faq", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const file = await renderPdf(page, "faq");
  const fills = fillCensus(file);
  // D205: the violet — the live's hsl(290 100% 50%) float, NOT the hex
  expect(has(fills, ".8333,0,1"), "the violet fill must be the hsl float .8333 (the live's token syntax)").toBe(true);
  expect(has(fills, ".8353,0,1"), "the hex-mirrored .8353 must be GONE").toBe(false);
  // D206: the muted-foreground gray — the live's hsl(0 0% 64%) float
  expect(has(fills, ".64,.64,.64"), "the gray fill must be the hsl float .64").toBe(true);
  expect(has(fills, ".6392,.6392,.6392"), "the hex-mirrored .6392 must be GONE").toBe(false);
});

// ---------- the 8-bit transparency guard ----------
test("D205 guard the badge's computed color is UNCHANGED at 8-bit (rgb(213,0,255))", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const color = await page.locator("text=Saves 4 hours/week").first().evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe("rgb(213, 0, 255)");
});

// ---------- D207/D208/D209: the login-family laws ----------
test("D207/D208/D209 the login near-black + near-white syntax laws + the red-50 oklch-leak fix", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  // the input text color guard (unchanged at 8-bit)
  const input = page.locator("input[type=email], input[name=email]").first();
  await input.fill(PROBE_EMAIL);
  expect(await input.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(9, 9, 11)");
  // the default-state render: near-white + near-black families
  let file = await renderPdf(page, "alt-default");
  let fills = fillCensus(file);
  // D208: near-white — the live login bundle's hsl(240 4.8% 95.9%) floats
  expect(has(fills, ".957,.957,.961"), "the near-white fill must be the hsl floats").toBe(true);
  expect(has(fills, ".9569,.9569,.9608"), "the hex-mirrored .9569 must be GONE").toBe(false);
  // D207: near-black — hsl(240 10% 3.9%)
  expect(has(fills, ".0351,.0351,.0429"), "the near-black fill must be the hsl floats").toBe(true);
  expect(has(fills, ".0353,.0353,.0431"), "the hex-mirrored .0353 must be GONE").toBe(false);

  // D209: the error banner — THE V4 EMISSION-PATH LAW: the /70 opacity
  // modifier emits color-mix(in oklab, …), so the computed style
  // SERIALIZES as oklab(…) on this app while the live (v3) serializes
  // rgba(254,242,242,.7) — the sRGB VALUES converge (the oklab roundtrip
  // of the pinned hex lands within ±0.05/255); the SURFACE truth is the
  // print fill below (the base color + the alpha gs, NOT composited).
  await page.locator("input[type=password]").fill(PROBE_PASSWORD);
  await page.locator("button[type=submit]").click();
  await page.waitForSelector("[class*='bg-red-50']", { timeout: 15000 });
  await page.waitForTimeout(400);
  const bannerBg = await page.locator("[class*='bg-red-50']").first().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bannerBg.startsWith("oklab("), `the emission path is color-mix oklab (got ${bannerBg})`).toBe(true);
  file = await renderPdf(page, "alt-error");
  fills = fillCensus(file);
  expect(has(fills, ".9961,.949,.949"), "the red-50 fill must be the v3 hex floats").toBe(true);
  expect(has(fills, ".9967,.9496,.9496"), "the v4-oklch .9967 leak must be GONE").toBe(false);
});

// ---------- D210: the green-50 law (the reset flow's success state) ----------
test("D210 the green-50 oklch-leak fix (the Check-your-email state's success banner)", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /Forgot password\?/ }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor({ timeout: 15000 });
  await page.fill('input[type="email"], #email', PROBE_EMAIL);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await page.getByRole("heading", { name: "Check your email" }).waitFor({ timeout: 15000 });
  await page.waitForTimeout(500);
  const bannerBg = await page.locator("[class*='bg-green-50']").first().evaluate((el) => getComputedStyle(el).backgroundColor);
  // THE V4 EMISSION-PATH LAW (same as D209): oklab serialization, converged values
  expect(bannerBg.startsWith("oklab("), `the emission path is color-mix oklab (got ${bannerBg})`).toBe(true);
  const file = await renderPdf(page, "alt-reset");
  const fills = fillCensus(file);
  expect(has(fills, ".9412,.9922,.9569"), "the green-50 fill must be the v3 hex floats").toBe(true);
  expect(has(fills, ".9413,.9923,.957"), "the v4-oklch leak must be GONE").toBe(false);
});

// ---------- D211/D212: the source-level token laws ----------
test("D211 the globals token syntax convergence (the inert families converged for table honesty)", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  // D205: the var-indirection form (the live's exact pattern — raw
  // components + hsl(var(...)), unresolvable at build time)
  expect(css).toContain("--violet: 290 100% 50%;");
  expect(css).toContain("--color-violet: hsl(var(--violet));");
  // D206: the same indirection
  expect(css).toContain("--muted-foreground: 0 0% 64%;");
  expect(css).toContain("--color-muted-foreground: hsl(var(--muted-foreground));");
  // D211: the inert families (plain hsl literals — their build-time hex
  // is the correct 8-bit and they never materialize in the print layer)
  expect(css).toContain("--color-card: hsl(0 0% 6%)");
  expect(css).toContain("--color-border: hsl(0 0% 14%)");
  expect(css).toContain("--color-input: hsl(0 0% 14%)");
  expect(css).toContain("--color-muted: hsl(240 5% 12%)");
  expect(css).toContain("--color-red-50: #fef2f2");
  expect(css).toContain("--color-green-50: #f0fdf4");
});

test("D212 the NOT-FIX guards (the :root-vs-.dark adjudication pinned)", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  // the RENDERING primary is the :root 267° (#8624ff) — the .dark 290° is inert
  expect(css).toContain("--color-primary: #8624ff");
  // the RENDERING destructive is the :root's #ef4444 — the .dark 127,29,29 is inert
  expect(css).toContain("--color-destructive: #ef4444");
  // the ring mirrors the live LOGIN bundle's :root (the S9 F2 pin)
  expect(css).toContain("--color-ring: hsl(240 10% 3.9%)");
});

test("D207 source the login-local style block carries the live's hsl specs", () => {
  const src = readFileSync(join(process.cwd(), "src/app/login/login-card.tsx"), "utf8");
  // the near-black: foreground + card-foreground + the body color
  expect(src).toContain("--color-foreground: hsl(240 10% 3.9%)");
  expect(src).toContain("--color-card-foreground: hsl(240 10% 3.9%)");
  expect(src).toContain("color: hsl(240 10% 3.9%)");
  // the near-white: the light muted (zinc-100 in the live's hsl form)
  expect(src).toContain("--color-muted: hsl(240 4.8% 95.9%)");
});
