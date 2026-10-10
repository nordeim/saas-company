# Session 58 — the formal log of the Session 29 remediation cycle

**The mission** (the task chain's 15 steps): refresh the workspace
(`git pull` — the local main had diverged by one skills-directory commit
over the remote's `0d94be6 update session log`, rebased cleanly),
review the five core docs + the four session docs (session_56 the S28
transcript, remediation-plan-28 fully ticked, the worklog tail,
session_57 the S28 re-log carrying the S29 candidates), audit with the
repo skills, iterate toward parity, remediate TDD-first, screenshot,
align the docs, and push through the SSH wrapper.

**The baseline** on the pulled tree: **541 checks ALL GREEN** (182 unit
+ 124 smoke + 235 e2e — no flake; lint + typecheck + build clean), the
canonical DB verified (6 rows / 5 active / 7,120 runs), the
exported-shell `DATABASE_URL` trap live again — neutralized per command
all session.

**The standing drift battery** (word parity ×8, the mobile-nav paired
probe, the SEO surface): GREEN — parity **1.0000 on all 8 routes** (the
reference UNCHANGED), the clone's burger opens with a REAL tap into the
byte-identical panel (7 rows × 44px — **no Tailwind v4 bug**; the live's
burger remains pointer-blocked, D32; the live LOGIN re-verified — D62
holds), the SEO surface clean (sitemap 200 `application/xml`, robots,
the og-image 1200×630, a valid manifest).

**The Session-29 audit** (the S55/S56 candidates — the empty-to-FIRST
transition, the all-zero-runs chart floor, the JSON-LD superset):
probed on the probe-only server (:3251, `db/probe-s29.db`, gotcha-30,
one purpose-built user walked live through 0 rows → 1 row / 0 runs → 3
rows all-zero → 9 rows with one 500-run champion) — **9/9 verdicts
PASS** on the standing behavior. The findings: **F1** zero
`application/ld+json` on all 8 public routes (the reference ships none
either — a pure SUPERSET gap, the SEO layer a production-ready clone
adds beyond the reference); **F2** two pin gaps around probed-CORRECT
boundary behavior (the 1-row/0-run transition state; the all-zero
chart's uniform floor rendering — session26(c)'s "top bar spans the
full track" invariant was pinned only against nonzero data);
**F3** the `maxRuns` comment over-claims its invariant (docs-truth).
Adjudicated non-findings (documented in the plan): the 100.0% rate at
N-rows/0-runs (the documented S21 null→100 convention — vacuously true;
the adjacent "Total runs 0" card carries the zero-truth; the convention
expires seamlessly into the measured story at the first run, probed);
the uniform 4% floor bars at all-zero (equality is the honest encoding
— full-width bars would falsely suggest maximal activity).

**The remediation plan** (`docs/remediation-plan-session29.md`) was
written and validated against the codebase first (pin-conflict scans:
`application/ld+json` in no spec or script; the builder symbols
nowhere; no e2e spec imports from src/ today; no smoke pin greps
landing word content; the transfer-budget filter matches neither an
inline script's characteristics; CLS is box-less). TDD: **RED
observed** on the pre-fix build (the unit import fails structurally —
the builders do not exist; the e2e finds no script).

**R1 — the JSON-LD structured-data superset (D113):** the pure
builders in `src/lib/seo.ts` — `siteUrl()` (the canonical-origin
helper) + `landingStructuredData()` (a schema.org @graph of
Organization + WebSite + SoftwareApplication linked through stable @id
anchors, the offers DERIVED from `PLANS`: Free $0, Pro $49,
Enterprise's null "Custom" price honestly OMITTED — an Offer without a
price is invalid schema and an invented 0 would be a lie) +
`faqStructuredData()` (the FAQPage from FAQ_ITEMS, VERBATIM) — render
through the 6-line `src/components/site/json-ld.tsx` on the landing and
/faq only (the minimal-mount design). +8 unit pins (the graph shapes,
the @id linking, the PLANS-derivation, the FAQ verbatim derivation,
the JSON round-trips, the siteUrl fallback) + 2 e2e pins
(`session29-jsonld.spec.ts` — the FIRST e2e spec importing from src/:
the pinned expectations derive from the SAME FAQ_ITEMS/PLANS the
schema renders from, so a pricing or FAQ edit that skips the schema
FLIPS the pin instead of drifting silently).

**R2 — the first-run boundary pins (D114):**
`session29-first-run.spec.ts` (the dedicated-user pattern): (a) the
empty-to-FIRST transition through the REAL UI compose — cards become
1/0/0/100.0%, "No data yet." expires exactly when data arrives, the
list gains the article, no reload; (b) the ALL-ZERO chart — three
uniform 4% floor bars with honest "0" labels (the top bar NOT
full-track — the adjudicated degenerate case); (c) the first-run expiry
— a Prisma-minted 500-run row lands, the top bar becomes the full
track, and the rate stays 100.0% now MEASURED.

**R3 — the maxRuns comment caveat** (docs-truth, no behavior change).

**The mid-authoring tooling lesson (gotcha 43 / SKILL lesson 66):**
the first-run spec's first authoring had ONE `await` bug in test (a)
(`expect(statValue(...))` receiving a Promise) — and Playwright
RESTARTS the worker after a failed test: the spec module reloaded, the
module-level `Date.now()` EMAIL regenerated, `beforeAll` re-registered
a NEW user — test (b) then ran against an empty workspace (chart 2≠3)
and test (c) read ZERO rows for "the" user. The secondary failures
pointed at the WRONG layer ("the wire says 2 rows, the file says 0" was
the tell that the STATE had split). Fixed with the await bug +
`test.describe.serial` for state-sharing groups (fail-fast — applied to
session28-tie-break retroactively) + the discipline: always diagnose
the FIRST failure; the cascade after a worker restart is noise.

**Verification:** the full gate rose **541 → 554 checks ALL GREEN**
(190 unit + 124 smoke + 240 e2e — the plan's ~554 prediction exact).
The drift battery re-run GREEN ×8 (the JSON-LD script never renders
into `document.body.innerText` — the immunity was proven BEFORE
authoring and re-verified after the mount). The JSON-LD live validity
probe 8/8 (the landing graph validates with the linked @ids and offers
[0,49]; the FAQ page carries 6 verbatim entities; absent on the six
other routes — the minimal-mount design). 20 screenshots genuinely
refreshed (the DB canonical before AND after — 6 rows / 5 active /
7,120 runs). The VLM spot-checks ×5: **4/5** — the one FAIL (the H1
gradient "missing") re-adjudicated with PIXEL EVIDENCE: 4,404
gradient-family pixels present in the H1 zone — the drift-#11
single-frame sampling artifact (the 14s sweep caught mid-instant, the
S26 family), not a defect; the CSS is unchanged and pinned.

**Documentation:** PAD (the revision block, ledger D113–D114, §7
counts 190/124/240 = 554, §7.2 suite descriptions, §11 key-file rows),
AGENTS (gotcha 43 + the counts + the invariant line naming the
structured-data layer + the stale AUTH_RATE_LIMIT_MAX=50 gate-line
reference fixed to 100), CLAUDE (the session-29 context + the
stack-table/checklist counts), README (the 554 badge + the JSON-LD
row + the overview mention + the STALE verification-block counts
170/123/218 found and fixed to 190/124/240), SKILL v2.28.0 (lessons
66–67), `.env.example` verified in sync (no new env vars — the
builders read the existing NEXT_PUBLIC_SITE_URL), the remediation plan
ticked with the measured gate, this formal session log, and the
worklog.

**Session 29 complete — all 15 task-chain steps executed; the commit
and push follow.** This cycle's theme was **the SEO superset + the
first-run boundary**: the structured-data layer shipped content-as-code
(every JSON-LD fact derived from its ONE content source at render
time, the pins deriving from the same modules), the first-run stories
gated at exactly the shapes the seeded demo workspace can never
exercise (the seed's 7,120 nonzero runs hide every 0-run boundary),
and one worker-restart hazard caught, decoded, and encoded as both a
gotcha and a spec hardening.

**Suggested next (Session 30 candidates):** the JSON-LD surface's
natural extensions (a BreadcrumbList for the legal routes, an
Organization `sameAs`/contactPoint refinement — all deriving from
content sources per the S29 law); the dashboard's derive-your-own-data
stories under the `MAX_WORKFLOW_LIST` boundary shapes the S27/S29
probes have not walked (a 100-row workspace's chart note vs the
capped list's own note — the two ceilings' honesty side by side at
exactly 100/101 rows); or the standing battery's OWN hardening (the
word-parity probe's routes × the JSON-LD mount — a fifth surface
column for the drift battery so future mounts are auto-covered).
