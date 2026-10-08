import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

// The dashboard superset: seeded workflows render, the AI composer creates
// one end-to-end, and pause/delete mutate the list.

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

test.describe("dashboard (functional superset)", () => {
  test("renders the seeded workspace with stats", async ({ page }) => {
    await signIn(page);
    await expect(page.getByText("Active workflows")).toBeVisible();
    await expect(page.getByText("Total runs")).toBeVisible();
    await expect(page.getByText("Hours saved")).toBeVisible();
    // A seeded workflow surfaces with its own runs.
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();
    await expect(page.getByText("1,284 runs")).toBeVisible();
    // The stats card aggregates all six seeded workflows (7,120 total runs).
    await expect(page.getByText("7,120").first()).toBeVisible();
    // Session 11 F3 (piggybacked on this session's sign-in — the auth
    // limiter budget is 10 POSTs/15 min for the WHOLE suite): the
    // paused/draft cards carry opacity-80, so a text-white/50 description
    // composites to EFFECTIVE white/40 (0.5 × 0.8 = 0.4 → #676767 over
    // #020202 — 3.61:1, glyph-interior pixel verified). The Session-10
    // D59 precedent: the description is text-white/60 (active ≥ 7:1,
    // paused ≥ 5.1:1).
    const ratios = await page.evaluate(() => {
      const srgbToLinear = (c: number) => {
        const v = c / 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      const luminance = (r: number, g: number, b: number) =>
        0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
      const effectiveAlpha = (el: Element) => {
        let alpha = 1;
        let node: Element | null = el;
        while (node) {
          const cs = getComputedStyle(node);
          if (cs.opacity !== "1") alpha *= parseFloat(cs.opacity);
          node = node.parentElement;
        }
        return alpha;
      };
      const bgOf = (el: Element) => {
        let node: Element | null = el;
        while (node) {
          const cs = getComputedStyle(node);
          const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/);
          if (m) {
            const [r, g, b, a] = m[1].split(",").map((x) => parseFloat(x));
            if ((a ?? 1) > 0) return { r, g, b };
          }
          node = node.parentElement;
        }
        return { r: 2, g: 2, b: 2 }; // page floor
      };
      return Array.from(document.querySelectorAll("article p.line-clamp-2")).map((line) => {
        const cs = getComputedStyle(line);
        // the text color's OWN alpha (oklab "/ a" or rgba ", a" spelling)
        const colorAlpha = (() => {
          const slash = cs.color.match(/\/\s*([\d.]+)\s*\)/);
          if (slash) return parseFloat(slash[1]);
          const comma = cs.color.match(/rgba?\([^)]*,\s*([\d.]+)\s*\)/);
          if (comma) return parseFloat(comma[1]);
          return 1;
        })();
        const alpha = colorAlpha * effectiveAlpha(line);
        // the text is white-family: composite the effective alpha over the
        // effective bg and compute the WCAG ratio
        const bg = bgOf(line);
        const fg = {
          r: alpha * 255 + (1 - alpha) * bg.r,
          g: alpha * 255 + (1 - alpha) * bg.g,
          b: alpha * 255 + (1 - alpha) * bg.b,
        };
        const l1 = Math.max(luminance(fg.r, fg.g, fg.b), luminance(bg.r, bg.g, bg.b));
        const l2 = Math.min(luminance(fg.r, fg.g, fg.b), luminance(bg.r, bg.g, bg.b));
        const ratio = (l1 + 0.05) / (l2 + 0.05);
        return { text: (line.textContent || "").trim().slice(0, 30), ratio: Number(ratio.toFixed(2)) };
      });
    });
    expect(ratios.length).toBeGreaterThanOrEqual(5); // the seeded workspace
    for (const r of ratios) {
      expect(r.ratio, `description "${r.text}" to clear 4.5:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("the composer creates a workflow end-to-end", async ({ page }) => {
    await signIn(page);
    // Baseline row count (the seed carries six workflows).
    const before = await page.locator("article").count();
    const idea = `E2E smoke pipeline ${Date.now()}`;
    await page.getByLabel("Workflow idea").fill(idea);
    await page.getByRole("button", { name: /^Compose$/ }).click();
    // The composer persists one new row (AI-named or template-named).
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 25_000 })
      .toBe(before + 1);
    // Clean up the newest row so later specs see the pristine seed.
    const row = page.locator("article").first();
    await row.getByRole("button", { name: /Delete/ }).first().click();
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 10_000 })
      .toBe(before);
  });

  test("pause toggles the workflow status", async ({ page }) => {
    await signIn(page);
    const row = page.locator("article", { hasText: "Lead enrichment pipeline" });
    await row.getByRole("button", { name: /Pause Lead enrichment pipeline/i }).click();
    await expect(row.getByText("paused")).toBeVisible({ timeout: 10_000 });
    // Restore for other specs.
    await row.getByRole("button", { name: /Resume Lead enrichment pipeline/i }).click();
    await expect(row.getByText("active", { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test("unauthenticated API access is rejected with the 401 envelope", async ({ request }) => {
    const res = await request.get("/api/workflows");
    expect(res.status()).toBe(401);
    const payload = await res.json();
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  test("mutation successes are announced politely (Session-14 F3, WCAG 4.1.3)", async ({ page }) => {
    await signIn(page);
    // The live region: role=status + aria-live=polite + sr-only (success
    // announcements — the mirror of the error banners' role=alert; the
    // Session-13 failure-class discipline applied to the success class).
    const live = page.locator('[aria-live="polite"][role="status"]');

    // (a) Pause → "Paused {name}."
    const row = page.locator("article", { hasText: "Lead enrichment pipeline" });
    await row.getByRole("button", { name: /Pause Lead enrichment pipeline/i }).click();
    await expect(live).toHaveText(/Paused Lead enrichment pipeline\./, { timeout: 10_000 });
    await expect(row.getByText("paused")).toBeVisible({ timeout: 10_000 });

    // (b) Resume → "Resumed {name}."
    await row.getByRole("button", { name: /Resume Lead enrichment pipeline/i }).click();
    await expect(live).toHaveText(/Resumed Lead enrichment pipeline\./, { timeout: 10_000 });
    await expect(row.getByText("active", { exact: true })).toBeVisible({ timeout: 10_000 });

    // (c) Compose → "Workflow created." (then clean up: Delete announces too).
    const before = await page.locator("article").count();
    await page.getByLabel("Workflow idea").fill(`Announce probe ${Date.now()}`);
    await page.getByRole("button", { name: /^Compose$/ }).click();
    await expect(live).toHaveText(/Workflow created\./, { timeout: 25_000 });
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 25_000 })
      .toBe(before + 1);

    // (d) Delete → "Deleted {name}." (the newest row; restores the seed).
    const newest = page.locator("article").first();
    const name = (await newest.locator("h3").first().textContent())?.trim() ?? "";
    await newest.getByRole("button", { name: /Delete/ }).first().click();
    await expect(live).toHaveText(new RegExp(`Deleted ${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.`), {
      timeout: 10_000,
    });
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 10_000 })
      .toBe(before);
  });

  test("the composer degrades to the template when generate is rate-limited (Session-16 F1 client contract)", async ({
    page,
  }) => {
    // The generate limiter (per-USER, GENERATE_RATE_LIMIT_MAX) is the
    // backend cost ceiling on the LLM endpoint; the CLIENT contract is
    // ADR-004's doctrine applied at the compose() layer: a failed
    // generate (any non-ok — here a 429 with the S15 Retry-After
    // contract) falls back to the client-side template draft and the
    // create STILL succeeds. The feature never hard-fails on the rate
    // limit; the limiter only caps the LLM spend. Pin-only (GREEN on
    // arrival — the degrade has shipped since the composer's first
    // session; this row keeps the contract from silently breaking).
    await signIn(page);
    const pageerrors: string[] = [];
    page.on("pageerror", (e) => pageerrors.push(String(e)));

    // Route-fulfill the 429 BEFORE composing — no real LLM call, the
    // exact envelope shape the limiter emits (incl. Retry-After).
    await page.route("**/api/workflows/generate", async (route) => {
      await route.fulfill({
        status: 429,
        headers: { "content-type": "application/json", "retry-after": "900" },
        body: JSON.stringify({
          ok: false,
          error: { code: "RATE_LIMITED", message: "Too many generations. Try again in 900s." },
        }),
      });
    });

    const before = await page.locator("article").count();
    const idea = `Rate-limited probe ${Date.now()}`;
    await page.getByLabel("Workflow idea").fill(idea);
    await page.getByRole("button", { name: /^Compose$/ }).click();

    // The action SUCCEEDS through the degrade: announced politely…
    await expect(page.locator('[aria-live="polite"][role="status"]')).toHaveText(/Workflow created\./, {
      timeout: 25_000,
    });
    // …and the row persists (template-named from the idea text)…
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 25_000 })
      .toBe(before + 1);
    await expect(page.locator("article").first().locator("h3")).toContainText(idea.slice(0, 40), {
      ignoreCase: true,
    });
    // …with ZERO uncaught pageerrors (the 429 is handled, never thrown).
    expect(pageerrors).toEqual([]);

    // Clean up the newest row so later specs see the pristine seed.
    const newest = page.locator("article").first();
    await newest.getByRole("button", { name: /Delete/ }).first().click();
    await expect
      .poll(async () => page.locator("article").count(), { timeout: 10_000 })
      .toBe(before);
  });
});
