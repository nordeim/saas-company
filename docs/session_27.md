# Session 27 Log — The LLM Abuse Ceiling, the Envelope's Cache Directive & the Framework Banner (the Session-16 Remediation, 2026-10-08)

Continuing from Session 25/26 (main @ 2601962 — the verified Session-15
push `0c1afcc` + the session-log updates). The mandate: refresh, review
the session-25/26 + remediation-plan-15 docs, re-audit against the live
(with the standing mobile-navigation and Tailwind-v4 vigilance),
remediate TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- `git pull` brought in `docs/session_26.md` (the prior session's
  transcript) + `docs/prompt-to-review-3.md`; the tree was clean at
  `2601962`. Root docs (AGENTS 29 gotchas / CLAUDE / README / PAD
  Session-15 revision / SKILL v2.14.0) + status docs (session_25/26,
  remediation-plan-15, worklog) reviewed; the `skills/` folder excluded
  from every toolchain (re-verified: tsconfig/eslint/vitest
  include-scope/playwright testDir).
- `.env` intact (`DATABASE_URL="file:../db/custom.db"`, AUTH_SECRET,
  AUTH_RATE_LIMIT_MAX=10) with the seeded `db/custom.db`; the
  exported-DATABASE_URL trap neutralized per-command (`env -u
  DATABASE_URL`) throughout — it was LIVE in this shell (verified
  before the first command).
- Zombie servers occupied :3000/:3010 from the prior session (the
  sandbox is process-blind); every ad-hoc survey ran on FRESH PORTS
  (:3020/:3021/:3022/:3023) with fresh boots per the gotcha-26/29
  discipline. The gate suites boot their own :3100/:3200.
- Baseline gate: lint ✓ typecheck ✓ Vitest 111/111 ✓ build ✓ smoke
  50/50 ✓ Playwright **191→196/196** — the inherited gate fully green
  (no flake).

## Phase 2 — The audit (the reference UNCHANGED; three new survey surfaces)

**Drift check** (8 routes, scroll-passed innerText, fresh :3020 boot):
word parity **1.0000 on every route** — the live is unchanged since
Session 15.

**Standing mobile-nav paired re-verification** (real-touch 390×844
contexts, fresh server): the clone's burger (342,16 24×24) taps open
into the byte-identical panel (0,56 390×397, seven 44px rows;
scroll-lock, Escape, resize guard all working). **No Tailwind v4
bug**; the live's burger remains pointer-blocked (D32). The corrected
Session-15 navigate-close probe re-run GREEN (the panel closes on
row-navigate; the old `navigateCloses: false` stays adjudicated as the
selector-typo artifact).

The Session-16 NEW surfaces — layers no prior session systematically
surveyed:

1. **The authenticated-endpoint abuse layer (cost control on the LLM
   route)**: `/api/workflows/generate` — the most expensive endpoint
   per call (a live SDK completion) — had **NO rate limit** while
   auth, newsletter, and demo were all limited. Probed empirically
   through in-page fetches: **15/15 rapid authenticated POSTs all
   200 in 8.1s — no 429 ever engaged**. **F1.**
2. **The response-cache directive layer**: Next.js protects its
   dynamic PAGES with `private, no-cache, no-store, max-age=0,
   must-revalidate` (verified on the /dashboard 307) — but
   route-handler JSON carries **no Cache-Control at all** (verified on
   /api/health 200 and /api/workflows 401). RFC 9111 permits
   heuristic storage of unmarked 200s by any cache. **F2.**
3. **The fingerprint/parity layer of the framework banner**: page
   responses advertised `X-Powered-By: Next.js` while the live ships
   none (`server: cloudflare`, `x-render-origin-server: uvicorn` —
   probed fresh). **F3.**

Also audited and found CLEAN or ADJUDICATED (non-findings, all with
evidence): **the hostile-content rendering layer** (a
`<script>alert("xss")</script>`-named workflow + a 120-char name + a
500-char description created, rendered, deleted: zero dialogs, the
name rendered as escaped text, `truncate` + `line-clamp: 2` working,
zero horizontal overflow at 1440px); **the fresh-user empty state**
(register → /dashboard renders "No workflows yet — compose your first
one above." / "No data yet." / "0 total" / the full stats row);
**the post-logout back-button** (sign out → `/` → browser-back lands
on `/login?from_url=/dashboard` with the login card — the server
gate's 307; no stale-dashboard bfcache leak); **IDOR scoping**
(`/api/workflows/[id]` GET/PATCH/DELETE all `findFirst({ where: { id,
userId } })`); **email normalization** (login + register both
`trim().toLowerCase()`); **the password upper bound** (≤128); **seed
idempotency** (wipes domain tables first); **the UI busy guards**
(the composer's synchronous `composing` re-entry check + `busyId`).

**Two survey-tooling traps discovered and neutralized** (now gotcha
30 / lesson 41): Playwright's `page.request` APIRequestContext
**refuses to SEND `Secure` cookies over plain http** while Chromium
page navigations treat `http://127.0.0.1` as a trustworthy origin and
DO send them — the v1 probe's authenticated API calls all 401'd as if
the session were broken (a tool artifact, not a defect; authenticated
probing must go through in-page fetches after a navigation). And an
API-register followed by a `/login` visit hits the S14 authenticated
gate (redirect to /dashboard — by design; navigate directly).

The remediation plan (`docs/remediation-plan-session16.md` F1–F3 →
R1–R4) was written against these findings, then validated against the
codebase (the single-seam scan — no route bypasses ok()/fail(); the
pin-conflict scan; the e2e generate-budget recount; the smoke-bucket
arithmetic; the docs-truth scan) before execution.

## Phase 3 — Remediation (TDD; every fix pin observed RED first)

- **R1 — the LLM endpoint's abuse ceiling** (F1): RED first (3 unit
  cases — `generateRateLimit is not a function` — plus the smoke pins:
  429-expected-got-200, the code pin, the Retry-After pin got ''); fix:
  `generateRateLimit` in `src/lib/rate-limit.ts` — **per-USER buckets**
  (`gen:${userId}` — the route is authenticated; a shared-egress office
  doesn't share one abuser's budget), 10/15min default,
  `GENERATE_RATE_LIMIT_MAX` override (the AUTH_RATE_LIMIT_MAX operator
  pattern; the Playwright webServer pins 50, the smoke server pins 2) —
  integrated after the session guard and before the body parse (the
  auth routes' own ordering), emitting the S15 429 contract
  (RATE_LIMITED + Retry-After). The CLIENT contract unchanged BY
  DESIGN: compose()'s `genRes.ok` degrade turns a 429 into the
  client-side template draft — the feature never hard-fails; the
  limiter only caps the LLM spend. GREEN: 114/114 unit, 60/60 smoke
  (the deterministic trip: POST #1/#2 allowed, POST #3 429 +
  Retry-After 899s), and the new e2e route-fulfilled-429 degrade pin
  (GREEN-on-arrival — pin-only).
- **R2 — the envelope's cache directive** (F2): RED first (the smoke
  Cache-Control pins got '' on all three layers); fix:
  `Cache-Control: private, no-store` at the single `ok()`/`fail()`
  seam — the 429 sites' Retry-After survives the spread-merge. GREEN
  (all three layers carry the directive).
- **R3 — the framework banner** (F3): RED first (the page-layer
  absence pin FAILED — the banner was present; the API-layer pin was
  GREEN-on-arrival — the API never carried it); fix:
  `poweredByHeader: false` in `next.config.ts`. GREEN (absent on both
  layers).

**Mid-survey ZOMBIE-SERVER avoidance**: with :3000/:3010 occupied and
the sandbox process-blind, every probe ran against fresh-port boots
(:3020–:3023) — no zombie artifacts contaminated any result. ONE
auth-bucket exhaustion hit mid-survey (the debug runs consumed the
per-IP budget) — resolved the documented way: a fresh port = a fresh
process = fresh buckets.

## Phase 4 — Verification

- **Gate: ALL GREEN — 371 checks** (114 unit = 111 + 3
  generateRateLimit; 197 e2e = 196 + the composer 429-degrade row; 60
  smoke = 50 + the generate-limiter trip ×2-allowed + 429 + code +
  Retry-After + the Cache-Control ×3 + the banner-absence ×2).
- **Paired re-survey** (fresh :3022 boot): word parity 1.0000 on ALL
  8 routes; the GREEN probe family — 15 rapid generate POSTs →
  **10 × 200 then 5 × 429** (the limiter engages exactly at the
  default; Retry-After 890s), the API list carries
  `Cache-Control: private, no-store`, no X-Powered-By on the page;
  the mobile-nav paired probe byte-identical with navigate-close
  GREEN; console sweep ZERO noise on /, /login, /demo, and
  /dashboard-with-a-real-composer (verified on a fresh-bucket server —
  the single 429 console line seen on the budget-exhausted server was
  the browser's inherent non-2xx resource log, the D68 adjudication
  family, survey-induced); axe /dashboard ZERO violations, /demo ZERO.
- **Screenshots**: all 20 refreshed (the 18 standard + the
  error-boundary recapture + the demo shot) — VLM-verified ×4 (the
  dashboard's canonical 5-active stats + composer + list + chart; the
  resilience banner over the intact workspace; the demo form with
  sample data; the clean login card). **One workspace-hygiene
  discovery en route**: the DEV `db/custom.db` had DRIFTED to
  all-paused across Sessions 12–15's probe traffic (every seeded
  workflow paused — the resilience screenshot's Pause-button locator
  found nothing and exposed it); re-seeded to the canonical workspace
  (`npm run db:push && npm run db:seed`) before the refresh. The
  e2e/smoke suites were immune all along (they boot fresh DBs).

## Phase 5 — Docs & handoff

PAD (revision block; ledger **D80–D82**; §7.1/§7.2/§7.3 counts; §8.2
env table + `GENERATE_RATE_LIMIT_MAX`; §11 key files incl. the three
new seams), AGENTS (counts; **gotcha 30** — the expensive-endpoint
ceiling + the Secure-cookie/page.request trap + the dev-DB drift
discipline), CLAUDE (session-16 context + the pre-push checklist
counts), README (371 badge, the composer's rate-limit row in features
+ the API table + troubleshooting, the no-store/banner additions to
the production-headers row), the SKILL doc v2.15.0 (**lessons
40–41**), `.env.example` (+`GENERATE_RATE_LIMIT_MAX`), the remediation
plan (checklist ticked), this log, and the repo `worklog.md`. Commit +
SSH push per the runbook.
