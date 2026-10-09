# Remediation Plan — Session 26 (2026-10-09)

**Scope:** Fix the issues found by the Session 26 audit of this repository
(the S48 log's three suggested surfaces — the chart's top-8-by-runs vs
recency question, the keyboard-focus sub-tab order audit, and the
Lighthouse-style JS-transfer budget — surveyed first, then extended to the
class they belong to), executed TDD-first, gated by the full quality gate
(§7.3 of the PAD), and re-verified by the standing paired survey.

**Audit method:** the standing drift battery first (word parity **1.0000 on
all 8 routes** — the 8th being the 404 route; `/demo` is the clone's
superset route, excluded from the parity set by design; both sides rendered
in Chromium — the reference is UNCHANGED since Session 25; the mobile-nav
paired real-touch probe: the clone's burger opens with a REAL tap into the
byte-identical panel — seven rows, every row exactly 44px — **no Tailwind
v4 bug**; the live's burger remains pointer-blocked, D32; the live LOGIN
re-verified — D62 holds). The SEO surface re-verified CLEAN (sitemap 200
`application/xml` ×8 routes; robots the honest superset semantics;
og-image a real 1200×630 PNG; `manifest.json` valid). The baseline gate
inherited **493 checks ALL GREEN** (164 unit + 118 smoke + 211 e2e — no
flake; lint + typecheck + build clean). Then the Session-26 NEW audit
surface, probed on the probe-only server (:3190, `db/probe-s26.db`,
gotcha-30 discipline, a 12-row workspace whose OLDEST row carries the
HIGHEST runs — the shape that interrogates the chart's selection
criterion):

1. **The chart's selection-criterion defect (F1):** the runs chart under
   the section heading "Runs by workflow" charts `workflows.slice(0, 8)` —
   the 8 most RECENT rows, mirroring the list — not the top 8 BY RUNS.
   RED-confirmed with the champion probe: a 12-row workspace whose oldest
   row carries 12,000 runs (13x the top displayed row) renders the 8 most
   recent rows (150–900 runs) with **the champion INVISIBLE** and every
   bar at 4%–7.5% stubs — the `maxRuns` denominator comes from a row the
   chart never displays, so the bar-length encoding carries no information
   exactly when a runs-ranking is meaningful. The chart answers "what did
   I create lately" while its title promises "which workflows run the
   most". The S48 log flagged this as an open question; the adjudication:
   **the heading's promise governs** (the S21/S25 honesty family: the
   content must match what the surface claims to show — the LIST already
   owns the recency contract, and the reference has no dashboard (D1/D62)
   so this is superset quality, no parity constraint).

2. **The deeper lie found while designing the fix (F1b):** at >100
   workflows (the S21 volumetric case), the client's `workflows` state is
   the CAPPED newest-100 list — every old high-run row sits OUTSIDE the
   cap, so ANY client-side ranking ranks only the newest 100. The smoke
   suite's own 111-row workspace (105 probe rows at runs:10 + the 6 seeded
   rows) would chart 8 probe rows while the seeded champion ("Anomaly scan
   on billing events", 3,422 runs — 31 days old) sits invisible: the
   newest-100 cap contains ZERO seeded rows. The honest fix MUST be
   server-side — the S21 stat-cards precedent ("a capped list without
   honest aggregates silently turns the stat cards into subset summaries")
   extended to the ranking surface: the envelope's `meta` sibling gains
   `topRuns`, computed across the FULL workspace.

3. **The keyboard-focus tab-order audit (F2 — adjudicated CLEAN):**
   Tab-order probes on `/` (34 interactive elements reached, every one
   focus-styled, no order anomalies), `/login` (6/6 reached, clean), and
   the authed `/dashboard` (27/28 reached — the 28th is the disabled
   Compose button, correctly skipped: disabled = not focusable). The one
   focusable `div` in the sequence is the testimonial strip's
   `scrollable-region-focusable` — the documented D63 SHARED axe violation
   (the live ships it identically; parity law, NOT to fix). The features
   tab trio and the pricing toggle use `aria-pressed` toggle-button
   semantics (reachable by Tab, operable by Enter/Space — a legitimate
   ARIA pattern, not a tablist). Non-finding; documented here so a future
   session does not re-litigate it blind.

4. **The JS-transfer surface unpinned (F3 — a tooling gap, not a
   defect):** the S25 performance-budget pins cover DOM nodes and LCP;
   nothing pins the SCRIPT BYTES. Measured (ResourceTiming, standalone,
   localhost): landing scripts **172KB** across 10 files (the 2,214KB
   total is dominated by the 1,898KB hero video — the reference's own
   parity asset), login **152KB**/9, the authed dashboard **177KB**/11.
   A bundle bloat (an accidental full-library import) would pass all 493
   checks while doubling the site's JS. The budget hook extends to the
   transfer layer with generous ceilings (the S25 de-flake discipline).

## The fixes (TDD-first)

### R1 — the chart ranks by its title's promise (F1 + F1b)

- **`src/lib/workflow.ts`:** `CHART_ROWS = 8` moves here from the
  component (the server loaders and the client import one constant), plus
  `rankByRuns(rows, limit)` — the pure client-side FALLBACK seam: sort by
  runs desc, tie-break createdAt desc (newest first among equals — the
  list's own convention), capped at the limit. Unit-pinned (a new
  `src/lib/workflow-rank.test.ts`).
- **`src/app/api/workflows/route.ts` (GET):** the topRuns query joins the
  existing `Promise.all` — `findMany({ where, orderBy: [{ runs: "desc" },
  { createdAt: "desc" }], take: CHART_ROWS, select: { id, name, runs } })`
  — and the envelope's meta gains `topRuns` (strictly additive, exactly
  like `stats` in S21; every existing consumer that reads `data` or
  `meta.stats`/`meta.total` is untouched).
- **`src/app/dashboard/page.tsx`:** the same query joins the page's
  `Promise.all` → the new `initialTopRuns` prop (TRUE at any volume from
  the first paint).
- **`src/components/dashboard/dashboard-app.tsx`:** the `topRuns` state
  (initialized from the prop; `refresh()` consumes `meta.topRuns` when
  present, shape-checked like `stats` — strictly optional so the
  error-boundary e2e mocks keep fulfilling with bare arrays); the chart
  renders `topRuns ?? rankByRuns(workflows, CHART_ROWS)`; `maxRuns`
  becomes the CHARTED max (the top bar renders the full track — 100%);
  the truncation note becomes **"Showing the top {CHART_ROWS} of {total}
  workflows by runs."** when `total > CHART_ROWS` (the S21-pattern honest
  note, now naming the ranking criterion; `text-white/50` — the S25
  contrast law). The S25 ul/li semantics stay.
- **`tests/e2e/session25-chart.spec.ts`:** the note-wording pins updated
  to the new contract — (a) no note of ANY wording while the workspace
  fits; (b) the new text.
- **NEW `tests/e2e/session26-chart-rank.spec.ts`** (sorts AFTER
  session25-chart — the single-worker suite-order discipline; asserts
  against whatever rows survive, mints its surplus through the
  authenticated create API via in-page fetch (gotcha-30) and deletes it
  in a finally):
  - (a) the chart's first row is the TOP RUNNER among the visible
    articles (the max of the list's "N runs" values), and the chart's
    values are non-increasing — RED on the pre-fix build (the first row
    is the most RECENT row).
  - (b) the champion stays visible when newer runs=0 rows crowd the
    workspace (mint 6 rows; reload; every surviving article with runs > 0
    appears in the chart) — RED (the pre-fix chart shows the 8 most
    recent: the minted rows crowd the champion out).
  - (c) the note names the ranking criterion — "Showing the top 8 of {N}
    workflows by runs." — RED (the pre-fix note says "most recent").
  - (d) the top bar spans the full track width (the charted max renders
    100%) — RED (the pre-fix top bar renders at the 4% floor when the
    most recent row is a low-run row).
- **`scripts/smoke-test.sh`:** +5 wire-level pins in the Session-21
  volumetric section (the 111-row workspace — the case that PROVES the
  server-side computation): `meta.topRuns` has exactly 8 entries;
  `topRuns[0].name` = "Anomaly scan on billing events" (the champion —
  INVISIBLE to the newest-100 list); `topRuns[0].runs` = 3422;
  `topRuns[1].runs` = 2107 ("Onboarding email orchestration");
  `topRuns[6].runs` = 10 (the probe rows fill the tail — the seeded rows
  took the top).

### R2 — the JS-transfer budget pins (F3)

`tests/e2e/performance-budget.spec.ts` gains three preventive pins
(scripts ≤ **400KB** per route — 2.3–2.6x the measured 172/152/177KB; the
S25 generous-ceiling discipline: the budget catches GROSS regressions):
landing, login, and the authed dashboard, each summing the script
entries' `transferSize` from a settled `performance.getEntriesByType
("resource")` read. These pins are PREVENTIVE tooling — they pass on the
current build by design (their RED is a future regression).

### R3 — the screenshot refresh

The chart's row order changes on every dashboard shot (runs-descending
instead of newest-first) → the standing 20-shot set is recaptured (the
S23–S25 pattern: a fresh boot with `AUTH_RATE_LIMIT_MAX=50`, the
error-boundary mock covering the `[id]` routes, the dev DB logical state
verified CANONICAL before AND after).

### Validation before execution (performed against the codebase)

- **Pin-conflict scan (R1):** no e2e spec references the chart's ORDER —
  the landing/pages "chart" pins target the LANDING mockup's Analytics tab
  (a parity surface, untouched); `dashboard.spec`'s article counters are
  order-agnostic; the ONLY in-repo assertions on the note text are
  session25-chart's three (updating them is part of R1); the
  error-boundary mocks intercept `**/api/workflows` with bare arrays (the
  meta-optional fallback preserves them); the api-meta unit pins construct
  their own meta payloads (the `ok()` seam is generic — additive keys
  pass through untouched).
- **Pin-conflict scan (R2):** no existing spec reads ResourceTiming
  transferSize; the performance-budget suite's LCP observer is unrelated.
- **Suite-order scan:** `session26-chart-rank.spec.ts` sorts after
  `session25-chart.spec.ts` (alphabetical, single worker, shared e2e.db);
  the minted-surplus pattern (create → reload → assert → delete in
  finally) is the session25-chart pattern verbatim.
- **RED expectation:** the four ranking pins fail on the pre-fix build
  (probed on :3190 — the champion invisible, the first row the most
  recent, the note naming recency, the bars at the floor). The transfer
  pins are preventive and pass by design.

## Post-execution verification

1. Full gate: lint → typecheck → unit → build → smoke → e2e — the count
   rises 493 → **511** (+6 unit: the rankByRuns seam pins — one more
   than predicted, the tie-break pair earned its own pins; +5 smoke:
   the topRuns wire pins; +7 e2e: 4 ranking pins + 3 transfer pins —
   the plan's predicted 505/169/213 was short the sixth unit pin and
   the fourth ranking pin (d), the no-note case; the MEASURED gate is
   what counts).
2. The champion probe re-run on the remediated build (probe-only DB):
   the 12-row workspace renders the champion FIRST at 100% width with
   bars descending meaningfully (100 → 75 → 50 → 25 → 7.5%) and the
   honest note naming the criterion — GREEN.
3. The drift battery re-run (client code touched): word parity 1.0000 ×8,
   mobile-nav byte-identical, D62 holds — GREEN.
4. The 20-shot screenshot refresh + VLM spot-checks ×5 — 5/5 PASS
   after adjudicating drifts #11 (the animated-gradient single-frame
   artifact — a time-sampled probe proved the 14s sweep running) and
   #12 (the prompt's invented hero "dashboard mockup" — the hero's
   video is the full-bleed background; the mockup is a separate
   below-fold section) and encoding both lessons into the check script
   (the contract-precise prompt discipline — write the check prompt
   FROM the spec's pinned assertions, never from memory).

## ToDo

- [x] R1a `CHART_ROWS` + `rankByRuns` in `src/lib/workflow.ts` + the unit
      pins (`src/lib/workflow-rank.test.ts`)
- [x] R1b the server topRuns aggregate: the GET route's `meta.topRuns` +
      the page's `initialTopRuns` prop
- [x] R1c the client: `topRuns` state + the ranked chart + the charted-max
      `maxRuns` + the criterion-naming note
- [x] R1d `session25-chart.spec.ts` note-wording update + NEW
      `session26-chart-rank.spec.ts` (4 pins)
- [x] R1e the smoke topRuns pins (+5)
- [x] R2 the JS-transfer budget pins (+3)
- [x] RED observed on the pre-fix build (the 4 ranking pins)
- [x] Full gate green — 493 → 511 (170 unit + 123 smoke + 218 e2e —
      measured; the plan's predicted 505 was short the sixth unit pin and
      the fourth ranking pin)
- [x] The champion probe re-run GREEN (champion first @ 100% + the note)
- [x] Drift battery re-run GREEN — word parity 1.0000 ×8, mobile-nav
      byte-identical, D62 holds
- [x] Screenshots (20) + VLM spot-checks (5) PASS — 5/5 after the
      drift-#11/#12 adjudications
- [x] PAD ledger D106–D107 + §7 counts + §11 key files
- [x] AGENTS gotcha 40 + counts + the invariant line
- [x] CLAUDE session-26 context
- [x] README badge/counts + the chart-ranking row
- [x] SKILL v2.25.0 lessons 60–61
- [x] .env.example verified in sync (no new env vars — CHART_ROWS is a
      code constant)
- [x] remediation plan ticked + session log `docs/session_49.md`
- [x] worklog.md updated
- [ ] commit on main + SSH wrapper push (wrapper-verified — the hash
      recorded below post-push)
