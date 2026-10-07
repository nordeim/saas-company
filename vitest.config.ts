import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit-test layer for the pure domain seams of THIS app (pricing math,
// rate limiting, input validation, workflow template/sanitizer, auth crypto,
// content integrity, and the SQLite URL resolution). Browser/E2E coverage
// lives in tests/e2e/*.spec.ts (Playwright — never picked up by this config,
// which matches *.test.ts only) plus scripts/smoke-test.sh.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
