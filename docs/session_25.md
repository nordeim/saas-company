# Session 25 Log — Redirect Targets, Superset A11y, SDK Hangs & the 429 Contract (the Session-15 Remediation, 2026-10-08)

Continuing from Session 23/24 (main @ 6aaf19b — the verified Session-14
push `4f3672e` + `f3ecd86` + the session-log updates). The mandate:
refresh, review the session-23/24 + remediation-plan-14 docs, re-audit
against the live (with the standing mobile-navigation and
Tailwind-v4 vigilance), remediate TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- `git pull` brought in `docs/session_24.md` (the prior session's
  transcript); the tree was clean at `6aaf19b`. Root docs (AGENTS 28
  gotchas / CLAUDE / README / PAD Session-14 revision / SKILL v2.13.0) +
  status docs (session_23/24, remediation-plan-14, worklog) reviewed;
  the `skills/` folder excluded from every toolchain (re-verified:
  tsconfig/eslint/vitest include-scope/playwright testDir).
- `.env` intact (`DATABASE_URL="file:../db/custom.db"`, AUTH_SECRET,
  AUTH_RATE_LIMIT_MAX=10) with the seeded `db/custom.db`; the
  exported-DATABASE_URL trap neutralized per-command (`env -u
  DATABASE_URL`) throughout.
- Baseline gate: lint ✓ typecheck ✓ Vitest 94/94 ✓ build ✓ smoke 48/48 ✓
  Playwright **191/191** — the inherited gate fully green (no flake).

## Phase 2 — The audit (the reference UNCHANGED; four new survey surfaces)

**Drift check** (8 routes, scroll-passed innerText): word parity **1.0000
on every route** — the live is unchanged since Session 14.

**Standing mobile-nav paired re-verification** (real-touch 390×844
contexts): the clone's burger (342,16 24×24) taps open into the
byte-identical panel (0,56 390×397, seven 44px rows; scroll-lock,
Escape, resize guard all working). **No Tailwind v4 bug**; the live's
burger remains pointer-blocked (D32). BONUS adjudication: the
Session-11 survey script's long-standing `navigateCloses: false` on the
clone was a SELECTOR TYPO ARTIFACT — its `aref="#features"]` locator
never matched a row, so the row-tap silently no-op'd; the corrected
probe (`survey-navigate-close-session15.mjs`) shows the panel closing
on row-navigate with the URL anchored to `#features`, and the e2e
mobile-navigation suite has pinned close-on-navigate all along.

The Session-15 NEW surfaces — layers no prior session systematically
surveyed:

1. **The redirect-target layer** (WHERE can a user-controlled redirect
   parameter ship the browser?): `/login` accepts an arbitrary
   `from_url` and `login-card.tsx` pushed it VERBATIM post-sign-in.
   Probed empirically: signing in from
   `/login?from_url=https://evil.example/phish` performed a REAL hard
   navigation to the attacker's host (the network log carried
   `https://evil.example/phish?_rsc=…`; the browser landed on the
   DNS-failure page); the protocol-relative variant behaved
   identically. A textbook open redirect (CWE-601). The Session-14
   authenticated gate is NOT affected (it redirects before the param
   is consumed); the server gates and apiFetch use hardcoded paths —
   the card's push is the single consumer. **F1.**
2. **The superset-surface a11y layer** (D63's live-parity adjudication
   covers live-mirrored routes only — the superset routes must stand
   on their own floor): axe-core swept `/demo` and `/dashboard`. The
   dashboard: CLEAN. **/demo: a `heading-order` violation (moderate)**
   — the page's only heading is the h1, so the byte-pinned footer's
   first h3 ("Product") lands after an h1 with no intervening h2 (a
   skip). The footer itself is clean on the landing (h2 sections
   precede it) — the violation is the superset page's own outline.
   **F2.**
3. **The external-dependency hang class**: `/api/workflows/generate`
   awaits `zai.chat.completions.create(...)` with NO timeout — a
   black-holed SDK connection leaves the composer POST blocked
   indefinitely, the busy guard engaged, and the catch-block fallback
   never fires (no error ever arrives). ADR-004's degrade-not-fail
   covers failures, not hangs. **F3.**
4. **The rate-limit response contract / docs-truth layer**: README's
   troubleshooting documents "see `Retry-After`" — but NO route emits
   the header (probed: 429s carry only the envelope body; `fail()`
   accepts no headers). **F4.**
5. **The reduced-motion coverage of the newest surface** (pin-only):
   the Session-14 suite pins the landing and `/faq`; `/demo` (the
   newest `Reveal` consumer) had no pin. Verified clean by probe.
   **F5.**

Also audited and found CLEAN or ADJUDICATED (non-findings): the 405
responses on unhandled methods (empty bodies + security headers —
Next.js framework behavior; the envelope contract governs handled
methods); the hero video's eager autoplay (byte-parity with the live —
the same video, the same attributes); `GET /api/workflows/[id]`'s lack
of a UI consumer (the route family is consumed via PATCH/DELETE — a
conventional REST read, not dead code); the dashboard's axe sweep
(zero violations); the session cookie flags (httpOnly, SameSite=Lax,
secure-in-production); the CSRF posture (JSON content-type +
SameSite=Lax: cross-site JSON POSTs need a preflight the API never
grants).

The remediation plan (`docs/remediation-plan-session15.md` F1–F5 →
R1–R5) was written against these findings, then validated against the
codebase (the single-consumer scan, the validation-seam fit, the
`fail()` signature compat, the smoke-bucket arithmetic, the auth
POST budget re-count, the pin-conflict scan) before execution.

## Phase 3 — Remediation (TDD; every fix pin observed RED first)

- **R1 — the redirect-target guard** (F1): RED first (17 unit cases —
  `safeRedirectPath is not a function` — plus 3 auth pins: the
  absolute-URL target, the protocol-relative target, and the legit
  internal round-trip; the two attack pins failed on the off-origin
  navigation, the /faq pin GREEN-on-arrival as the regression pin);
  fix: `safeRedirectPath` in `src/lib/validation.ts` (prefix checks
  for `//`, `/\`, non-`/` + a WHATWG dummy-origin re-parse — only
  same-site absolute paths survive, everything else falls back to
  `/dashboard`) + the one-line integration in `login-card.tsx`.
  GREEN 15/15.
- **R2 — the /demo outline** (F2): RED first (the outline pin read
  h1 → footer h3s with no h2); fix: an sr-only `<h2>` ("Request a
  demo") opens the form card — zero visual delta, the byte-pinned
  footer untouched. GREEN (one expectation correction en route: the
  footer's real column headings are Product/Legal/Social/Subscribe —
  the plan had guessed Company/Resources from memory; the DOM is the
  truth). F5 folded in: the reduced-motion `/demo` row (pin-only,
  GREEN-on-arrival).
- **R3 — the SDK hang ceiling** (F3): RED first (5 unit cases — the
  seam didn't exist); fix: `withTimeout` in `src/lib/workflow.ts` +
  `SDK_TIMEOUT_MS = 10_000` + the generate-route wrap (a timed-out
  call resolves with null → the existing "" → parse-throw → catch →
  template path; the route's structure unchanged). GREEN 5/5 under
  fake timers (fast pass-through, timer fallback, rejection
  propagation, timer clearing, the sane ceiling).
- **R4 — the Retry-After contract** (F4): RED first (the smoke pin:
  "429 carries a positive Retry-After header (got '')"); fix:
  `fail(code, message, status, headers?)` + the four rate-limited
  sites emit `{ "Retry-After": String(limit.retryAfterSec) }`. GREEN
  (deterministic smoke trip: the 6th newsletter POST → 429 → header
  600s).

**Mid-survey ZOMBIE-SERVER recurrence** (gotcha 26, with a new
twist): the post-fix ad-hoc survey on :3000 read PRE-FIX behavior
(heading-order violation, no Retry-After, sign-ins stuck on /login)
while the served static HTML carried the fix — the CSS
chunk-against-disk discipline was BLIND this round because only JS
changed (the CSS chunk name is content-hashed and unchanged; the old
process served FRESH static HTML from disk while hydrating it with
its own STALE in-memory JS, and its exhausted in-memory auth bucket
made every UI sign-in 429). ps/lsof//proc are process-blind in this
sandbox — killed by moving the survey to a FRESH PORT (:3010) with a
fresh boot: every probe GREEN. The gate suites were immune all along
(they boot their own servers). A related display-layer trap logged:
the Bash output layer can SWALLOW `[m`-style character pairs from
file contents — `const [mode, setMode]` displayed as `const ode,
setMode]` and looked like a syntax error while tsc/esbuild/build were
all green (hex-dump before believing a "corrupt" file).

## Phase 4 — Verification

- **Gate: ALL GREEN — 357 checks** (111 unit = 94 + 12 safeRedirectPath
  + 5 withTimeout; 196 e2e = 191 + 3 auth redirect pins + the demo
  outline pin + the reduced-motion /demo row; 50 smoke = 48 + the
  429-engages pin + the Retry-After pin).
- **Paired re-survey** (fresh :3010 boot): word parity 1.0000 on ALL 8
  routes; the four RED probe families re-run GREEN (the evil
  from_url variants all land on `/dashboard` with ZERO external
  requests; the legit `/faq` round-trips; the /demo outline reads
  h1 → h2 → footer h3s; the 6th newsletter POST returns 429 with
  `Retry-After: 600`); the axe sweeps: /demo ZERO violations,
  /dashboard ZERO; the console sweep ZERO noise on every touched
  route (the two from_url variants, /login, /demo); mobile-nav
  re-probed byte-identical with the corrected navigate-close GREEN.
- **Screenshots**: all 18 standard shots refreshed + the
  15-error-boundary recapture + the 16-demo-page shot (20 total) —
  VLM-verified (the demo page renders the complete dark-brand form
  with sample data; the login card is the clean reference slate; the
  boundary shot shows the branded dark recovery card; the dashboard
  control is clean).

## Phase 5 — Docs & handoff

PAD (revision block; ledger **D76–D79**; §7 counts + the new pin
families; §11 key files incl. the two new seams), AGENTS (counts;
**gotcha 29** — redirect-target guards + the hang class + the
docs-truth sweep + the two tooling traps), CLAUDE (session-15
context, counts), README (357 badge, the true Retry-After row, the
open-redirect-guard troubleshooting row, the auth feature row), the
SKILL doc v2.14.0 (**lessons 38–39**), the remediation plan
(checklist ticked), this log, and the repo `worklog.md`.
`.env.example` re-verified (no new env vars — `SDK_TIMEOUT_MS` is a
code constant, not a knob). Commit + SSH push per the runbook.
