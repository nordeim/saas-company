# Session 53 — the transcript log of the Session 27 remediation cycle

This run executed the full task chain end-to-end without interruption:
the workspace refresh (git pull fast-forwarded `c9e5334..bf79e27`,
acquiring `docs/session_51.md` — the Session-26 continuation transcript
that closed the S26 cycle), the docs review (AGENTS, CLAUDE, README,
PAD, SKILL — all aligned with the pushed Session 26 state; session_50 +
session_51 + the ticked remediation-plan-26 + the worklog tail), the
baseline gate (**511 checks ALL GREEN** — 170 unit + 123 smoke + 218
e2e, no flake), and the standing drift battery (GREEN — word parity
1.0000 ×8 with the reference UNCHANGED, the mobile-nav real-touch probe
byte-identical with no Tailwind v4 bug, D32/D62 holding, the SEO
surface clean). This run is **Session 27**; the S50 log's three
suggested surfaces were the audit's charter.

**The audit** (probe-only server :3191, `db/probe-s27.db`, gotcha-30 —
three purpose-built users: an EMPTY user built up live through the
boundary shapes 0 → 1 → 8 → 9 via direct mid-probe inserts; an extreme
success-rate shape; the 111-row volumetric workspace) returned 25
verdicts, 23 PASS with 2 probe-side format bugs (expected `100%`, the
card renders `100.0%` — the probe's own assertions, fixed and
re-run):

- **F1 — RED-CONFIRMED: the success-rate stat card's
  average-of-averages fallacy.** The card rendered Prisma's `_avg
  successRate` — the UNWEIGHTED mean over workflows. The extreme shape
  (1 row: 12,000 runs @ 60% + 4 rows: 3 runs @ 100%) displayed 92.0%
  while the workspace's true run-weighted rate is 60.0% — a 32-point
  divergence sitting directly beside "Total runs 12,012". Even the
  seeded workspace diverged at the rendered decimal (99.2% unweighted
  vs 99.3–99.5% weighted depending on the survivors).
- **F2 — the unpainted budget corners:** TTFB (7–30ms), FCP
  (136–196ms), and the authed-dashboard LCP (152ms) — healthy but
  unpinned (the S25/S26 budgets covered DOM/LCP/transfer only).
- **F3 — the pin gaps:** the chart's client-refresh path
  (meta.topRuns consumption without a reload — session26 pinned the
  reload path only) and the empty-workspace first-run render.
- **Adjudicated CLEAN:** the boundary shapes 0/1/8/9 (the note appears
  exactly past the cap; the one-row runs=0 bar rides the adjudicated
  4% floor), the empty-workspace "100.0%" rate (the documented S21
  mapping), the volumetric cross-surface consistency (all surfaces
  match the DB truth — re-verified live).

**The remediation plan** (`docs/remediation-plan-session27.md`) was
written and validated against the codebase first (pin-conflict scans:
the label had exactly ONE render site and zero spec pins; the field
`avgSuccessRate` appeared in 4 source files + the ceiling unit pins
only — no e2e/smoke references; the smoke probe-rate 99.5 had zero
dependents; no spec reads TTFB/FCP; the suite-order scan placed
session27-stat-honesty after session26-chart-rank with finally-cleanup
and survivor-derived expectations).

**TDD.** RED observed on the pre-fix build: the unit file failed
structurally (8 failed — the seam does not exist + the renamed
field), and the e2e failed with the exact expected modes ((a) the
label "Avg success rate" ≠ "Success rate"; (b) `meta.stats.successRate`
undefined; the preventive pins GREEN by design). TWO mid-authoring
pin bugs were caught by re-running the RED (the discipline): a
locator chain (`locator("li").locator("span").first()`) that resolved
to a single row's span instead of every row's name, and a `> 0` count
poll that seeded rows always satisfy (the count-delta pattern from
dashboard.spec replaced it). GREEN: the pure `weightedSuccessRate()`
seam (Σ(runs × successRate) / Σ(runs), null iff Σruns = 0) riding the
GET route's AND the page's Promise.all (the two-column rate-rows
fetch replaces `_avg`), the client's weighted fallback memo, the meta
field rename `avgSuccessRate` → `successRate`, the label rename to
"Success rate", the smoke's probe rows at rate 50 (the DISCRIMINATING
shape: unweighted 52.7 vs weighted 93.1), the seven paint-milestone
pins, and the four stat-honesty pins.

**Verification.** The full gate rose **511 → 529 checks ALL GREEN**
(176 unit + 124 smoke + 229 e2e — the plan's prediction was exact).
The boundary probe re-run returned **25/25 PASS** (the extreme shape
renders 60.0%; the volumetric card renders 99.6% where the unweighted
mean would have claimed 100.0%). The drift battery re-run: GREEN —
zero regressions from the client changes.

**The screenshot phase found a latent tooling defect:** the standing
capture script had been failing silently since its S26 recreation —
after the mobile section the desktop page sat on /accessibility, so
the resilience-shot Pause click found no button and timed out, and
the `finally` block's `process.exit(0)` PREEMPTED the pending catch
handler: the S26 run had refreshed only 17 of 20 shots while exiting
0. The tell was the stale git-checkout mtimes on shots 14/15/16. The
script now re-navigates to /dashboard before the shot and never exits
0 from a finally (drift forces 1; shot failures propagate to the
catch; only a clean full run exits 0) — and the completion log line
("20 shots captured") is the check, never the exit code alone. The
20-shot set was then GENUINELY refreshed with the dev DB verified
CANONICAL before and after. The VLM spot-checks ×5 passed **on the
first run** — both S26 lessons encoded in the prompts (the
animated-gradient single-frame tolerance; the strict verdict format),
with the dashboard contract written from the spec's pinned assertions
(the "Success rate" label @ 99.5%, the ranked chart, the composer
card's real heading).

`.env.example` verified in sync (identical key set; no new env reads
— the weighting is a code constant).

**Documentation:** PAD (revision block, ledger D108–D109, §7 counts,
§11 key-file rows incl. the new spec row), AGENTS (gotcha 41 + the
529 counts + the invariant line naming the run-weighted rate + the
paint budgets), CLAUDE (session-27 context + stack-table/checklist
counts), README (529 badge + the stat-card weighting row + every
stale count), SKILL v2.26.0 (lessons 62–63), the remediation plan
ticked with the MEASURED gate, the formal session log
`docs/session_52.md`, and both worklogs.

**Commit and push.** The final gate re-checked green on the complete
tree; the change list reviewed clean (27 files — no `.env`, no keys,
no `db/*.db`, no logs). Committed to `main` as `e0b9cd8` (the
`:bug: fix:` Session-27 message in the house style). The SSH wrapper
runbook followed exactly: the operator key materialized to a 0600
file outside the repo, its fingerprint verified against the S1–S26
record (`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`), the
dry-run with the explicit `--remote` confirmed the fast-forward
`bf79e27..e0b9cd8`, the real push executed, and the wrapper asserted
**remote main @ `e0b9cd8` == local HEAD** — wrapper-verified. The
operator key shredded after use. No new branches — everything on
`main`, per the operator contract.

**Session 27 complete — all task-chain steps executed and pushed to
`main` (`e0b9cd8`, wrapper-verified, operator key destroyed).**

This cycle's theme was **stat-card weighting honesty + paint
budgets** (the S50 log's three suggested surfaces, extended to their
class):

**One defect fixed with mechanism-level evidence (RED→GREEN, TDD)**
- **The success-rate stat card's average-of-averages fallacy**: the
  unweighted mean over per-workflow rates displayed 92.0% where the
  workspace's truth was 60.0% (the extreme shape) — now the
  run-weighted share through the pure `weightedSuccessRate()` seam,
  honest on both server loaders AND the client fallback, with the
  field and label renamed to name their criterion — D108.
- **The paint-milestone budgets shipped** (the S50 suggestion): TTFB
  ≤ 500ms + FCP ≤ 1000ms per route + the authed-dashboard LCP ≤
  1000ms — the unpainted corners of the budget families — D109.
- **Two pin gaps closed**: the chart's client-refresh path (compose/
  delete → the chart updates without a reload) and the first-run
  story (the empty-workspace boundary render, gated for the first
  time).
- **A latent tooling bug found and fixed**: the capture script's
  `finally`-block `process.exit(0)` had been swallowing the
  section-14 failure — the S26 run refreshed only 17 of 20 shots
  while exiting 0 (the completion log line is the check, never the
  exit code alone).

Gate rose 511 → **529**; the drift battery re-verified GREEN ×8; VLM
×5 PASS on the first run.

**Suggested next (Session 28 candidates):** the chart's `topRuns`
tie-break contract under live mutation (two rows with equal runs —
does the tie-break survive a pause/resume refresh cycle), the stat
cards' `hours` rounding boundary (a workspace whose true hours sum
sits exactly on x.5 — `Math.round` half-up vs banker's drift), or
the budget families' last unpinned member (the CLS /
layout-stability milestone).
