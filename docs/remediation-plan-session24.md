# Remediation Plan — Session 24 (2026-10-09)

**Scope:** Fix the issues found by the Session 24 temporal-honesty audit
of this repository (the S44 log's two suggested surfaces — the dashboard
banner lifecycle and a performance-budget hook — surveyed first, then
extended to the class they belong to), executed TDD-first, gated by the
full quality gate (§7.3 of the PAD), and re-verified by the standing
paired survey.

**Audit method:** the standing drift battery first (word parity **1.0000
on all 8 routes** — the 8th being the 404 route, both sides rendering the
identical 16-word card; `/demo` is the clone's superset route and is
excluded from the parity set by design; both sides rendered in Chromium —
the reference is UNCHANGED since Session 23; the mobile-nav paired
real-touch probe: the clone's burger opens with a REAL tap into the
byte-identical panel — seven rows, every row exactly 44px — **no Tailwind
v4 bug**; the live's burger remains pointer-blocked, D32; the live LOGIN
re-verified — D62 holds). The SEO surface re-verified CLEAN (sitemap 200
`application/xml` ×8 routes; robots the honest superset semantics;
og-image a real 1200×630 PNG; `manifest.json` valid at `/manifest.json`).
The dependency currency re-adjudicated (the documented F10 chain only;
majors only — unchanged). Then the Session-24 NEW audit surface — the
TEMPORAL and PLACEMENT dimensions of client state:

1. **The client hang class (F1):** no client-side fetch carries a
   timeout. A black-holed request (a stalled connection — the CLIENT
   twin of Session 15's server-side hang, D78) neither resolves nor
   rejects: the dashboard's `busyId` stays engaged forever (the row's
   Pause/Delete buttons spin eternally), the login card's `busy` state
   never releases, and NO banner ever renders. The Session-12 resilience
   suite pins ABORTS — which reject immediately — so the hang class was
   never observable in the existing gates. Probed on the probe-only
   server (:3160, `db/probe-s24.db`, gotcha-30 discipline) with a
   never-fulfilling `page.route` on the PATCH: after 8 seconds the
   spinner was STILL engaged and the banner was empty — RED-confirmed.
   The same defect exists at every client fetch site (login card,
   newsletter footer, demo form, logout) — five sites, zero timeouts.

2. **The stale-banner class (F2):** the two error surfaces outlive the
   condition they describe. `compose()` clears only the composer-local
   `error`; `toggleStatus`/`remove`/`signOut` clear only the global
   `actionError`. A failed compose followed by a SUCCESSFUL pause leaves
   the composer card asserting "Try again." — and a failed pause followed
   by a SUCCESSFUL compose leaves the global banner mounted — both
   probed RED (the banner renders a retry invitation after the network
   has demonstrably recovered: the S13/S23 family — a lie by staleness).

3. **The seed-placement class (F3):** `npm run db:push` / `npm run
   db:seed` rely on env resolution OUTSIDE the app's tested seam
   (`src/lib/db-path.ts`). RED-confirmed in vivo during this session's
   environment rebuild: the seed reported success
   (`seed-checksum:e7f6c011`) but wrote the schema + data OUTSIDE the
   repo, while the app (through its own seam) opened
   `<repo>/db/custom.db` — a 0-byte file — and login answered the
   INTERNAL_ERROR envelope (`P2021: table main.User does not exist`);
   the README's first-run story silently produced an app that cannot
   log in. Root-cause adjudication (probed): the sandbox provisions
   BOTH a shell-EXPORTED absolute `DATABASE_URL` (gotcha 1 — the
   documented trap every prior session neutralized per-command) AND a
   matching parent `/home/z/my-project/.env`; the seed's raw
   `new PrismaClient()` honored whatever the environment handed it
   with no anchor resolution, no observability, and no pin. The
   smoke/e2e suites were immune (they PIN `DATABASE_URL` per command);
   `package.json`'s own `db:*` scripts did not keep that discipline.

Also surveyed and found CLEAN or ADJUDICATED (non-findings, this
session's evidence): **the login rate-limit UX** (a 429 surfaces the
server's honest "Too many attempts. Try again in Ns." message — the
`payload.error.message` passthrough, S13-compliant), **the newsletter
and demo capture clients** (the same passthrough — server messages
surface verbatim), **the performance-budget hook candidate** (the
S21/S22 performance layers were adjudicated CLEAN with recorded LCP/TTFB
numbers; a budget hook is preventive tooling, not a defect — noted as a
future-session candidate), **banner AUTO-dismiss** (adjudicated AGAINST:
a persistent honest banner cleared by the next action is the better
contract than a timer — an auto-dismissing error hides retryable
conditions from slow readers; F2's fix addresses the actual staleness),
and **the refresh-rejection banner precision** (a refresh timeout after
a SUCCESSFUL mutation renders "Could not update…" — imprecise but safe:
retry is idempotent by construction (the toggle body is computed from
the row's last-known status), and the pre-fix abort class already had
these semantics; adjudicated as the existing honest-enough contract).

## The fixes (TDD-first)

### R1 — the client fetch timeout (F1)

`src/lib/client-fetch.ts` (new): `fetchWithTimeout(input, init?,
timeoutMs = 20_000)` — an `AbortController` + `setTimeout` wrapper; the
timer is cleared in `finally`; the abort rejection propagates to the
existing catch contracts (the hang converts into the Session-12
network-fault class: banner + busy release). 20s exceeds every
legitimate client flow (the server's own SDK timeout is 10s — D78; the
mutations are sub-second). All five client fetch sites route through
it: the dashboard's `apiFetch` (+ its `signOut` fetch), the login
card's auth POST, the newsletter footer POST, and the demo form POST.

### R2 — the cross-class banner clearing (F2)

Every action start clears BOTH surfaces: `compose()` clears `error` AND
`actionError`; `toggleStatus`/`remove`/`signOut` clear `actionError`
AND `error`. The banner contract becomes: "a failure surface lives
exactly until the user's next action of ANY class" — the retry
invitation never outlives the context it describes.

### R3 — the deterministic seed/push placement (F3)

`src/lib/db-path.ts` gains two pure seams: `parseEnvValue(content,
key)` (quoted/unquoted/commented/CRLF) and `selectDatabaseUrl(
processEnvUrl, repoEnvContent, anchors)` — precedence: explicit process
env (the gotcha-1 operator-intent semantics AND the smoke/e2e
 discipline — absolute `file:` and non-SQLite URLs pass through
untouched, preserving the PostgreSQL swap story) → the REPO's own
`.env` value (parsed directly) → the documented default; every value
resolves through the existing `resolveDatabaseUrl` anchor logic. The IO
wrapper `resolveCliDatabaseUrl()` reads `<repo>/.env` (repo root = the
first candidate anchor that owns `prisma/schema.prisma`).
`prisma/seed.ts` sets `process.env.DATABASE_URL =
resolveCliDatabaseUrl()` BEFORE constructing the client (mirroring
`src/lib/db.ts`) — and prints `seed-target:<resolved-url>` (an
observable placement; the smoke suite pins it against `db/smoke.db`).
The `db:push` / `db:migrate` / `db:reset` npm scripts route through
`scripts/prisma-with-db.ts` (resolve → `spawnSync("npx", ["prisma",
…args], { env: { …process.env, DATABASE_URL: resolved } })`, stdio
inherited so interactive migrate prompts keep working; the wrapper
prints `[db] DATABASE_URL=<resolved>` — the same observability). The
clean-shell first-run story is now deterministic and OBSERVABLE; the
shell-EXPORTED absolute URL remains the documented gotcha-1 trap
(neutralize per-command — the standing discipline, now ALSO visible
in every seed/wrapper invocation's output line).

### Validation before execution (performed against the codebase)

- **Pin-conflict scan (R1):** the resilience spec's abort pins reject
  at fetch (the timeout is irrelevant); the session23-honesty delayed-GET
  pin delays 1200ms (far under 20s); the error-boundary mocks fulfill
  immediately; the login-states alternate-state pins POST fast. The
  Playwright `clock` API will drive the hang pins without 20s of
  wall-clock.
- **Pin-conflict scan (R2):** every fault pin (resilience ×4,
  session-lifecycle (d)) asserts the banner immediately after the fault
  and ends — no pin asserts banner SURVIVAL across a subsequent action.
- **Pin-conflict scan (R3):** the smoke suite seeds with an explicit
  `DATABASE_URL` (process env — precedence 1: unchanged behavior); the
  e2e global-setup does the same; the seed's output contract gains an
  ADDITIVE line (the checksum line is untouched — the smoke
  seed-checksum pins keep matching).
- **Order/state scan (the new e2e spec):** `session24-temporal.spec.ts`
  sorts after `session23-honesty.spec.ts`, whose tests delete three of
  the six seeded rows and leave Lead paused — the new spec uses the
  surviving rows with status-tolerant selectors, cleans up its composed
  row (the dashboard.spec composer pattern), and filters `role=alert`
  assertions by text (the route-announcer gotcha).

### Post-execution verification

1. Full gate: lint → typecheck → unit → build → smoke → e2e — the gate
   count rises with the new pins (+8 unit: client-fetch ×3, env-value
   ×3, URL-selection ×2; +1 smoke seed-target; +4 e2e: the dashboard
   hang, the login-card hang, the two staleness pins).
2. The temporal probe re-run on the remediated build (probe-only DB):
   the hang converts to the banner + busy release; both stale banners
   clear on the unrelated success.
3. The seed-placement verification IN VIVO (clean shell, `env -u
   DATABASE_URL`): `npm run db:push` + `npm run db:seed` write
   `<repo>/db/custom.db` — asserted by the `[db]`/`seed-target:` lines
   + file size + row count.
4. The drift battery re-run (client code was touched): word parity
   1.0000 ×8, mobile-nav byte-identical, D62 holds.

## ToDo

- [x] R1 `src/lib/client-fetch.ts` + the five call sites (dashboard
      apiFetch/signOut, login-card, footer, demo-view)
- [x] R2 the cross-class banner clearing in all four action starts
- [x] R3 `parseEnvValue` + `selectDatabaseUrl` pure seams + the IO
      wrapper; the seed's pre-set env; `scripts/prisma-with-db.ts`;
      the `db:push`/`db:migrate`/`db:reset` rewiring; the
      `seed-target:` line + the smoke pin
- [x] RED observed on the pre-fix build — the new unit pins + the
      e2e temporal spec fail before the fixes (unit 8/8 "the helpers
      do not exist"; e2e 4/4 — the hang never converts, both banners
      stay stale)
- [x] Full gate green — the count rises 473 → 486 (164 unit + 118
      smoke + 204 e2e)
- [x] The temporal probe re-run GREEN (hang → banner + release; stale
      banners clear)
- [x] The seed-placement in-vivo verification GREEN
- [x] Drift battery re-run GREEN — word parity 1.0000 ×8, mobile-nav
      byte-identical, D62 holds
- [x] Screenshots (20) + VLM spot-checks (5) PASS
- [x] PAD ledger D101–D103 + §7 counts + §11 key files
- [x] AGENTS gotcha 38 + counts + the invariant line naming the client
      timeout + the placement discipline
- [x] CLAUDE session-24 context
- [x] README badge/counts + the temporal-honesty row
- [x] SKILL v2.23.0 lessons 56–57
- [x] .env.example verified in sync (no new env vars — the timeout is
      a code constant)
- [x] remediation plan ticked + session log `docs/session_45.md`
- [x] worklog.md updated
- [x] commit on main + SSH wrapper push (wrapper-verified — the hash
      recorded below post-push)
