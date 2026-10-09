import { defineConfig, devices } from "@playwright/test";

// E2E layer: boots the PRODUCTION standalone server on an isolated port
// with its own scratch database (db/e2e.db, schema-pushed + seeded by the
// global setup), then drives the real UI in Chromium.
//
// Prerequisites: `npm run build` (the standalone server must exist).
// Run with: `npm run test:e2e`.
//
// The unit layer stays in Vitest (vitest.config.ts matches *.test.ts only,
// so these *.spec.ts files are never picked up twice).
//
// The webServer pins its own DATABASE_URL — a shell-exported absolute value
// would otherwise boot it against a foreign database (the v2.14 lesson).

const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;
const E2E_DATABASE_URL = "file:../db/e2e.db";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1, // one worker: the specs share a single seeded SQLite file
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      testIgnore: /.*/, // reserved for future mobile-device specs; the
      // mobile-navigation suite drives its own 390×844 contexts.
    },
  ],
  globalSetup: "./tests/e2e/global-setup.ts",
  webServer: {
    command: "node .next/standalone/server.js",
    url: `${BASE_URL}/api/health`,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: "production",
      DATABASE_URL: E2E_DATABASE_URL,
      AUTH_SECRET: "playwright-e2e-session-secret",
      // Session 11: the suite's own UI sign-ins (auth + dashboard +
      // mockup-motion-parity + login-states ≈ 10 POSTs) share one IP and
      // one process with the in-memory auth limiter — raise the budget so
      // the razor-edge default (exactly 10) can't 429 mid-suite.
      // Session 28: the suite GREW to ~45 auth flows per run (38 signIn
      // calls + the register round-trips that share login's bucket, the
      // session23–session28 specs each signing in) — the 50 pin sat at
      // the razor edge AGAIN, and the first Session-28 run 429'd the
      // last files alphabetically (session27/session28 — probed: the
      // isolated re-run on a fresh server passed 3/3). 100 covers two
      // consecutive full runs on a reused server with 2x margin — the
      // generous-ceiling discipline applied to the limiter budget.
      AUTH_RATE_LIMIT_MAX: "100",
      // Session 16 F1: the LLM composer's per-user ceiling gets the same
      // insurance — the suite's ~2 real generate POSTs sit far below the
      // default 10, but a reused server across repeated local runs could
      // climb toward the ceiling; the pin makes the suite immune by
      // construction (the new 429-degrade pin route-FULFILLS its 429 and
      // never reaches the server at all).
      GENERATE_RATE_LIMIT_MAX: "50",
      // Session 25 R3: the workflow-creation ceiling gets the same
      // insurance — the session25-chart spec mints 6 rows through the
      // create API per run, and a reused server across repeated local
      // runs must not climb toward the default 30 budget mid-suite (the
      // existing 429 pins are route-fulfilled and never reach the
      // server — no pin conflicts).
      WORKFLOW_RATE_LIMIT_MAX: "50",
    } as Record<string, string>,
  },
});
