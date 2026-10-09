# Session 56 — the transcript log of the Session 28 remediation cycle

The workspace had been fully reset (an unconfigured git remote, a bare
initial commit, no node_modules, no .env, no db/) — the rebuild: the
remote added, `git fetch` + `git reset --hard origin/main` at `3ca82c1`
(86 commits; Session 27 closed by `e0b9cd8` + `2c04a68` + the user's
`3ca82c1` session-log update — `docs/session_54.md` is the S27
transcript), a fresh `npm install` (340 packages), `.env` recreated from
`.env.example` with a fresh `AUTH_SECRET`, and the canonical DB
re-seeded (checksum `e7f6c011` — the S1–S27 record). The shell's
exported `DATABASE_URL` trap was live all session (a stale absolute
path) — neutralized per-command. This run is **Session 28**; the S53
log's three suggested surfaces were the audit's charter.

The docs review confirmed the alignment (AGENTS 41 gotchas, CLAUDE,
README, PAD, SKILL v2.26.0 — all at the pushed Session-27 state;
session_53 the formal log with the S28 candidates, session_54 the
transcript, the ticked remediation-plan-27, the worklog tail).

The baseline gate on the rebuilt environment: **529 checks ALL GREEN**
(176 unit + 124 smoke + 229 e2e — no flake; lint + typecheck + build
clean). The standing drift battery — REBUILT from scratch after the
reset (the sandbox scripts were wiped): word parity **1.0000 ×8 routes**
(the reference UNCHANGED), the mobile-nav paired probe (the clone's
burger opens with a REAL tap into the byte-identical panel — seven
rows, every row exactly 44px — no Tailwind v4 bug; D32 holds; the
live's burger is `button.md:hidden`, unnamed per D63, opened via JS
click — two probe-side lessons re-learned: the live has no `<header>`
element, and fixed-positioned panels have NULL `offsetParent` — filter
by computed style), and the SEO surface clean (sitemap 200
`application/xml`, robots, the og-image 1200×630 PNG, a valid
manifest).

The Session-28 audit (probe-only server :3241, `db/probe-s28.db`,
gotcha-30, two purpose-built users — the 9-row tie-break workspace and
the x.5 hours-boundary workspace): 9/9 verdicts PASS on the standing
behavior, then the follow-up SEAM-LEVEL float survey isolated the one
defect — the "Hours saved" card's CLIENT fallback (a naive JS float
reduce in createdAt-DESC order) disagreed with the SERVER's SQLite SUM
at exactly-x.5 decimal shapes: per-shape probing against the probe DB
showed the server rendering 49/51/54/38 (the half-up convention over
the grid-exact sum) while the client fallback's arithmetic rendered
48/50/53/37 — four of six drift shapes, a 1-hour cross-seam
divergence (LATENT in production: the meta-present path always renders
the server value — the S22/S27 "one definition" law violated at the
exact boundary the S53 log asked about). The tie-break contract probed
CORRECT 5/5 (the top tie newest-first, the CHART_ROWS boundary tie,
the wire twin, the pause/resume stability — PATCH never writes
runs/createdAt) but UNPINNED; the CLS milestone measured
0.0028/0.0000/0.0000 — the last unpinned budget family. The class
survey: the runs sum (integer — exact, CLEAN) and the run-weighted
rate (a 50,000-shape toFixed(1) flip search found ZERO — adjudicated
CLEAN, documented).

The remediation plan (`docs/remediation-plan-session28.md`) was
written and validated against the codebase first (pin-conflict scans:
`sumHours` appears nowhere; `rateRows` in exactly 2 files;
`_sum.timeSavedHours` has 2 authors and zero pin readers; no spec
reads layout-shift; no spec inserts via Prisma).

TDD: RED observed on the pre-fix build (5 structural unit failures —
`sumHours is not a function`; the x.5 display pins passed by design).
GREEN: the pure `sumHours()` seam (integer-tenths accumulation —
associative, order-free by construction; every persisted
`timeSavedHours` sits on the 0.1 grid: POST hardcodes 0, PATCH never
writes hours); the route's rate-rows fetch became the STAT-ROWS fetch
(+timeSavedHours, renamed `statRows`) feeding both pure seams; the
aggregate dropped its dead hours column; the page's twin change; the
client memo rides the same seam. The tie-break pins
(`session28-tie-break.spec.ts`) and the CLS pins
(`performance-budget.spec.ts`) followed.

Mid-execution, two suite-order lessons re-learned the hard way: (1)
the FIRST tie-break spec authoring asserted against the DEMO
workspace's seeded rows — the full run failed while the isolated run
passed: **session23-honesty deletes three seeded rows mid-suite** (the
survivor discipline), so the spec was re-designed to the
DEDICATED-USER pattern (a unique registered user + a deterministic
10-row workspace minted through a spec-scoped PrismaClient; the user
cascade-deleted in an afterAll). (2) The full-suite run's auth
failures at the LAST files alphabetically (session27/session28) with a
clean isolated re-run — the budget-exhaustion signature: the suite's
~45 auth flows per run (38 signIn calls + the register round-trips
sharing login's bucket) had outgrown the webServer's
`AUTH_RATE_LIMIT_MAX=50` pin (set in Session 11 at ~10 flows — the
razor-edge pattern recurring after 17 sessions of spec growth); raised
to 100 with the documented reason. A third tooling incident (the
gotcha-26/31 zombie family's fifth member, encoded as SKILL lesson
65): a tool-timeout-killed double-suite run orphaned its
playwright+webServer pair — the next run's `reuseExistingServer`
latched onto the orphan's server and 233/235 tests failed
ERR_CONNECTION_REFUSED when the orphan's teardown killed it mid-run;
cleared by killing the orphans and re-running clean.

Verification: the full gate rose **529 → 541 checks ALL GREEN** (182
unit + 124 smoke + 235 e2e — the plan's prediction was exact). The
seam-level float survey re-run: **all six drift shapes AGREE across
the seams** (the pre-fix divergences closed). The boundary probe
re-run: 9/9 PASS. The drift battery re-run: GREEN — zero regressions
from the client changes.

The screenshot phase: the capture script REBUILT after the reset with
the S27 laws held (no `process.exit(0)` from a finally; the completion
log line as the check; the `[id]`-covering mock regex — gotcha 37;
the dev DB verified CANONICAL before AND after — 6 rows / 5 active /
7,120 runs); the 20-shot set genuinely refreshed. The VLM spot-checks
×5: the first run returned 2/5 — **all three FAILs were the CHECK
PROMPTS' own contracts written from memory** (the login heading is
"Welcome to SAAS Company", not "Welcome back"; the 404 is the
reference's own LIGHT slate card, not the dark theme; the menu's Get
Started pill is 44px like every row — the e2e pin is the ground
truth). All three adjudicated against the code BEFORE any change, the
prompts rewritten FROM the pinned assertions (the S27 lesson, now
actually held), the re-run **5/5 PASS**.

`.env.example` verified in sync (no new env vars — the seam is a code
constant). Documentation: PAD (revision block, ledger D110–D112, §7
counts, §11 key files), AGENTS (gotcha 42 + counts + the invariant
line naming the exact hours seam), CLAUDE (session-28 context), README
(541 badge + the hours-seam row), SKILL v2.27.0 (lessons 64–65), the
remediation plan ticked with the MEASURED gate, the formal session log
`docs/session_55.md`, and both worklogs.

The final gate re-checked green on the complete tree (541 checks). The
commit `b8bae1f` (33 files — 7 code + 6 docs + 20 screenshots, no
`.env`, no keys, no `db/*.db`) landed on `main`, and the SSH wrapper
runbook followed exactly: the operator key materialized to a 0600 file
outside the repo, its fingerprint verified against the S1–S27 record
(`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`), the dry-run
with the explicit `--remote` confirmed the fast-forward
`3ca82c1..b8bae1f`, the real push executed, and the wrapper asserted
**remote main @ `b8bae1f` == local HEAD** — wrapper-verified (the
fetch re-verified the remote ref independently). The operator key
shredded after use. No new branches — everything on `main`, per the
operator contract. (The shim note: the sandbox again had no OpenSSH
binary — the paramiko ssh shim was rebuilt at `/home/z/bin/ssh`, now
with the BIDIRECTIONAL stdin pump the push path needs: git's
receive-pack streams the pack through the channel, and a read-only
shim deadlocks the negotiation — the first dry-run hung until the shim
learned to pump.)

**Session 28 complete — the task chain executed end-to-end and pushed
to `main` (`b8bae1f`, wrapper-verified, operator key destroyed).**

This cycle's theme was **seam-arithmetic exactness + the last unpinned
families**:

- **One latent cross-seam defect closed by construction**: the "Hours
  saved" card's client-fallback display was order-dependent at
  exactly-x.5 workspaces (48 where the server displayed 49 — four of
  six probed shapes) — now the order-free `sumHours()` seam shared by
  the route, the page, and the client fallback (integer-tenths
  accumulation; exact on the 0.1 grid every persisted value sits on) —
  D110.
- **The tie-break contract gated** (probed CORRECT 5/5 first — the pin
  is the surviving memory of the probe; the dedicated-user pattern for
  suite-order robustness) — D111.
- **The CLS milestone joined the budget gate** (≤ 0.1 per route — the
  last unpinned family) — D112.
- **Two suite-growth lessons encoded**: the auth-budget re-count
  (AUTH_RATE_LIMIT_MAX 50 → 100 — the Session-11 razor-edge pattern
  recurring) and the orphaned-run hazard (the timeout-killed double
  run's reuse cascade — SKILL lesson 65).

Gate rose 529 → **541**; the drift battery re-verified GREEN ×8; VLM
×5 PASS after the prompt-contract adjudication.

**Suggested next (Session 29 candidates):** the stat cards' derived
surface under the EMPTY-to-FIRST transition (the compose that lands a
workspace's first row — the 100.0% vacuous rate's expiry story), the
chart's `maxRuns` denominator under the all-zero-runs workspace (the
`Math.max(1, …)` floor — is the top bar honest when every charted row
is 0), or the SEO surface's structured-data extension (the JSON-LD
family the reference itself does not ship — a superset candidate
rather than a parity pin).
