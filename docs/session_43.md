# Session 43 — the transcript log of the Session 23 remediation cycle

Let me start by refreshing the workspace and confirming where the previous
cycle left off.

`git pull` fast-forwarded `d58e188..6ccf116` — the only delta was
`docs/session_42.md` (the prior transcript). Session 22 is COMPLETE and
pushed (wrapper-verified); this cycle is **Session 23**. Now reading the
project docs (AGENTS.md — 36 gotchas, the 470 gate, main-only discipline;
CLAUDE.md; README; the PAD's revision block + §7 + D97–D98 ledger; the
SKILL at v2.21.0), the session docs (session_41/42 + remediation-plan-22
fully ticked + the worklog tail):

Session-42's suggested next surface: **the dashboard's optimistic-UI
semantics**. Environment verified intact (node_modules, db/custom.db,
.env with `DATABASE_URL="file:../db/custom.db"`). No zombies on the gate
ports.

**BASELINE GATE: 470 checks ALL GREEN** (156 unit + 117 smoke + 197 e2e —
no flake; lint + typecheck + build clean).

Now the standing drift battery (recreated from the S22 script with an
explicit `--base` on a fresh :3150 boot, gotcha-33/35): **GREEN** — word
parity 1.0000 ×8 (reference UNCHANGED), mobile-nav byte-identical with a
REAL tap (7 rows × 44px — no Tailwind v4 bug; the live's burger remains
pointer-blocked, D32), live LOGIN re-verified — D62 holds. The SEO
surface re-verified (sitemap 200 `application/xml` ×8 routes; robots the
superset semantics; og-image a real 1200×630 PNG); dependency currency
re-adjudicated (the documented F10 chain only; majors only).

**The Session-23 audit surface — the CLIENT side of the mutation
contract.** Reading `dashboard-app.tsx`: every mutation is server-first +
`refresh()`, but the CATCH treats every `!res.ok` alike. Two candidates:

**F1 — the honest-404 dispatch is missing.** S22 made the raced
PATCH/DELETE answer the honest 404 — but the client banner says "Try
again." (a LIE: every retry 404s forever) and the ghost row stays
mounted. The S13 401-sentinel's exact class, never extended to 404.

**F2 — refresh() has no in-flight ordering guard.** Two concurrent
actions on different rows (busyId only guards one row) fire two GETs; a
delayed stale snapshot landing last overwrites the truth.

RED probe on the probe-only server (:3160, `db/probe-s23.db`,
gotcha-30): **F1 confirmed** — two browser contexts, tab B deletes a
row through the UI, tab A pauses the deleted row: the banner rendered
"Could not update that workflow. Try again." AND the row was still
mounted. **F2 confirmed deterministically** — route-delay the first
post-mutation GET 1200ms (its snapshot is pre-delete), let the second
through: the list first showed the truth (B gone), then the stale
response landed and **B resurrected**.

Remediation plan session23 written + validated against the codebase (the
S13/S22 pins re-read — no conflicts: abort faults reject at fetch, the
401 redirect pins assert the landed login card, the error-boundary mocks
fulfill bare arrays through the optional-meta fallback).

**TDD-first — RED:** the new e2e spec (initially
dashboard-honesty.spec.ts) failed 3/3 on the pre-fix build. **GREEN:**
R1 the client failure-class dispatch (PATCH-404 → drop the row locally +
re-sync + the polite role=status announce "… is no longer in the
workspace."; DELETE-404 → the idempotent-success "… was already
removed."; the SessionExpired early-return in all three catches) + R2
the refresh() useRef sequence guard (a response superseded by a newer
refresh is dropped before any setState).

**TWO mid-execution pin bugs caught BY the pins** (the S22 family
recurring): (1) Next.js's route announcer is ITSELF a role=alert element
carrying the page title ("Dashboard | SAAS Company") — an unfiltered
alert-count pin can never pass; filtered by text (the session-lifecycle
pin (d) pattern). (2) Suite-order coupling: the spec initially sorted
BEFORE dashboard.spec.ts and shared a victim row between tests (a)/(b) —
renamed to session23-honesty.spec.ts (sorts after dashboard.spec.ts,
whose tests self-clean back to the 6-row seed but leave Lead PAUSED —
hence status-tolerant /^(Pause|Resume)/ selectors), and (b) now uses its
own victim row. 3/3 GREEN; the FULL e2e suite: **200/200**.

**FULL GATE: 473 checks GREEN** (156 unit + 117 smoke + 200 e2e — unit
and smoke re-run twice). The client-honesty probe re-run on the
remediated build: no retry lie, no ghost, no resurrection. The drift
battery re-run: GREEN ×8 (zero regressions from the client change).

**The screenshot phase found its own defect** (survey tooling, the
gotcha-30 family): after the 20-shot capture the dev DB showed
`active: 3` — the error-boundary shot's route mock used the glob
`**/api/workflows`, which does NOT match `/api/workflows/[id]` — the
mock's own Pause-click ESCAPED to the real server and paused a dev-DB
row (and the timestamps proved the S22 sessions had closed with the same
drift: the seed checksum covers rows/names, not STATUSES). The mock now
covers the [id] routes; the dev DB re-seeded to canonical (e7f6c011);
the 20-shot refresh re-run left it canonical (before/after verified).
VLM spot-checks ×5 — after adjudicating the SIXTH check-prompt drift (a
"missing 3 workflow cards" verdict on the dashboard shot, disproven by
the 900px viewport cut — the cards extend below the fold by design;
prompt corrected to state the viewport) → **5/5 PASS**.

Documentation: PAD (revision block, ledger D99–D100, §7 counts 473,
§11 key files incl. the dashboard-app client-dispatch row + the new spec
row + the stale 103 smoke count fixed to 117), AGENTS (gotcha 37 +
counts + the invariant line naming the client dispatch), CLAUDE
(session-23 context + the stack-table/checklist counts), README (473
badge + the client-honesty row + every stale count), SKILL v2.22.0
(lessons 54–55), remediation plan session23 (ticked), session log
`docs/session_43.md`, the repo worklog.

**FINAL GATE re-check on the complete tree, then commit on main + the
SSH wrapper push.**
