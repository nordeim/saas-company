# Remediation Plan — Session 21 (2026-10-09)

**Scope:** Fix the issues, bugs and gaps found by the Session 21
data-volume audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** the standing drift battery first (word parity **1.0000
on all 8 routes**, both sides rendered in Chromium — the reference is
UNCHANGED since Session 20; the mobile-nav paired real-touch probe: the
clone's burger opens with a REAL tap into the byte-identical panel — the
same seven rows (6 anchors + the Log In button), every row exactly 44px,
while the live's burger remains pointer-blocked (D32) — **no Tailwind v4
bug**; the live LOGIN re-verified with the operator credentials — D62
holds). Then the Session-21 NEW audit surface — a layer no prior session
systematically surveyed:

1. **The data-volume layer (the OUTPUT twin of S20's request-size
   ceiling):** S20 capped what a request may CARRY (the 128KB input
   ceiling, D94) — nothing caps what a response may RETURN, what a page
   query may FETCH, or what the client may RENDER. Probed on a probe-only
   DB (`db/probe-s21.db`, gotcha-30 discipline) seeded with 400 workflows
   for a probe user: **GET /api/workflows answered 200 with a 134.5KB
   body — 400 rows, no `take`, no pagination headers; and GET /dashboard
   mounted 400 workflow article cards — 9,649 DOM nodes, 1,036ms render**
   (the runs chart sensibly slices to 8; the LIST renders everything).
   The growth is linear with no ceiling anywhere: a long-lived user at
   4,000 workflows buys a ~1.3MB response and ~96k DOM nodes on every
   dashboard visit. Compounding it, **POST /api/workflows is the ONLY
   unthrottled mutation in the app** (auth, newsletter, demo, and
   generate all carry limiters; a script mints unbounded rows — one tiny
   JSON POST each — with the rate limits capping frequency on every
   OTHER endpoint but never this one). **F1.**
   Two honest-contract sub-findings ride the same fix: with a capped
   list, the four stats cards (ACTIVE WORKFLOWS / TOTAL RUNS / HOURS
   SAVED / AVG SUCCESS RATE) currently derive client-side from the
   fetched array — a ceiling would silently make them summarize the
   visible subset (a lie); and the "N total" counter would read the
   fetched length, not the true count (also a lie).

Also audited and found CLEAN or ADJUDICATED (non-findings, this
session's evidence): **the PATCH numeric-integrity layer**
(`src/app/api/workflows/[id]/route.ts` — `runs`/`successRate`/
`timeSavedHours` are server-controlled and NOT patchable; name/
description/category/status all pass the validation seams; the S11 name
contract holds), **the SEO static-asset layer** (`public/og-image.png`
is a real 1200×630 PNG; `manifest.json` valid with 192/512 icons and a
correct standalone declaration; `robots.txt` disallows `/api/` +
`/dashboard` — the honest SUPERSET semantics vs the live's allow-all
(the live has no real API or dashboard to protect); `sitemap.xml`
answers 200 `application/xml` with all 8 routes; the live ships its own
robots + sitemap too — parity family D68), **the logging-hygiene layer**
(the probe server's log after the full survey traffic — logins, a
400-workflow list, dashboard renders — contains the boot banner only:
zero PII, no request logging, no body echo), **the hero-video layer**
(1.9MB `hero-ai-loop.mp4`, `muted` + `playsInline` + `aria-hidden`, no
preload waste), and **the dependency-currency layer** (the standing S19/
S20 re-run: `npm audit` — exactly the documented F10 braces chain;
`npm outdated` — majors only, unchanged).

## The fixes (TDD-first)

### R1 — the workflows list ceiling + honest aggregates (F1a/F1b/F1c)

The output twin of D94, built at the same seams:

1. **The constant** — `MAX_WORKFLOW_LIST = 100` in `src/lib/workflow.ts`
   (the domain vocab file). 100 rows ≈ 34KB of JSON — two orders of
   magnitude above the seeded 6-workflow demo story, the ceiling a
   personal-workspace list can honestly carry unpaginated.
2. **The envelope seam** — `ok()` in `src/lib/api.ts` gains an optional
   third parameter `{ headers?, meta? }` (mirroring `fail()`'s S15
   headers extension): `meta` lands as an additive TOP-LEVEL sibling of
   `data` — `{ ok: true, data, meta }`. Every existing consumer that
   reads `data` (the client's `Array.isArray(payload.data)` guard, the
   smoke `field` extractors, the e2e route-fulfilled mocks) is
   untouched; `meta` is strictly optional everywhere.
3. **The pure normalizer** — `statsFromAggregate(total, active, runs,
   hours, avgSuccessRate)` in `src/lib/workflow.ts`: rounds hours,
   maps a null `_avg` (the empty-workspace case) to the 100 the client
   already displays, and emits the exact `{ active, runs, hours,
   avgSuccessRate }` shape the four stat cards render. Pure → unit-
   pinned; shared by the route and the page (one definition, no drift).
4. **GET /api/workflows** — `take: MAX_WORKFLOW_LIST` on the findMany +
   a parallel `count` + `count(active)` + `aggregate(_sum runs,
   _sum timeSavedHours, _avg successRate)` → `ok(workflows, 200,
   { meta: { total, stats } })`. The list stays the array (contract
   intact); the truth rides `meta`.
5. **The dashboard page** — the same take + the same aggregate → two
   new props: `totalWorkflows` and `initialStats` (the page's numbers
   are TRUE at any volume from the first paint — no flash of wrong
   stats).
6. **The client** (`dashboard-app.tsx`) — `serverStats` state
   (initialized from `initialStats`, updated by `refresh()` whenever
   `payload.meta` is present; the existing list-derived memo remains the
   FALLBACK for meta-less payloads — the error-boundary e2e mocks
   fulfill with bare arrays, and they must keep working); `total` state
   (same lifecycle); the list header shows the TRUE total; and when
   `workflows.length < total` the list renders the honest truncation
   note — "Showing the 100 most recent of 412 workflows." (muted,
   `font-body`).

Design decisions, each load-bearing:

- **The ceiling rides SQL `take`, not a client slice** — the response
  body itself is capped (the wire-level fix, D94's mirror), not just
  the render.
- **The stats move server-side** — a ceiling without honest aggregates
  would turn the stat cards into subset summaries; the aggregate query
  (`count` + `count(active)` + `_sum` × 2 + `_avg`) is one indexed
  pass over the user's rows on the `[userId, status]` index — the
  numbers stay TRUE at any volume.
- **`meta` is additive and optional** — the envelope invariant
  ("`{ ok: true, data }` or `{ ok: false, error }`") gains a sibling,
  not a replacement; every pinned consumer of `data` is untouched
  (pin-conflict scan below).
- **The truncation note is honest UI, not pagination** — a personal
  workspace with 100+ workflows is an edge; the note tells the truth
  (the newest 100 are shown) instead of silently hiding the rest or
  building an unrequested pager.

Unit pins (RED first, in `src/lib/workflow.test.ts` +
`src/lib/api-meta.test.ts`): `MAX_WORKFLOW_LIST` is 100;
`statsFromAggregate` maps null avg → 100, rounds hours, passes active
through; `ok(data, 200, { meta })` carries the meta sibling with `data`
intact + the no-store header; `ok(data)` alone emits NO meta key (the
backward-compat pin).

Smoke pins (a new "data-volume ceiling" section in
`scripts/smoke-test.sh`): after the existing workflow pins, seed 105
probe workflows for the demo user directly into the smoke DB (a sqlite
loop via the prisma client — the smoke suite's own DB, unaffected e2e),
then GET /api/workflows: **`data.length == 100`** (the ceiling), **`meta
.total == 112`** (6 seeded + 1 created earlier in the suite + 105 probe
rows — the TRUE count), **`meta.stats.active` matches the seeded
active count** (the honest aggregate), and the response stays
`application/json` with `Cache-Control: private, no-store`.

### R2 — the creation-frequency ceiling (F1d)

The missing limiter — `POST /api/workflows` is currently the ONLY
unthrottled mutation:

1. **`workflowRateLimit(userId)`** in `src/lib/rate-limit.ts` — 30
   creates per USER per 15 minutes (the `generateRateLimit` pattern:
   keyed by the authenticated USER, not the IP — the route sits behind
   `requireSession` and the user is the honest unit), overridable via
   `WORKFLOW_RATE_LIMIT_MAX` (the `AUTH_RATE_LIMIT_MAX` operator
   pattern).
2. **The route guard** — in `POST /api/workflows`, AFTER the session
   guard and BEFORE the body parse (the generate route's exact
   ordering): a 429 `RATE_LIMITED` envelope with the S15
   `Retry-After` header. The client's existing failure-class contract
   surfaces it honestly (compose()'s catch → the composer's error
   banner; the S12/S14 role=alert discipline).
3. **30 is generous by design** — a power user hand-building 30
   workflows in 15 minutes is plausible; a script minting 1,000 rows
   in seconds is not. The e2e suite's ~5 direct creates stay far under
   the default (no e2e env override needed — verified by scanning the
   suite's composer specs; the generate route's INTERNAL creates ride
   the separate `gen:` bucket); the smoke server pins
   `WORKFLOW_RATE_LIMIT_MAX=2` (the `GENERATE_RATE_LIMIT_MAX=2`
   precedent) for its deterministic trip.

Unit pins (RED first, in `src/lib/rate-limit.test.ts`, the
generate-limiter block's pattern): the default-30 trip (31st blocked),
the `WORKFLOW_RATE_LIMIT_MAX` override, the invalid-env fallback.

Smoke pins: with the smoke server's `WORKFLOW_RATE_LIMIT_MAX=2`, the
3rd create POST answers **429 + `RATE_LIMITED` + `Retry-After`** (the
envelope shape, not a bare status).

### R3 — the adjudication record (documented, no code change)

The audit rows above (PATCH numeric integrity, SEO static assets,
logging hygiene, hero video, dependency currency, the drift battery)
land in this plan's adjudicated section — the operators' evidence that
these layers were surveyed, not skipped.

### R4 — full gate + paired re-verification + docs

Gate: lint → typecheck → unit (145 + the new pins) → build → smoke
(94 + the new ceiling/limiter pins) → e2e 197 (unchanged — no
client-observable change for the seeded 6-workflow story; the
error-boundary mocks' bare-array payloads keep working through the
optional-meta fallback). Re-verification: the data-volume survey re-run
on the remediated build against a fresh 400-workflow probe DB (the
response ≤ 100 rows / ~34KB, the dashboard ≤ 100 articles, the
truncation note visible, `meta.total` == 400); the standing drift
battery re-run (the regression guard — the workflows route and the
dashboard page were touched); the standard 20-shot screenshot set
refreshed (VLM spot-checks); docs: PAD (revision block, ledger
**D95–D96**, §7 counts, §11 key files), AGENTS (gotcha 35 + counts),
CLAUDE (session-21 context), README (badge + the data-ceiling and
creation-limiter rows), the SKILL doc **v2.20.0 (lessons 50–51)**,
`.env.example` (the `WORKFLOW_RATE_LIMIT_MAX` row), DEPLOYMENT.md §2 if
the env table lists the other limiter overrides, this plan (ticked),
the session log `docs/session_38.md`, the repo `worklog.md`. Commit
(Conventional Commits + emoji) + SSH push via
`docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified, `--remote`
explicit — the runbook's default targets the wrong repo).

## Validation of this plan against the codebase (pre-execution)

- `src/lib/api.ts` re-read: `ok()` currently takes `(data, status)` —
  the opts object is additive; every existing call site (10 route
  files' `ok(...)` calls, all `(data)` or `(data, 201)`) compiles
  unchanged ✓
- The client's `refresh()` re-read: `Array.isArray(payload.data)`
  guard untouched; `payload.meta` consumption is additive behind
  optional chaining ✓
- Pin-conflict scan: the e2e error-boundary specs fulfill
  `**/api/workflows` GET with `{ ok: true, data: [row] }` (no meta) —
  the fallback memo path keeps them green; no existing unit test
  imports a route file; no existing smoke pin asserts the response
  SIZE or the absence of extra body keys ✓
- The smoke WF_ID extraction (`field "['data'][0]['id']"`) runs BEFORE
  the new 105-row section and still finds data[0] (newest-first) ✓
- The smoke DB seeding of 105 rows happens AFTER the existing
  workflow-section pins (PATCH/DELETE operate on the earlier rows;
  the new rows ride on top, newest-first — the created row's position
  in the first 100 is unaffected because seeding happens later) ✓
- Rate-limit arithmetic: the smoke suite's direct POST count before
  the new section is 1 (CREATED); with `WORKFLOW_RATE_LIMIT_MAX=2`
  the limiter trips exactly on the section's 3rd POST — deterministic
  (nothing else in smoke POSTs /api/workflows) ✓
- The generate route's INTERNAL `db.workflow.create` calls do NOT pass
  through `POST /api/workflows` — the `wf:` bucket counts only direct
  creates; the composer's degrade path (generate 429 → direct POST)
  consumes ONE `wf:` slot per degrade, well under every budget ✓
- Prisma `aggregate` on SQLite: `_avg` of zero rows returns `null`
  (the normalizer maps it to 100 — the empty-workspace display
  contract) ✓
- The page's two narrow try/catch blocks (S19) — the new queries join
  the EXISTING second try/catch (workflows block); the redirect calls
  stay OUTSIDE both catches ✓
- `next/server` in vitest: the S19/S20 precedent (`NextResponse` loads
  server-side) ✓

## Execution order

R1 + R2 unit pins RED (`MAX_WORKFLOW_LIST`/`statsFromAggregate`/the
meta-carrying `ok()`/`workflowRateLimit` do not exist) → implement →
GREEN → the GET route + page + client edits + the POST limiter →
rebuild → the new smoke pins (the 105-row ceiling section + the 429
trip) → full gate → the data-volume survey re-run on the remediated
build → the drift battery re-run → screenshots → docs (R4) → commit +
SSH push per the runbook → the session transcript committed and pushed
after.

### ToDo checklist

- [x] R1: `MAX_WORKFLOW_LIST` + `statsFromAggregate` in
      `src/lib/workflow.ts`; the meta-carrying `ok()` in
      `src/lib/api.ts`; `take` + count + aggregate in GET
      /api/workflows and the dashboard page; the client's
      serverStats/total state + the honest truncation note; unit pins
      RED → GREEN
- [x] R2: `workflowRateLimit(userId)` in `src/lib/rate-limit.ts` +
      the route guard (429 + Retry-After) + the
      `WORKFLOW_RATE_LIMIT_MAX` override + unit pins RED → GREEN
- [x] R3: the adjudication rows documented (PATCH integrity, SEO
      assets, logging hygiene, hero video, currency, drift battery)
- [x] Full gate: lint ✓ → typecheck ✓ → 156/156 unit → build ✓ →
      103/103 smoke → 197/197 e2e — 456 checks, no flake
- [x] Paired re-verification: the data-volume survey GREEN on the
      remediated build (≤100 rows, meta.total true, the truncation
      note visible); the drift battery re-run GREEN (zero regressions)
- [x] Screenshots: the standard 20-shot set refreshed (VLM
      spot-checks)
- [x] Docs: PAD (revision block, D95–D96, §7 counts, §11), AGENTS
      (gotcha 35 + counts), CLAUDE (session-21 context), README (badge
      + rows), SKILL v2.20.0 (lessons 50–51), `.env.example` (the new
      limiter row), DEPLOYMENT.md (if the env table applies), this
      plan ticked, session log `docs/session_38.md`, repo
      `worklog.md`
- [x] Commit to `main` + SSH push via `docs/ssh_git_wrapper_v3.py`
      (wrapper-verified; `--remote git@github.com:nordeim/saas-company.git`
      explicit) — the final step
