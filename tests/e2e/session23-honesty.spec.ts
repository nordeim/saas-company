import { expect, test, type Page } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

/**
 * Session 23 — the dashboard-honesty suite. The CLIENT side of the
 * mutation contract (the optimistic-UI semantics audit):
 *
 *  F1 — the honest-404 dispatch. S22 closed the SERVER race by
 *  construction (the raced PATCH/DELETE answers the honest 404); the
 *  client's catch still treated it like a network fault: the banner
 *  said "Try again." (a LIE — every retry 404s forever) and the ghost
 *  row stayed mounted. Same class as the Session-13 401-sentinel: a
 *  failure class that must not wear the retry banner.
 *
 *  F2 — the refresh() in-flight ordering guard. Two concurrent actions
 *  on different rows fire two refresh GETs; a delayed STALE response
 *  landing last used to overwrite the truth and resurrect the deleted
 *  row. The sequence guard makes the newest snapshot always win.
 *
 *  Suite-order notes (single worker, shared e2e.db, alphabetical): this
 *  file sorts AFTER dashboard.spec.ts (whose tests self-clean back to
 *  the 6-row seed but leave Lead enrichment pipeline PAUSED) and BEFORE
 *  session-lifecycle.spec.ts (which only needs Lead present). Hence:
 *  the pause/resume selectors below tolerate either initial status, and
 *  tests (a)/(b) use DIFFERENT victim rows (each deletes its own).
 *
 * The live has no dashboard (D62 — the clone's superset surface; the
 * D59 precedent: fix and document). Distinct from session-lifecycle
 * (401 → redirect) and resilience (abort → retry banner): HERE the
 * row's absence is the truth to mirror.
 */

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();
}

test.describe("client failure-class honesty (Session 23)", () => {
  test("(a) another tab deletes the row → this tab's Pause mirrors the truth (no retry banner, ghost removed, polite announce)", async ({ browser }) => {
    const tabA = await (await browser.newContext()).newPage();
    const tabB = await (await browser.newContext()).newPage();
    await signIn(tabA);
    await signIn(tabB);

    // Tab B deletes the victim through the UI; its own list re-syncs.
    await tabB.getByRole("button", { name: "Delete Onboarding email orchestration" }).click();
    await expect(tabB.getByRole("heading", { name: "Onboarding email orchestration" })).toBeHidden({ timeout: 10_000 });

    // Tab A (stale list) pauses the already-deleted row → the 404 class.
    // (Status-tolerant selector: suite order may leave a row paused.)
    await tabA.getByRole("button", { name: /^(Pause|Resume) Onboarding email orchestration/ }).click();

    // The honest mirror: the ghost row is REMOVED…
    await expect(tabA.getByRole("heading", { name: "Onboarding email orchestration" })).toBeHidden({ timeout: 10_000 });
    // …the polite live region explains (no error banner — the truth caught up)…
    await expect(tabA.getByRole("status")).toContainText("no longer in the workspace", { timeout: 10_000 });
    // …and the retry banner NEVER renders for the 404 class. (Filtered by
    // text: Next's route announcer is itself a role=alert element carrying
    // the page title — the session-lifecycle pin (d) pattern.)
    await expect(tabA.getByRole("alert").filter({ hasText: /try again/i })).toHaveCount(0);
    // The surviving rows are untouched (5 of the 6 seeded remain).
    await expect(tabA.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();
    await expect(tabA.getByText("5 total")).toBeVisible();
    await tabA.context().close();
    await tabB.context().close();
  });

  test("(b) another tab deletes the row → this tab's Delete is idempotent success (no banner, ghost removed, already-removed announce)", async ({ browser }) => {
    const tabA = await (await browser.newContext()).newPage();
    const tabB = await (await browser.newContext()).newPage();
    await signIn(tabA);
    await signIn(tabB);

    // A DIFFERENT victim than (a) — that test already deleted its own.
    const victim = "Content repurposing engine";
    await tabB.getByRole("button", { name: `Delete ${victim}` }).click();
    await expect(tabB.getByRole("heading", { name: victim })).toBeHidden({ timeout: 10_000 });

    // Tab A deletes the already-deleted row → 404 → idempotent success.
    await tabA.getByRole("button", { name: `Delete ${victim}` }).click();

    await expect(tabA.getByRole("heading", { name: victim })).toBeHidden({ timeout: 10_000 });
    await expect(tabA.getByRole("status")).toContainText("already removed", { timeout: 10_000 });
    await expect(tabA.getByRole("alert").filter({ hasText: /try again/i })).toHaveCount(0);
    await expect(tabA.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();
    await tabA.context().close();
    await tabB.context().close();
  });

  test("(c) concurrent Pause+Delete with a delayed stale GET → the deleted row stays gone (no resurrection)", async ({ page }) => {
    await signIn(page);

    // Delay the FIRST post-mutation /api/workflows GET by 1200ms. Its
    // server-side snapshot is taken BEFORE the DELETE commits (the stale
    // one). The page's initial list comes from SSR props — the first XHR
    // GET is refresh #1 after the Pause.
    let getCounter = 0;
    await page.route("**/api/workflows", async (route) => {
      if (route.request().method() === "GET") {
        getCounter++;
        if (getCounter === 1) {
          const response = await route.fetch(); // snapshot taken NOW (pre-delete)
          await page.waitForTimeout(1200); // deliver it LATE
          return route.fulfill({ response });
        }
      }
      return route.continue();
    });

    // Toggle row A (its refresh GET is held by the route), then — while
    // that response is still in flight — delete row B (busyId only
    // guards the same row). Status-tolerant selector (suite order may
    // leave Lead paused; either way the toggle commits a mutation).
    await page.getByRole("button", { name: /^(Pause|Resume) Lead enrichment pipeline/ }).click();
    await page.waitForTimeout(300); // PATCH resolved; the stale GET is held
    await page.getByRole("button", { name: "Delete Weekly investor update digest" }).click();
    await page.waitForTimeout(400); // DELETE + the fresh GET landed: B gone

    // The truth first holds…
    await expect(page.getByRole("heading", { name: "Weekly investor update digest" })).toBeHidden();

    // …and after the delayed stale snapshot lands, it STILL holds (the
    // pre-fix resurrection: the stale response overwrote the truth).
    await page.waitForTimeout(1400);
    await expect(page.getByRole("heading", { name: "Weekly investor update digest" })).toBeHidden();
    // Row A itself survives (status-agnostic — the point is B's absence).
    await expect(page.getByRole("heading", { name: "Lead enrichment pipeline" })).toBeVisible();
    await expect(page.getByText("3 total")).toBeVisible();
  });
});
