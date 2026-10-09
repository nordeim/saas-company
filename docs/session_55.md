# Session 55 — the formal Session 28 remediation log

The workspace had been reset (the environment rebuild: fresh `npm
install`, the canonical DB re-seeded — checksum `e7f6c011`, the
S1–S27 record — and a fresh `AUTH_SECRET`); the git sync fast-forwarded
the tree to `3ca82c1` (Session 27's closing log `docs/session_54.md` +
the user's session-log update). This run is **Session 28**; the S53
log's three suggested surfaces were the audit's charter.

**The baseline** (rebuilt environment): the full gate inherited **529
checks ALL GREEN** (176 unit + 124 smoke + 229 e2e, no flake; lint +
typecheck + build clean). The standing drift battery — REBUILT after
the reset (the sandbox scripts were wiped; the word-parity paired
survey, the mobile-nav real-touch probe, and the SEO surface, rebuilt
with two probe-side lessons re-learned: the live's burger is
`button.md:hidden`, unnamed per D63, and fixed-positioned panels have
NULL `offsetParent` — filter by computed style) — returned **GREEN**:
word parity **1.0000 on all 8 routes** (the reference UNCHANGED), the
mobile-nav panel **byte-identical** with a REAL tap (seven rows, every
row exactly 44px — no Tailwind v4 bug; the live's burger remains
pointer-blocked, D32), and the SEO surface clean (sitemap 200
`application/xml`, robots, the og-image 1200×630 PNG, a valid
manifest).

**The audit** (probe-only server :3241, `db/probe-s28.db`, gotcha-30 —
two purpose-built users: the 9-row tie-break workspace and the x.5
hours-boundary workspace) returned **9/9 verdicts PASS**, and the
follow-up seam-level float survey isolated the one defect:

- **F1 — the client-fallback hours seam's order-dependent float drift
  (RED-confirmed at the seam level):** the "Hours saved" card's SERVER
  loaders (SQLite's SUM — extended-precision, grid-exact at every
  probed shape) and the CLIENT's `listStats` fallback (a naive JS
  float reduce over the list in createdAt-DESC order) DISAGREED at
  exactly-x.5 decimal shapes: probed per-shape against the probe DB —
  [15.4, 17.9, 15.2] renders **49** server-side and **48** in the
  client's addition order; four of six drift shapes diverged by 1.
  The production card always renders the SERVER value (the
  meta-present path — the divergence was LATENT, the fallback fires
  only on meta-less payloads), but the S22/S27 "one definition, no
  drift between the seams" law was violated at the exact boundary the
  S53 log asked about.
- **F2 — the unpinned tie-break contract (probed CORRECT 5/5):** the
  `topRuns` tie-break (`runs DESC, createdAt DESC`) verified at the
  top tie, the CHART_ROWS boundary tie (the newer of two 400-run rows
  charted, the older dropped), the wire twin, and under a live
  pause/resume refresh cycle (status does not participate — PATCH
  never writes runs/createdAt). Unpinned: the seeded runs are
  all-distinct and every API-minted row carries runs: 0.
- **F3 — the CLS budget family (the last unpinned milestone):**
  measured 0.0028 / 0.0000 / 0.0000 on landing/login/dashboard —
  35x+ under the Core Web Vitals "good" threshold, unpinned.
- **The class survey (the extension discipline):** `runs` (integer
  addition — exact at every order, CLEAN) and the run-weighted rate
  (a 50,000-shape search for toFixed(1) boundary flips found ZERO —
  the large-magnitude integer-weighted products keep the display
  stable; adjudicated CLEAN, documented).

**TDD.** RED observed on the pre-fix build: 5 structural unit
failures (`sumHours is not a function` — the seam did not exist; the
x.5 display pins passed by design — the convention was already
correct). GREEN: the pure `sumHours()` seam (integer-tenths
accumulation — associative, order-free by construction; every
persisted `timeSavedHours` is on the 0.1 grid: POST hardcodes 0,
PATCH never writes hours — so the grid snap is exact for every
reachable state); the route's rate-rows fetch became the STAT-ROWS
fetch (`+timeSavedHours`, renamed `statRows`) feeding BOTH pure
seams; the aggregate dropped its dead hours column; the dashboard
page took the twin change; the client's memo rides the same seam.

**Mid-execution, two suite-order lessons re-learned the hard way:**
(1) the FIRST authoring of `session28-tie-break.spec.ts` asserted
against the DEMO workspace's seeded rows — but session23-honesty
deletes THREE seeded rows mid-suite (the survivor discipline), so the
full run failed while the isolated run passed; the spec was
re-designed to the DEDICATED-USER pattern (a unique registered user +
a deterministic 10-row workspace minted through a spec-scoped
PrismaClient — the Session-27 register discipline; the user
cascade-deleted in an afterAll). (2) The full-suite run's auth
failures at the LAST files alphabetically (session27/session28) while
the isolated re-run passed 3/3 — the signature of a BUDGET
exhaustION: the suite's ~45 auth flows per run (38 signIn calls + the
register round-trips sharing login's bucket) had outgrown the
webServer's `AUTH_RATE_LIMIT_MAX=50` pin (set in Session 11 at ~10
flows — the razor-edge pattern recurring after 17 sessions of spec
growth); raised to 100 with the documented reason. A third tooling
incident (the gotcha-26/31 zombie family's fifth member): a
tool-timeout-killed double-suite run orphaned its playwright +
webServer pair — the next run's `reuseExistingServer` latched onto
the orphan's server and 233/235 tests failed with
ERR_CONNECTION_REFUSED when the orphan's teardown killed it mid-run;
cleared by killing the orphans and re-running clean.

**Verification.** The full gate rose **529 → 541 checks ALL GREEN**
(182 unit + 124 smoke + 235 e2e — the plan's prediction was exact).
The seam-level float survey re-run: **all six drift shapes AGREE
across the seams** (the pre-fix divergences 48/50/53/37 vs 49/51/54/38
closed). The drift battery re-run: GREEN — word parity 1.0000 ×8, the
mobile-nav byte-identical, D62 holds. The boundary probe re-run: 9/9
PASS on the remediated build.

**The screenshot phase:** the 20-shot set genuinely refreshed (the
capture script REBUILT after the reset with the S27 laws held: no
`process.exit(0)` from a finally, the completion log line as the
check, the `[id]`-covering mock regex, the dev DB verified CANONICAL
before AND after — 6 rows / 5 active / 7,120 runs). The VLM
spot-checks ×5: the first run returned 2/5 — **all three FAILs were
the check prompts' own contracts written from memory** (the login
heading is "Welcome to SAAS Company", not "Welcome back"; the 404 is
the reference's own LIGHT slate card, not the dark theme; the menu's
Get Started pill is 44px like every row — the e2e pin is the ground
truth). All three adjudicated against the code before any change,
the prompts rewritten FROM the pinned assertions (the S27 lesson,
now actually held), the re-run **5/5 PASS**.

`.env.example` verified in sync (identical key set — the seam is a
code constant).

**Documentation:** PAD (revision block, ledger D110–D112, §7 counts,
§11 key-file rows incl. the new spec row), AGENTS (gotcha 42 + the
541 counts + the invariant line naming the exact hours seam), CLAUDE
(session-28 context + the stack-table/checklist counts), README (541
badge + the hours-seam row + every stale count), SKILL v2.27.0
(lessons 64–65), the remediation plan ticked with the MEASURED gate,
this formal session log, and both worklogs.

**Session 28 complete — all task-chain steps executed; the commit and
push follow.** This cycle's theme was **seam-arithmetic exactness +
the last unpinned families**: one latent cross-seam defect closed by
construction (the order-free hours seam), the tie-break contract
gated (probed correct first — the pin is the surviving memory of the
probe), the CLS milestone joining the budget gate, and two
suite-growth lessons encoded (the auth-budget re-count and the
orphaned-run hazard).

**Suggested next (Session 29 candidates):** the stat cards' derived
surface under the EMPTY-to-FIRST transition (the compose that lands
a workspace's first row — the 100.0% vacuous rate's expiry story),
the chart's `maxRuns` denominator under the all-zero-runs workspace
(the `Math.max(1, …)` floor — is the top bar honest when every
charted row is 0), or the SEO surface's structured-data extension
(the JSON-LD family the reference itself does not ship — a superset
candidate rather than a parity pin).
