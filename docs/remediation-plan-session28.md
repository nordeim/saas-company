# Remediation Plan — Session 28 (2026-10-09)

**Scope:** Fix the issues found by the Session 28 audit of this repository
(the S53 log's three suggested surfaces — the `topRuns` tie-break under
live mutation, the stat cards' `hours` rounding boundary at exactly x.5,
and the CLS layout-stability budget — surveyed first, then extended to
the class they belong to), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by the standing paired survey.

**Audit method:** the standing drift battery first (rebuilt after the
workspace reset — word parity **1.0000 on all 8 routes**, the reference
UNCHANGED; the mobile-nav paired probe: the clone's burger opens with a
REAL tap into the byte-identical panel — seven rows, every row exactly
44px — **no Tailwind v4 bug**; the live's burger remains pointer-blocked,
D32; the live LOGIN re-verified — D62 holds). The SEO surface re-verified
CLEAN (sitemap 200 `application/xml`; robots the honest superset
semantics; og-image a real 1200×630 PNG; `manifest.json` valid). The
baseline gate inherited **529 checks ALL GREEN** (176 unit + 124 smoke +
229 e2e — no flake; lint + typecheck + build clean) on the rebuilt
environment (fresh `npm install`, canonical DB re-seeded — checksum
`e7f6c011`, the S1–S27 record). Then the Session-28 NEW audit surface,
probed on the probe-only server (:3241, `db/probe-s28.db`, gotcha-30
discipline, two purpose-built users: the 9-row tie-break workspace and
the x.5 hours-boundary workspace) — 9/9 probe verdicts PASS, and the
follow-up seam-level float survey that isolated the one defect:

1. **F1 — the client-fallback hours seam's order-dependent float drift
   (RED-confirmed at the seam level).** The "Hours saved" card has TWO
   computation seams: the SERVER loaders (the GET route's and the
   dashboard page's Prisma `_sum timeSavedHours` — SQLite's SUM uses
   extended-precision accumulation and answers the EXACT decimal grid
   value at every probed shape) and the CLIENT's `listStats` fallback
   (a naive JS float `reduce` over the list in createdAt-DESC order).
   At a workspace whose true decimal hours sum sits exactly on x.5, the
   JS reduce is **order-dependent**: probed with [23.4, 15.7, 14.4]
   (decimal 53.5) — the rowid-order sum is 53.499999999999993 while the
   reverse order sums exactly 53.5; probed with [15.4, 17.9, 15.2]
   (decimal 48.5) — the list-order sum is 48.499999999999993. The
   boundary consequence, measured live against the probe DB (per-shape
   isolation, six shapes): the server displays **49 / 51 / 54 / 38**
   (the half-up convention, correct at every shape) while the client
   fallback displays **48 / 50 / 53 / 37** — a 1-hour divergence between
   the two seams of ONE definition (the S22/S27 "one definition, no
   drift between the seams" law, violated exactly at the boundary the
   S53 log asked about). The production card always renders the SERVER
   value (the meta-present path; `serverStats` is never null in
   production — the page always computes the initial stats), so the
   divergence is LATENT — the fallback fires only on meta-less payloads
   (the error-boundary mock contract) — but the S27 law says the
   fallback must compute "identically" over the visible rows, and at
   x.5 shapes it provably does not. The class survey: `runs` (integer
   addition — exact at every order, CLEAN); the run-weighted success
   rate (the S27 seam — Σ(runs × rate) float products in sequence; a
   50,000-shape search for toFixed(1) boundary flips found ZERO — the
   large-magnitude integer-weighted products keep the 0.1-granularity
   display stable; adjudicated CLEAN, documented).

2. **F2 — the unpinned tie-break contract (a pin gap around WORKING
   behavior — probed 5/5 PASS).** The chart's `topRuns` tie-break
   (`runs DESC, createdAt DESC` — "newest first among equals, the
   list's own convention") is CORRECT at every probed shape: the top
   tie (the newer 1,000-run row charted first), the boundary tie (the
   newer of two 400-run rows charted at position 8, the older dropped —
   a 9-row probe workspace), the wire twin (`meta.topRuns` carrying
   exactly the rendered order), and the LIVE MUTATION cycle (pause →
   refresh → resume → the tie order STABLE — status does not
   participate in the ranking, probed through the UI). But NO spec
   pins ANY tie behavior: the seeded workspace has six all-distinct
   runs values, and every API-minted row carries `runs: 0` — the ties
   exist in the test data (the S26/S27 minted rows all tie at zero)
   but the ORDER among them was never asserted. The S25 survey law:
   probe every ranked surface with the shape that exercises the
   question — the pin is the surviving memory of the probe.

3. **F3 — the budget families' last unpinned member (CLS — measured
   healthy, unpinned).** The S25/S26/S27 budget families cover DOM
   nodes, LCP, script-transfer bytes, TTFB, and FCP; the
   layout-stability milestone (CLS) has no pin anywhere. Measured on
   the probe server (fresh contexts, entrances settled): landing
   **0.0028**, login **0.0000**, authed dashboard **0.0000** — 35x+
   under the Core Web Vitals "good" threshold (0.1). The expected
   noise floor is tiny by construction (the entrances are
   opacity/transform — no layout participation; the fonts are
   self-hosted with preload; the dashboard is server-rendered with
   its initial state).

**Adjudicated CLEAN/non-findings** (documented so a future session does
not re-litigate blind): the tie-break behavior itself (5/5 — the
deterministic `createdAt DESC` secondary key is stable under mutation
by construction: PATCH never writes `runs` or `createdAt`); the
server-side hours aggregate (SQLite's SUM is extended-precision —
grid-exact at every probed shape, no server change needed for
correctness — the unification below is for the one-definition law, not
a server bug); the run-weighted rate's float stability (50,000-shape
search, zero display flips — the integer-weighted products are
high-magnitude and the display granularity coarse); the CLS values
themselves (near-zero on all three routes — the pin is preventive, its
RED is a future regression); the seeded workspace's hours display (160.0
exact — no boundary); the smoke's 111-row hours pin (265 — all integer
values, no boundary).

## The fixes (TDD-first)

### R1 — the exact hours seam: one definition, order-free (F1)

- **`src/lib/workflow.ts`:** NEW pure seam `sumHours(rows)` —
  `Σ Math.round(timeSavedHours × 10)` accumulated in integer tenths,
  answered as `tenths / 10`: the EXACT decimal-grid sum, order-free by
  construction (integer addition is associative — the S22
  close-by-construction pattern applied to float drift). Every
  persisted `timeSavedHours` value is on the 0.1 grid (POST hardcodes
  0; PATCH accepts only name/description/category/status — verified:
  no API path writes hours; the seed uses halves and integers; the
  probe/smoke inserts use grid values), so the seam is exact for every
  reachable state — the grid snap can never corrupt a value.
- **`src/app/api/workflows/route.ts` (GET):** the rate-rows fetch
  becomes the STAT-ROWS fetch — `select: { runs, successRate,
  timeSavedHours }`, renamed `rateRows` → `statRows` (the S26
  label-names-its-criterion law: a fetch named "rate" feeding the
  hours too would be the naming lie one layer down) — feeding BOTH
  pure seams (`weightedSuccessRate(statRows)` + `sumHours(statRows)`);
  the aggregate drops `_sum: { timeSavedHours }` (the dead column —
  one hours source; `_sum: { runs }` stays — integer, exact).
- **`src/app/dashboard/page.tsx`:** the twin change (the page's
  initial-stats seam stays twin to the route's — one definition, no
  drift between the seams).
- **`src/components/dashboard/dashboard-app.tsx`:** the `listStats`
  fallback's hours becomes `Math.round(sumHours(workflows))` — agrees
  with the server at EVERY shape (the fallback contract the S27 law
  names, now true for hours as it already is for the rate).
- **`src/lib/workflow-ceiling.test.ts`:** NEW `sumHours` pins — the
  DRIFT shape [15.4, 17.9, 15.2] → **48.5 exactly** (the naive reduce
  answers 48.499999999999993 — the pin DISCRIMINATES the seam from
  the buggy arithmetic it replaces); the same shape reversed → the
  same answer (order-freedom); the seeded 6-row shape → 160; the
  empty workspace → 0; the exact-halves control [10.5, 13] → 23.5;
  and the display boundary pins in the `statsFromAggregate` block:
  `hours` 48.5 → 49 and 53.5 → 54 (the half-up convention at the
  x.5 boundary — the missing .5 pin; the existing .4/.6 pins date to
  Session 21).

### R2 — the tie-break pins (F2 — preventive, the probed behavior gated)

**NEW `tests/e2e/session28-tie-break.spec.ts`** (sorts after
session27-stat-honesty — single worker, shared e2e.db; minted rows
inserted DIRECTLY through Prisma with the constructor datasource
override `file:../db/e2e.db` — the API cannot mint nonzero runs, and
the tie question needs controlled `runs` AND `createdAt`):

- (a) the tie cluster renders newest-first: three rows tied at runs
  777 with distinct `createdAt` (40d / 20d / 2d old) + one boundary
  row at runs 96 (newer than the seeded 96-run row it ties) → the
  chart renders the seeded champions (3422 / 2107 / 1284), then the
  777 cluster **NEW → MID → OLD**, then 148, then the charted 96 =
  the MINTED row (the seeded 96-row dropped — the boundary tie-break)
  — and the note reads "Showing the top 8 of 10 workflows by runs."
- (b) the pause/resume stability: pause the newest 777 row through
  the UI → the tie order UNCHANGED (status does not participate);
  resume → still unchanged.
- (c) the cleanup in a `finally` (the survivor discipline — later
  specs' 6-row expectations stay intact).

### R3 — the CLS pins (F3 — preventive, the last milestone family)

`tests/e2e/performance-budget.spec.ts` gains three pins: **CLS ≤ 0.1**
on landing, login, and the authed dashboard (a `PerformanceObserver`
on `layout-shift` with `hadRecentInput` filtered, registered via
`addInitScript` before navigation, read after the entrances settle;
measured 0.0028 / 0.0000 / 0.0000 — the generous-ceiling de-flake
discipline: the budget catches GROSS regressions, not hundredths).
These pins are PREVENTIVE tooling — they pass on the current build by
design (their RED is a future regression).

### Validation before execution (performed against the codebase)

- **Pin-conflict scan (R1):** the symbol `sumHours` appears nowhere
  in src/ tests/ scripts/ (a clean name); the `rateRows` identifier
  appears in exactly 2 source files (the route + the page — both
  renamed atomically); `_sum: { timeSavedHours }` has exactly 2
  authors (the route + the page) and ZERO pin readers (the smoke
  pins read the RENDERED `meta.stats.hours` — the wire value, not the
  query); the client's `Math.round(hours)` line is the sole fallback
  hours computation; the `statsFromAggregate` .4/.6 hour pins exist
  and stay green (the seam's rounding is unchanged — only the CALLER
  passes a grid-exact input now).
- **Pin-conflict scan (R2):** no spec inserts rows through Prisma
  today (the mint-via-API convention — `global-setup.ts` seeds the
  whole file; the spec's direct inserts are new tooling, cleanup-gated
  by the finally); no existing spec asserts chart ORDER among equal
  runs (the seeded runs are all-distinct); the tie row names ("S28
  Tie NEW/MID/OLD", "S28 Boundary NEW") collide with nothing.
- **Pin-conflict scan (R3):** no existing spec reads `layout-shift`
  entries (the performance-budget suite reads LCP, TTFB, FCP, transfer
  — the CLS observer is additive).
- **Suite-order scan:** `session28-tie-break.spec.ts` sorts after
  `session27-stat-honesty.spec.ts` and before `typography-parity.spec.ts`
  (alphabetical, single worker, shared e2e.db); the register/sign-in
  flows reuse the demo login (no new rate-limit budget); the minted
  rows' cleanup keeps later specs' 6-row expectations intact.
- **RED expectation:** the R1 unit pins fail structurally on the
  pre-fix build (`sumHours` does not exist — the import itself fails
  the file) + the boundary display pins (48.5 → the caller passes the
  naive float — pre-fix there is no seam call to fail; the structural
  RED is the honest observable). The R2/R3 pins are preventive and
  pass by design (their RED is a future regression).

## Post-execution verification

1. Full gate: lint → typecheck → unit → build → smoke → e2e — the
   count rises 529 → **~541** (+6 unit: the sumHours seam pins incl.
   the boundary display pins; +2 e2e: the tie-break pair; +3 e2e: the
   CLS trio; the MEASURED gate is what counts — the S26 lesson).
2. The seam-level float survey re-run against the remediated build:
   the drift shapes [15.4, 17.9, 15.2] etc. — the client-fallback
   computation now answers the SAME integer as the server at every
   shape (the cross-seam agreement the S22 law names).
3. The drift battery re-run (client code touched): word parity 1.0000
   ×8, mobile-nav byte-identical, D62 holds — GREEN.
4. The 20-shot screenshot refresh + VLM spot-checks ×5 (the
   contract-precise prompt discipline — write the check prompt FROM
   the spec's pinned assertions; the animated-gradient and
   verdict-format lessons stay encoded in the check script).

## ToDo

- [x] R1a `sumHours` in `src/lib/workflow.ts` + the unit pins (the
      discriminating drift shape, order-freedom, the boundary display)
- [x] R1b the route's GET: `statRows` (the renamed fetch, +timeSavedHours)
      + `sumHours(statRows)` + the aggregate's dead hours column dropped
- [x] R1c the dashboard page's twin change
- [x] R1d the client's `listStats` fallback: `Math.round(sumHours(...))`
- [x] R2 NEW `session28-tie-break.spec.ts` (the tie cluster order, the
      boundary tie, the pause/resume stability, the finally cleanup) —
      re-designed mid-execution to the DEDICATED-USER pattern (a
      registered workspace with a deterministic 10-row shape: the demo
      workspace is survivor-shaped mid-suite — session23 deletes three
      seeded rows — so survivor-derived expectations were brittle; the
      spec now owns its entire state and cascade-deletes the user)
- [x] R3 the CLS pins (+3) in `performance-budget.spec.ts`
- [x] RED observed on the pre-fix build (5 structural unit failures —
      `sumHours is not a function`; the x.5 display pins passed by
      design — the convention was already correct)
- [x] Full gate green — 529 → **541** (182 unit + 124 smoke + 235
      e2e — measured; the plan's predicted ~541 was exact). ALSO this
      session: the e2e suite outgrew `AUTH_RATE_LIMIT_MAX=50` (the
      ~45 auth flows per run crossed the pin mid-suite — the
      Session-11 razor-edge pattern recurring); raised to 100 in
      `playwright.config.ts` with the documented reason
- [x] The seam-level float survey re-run GREEN — all six drift shapes
      AGREE across the seams (the pre-fix divergences 48/50/53/37 vs
      49/51/54/38 closed)
- [x] Drift battery re-run GREEN — word parity 1.0000 ×8, mobile-nav
      byte-identical, D62 holds
- [x] Screenshots (20) + VLM spot-checks (5) PASS — the three
      first-run VLM FAILs were the CHECK PROMPTS' own contracts written
      from memory (the login heading is "Welcome to SAAS Company", the
      404 is the reference's own LIGHT slate card, the menu's Get
      Started pill is 44px like every row); all adjudicated against the
      code before any change, the prompts rewritten FROM the pinned
      assertions, the re-run 5/5
- [x] PAD ledger D110–D112 + §7 counts + §11 key files
- [x] AGENTS gotcha 42 + counts + the invariant line
- [x] CLAUDE session-28 context
- [x] README badge/counts + the hours-seam row
- [x] SKILL version bump + lessons (v2.27.0, lessons 64–65)
- [x] .env.example verified in sync (no new env vars — the seam is a
      code constant)
- [x] remediation plan ticked + session log `docs/session_55.md`
- [x] worklog.md updated
- [x] commit on main + SSH wrapper push (wrapper-verified — the hash
      recorded below post-push)

**Pushed:** `b8bae1f` on `main` → `git@github.com:nordeim/saas-company.git`
(via `docs/ssh_git_wrapper_v3.py` with an operator-supplied key — the
fingerprint verified against the S1–S27 record
(`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`), the dry-run with
the explicit `--remote` confirmed the fast-forward `3ca82c1..b8bae1f`,
the real push executed, and the wrapper asserted **remote main @
`b8bae1f` == local HEAD** — wrapper-verified; the fetch re-verified the
remote ref independently. The operator key shredded after use (both the
wrapper's temp copy and the operator's file). No new branches —
everything on `main`, per the operator contract. The shim note: the
sandbox again had no OpenSSH binary — the paramiko ssh shim was rebuilt
at `/home/z/bin/ssh` (the runbook's Appendix A recipe, now with the
BIDIRECTIONAL stdin pump the push path needs — git's receive-pack
streams the pack through the channel; a read-only shim deadlocks the
negotiation).
