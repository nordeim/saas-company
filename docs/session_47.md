# Session 47 — the transcript log of the Session 25 remediation cycle

Let me start by refreshing the workspace and confirming where the previous
cycle left off.

`git pull` fast-forwarded `0c19f6c..e302042` on main — one commit, the
prior cycle's closing "update session log" (session_46.md, the Session-24
transcript; the fix commit `0c19f6c` itself was already local). Session 24
is COMPLETE and wrapper-verified pushed. This cycle is **Session 25**.
All project docs re-read (AGENTS.md — 38 gotchas, the 486 gate, main-only
discipline; CLAUDE.md; README; the PAD's revision block + §7 + the
D101–D103 ledger; the SKILL at v2.23.0), the session docs (session_45/46
+ remediation-plan-24 fully ticked + the worklog tail), the skills
catalog consulted; `skills/` excluded from toolchains (re-verified).

Environment verified intact (node_modules, `db/custom.db` at the canonical
57344 bytes — 6 rows / 7120 runs / 5 active; `.env` with
`DATABASE_URL="file:../db/custom.db"`). The exported-DATABASE_URL trap
LIVE as always (the shell exports the absolute parent path) — neutralized
per-command (`env -u DATABASE_URL`) throughout. **A NEW sandbox behavior
discovered and adapted to**: detached servers (`setsid nohup`) are now
REAPED between tool calls (they outlived sessions in S24's sandbox —
gotcha 35's problem inverted); the adaptation is boot-and-probe in a
SINGLE call, server killed at the end of the block.

**BASELINE GATE: 486 checks ALL GREEN** (164 unit + 118 smoke + 204 e2e
— no flake; lint + typecheck + build clean).

The standing drift battery (recreated from the persisted S24 script,
explicit `--base` on a fresh :3180 boot, Chromium-rendered both sides):
**GREEN** — word parity 1.0000 ×8 (the 8th route being the 404; `/demo`
the clone's superset route, excluded by design; reference UNCHANGED),
mobile-nav byte-identical with a REAL tap (7 rows × 44px — no Tailwind
v4 bug; the live's burger remains pointer-blocked, D32), live LOGIN
re-verified — D62 holds. The SEO surface re-verified (sitemap 200
`application/xml` ×8; robots superset; og-image 1200×630; manifest
valid); the performance layer re-measured (landing LCP 388ms / 860 DOM;
login LCP 192ms; dashboard LCP 100ms — the S21/S22 ceilings holding);
dependency currency re-adjudicated (majors only — the documented F10
chain policy).

**The Session-25 audit surface — the S46 log's two suggested surfaces,
extended to their class** (probed on the probe-only server :3190,
`db/probe-s25.db`, gotcha-30, a 12-row workspace seeded directly into
the probe DB — the seeded 6-row workspace hides every ceiling above 6):

- **F1 — the chart truncation lie.** The runs chart renders
  `workflows.slice(0, 8)`: with 12 rows probed, 8 bars, NO note, heading
  "Runs by workflow". The workflow LIST received its honest truncation
  note in Session 21 R1 precisely because "a ceiling that lies is worse
  than no ceiling" — the chart's own ceiling never got the honesty.
- **F2 — the 4%-floor clamp (adjudicated NON-finding).** runs 3 and 60
  render IDENTICAL 4% bars against a 6,000 max — a 20x difference
  visually erased — but the exact values render in the adjacent label
  row: the adjacent exact value is the honest contract, the floor a
  visibility minimum.
- **F3 — the chart's missing list semantics.** The rows were div soup
  (no list role announced to screen readers). An axe-core scan of the
  logged-in dashboard: ZERO violations (the S10 fixes hold) — but the
  structure itself was unannounced.
- **The performance budgets unpinned (the S46 hook — a tooling gap).**
  The S21/S22 ceilings were measured ad hoc; nothing in the gate pinned
  them.

Remediation plan session25 written + validated against the codebase
(pin-conflict scans: no spec references the chart section; the only 429
pins are route-fulfilled — immune to the config-level limiter pin;
suite-order scan: session25-chart sorts after session24-temporal,
asserts against whatever rows survive, mints and cleans up its own
surplus through the authenticated create API via in-page fetch).

**TDD-first — RED:** the chart spec failed 3/3 on the pre-fix build
(`li` count 0 — the rows were divs; the note never rendered; the list
role absent); the four budget pins passed by design (preventive — their
RED is a future regression).

**GREEN:** R1 `CHART_ROWS` + the S21-pattern note ("Showing the 8 most
recent of {total} workflows." with the TRUE server-side total). R2 the
semantic `ul`/`li`. R3 `tests/e2e/performance-budget.spec.ts` (landing
DOM ≤ 1200 / landing LCP ≤ 1500ms / login LCP ≤ 800ms / authed
dashboard DOM ≤ 500 — 2–4x margins, LCP polled to settled) + the
`WORKFLOW_RATE_LIMIT_MAX=50` webServer insurance pin.

**Caught mid-execution BY the probe (the pins doing their job):** the
note's first draft used `text-white/40` — the post-fix axe scan flagged
it at 3.5:1 on the dark card (below the 4.5:1 floor) — and the SAME
latent violation lived in the LIST's Session-21 note (never rendered in
any scan because it needs a >100-row workspace). Both notes now
`text-white/50` (5.3:1 — the S10/D59 axe lesson re-applied). This is
the Session-25 gotcha-39 lesson: an axe scan only catches what RENDERS
— probe the surface with data that makes every conditional render.

**FULL GATE: 493 checks GREEN** (164 unit + 118 smoke + 211 e2e —
re-run after the contrast fix; the build's instrumentation warning is
the documented gotcha-32 channel). Re-verification: the chart probe
GREEN (12 rows → 8 bars + the note; UL semantics; axe zero); the drift
battery re-run GREEN ×8 (zero regressions from the client change).

**Screenshots:** the standard 20-shot set refreshed (a fresh :3170
boot with AUTH_RATE_LIMIT_MAX=50; the error-boundary mock covers the
[id] routes — the S23 discipline; the dev DB logical state verified
CANONICAL before AND after: rows=6, runs=7120, active=5). VLM
spot-checks ×5 — after adjudicating the NINTH and TENTH check-prompt
drifts (an invented "Watch demo" secondary CTA + an omitted beta badge
on the landing prompt — the pinned contracts are the beta badge + Book
a Demo + the hero video; and an invented "Sign in" heading + "NovaAI
logo" on the login prompt — the pinned contract is "Welcome to SAAS
Company" with the reference's own 'S' chip, verified parity since
Session 2) → **5/5 PASS** with the corrected contracts. The drift
meta-lesson: write the check prompt FROM the spec's pinned assertions,
never from memory of what the page "should" look like.

Documentation: PAD (revision block, ledger D104–D105, §7 counts 164/
118/211 = 493, §11 key files incl. the dashboard-app chart layer + the
two new spec rows), AGENTS (gotcha 39 + counts + the invariant line),
CLAUDE (session-25 context + stack-table/checklist counts), README
(493 badge + the chart-honesty layer in the dashboard row + every
stale count), SKILL v2.24.0 (lessons 58–59), .env.example verified in
sync (no new env vars — the limiter pin is a playwright-config
override), remediation plan session25 (ticked), session log
`docs/session_47.md`, the repo worklog.

**FINAL GATE re-check on the complete tree, then commit on main + the
SSH wrapper push.**
