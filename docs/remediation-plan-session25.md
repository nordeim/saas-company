# Remediation Plan — Session 25 (2026-10-09)

**Scope:** Fix the issues found by the Session 25 audit of this repository
(the S46 log's two suggested surfaces — the performance-budget hook and an
a11y deep-dive on the runs chart — surveyed first, then extended to the
class they belong to), executed TDD-first, gated by the full quality gate
(§7.3 of the PAD), and re-verified by the standing paired survey.

**Audit method:** the standing drift battery first (word parity **1.0000 on
all 8 routes** — the 8th being the 404 route; `/demo` is the clone's
superset route, excluded from the parity set by design; both sides rendered
in Chromium — the reference is UNCHANGED since Session 24; the mobile-nav
paired real-touch probe: the clone's burger opens with a REAL tap into the
byte-identical panel — seven rows, every row exactly 44px — **no Tailwind
v4 bug**; the live's burger remains pointer-blocked, D32; the live LOGIN
re-verified — D62 holds). The SEO surface re-verified CLEAN (sitemap 200
`application/xml` ×8 routes; robots the honest superset semantics;
og-image a real 1200×630 PNG; `manifest.json` valid). The performance
layer re-measured (landing LCP 388ms / 860 DOM nodes; login LCP 192ms;
dashboard LCP 100ms — the S21/S22 ceilings holding). The dependency
currency re-adjudicated (majors only: prisma 7, eslint 10, typescript 7,
lucide-react 1 — the documented F10 chain policy; unchanged). Then the
Session-25 NEW audit surface — the runs chart (probed on the probe-only
server :3190, `db/probe-s25.db`, gotcha-30 discipline, a 12-row workspace
seeded directly into the probe DB):

1. **The chart truncation lie (F1):** the runs chart renders
   `workflows.slice(0, 8)` — with 12 workflows probed, the chart showed 8
   bars with NO note, while the section heading reads "Runs by workflow"
   (implying the workspace). The workflow LIST received its honest
   truncation note in Session 21 R1 ("Showing the N most recent of M
   workflows.") precisely because "a ceiling that lies is worse than no
   ceiling" — but the chart's own ceiling never got the same honesty.
   RED-confirmed: `chartRows: 8, hasTruncationNote: false` with 12 rows in
   the workspace (the probe record below). This is the S21 family found
   in the chart.

2. **The 4%-floor clamp (F2) — adjudicated a NON-finding:** two rows with
   runs 3 and 60 (against a max of 6,000) render IDENTICAL 4% bars — a
   20x difference visually erased. Adjudication: the exact values are
   rendered in the adjacent label row ("3" and "60" — the bar's text
   contract), the floor is a visibility minimum (a 0.05% bar is
   sub-pixel), and every floor clamps by construction. The adjacent
   exact value is the honest contract (the S24 refresh-rejection
   precedent: "safe by construction" — imprecise but never lying, because
   the truth is rendered next to the imprecision). No fix; documented
   here so a future session does not re-litigate it blind.

3. **The chart's missing list semantics (F3):** the chart's rows are
   `div` soup — the container carries no list role and the children no
   listitem semantics, so a screen reader in browse mode reads the texts
   but never announces "list, 8 items" (the structure is invisible to
   assistive tech). The S46 a11y deep-dive surface: the chart's data IS
   available as text (name + exact value per row — no aria-hidden data),
   and an axe-core scan of the logged-in dashboard returns **ZERO
   violations** (the Session-10 fixes hold) — but the structure itself is
   unannounced. Fix: a semantic `ul`/`li` (Tailwind preflight resets list
   styling — visually identical).

4. **The performance budgets unpinned (the S46-suggested hook — a
   tooling gap, not a defect):** the S21/S22 performance surveys measured
   LCP/TTFB/DOM-node ceilings ad hoc (landing LCP 732ms → 388ms across
   sessions; 860 DOM nodes; dashboard 314 nodes) — but nothing in the
   gate PINS them, so a future change (a 5,000-node DOM, a blocking
   import, a hero-video regression) would pass all 486 checks while
   halving the site's speed. The budget hook ships as an e2e spec with
   deliberately generous ceilings (~2-4x the measured values — the
   budget's job is to catch GROSS regressions, not to chase
   milliseconds; the de-flake discipline of §7.4 applies).

## The fixes (TDD-first)

### R1 — the chart's honest truncation note (F1)

`src/components/dashboard/dashboard-app.tsx`, the runs-chart section:
when the chart caps at 8 while the workspace holds more, render the S21
pattern note — `Showing the 8 most recent of {total} workflows.` — where
`total` is the TRUE server-side count (the S21 R1 state, not the capped
list length). No note when the whole workspace fits (≤ 8). The chart
keeps showing the 8 most recent rows (mirroring the visible list's
newest-first order — what the user sees in the list is what the chart
charts).

### R2 — the chart's semantic list (F3)

The chart's row container becomes a `ul` (class unchanged — preflight
resets list styling) and each row an `li`. A screen reader now announces
the list and its length. Pinned by role (`list` / `listitem`).

### R3 — the performance-budget e2e spec (the S46 hook)

`tests/e2e/performance-budget.spec.ts` — four pins measured against the
e2e server (the same standalone production build the whole suite boots):
- landing DOM nodes ≤ **1200** (measured 860)
- landing LCP ≤ **1500ms** (measured 388ms) — a PerformanceObserver with
  `buffered: true`, polled to settled
- login LCP ≤ **800ms** (measured 192ms)
- the logged-in dashboard DOM nodes ≤ **500** (measured ~314)

Plus the insurance pin: the Playwright webServer env gains
`WORKFLOW_RATE_LIMIT_MAX: "50"` (the AUTH/GENERATE pattern — the new
chart spec mints 6 rows through the create API, and a reused server
across repeated local runs must not climb toward the default 30 budget;
the existing 429 pins are route-fulfilled and never reach the server, so
no pin conflicts).

### Validation before execution (performed against the codebase)

- **Pin-conflict scan (R1/R2):** no e2e spec references the chart section
  (`grep "Runs by workflow" tests/e2e/` → zero hits); no spec counts
  `div.space-y-4` or asserts list roles on the dashboard app (the
  mockup-motion "dashboard a11y" pins target the LANDING PREVIEW, not the
  app); the dashboard.spec `article` counters are untouched by the
  ul/li swap.
- **Pin-conflict scan (R3):** the only 429 pins in the e2e layer are
  route-fulfilled (dashboard.spec's composer 429-degrade row) — immune to
  the config-level limiter ceiling; no existing spec installs a
  PerformanceObserver.
- **Suite-order scan:** `session25-chart.spec.ts` sorts AFTER
  `session24-temporal.spec.ts` (single worker, shared e2e.db,
  alphabetical) — at that point the DB carries the session23-honesty
  deletions (~3 surviving rows + possibly composed-and-cleaned rows), so
  the ≤8 test asserts against whatever survives (no hardcoded 6), and
  the >8 test CREATES its own surplus (6 rows via the authenticated
  create API through in-page fetch — the gotcha-30 discipline:
  `page.request` refuses Secure cookies over plain http) and DELETES
  them afterwards (the composer-cleanup pattern).
- **RED expectation:** the note pin and the list-semantics pin fail on
  the pre-fix build (the note does not exist; the rows are divs). The
  performance-budget pins are PREVENTIVE tooling — they pass on the
  current build by design (their RED is a future regression).

## Post-execution verification

1. Full gate: lint → typecheck → unit → build → smoke → e2e — the count
   rises 486 → **493** (+7 e2e: 3 chart pins + 4 budget pins; unit and
   smoke unchanged).
2. The chart probe re-run on the remediated build (probe-only DB): the
   12-row workspace renders 8 bars + the honest note; the rows carry
   list semantics; axe still zero violations.
3. The drift battery re-run (client code was touched): word parity
   1.0000 ×8, mobile-nav byte-identical, D62 holds.

## ToDo

- [x] R1 the chart's honest truncation note (`total > 8` → the S21
      pattern note with the TRUE total)
- [x] R2 the chart's semantic list (ul/li, visually identical)
- [x] R3 `tests/e2e/performance-budget.spec.ts` (4 budget pins) + the
      `WORKFLOW_RATE_LIMIT_MAX=50` webServer insurance pin
- [x] RED observed on the pre-fix build — the note + semantics pins fail
- [x] Full gate green — 486 → 493 (164 unit + 118 smoke + 211 e2e)
- [x] The chart probe re-run GREEN (note + semantics + axe clean)
- [x] Drift battery re-run GREEN — word parity 1.0000 ×8, mobile-nav
      byte-identical, D62 holds
- [x] Screenshots (20) + VLM spot-checks (5) PASS
- [x] PAD ledger D104–D105 + §7 counts + §11 key files
- [x] AGENTS gotcha 39 + counts + the invariant line
- [x] CLAUDE session-25 context
- [x] README badge/counts + the chart-honesty row
- [x] SKILL v2.24.0 lessons 58–59
- [x] .env.example verified in sync (no new env vars)
- [x] remediation plan ticked + session log `docs/session_47.md`
- [x] worklog.md updated
- [x] commit on main + SSH wrapper push (wrapper-verified — the hash
      recorded below post-push)
