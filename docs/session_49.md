# Session 49 — the transcript log of the Session 26 remediation cycle

This cycle continued from a context reset mid-session: the GREEN
implementation, the full gate, the champion probe, the drift battery,
and the 20-shot screenshot capture were already complete in the working
tree; the run resumed at the VLM spot-check adjudication and carried
the documentation, worklog, and push to completion.

`git pull` on the fresh clone confirmed `e9fcfd1` on main — Session 25
complete and wrapper-verified pushed (the fix commit `eb995c5`, gate
493; the closing "update session log" commit carrying session_48.md).
This cycle is **Session 26**. All project docs re-read (AGENTS.md — 39
gotchas at inheritance, the 493 gate, main-only discipline; CLAUDE.md;
README; the PAD's revision block + §7 + the D101–D105 ledger; the SKILL
at v2.24.0), the session docs (session_47 + remediation-plan-25 fully
ticked + the worklog tail + session_48 — the Session-25 transcript
whose closing summary suggested this cycle's three surfaces), the
skills catalog consulted; `skills/` excluded from toolchains
(re-verified).

Environment rebuilt after the reset (npm install 340 packages, a fresh
`AUTH_SECRET`, the canonical DB rebuilt at 57344 bytes — 6 rows / 7120
runs / 5 active, `.env` with `DATABASE_URL="file:../db/custom.db"`).
The exported-DATABASE_URL trap LIVE as always — neutralized
per-command throughout (and rediscovered the hard way once more when a
verification script preferred `process.env` over the .env file: the
trap made the condition skip the file value entirely — always prefer
the .env file value in tooling).

**BASELINE GATE: 493 checks ALL GREEN** (164 unit + 118 smoke + 211
e2e — no flake; lint + typecheck + build clean).

The standing drift battery (recreated with an explicit `--base` on a
fresh boot, Chromium-rendered both sides): **GREEN** — word parity
1.0000 ×8 (the 8th route being the 404; `/demo` the clone's superset
route, excluded by design; reference UNCHANGED), mobile-nav
byte-identical with a REAL tap (7 rows × 44px — no Tailwind v4 bug;
the live's burger remains pointer-blocked, D32), live LOGIN re-verified
— D62 holds. The SEO surface re-verified CLEAN (sitemap 200
`application/xml` ×8; robots the honest superset semantics; og-image a
real 1200×630 PNG; manifest valid).

**The Session-26 audit surface — the S48 log's three suggested
surfaces, extended to their class** (probed on the probe-only server,
`db/probe-s26.db`, gotcha-30, a 12-row workspace whose OLDEST row
carries the HIGHEST runs — the shape that interrogates the chart's
selection criterion):

- **F1 — the chart's selection-criterion defect.** The runs chart
  under "Runs by workflow" charted `workflows.slice(0, 8)` — the 8
  most RECENT rows, mirroring the list — not the top 8 BY RUNS. The
  champion probe RED-confirmed it: a 12-row workspace whose oldest row
  carries 12,000 runs (13x the top displayed row) rendered the
  champion INVISIBLE with every bar a 4%–7.5% stub — the `maxRuns`
  denominator came from a row the chart never displayed, so the
  bar-length encoding carried no information exactly when a runs
  ranking is meaningful. The adjudication: the heading's promise
  governs (the S21/S25 honesty family — the LIST already owns the
  recency contract; the reference has no dashboard, D1/D62, so this
  is superset quality with no parity constraint).
- **F1b — the deeper lie found while designing the fix.** At >100
  workflows the client's `workflows` state is the CAPPED newest-100
  list — every old high-run row sits OUTSIDE the cap, so ANY
  client-side ranking ranks only the newest 100. The smoke suite's own
  111-row workspace (105 probe rows at runs:10 + the 6 seeded rows)
  would chart 8 probe rows while the seeded champion ("Anomaly scan on
  billing events", 3,422 runs, 31 days old) sits invisible: the
  newest-100 cap contains ZERO seeded rows. The honest fix must be
  server-side — the S21 stat-cards precedent extended to the ranking
  surface.
- **F2 — the keyboard-focus tab-order audit (adjudicated CLEAN).**
  Tab-order probes on `/` (34 interactive elements reached, every one
  focus-styled, no order anomalies), `/login` (6/6), and the authed
  dashboard (27/28 — the 28th the disabled Compose button, correctly
  skipped: disabled = not focusable). The one focusable `div` is the
  testimonial strip's `scrollable-region-focusable` — the documented
  D63 SHARED axe item (the live ships it identically; parity law). The
  features-tab trio and the pricing toggle use the legitimate
  `aria-pressed` toggle-button pattern.
- **F3 — the JS-transfer surface unpinned (a tooling gap).** The S25
  budgets covered DOM nodes and LCP; nothing pinned the SCRIPT BYTES.
  Measured via ResourceTiming (standalone, localhost): landing
  scripts 172KB/10 files (the 2,214KB total dominated by the 1,898KB
  hero video — the reference's own parity asset), login 152KB/9, the
  authed dashboard 177KB/11. A bundle bloat would pass all 493 checks
  while doubling the site's JS.

**Remediation plan session26 written and validated against the
codebase** (pin-conflict scans: no e2e spec references the chart's
ORDER — the landing "chart" pins target the LANDING mockup's Analytics
tab; `dashboard.spec`'s counters are order-agnostic; the ONLY note-text
assertions are session25-chart's three, updated as part of R1; the
error-boundary mocks intercept with bare arrays — the meta-optional
fallback preserves them; the api-meta unit pins construct their own
meta payloads; no existing spec reads ResourceTiming transferSize;
suite-order scan: session26-chart-rank sorts after session25-chart,
single worker, shared e2e.db), then executed TDD-first.

**RED observed on the pre-fix build:** unit 6/6 fail (the
`rankByRuns` seam does not exist); e2e 3 failing with the exact
expected modes — (a) the first chart row is the most RECENT row, not
the top runner; (b) the champion crowded out by minted runs=0 rows;
(c) the top bar at 61.57% of the track instead of 100% (and the note
naming recency). The transfer pins are preventive and pass by design.

**GREEN implementation:**

- `src/lib/workflow.ts`: `CHART_ROWS = 8` (moved from the component —
  the server loaders AND the client import one constant, so the cap
  and its aggregate can never drift apart) + `rankByRuns(rows, limit)`
  — the pure client-side FALLBACK seam (runs DESC, ties broken
  createdAt DESC — newest first among equals, the list's own
  convention; non-mutating; 6 unit pins in
  `src/lib/workflow-rank.test.ts`).
- `src/app/api/workflows/route.ts` (GET): the topRuns query joins the
  existing `Promise.all` — top `CHART_ROWS` by runs across the FULL
  workspace (ties newest-first), minimal row payload (id, name, runs)
  — and the envelope's meta gains `topRuns` (strictly additive,
  exactly like `stats` in S21).
- `src/app/dashboard/page.tsx`: the same query joins the page's
  `Promise.all` → the `initialTopRuns` prop (TRUE at any volume from
  the first paint).
- `src/components/dashboard/dashboard-app.tsx`: the `topRuns` state
  (initialized from the prop; `refresh()` consumes `meta.topRuns` when
  present, shape-checked like `stats` — strictly optional so the
  error-boundary mocks keep working); the chart renders
  `topRuns ?? rankByRuns(workflows, CHART_ROWS)`; `maxRuns` becomes
  the CHARTED max (the top bar renders the full track — 100%); the
  truncation note names the criterion ("Showing the top 8 of {total}
  workflows by runs." — `text-white/50`, the S25 contrast law); the
  LIST keeps its own recency order and note — the two surfaces stay
  independent.
- `tests/e2e/session25-chart.spec.ts`: the note-wording pins updated
  to the criterion-naming contract.
- NEW `tests/e2e/session26-chart-rank.spec.ts` (4 pins): (a) the first
  chart row is the TOP RUNNER with non-increasing values; (b) the
  champion stays visible when newer runs=0 rows crowd the workspace
  (surplus minted through the authenticated create API, deleted in a
  finally); (c) the top bar spans the full track width AND the note
  names the criterion; (d) no note while the whole workspace fits.
- `tests/e2e/performance-budget.spec.ts`: +3 transfer-budget pins
  (landing/login/authed-dashboard scripts ≤ 400KB each — 2.3–2.6x the
  measured values, a settled ResourceTiming `transferSize` read).
- `scripts/smoke-test.sh`: +5 wire-level topRuns pins in the 111-row
  volumetric section (exactly 8 entries; the champion
  `topRuns[0].name`/`.runs` = 3422 — INVISIBLE to the newest-100 cap;
  the runner-up 2107; the probe-row tail 10).

**FULL GATE: 511 checks ALL GREEN** (170 unit + 123 smoke + 218 e2e —
no flake; lint + typecheck + build clean). The champion probe re-run
on the remediated build: **perfect GREEN** — the champion first at
100% width, bars descending meaningfully (100 → 75 → 50 → 25 → 7.5%),
the note naming the criterion, the list keeping its own recency order.
The drift battery re-run: **GREEN** — zero regressions from the client
change (word parity 1.0000 ×8; mobile nav byte-identical; D62 holds).

**Screenshots:** the standing 20-shot set refreshed (the chart's row
order changes on every dashboard shot — runs-descending instead of
newest-first; a fresh boot with `AUTH_RATE_LIMIT_MAX=50`, the
error-boundary mock covering the `[id]` routes; the dev DB logical
state verified CANONICAL before AND after: rows=6, runs=7120,
active=5). **VLM spot-checks ×5 — 5/5 PASS** after adjudicating the
ELEVENTH and TWELFTH check-prompt drifts:

- **Drift #11 — the animated-gradient single-frame artifact.** Check 1
  claimed a "missing gradient heading." The pixel probe found only 2
  faint violet pixels in the shot; the CSS tells the story:
  `background-size: 400%` with a 14s `organic-gradient` animation
  means the violet band (20% of the 400% background) is off-text
  ~86% of the cycle — the screenshot caught a white-instant. A
  time-sampled probe (positions sampled over 3.2s) proved the
  animation RUNNING with 8 distinct positions. The gotcha-15/24
  single-frame family: never adjudicate an animated surface from one
  frame. Encoded into the check prompt as a tolerance note.
- **Drift #12 — the invented hero mockup.** After re-encoding the
  gradient tolerance, check 1 claimed a "missing hero video area (the
  dashboard mockup with browser chrome)." The geometry probe +
  hero.tsx structure disproved it: the hero's video is the full-bleed
  looping BACKGROUND (`section video` fills the 0–900px viewport; the
  spec pins it by DOM src attribute, not viewport position), the
  "scroll indicator" the VLM saw at the bottom is the hero's own
  by-design element, and the dashboard mockup with browser chrome is
  a SEPARATE section below the fold. The check prompt had invented the
  element — the S25 meta-lesson re-applied: write the check prompt
  FROM the spec's pinned assertions, never from memory.
- Check 5's malformed-HTML verdict fixed with a strict VERDICT FORMAT
  contract (the response must begin with the single word PASS or FAIL;
  no markup).

`.env.example` verified in sync (all 7 keys at identical line
positions; no new env vars — `CHART_ROWS` is a code constant).

**DOCUMENTED:** PAD (revision block, ledger D106–D107, §7 counts
170/123/218 = 511, §11 key files incl. the workflow-rank test + the
two new spec rows), AGENTS (gotcha 40 + counts 511 + the invariant
line naming the ranking layer + the transfer budgets), CLAUDE
(session-26 context + stack-table/checklist counts), README (511
badge + the chart-ranking layer in the dashboard row + every stale
count), SKILL v2.25.0 (lessons 60–61), remediation plan session26
(ticked, the measured gate recorded), this session log, the worklog.

**Committed to main and pushed via the SSH wrapper**
(`docs/ssh_git_wrapper_v3.py` with an externally supplied key — the
runbook in `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`; the
fingerprint verified against the S1–S25 record; wrapper-verified
push; the operator key destroyed after use). No new branches — all
commits on `main`, per the operator contract.
