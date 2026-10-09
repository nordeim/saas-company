# Remediation Plan — Session 27 (2026-10-09)

**Scope:** Fix the issues found by the Session 27 audit of this repository
(the S50 log's three suggested surfaces — the unpinned TTFB/FCP budget
families, the composed-vs-charted cross-surface consistency audit, and the
first-run story under the empty-workspace boundary shapes — surveyed first,
then extended to the class they belong to), executed TDD-first, gated by the
full quality gate (§7.3 of the PAD), and re-verified by the standing paired
survey.

**Audit method:** the standing drift battery first (word parity **1.0000 on
all 8 routes**; the mobile-nav paired real-touch probe: the clone's burger
opens with a REAL tap into the byte-identical panel — seven rows, every row
exactly 44px — **no Tailwind v4 bug**; the live's burger remains
pointer-blocked, D32; the live LOGIN re-verified — D62 holds). The SEO
surface re-verified CLEAN (sitemap 200 `application/xml` ×8 routes; robots
the honest superset semantics; og-image a real 1200×630 PNG; `manifest.json`
valid). The baseline gate inherited **511 checks ALL GREEN** (170 unit +
123 smoke + 218 e2e — no flake; lint + typecheck + build clean). Then the
Session-27 NEW audit surface, probed on the probe-only server (:3191,
`db/probe-s27.db`, gotcha-30 discipline, three purpose-built users: an EMPTY
user built up live through the boundary shapes 0 → 1 → 8 → 9; an extreme
success-rate shape; the 111-row volumetric workspace) — 25 verdicts, 23 PASS
with 2 probe-side assertion-format bugs (expected `100%`, the card renders
`100.0%`):

1. **The success-rate stat card's average-of-averages fallacy (F1):** the
   card labeled "Avg success rate" renders Prisma's `_avg successRate` —
   the UNWEIGHTED mean over workflows. RED-confirmed with the extreme shape
   (1 row: 12,000 runs @ 60% + 4 rows: 3 runs @ 100%): the card displays
   **92.0%** while the workspace's true (run-weighted) success rate is
   **60.0%** — a 32-point divergence, displayed directly beside "Total runs
   12,012" which invites the run-share reading (a user concluding "92% of
   my 12,012 runs succeed" is off by 4,000 runs). Even the SEEDED workspace
   diverges at the rendered decimal: unweighted 99.2% vs run-weighted
   99.5%. Averaging pre-aggregated per-workflow rates without weighting by
   sample size (runs) is the classic "average of averages" statistical
   fallacy — the S21 honesty family ("a capped list without honest
   aggregates silently turns the stat cards into subset summaries"): the
   card must carry the workspace's TRUTH, not a mean that erases the
   champion's weight. The adjudication: **the run-weighted share IS the
   workspace's success rate** — `Σ(runs × successRate) / Σ(runs)`, null
   (→ the documented 100 mapping) when the workspace has zero runs.

2. **The unpainted budget corners (F2 — a tooling gap, not a defect):** the
   S25 budgets pin DOM + LCP (landing/login) and the S26 pins cover script
   transfer — nothing pins **TTFB** (the server's response time: a route
   that grows an N+1 query pattern or seconds of sync work would pass all
   511 checks), **FCP** (the first paint: a render-blocking regression),
   or the **authed dashboard's LCP** (login/landing LCP are pinned; the
   dashboard's is not). Measured on the probe server (fresh contexts,
   cold cache): TTFB landing 10ms / login 7ms / dashboard 30ms; FCP
   landing 196ms / login 136ms / dashboard 152ms; dashboard LCP 152ms —
   all healthy, all unpinned.

3. **The unpinned client-refresh chart path + the first-run story
   (F3 — pin gaps around working behavior):** (a) the chart's
   `meta.topRuns` consumption on the NO-RELOAD path is unpinned —
   session26-chart-rank pins the reload path (`page.reload()` after
   minting); nothing pins that a compose or delete through the UI updates
   the chart through `refresh()`'s meta consumption. (b) The
   empty-workspace first-run render is unpinned (the seeded 6-row
   workspace hides the boundary — the S39 survey lesson): the chart's
   "No data yet.", the list's "No workflows yet", the stat cards'
   0 / 0 / 0 / 100.0% — all verified working live at shapes 0, 1, 8, and
   9 (the note "Showing the top 8 of 9 workflows by runs." appears exactly
   at 9; no note at 8; the one-row runs=0 bar rides the adjudicated 4%
   floor with its honest "0" label), none of it gated.

**Adjudicated CLEAN/non-findings** (documented so a future session does not
re-litigate blind): the boundary shapes themselves (0/1/8/9 all render
honestly — the empty states exist on every surface, the note appears
exactly past the cap, the top bar renders 100% at the cap); the 4% floor at
runs=0 (the S25 adjudicated visibility minimum — re-verified at the one-row
shape); the empty-workspace "100.0%" success rate (the documented S21 null
→ 100 mapping — vacuously true, adjacent surfaces carry the "No data yet."
truth); the volumetric cross-surface consistency (stat cards vs chart vs
list vs DB truth all match exactly — total runs 8,170 / active 110 / hours
23 / the DB top-8 charted / the newest-100 listed / the champion charted
but not listed — pinned since S21/S26, re-verified live); the LIST/chart
independence (the two surfaces keep their own orders and notes by design,
D106).

## The fixes (TDD-first)

### R1 — the success rate carries the workspace's truth (F1)

- **`src/lib/workflow.ts`:** NEW pure seam `weightedSuccessRate(rows)` —
  `Σ(runs × successRate) / Σ(runs)` over `{ runs, successRate }` rows,
  `null` iff `Σruns = 0` (the empty/zero-run workspace). The
  `WorkflowStats` field renames `avgSuccessRate` → `successRate`
  (name/value coherence: a field named "avg" carrying a weighted rate
  would be the S26 chart lie one layer down — the meta payload is a wire
  contract). `statsFromAggregate`'s parameter becomes the (nullable)
  weighted rate; the null → 100 mapping stays.
- **`src/app/api/workflows/route.ts` (GET):** the `Promise.all` gains
  `findMany({ where, select: { runs, successRate } })` and drops
  `_avg: { successRate }` from the aggregate — the stats seam consumes
  `weightedSuccessRate(rateRows)` (the S21 stat-cards precedent extended
  to the weighting: server-side, honest at any volume).
- **`src/app/dashboard/page.tsx`:** the same Promise.all change (the page's
  initial-stats seam stays twin to the route's — one definition via the
  shared pure seam, no drift).
- **`src/components/dashboard/dashboard-app.tsx`:** the label renders
  **"Success rate"** (the S26 label-names-its-criterion law — "Avg"
  invited exactly the mean-of-rates reading being removed); the
  `listStats` FALLBACK weights identically over the visible rows (the
  meta-less mock contract keeps its few-row-world honesty); the meta
  shape-check reads `meta.stats.successRate`; the derived display field
  `avgRate` → `rate`.
- **`src/lib/workflow-ceiling.test.ts`:** the existing
  `statsFromAggregate` pins update to the renamed field; NEW
  `weightedSuccessRate` pins — the extreme shape (12,000 @ 60 + 4 × 3 @
  100 → 721,200 / 12,012), zero rows → null, all-zero-runs → null, the
  single row, the equal-weight mean, the seeded 6-row shape (708,374.3 /
  7,120).
- **`scripts/smoke-test.sh`:** the 105 volumetric probe rows' successRate
  changes 99.5 → **50** (a rate value that DISCRIMINATES the semantics —
  at 99.5 both formulas render 99.5%, pinning nothing) + the NEW wire pin
  `meta.stats.successRate` = the run-weighted truth (**93.1** — the
  unweighted mean over the 111-row workspace would say 52.7; a regression
  to the unweighted computation is a guaranteed smoke failure, the S22
  dropped-`userId` pattern).
- **NEW `tests/e2e/session27-stat-honesty.spec.ts`** (sorts after
  session26-chart-rank — single worker, shared e2e.db; minted rows cleaned
  up in a finally; status-tolerant selectors):
  - (a) the empty-workspace boundary: register a unique user → the
    dashboard's three surfaces render their empty states ("No data yet."
    / "No workflows yet — compose your first one above." / stat cards
    0 / 0 / 0 / 100.0%) with the "Success rate" label — the first-run
    story, gated.
  - (b) the rendered rate equals the run-weighted truth: the demo
    dashboard's card renders **99.5%** (the run-weighted value — the
    pre-fix unweighted mean renders 99.2%) AND equals the API's
    `meta.stats.successRate` read via in-page fetch (the wire ↔ render
    coherence pin — also pins the PAGE's initial-paint seam against the
    ROUTE's seam), with the "Success rate" label.
  - (c) the compose → chart client-refresh pin: compose a unique workflow
    through the UI → the chart gains the row WITHOUT a reload (the
    unpinned `refresh()` → `meta.topRuns` consumption path).
  - (d) the delete → chart-drop pin: delete the minted row through the UI
    → the chart drops it without a reload.

### R2 — the paint-milestone budgets (F2)

`tests/e2e/performance-budget.spec.ts` gains seven preventive pins (the
S25/S26 generous-ceiling discipline — the budget catches GROSS
regressions, not milliseconds): **TTFB ≤ 500ms** and **FCP ≤ 1000ms** on
landing, login, and the authed dashboard (NavigationTiming
`responseStart − requestStart`; PaintTiming `first-contentful-paint`;
measured 7–30ms and 136–196ms — 16–70x and 5–7x margins), plus the
**authed-dashboard LCP ≤ 1000ms** pin (measured 152ms; the login/landing
LCP pins exist, the dashboard's did not). These pins are PREVENTIVE
tooling — they pass on the current build by design (their RED is a future
regression).

### R3 — the screenshot refresh

The stat card's label changes on every dashboard shot ("Avg success rate"
→ "Success rate") and the card's value changes on the seeded workspace
(99.2% → 99.5%) → the standing 20-shot set is recaptured (the S23–S26
pattern: a fresh boot with `AUTH_RATE_LIMIT_MAX=50`, the error-boundary
mock covering the `[id]` routes, the dev DB logical state verified
CANONICAL before AND after).

### Validation before execution (performed against the codebase)

- **Pin-conflict scan (R1):** the label "Avg success rate" has exactly ONE
  render site and ZERO spec pins (grep-verified); the field
  `avgSuccessRate` appears in exactly 4 source files + the
  workflow-ceiling unit pins (no e2e/smoke references — the
  error-boundary mocks fulfill with bare arrays, the api-meta unit pins
  construct generic `{ active }` payloads through the additive ok() seam);
  the smoke's probe-row rate 99.5 has zero dependents (the pinned
  volumetric values are active=75 / runs=8170 / hours=265 / total=111 /
  topRuns×5 — none touch rate); the client's meta shape-check is the sole
  `avgSuccessRate` reader in dashboard-app.tsx.
- **Pin-conflict scan (R2):** no existing spec reads NavigationTiming TTFB
  or PaintTiming entries (the performance-budget suite reads LCP via
  PerformanceObserver + ResourceTiming transferSize — unrelated).
- **Suite-order scan:** `session27-stat-honesty.spec.ts` sorts after
  `session26-chart-rank.spec.ts` and before `typography-parity.spec.ts`
  (alphabetical, single worker, shared e2e.db); the register-flow pin uses
  the auth.spec unique-per-run email pattern (`e2e-${Date.now()}@…`); the
  compose pin rides the generate route's degrade-not-fail contract (the
  webServer pins `GENERATE_RATE_LIMIT_MAX=50`); the minted-row cleanup in
  a finally keeps later specs' 6-row expectations intact (the
  session23/25/26 survivor discipline).
- **RED expectation:** the unit pins fail structurally on the pre-fix
  build (the seam does not exist — the import itself); the e2e rate/label
  pins fail on the rendered values (99.2% ≠ 99.5%; "Avg success rate" ≠
  "Success rate"); the smoke rate pin fails on the wire (52.7 ≠ 93.1 at
  the discriminating shape). The empty-state, client-refresh, and paint
  pins are preventive and pass by design.

## Post-execution verification

1. Full gate: lint → typecheck → unit → build → smoke → e2e — the count
   rises 511 → **~529** (+6 unit: the weightedSuccessRate seam pins; +1
   smoke: the discriminating rate pin; +11 e2e: 4 stat-honesty + 7 paint;
   the MEASURED gate is what counts — the S26 lesson).
2. The boundary probe re-run on the remediated build (probe-only DB): the
   extreme shape renders **60.0%** (the run-weighted truth); the boundary
   shapes 0/1/8/9 unchanged (the empty states, the floor, the note);
   the volumetric consistency verdicts all still PASS.
3. The drift battery re-run (client code touched): word parity 1.0000 ×8,
   mobile-nav byte-identical, D62 holds — GREEN.
4. The 20-shot screenshot refresh + VLM spot-checks ×5 (the
   contract-precise prompt discipline — write the check prompt FROM the
   spec's pinned assertions, never from memory; the animated-gradient and
   verdict-format lessons stay encoded in the check script).

## ToDo

- [x] R1a `weightedSuccessRate` + the `successRate` field rename in
      `src/lib/workflow.ts` + the unit pins
- [x] R1b the route's GET: the rate-rows findMany + the weighted stats
      seam (drop `_avg`)
- [x] R1c the dashboard page's initial-stats seam (twin change)
- [x] R1d the client: the "Success rate" label + the weighted fallback +
      the shape-check rename
- [x] R1e the smoke probe-rate change (99.5 → 50) + the discriminating
      wire pin (93.1)
- [x] R1f NEW `session27-stat-honesty.spec.ts` (4 pins)
- [x] R2 the paint-milestone pins (+7)
- [x] RED observed on the pre-fix build (unit structural + e2e rendered
      values + smoke wire value)
- [x] Full gate green — 511 → **529** (176 unit + 124 smoke + 229
      e2e — measured; the plan's predicted ~529 was exact)
- [x] The boundary probe re-run GREEN (60.0% at the extreme shape; the
      shapes unchanged)
- [x] Drift battery re-run GREEN — word parity 1.0000 ×8, mobile-nav
      byte-identical, D62 holds
- [x] Screenshots (20) + VLM spot-checks (5) PASS — 5/5 on the first
      run (both S26 lessons encoded); the capture script's latent bug
      FIXED en route (the S26 run had refreshed only 17 of 20 — the
      finally's process.exit(0) swallowed the section-14 failure)
- [x] PAD ledger D108–D109 + §7 counts + §11 key files
- [x] AGENTS gotcha 41 + counts + the invariant line
- [x] CLAUDE session-27 context
- [x] README badge/counts + the success-rate row
- [x] SKILL version bump + lessons
- [x] .env.example verified in sync (no new env vars — the weighting is a
      code constant)
- [x] remediation plan ticked + session log `docs/session_52.md`
- [x] worklog.md updated
- [x] commit on main + SSH wrapper push (wrapper-verified — the hash
      recorded below post-push)

**Pushed:** `e0b9cd8` on `main` → `git@github.com:nordeim/saas-company.git`
(via `docs/ssh_git_wrapper_v3.py` with an operator-supplied key — the
fingerprint verified against the S1–S26 record
(`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`), the dry-run
confirmed the fast-forward `bf79e27..e0b9cd8` with the explicit
`--remote`, the real push executed, and the wrapper asserted **remote
main @ `e0b9cd8` == local HEAD** — wrapper-verified. The operator key
shredded after use (both the wrapper's temp copy and the operator's
file). No new branches — everything on `main`, per the operator
contract.)
