# Session 45 — the transcript log of the Session 24 remediation cycle

Let me start by refreshing the workspace and confirming where the previous
cycle left off.

The sandbox had been fully reset — a fresh `git clone` landed at HEAD
`8f92ff0` on main, clean (Session 23 COMPLETE and wrapper-verified pushed;
`docs/session_44.md` the prior transcript). This cycle is **Session 24**.
All project docs re-read (AGENTS.md — 37 gotchas, the 473 gate, main-only
discipline; CLAUDE.md; README; the PAD's revision block + §7 + the
D99–D100 ledger; the SKILL at v2.22.0), the session docs (session_43/44 +
remediation-plan-23 fully ticked + the worklog tail), the skills catalog
consulted (tdd / agent-browser / code-review-and-audit families);
`skills/` excluded from toolchains (re-verified).

Environment rebuilt (npm install, `.env` from `.env.example` with a fresh
AUTH_SECRET, prisma generate, db:push + db:seed — see F3 below for the
placement adventure this triggered). **BASELINE GATE: 473 checks ALL
GREEN** (156 unit + 117 smoke + 200 e2e — no flake; lint + typecheck +
build clean).

Now the standing drift battery (recreated with an EXPLICIT `--base` on a
fresh :3150 boot, Chromium-rendered both sides — the gotcha-34 honest
method): **GREEN** — word parity 1.0000 ×8 (the 8th route being the 404
itself: both sides render the identical 16-word card; `/demo` is the
clone's superset route, excluded from the parity set by design), mobile-nav
byte-identical with a REAL tap (7 rows × 44px — no Tailwind v4 bug; the
live's burger remains pointer-blocked, D32), live LOGIN re-verified — D62
holds. The SEO surface re-verified (sitemap 200 `application/xml` ×8;
robots the superset semantics; og-image a real 1200×630 PNG;
`manifest.json` valid); dependency currency re-adjudicated (the documented
F10 chain only; majors only).

**The Session-24 audit surface — the TEMPORAL and PLACEMENT dimensions of
client state** (the S44 log's suggested surfaces — the banner lifecycle
and a performance-budget hook — surveyed first, then extended to their
class). Reading the client code + probing on the probe-only server
(:3160, `db/probe-s24.db`, gotcha-30):

- **F1 — the client hang class.** No client fetch carried a timeout. A
  never-fulfilling `page.route` on the PATCH left the busyId spinner
  STILL engaged after 8s with NO banner (the S12 resilience pins cover
  aborts, which reject immediately — the hang class was invisible to
  every gate). The same class on the login card, the footer, and the
  demo form: five fetch sites, zero timeouts.
- **F2/F2b — the stale-banner class.** A failed compose's error stayed
  mounted after a SUCCESSFUL unrelated pause; a failed pause's global
  banner stayed mounted after a SUCCESSFUL compose (probed RED in both
  directions — the S13/S23 lie-by-staleness family).
- **F3 — the seed-placement class (found in vivo).** This session's own
  environment rebuild: the seed reported `seed-checksum:e7f6c011` but
  wrote OUTSIDE the repo while the app opened `<repo>/db/custom.db` (a
  0-byte file) — login answered P2021 INTERNAL_ERROR. Root-cause
  adjudication: the sandbox provisions a shell-EXPORTED absolute
  `DATABASE_URL` **and** a parent `/home/z/my-project/.env` — gotcha 1's
  vectors — and the seed's raw `new PrismaClient()` honored whatever the
  environment handed it (no anchor resolution, no observability, no
  pin); the smoke/e2e suites were immune because they pin
  `DATABASE_URL` per command.

Remediation plan session24 written + validated against the codebase
(pin-conflict scans: the resilience aborts reject at fetch; the S23
delayed-GET is 1200ms; no pin asserts banner SURVIVAL across a subsequent
action; the smoke/e2e seed invocations keep their explicit env).

**TDD-first — RED:** the new unit pins failed 8/8 ("the helpers do not
exist"); the new e2e spec (`session24-temporal.spec.ts`) failed 4/4 on
the pre-fix build (the hang never converts — "element(s) not found" on
the banner; both staleness assertions fail).

**GREEN:** R1 `fetchWithTimeout()` in `src/lib/client-fetch.ts` (20s —
above the server's own 10s SDK ceiling) riding all five client fetch
sites (the dashboard's apiFetch + logout, the login card, the footer, the
demo form). R2 every action start clears BOTH error surfaces. R3
`parseEnvValue()` + `selectDatabaseUrl()` + `resolveCliDatabaseUrl()` in
`src/lib/db-path.ts` (precedence: explicit process env → the repo's own
.env → the documented default, all through the anchor logic, non-SQLite
passthrough preserved) + the seed's pre-set env + `seed-target:` line +
`scripts/prisma-with-db.ts` routing db:push/migrate/reset.

**TWO pin bugs caught BY the pins** (the S22 family recurring): the
first hang pin used an inert never-settling fetch mock — which IGNORES
the abort signal, so the rejection was unobservable (the pin timed out
at the 5s vitest default); the honest variant pins the seam against a
REAL hung TCP socket (`net.createServer` that accepts and never
answers). And the F1 probe's own 8s window was shorter than the fix's
20s ceiling — the post-fix probe needed a 22s window to observe the
CONVERSION (the e2e pins used Playwright's `clock` API all along:
`install` + `fastForward(21_000)` — the 20s ceiling costs milliseconds).

**FULL GATE: 486 checks GREEN** (164 unit + 118 smoke + 204 e2e — the
smoke's new seed-target placement pin included). Re-verification: the
temporal probe GREEN 3/3 (the hang converts to the banner + busy
release; both stale banners clear); the seed-placement in-vivo
verification GREEN (`[db] DATABASE_URL=file:/…/saas-company/db/custom.db`
+ `seed-target:` + 57344 bytes + 6 rows/5 active); the drift battery
re-run GREEN ×8 (zero regressions from the client changes).

**Screenshots:** the standard 20-shot set refreshed (a fresh :3170 boot
with AUTH_RATE_LIMIT_MAX=50; the error-boundary mock covers the [id]
routes — the S23 fix; the dev DB logical state verified CANONICAL before
AND after: rows=6, runs=7120, active=5). VLM spot-checks ×5 — after
adjudicating the SEVENTH and EIGHTH check-prompt drifts: a "the hero CTA
is Book a Demo not Get Started" verdict (disproven by the landing spec's
pinned CTA roles — Book a Demo IS the hero's primary pill, Get Started
lives in the navbar) and a "footer missing" verdict on the demo shot
(disproven by the geometry probe — footerTop 1009 of a 1378px page, below
the 900px fold) → **5/5 PASS** with the corrected contracts.

Documentation: PAD (revision block, ledger D101–D103, §7 counts 486, §11
key files incl. the client-fetch + db-path-selection + seed/wrapper +
spec rows), AGENTS (gotcha 38 + counts + the invariant line naming the
client timeout), CLAUDE (session-24 context + the stack-table counts),
README (486 badge + the temporal-honesty row + every stale count), SKILL
v2.23.0 (lessons 56–57), .env.example verified in sync (no new env vars
— the timeout is a code constant), remediation plan session24 (ticked),
session log `docs/session_45.md`, the repo worklog.

**FINAL GATE re-check on the complete tree, then commit on main + the
SSH wrapper push.**
