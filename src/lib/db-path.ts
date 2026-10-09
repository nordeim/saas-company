import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// SQLite URL resolution (v2.3, extracted from db.ts into a tested seam)
//
// Contract (pinned by tests/db-path.test.ts and documented in .env.example):
// a RELATIVE `file:` URL resolves against the first "anchor" directory that
// contains prisma/schema.prisma — exactly like the Prisma CLI, which anchors
// relative `file:` URLs against the schema file. `file:../db/custom.db`
// therefore points at <repo>/db/custom.db for `next dev`, `next build` and
// the standalone server alike, regardless of the process working directory.
//
// Anchor order (candidateRoots):
//   1. this module's own repo root (src/lib → ../../) — covers next dev
//      and next build, which execute modules from source. Guarded: bundlers
//      may rewrite or drop import.meta (the standalone build), in which
//      case this anchor is simply skipped.
//   2. the standalone build's repo root — Next's standalone server.js runs
//      `process.chdir(__dirname)` into <repo>/.next/standalone BEFORE any
//      module executes, and the file tracer copies prisma/schema.prisma
//      into that folder, so the plain CWD rule would resolve a relative
//      `file:` URL against the BUILD OUTPUT. When the CWD is that in-repo
//      standalone dir (detected by standaloneRepoRoot below), the real repo
//      two levels up takes precedence.
//   3. process.cwd() — the pre-v2.3 rule, kept as the fallback (a standalone
//      copy deployed elsewhere owns its own CWD; DEPLOYMENT.md §4 tells
//      production to use an absolute file: URL anyway).
//
// Absolute file: URLs (POSIX or Windows drive letters) and non-SQLite URLs
// (e.g. PostgreSQL in a hosted deploy) pass through untouched.
// ---------------------------------------------------------------------------

/** The documented fresh-checkout default: <repo>/db/custom.db. */
const DEFAULT_RELATIVE_DB = "../db/custom.db";

/**
 * Pure resolution rule. `anchors` are candidate repo roots, searched in
 * order for one that contains prisma/schema.prisma; the first hit wins, and
 * when none matches the LAST anchor is used (CWD-compatibility fallback).
 */
export function resolveDatabaseUrl(envUrl: string | undefined, anchors: string[]): string {
  const url = envUrl?.trim();
  const schemaRoot =
    anchors.find((root) => existsSync(path.join(root, "prisma", "schema.prisma"))) ??
    anchors[anchors.length - 1] ??
    process.cwd();

  if (!url) {
    return `file:${path.resolve(schemaRoot, "prisma", DEFAULT_RELATIVE_DB)}`;
  }
  if (/^file:/i.test(url)) {
    const raw = url.replace(/^file:/i, "");
    // Windows drive letters (file:C:\...) are absolute too.
    if (path.isAbsolute(raw) || /^[A-Za-z]:[\\/]/.test(raw)) return `file:${raw}`;
    return `file:${path.resolve(schemaRoot, "prisma", raw)}`;
  }
  return url;
}

/**
 * Detect "the CWD is a Next standalone build folder inside its repo" and
 * return the repo root (two levels up). Pure + fixture-testable: takes the
 * directory to inspect, uses real existence checks only.
 *
 * Signals: the dir is literally named "standalone", carries the standalone
 * server.js, AND the grandparent owns prisma/schema.prisma — a standalone
 * copy deployed elsewhere (no repo above it) does NOT match and keeps the
 * plain CWD rule.
 */
export function standaloneRepoRoot(dir: string): string | null {
  if (path.basename(dir) !== "standalone") return null;
  if (!existsSync(path.join(dir, "server.js"))) return null;
  if (!existsSync(path.join(dir, "..", "..", "prisma", "schema.prisma"))) return null;
  return path.resolve(dir, "..", "..");
}

/** Candidate repo roots for the running process (see module comment). */
export function candidateRoots(): string[] {
  const roots: string[] = [];
  // 1. The standalone repo root comes FIRST: the bundled module's
  //    import.meta.url is rewritten into <standalone>/src/lib/db-path.ts —
  //    a virtual path that exists only in the chunk map — so the module
  //    anchor cannot be trusted in that context and must not outrank the
  //    detector.
  const standaloneRoot = standaloneRepoRoot(process.cwd());
  if (standaloneRoot) roots.push(standaloneRoot);
  try {
    // 2. This module's own repo root (src/lib → ../../) — covers next dev
    //    and next build, which execute modules from source. Validated by
    //    the source file existing on disk: the standalone runtime's virtual
    //    mapping fails this check and is skipped.
    const self = new URL(import.meta.url).pathname;
    const here = path.dirname(self);
    if (here && existsSync(self)) roots.push(path.resolve(here, "..", ".."));
  } catch {
    // import.meta unavailable in this context — remaining anchors apply.
  }
  // 3. The process CWD — the pre-v2.3 rule, kept as the fallback.
  roots.push(process.cwd());
  return roots;
}

/** Resolve DATABASE_URL for the running process (the db.ts entry point). */
export function resolveProcessDatabaseUrl(): string {
  return resolveDatabaseUrl(process.env.DATABASE_URL, candidateRoots());
}

// ---------------------------------------------------------------------------
// Session 24 R3 — the CLI/seed URL selection seams.
//
// The defect: `npm run db:push` / `npm run db:seed` relied on Prisma's env
// AUTO-load, whose search walks UP the directory tree — a PARENT-directory
// .env silently WINS over the repo's own .env (probed in vivo: the seed
// reported success but wrote the schema + data OUTSIDE the repo while the
// app — through THIS module's resolution — opened <repo>/db/custom.db, a
// 0-byte file; login answered P2021 INTERNAL_ERROR). The README's
// first-run story silently produced an app that cannot log in. The smoke
// and e2e suites were immune because they PIN DATABASE_URL per command
// (the gotcha-1 discipline); package.json's own db:* scripts did not.
//
// The fix: the deterministic precedence below, every value resolved
// through the SAME anchor logic the app uses (one string, one file):
//   1. an explicit process env DATABASE_URL (the smoke/e2e discipline —
//      operator intent; gotcha-1 semantics preserved: absolute URLs pass
//      through untouched);
//   2. the REPO's own .env value, parsed directly (never the parent
//      walk-up);
//   3. the documented default (<repo>/db/custom.db).
// Non-SQLite URLs (the PostgreSQL swap story) pass through untouched at
// every level.
// ---------------------------------------------------------------------------

/** Parse one KEY=VALUE declaration out of .env-style content.
 * Quoted values shed their quotes; commented-out declarations (# KEY=)
 * and absent keys yield undefined. Pure (pinned by tests/db-path.test.ts). */
export function parseEnvValue(content: string, key: string): string | undefined {
  const pattern = new RegExp(`^\\s*${key}\\s*=\\s*(.*)$`, "m");
  const match = content.match(pattern);
  if (!match) return undefined;
  let value = match[1].trim();
  // Inline comments on unquoted values (dotenv-style: only when preceded
  // by whitespace) are stripped; quoted values keep everything.
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
    value = value.slice(1, -1);
  } else if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) {
    value = value.slice(1, -1);
  } else {
    value = value.split(/\s+#/)[0].trim();
  }
  return value === "" ? undefined : value;
}

/** The deterministic seed/push precedence (pure; see the block comment).
 * `repoEnvContent` is the REPO's own .env file content — a parent
 * directory's .env is never consulted (the trap closed by construction). */
export function selectDatabaseUrl(
  processEnvUrl: string | undefined,
  repoEnvContent: string | undefined,
  anchors: string[],
): string {
  const fromProcess = processEnvUrl?.trim() || undefined;
  const fromRepoEnv = repoEnvContent !== undefined ? parseEnvValue(repoEnvContent, "DATABASE_URL") : undefined;
  return resolveDatabaseUrl(fromProcess ?? fromRepoEnv, anchors);
}

/** The IO wrapper: the repo's own .env (the first candidate anchor that
 * owns prisma/schema.prisma) + the process env, through selectDatabaseUrl.
 * Used by prisma/seed.ts (which sets process.env.DATABASE_URL BEFORE
 * constructing the client — a pre-set process env is exactly what
 * Prisma's auto-load never overrides) and scripts/prisma-with-db.ts. */
export function resolveCliDatabaseUrl(): string {
  const anchors = candidateRoots();
  const repoRoot =
    anchors.find((root) => existsSync(path.join(root, "prisma", "schema.prisma"))) ?? anchors[0] ?? process.cwd();
  let repoEnvContent: string | undefined;
  try {
    repoEnvContent = readFileSync(path.join(repoRoot, ".env"), "utf8");
  } catch {
    // No repo .env (e.g. a fresh checkout before `cp .env.example .env`)
    // — the documented default applies.
  }
  return selectDatabaseUrl(process.env.DATABASE_URL, repoEnvContent, anchors);
}
