# Remediation Plan — Session 19 (2026-10-08)

**Scope:** Fix the issues, bugs and gaps found by the Session 19
crash-path-honesty audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** the standing drift battery first (word parity **1.0000
on all 8 routes** — the reference is UNCHANGED since Session 18; the
mobile-nav real-touch paired probe re-run: the clone's panel
byte-identical — the same seven rows (Features / How It Works / Pricing /
Testimonials / FAQ / Log In / Get Started), all exactly 44px, opened by a
REAL tap while the live's burger remains pointer-blocked (D32) — **no
Tailwind v4 bug**; the live LOGIN re-verified with the operator
credentials: sign-in redirects to `/` with the navbar UNCHANGED and
`/dashboard` renders the SPA 404 even authenticated — D62 holds). Then the
Session-19 NEW audit surfaces — layers no prior session systematically
surveyed:

1. **The crash-path envelope layer (the invariant vs the wire):** the
   architecture invariant says "every API route returns `{ ok: true,
   data }` or `{ ok: false, error: { code, message } }` … No route returns
   bare JSON" — but that was only ever surveyed on HANDLED paths. The
   first systematic survey of what the wire carries when a route's
   dependencies CRASH: a production server booted with an UNWRITABLE
   `DATABASE_URL` (`file:/dev/null/unwritable-s19/custom.db` —
   PID-independent, ENOTDIR by construction) and every endpoint probed
   with a catalog (status + content-type + body). Result: **7 endpoints
   answer a BARE `500` with an EMPTY body and NO content-type** —
   login, register, newsletter, demo, `auth/me` (with a session),
   workflows GET and workflows POST (with a session; the `[id]` family
   shares the exact structure). `GET /dashboard` with a session answers
   Next's built-in `__next_error__` HTML (see F2). Only health (the S18
   fix), the anonymous 401 paths, and the anonymous `auth/me` null-path
   answer envelopes. **F1.**
   The catalog also captured the operator-sight fact that shapes the
   fix: the server log DOES carry the stack (Next.js logs unhandled
   route errors — the Prisma `Error code 14` stack with a digest landed
   in `/tmp/s19-crash.log`) — so a catch-and-envelope fix REMOVES that
   stack unless the fix restores it itself.
2. **The server-crash page layer (the S13 goal's uncovered half):**
   `error.tsx` (the branded render-fault boundary) covers CLIENT-render
   crashes — pinned by the S13 spec via a contract-violating API row.
   But a SERVER-component crash (the dashboard page's own DB queries
   failing) bypasses it in production: the standalone server answers
   Next's minimal `__next_error__` document (9.6KB, the page's `<title>`
   but ZERO branded content — no "Something went wrong", none of the
   boundary's dark canvas). The S13 goal statement ("the app loses its
   identity exactly when the user is already having a bad day") is
   violated by exactly the worst-day scenario: the workspace is down.
   **F2.**
3. **The dependency-currency layer** (suggested by the Session-18
   retrospective): `npm audit` re-run — **exactly the single documented
   F10 residual chain** (braces GHSA-vfj7-8cjw-p6xm through
   eslint-config-next, lint-toolchain-only; no NEW advisories since
   Session 17). `npm outdated` — every outdated row is a MAJOR jump
   (prisma 6→7/8, eslint 9→10, typescript 5.9→7, lucide-react 0.5→1.53)
   except `@playwright/test` 1.63→1.64 (in-range minor). Adjudicated
   CLEAN: the gate is green on the pinned set, the overrides are
   load-bearing (gotcha 9), and mid-clone major churn trades measured
   stability for nothing measured back.

Also audited and found CLEAN or ADJUDICATED (non-findings, this
session's evidence): **the security-header layer** (the S9 F6 set —
nosniff / DENY / strict-origin-when-cross-origin / HSTS — re-verified in
`next.config.ts`; no CSP is the documented decision), **the session-TTL
semantics** (7-day token, expiry re-validated per request in
`parseSessionToken`, `timingSafeEqual` on the HMAC), **the logout CSRF
surface** (POST-only — a cross-origin GET/img cannot log a user out),
**the client crash half** (`apiFetch` + `res.json().catch(() => null)` +
the S13 shape-check — a malformed or empty 500 body already degrades to
the banner, so the F1 fix only upgrades the information it receives),
**the login page's DB independence** (cookie-parse only — F2 is
dashboard-only), **npm audit** (above), and **D62 + the drift battery**
(re-verified this session).

## The fixes (TDD-first)

### R1 — the crash-path envelope (F1)

A single wrapper at the existing seam, `src/lib/api.ts`:

```ts
export function apiRoute(handler: () => Promise<NextResponse>) {
  return handler().catch((err: unknown) => {
    const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
    try { writeSync(2, `[api:unhandled] ${detail}\n`); } catch { /* never throw from logging */ }
    return fail("INTERNAL_ERROR", "Something went wrong on our side. Please try again.", 500);
  });
}
```

Design decisions, each load-bearing:

- **The wrapper RESTORES the operator's stack** via the S18-proven fd-2
  seam (`writeSync(2, …)` from a STATIC `node:fs` import — route-module
  `console.error` and `process.stderr.write` are both captured by the
  Next.js 16 runtime, gotcha 32). Catching the error otherwise REMOVES
  Next's own error log line (it only logs UNhandled rejections) — the
  pre-fix stack sight, verified present in the catalog, is preserved
  byte-for-byte in kind.
- **Classification is untouched** (the S17 discipline: "the route must
  not swallow what it cannot classify"): the register route's P2002 →
  409 catch, the 400/401/403/404/429 envelope paths — all fire INSIDE
  the handler and pass through the wrapper verbatim. The wrapper only
  formats what ESCAPES. Unit pin: a handled `fail()` passes through
  byte-identical (status + code).
- **The message is generic** (never leak Prisma paths/SQL to clients);
  the stack goes to fd 2 only. `Cache-Control: private, no-store`
  arrives free via the `fail()` seam (S16 F2).
- **Every exported handler in all 10 route files is wrapped** — the
  invariant becomes true unconditionally, not per-route-whim (health's
  S18 internal try/catch still fires first; its handler never throws).
- **The redirect trap does not apply to routes** (no route handler calls
  `redirect()`; that trap is the R2 page's — see below).

Unit pins (5, new `src/lib/api-route.test.ts`, `node:fs` partially
mocked per the S18 `instrumentation.test.ts` pattern; `./db` and `./auth`
mocked so the import graph stays pure): passthrough-untouched (200 +
body), crash → 500 + `INTERNAL_ERROR` + message, crash → the fd-2
`[api:unhandled]` write fires with the stack (fd === 2), handled-fail
passthrough (400 + original code), crash envelope carries
`Cache-Control: private, no-store`.

Smoke pins (the S17 second-server pattern, extended): a THIRD
mini-server boots on **:3230** with `DATABASE_URL=file:/dev/null/
unwritable-s19/custom.db` and the SAME `AUTH_SECRET="smoke-secret"` as
the main server — so the main server's session cookie (minted during the
auth section) is structurally valid there and the authenticated crash
paths are reachable without minting anything. Pins: health reports
`db:"down"` on the broken server (the S18 field, pinned on the down side
for the first time); login/register/newsletter/demo → 500; login →
`INTERNAL_ERROR` code; login → `application/json` content-type (the
pre-fix state has NO content-type — the bare-body signature); `auth/me`,
workflows GET, workflows POST with the session cookie → 500; the
dashboard page → 200 + the branded fallback (R2) + NOT `__next_error__`.
The server is killed inside its own block (the gotcha-31 boot-and-kill
discipline; :3230 is a FRESH port — no prior cycle ever used it).

RED first: the catalog above IS the RED evidence (bare 500s, empty
bodies); the smoke pins are added against the PRE-fix build and observed
RED (`got ''` / `got 500-with-empty-code`), then GREEN after the fix.

### R2 — the dashboard server-crash branded boundary (F2)

`src/app/dashboard/page.tsx` gains TWO try/catch blocks — one around
`db.user.findUnique`, one around `db.workflow.findMany` — each catch
returning a NEW server-rendered branded view
(`src/components/dashboard/dashboard-unavailable.tsx`): the error.tsx
visual language (dark canvas, `rounded-2xl` card, white-on-black, a
`role="alert"` region), copy "Workspace unavailable — we couldn't reach
your workspace data", a Reload link (`<a href="/dashboard">` — a plain
anchor re-request) and a Go-to-home `Link`. **The `redirect()` calls
stay OUTSIDE the try/catch blocks** — `redirect()` throws a control
error internally (NEXT_REDIRECT) that a naive single try/catch would
SWALLOW, silently converting the authenticated-gate redirect into the
unavailable view (the S14 gate would break). Two narrow blocks, the
redirects between them.

Status stays **200 by design** (the S18 health-probe pattern): the page
answered — with an honest degraded state, not a crash. The DB-down
ALERTING signal is `/api/health`'s `db` field (D87); the UI degrades
gracefully (ADR-004's degrade-not-fail, extended from the API layer to
the page layer). The view is a server component (no client JS needed —
the links are plain anchors); it renders identically in the standalone
build.

Smoke pins on the broken server: `/dashboard` (with the shared session
cookie) → 200, body contains "Workspace unavailable", body does NOT
contain `__next_error__`.

### R3 — the currency adjudication (documented, no code change)

The audit rows above (npm audit unchanged / npm outdated majors-only)
land in this plan's adjudicated-clean section — the operators' evidence
that the currency question was surveyed, not skipped.

### R4 — full gate + paired re-verification + docs

Gate: lint → typecheck → **137 unit** (132 + 5 api-route pins) → build
→ **80 smoke** (66 + 14 broken-DB pins) → **197 e2e** (unchanged — no
client-observable behavior changes; the e2e webServer boots a healthy
DB) — **414 checks** (final counts from the runs). Re-verification: the
crash catalog re-run on the remediated build (every row an envelope);
the standing drift battery re-run (word parity ×8 + the mobile-nav
paired probe — untouched surfaces, the re-run is the regression guard);
the standard 20-shot screenshot set refreshed (VLM spot-checks); docs:
PAD (revision block, ledger **D91–D92**, §7 counts, §11 key files),
AGENTS (counts + **gotcha 33** — the catch-removes-the-stack lesson +
the redirect-inside-try/catch trap), CLAUDE (session-19 context),
README (badge + the crash-envelope row), the SKILL doc **v2.18.0
(lessons 46–47)**, `.env.example` (re-verified — no new vars), this
plan (ticked), the session log `docs/session_33.md`, the repo
`worklog.md`. Commit (Conventional Commits + emoji) + SSH push via
`docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified).

## Validation of this plan against the codebase (pre-execution)

- `src/lib/api.ts` re-read: server-only (imported by exactly the 10
  route files — no client component imports it, so the STATIC
  `node:fs` import is build-safe; the S18 edge-surface audit found no
  middleware/edge surface) ✓
- Route shapes re-read: every handler is a plain `async function` whose
  body `return`s — the `return apiRoute(async () => { … })` wrap is
  mechanical and behavior-preserving on every handled path (the closure
  returns the same NextResponse objects) ✓
- `fail()` re-read: emits the envelope + `Cache-Control: private,
  no-store` + merges optional headers (Retry-After survives) — the
  crash envelope inherits both S15/S16 contracts free ✓
- Existing-pin conflict scan: no unit test imports any route file
  (only `seo.test.ts` matched a loose "route" grep — it tests
  `routeMetadata`); the smoke auth/race/closed-gate/timing pins all
  assert HANDLED paths (pass-through verbatim); the e2e suite boots a
  healthy DB and observes only handled paths — zero pin conflicts ✓
- Timing-pin impact: the wrapper adds one promise hop (~µs) against a
  ~34ms scrypt floor — the S17 login-timing ratio pin is unaffected ✓
- `next/server` import in vitest: the node environment config
  (vitest.config.ts `environment: "node"`) loads it server-side without
  a DOM — `NextResponse.json()` is used by the wrapper's tests only ✓
- Smoke arithmetic: the broken-DB server adds ~14 POST/GET checks — no
  rate-limit budget consumed on the MAIN server (the broken server's
  limiter counts its own POSTs; the auth bucket is per-process, gotcha
  8) ✓
- `/dev/null/unwritable-s19/custom.db`: ENOTDIR by construction (a
  char device is not a directory) — PID-independent, deterministic
  Prisma `Error code 14`, no writes anywhere ✓
- Dockerfile impact: none — the runner boots the same standalone
  artifact; the broken-volume scenario in DEPLOYMENT.md §8 now answers
  envelopes + the branded page instead of bare 500s (docs row only) ✓
- The S14 authenticated `/login` gate: unaffected (the login page does
  not query the DB — re-verified) ✓

## Execution order

R1 (5 unit pins RED → the wrapper → GREEN → wrap the 10 routes →
rebuild → 14 smoke pins RED-observed-against-pre-fix → GREEN) → R2 (the
page catch + the branded view → the dashboard pins GREEN) → full gate →
the crash-catalog + drift re-verification → screenshots → docs (R4) →
commit + SSH push per the runbook.

### ToDo checklist

- [x] R1: the `apiRoute` wrapper + the 10 route wraps + 5 unit pins +
      13 smoke pins; RED observed (the crash catalog — 7 bare-500
      endpoints; the smoke pins RED against the pre-fix build: envelope
      code `got []`, content-type `got []`, /dashboard `got [500]`, no
      branded fallback, `__next_error__` present); GREEN: every crash
      row an envelope (smoke 79/79; the catalog re-run — all 500s carry
      application/json + INTERNAL_ERROR; 9 `[api:unhandled]` stacks in
      the broken server's log)
- [x] R2: the dashboard page's two-block catch + the branded
      `dashboard-unavailable.tsx` + the 200/branded/`__next_error__`-absent
      smoke pins (RED observed together with R1's pins; GREEN — the
      page serves the app's own shell with the "Workspace unavailable"
      card)
- [x] R3: the currency rows (npm audit unchanged — exactly the F10
      chain; npm outdated majors-only except an in-range Playwright
      1.64) — documented adjudication
- [x] Full gate: lint ✓ → typecheck ✓ → 137/137 unit → build ✓ → 79/79
      smoke → 197/197 e2e — **413 checks, no flake**
- [x] Paired re-verification: the crash catalog GREEN on the remediated
      build; word parity 1.0000 ×8; the mobile-nav paired probe
      byte-identical (7 rows × 44px) — after diagnosing TWO tooling
      incidents: a zombie :3070 (the kill+wait trap again) and a
      runner/survey port mismatch (the survey's hardcoded default probed
      the zombie while the runner's fresh server sat unused — resolved
      by passing the base URL explicitly; logged as gotcha 33 + SKILL
      lesson 47)
- [x] Screenshots: the standard 20-shot set refreshed on a fresh
      :3090 boot against the canonical seeded workspace (checksum
      e7f6c011; VLM spot-checks ×5 PASS — after correcting the check
      prompts to the ACTUAL contracts: the dashboard header is the
      Nova.AI/Dashboard bar, not a "Welcome back" greeting)
- [x] Docs: PAD (revision block, D91–D92, §7 counts, §11), AGENTS
      (gotcha 33 + counts + the envelope invariant line), CLAUDE
      (session-19 context + checklist counts), README (413 badge +
      crash-envelope + workspace-unavailable troubleshooting rows),
      SKILL v2.18.0 (lessons 46–47), this plan ticked, session log
      `docs/session_33.md`, repo `worklog.md` — `.env.example`
      re-verified in sync (no new vars)
- [ ] Commit to `main` + SSH push via `docs/ssh_git_wrapper_v3.py`
      (wrapper-verified, operator key destroyed after) — the final step
