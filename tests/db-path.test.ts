import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resolveDatabaseUrl, standaloneRepoRoot } from "@/lib/db-path";

// The db-path contract (docs/parity-remediation-v2.3.md WS-1):
// a RELATIVE `file:` URL resolves against the first "anchor" directory that
// contains prisma/schema.prisma — exactly like the Prisma CLI resolves
// against the schema file — so `file:../db/custom.db` points at
// <anchor>/db/custom.db regardless of the process working directory.
// Absolute file: URLs (POSIX + Windows drive letters) and non-SQLite URLs
// pass through untouched; a missing/blank env value falls back to the
// documented default <anchor>/db/custom.db.

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

describe("resolveDatabaseUrl", () => {
  let repo: string;
  let other: string;

  beforeAll(() => {
    // A fake repo layout: <repo>/prisma/schema.prisma + <repo>/db/
    repo = mkdtempSync(path.join(tmpdir(), "dbpath-repo-"));
    mkdirSync(path.join(repo, "prisma"));
    writeFileSync(path.join(repo, "prisma", "schema.prisma"), "datasource db { provider = \"sqlite\" }");
    mkdirSync(path.join(repo, "db"));
    // A directory with no schema (e.g. a random CWD).
    other = mkdtempSync(path.join(tmpdir(), "dbpath-other-"));
  });

  afterAll(() => {
    rmSync(repo, { recursive: true, force: true });
    rmSync(other, { recursive: true, force: true });
  });

  it("resolves a relative file: URL against the schema anchor's prisma/ dir", () => {
    const out = resolveDatabaseUrl("file:../db/custom.db", [repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });

  it("picks the FIRST anchor that contains prisma/schema.prisma", () => {
    const out = resolveDatabaseUrl("file:../db/custom.db", [other, repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });

  it("falls back to the last anchor when no anchor carries a schema", () => {
    const out = resolveDatabaseUrl("file:../db/custom.db", [other]);
    // Behaves like today's CWD rule: resolve against <anchor>/prisma.
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(other, "prisma", "..", "db", "custom.db"))}`);
  });

  it("defaults to <anchor>/db/custom.db when the env value is missing", () => {
    const out = resolveDatabaseUrl(undefined, [repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });

  it("defaults to <anchor>/db/custom.db when the env value is blank/whitespace", () => {
    expect(toPosix(resolveDatabaseUrl("   ", [repo]))).toBe(
      `file:${toPosix(path.join(repo, "db", "custom.db"))}`,
    );
  });

  it("passes absolute POSIX file: URLs through untouched", () => {
    expect(resolveDatabaseUrl("file:/var/data/prod.db", [repo])).toBe("file:/var/data/prod.db");
  });

  it("passes absolute Windows drive-letter file: URLs through untouched", () => {
    expect(resolveDatabaseUrl("file:C:\\data\\prod.db", [repo])).toBe("file:C:\\data\\prod.db");
  });

  it("passes non-SQLite URLs through untouched", () => {
    const pg = "postgresql://user:pass@localhost:5432/app";
    expect(resolveDatabaseUrl(pg, [repo])).toBe(pg);
  });

  it("trims surrounding whitespace from the env value", () => {
    const out = resolveDatabaseUrl("  file:../db/custom.db  ", [repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });

  it("treats file:./dev.db as relative to the schema anchor's prisma/ dir", () => {
    const out = resolveDatabaseUrl("file:./dev.db", [repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "prisma", "dev.db"))}`);
  });
});

describe("standaloneRepoRoot (the Next standalone chdir trap)", () => {
  // The standalone server.js runs process.chdir(__dirname) into
  // <repo>/.next/standalone before any module executes, and the tracer
  // copies prisma/schema.prisma into that folder — the plain CWD rule would
  // resolve against the BUILD OUTPUT. The detector must recognize that
  // folder and return the real repo two levels up.
  let repo: string;
  let standalone: string;
  let deployed: string;

  beforeAll(() => {
    repo = mkdtempSync(path.join(tmpdir(), "dbpath-std-repo-"));
    mkdirSync(path.join(repo, "prisma"));
    writeFileSync(path.join(repo, "prisma", "schema.prisma"), "// x");
    standalone = path.join(repo, ".next", "standalone");
    mkdirSync(standalone, { recursive: true });
    writeFileSync(path.join(standalone, "server.js"), "// next standalone");
    mkdirSync(path.join(standalone, "prisma"));
    writeFileSync(path.join(standalone, "prisma", "schema.prisma"), "// traced copy");
    // A standalone copy deployed elsewhere: no repo above it.
    deployed = mkdtempSync(path.join(tmpdir(), "dbpath-deployed-"));
    mkdirSync(path.join(deployed, ".next", "standalone"), { recursive: true });
  });

  afterAll(() => {
    rmSync(repo, { recursive: true, force: true });
    rmSync(deployed, { recursive: true, force: true });
  });

  it("recognizes the in-repo standalone dir and returns the repo root", () => {
    expect(standaloneRepoRoot(standalone)).toBe(repo);
  });

  it("ignores a standalone dir with no repo above it (deployed copy)", () => {
    expect(standaloneRepoRoot(path.join(deployed, ".next", "standalone"))).toBeNull();
  });

  it("ignores plain directories that merely contain prisma/schema.prisma", () => {
    expect(standaloneRepoRoot(repo)).toBeNull();
    expect(standaloneRepoRoot("/tmp")).toBeNull();
  });

  it("resolution prefers the repo anchor over the standalone cwd copy", () => {
    // In the standalone context candidateRoots() yields the chunk-derived
    // anchor (no schema — skipped), then the detector's REPO root, then the
    // chdir'd standalone CWD. A relative URL resolved with the standalone
    // CWD would land in <standalone>/db (no such dir → SQLite error 14);
    // with this order it must land in <repo>/db.
    const out = resolveDatabaseUrl("file:../db/custom.db", [repo, standalone]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });
});

describe("anchor validation", () => {
  it("the repo anchor layout used by the tests actually exists", () => {
    // Sanity for the fixture itself — guards against a broken test setup
    // silently testing the fallback path instead.
    const repo = mkdtempSync(path.join(tmpdir(), "dbpath-check-"));
    try {
      mkdirSync(path.join(repo, "prisma"));
      writeFileSync(path.join(repo, "prisma", "schema.prisma"), "// x");
      expect(existsSync(path.join(repo, "prisma", "schema.prisma"))).toBe(true);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// Session 24 R3 — the CLI/seed URL selection seams. `npm run db:push` /
// `npm run db:seed` used to rely on Prisma's env AUTO-load, whose search
// walks UP the directory tree — a PARENT-directory .env silently WINS over
// the repo's own .env (probed in vivo: the seed wrote the schema + data
// OUTSIDE the repo while the app opened <repo>/db/custom.db — a 0-byte
// file — and login answered P2021 INTERNAL_ERROR). The seams below make
// the selection deterministic: explicit process env (the smoke/e2e
// discipline) → the REPO's own .env value (parsed directly — never the
// parent walk-up) → the documented default; every value resolves through
// the anchor logic; absolute file: and non-SQLite URLs pass through
// untouched (the PostgreSQL swap story is preserved).
// ---------------------------------------------------------------------------

describe("parseEnvValue", () => {
  it("parses a quoted value (the .env.example spelling) and an unquoted one", async () => {
    const { parseEnvValue } = await import("@/lib/db-path");
    expect(parseEnvValue('DATABASE_URL="file:../db/custom.db"\n', "DATABASE_URL")).toBe("file:../db/custom.db");
    expect(parseEnvValue("DATABASE_URL=file:../db/other.db\n", "DATABASE_URL")).toBe("file:../db/other.db");
  });

  it("ignores commented-out declarations and unknown keys", async () => {
    const { parseEnvValue } = await import("@/lib/db-path");
    const content = [
      "# DATABASE_URL=\"file:../db/parent-trap.db\"",
      "AUTH_SECRET=abc123",
      "DATABASE_URL=file:../db/custom.db",
    ].join("\n");
    // The commented line must NOT win; the real declaration does.
    expect(parseEnvValue(content, "DATABASE_URL")).toBe("file:../db/custom.db");
    expect(parseEnvValue(content, "MISSING_KEY")).toBeUndefined();
  });

  it("returns undefined when the key is absent entirely (CRLF-safe parsing)", async () => {
    const { parseEnvValue } = await import("@/lib/db-path");
    expect(parseEnvValue("AUTH_SECRET=abc\r\nOTHER=x\r\n", "DATABASE_URL")).toBeUndefined();
    // CRLF declarations still parse.
    expect(parseEnvValue("DATABASE_URL=\"file:../db/x.db\"\r\n", "DATABASE_URL")).toBe("file:../db/x.db");
  });
});

describe("selectDatabaseUrl (the seed/push precedence)", () => {
  let repo: string;
  let other: string;

  beforeAll(() => {
    repo = mkdtempSync(path.join(tmpdir(), "dbpath-select-"));
    mkdirSync(path.join(repo, "prisma"));
    writeFileSync(path.join(repo, "prisma", "schema.prisma"), "datasource db { provider = \"sqlite\" }");
    other = mkdtempSync(path.join(tmpdir(), "dbpath-select-other-"));
  });

  afterAll(() => {
    rmSync(repo, { recursive: true, force: true });
    rmSync(other, { recursive: true, force: true });
  });

  it("the explicit process env WINS over the repo .env — absolute and non-SQLite URLs pass through untouched", async () => {
    const { selectDatabaseUrl } = await import("@/lib/db-path");
    // The smoke/e2e discipline: an explicitly-set process env (even a
    // relative one) beats the repo .env, resolved through the anchors.
    const out = selectDatabaseUrl("file:../db/smoke.db", 'DATABASE_URL="file:../db/custom.db"', [repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "smoke.db"))}`);

    // Absolute file: URLs pass through EXACTLY (operator intent — the
    // gotcha-1 semantics preserved for explicitly-set process envs).
    expect(selectDatabaseUrl("file:/etc/prod.db", 'DATABASE_URL="file:../db/custom.db"', [repo])).toBe("file:/etc/prod.db");
    // The PostgreSQL swap story survives every precedence level.
    expect(selectDatabaseUrl("postgresql://u:p@h:5432/db", 'DATABASE_URL="file:../db/custom.db"', [repo])).toBe("postgresql://u:p@h:5432/db");
    expect(selectDatabaseUrl(undefined, "DATABASE_URL=postgresql://u:p@h:5432/db", [repo])).toBe("postgresql://u:p@h:5432/db");
  });

  it("with no process env, the REPO's own .env value resolves through the anchor — and the documented default applies when it is absent", async () => {
    const { selectDatabaseUrl } = await import("@/lib/db-path");
    // The parent-.env trap is closed BY CONSTRUCTION: the selection sees
    // ONLY the passed repo .env content — a parent directory's .env is
    // never consulted.
    const out = selectDatabaseUrl(undefined, 'DATABASE_URL="file:../db/custom.db"\n', [repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);

    // No process env + no repo .env declaration → the documented default.
    const def = selectDatabaseUrl(undefined, "AUTH_SECRET=abc\n", [repo]);
    expect(toPosix(def)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
    const def2 = selectDatabaseUrl(undefined, undefined, [other]);
    expect(toPosix(def2)).toBe(`file:${toPosix(path.join(other, "prisma", "..", "db", "custom.db"))}`);
  });
});
