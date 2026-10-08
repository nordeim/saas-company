import { writeSync } from "node:fs";

/**
 * Next.js instrumentation hook — the server's boot-time diagnostics seam.
 *
 * Session 18 F2 (the silent insecure fallback): `secret()` in
 * `src/lib/auth.ts` falls back to the `DEV_SECRET` constant — PUBLIC in
 * this repository — whenever AUTH_SECRET is unset. A production
 * deployment that forgets the env var signs every session token with a
 * forgeable key, and until this hook the warning existed only in docs
 * (README/§8.2) with ZERO runtime signal.
 *
 * Three Next.js-16 discoveries shape this implementation (all verified
 * empirically against next@16.4.0's standalone server):
 *
 * 1. **Route-module console output never reaches the log.** The first
 *    attempt warned from module-init in `auth.ts` via `console.error`:
 *    the expression executed (the login route answered), the log stayed
 *    empty — the production server captures console methods into its
 *    internal logging pipeline.
 * 2. **`process.stderr.write` is captured too.** The second attempt
 *    moved the warning into this official boot hook writing to
 *    `process.stderr` — `register()` provably RAN (a diagnostic
 *    appendFileSync fired), and the log still stayed empty.
 * 3. **The async module loader races at boot.** A dynamic
 *    `await import("node:fs")` compiles to the chunk-loader promise
 *    (`e.A(...)`) which hung on one boot and resolved on the next —
 *    a boot diagnostic cannot depend on it. The fix: the STATIC
 *    top-level import above (the bundler resolves node:fs
 *    synchronously — no loader, no race) writing DIRECTLY to file
 *    descriptor 2 (`writeSync(2, …)`), below every stream object the
 *    runtime can replace. The write was verified landing in the
 *    standalone server's redirected log (206 bytes, exactly the
 *    message).
 *
 * The app ships NO middleware and no edge surface (middleware-manifest
 * empty), so the static node:fs import is build-safe; if edge surfaces
 * are ever added, split this per the Next docs pattern (a runtime check
 * + a dynamic import of a nodejs-only module).
 *
 * Dev and test stay silent by the NODE_ENV guard; the smoke/e2e servers
 * set AUTH_SECRET in their boot lines (verified — no suite log noise).
 */

/** The warning text (pure — pinned by the unit suite). */
export function authSecretWarningMessage(): string {
  return (
    "[auth] AUTH_SECRET is not set in production — session tokens are " +
    "signed with the PUBLIC dev constant from this repository and are " +
    "FORGEABLE. Set AUTH_SECRET (openssl rand -hex 32) and restart the " +
    "server.\n"
  );
}

export async function register(): Promise<void> {
  // Documentation-of-intent guard: this app has no edge runtime today;
  // writeSync would be unreachable there regardless.
  if (process.env.NEXT_RUNTIME === "edge") return;
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.AUTH_SECRET?.trim()) return;
  writeSync(2, authSecretWarningMessage());
}
