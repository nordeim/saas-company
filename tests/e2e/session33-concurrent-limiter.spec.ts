import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";

/**
 * Session 33 R2 (F5 — the session_64 S33 candidate: "the composer's
 * deterministic-fallback seam under a concurrent-window shape — two tabs
 * composing simultaneously against the per-user limiter").
 *
 * The generate limiter is PER-USER (Session 16 F1: keyed by the
 * authenticated user id — the honest unit behind requireSession), and
 * the client degrades to the deterministic template on any non-ok
 * generate response (the feature never hard-fails; the standing
 * dashboard.spec.ts pin route-FULFILLS a MOCKED 429 — this suite pins
 * the REAL server's REAL 429 under the REAL concurrent shape).
 *
 * Three contracts, one suite:
 *   (a) the bucket is SHARED ACROSS TABS — one browser context (one
 *       session cookie, one user), two pages; concurrent attempts
 *       from both tabs draw from ONE budget. The checkRate increment
 *       is synchronous, so concurrent latecomers at an exhausted
 *       ceiling all answer 429 — no slot leaks to the race.
 *   (b) the degrade-not-fail contract HOLDS UNDER CONCURRENCY — with
 *       the bucket exhausted, both tabs' UI composes still create
 *       their workflow through the template draft (the real 429, the
 *       real fallback, the real create — zero uncaught pageerrors).
 *   (c) the two tabs CONVERGE — after the concurrent composes, both
 *       reloaded tabs render the SAME shared workspace (both new
 *       rows, the true total).
 *
 * The deterministic exhaustion (zero SDK calls): 50 POSTs to
 * /api/workflows/generate carrying a VALID JSON body WITHOUT an idea —
 * the route's own ordering (session guard → limiter → parse → validate)
 * counts every attempt BEFORE requiredString rejects it with 400. Each
 * answers in milliseconds; the webServer's GENERATE_RATE_LIMIT_MAX=50
 * is the ceiling. The any-attempt-counts law is the auth routes' own
 * documented contract (Session 16: "any attempt counts, valid or not").
 *
 * Workspace isolation (the Session-27/28/30/31/32 register pattern):
 * the dedicated user registered through the API, cascade-deleted in
 * the afterAll. The in-memory rate bucket for the (unique, per-run)
 * user id expires with its 15-minute window — a reused server across
 * consecutive runs sees a FRESH key each run.
 *
 * .serial: the three tests share one minted exhaustion — a worker
 * restart would silently split it across fresh users.
 *
 * Suite-order notes (single worker, shared e2e.db, alphabetical): this
 * file sorts AFTER session32-membership.spec.ts and BEFORE
 * session-lifecycle.spec.ts. One API register + two UI sign-ins sit far
 * inside the webServer's AUTH_RATE_LIMIT_MAX=100 budget.
 */

const E2E_BASE = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const EMAIL = `e2e-s33-concurrent-${Date.now()}@example.com`;
const PASSWORD = "Concurrent1234!";
const IDEA_A = "Concurrent tab A compose idea";
const IDEA_B = "Concurrent tab B compose idea";

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${resolve("db/e2e.db")}` } },
});

async function register(): Promise<void> {
  const res = await fetch(`${E2E_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Concurrent Probe", email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`register ${EMAIL} failed: ${res.status}`);
}

async function cleanup(): Promise<void> {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.$disconnect();
}

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

/** One counted-but-rejected generate attempt: valid JSON, no idea —
 * the limiter counts it, requiredString rejects it (400), the LLM is
 * never asked. */
async function countedAttempt(page: Page): Promise<number> {
  const res = await page.request.post(`${E2E_BASE}/api/workflows/generate`, {
    headers: { "Content-Type": "application/json" },
    data: { notAnIdea: true },
  });
  return res.status();
}

async function composeIn(page: Page, idea: string) {
  await page.getByLabel("Workflow idea").fill(idea);
  await page.getByRole("button", { name: /^Compose$/ }).click();
}

test.describe.serial("the composer's concurrent-window limiter shape (Session 33 R2 — constructed-correct, now pinned)", () => {
  test.beforeAll(async () => {
    await register();
  });

  test.afterAll(async () => {
    await cleanup();
  });

  test("(a) the per-USER bucket is shared across tabs: concurrent attempts from two tabs at an exhausted ceiling both answer 429 (no per-tab isolation, no leaked slot)", async ({ page }) => {
    await signIn(page);
    const tabB = await page.context().newPage();
    await tabB.goto("/dashboard");
    await expect(tabB.getByRole("heading", { name: "Workflows" })).toBeVisible({ timeout: 15_000 });

    // The deterministic exhaustion: 50 counted-but-rejected attempts
    // (the webServer's GENERATE_RATE_LIMIT_MAX=50), all concurrent.
    const statuses = await Promise.all(
      Array.from({ length: 50 }, () => countedAttempt(page)),
    );
    expect(statuses.filter((s) => s === 400)).toHaveLength(50);

    // One more attempt from EACH tab, fired CONCURRENTLY — both draw
    // from the SAME per-user budget: both 429, both with Retry-After.
    const [resA, resB] = await Promise.all([countedAttempt(page), countedAttempt(tabB)]);
    expect(resA).toBe(429);
    expect(resB).toBe(429);

    // The S15 Retry-After contract on the real concurrent pair.
    const [pairA, pairB] = await Promise.all([
      page.request.post(`${E2E_BASE}/api/workflows/generate`, {
        headers: { "Content-Type": "application/json" },
        data: { notAnIdea: true },
      }),
      tabB.request.post(`${E2E_BASE}/api/workflows/generate`, {
        headers: { "Content-Type": "application/json" },
        data: { notAnIdea: true },
      }),
    ]);
    expect(pairA.status()).toBe(429);
    expect(pairB.status()).toBe(429);
    expect(Number(pairA.headers()["retry-after"])).toBeGreaterThan(0);
    expect(Number(pairB.headers()["retry-after"])).toBeGreaterThan(0);

    // The per-USER key (never per-IP or process-global — the Session-16
    // law, unit-pinned by the rate-limit suites and visible here in the
    // SHARED-bucket behavior above): THIS spec's dedicated user is the
    // only one exhausted. A cross-USER probe through the same cookie jar
    // would flake on header precedence, and the cross-user isolation is
    // already the S16 unit pins' contract — not re-pinned here.
    await tabB.close();
  });

  test("(b) the degrade-not-fail contract under concurrency: with the bucket exhausted, both tabs' simultaneous UI composes create their workflows through the template draft — zero uncaught pageerrors", async ({ page }) => {
    await signIn(page);
    const tabB = await page.context().newPage();
    await tabB.goto("/dashboard");
    await expect(tabB.getByRole("heading", { name: "Workflows" })).toBeVisible({ timeout: 15_000 });

    const errorsA: string[] = [];
    const errorsB: string[] = [];
    page.on("pageerror", (e) => errorsA.push(String(e)));
    tabB.on("pageerror", (e) => errorsB.push(String(e)));

    // Both composes fired CONCURRENTLY against the exhausted bucket:
    // both generate calls answer the REAL 429, both clients degrade to
    // the deterministic template draft, both creates succeed.
    await Promise.all([composeIn(page, IDEA_A), composeIn(tabB, IDEA_B)]);

    await expect(
      page.locator('[aria-live="polite"][role="status"]'),
    ).toHaveText(/Workflow created\./, { timeout: 25_000 });
    await expect(
      tabB.locator('[aria-live="polite"][role="status"]'),
    ).toHaveText(/Workflow created\./, { timeout: 25_000 });

    expect(errorsA).toEqual([]);
    expect(errorsB).toEqual([]);
    await tabB.close();
  });

  test("(c) the two-tab convergence: after the concurrent composes, both reloaded tabs render the same shared workspace — both new rows, the true total", async ({ page }) => {
    await signIn(page);
    const tabB = await page.context().newPage();
    await tabB.goto("/dashboard");
    await expect(tabB.getByRole("heading", { name: "Workflows" })).toBeVisible({ timeout: 15_000 });

    for (const tab of [page, tabB]) {
      await tab.reload();
      const articles = tab.locator('section[aria-label="Workflows"] article');
      await expect(articles).toHaveCount(2, { timeout: 20_000 });
      const names = await tab.locator('section[aria-label="Workflows"] article h3').allInnerTexts();
      expect(names.sort()).toEqual([IDEA_A, IDEA_B].sort());
      // The header reads the TRUE total — never the fetched length.
      await expect(tab.getByText("2 total")).toBeVisible();
    }
    await tabB.close();
  });
});
