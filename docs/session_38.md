# Session Log 38 — Session 21: Data-Volume Honesty (2026-10-09)

Continuing the task chain from the Session-20 cycle (remote main @ e850249 — the session_37 transcript commit). The session document references updated again (now session_36/37 + remediation-plan-session20) — determining the real interruption point first:

session_37 (the prior transcript) confirms Session 20's cycle is fully complete and pushed (a1e1529 wrapper-verified, plus its own transcript commit e850249). So this cycle is the NEXT one: Session 21. Workspace: the repo survived the sandbox reset at the workspace root; `git pull` fast-forwarded a1e1529 → e850249 (session_37.md, the only delta). Environment verified intact (node_modules, db/, .env); the dev DB had drifted (checksum c4231a70, the probe traffic of prior sessions) — re-pushed + re-seeded to the canonical e7f6c011. The exported-DATABASE_URL trap is LIVE (the stale absolute path); neutralized per-command all session.

Project docs re-read (AGENTS with its 34 gotchas, CLAUDE, README, PAD ledger at D94, SKILL v2.19.0) and the skills catalog consulted for the audit toolchain.

Baseline gate: lint ✓ typecheck ✓ 145/145 unit ✓ build ✓ 94/94 smoke ✓ 197/197 e2e — **436 checks ALL GREEN, no flake** — exactly the documented state.

Drift battery (recreated runner on a FRESH port :3115, EXPLICIT --base per gotcha 33): word parity **1.0000 ×8** (reference UNCHANGED — both sides rendered in Chromium), the mobile-nav paired real-touch probe **byte-identical** (7 rows — 6 anchors + the Log In button — every row exactly 44px, opened by a REAL tap; **no Tailwind v4 bug**; the live's burger remains pointer-blocked, D32), and the live LOGIN re-verified (D62 holds).

## The Session-21 audit — the data-volume layer

The NEW surface: the OUTPUT side of the wire (the OUTPUT twin of S20's request-size survey) — what a response may RETURN, what a page query may FETCH, and what the client may RENDER. S20 capped what a request may CARRY (the 128KB input ceiling, D94); nothing capped the output.

**RED evidence CONFIRMED — F1:** a probe-only DB (`db/probe-s21.db`, gotcha-30 discipline) seeded with 400 workflows for a probe user:
- `GET /api/workflows` answered 200 with a **134.5KB body** — `findMany` with no `take`, no pagination headers, linear growth with no ceiling anywhere
- `GET /dashboard` mounted **400 article cards — 9,649 DOM nodes, 1,036ms render** (the runs chart sensibly slices to 8; the LIST renders everything)
- Compounding it: **`POST /api/workflows` is the ONLY unthrottled mutation in the app** (auth, newsletter, demo, generate all carry limiters) — a script mints unbounded rows with one tiny JSON POST each
- Two honest-contract sub-findings ride the same defect: the stat cards derive client-side from the fetched list (a ceiling would silently make them subset summaries), and the "N total" counter reads the fetched length (not the true count)

Adjudicated CLEAN with evidence (this session's surveys): the PATCH numeric-integrity layer (`runs`/`successRate`/`timeSavedHours` are server-controlled, not patchable), the SEO static-asset layer (og-image a real 1200×630 PNG; manifest valid; robots/sitemap the honest SUPERSET semantics — the live's allow-all protects nothing because it has no real API or dashboard; the live ships its own robots + sitemap), the logging-hygiene layer (the probe server's log after the full survey traffic: boot banner only, zero PII), the hero-video layer (1.9MB, muted + playsInline + aria-hidden), and the dependency currency (npm audit: the documented F10 chain only; npm outdated: majors only — unchanged).

## The fixes (TDD-first)

**R1 — the workflows list ceiling + honest aggregates (D95):** RED observed 9/11 pins (the helpers did not exist) → GREEN 11/11. `MAX_WORKFLOW_LIST = 100` + the pure `statsFromAggregate()` normalizer in `src/lib/workflow.ts`; `ok()` in `src/lib/api.ts` gains an optional `{ headers, meta }` opts object — `meta` lands as an additive TOP-LEVEL sibling of `data` (strictly optional: the e2e error-boundary mocks fulfill with bare arrays and keep working, pinned by the backward-compat no-meta unit pin); `GET /api/workflows` rides SQL `take` + `count` + `count(active)` + `aggregate` and ships `meta: { total, stats }`; the dashboard page computes the same aggregates server-side (two new props: `totalWorkflows`, `initialStats` — TRUE from the first paint); the client's `refresh()` consumes `meta` when present (the list-derived memo remains the fallback), the list header reads the TRUE total, and a capped workspace renders the honest truncation note "Showing the 100 most recent of N workflows."

**R2 — the creation-frequency ceiling (D96):** `workflowRateLimit(userId)` in `src/lib/rate-limit.ts` — 30 creates per USER per 15 minutes (the `generateRateLimit` pattern: keyed by the authenticated user, `WORKFLOW_RATE_LIMIT_MAX` override), guarding `POST /api/workflows` after the session check and before the body parse; a 429 answers the `RATE_LIMITED` envelope with the S15 `Retry-After` contract. The smoke server pins `WORKFLOW_RATE_LIMIT_MAX=2` (the GENERATE precedent) so the create + invalid-status POSTs deterministically exhaust the bucket.

**Smoke +9 pins** (a new "Session 21 — the data-volume ceiling + creation limiter" section): 105 probe rows seeded DIRECTLY into the smoke DB (111 total for the demo user) → the capped GET returns `data.length == 100` with `meta.total == 111`, the honest `meta.stats.active == 75` / `.runs == 8170` / `.hours == 265`, and the no-store directive intact; the limiter trip → 429 + `RATE_LIMITED` + Retry-After. One mid-execution pin bug caught and fixed: curl's `%{header_json}` values are arrays — `[0]` (not `[0][0]`) extracts the string.

**Full gate: 456 checks** (156 unit + 103 smoke + 197 e2e — no flake; the e2e layer unchanged: no client-observable change for the seeded 6-workflow story, the stats values identical server-side and client-side).

## Re-verification

The data-volume survey re-run on the remediated build (fresh probe DB, 400 workflows): `GET /api/workflows` → **100 rows / 33.7KB** with `meta: {total: 400, stats: {active: 266, runs: 176100, hours: 7800, avgSuccessRate: 95.2}}`; the dashboard → **100 articles (2,584 DOM nodes)**, the counter reads "400 total", the truncation note visible — GREEN. (The first re-run probed a ZOMBIE — a `setsid`-detached diagnostic server from the RED phase still held :3120, and the runner's fresh boot hit a silently-swallowed EADDRINUSE — the gotcha-26/31 family's fourth member; killed and re-probed GREEN. Logged as gotcha 35's tail + SKILL lesson 51.)

The drift battery re-run (the regression guard — the workflows route, the dashboard page, and the client were touched): **GREEN — zero regressions** (word parity 1.0000 ×8, the mobile-nav byte-identical, D62 holds).

Screenshots: the standard 20-shot set refreshed (fresh :3130 boot, canonical DB verified by seed-checksum before and after). VLM spot-checks ×5 — the first pass flagged the login card's logo chip ("light gray background instead of gradient slate"): adjudicated as the FOURTH check-prompt drift (the actual markup is `from-slate-100 to-slate-200` — a LIGHT gradient, exactly what the VLM saw; the login card was untouched this session and word parity 1.0000 + the untouched bytes prove the page correct). Corrected the prompt to the ACTUAL contract → **5/5 PASS**.

## Survey-tooling lessons this session

- Playwright's `context.cookies(url)` FILTERS Secure cookies on plain http — 127.0.0.1 is trustworthy for NAVIGATION (the cookie is sent) but cookie ENUMERATION with a URL argument drops it; enumerate with no arguments and match by name (the gotcha-30 family).
- A `setsid`-detached survey server OUTLIVES its diagnostic session — the next runner's fresh boot on the same port hits a silently-swallowed EADDRINUSE and probes the STALE build (the gotcha-26/31 family's fourth member).
- The probe-user seeding script must resolve `@prisma/client` from the REPO's node_modules (NODE_PATH or in-repo placement) — a script at the workspace root fails MODULE_NOT_FOUND.

## Documentation

PAD (revision block, ledger D95–D96, §7 counts 156/103/197 = 456, §11 key files incl. the api-meta/workflow-ceiling test rows and the smoke 103 row), AGENTS (gotcha 35 + counts + the invariant line naming the meta sibling), CLAUDE (session-21 context + checklist counts), README (456 badge + the data-ceiling/creation-limiter rows + the stale 145/94 verification counts), SKILL **v2.20.0** (lessons 50–51), DEPLOYMENT.md §3 (the WORKFLOW_RATE_LIMIT_MAX env row), `.env.example` (the WORKFLOW_RATE_LIMIT_MAX row — verified in sync), remediation plan session21 (ticked), this session log, the repo worklog.

Gate: **456 = 156 unit + 103 smoke + 197 e2e.** Session 21 complete.
