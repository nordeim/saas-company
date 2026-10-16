import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Session 60 — THE LITERAL-RULE CONVERGENCE (the 34th surface's route
 * extension, answered): the 3 remaining literal-violet rules measured
 * against the live's served CSS this session:
 *
 *   (1) the live's universal rule is
 *       `* { border-color: hsl(var(--border)); outline-color:
 *       hsl(var(--ring) / .5) }` with `:root { --ring: 290 100% 50% }` —
 *       the outline tint consumes the RING COMPONENT VAR (the float
 *       carrier, R = 212.5/255 at runtime — the D205/D206 token-syntax
 *       family's LAST unconverted member; the clone's
 *       `rgb(213 0 255 / 0.5)` literal was the 8-bit quantization).
 *   (2)+(3) the live's pulse-glow is opacity-ONLY
 *       (`0%,to{opacity:.4} 50%{opacity:.8}`, 4s, NO box-shadow) — the
 *       clone's box-shadows + opacity 1/.6 + 2.4s were inventions (INERT:
 *       zero consumers in either tree — verified on the live DOM).
 *
 * THE NOT-FIX ADJUDICATIONS (pinned so the convergence cannot overreach):
 *   - the * rule's BORDER half keeps `var(--color-border)`: the live's
 *     login --border cascade is a multi-defined zinc/gray/dark-!important
 *     soup whose value never paints (the D131 inert record — the live's
 *     borderless trio computes rgb(229,231,235) at border-width 0), and
 *     the clone's login-local `--color-border: #e5e7eb` pin mechanism
 *     (the D131 parity story) depends on the token consumption form.
 *   - `--color-ring: hsl(240 10% 3.9%)` stays the LOGIN slate literal
 *     (the S9 F2 / D212 pin — the ring-ring utility's source; identical
 *     at 8-bit to the live's runtime hsl(var(--ring)) under the login
 *     bundle's own --ring override).
 *   - the login-local `:root { --ring: 240 10% 3.9% }` override keeps
 *     feeding the * rule's outline on /login (where `* { outline-color:
 *     revert }` wins the cascade anyway — the S5 F3 neutralization).
 */

const dwell = async (page: import("@playwright/test").Page, path: string) => {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
};

// ---------- D213: the ring component var + the * rule's outline indirection ----------
test("D213 the @theme ring component var + the * rule's outline half consume the live's indirection (source)", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  // the component var (raw components — not a color value, invisible to
  // the compiler; lands in :root like --violet — the live's landscape)
  expect(css).toContain("--ring: 290 100% 50%;");
  // the * rule's outline half — the live's exact consumption
  expect(css).toContain("outline-color: hsl(var(--ring) / 0.5);");
  // the 8-bit literal is GONE (the D205 family's last member converged)
  expect(css).not.toContain("outline-color: rgb(213 0 255 / 0.5)");
});

test("D213 the NOT-FIX guards (the border half + the login ring token stay adjudicated)", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  // the * rule's border half keeps the token consumption (the D211/D131
  // adjudication — the login pin mechanism depends on it)
  expect(css).toContain("border-color: var(--color-border);");
  // the inert border/input tokens unchanged (the D211 pins)
  expect(css).toContain("--color-border: hsl(0 0% 14%)");
  expect(css).toContain("--color-input: hsl(0 0% 14%)");
  // the ring token stays the LOGIN slate literal (the S9 F2 / D212 pin)
  expect(css).toContain("--color-ring: hsl(240 10% 3.9%)");
});

test("D213 the login-local ring landscape (the :root override + the neutralization)", () => {
  const card = readFileSync(join(process.cwd(), "src/app/login/login-card.tsx"), "utf8");
  // the login bundle's own --ring feeds the * rule on /login
  expect(card).toContain(":root { --ring: 240 10% 3.9%; }");
  // the S5 F3 neutralization still wins the login cascade
  expect(card).toContain("* { outline-color: revert; }");
});

// ---------- D213b: the BUILT css (the var-indirection law at the outline seam) ----------
test("D213b the served css survives the indirection unresolved (the var-indirection law, outline seam)", async ({ page }) => {
  await dwell(page, "/");
  const cssUrls = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) =>
      (l as HTMLLinkElement).getAttribute("href") ?? "",
    ),
  );
  expect(cssUrls.length).toBeGreaterThan(0);
  let css = "";
  for (const href of cssUrls) {
    const abs = href.startsWith("http") ? href : new URL(href, page.url()).toString();
    css += await (await page.request.get(abs)).text();
  }
  // the component var lands in :root (the live's variable landscape)
  expect(css).toContain("--ring:290 100% 50%");
  // the indirection survives the build (lightningcss cannot resolve var())
  expect(css).toContain("hsl(var(--ring)");
  // the 8-bit literal is gone from the BUILD (the compile-time
  // quantization path closed by construction)
  expect(css).not.toContain("outline-color:rgb(213 0 255");
});

// ---------- D214: the pulse-glow convergence (the live's exact body) ----------
test("D214 the pulse-glow keyframe is the live's opacity-only body (source)", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  // the live's exact values: 0.4 ↔ 0.8 (NOT the invented 1 ↔ 0.6)
  const kf = css.match(/@keyframes pulse-glow\s*\{([\s\S]*?)\n\}/);
  expect(kf, "the pulse-glow keyframe must exist").not.toBeNull();
  expect(kf![1]).toContain("opacity: 0.4");
  expect(kf![1]).toContain("opacity: 0.8");
  // the invented box-shadows are GONE (the two remaining literals) —
  // the DECLARATION form (the keyframe's own comment mentions the word
  // in its provenance note, which is not a declaration)
  expect(kf![1]).not.toMatch(/\bbox-shadow\s*:/);
  expect(css).not.toContain("rgb(213 0 255 / 0.6)");
  expect(css).not.toContain("rgb(213 0 255 / 0.3)");
  // the duration converged: 4s (the live's consumer), not 2.4s
  expect(css).toContain("--animate-pulse-glow: pulse-glow 4s ease-in-out infinite;");
  expect(css).toMatch(/\.animate-pulse-glow\s*\{[^}]*pulse-glow 4s ease-in-out infinite/);
});

// ---------- D215: the computed parity guards (the runtime convergence) ----------
test("D215 the outline tint computes the live's rgba(213,0,255,.5) on the dark routes (the CSSOM masking preserved)", async ({ page }) => {
  await dwell(page, "/");
  const outline = await page.evaluate(() => {
    const el = document.querySelector("h1")!;
    return getComputedStyle(el).outlineColor;
  });
  // the runtime hsl(290 100% 50% / .5) serializes EXACTLY like the old
  // literal (212.5 rounds up — the D206 masking law); this pins that the
  // indirection did not drift the computed layer
  expect(outline).toBe("rgba(213, 0, 255, 0.5)");
});
