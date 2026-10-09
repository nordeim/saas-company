# CLAUDE.md — SAAS Company (NovaAI)

> Project-specific conventions for AI coding agents working in this
> repository. Companion documents: `README.md` (user-facing), `AGENTS.md`
> (operator quick reference), `Project_Architecture_Document.md` (the
> engineering source of truth).

## Core Identity & Purpose

This repository is a **production-grade, self-hosted clone of the reference
SaaS marketing site** `https://saas-company.base44.app/` (the "NovaAI"
product page) — rebuilt as a single deployable Next.js 16 application —
**plus a functional superset**: the marketing site's dead demo links are
replaced by real features (authentication, a persisted workflow dashboard
with an AI composer, newsletter/demo capture, SEO surfaces).

Visual parity is a first-class requirement: the dark canvas, the Vend Sans
type system (Google Fonts' actual variable font, wght 300-700 — Session 5
forensics), the magenta/electric-blue brand palette, the
animated hero (looping video, shimmer badge, gradient heading), the mobile
burger dropdown, and the copy are all measured from the live reference. When
the reference and generic best practice conflict, the reference wins; when
parity and a functional superset conflict, document the deviation (see the
PAD's deviations table) rather than silently picking a side.

## The Stack (versions from package-lock.json)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | `output: "standalone"`, `outputFileTracingRoot` pinned |
| Runtime | React 19 + TypeScript 5 (strict, `noImplicitAny: false`) | |
| Styling | Tailwind CSS 4 (CSS-first) | tokens in `src/app/globals.css` `@theme`; NO config file |
| Data | Prisma 6 + SQLite | `db/custom.db` at repo root; `db push`, no migrations |
| Auth | Node crypto (scrypt + HMAC-SHA256 cookies) | zero external auth services |
| AI | z-ai-web-dev-sdk (server-side only) | deterministic fallback in `src/lib/workflow.ts` |
| Tests | Vitest 5 (unit) + Playwright 1.63 (E2E) + bash/curl smoke (117) | 156 unit + 200 browser checks |
| Fonts | Self-hosted Google "Vend Sans" (variable 300-700) + next/font (Playfair/DM Serif) | the exact gstatic bytes the live serves |

## Foundational Principles

### 1. Verify, then claim

Never state something "works" without executing it. The gate order (below)
is the definition of done. `next.config.ts` sets `ignoreBuildErrors: true`,
so **`npm run typecheck` is the only type gate** — never skip it because the
build passed.

### 2. The envelope is the API contract

Every route handler returns `ok(data)` or `fail(code, message, status)` from
`src/lib/api.ts`. Protected handlers start with
`const guard = await requireSession(); if (!guard.user) return guard.response;`.
The frontend treats `ok: false` as a user-visible error string, never an
exception.

### 3. Parity is measured, not remembered

Design tokens, section copy, and interaction structures were captured from
the live reference with computed-style extraction and VLM side-by-side
comparisons (the reference shots and comparison logs live outside the repo).
Changes to chrome (nav, hero, sections) must re-verify against the live
site — agent-browser at 1440/768/390 widths — before being called done.
Computed-style assertions that depend on color serialization should accept
both the rgba and oklab spellings (v4 serializes alpha colors through
oklab; rendering is identical).

### 4. Degrade, never fail

External dependencies (the AI SDK) sit behind sanitizers and deterministic
fallbacks. An environment without SDK access gets the template workflow —
never a 500.

### 5. Security rules (non-negotiable)

- Every input validated server-side (`src/lib/validation.ts`): trim, length
  caps, enum membership, email shape.
- Passwords: scrypt + per-user salt; sessions: HMAC-signed tokens,
  timing-safe comparisons, httpOnly cookies (`src/lib/auth.ts`).
- Auth + newsletter endpoints are rate-limited per IP
  (`src/lib/rate-limit.ts`, pure and unit-tested).
- LLM output is untrusted: `sanitizeGeneratedWorkflow` clamps before any
  DB write.
- No secrets in the repo: `.gitignore` rejects `.env`, `*.key`,
  `ssh-key.txt`; keys arrive out-of-band per the SSH-wrapper runbook.

## Implementation Standards

### File organization

```
src/
  app/                      # routes: /, /login, /faq, /privacy, /terms,
    # /accessibility, /refund-policy, /dashboard, not-found, sitemap, robots
    api/                    # health, auth/*, newsletter, demo, workflows/*
  components/
    site/                   # navbar (mobile menu), footer, logo, reveal, legal view
    sections/               # landing: hero, dashboard-preview, logo-cloud,
    # problem, features, how-it-works, pricing, testimonials, cta
    auth/ dashboard/        # (login card lives in app/login; dashboard-app here)
  lib/                      # domain: auth, api, db, db-path, rate-limit,
    # pricing, validation, workflow, legal-content, faq-content, utils
prisma/                     # schema.prisma + idempotent seed.ts
tests/unit/ (via src/lib/*.test.ts + tests/db-path.test.ts)  # Vitest
tests/e2e/                  # Playwright specs + global-setup
scripts/smoke-test.sh       # 38-check curl suite against the prod build
```

### Naming & conventions

- Components: `PascalCase.tsx` named exports; pages: default exports.
- Pure domain logic lives in `src/lib/*.ts` with a co-located `*.test.ts`.
- Interactive chrome is `"use client"`; pages that need the session are
  server components that `redirect()` before render.
- Statuses: workflows are `active | paused | draft` (validated in
  `src/lib/workflow.ts`); pricing periods are `monthly | annual`.

### Styling rules (Tailwind v4)

- Tokens ONLY in `@theme` (globals.css): brand `--color-primary: #8624ff`
  (the reference's `:root` 267° purple — NOT the unmounted `.dark` block's
  magenta), `--color-accent`/`--color-electric-blue: #0055ff`,
  `--color-violet: #d500ff`, surfaces, fonts. Full color values, never bare
  HSL triplets (the transparent trap). The reference uses the SAME face
  ("Vend Sans", the Display cut) for headings AND body.
- The reference's custom classes live in globals.css:
  `.workflows-gradient-text`, `.animated-gradient-text`,
  `.border-shimmer-*`, `.anim-logo-*`, `.get-started-shimmer`,
  `.skeleton-wave`, `.accordion-panel`, the marquee/float/pulse-glow
  animations. Reuse them; don't re-derive.
- Measured chrome geometry is pinned by the e2e specs (nav z-50, mobile
  44px rows, tablet pill `bg-white/10`) — treat spec failures there as
  parity regressions.

### Testing requirements

- New pure logic → unit spec in `src/lib/` (red → green).
- New endpoints → extend `scripts/smoke-test.sh` (envelope + validation +
  happy path) and, where UI-visible, the Playwright suite.
- E2E runs against the production standalone build on :3100 with its own
  `db/e2e.db` (global-setup pushes + seeds it). One worker — the specs share
  the seeded SQLite file.
- Bug fixes require a failing test before the fix (regression discipline).

## Pre-Push Checklist

- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] `npm run test` → 156/156 PASS
- [ ] `npm run build` compiles clean
- [ ] `./scripts/smoke-test.sh` → 117/117 PASS
- [ ] `npm run test:e2e` → 200/200 PASS (needs the build first)
- [ ] Schema changes regenerated (`npx prisma generate`) and reseeded
- [ ] No `.env`, keys, or `db/*.db` staged (`git status` review)
- [ ] Commit message follows `:art: feat:` / `:memo: docs:` / `:bug: fix:` on `main`

## Known Context

- **Session 23 (2026-10-09) remediation** — see
  `docs/remediation-plan-session23.md`: a client-side failure-class
  honesty audit (the CLIENT twin of S22's server race — the
  "optimistic-UI semantics" candidate the Session-42 log suggested)
  found and fixed two defects: **the missing honest-404 dispatch** —
  S22 made the raced PATCH/DELETE answer the honest 404, but the
  client's catch treated it like a network fault: the retry-lie
  banner ("Could not update that workflow. Try again." — every retry
  404s forever) plus the ghost row staying mounted (probed with two
  browser contexts). The fix gives the 404 class its own UI contract
  (the S13 401-sentinel's pattern): PATCH-404 → the row dropped
  locally + a re-sync + the polite role=status announce ("… is no
  longer in the workspace."); DELETE-404 → the idempotent-success
  contract ("… was already removed."); plus the SessionExpired
  early-return in every catch — D99. **The refresh() ordering guard**
  — no in-flight guard: two concurrent actions on different rows
  fired two refresh GETs, and a delayed stale snapshot landing last
  RESURRECTED the deleted row (probed deterministically via
  route-delay); now a useRef sequence counter drops any response
  superseded by a newer refresh — D100. ALSO fixed (survey tooling,
  gotcha-30 family): the capture script's error-boundary mock used
  the glob `**/api/workflows` which does NOT match the [id] routes —
  the mock's own Pause-click escaped to the real server and paused a
  dev-DB row across two sessions (the seed checksum covers
  names/rows, not statuses); the mock now covers [id], and the dev DB
  is canonical with before/after verification. +3 e2e checks (the
  session23-honesty suite — two-context ghost-row pins + the
  delayed-stale resurrection pin; one pin bug caught BY the pins:
  Next's route announcer is itself a role=alert element — filter
  alert-count pins by text); gate: **473 checks** (156 unit + 117
  smoke + 200 e2e); 20 screenshots refreshed (VLM ×5 — after
  adjudicating the SIXTH check-prompt drift: a "missing 3 workflow
  cards" verdict, disproven by the 900px viewport cut).

- **Session 22 (2026-10-09) remediation** — see
  `docs/remediation-plan-session22.md`: a mutation-concurrency audit
  (the RACE class on the UPDATE/DELETE side — S17's register race closed
  CREATE's P2002 window; the `[id]` routes still ran read-check-act;
  plus the S21-suggested performance-budget survey) found and fixed one
  defect + one pin gap: **the `[id]` mutation race** — a DELETE
  committing while a slow under-ceiling PATCH body parsed threw
  UNCLASSIFIED P2025 → the 500 INTERNAL_ERROR envelope (probed 3/3; the
  parallel DELETE double-fire hit 500 in 2/5). The fix carries the
  ownership predicate IN the write: `updateMany`/`deleteMany` with
  `userId` in the WHERE (count 0 → the honest 404; neither ever throws
  P2025 — the race is closed by construction), with the empty-patch
  `{}` body keeping its 200 + row contract (Prisma's
  `updateMany({data:{}})` returns count 0 even for an existing row).
  **The cross-user ownership battery** — the IDOR guard had NO
  wire-level pin anywhere; the smoke suite now registers users B and C
  and pins user A on B's row → 404 ×3 (+ the survived row). The
  performance layer adjudicated CLEAN (landing LCP 732ms / 860 DOM
  nodes; dashboard LCP 120ms / 314 nodes — the S21 ceiling holding; the
  1.9MB hero video is the reference's own parity asset); the SEO
  surface re-verified; PATCH/DELETE limiters adjudicated NON-findings
  (no row growth). Gate: **470 checks** (156 unit + 117 smoke incl. the
  14 concurrency/ownership pins + 197 e2e); 20 screenshots refreshed
  (VLM-verified ×5 — after adjudicating the FIFTH check-prompt drift: a
  FAIL-with-empty-DEVIATIONS on the dashboard shot, disproven by the
  open-description probe + the untouched bytes + the e2e suite).

- **Session 21 (2026-10-09) remediation** — see
  `docs/remediation-plan-session21.md`: a data-volume audit (the first
  systematic survey of the OUTPUT side of the wire — what a response may
  RETURN, what a page query may FETCH, and what the client may RENDER;
  the OUTPUT twin of S20's request-size survey) found and fixed two
  defects: **the unbounded workflows list** (probed on a probe-only DB
  with 400 seeded workflows: `GET /api/workflows` answered a **134.5KB
  body** — `findMany` with no `take`, linear growth, no ceiling — and
  the dashboard mounted **400 article cards (9,649 DOM nodes)**; now
  `MAX_WORKFLOW_LIST = 100` rides SQL `take` in BOTH the GET route and
  the dashboard page query, with the envelope gaining an additive
  top-level `meta` sibling of `data` (`ok()` now accepts
  `{ headers, meta }`): the capped GET ships `meta: { total, stats }`
  — the TRUE total and the honest server-side aggregates via the pure
  `statsFromAggregate()` — because a ceiling without honest aggregates
  would silently turn the four stat cards into subset summaries; the
  client consumes `meta` in `refresh()` with the list-derived memo as
  the FALLBACK (the e2e error-boundary mocks fulfill with bare arrays
  and keep working); the list header reads the TRUE total; a capped
  workspace renders "Showing the 100 most recent of N workflows.";
  re-probed: 100 rows / 33.7KB / `meta.total: 400` / 100 articles
  (2,584 DOM nodes) — D95) and **the unthrottled workflow creation**
  (`POST /api/workflows` was the ONLY unthrottled mutation in the app —
  auth, newsletter, demo, and generate all carry limiters; now
  `workflowRateLimit(userId)`: 30 creates per USER per 15 minutes,
  `WORKFLOW_RATE_LIMIT_MAX` override, the 429 `RATE_LIMITED` envelope
  with the S15 `Retry-After` contract — D96). ALSO: the standing
  battery re-verified — word parity 1.0000 ×8 (reference UNCHANGED),
  the mobile-nav byte-identical (7 rows × 44px, REAL tap; no Tailwind
  v4 bug), D62 holds; adjudicated CLEAN with evidence: the PATCH
  numeric-integrity layer (runs/successRate/timeSavedHours are
  server-controlled, not patchable), the SEO static-asset layer
  (og-image a real 1200×630 PNG; manifest valid; robots/sitemap the
  honest superset semantics), the logging-hygiene layer (the probe
  server's log after the full survey traffic: boot banner only, zero
  PII), the hero-video layer (1.9MB, muted + playsInline), and the
  dependency currency (the documented F10 chain only; majors-only).
  Gate: **456 checks** (156 unit incl. the 11 meta/ceiling/limiter
  pins + 197 e2e unchanged + 103 smoke incl. the 9 data-volume/creation
  pins); 20 screenshots refreshed (VLM-verified ×5 — after adjudicating
  the FOURTH check-prompt drift: the login chip's actual LIGHT
  slate-100→200 gradient read against a prompt that said "gradient
  slate").

- **Session 20 (2026-10-09) remediation** — see
  `docs/remediation-plan-session20.md`: a method-and-payload audit (the
  first systematic survey of the METHOD-MISMATCH layer — the
  framework-owned answer for unexported methods sits BELOW every
  handler, the one layer `apiRoute` never sees — and the REQUEST-SIZE
  layer — whether anything caps a POST body before the parse) found
  and fixed two defects: **the method-mismatch bare-405 violation**
  (probed: 11 method-mismatch requests — GET on the six POST-only
  routes, POST on the two GET-only routes, PUT/PATCH/DELETE on
  workflows, HEAD on a POST-only route — all answered a BARE 405 with
  an EMPTY body, no content-type, no `Allow`, no cache-control; now
  `methodGuard(allow)` + `optionsGuard(allow)` in `src/lib/api.ts`:
  every route file exports a guard for each unimplemented method — the
  405 METHOD_NOT_ALLOWED envelope + the RFC 9110 `Allow` header +
  no-store via the fail() seam; the explicit OPTIONS export keeps the
  204 preflight honest (Next's auto-answer enumerates exports and would
  over-report) — D93) and **the unbounded request-size parse** (a 50MB
  login body was fully buffered and JSON-parsed in 314ms — no ceiling
  in code or docs; now `bodyTooLarge(request)` + MAX_JSON_BODY_BYTES
  (128KB) placed immediately BEFORE `request.json()` in each of the 7
  body-parsing handlers — a declared over-ceiling body answers 413
  PAYLOAD_TOO_LARGE (re-probed: 91ms, nothing buffered); chunked
  bodies are the proxy's residual (DEPLOYMENT.md §2) — D94). ALSO: the
  standing battery re-verified — word parity 1.0000 ×8 (BOTH sides
  rendered in Chromium — a raw-fetch probe reads the live's
  un-hydrated SPA shell), the mobile-nav byte-identical (7 rows — 6
  anchors + the Log In button — 44px each; no Tailwind v4 bug), D62
  holds (the SPA-404 adjudicated on the RENDERED content); adjudicated
  CLEAN: the unknown-API-route layer (the branded 404 page), the
  OPTIONS auto-answer, the cookie attributes (httpOnly/Lax/secure),
  scrypt params, the register-409 by-design trade-off, dependency
  currency (audit unchanged; outdated majors-only). Gate: **436
  checks** (145 unit incl. the 8 api-guards pins + 197 e2e unchanged +
  94 smoke incl. the 15 method/payload pins); 20 screenshots refreshed
  (VLM-verified ×5 — after adjudicating three check-prompt drifts:
  the hero fold, the login card's actual S-logo + "Welcome to SAAS
  Company" contract, and its Google→or→email order).

- **Session 19 (2026-10-08) remediation** — see
  `docs/remediation-plan-session19.md`: a crash-path-honesty audit (the
  first systematic survey of what the wire carries when a route's
  dependencies CRASH, not merely when input is wrong — plus the
  server-component half of the S13 branded-boundary goal) found and
  fixed two defects: **the crash-path envelope violation** (probed
  with an unwritable DATABASE_URL: SEVEN endpoints answered a BARE 500
  with an EMPTY body and NO content-type — login, register,
  newsletter, demo, me-with-session, workflows GET/POST — violating
  the invariant "no route returns bare JSON" on exactly the worst-day
  paths; now `apiRoute()` in `src/lib/api.ts` wraps every exported
  handler in all 10 route files: what escapes becomes the
  INTERNAL_ERROR envelope AND the stack is RESTORED to fd 2 — Next
  only logs UNhandled route errors, so catching without re-logging
  would REMOVE the operator's stack; classification inside handlers
  untouched — D91) and **the unbranded server-crash page** (the
  dashboard page's own DB failure answered Next's `__next_error__`
  document; now two NARROW try/catch blocks — deliberately narrow:
  `redirect()` throws a control error a wide catch would swallow,
  breaking the S14 authenticated gate — render the branded
  `dashboard-unavailable.tsx` degraded view, status 200 by design
  (the S18 health-probe pattern; `/api/health`'s `db` field owns the
  alerting) — D92). ALSO: the dependency-currency layer adjudicated
  CLEAN (npm audit: the documented F10 chain only; npm outdated:
  majors only); the standing battery re-verified (word parity 1.0000
  ×8, mobile-nav byte-identical, D62); two survey-tooling lessons:
  the zombie-port trap recurred AND a survey script that DEFAULTS its
  probe port evaluated the zombie while its runner booted a healthy
  server elsewhere (pass base URLs EXPLICITLY — gotcha 33). Gate:
  **413 checks** (137 unit incl. the 5 apiRoute pins + 197 e2e
  unchanged + 79 smoke incl. the 13 broken-DB pins on the third
  mini-server :3230); 20 screenshots refreshed (VLM-verified ×5).

- **Session 18 (2026-10-08) remediation** — see
  `docs/remediation-plan-session18.md`: a deployment-honesty audit (the
  first survey of what the DEPLOYMENT's own signals can see: the health
  probe, the boot warning, the Docker first-run, and the rate limiter's
  IP trust model) found and fixed four defects: **the DB-blind health
  probe** (a server with an unwritable DATABASE_URL answered
  `/api/health` 200 ok while login returned a bare 500 — the Docker
  HEALTHCHECK inherited the blindness; now the envelope carries
  `db: "up"/"down"` from a SELECT 1 raced against 1.5s, the status
  deliberately stays 200 — D87), **the silent AUTH_SECRET fallback**
  (production boots without the var signed sessions with the PUBLIC
  repo constant with zero runtime signal; now `src/instrumentation.ts`
  writes the FORGEABLE warning DIRECTLY to fd 2 — the Next-16 runtime
  captures BOTH console.* AND process.stderr.write from bundled code,
  and a dynamic import("node:fs") races the turbopack chunk loader at
  boot; only the static import + fs.writeSync(2, …) reliably lands —
  D88), **the broken Docker first-run** (the S17 runbook's one-off init
  could not work — the runner ships neither the prisma CLI nor the
  schema; now the build stage pushes the schema into /app/db/custom.db
  and the runner COPYs it — a fresh NAMED volume seeds itself with zero
  init commands; bind mounts document the checkout path; the
  first-account-before-closing-registration note — D89), and **the
  half-documented IP trust model** (clientIpOf trusts the first
  X-Forwarded-For hop verbatim — direct exposure mints a fresh auth
  bucket per header-rotated request; DEPLOYMENT.md §2 + README now
  state the proxy requirement — D90). ALSO: `next build` COPIES the
  repo `.env` into `.next/standalone/` (a standalone-directory deploy
  ships the build-time env incl. AUTH_SECRET); one zombie-server
  recurrence caught by the parity battery itself (the fresh-port
  discipline — the kill+wait pattern is unreliable in this sandbox).
  Gate: **395 checks** (132 unit incl. the 6 instrumentation pins +
  197 e2e unchanged + 66 smoke incl. the health-db pin); 20
  screenshots refreshed (VLM-verified ×5).

- **Session 17 (2026-10-08) remediation** — see
  `docs/remediation-plan-session17.md`: an account-enumeration-timing +
  registration-concurrency + registration-access-control +
  deployment-artifact audit (four layers no prior session surveyed:
  the TIMING side of an identical envelope — a 401 that always says
  "Invalid email or password" can still leak WHICH emails exist through
  latency (CWE-208); the RACE class on the write paths — the
  findUnique→create TOCTOU window; the PAD §10 open-registration
  MEDIUM, the ledger's oldest open item; and the §10 no-Dockerfile
  LOW) found and fixed four defects: **the login timing side-channel**
  (the unknown-email path skipped scrypt — 3.5ms vs 34.1ms medians, a
  9.8x delta behind a byte-identical 401; now `dummyPasswordHash()` in
  `src/lib/auth.ts`: a module-init salt:hash decoy burned
  unconditionally so the timing profile is flat — post-fix probe ratio
  1.0x, pinned by the suite's first timing pin, 7+7 curl medians under
  2.5x — D83); **the register TOCTOU race** (10 truly-parallel
  independent-socket POSTs → {"201":1,"409":8,"500":1} — the loser's
  unhandled P2002 was a BARE 500 with an EMPTY body and no
  content-type; now `isUniqueConstraintError()` in `src/lib/db-errors.ts`
  + the create catch → the exact sequential-duplicate 409 EMAIL_TAKEN,
  every other error rethrows — D84; survey fact: undici's fetch pool
  serializes on one socket, true wire-level concurrency needs
  independent sockets); **the open registration** (the PAD §10 MEDIUM
  since the ledger began; now `registrationOpen()` + the register-route
  gate: only the exact `ALLOW_REGISTRATION="false"` closes with 403
  REGISTRATION_CLOSED — default OPEN preserves every existing contract;
  login stays open on a closed deployment; the login card surfaces the
  message verbatim with zero client changes — D85); and **the missing
  Dockerfile** (the §10 LOW; now the multi-stage standalone-artifact
  `Dockerfile` + `.dockerignore` + DEPLOYMENT.md §8 — honestly labeled
  NOT build-tested in the authoring environment, no Docker daemon —
  D86). ALSO: word parity 1.0000 on all 8 routes (reference UNCHANGED),
  the mobile nav byte-identical with real-touch contexts (no Tailwind
  v4 bug; the live's burger remains pointer-blocked, D32); the
  Subscriber upsert + DemoRequest model adjudicated CLEAN (no other
  P2002 exposure); ONE zombie-server twist — a syntax-error crash
  mid-script orphaned the smoke script's closed-gate server (the
  abort happens AFTER the boot lines but BEFORE the kill; the orphan
  later answered a fresh boot's health check on the same port — the
  closed-gate server moved to :3220). Gate: **388 checks** (126 unit
  incl. the dummy-hash + registration-gate + db-errors pins + 197 e2e
  unchanged + 65 smoke incl. the timing-parity, race-envelope, and
  closed-gate pins); 20 screenshots refreshed (VLM-verified).

- **Session 16 (2026-10-08) remediation** — see
  `docs/remediation-plan-session16.md`: an authenticated-endpoint-abuse +
  response-cache-directive + framework-banner audit (three layers no
  prior session surveyed: COST CONTROL on the LLM route — auth,
  newsletter, and demo were all rate-limited while the most expensive
  endpoint per call was the only unlimited one; the caching directives
  of the API envelope — Next.js protects its dynamic PAGES with
  no-store but NOT route-handler JSON; and the fingerprinting layer of
  the response banner) found and fixed three defects: **the unlimited
  LLM composer** (the probe drove 15/15 rapid authenticated POSTs to
  `/api/workflows/generate` — all 200 in 8.1s, no 429 ever engaged;
  now `generateRateLimit` in `src/lib/rate-limit.ts` — **per-USER**
  buckets (the route is authenticated — the honest unit), 10/15min
  default, `GENERATE_RATE_LIMIT_MAX` override, 429 + `Retry-After`
  (the S15 contract); the CLIENT contract unchanged BY DESIGN:
  compose()'s `genRes.ok` check degrades a 429 into the client-side
  template draft, so the feature never hard-fails — the limiter only
  caps the LLM spend — pinned by the new e2e route-fulfilled-429
  degrade row + the deterministic smoke trip at
  `GENERATE_RATE_LIMIT_MAX=2` — D80); **the missing cache directive**
  (`Cache-Control: private, no-store` now emitted at the single
  `ok()`/`fail()` seam — authenticated JSON previously carried NO
  caching directive while RFC 9111 permits heuristic storage of
  unmarked 200s; the 429 sites' Retry-After survives the merge — D81);
  and **the X-Powered-By banner** (`poweredByHeader: false` — the live
  ships none: `server: cloudflare`; fingerprinting the framework on
  every page response was pure downside — D82). ALSO adjudicated CLEAN
  with evidence: hostile-content rendering (a `<script>`-named workflow
  + max-length fields: zero dialogs, escaped-as-text, truncate +
  line-clamp + zero horizontal overflow), the fresh-user empty state,
  the post-logout back-button (server 307 → login, no stale bfcache
  leak), IDOR scoping, email normalization, password bounds, seed
  idempotency, UI busy guards. ONE workspace-hygiene discovery: the
  DEV `db/custom.db` had drifted to all-paused across S12–S15's probe
  traffic — re-seeded (the e2e/smoke suites are immune: fresh DBs per
  run). TWO survey-tooling traps: Playwright's `page.request` refuses
  to SEND `Secure` cookies over plain http (Chromium navigations treat
  127.0.0.1 as trustworthy and DO — probe authenticated APIs through
  in-page fetches), and after an API-register, navigate DIRECTLY (a
  /login visit hits the S14 authenticated gate). Gate: **371 checks**
  (114 unit incl. the generateRateLimit pins + 197 e2e incl. the
  composer 429-degrade row + 60 smoke incl. the generate-limiter trip,
  Retry-After, no-store ×3, and banner-absence ×2); 20 screenshots
  refreshed (VLM-verified); word parity 1.0000 on all 8 routes
  (reference UNCHANGED), mobile nav byte-identical (no Tailwind v4
  bug; live's burger D32-blocked), axe /dashboard + /demo zero,
  console zero-noise on every touched route.

- **Session 15 (2026-10-08) remediation** — see
  `docs/remediation-plan-session15.md`: a REDIRECT-TARGET +
  superset-a11y + external-dependency-hang + rate-limit-response
  audit (four layers no prior session surveyed: WHERE a user-controlled
  redirect parameter can ship the browser — the `from_url` open-redirect
  class (CWE-601); the axe floor of the SUPERSET-only routes (D63's
  live-parity adjudication covers live-mirrored routes only); the HANG
  class for external deps — degrade-not-fail covers failures, not
  hangs; and the 429 response headers the README promised but no route
  emitted) found and fixed four defects: **the open redirect**
  (`/login?from_url=https://evil.example/phish` shipped the
  just-authenticated browser off-site — confirmed in the pre-fix
  network log; now `safeRedirectPath` in `src/lib/validation.ts`:
  prefix checks + a WHATWG dummy-origin re-parse, only same-site
  absolute paths survive, everything else falls back to /dashboard —
  D76, 12 unit cases + 3 auth pins incl. the legit /faq round-trip);
  **the /demo heading-order violation** (the h1-only superset page put
  the byte-pinned footer's first h3 after an h1 with no intervening h2;
  now an sr-only h2 opens the form card — axe re-run: ZERO violations,
  matching the dashboard — D77); **the SDK hang** (/api/workflows/generate
  awaited the LLM SDK with no timeout; now the `withTimeout` seam in
  `src/lib/workflow.ts` resolves with the deterministic template after
  SDK_TIMEOUT_MS (10s) — a hang is a DEGRADE condition, a rejection
  still propagates — D78, fake-timer unit pins); and **the missing
  `Retry-After` header** (`fail()` now accepts response headers; all
  four rate-limited sites emit `Retry-After: <sec>` on 429 — D79,
  deterministic smoke trip of the newsletter bucket). ALSO: word
  parity 1.0000 on all 8 routes (reference UNCHANGED), the mobile nav
  byte-identical (no Tailwind v4 bug; live's burger D32-blocked), the
  Session-11 probe's `navigateCloses: false` adjudicated a selector-typo
  artifact (the corrected probe GREEN); one zombie-server recurrence
  caught mid-survey — the chunk-against-disk check was BLIND (only JS
  changed, so the CSS chunk name was unchanged) and ps//proc are
  process-blind in this sandbox, so the survey moved to a FRESH PORT.
  Gate: **357 checks** (111 unit + 196 e2e incl. the redirect-target
  pins, the outline pin, and the reduced-motion /demo row + 50 smoke
  incl. the Retry-After pins); 20 screenshots refreshed (VLM-verified).

- **Session 14 (2026-10-08) remediation** — see
  `docs/remediation-plan-session14.md`: a FEATURE-REACHABILITY +
  authenticated-navigation + status-message + reduced-motion-contract
  audit (four layers no prior session surveyed: is every shipped
  superset feature REACHABLE from a URL — grep every API route for a UI
  consumer; what `/login` does for an ALREADY-authenticated visitor;
  whether successful dashboard mutations announce themselves (WCAG
  4.1.3); and the reduced-motion contract, verified clean but unpinned)
  found and fixed three defects: **the dead `/api/demo` endpoint**
  (validation + rate limit + the DemoRequest model shipped complete with
  ZERO UI consumers — dead code dressed as a superset; now `/demo`, a
  dark-brand Book-a-Demo page mirroring the API's own validation with the
  composer's catch contract + a polite role=status confirmation + a
  sitemap entry — the live 404s /demo so it's pure superset; pinned by
  `tests/e2e/demo.spec.ts`); **the authenticated `/login` card** (a
  signed-in visitor got the login form — every production auth system
  sends them to the workspace; `login/page.tsx` is now a thin async
  server gate `sessionUserId()` → `redirect("/dashboard")` over the
  byte-pinned card split unchanged into `login-card.tsx`; pinned in
  `tests/e2e/auth.spec.ts`); and **the dashboard's silent successes**
  (zero aria-live regions — a screen-reader user's pause/resume/delete/
  compose changed the stats in silence; now a sr-only polite
  `role="status"` region announces every successful mutation, pinned in
  the dashboard suite). ALSO: the reduced-motion contract pinned for the
  first time (`tests/e2e/reduced-motion.spec.ts` — content visible
  without scrolling + the loop clamp, whose computed value serializes as
  "1e-05s"); the standing battery re-verified — word parity 1.0000 on
  all 8 routes (reference UNCHANGED), the mobile nav byte-identical
  (no Tailwind v4 bug; live's burger D32-blocked); one ZOMBIE-SERVER
  recurrence killed by PID (the post-rebuild boot silently lost
  EADDRINUSE — gotcha 26); the 404-route console log adjudicated
  live-parity (the live's own 404 ships two 401s, D68). Gate: **333
  checks** (94 unit + 191 e2e incl. the demo + reduced-motion suites +
  48 smoke incl. the /demo page pin); 20 screenshots (18 refreshed +
  the boundary recapture + the new demo-page shot, VLM-verified).

- **Session 13 (2026-10-08) remediation** — see
  `docs/remediation-plan-session13.md`: a SESSION-LIFECYCLE + render-fault
  + focus-management audit (three layers no prior session surveyed: what
  the signed-in dashboard does when the cookie EXPIRES mid-tab; what
  renders on a client-side render fault; where focus lands when the
  mobile menu Escape-closes) found and fixed three defects: **the
  session-expiry lying banner** (cookie-expired Pause/Delete/Compose each
  said "Try again." — but every retry 401s forever; all dashboard fetches
  now route through `apiFetch`, which redirects a 401 to
  `/login?from_url=/dashboard` — the SAME contract as the server-side
  gate; a network ABORT keeps the Session-12 banner contract — the two
  failure classes stay distinct, pinned pairwise by
  `tests/e2e/session-lifecycle.spec.ts`); **the missing error
  boundaries** (any render fault surfaced Next.js's default unbranded
  "This page couldn't load" page — reachable via a contract-violating API
  row (`runs: null` passes the `Array.isArray` guard and crashes the
  article template); now a branded dark recovery card
  (`src/app/error.tsx` + `global-error.tsx`): role="alert" + Try again
  (`reset()` restores the server-provided state) + Go-to-home, plus a
  `refresh()` shape-guard; pinned by `tests/e2e/error-boundary.spec.ts`
  with a route-fulfilled contract violation); and **the mobile menu's
  Escape focus loss** (the focused link unmounted and `activeElement`
  fell to `body` — WCAG 2.4.3; Escape now returns focus to the burger via
  `burgerRef`, pinned in the mobile-navigation suite). ALSO: the standing
  battery re-verified — word parity 1.0000 on all 8 routes (reference
  UNCHANGED), the mobile nav byte-identical with real-touch contexts (no
  Tailwind v4 bug; the live's burger remains pointer-blocked, D32), every
  route's console zero-noise, and one ZOMBIE-SERVER recurrence killed by
  port mid-survey (gotcha 26's CSS-chunk-against-disk discipline). Gate:
  **321 checks** (94 unit + 180 e2e incl. the session-lifecycle +
  error-boundary suites + 47 smoke); 19 screenshots (18 standard + the
  branded-boundary evidence shot, VLM-verified).

- **Session 12 (2026-10-08) remediation** — see
  `docs/remediation-plan-session12.md`: a CONSOLE-NOISE-v2 sweep (the
  first to capture `unhandledrejection` + `console.error/warn` alongside
  pageerror, on every route AND during interactions), the first
  network-level FAULT-INJECTION of the dashboard's mutation handlers, and
  the first preload-emission survey found and fixed three defects: **the
  flaky FAQ motion-parity pin** (its pre-reveal phase sampled a transient
  pre-hydration state right after `goto` — the first FAQ item is in the
  initial viewport, so the rAF reveal could settle before the evaluate
  landed under load (2/10 isolated + a full-suite failure); the
  pre-reveal contract now pins through the STATIC HTML and the settled
  check polls); **the Gasparyan preload injection** (React Float
  auto-preloads eager SSR-shell imgs, and the router's RSC prefetch
  injects the head link into every navbar-bearing route — a console
  warning + a wasted fetch on six routes; `loading="lazy"` suppresses
  the emission, visible parity unchanged, the live's img stays eager);
  and **the dashboard's uncaught fetch rejections** (pause/delete/sign-out
  had NO catch — route-aborted faults surfaced `TypeError: Failed to
  fetch` pageerrors with zero feedback, and Sign out never navigated;
  every handler now upholds the composer's catch contract with a
  full-width `role="alert"` banner). ALSO: the live's own console ships
  two 401 errors the clone doesn't have (the console tier of the D55
  family — D68); one mid-verification word-parity "regression" was
  disproven as a ZOMBIE-SERVER artifact (stale :3000 process serving a
  build whose CSS chunks were deleted — unstyled page, concatenated
  innerText; the discipline: compare the served HTML's CSS chunk name
  against disk); the mobile nav re-verified byte-identical (no Tailwind
  v4 bug; the live's burger remains pointer-blocked, D32). Gate:
  **314 checks** (94 unit + 173 e2e incl. the resource-hygiene +
  resilience suites + 47 smoke incl. the lazy-img contract pin); every
  route's console: zero noise; word parity 1.0000 on all 8 routes.

- **Session 11 (2026-10-08) remediation** — see
  `docs/remediation-plan-session11.md`: the first HYDRATION-HEALTH survey
  (a console/pageerror sweep of every route) plus the first cross-route
  axe sweep (clone AND live, adjudicated) and an API edge-case probe
  found and fixed four defects: **the 404 hydration error** (every unknown
  route tripped React #418 — the statically-prerendered client component
  rendered `usePathname()` while the prerendered HTML shipped the internal
  route id; AND `usePathname()` settles to `/_not-found` post-router —
  fixed with a `useSyncExternalStore` mount gate reading
  `window.location.pathname`, pinned by the new hydration suite);
  **the paused-card contrast compounding** (the dashboard's `opacity-80`
  articles turned `text-white/50` into EFFECTIVE white/40 — 3.61:1,
  glyph-pixel-verified; a controlled experiment proved oklab/color-mix
  composites identically to rgba, isolating the ancestor opacity as the
  cause; fixed white/60); **the PATCH/POST name-contract split** (POST
  rejected >120 chars, PATCH silently truncated — now both reject via
  `requiredString`); and **the gate's own flaky ring pin** (fixed-200ms
  mid-transition samples + blind-Tab×4 landing on inputs when hydration
  shifted the tab order — now tab-until-focused + poll-to-settled,
  10/10 + 8/8 consecutive greens). ALSO: `AUTH_RATE_LIMIT_MAX` (default
  10) de-fragilized the e2e suite (its UI sign-ins sat at exactly the
  default budget — one extra spec tripped a mid-suite 429); the
  clone-only axe violations on `/`, `/faq`, and the 404 were adjudicated
  LIVE-PARITY (ledgered D63 — the live ships them too; parity law);
  the mobile nav re-verified byte-identical (the live's burger remains
  pointer-blocked, D32). Gate: **307 checks** (94 + 167 e2e incl. the
  hydration suite + 46 smoke); axe /dashboard ZERO violations; word
  parity 1.0000 on all 8 routes.

- **Session 10 (2026-10-08) remediation** — see
  `docs/remediation-plan-session10.md`: the first LOOPING-MOTION survey (a
  full-page census sampling every element's computed transform/opacity
  across multiple rounds AFTER entrances settle — still-changing = loop —
  plus animate/transition config extraction from the live's JS bundle)
  found the clone missing EIGHT of the live's twelve loops: the hero
  mockup's ambient glow (scale+opacity, 4s), red chrome dot (scale, 2s),
  four side-list dots (staggered scale pulses), the under-glow (y+opacity,
  3s — ALSO restructured: a SIBLING of the card, unclipped, rendered
  un-centered because the live's framer transform kills its
  `-translate-x-1/2`; pinned via `translate-none`), and the One-Platform
  mini-dashboard's four skeleton opacity pairs (3s, staggered delays) —
  all reproduced as seven measured `@theme --animate-*` keyframe tokens
  (framer's inline writes are invisible to the CSS-property census that
  produced Session 4's "static mockup" verdict). ALSO: the dashboard's
  first axe audit (the superset surface) fixed `text-white/40` contrast
  (→ white/60) and added its `<h1>`; `public/` assets now ship the live's
  CDN caching (`max-age=604800`); the live's post-login surface was
  settled definitively (NO authenticated experience — every authed route
  404s; the repo's /dashboard stays the D1 superset). Gate: 299 checks
  (92 + 164 e2e incl. the mockup-motion-parity suite + 43 smoke); loop
  census 12 = 12; VLM mockup + One-Platform IDENTICAL; word parity 1.0000
  on all 8 routes.

- **Session 9 (2026-10-07) remediation** — see
  `docs/remediation-plan-session9.md`: the first RENDERED-PALETTE survey
  (every default-palette color this app uses, converted to sRGB and compared
  with the live's v3-era hex) plus the interactive-state matrix, the
  browser-chrome layer (::selection/scrollbars/cursors/overscroll), the
  form/media attribute inventory, the ARIA snapshot tree, the `:root` var
  inventory, the mobile-nav paired re-verification, and the HTTP header
  inventory. Found and fixed six gap groups: **the v4 OKLCH PALETTE
  ROUNDTRIP** (31 tokens pinned to v3 hex — up to 69 RGB units off: the
  stars, the problem reds, the features grays/greens, the avatar gradient
  endpoints, every login slate); **the Sign in's keyboard ring** (Session
  8's `--ring` variable alone left v4's `ring-ring` utility un-emitted —
  the ring rendered currentColor WHITE; now `--color-ring` in `@theme` +
  an `input:focus:focus-visible` cascade nudge keeps the inputs' slate-400
  where the live's order puts it); **the invented violet ::selection
  removed** (the live ships none); **the login overscroll pin**
  (`html { overscroll-behavior-y: none }` route-scoped); **the login's
  light `--color-border`** (inert, computed parity); and **four security
  headers** via `next.config.ts` (the live's exact set). Gate: 284 checks
  (92 + 150 e2e incl. the palette-parity suite + 42 smoke); VLM
  problem/testimonials/login IDENTICAL; word parity 1.0000 on all 8
  routes.

- **Session 8 (2026-10-07) remediation** — see
  `docs/remediation-plan-session8.md`: the first MOTION-LAYER survey
  (computed transition/animation values of every animated element, live vs
  clone, plus MutationObserver entrance traces and live-bundle config
  extraction) found the clone's entire entrance system broken three ways
  and rebuilt it **rAF-driven** (`src/lib/motion.ts` — framer-motion
  parity: easeOut cubic-bezier(0,0,0.58,1), per-element y/duration/stagger,
  settled `opacity: 1; transform: none;`) — adding the missing entrances
  (testimonial cards, mockup, hero trio, legal pages, /faq items) and
  removing the invented ones (logo-cloud container, One-Platform chips,
  whole-CTA). Three v4 engine shifts pinned: **shadow-sm** (v4 renamed the
  scale — `--shadow-sm` restores v3's value), **transition-colors** (v4
  carries 9 properties vs v3's 6 — a utilities-layer override), and the
  **line-height cascade inversion** (v3's responsive text utilities beat
  leading-*; three elements pinned with `--tw-leading: initial`). The
  login focus chrome matched (`--ring: 240 10% 3.9%`, focus-visible:ring-ring,
  the violet outline rule neutralized route-scoped, the Google-icon wrapper
  DIV); the FAQ chevron's muted-foreground matched; the float keyframes
  corrected (−15px/4s); the navbar logo's light swap re-mechanized as the
  live's React-driven PATH FILL (the anchor stays bare — the Session-4
  spec pin corrected to read the rendered fill); per-plan CTA disabled:*
  utilities matched. Gate: 266 checks; VLM hero/CTA IDENTICAL; word parity
  1.0000 on all 8 routes.

- **Session 7 (2026-10-07) remediation** — see
  `docs/remediation-plan-session7.md`: the first TYPOGRAPHY-LAYER survey
  (computed letter-spacing + first-resolved font-family of every text
  element, live vs clone) plus a full asset/network inventory, a 22-step
  keyboard Tab walk, an axe-core run, edge viewports (1920/320), and the
  mobile menu's resize-while-open behavior. Found and fixed eight gaps:
  **the reference's SPA bundle doubles the tracking scale** (`tracking-wider`
  0.1em / `tracking-widest` 0.2em — every eyebrow had rendered at half the
  live's tracking for six sessions; fixed via `@theme` overrides, with the
  login route pinning the standard scale back since the live's login
  bundle keeps it); the **Thrune wordmark** now renders DM Serif Display
  (the live's three wordmarks carry INLINE font-family styles — the clone
  had rendered all three Playfair-first); the Testimonials H2's
  tracking-tight; the Gasparyan `alt="Logo"`; the star rows' aria made
  valid (`role="img"`); **the mobile menu's resize-while-open scroll-lock
  bug** (a matchMedia listener closes the menu on md entry); and a working
  self-hosted apple-touch-icon (the live's URL is dead). Byte-verified:
  the hero video (md5-identical) and Gasparyan SVG; the live's favicon URL
  is DEAD (our working one is the superset); the D32 burger block still
  confirmed. Gate: 227 checks; VLM hero 100 / pricing 99; word parity
  1.0000 on all 8 routes.

- **Session 6 (2026-10-07) remediation** — see
  `docs/remediation-plan-session6.md`: the first CLASS-STRING-LAYER audit
  (a full-DOM skeleton diff — tag + class + key attrs — live vs clone)
  plus a per-route `<head>` map and real-pointer hover probes found and
  fixed seven clone-side gaps: the testimonial avatars now cycle the
  live's FOUR per-person gradients (the pre-fix clone rendered all as
  violet→purple-600); the Enterprise "Custom" price renders as the
  live's plain 30px DIV (was a 48px text-5xl span); the testimonial
  edge-fade directions un-swapped (black AT the edges); the AI-suggestion
  paragraph matches the live's rendered FULL white (its own class is a
  broken inert token); the per-route head pattern implemented through
  `src/lib/seo.ts` (og:title/`"X on SAAS Company. …"`/og:url/canonical)
  with a WORKING self-hosted `/og-image.png` (the live's 404s) and a
  self-hosted `manifest.json`; the `<body>` stripped to the live's bare
  element (no classes, `-webkit-font-smoothing: auto`); three invented
  class extras removed. ALSO DOCUMENTED: the live's own mobile burger is
  pointer-blocked by its empty toast portal — the clone keeps the working
  burger (D32). Gate: 215 checks; VLM 99/99/98.

- **Session 5 (2026-10-07) remediation** — see
  `docs/remediation-plan-session5.md`: the UI typeface corrected to
  GOOGLE's actual "Vend Sans" variable font (the Session-1 files were Wix
  Madefor — ~2.4% wider glyphs; traced via performance entries + fontTools;
  the swap closed the pricing-pill deltas AND the D19 Pro-card +27px);
  the login card's alternate states (sign-up / forgot / reset-success /
  error) rebuilt to the measured layouts (back-button + h2 + form, no
  logo/Google/divider, shadcn alert banners between field and submit,
  "Invalid email or password" / "Passwords do not match" / the green
  check-your-email view; the register API's name is now optional — the
  reference's sign-up has no name field); the keyboard focus ring matched
  (the reference's universal `outline-color: violet/50` on the UA default
  ring, replacing this repo's invented `:focus-visible` rule); the Pro
  card's inert scale utilities removed (the reference's markup carries
  them but its css never emits them — rendered truth wins); the
  testimonials strip made full-bleed. Gate: 192 checks; VLM
  97/100/100/100/98.

- **Session 4 (2026-10-07) remediation** — see
  `docs/remediation-plan-session4.md`: the login route now swaps the body
  theme like the reference's own login css bundle (white bg, zinc-950 text,
  system font — typed input text is dark and visible again, and the
  reference's v3-style space-y gap is restored inside the form); the pricing
  model corrected to the reference's truth (toggle defaults to ANNUAL; Pro
  $49/mo monthly, $39/mo annual; the caption is plain "/month" in both
  states); the navbar rebuilt as section-aware (always transparent,
  scroll-spy pills, light-mode swap over the white features section — the
  scrolled-glass bar was an invention); the dashboard mockup made static
  like the reference (solid purple dots — the unlayered `.skeleton-wave`
  had overridden `bg-primary/80`); the FAQ accordion animates with the
  reference's Radix keyframes and unmounts closed panels (word parity
  1.0000 on every page now); `apple-mobile-web-app-status-bar-style: black`.
  Gate: 179 checks.

- **Session 3 (2026-10-07) remediation** — see
  `docs/remediation-plan-session3.md`: the brand tokens restored to the
  reference's `:root` values (primary #8624ff, accent/electric-blue #0055ff
  — Session 1 had read the unused `.dark` block), the body font switched to
  the Display cut like the live, straight quotes on testimonial/AI-suggestion
  copy, the reference's `X | SAAS Company` page titles, the 404 card quoting
  the missing pathname, Lenis 1.3 smooth scrolling, the login-only noscript,
  and the apple-mobile-web-app-title meta. Gate: 165 checks.

- **Session 2 (2026-10-07) remediation** — see
  `docs/remediation-plan-session2.md`: accessibility-page content restored
  (two reference lists + the no-caption rule), the login page's back-link
  removed (bare-card parity), the hero indicator's motion matched
  (`animate-scroll-dot`), the features card rebuilt per tab from the live DOM
  (incl. per-tab check icons), and the dependency chain hardened
  (vitest 5.0.3; overrides for the unpatched-upstream advisories).

- **The live reference changes over time** (it was previously a PM-workspace
  app; the current deployment is the NovaAI marketing site). Parity claims
  in the PAD reference the 2026-10 survey. If the live app is redeployed
  again, re-run the paired survey before touching chrome.
- **"Continue with Google" renders for parity but degrades to a notice** —
  no OAuth credentials in a self-hosted clone (documented deviation).
- **Google Fonts (Playfair Display / DM Serif Display)** are pulled via
  `next/font/google` for the client-logo wordmarks; the UI font is the
  self-hosted Vend Sans. If building fully offline, expect the next/font
  step to need network access.
