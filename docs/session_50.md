# Session 50 — the transcript log of the Session 26 remediation cycle (continuation)

This run continued the task chain from a context reset that struck
mid-session: the prior transcript (session_48.md's successor run) had
already completed the workspace refresh, the session-docs review, the
baseline 493-check gate, the drift battery, the Session-26 audit, the
remediation plan, the TDD RED phase, the GREEN implementation, the full
511-check gate, the champion probe, the drift battery re-run, and the
20-shot screenshot capture. This run resumed at the VLM spot-check
adjudication and carried the cycle to completion: the documentation
alignment, the worklog, the main-only commit, and the SSH-wrapper push.

The VLM spot-check script existed with the S26 dashboard contract
already encoded (the chart ranks BY RUNS), but the two adjudicated
lessons from the interrupted step were not yet in the script. Encoding
them: check 1 gained the animated-gradient tolerance note (drift #11 —
the gradient heading sweeps white→violet→white on a ~14s cycle, and a
single-frame screenshot may catch a white-dominant instant where the
violet band is off-text; the heading text rendering legibly satisfies
the contract), and check 5 gained the strict VERDICT FORMAT contract
(the response must begin with the single word PASS or FAIL — never
HTML, after one verdict came back as markup soup). The re-run returned
4/5 — with check 1 now claiming a NEW deviation: a "missing hero video
area (the dashboard mockup with browser chrome)".

Per the standing drift-adjudication discipline (never believe the VLM
verdict OR your own prompt without checking the pinned contracts), the
claim went to the evidence: the landing spec pins the hero video as a
DOM attribute (`section video` src=/media/hero-ai-loop.mp4), and a
Playwright geometry probe against the live remediated build measured
the video filling the entire 1440×900 viewport (top=0, bottom=900)
while the h1 sits at 325–507px. hero.tsx tells the full story: the
hero is a full-viewport VIDEO BACKGROUND under a left-to-right black
gradient, with the beta badge, heading, subheading, and "Book a Demo"
CTA as the overlay, and the outlined mouse-shaped scroll indicator at
the bottom — there is NO dashboard mockup inside the hero. The
"dashboard mockup with browser chrome" is a SEPARATE below-the-fold
section (the mockup-motion-parity suite's subject). The check prompt
had invented the element — check-prompt drift #12, the same family as
S25's ninth and tenth drifts. Correcting the contract FROM the spec's
pinned assertions (the full-bleed background video + the by-design
scroll indicator, with an explicit "no mockup card inside the hero"
note) → the clean **5/5 PASS**.

The environment checks around it: the dev DB verified CANONICAL via a
Prisma probe (rows=6, runs=7120, active=5 — the probe script itself
needed a fix first: its env loading preferred `process.env` over the
.env file, and the shell-exported DATABASE_URL trap made the condition
skip the file value entirely; the fix — ALWAYS prefer the .env file
value in tooling), and `.env.example` verified in perfect sync (all 7
keys at identical line positions; the only env-looking reads in code
are the framework-internal NEXT_RUNTIME and NODE_ENV).

**Documentation alignment** (every doc the house convention touches):
the PAD gained its Session-26 revision-block entry, ledger rows D106
(the runs-chart ranks by its title's promise — the server-side
`meta.topRuns` across the FULL workspace, with `rankByRuns()` as the
pure client-side fallback and the criterion-naming note) and D107 (the
JS-transfer budget pins — scripts ≤ 400KB per route), §7 counts
170/123/218 = 511, and §11 key-file rows (the workflow-rank test, the
new session26-chart-rank spec, the transfer rows, the smoke topRuns
pins). AGENTS.md gained gotcha 40 (a ranked surface must rank by its
own title — and the cap can hide the champion entirely; the VLM twin:
never adjudicate an animated surface from one frame) + the 511 counts
+ the invariant line naming the ranking layer. CLAUDE.md gained the
session-26 Known Context entry + the stack-table/checklist counts.
README gained the 511 badge, the chart-ranking layer in the dashboard
feature row, and every stale count. The SKILL document went to v2.25.0
with lessons 60–61. The remediation plan was ticked with the MEASURED
gate (511 — the plan's predicted 505 was short the sixth unit pin and
the fourth ranking pin; the measured number is what counts), and
docs/session_49.md (the formal session log) was written. The repo
worklog gained the Session 26 entry.

**FINAL GATE re-check on the complete tree: 511 checks ALL GREEN** —
lint ✓, typecheck ✓, unit 170/170 ✓, build exit 0 ✓ (the Ecmascript
warning is the documented gotcha-32 channel), smoke 123/123 ✓, e2e
218/218 ✓ (4.5 minutes, no flake).

**Commit and push.** The change list reviewed clean (29 files, no
`.env`, no keys, no `db/*.db`, no logs — `.env.example` already
committed and unchanged). Committed to `main` as `198bab6` (the
`:bug: fix:` Session-26 message in the house style). The SSH wrapper
runbook re-read; the sandbox had lost its ssh binary, shim, and
paramiko to the reset — paramiko re-installed (to python3.13's user
site; the default python3 is 3.12), the Appendix A shim re-deployed
to /home/z/my-project/bin/ssh with a python3.13 shebang. The operator
key materialized to a 0600 temp file, its fingerprint verified
(`SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`), the dry-run
with the explicit `--remote git@github.com:nordeim/saas-company.git`
(the S23 lesson) confirmed the fast-forward `e9fcfd1..198bab6`, the
real push executed, and the wrapper asserted **remote main @ `198bab6`
== local HEAD** — wrapper-verified. The operator key shredded after
use (both the wrapper's temp copy and the operator's file). No new
branches — everything on `main`, per the operator contract.

**Session 26 complete — all task-chain steps executed and pushed to
`main` (`198bab6`, wrapper-verified, operator key destroyed).**

This cycle's theme was **chart-ranking honesty + transfer budgets**
(the S48 log's three suggested surfaces, extended to their class):

**One defect fixed with a two-layer mechanism (RED→GREEN, TDD)**
- **The chart's selection-criterion lie**: "Runs by workflow" charted
  the 8 most RECENT rows — the champion probe (a 12-row workspace
  whose oldest row carries 12,000 runs) rendered the champion
  invisible with every bar a stub. Now the chart ranks BY RUNS across
  the FULL workspace via the server-side `meta.topRuns` aggregate —
  D106. The deeper lie found en route: at >100 workflows the capped
  client list hides every old high-run row (the smoke 111-row
  workspace holds the champion in ZERO of the newest-100 rows), so the
  honest ranking had to be server-side (the S21 stat-cards precedent
  extended to the ranking surface).
- **The JS-transfer budgets shipped** (the S48 suggestion): scripts
  ≤ 400KB per route (measured 172/152/177KB — 2.3–2.6x margins,
  preventive by design) — D107. A bundle bloat now fails the gate
  instead of passing silently.
- The keyboard tab-order audit adjudicated CLEAN (documented so a
  future session does not re-litigate blind).

Gate rose 493 → **511**; the drift battery re-verified GREEN ×8
(mobile nav byte-identical, no Tailwind v4 bug); VLM 5/5 after
adjudicating drifts #11 (the animated-gradient single-frame artifact —
a time-sampled probe proved the 14s sweep running) and #12 (the
prompt's invented hero "dashboard mockup" — the hero's video is the
full-bleed background, the mockup a separate below-fold section).

**Suggested next**: start Session 27 — candidates from this cycle's
adjudications: the remaining unpinned budget families (TTFB, FCP —
LCP/DOM/transfer are pinned, the paint milestones are not), a
composed-vs-charted cross-surface consistency audit (the stat cards'
total runs vs the chart's topRuns sum vs the list's visible rows —
three surfaces, three sources, one truth), or the first-run story
under the volumetric case (what does a brand-new user's empty
workspace chart — the zero-row, one-row, and CHART_ROWS-boundary
shapes).
