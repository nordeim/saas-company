/**
 * Session 24 R3 — the deterministic Prisma CLI wrapper.
 *
 * `prisma db push` (and migrate/reset) used to rely on Prisma's env
 * AUTO-load, whose search walks UP the directory tree — a PARENT-directory
 * .env could silently win over the repo's own .env and redirect the
 * schema (and the seed's data) OUTSIDE the repo while the running app
 * opened the in-repo database (probed in vivo: login answered P2021
 * INTERNAL_ERROR against a 0-byte <repo>/db/custom.db).
 *
 * This wrapper resolves DATABASE_URL through the SAME tested seam the app
 * uses (src/lib/db-path.ts: explicit process env → the repo's own .env →
 * the documented default; absolute file: and non-SQLite URLs pass through
 * untouched — the PostgreSQL swap story is preserved) and hands it to the
 * CLI as an EXPLICIT process env — the one thing Prisma's auto-load never
 * overrides (the smoke/e2e discipline, now kept by the repo's own npm
 * scripts).
 *
 * Routed from package.json:
 *   db:push    → tsx scripts/prisma-with-db.ts db push --accept-data-loss
 *   db:migrate → tsx scripts/prisma-with-db.ts migrate dev
 *   db:reset   → tsx scripts/prisma-with-db.ts migrate reset
 *
 * stdio is inherited, so `prisma migrate dev`'s interactive prompts keep
 * working.
 */
import { spawnSync } from "node:child_process";
import { resolveCliDatabaseUrl } from "../src/lib/db-path";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("usage: tsx scripts/prisma-with-db.ts <prisma subcommand and args>  (e.g. db push --skip-generate)");
  process.exit(2);
}

const url = resolveCliDatabaseUrl();
// Observable placement (the seed prints the same resolution as
// `seed-target:` — the two must always agree).
console.log(`[db] DATABASE_URL=${url}`);

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});

process.exit(result.status ?? 1);
