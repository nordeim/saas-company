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
      AUTH_RATE_LIMIT_MAX: "50",
    } as Record<string, string>,
  },
});
