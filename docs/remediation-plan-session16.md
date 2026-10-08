# Remediation Plan — Session 16 (2026-10-08)

**Scope:** Fix the issues, bugs and gaps found by the Session 16 parity +
production-readiness audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** fresh paired captures (word parity **1.0000 on all 8
routes** — the reference is UNCHANGED since Session 15; the standing
mobile-nav real-touch probe re-run: the clone's panel byte-identical and
working — burger 342,16 24×24 taps open into the 0,56 390×397 panel with
seven 44px rows; scroll-lock, Escape, resize guard, and navigate-close
(the corrected Session-15 locator) all verified working — **no Tailwind v4
bug**; the live's burger remains pointer-blocked, D32). The Session-16 NEW
audit surfaces — layers no prior session systematically surveyed:

1. **The authenticated-endpoint abuse layer (cost control on the LLM
   route)**: `/api/workflows/generate` — the most expensive endpoint per
   call (a live LLM completion) — has **NO rate limit**. Auth
   (login/register), newsletter, and demo are all limited; the LLM
   composer is not. Probed empirically on the fresh production server:
   **15/15 rapid authenticated POSTs all returned 200 in 8.1s (each a
   real SDK completion, ~0.54s) — no 429 ever engaged**. Any authenticated
   abuser (a scripted loop, a stolen session cookie, or a runaway client)
   can drive unbounded LLM spend and SDK pressure. The e2e suite itself
   only makes ~2 real generate POSTs per run, so the default budget is
   safe for the gate — the gap is the missing production ceiling. **F1.**
2. **The response-cache directive layer**: Next.js protects its dynamic
   PAGES with `Cache-Control: private, no-cache, no-store, max-age=0,
   must-revalidate` (verified on the 307 /dashboard response) — but
   route-handler JSON carries **NO Cache-Control at all** (verified on
   /api/health 200 and /api/workflows 401: the four security headers,
   `vary`, `content-type` — no caching directive). Authenticated JSON
   (the workflow list, the session user) transits browsers and shared
   caches with no explicit no-store; RFC 9111 permits heuristic storage
   of unmarked 200s by ANY cache, and defense-in-depth for a
   production data API is an explicit `no-store`. **F2.**
3. **The fingerprint/parity layer of the framework banner**: page
   responses advertise `X-Powered-By: Next.js` (verified on the /dashboard
   307) while the live ships **no X-Powered-By at all** (`server:
   cloudflare`, `x-render-origin-server: uvicorn` — probed fresh this
   session). API responses already omit it; only the page layer carries
   the banner. One config flag removes both the fingerprinting surface
   and a header the reference doesn't ship. **F3.**

Also audited and found CLEAN or ADJUDICATED (non-findings, this
session's evidence): **the hostile-content rendering layer** (a workflow
named `<script>alert("xss")</script>` plus a max-length 120-char name and
500-char description were created, rendered, and deleted: zero dialogs
fired, the name rendered as escaped text, the long name truncates
(`overflow: hidden`, scrollWidth > clientWidth), the long description
clamps (`-webkit-line-clamp: 2`), and the document has **zero horizontal
overflow** at 1440px); **the fresh-user empty-state layer** (register →
/dashboard renders the graceful workspace: "No workflows yet — compose
your first one above.", "No data yet.", "0 total", heading "Dashboard");
**the post-logout back-button layer** (sign out → `/` → browser-back
lands on `/login?from_url=/dashboard` with the login card — the server
gate's 307 contract holds; no stale dashboard leaks through bfcache);
**IDOR scoping** (`/api/workflows/[id]` GET/PATCH/DELETE all scope by
`userId: guard.user.id` in the findFirst — verified in code, pinned by
the existing smoke CRUD checks); **email normalization** (login and
register both `trim().toLowerCase()` — no case-variant duplicate
accounts); **the password upper bound** (≤128 chars — the scrypt cost is
bounded); **seed idempotency** (wipes domain tables first); **the UI
busy guards** (the composer's synchronous `composing` re-entry check +
`busyId` row disabling); and the standing battery above.

A tooling trap encountered and neutralized during the survey (worth
logging for future survey scripts): Playwright's `page.request`
APIRequestContext **refuses to send `Secure` cookies over plain http**
(the production session cookie is `secure: true`), while Chromium page
navigations treat `http://127.0.0.1` as a trustworthy origin and DO send
them — authenticated API probing must therefore go through **in-page
fetches after a navigation**, not `page.request`. The same class of
quirk: an API-register followed by a `/login` visit hits the Session-14
authenticated gate (redirect to /dashboard — by design), so survey
scripts must navigate directly after API-register.

## Findings → remediation map

| # | Finding | Layer | Severity | Fix |
|---|---------|-------|----------|-----|
| F1 | `/api/workflows/generate` (the LLM composer) has NO rate limit — 15/15 rapid authenticated POSTs all 200, no 429 | Production abuse / cost control | MEDIUM | R1: the per-user `generateRateLimit` + the S15 429 contract |
| F2 | Envelope API responses carry no `Cache-Control` — authenticated JSON transits caches with no explicit no-store | API hardening (RFC 9111) | LOW-MEDIUM | R2: `private, no-store` at the `ok()`/`fail()` seam |
| F3 | Page responses advertise `X-Powered-By: Next.js` (the live ships none) | Fingerprinting / live posture | LOW | R3: `poweredByHeader: false` |

## The plan

### R1 — The LLM endpoint's abuse ceiling (F1)

- `src/lib/rate-limit.ts` — new wrapper `generateRateLimit(userId:
  string): RateDecision` over the shared `checkRate` core: bucket key
  `gen:${userId}` (**per-USER**, not per-IP — the route is authenticated,
  so the user id is the honest unit; a shared-egress office does not
  share one abuser's budget), limit 10 per 15 minutes, overridable via
  `GENERATE_RATE_LIMIT_MAX` (the Session-11 `AUTH_RATE_LIMIT_MAX`
  operator pattern: parse, validate ≥1, fall back to the default).
- `src/app/api/workflows/generate/route.ts` — after the session guard and
  BEFORE the body parse (the auth routes' own ordering — any attempt
  counts, valid or not): `if (!limit.allowed) return fail("RATE_LIMITED",
  "Too many generations. Try again in ${limit.retryAfterSec}s.", 429, {
  "Retry-After": String(limit.retryAfterSec) })` — the exact S15 F4
  contract shape.
- The CLIENT contract stays unchanged BY DESIGN: `compose()`'s
  `genRes.ok` check already degrades a failed generate into the
  client-side template draft (name = the idea, category "Ops") and the
  create still succeeds — the feature never hard-fails (ADR-004's
  doctrine applied at the client layer; the limiter is purely the
  backend cost ceiling). This contract gets its own e2e pin so it can't
  silently break: a route-fulfilled 429 on `/api/workflows/generate` →
  compose → the row IS created + "Workflow created." announced + zero
  pageerrors.
- `playwright.config.ts` webServer env: `GENERATE_RATE_LIMIT_MAX: "50"`
  (the S11 AUTH_RATE_LIMIT_MAX insurance — the suite's ~2 real generate
  POSTs sit far below 10, but a reused server across repeated local runs
  could climb toward the ceiling; the pin makes the suite immune by
  construction).
- RED first: unit cases in `src/lib/rate-limit.test.ts` (the
  `authRateLimit` pattern: default 10 then the 11th trips; the
  `GENERATE_RATE_LIMIT_MAX` override trips at the override; distinct
  userIds keep independent buckets). e2e pin in
  `tests/e2e/dashboard.spec.ts` (the route-fulfilled 429 degrade
  contract, with row cleanup). Smoke pins in
  `scripts/smoke-test.sh` (below).
- **Smoke deterministic trip**: the smoke server boots with
  `GENERATE_RATE_LIMIT_MAX=2`; nothing else in smoke calls generate, so
  the pin block is exactly deterministic — POST #1 200, POST #2 200,
  POST #3 429 + a positive integer `Retry-After` + the RATE_LIMITED
  envelope code. (With the live SDK each allowed call is ~0.5s; in an
  SDK-less environment the calls degrade fast — a black-holed
  connection costs at most SDK_TIMEOUT_MS each, bounded at 2 calls.)
- Auth POST budget: +0 (the pin reuses the existing smoke session
  cookie). e2e generate budget: +1 UI compose (route-fulfilled — never
  reaches the server). ✓

### R2 — The envelope's cache directive (F2)

- `src/lib/api.ts` — `ok()` and `fail()` add
  `"Cache-Control": "private, no-store"` to every envelope response
  (fail() MERGES it under any caller headers — the 429 sites' Retry-After
  survives; verified: no route bypasses the seam — every API response is
  an ok()/fail() construction).
- `no-store` alone forbids all storage; `private` additionally fences
  shared caches that ignore no-store edge cases — the belt-and-braces
  pair, matching the spirit of Next's own dynamic-page directive set
  without the redundant `no-cache/max-age=0/must-revalidate` tail.
- RED first (the smoke layer owns header pins — the S9 security-header
  precedent): `/api/health` 200 carries `Cache-Control: private,
  no-store`; the anonymous `/api/workflows` 401 carries it too; the
  authenticated `/api/workflows` 200 carries it. No e2e pin (headers are
  seam-uniform; smoke's curl is the deterministic layer for them).

### R3 — The framework banner (F3)

- `next.config.ts` — `poweredByHeader: false`.
- RED first (smoke): `X-Powered-By` is ABSENT on a page response (`/`)
  and on an API response (`/api/health`) — the live's own posture
  (probed: `server: cloudflare`, no X-Powered-By).

### R4 — Full gate + paired re-verification + docs

- Gate: lint → typecheck → **116 unit** (111 + 5: 3 generateRateLimit +
  the 2-case split if needed — final count from the run) → build →
  **58 smoke** (50 + the generate 429-engages pin + its Retry-After pin
  + the 3 Cache-Control pins + the 2 X-Powered-By pins) → **197 e2e**
  (196 + the composer 429-degrade pin) — the exact total computed from
  the runs, documented everywhere.
- Re-verification: word parity 1.0000 ×8 (fresh port, fresh boot — the
  zombie-server discipline); the RED probe families re-run GREEN on the
  remediated build (the generate loop trips at 11 with Retry-After; the
  API responses carry `private, no-store`; no X-Powered-By anywhere);
  the mobile-nav paired probe; console sweep on the touched routes; axe
  /dashboard + /demo still zero.
- Screenshots: the standard set refreshed (VLM spot-check).
- Docs: PAD (revision block; ledger **D80–D82**; §7 counts; §11 key
  files; §8.2 env table + `GENERATE_RATE_LIMIT_MAX`), AGENTS (counts;
  **gotcha 30** — the authenticated-endpoint abuse ceiling + the
  Secure-cookie/page.request survey trap), CLAUDE (session-16 context),
  README (badge, the rate-limit feature row extended to the composer, the
  no-store + X-Powered-By rows, troubleshooting), the SKILL doc v2.15.0
  (**lessons 40–41**), `.env.example` (+`GENERATE_RATE_LIMIT_MAX`), the
  remediation plan (this file, ticked), the session log
  `docs/session_27.md`, the repo `worklog.md`.
- Commit (Conventional Commits + emoji) + SSH push via
  `docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified).

## Validation of this plan against the codebase (pre-execution)

- `rate-limit.ts` re-read: `generateRateLimit` fits the wrapper family
  (`authRateLimit`/`newsletterRateLimit`); the shared `checkRate` core
  needs no changes; the co-located test file's env save/restore pattern
  extends cleanly ✓
- `generate/route.ts` re-read: the limiter slots after `requireSession`
  (the user id exists there) and before the JSON parse — the auth
  routes' own ordering; the 429 envelope mirrors the newsletter site's
  exact shape (code + message + Retry-After headers) ✓
- `api.ts` re-read: both constructors are the SINGLE seam (grep: no route
  builds its own `NextResponse.json`/`new Response`); `fail(headers?)`
  merges under the caller's Retry-After with no signature break ✓
- `next.config.ts` re-read: `poweredByHeader: false` is an independent
  top-level flag; the existing `headers()` block is unaffected ✓
- Smoke script re-read: the server boot line takes the new env var in
  place; the generate pin block slots after the newsletter+demo block
  (the session cookie jar ` /tmp/smoke-cookies.txt` is live by then);
  the Cache-Control/X-Powered-By pins slot into the existing
  security-header block; nothing else in smoke POSTs to generate, so the
  2-limit trip is deterministic ✓
- e2e budget recount: the new dashboard pin route-FULFILLS the generate
  429 (zero server-side generate calls); the webServer's 50 ceiling
  covers the suite's ~2 real calls across reused-server reruns ✓
- Pin-conflict scan: no existing spec asserts API Cache-Control,
  X-Powered-By, or a generate 429; the resilience spec's abort-banner
  pin is a different failure class (network abort ≠ HTTP 429) ✓
- Docs-truth scan: README documents the auth rate limit + Retry-After
  but says nothing about the composer's limit (the new row ADDS the
  truth); no doc claims API caching or the X-Powered-By banner ✓

## Execution order

R1 (RED unit+smoke → the limiter + route + config pins → GREEN) → R2
(RED smoke header pins → the seam directive → GREEN) → R3 (RED smoke
absence pins → the config flag → GREEN) → the e2e degrade pin → full
gate → paired re-verification → screenshots → docs (R4) → commit + SSH
push per the runbook.

### ToDo checklist

- [x] R1: RED generateRateLimit unit cases (3 × "not a function" observed) + the smoke 429/Retry-After pins (RED: 429-expected-got-200, code-expected-got-[], Retry-After-got-"" observed) → the limiter + generate-route integration + webServer pin → GREEN (114/114 unit; 60/60 smoke — the trip: POST #1/#2 allowed, POST #3 429 RATE_LIMITED + Retry-After 899s)
- [x] R1: the e2e composer 429-degrade pin (route-fulfilled 429 → the workflow is still created + "Workflow created." announced + zero pageerrors; GREEN-on-arrival BY DESIGN — pin-only, the degrade shipped since the composer's first session)
- [x] R2: RED smoke Cache-Control pins (got '' ×3 observed) → `private, no-store` at the ok()/fail() seam → GREEN (all three layers carry the directive; the newsletter 429's Retry-After survives the merge)
- [x] R3: RED smoke X-Powered-By absence pins (pages: FAIL observed — the banner was present; API: GREEN-on-arrival — the API layer never carried it) → `poweredByHeader: false` → GREEN (absent on both layers)
- [x] Full gate: lint → typecheck → 114 unit → build → 60 smoke → 197 e2e (371 checks)
- [x] Paired re-verification: word parity 1.0000 ×8 (fresh :3022 boot, reference UNCHANGED); the GREEN probe family (15 rapid generate POSTs → 10 × 200 + 5 × 429 with Retry-After 890s, first 429 at index 10; API Cache-Control private, no-store; no X-Powered-By); mobile-nav paired probe (clone byte-identical, navigate-close GREEN, no Tailwind v4 bug; live's burger D32-blocked); console sweep ZERO on /, /login, /demo, /dashboard+composer (on a fresh-bucket server — the one 429 console line on the shared-bucket server was the browser's inherent non-2xx resource log, the D68 family, survey-induced); axe /dashboard + /demo ZERO violations
- [x] Screenshots: 20 refreshed (18 standard + the error-boundary recapture + the demo shot; VLM-verified ×4: dashboard stats/composer/list/chart clean, resilience banner over intact dashboard, demo form complete, login card clean). One discovery en route: the dev db/custom.db had DRIFTED all-paused across S12–S15 probe traffic — re-seeded to the canonical workspace before the refresh (e2e/smoke immune: fresh DBs)
- [x] Docs: PAD (revision block; D80–D82; §7.1/§7.2/§7.3 counts; §8.2 env table + GENERATE_RATE_LIMIT_MAX; §11 key files incl. the three new seams), AGENTS (counts + gotcha 30), CLAUDE (session-16 context + pre-push checklist counts), README (371 badge, composer rate-limit row + API row + troubleshooting row, no-store/banner in the headers row), SKILL v2.15.0 (lessons 40–41), .env.example (+GENERATE_RATE_LIMIT_MAX), session log `docs/session_27.md`, worklog, this plan ticked
- [ ] Commit (Conventional Commits + emoji) + SSH push via `docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified)
