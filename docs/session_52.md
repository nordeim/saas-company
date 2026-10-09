# Session Log 52 — Session 27: the stat-honesty + paint-budget remediation

**Scope:** the S50 log's three suggested surfaces — the unpinned
TTFB/FCP budget families, the composed-vs-charted cross-surface
consistency audit, and the first-run story under the empty-workspace
boundary shapes — surveyed first, then extended to the class they
belong to. Plan: `docs/remediation-plan-session27.md`.

## Audit

The standing battery first: word parity **1.0000 on all 8 routes**
(reference UNCHANGED), the mobile-nav paired real-touch probe (7 rows ×
44px, no Tailwind v4 bug, D32 holds), the live LOGIN re-verified (D62),
the SEO surface clean. The baseline gate inherited **511 checks ALL
GREEN** (170 unit + 123 smoke + 211→218 e2e — no flake).

The Session-27 NEW audit surface, probed on the probe-only server
(:3191, `db/probe-s27.db`, gotcha-30, three purpose-built users: an
EMPTY user built up live through the boundary shapes 0 → 1 → 8 → 9; an
extreme success-rate shape; the 111-row volumetric workspace) — 25
verdicts, 23 PASS with 2 probe-side format bugs (expected `100%`, the
card renders `100.0%`):

- **F1 — RED-CONFIRMED DEFECT: the success-rate stat card's
  average-of-averages fallacy.** The card labeled "Avg success rate"
  rendered Prisma's `_avg successRate` — the UNWEIGHTED mean over
  workflows. The extreme shape (1 row: 12,000 runs @ 60% + 4 rows:
  3 runs @ 100%) displayed **92.0%** while the workspace's true
  (run-weighted) rate is **60.0%** — a 32-point divergence displayed
  directly beside "Total runs 12,012" (the run-share reading it
  invites). Even the seeded workspace diverged at the rendered
  decimal (unweighted 99.2% vs run-weighted 99.3–99.5%). The
  adjudication: the run-weighted share IS the workspace's success
  rate — the S21 honesty family applied to the weighting.
- **F2 — the unpainted budget corners (a tooling gap):** TTFB
  (7–30ms), FCP (136–196ms), and the authed-dashboard LCP (152ms)
  all healthy, all unpinned (DOM/LCP/transfer were pinned; the paint
  milestones were not).
- **F3 — the pin gaps around working behavior:** the chart's
  client-refresh path (a UI compose/delete updating the chart through
  `refresh()`'s meta.topRuns consumption WITHOUT a reload —
  session26-chart-rank pins the reload path only) and the first-run
  story (the empty-workspace render — the boundary shapes probed live
  at 0/1/8/9 rows, all honest, none gated).
- **Adjudicated CLEAN/non-findings:** the boundary shapes (the note
  appears exactly past the cap; the one-row runs=0 bar rides the
  adjudicated 4% floor with its honest "0" label), the
  empty-workspace "100.0%" rate (the documented S21 null → 100
  mapping), the volumetric cross-surface consistency (stat cards vs
  chart vs list vs DB truth all match — pinned since S21/S26,
  re-verified live).

## The fixes (TDD-first)

**R1 — the success rate carries the workspace's truth (F1, D108).**
The pure `weightedSuccessRate()` seam in `src/lib/workflow.ts`
(Σ(runs × successRate) / Σ(runs), null iff Σruns = 0 → the documented
100 mapping); the GET route's and the dashboard page's `Promise.all`
gain the two-column rate-rows fetch feeding the shared seam (dropping
`_avg`); the client's fallback memo weights identically over the
visible rows; the meta field renames `avgSuccessRate` → `successRate`
(name/value coherence on the wire — a field named "avg" carrying a
weighted rate would be the S26 chart lie one layer down); the label
renders **"Success rate"** (the S26 label-names-its-criterion law).
The smoke's 105 volumetric probe rows change successRate 99.5 → 50 so
the new wire pin DISCRIMINATES (the unweighted mean would say 52.7,
the run-weighted truth 93.1 — at 99.5 BOTH render 99.5%, pinning
nothing).

**R2 — the paint-milestone budgets (F2, D109).** Seven preventive
pins in `performance-budget.spec.ts`: TTFB ≤ 500ms + FCP ≤ 1000ms on
landing/login/authed-dashboard (NavigationTiming + PaintTiming) and
the authed-dashboard LCP ≤ 1000ms — the measured values pinned with
the S25 generous-margin discipline (the budget catches GROSS
regressions).

**R3 — the pin-gap closures (F3).** Four e2e pins in
`session27-stat-honesty.spec.ts`: the empty-workspace boundary (a
fresh registered user's three surfaces), the wire↔card↔DOM rate
coherence with the self-checking discrimination meta-assertion, the
compose→chart client-refresh path, and the delete→chart-drop path.

**RED observed on the pre-fix build:** unit 8 failed (the seam does
not exist + the renamed field); e2e (a) the label "Avg success rate" ≠
"Success rate" and (b) `meta.stats.successRate` undefined; the
client-refresh and paint pins pass by design (preventive); the smoke
pin fails at the missing field (52.7 ≠ 93.1 at the discriminating
shape).

## Verification

- **Full gate: 511 → 529 checks ALL GREEN** (lint ✓, typecheck ✓,
  unit 176/176, build exit 0 — the Ecmascript warning is the
  documented gotcha-32 channel, smoke 124/124, e2e 229/229 in 4.7m,
  no flake).
- **The boundary probe re-run: 25/25 PASS.** The extreme shape renders
  **60.0%** (the run-weighted truth — the unweighted mean would say
  92.0%); the volumetric card renders 99.6% (the unweighted mean
  would have claimed 100.0%); the boundary shapes 0/1/8/9 unchanged
  and honest.
- **The drift battery re-run: GREEN** — word parity 1.0000 ×8, the
  mobile nav byte-identical, D62 holds (zero regressions from the
  client changes).
- **Screenshots: the standing 20-shot set genuinely refreshed** — with
  a LATENT BUG IN THE CAPTURE SCRIPT fixed en route: after the mobile
  section the desktop page sat on /accessibility, so the
  resilience-shot Pause click found no button and timed out, and the
  finally's `process.exit(0)` SWALLOWED the in-flight error — the S26
  run had refreshed only 17 of 20 shots while exiting 0 (the
  completion log line is the check, never the exit code alone; the
  stale git-checkout mtimes on shots 14/15/16 were the tell). The
  script now re-navigates to /dashboard before the shot and never
  exits 0 from a finally.
- **VLM spot-checks ×5: PASS on the first run** — both S26 lessons
  encoded in the prompts (the animated-gradient single-frame
  tolerance; the strict verdict format), and the dashboard contract
  updated from the spec's pinned assertions (the "Success rate" label
  @ 99.5%, the ranked chart, the composer card's real heading).
- **`.env.example` verified in sync** (identical key set; no new env
  reads — the weighting is a code constant).

## Documentation

PAD (revision block, ledger D108–D109, §7 counts 176/124/229 = 529,
§11 key-file rows incl. the new spec row), AGENTS (gotcha 41 + the 529
counts + the invariant line naming the run-weighted rate + the paint
budgets), CLAUDE (session-27 context + stack-table/checklist counts),
README (529 badge + the stat-card weighting row + every stale count),
SKILL v2.26.0 (lessons 62–63), remediation plan session27 (ticked with
the measured gate), this session log, the worklog.

**Suggested next (Session 28 candidates):** the remaining
cross-surface seam audits — the chart's `topRuns` tie-break contract
under live mutation (two rows with equal runs: does the tie-break
survive a pause/resume refresh cycle), the stat cards' `hours`
rounding boundary (a workspace whose true hours sum sits exactly on
x.5 — `Math.round` banker's-vs-half-up drift), or the budget families'
last unpinned member (the CLS / layout-stability milestone — if the
LCP family is pinned, the shift family is not).
