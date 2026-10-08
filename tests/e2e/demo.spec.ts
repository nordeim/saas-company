import { expect, test } from "@playwright/test";

/**
 * The /demo route (Session 14 F1 / R1) — the demo-request superset made
 * reachable. `POST /api/demo` shipped complete (validation + rate limit +
 * the DemoRequest model) but with ZERO UI consumers: dead code dressed as
 * a superset feature. This route is the missing front half.
 *
 * Pure superset surface (like /dashboard — D62/D73): the live 404s /demo
 * (its SPA shell serves the 404 view — verified by the Session-14 probe),
 * so no parity pin applies here. The design follows the content-page
 * pattern (the FAQ view): dark brand, Navbar + Footer, Reveal entrances.
 *
 * Fault discipline (Session 12): the form upholds the composer contract —
 * a network abort surfaces the role="alert" banner with ZERO pageerrors.
 */

test.describe("/demo (Session-14 F1: the reachable demo-request surface)", () => {
  test("(a) the page renders the Book a Demo form over the site chrome", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.getByRole("heading", { name: "Book a Demo" })).toBeVisible();
    // The site chrome (content-page pattern — the Navbar is a <nav>).
    await expect(page.getByRole("navigation")).toBeVisible();
    // All five fields + the submit button (scoped to main — the footer's
    // newsletter input also carries an Email label).
    const form = page.locator("main");
    await expect(form.getByLabel("Name")).toBeVisible();
    await expect(form.getByLabel("Email")).toBeVisible();
    await expect(form.getByLabel("Company (optional)")).toBeVisible();
    await expect(form.getByLabel("Message (optional)")).toBeVisible();
    await expect(form.getByRole("button", { name: "Request a demo" })).toBeVisible();
  });

  test("(b) empty-submit is blocked by client-side validation (name + email required)", async ({ page }) => {
    await page.goto("/demo");
    // Scope to the main column — the footer's newsletter input also
    // carries an Email label.
    const form = page.locator("main");
    await form.getByRole("button", { name: "Request a demo" }).click();
    // The browser's required-field validation keeps the form on the page
    // with NO request fired (the API never sees an empty body).
    await expect(page).toHaveURL(/\/demo/);
    const nameInvalid = await form
      .getByLabel("Name")
      .evaluate((el) => !(el as HTMLInputElement).checkValidity());
    expect(nameInvalid).toBe(true);
    const emailInvalid = await form
      .getByLabel("Email")
      .evaluate((el) => !(el as HTMLInputElement).checkValidity());
    expect(emailInvalid).toBe(true);
  });

  test("(c) the happy path submits and confirms politely", async ({ page }) => {
    await page.goto("/demo");
    const form = page.locator("main");
    await form.getByLabel("Name").fill("E2E Probe");
    await form.getByLabel("Email").fill(`e2e-demo-${Date.now()}@example.com`);
    await form.getByLabel("Company (optional)").fill("Probe Labs");
    await form.getByLabel("Message (optional)").fill("Automated reachability check.");
    await form.getByRole("button", { name: "Request a demo" }).click();
    // The polite confirmation (role=status, aria-live=polite — the
    // composer's success contract; WCAG 4.1.3).
    await expect(page.getByRole("status").filter({ hasText: /received/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("(d) an API-rejected payload surfaces the error banner", async ({ page }) => {
    await page.goto("/demo");
    const form = page.locator("main");
    // A 101-char name passes the CLIENT bounds check only if the client
    // mirrors the API — force the API's own rejection through the wire.
    await page.route("**/api/demo", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: { code: "VALIDATION", message: "Name must be at most 80 characters." } }),
      });
    });
    await form.getByLabel("Name").fill("Any Name");
    await form.getByLabel("Email").fill(`e2e-demo-${Date.now()}@example.com`);
    await form.getByRole("button", { name: "Request a demo" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "at most 80 characters" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("(e) a network fault surfaces the banner with ZERO pageerrors (the Session-12 contract)", async ({ page }) => {
    const pageerrors: string[] = [];
    page.on("pageerror", (err) => pageerrors.push(String(err)));
    await page.goto("/demo");
    const form = page.locator("main");
    await page.route("**/api/demo", async (route) => {
      await route.abort("failed");
    });
    await form.getByLabel("Name").fill("Fault Probe");
    await form.getByLabel("Email").fill(`e2e-fault-${Date.now()}@example.com`);
    await form.getByRole("button", { name: "Request a demo" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /check your connection|network|try again/i })).toBeVisible({
      timeout: 10_000,
    });
    expect(pageerrors).toEqual([]);
  });

  test("(f) the sitemap lists /demo (the SEO superset surface)", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain("<loc>");
    expect(xml).toMatch(/\/demo<\/loc>/);
  });

  test("(g) the page's heading outline is valid (Session-15 F2: no h1→h3 skip)", async ({ page }) => {
    // /demo is a SUPERSET route (the live 404s it) — its a11y floor is
    // axe-clean, not live-parity-adjudicated (D63 covers live-mirrored
    // routes only). Pre-fix the page's only heading was the h1, so the
    // byte-pinned footer's first h3 ("Product") landed after an h1 with
    // no intervening h2 — a heading-order violation (moderate). The fix:
    // an sr-only h2 opens the form card; the outline must read
    // h1 → h2 → the four footer h3s.
    await page.goto("/demo");
    await page.waitForLoadState("domcontentloaded");
    const outline = await page.evaluate(() =>
      [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => ({
        tag: h.tagName,
        text: (h.textContent || "").trim(),
        visuallyHidden: h.classList.contains("sr-only"),
      })),
    );
    expect(outline).toEqual([
      { tag: "H1", text: "Book a Demo", visuallyHidden: false },
      { tag: "H2", text: "Request a demo", visuallyHidden: true },
      { tag: "H3", text: "Product", visuallyHidden: false },
      { tag: "H3", text: "Legal", visuallyHidden: false },
      { tag: "H3", text: "Social", visuallyHidden: false },
      { tag: "H3", text: "Subscribe", visuallyHidden: false },
    ]);
  });
});
