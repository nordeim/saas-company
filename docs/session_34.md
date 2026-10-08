I'll continue the task chain. The session document references have been updated again (now session_31/session_32 + remediation-plan-session18), indicating the repo has advanced further. Let me set up my task plan and refresh the workspace first.
Workspace was reset. Cloning fresh:
仓库已取得重大进展：HEAD `37a0f4b` on main。Sessions 17 & 18 已完成（D83–D90 已关闭），gate 目前为 395 checks。让我来审查关键文档：
All deliverables from prior sessions exist. Now let me read the four key session documents as instructed:
Session 32 (transcript) confirms Session 18's cycle is fully complete and pushed (`1221194`). Now my job is the **next cycle**. Let me read the remediation plan and worklog:
The plan is fully ticked except the final push item — but git history shows `1221194` was pushed (wrapper-verified per session_31.md Phase 6), and `9f3daca`'s pattern shows pushes get recorded next cycle. Let me verify what the HEAD commit contains and read the worklog:
Session 18 is fully committed & pushed. Now reading the worklog tail and key project docs:
Worklog confirms Session 18 complete (gate 395). Now let me read the canonical agent guide (AGENTS.md) for environment setup and gotchas:
I have the full AGENTS.md picture (32 gotchas, gate 395, push runbook). Let me check the workspace layout and set up the environment per the established pattern:
The workspace root **already has the repo deployed** (the Session-18 layout) — my `saas-company/` clone is redundant. The DATABASE_URL trap is LIVE (exported absolute path). Let me check the root checkout's state:
The root checkout has a strange UUID-named commit (`ca3dc22`) on top of `1221194`, and is missing remote's `37a0f4b` (session_32.md). Let me inspect:
Now I understand the state fully:
- Root checkout = Session-18 workspace with a **local-only UUID commit** (`ca3dc22`) containing 3 survey scripts (sandbox snapshot artifact — must NOT be pushed)
- Remote `origin/main` = `37a0f4b` (adds session_32.md transcript) — local is missing it

Resolution: preserve the scripts as untracked, reset local main to `origin/main`, remove my redundant clone:
Workspace is now clean at `37a0f4b` (== remote main). Restoring the survey scripts as local-only artifacts and verifying the environment:
Working tree clean. Now re-seeding the dev DB to canonical state (gotcha-30 discipline) and starting the baseline gate:
Canonical seed checksum `e7f6c011` matches. Now running the baseline gate (lint → typecheck → unit → build → smoke → e2e):
**Baseline gate: 395 checks ALL GREEN** (132 unit + 66 smoke + 197 e2e, no flake). Updating progress and scoping Session-19 audit surfaces:
Security headers were already covered (S9 F6). Let me scope deeper — session TTL, validation regexes, sitemap:
Auth layer is solid (7-day TTL, per-request expiry check, timing-safe). Now let me examine the envelope seam and the client's error handling — probing for the crash-path contract:
Client half handles malformed responses (`res.json().catch(() => null)`). Now let me run the standing drift battery first — reusing the persisted survey script. Checking it:
The survey script is reusable. Let me check the smoke-test.sh boot pattern, then write the Session-19 drift runner (boot + probe in one invocation, fresh port per gotcha-32):
Let me verify db-path resolution before booting the probe server:
db-path resolution is solid. Creating the Session-19 drift survey script and runner (fresh port :3070, trap-based cleanup):
**Drift battery GREEN** — word parity 1.0000 ×8 (reference UNCHANGED), mobile-nav byte-identical (7 rows × 44px, real tap works, **no Tailwind v4 bug**). Now the live-login re-verification (D62) and scoping the Session-19 audit surfaces. Let me check the route handlers' crash paths:
The crash-path candidate is confirmed structurally (no catch around DB awaits). Now writing the RED-evidence probe — a full crash-path catalog on an unwritable-DB server, plus minted-session probes:
**RED evidence CONFIRMED** — 7 API endpoints answer a **bare 500 with an EMPTY body** (no content-type) when the DB fails, violating the repo's own envelope invariant ("No route returns bare JSON"). Notably the server log DOES carry the Prisma stack (Next logs unhandled errors) — a fix must preserve operator sight. Let me check the error boundary story and run the currency survey:
npm audit: still exactly the documented F10 chain — no new advisories (adjudicated CLEAN). Now investigating the page-level crash story (the `__next_error__` HTML vs the branded boundary):
The S13 boundary covers client-render crashes. Let me check whether the server-crash HTML contains any branded content:
The branded boundary does NOT cover server-component crashes (`__next_error__`, no "Something went wrong" content) — while the S13 goal was crash recovery never losing the brand. Let me complete the survey — npm outdated + the [id] route + login page:
All "outdated" entries are major-version jumps (prisma 7/8, eslint 10, TS 7, lucide 1.x) — adjudicated CLEAN (stability discipline; overrides are load-bearing). Now the live-login D62 re-verification with a persisted probe:
**D62 GREEN** — live login behaves exactly as documented. The audit is complete. Let me review the smoke suite's second-server pattern before writing the remediation plan:
Now let me study the S18 fd-2 seam and its test pattern — the R1 wrapper will reuse both:
I have all the patterns needed. Quick validation checks before writing the plan — who imports api.ts, and do any tests import routes directly:
api.ts is server-only (10 route importers, no tests import routes directly). Checking vitest config for the new unit test file:
Now reading the remaining route shapes (health, register, generate heads) to finalize the wrapper design:
All shapes confirmed. Writing the Session-19 remediation plan:
Plan saved. Now executing TDD-first. **R1 RED** — writing the unit pins before the wrapper exists:
**RED observed: 5/5 pins fail** (no `apiRoute`). Now GREEN — implementing the wrapper in api.ts:
**5/5 GREEN.** Now wrapping all 10 route handlers. Login first:
Login wrapped. Now register — reading it fully first:
Register wrapped. Reading the remaining routes (me, newsletter, demo):
Now health, logout, workflows, [id], and generate:
Now the [id] route — reading it fully first:
Last route — generate. Reading its full body:
All 10 routes wrapped. Now **R2** — the branded dashboard-unavailable view:
Now the dashboard page — with the redirect-outside-try/catch discipline:
Verifying the code compiles (lint + typecheck + unit):
**137/137 unit green.** Now adding the smoke broken-DB pins — inserting the third-server block after the generate pins:
Syntax-checking the script first (gotcha-31 discipline), then observing **RED** against the pre-fix build:
**RED observed exactly as catalogued** — empty envelope code, no content-type, `__next_error__` page, no branded fallback. Now GREEN — rebuilding with the fixes:
**SMOKE GREEN: 79/79.** Verifying the operator-sight restoration (fd-2 stack in the broken server's log):
9 `[api:unhandled]` stacks landed in the log — operator sight restored. Re-running the full crash catalog on the remediated build:
**Crash catalog fully GREEN** — every crash row an envelope, /dashboard serves the app's own shell (200). Now the e2e suite (final gate layer):
**FULL GATE GREEN: 413 checks** (137 unit + 79 smoke + 197 e2e). Now the drift-battery re-verification on the remediated build (regression guard — routes were touched):
**GOTCHA-26/32 ZOMBIE SIGNATURE!** — "FeaturesHow" concatenated words, h=17 rows: a stale :3070 process (the first drift run's server, kill+wait silently failed) is serving old-build HTML against regenerated chunks. Verifying and moving to a fresh port per the documented discipline:
Confirmed: **:3070 is a zombie** (answering after script exit — the kill failed silently, the third documented incident). :3071 died cleanly. Best-effort cleanup + fresh-port re-run:
The zombie survives (process-blind sandbox — documented limitation). Moving the drift battery to fresh port **:3075** per the gotcha-32 discipline:
The **fresh-port server ALSO serves unstyled HTML** — this is not a zombie; something is genuinely wrong with the new build's CSS serving. Yet e2e visual specs passed (possibly a stale :3100 answered). Diagnosing directly — inspecting the served HTML's CSS links vs disk:
CSS file exists on disk. Checking whether the server serves it and what's inside:
**The CSS starts with `@font-face{font-family:Playfair Display...}` with Cyrillic ranges — that's NOT this app's CSS!** (This app self-hosts Vend Sans.) Investigating:
The CSS file is the app's own (Playfair = the logo-cloud wordmark font; Vend Sans is present). The CSS is fine — the failure must be at the browser level. Diagnosing with Playwright directly:
**Found it — my own re-run bug!** The runner script boots :3075 but the *survey* script hardcodes `PROBE_BASE ?? :3070` — so the survey probed the **zombie :3070**, not the fresh :3075 server. The page renders perfectly (141 CSS rules, bodyBg rgb(0,0,0)). Re-running the survey against the verified :3080:
**Drift battery GREEN — parity 1.0000 ×8, mobile-nav identical.** But one more validity concern: did the post-fix e2e run against a *stale* :3100? Checking the webServer config and port state:
`reuseExistingServer: true` locally — the e2e evidence is suspect if :3100 was stale. Checking cleanly:
All evidence **valid**: :3100 was dead → e2e booted fresh (new build); :3080 serves the drift GREEN; :3070 zombie is harmless if never probed. **Full gate: 413 checks, no flake.** Now the screenshot refresh — checking the S18 capture script:
The S18 capture script defaults to :3070 — the zombie port! I'll run it with an explicit fresh-port server. First, re-seeding the canonical dev DB (gotcha-30 discipline), then boot+capture in one invocation on fresh port :3090:
**20/20 shots captured.** Now VLM spot-checks — reusing the S18 verification script:
**08-dashboard.png FAILED the VLM check** — this could be a real regression from my page changes. Investigating:
The VLM verdicts are **non-deterministic** (same image, different results across runs — login PASSED then FAILED point 1). Let me adjudicate directly by viewing the screenshots myself:
I can't view images directly. But I have stronger *deterministic* evidence: the e2e dashboard specs passed (fresh :3100 boot). Let me check what the dashboard header actually renders — the VLM's complaint may be prompt-expectation drift:
The dashboard never had "Welcome back" — that text exists only in the VLM prompt (inherited expectation drift). The real header is "Nova.AI / Dashboard" + email. Fixing the prompt to assert the actual contract and re-running:
**VLM: 5/5 PASS.** Now the documentation phase. Reading the PAD's revision block and ledger tail to match format:
Now inserting the Session-19 revision entry after S18's block:
Now updating §7 counts and the ledger:
Adding the unit-layer pin description and the ledger rows:
Verifying the ledger table placement is correct:
Ledger placement correct (§5.4 table end). Now §11 key files:
PAD complete. Now AGENTS.md — gotcha 33 + updated counts:
Adding `apiRoute` to the architecture-invariant line:
AGENTS done. Now README — badge + troubleshooting rows:
Fixing a pre-existing stale count in the README's verification block (said 126/65 while the badge said 395):
Now CLAUDE.md — finding the session-18 context block to follow:
Now the SKILL doc — checking its version header and lessons tail:
SKILL updated. Verifying `.env.example` sync (no new env vars introduced):
`.env.example` in sync (NEXT_RUNTIME/NODE_ENV are framework-managed). Ticking the remediation plan:
Now writing the session log `docs/session_33.md`:
Now appending the S19 entry to the repo worklog:
Worklog appended. Running the final post-docs gate re-check (full six layers for bulletproof commit evidence):
**FINAL GATE: 413 checks GREEN** on the complete tree. Now the pre-commit review:
The tree is exactly as expected. Verifying which scripts are tracked (survey scripts stay local-only per the established pattern):
Staging correct — survey scripts stay local. Excluding them and committing:
**Commit `6be9888` on main, clean tree.** Final step — the SSH wrapper push. Reading the runbook:
The runbook is clear. Executing the field-tested sequence — key materialization, fingerprint check, shim deployment:
pip resolved to system pip while python3 is the venv's. Installing into the venv directly:
**paramiko 5.0.0 ready** (matches previous sessions). Materializing the operator key outside the repo and verifying the fingerprint:
Fingerprint verified. Dry-run (authenticates, touches no refs):
Dry-run clean — remote at `37a0f4b`, fast-forward to `6be9888` ready. Executing the real push:
**Push verified** — remote main @ `6be9888` == local HEAD. Shredding the operator key:
All done. Final todo update:
**Session 19 complete — committed and pushed to `main` (`6be9888`, wrapper-verified, operator key destroyed).**

This cycle's audit theme was **crash-path honesty** — what the app does when dependencies *fail*, not when input is wrong. After confirming the baseline (395 checks green, reference unchanged, mobile nav byte-identical — no Tailwind v4 bug), the survey found two defects with RED evidence, both fixed TDD-first:

1. **The crash-path envelope (D91)** — probed with an unwritable database, seven API endpoints answered a *bare 500 with an empty body*, violating the repo's own "no route returns bare JSON" invariant. Now an `apiRoute()` wrapper in `api.ts` formats every escaping error as the `INTERNAL_ERROR` envelope **and restores the operator's stack to fd 2** (catching an error otherwise removes Next's log line).
2. **The branded server-crash boundary (D92)** — a dashboard DB failure served Next's unbranded `__next_error__` page. Now a degraded "Workspace unavailable" card renders instead (status 200 by design; `/api/health`'s `db` field owns alerting).

The gate rose **395 → 413 checks** (no flake); 20 screenshots refreshed (VLM 5/5); dependency currency adjudicated clean; all docs aligned. Along the way I caught and documented a new gotcha: a probe script with a *defaulted* port silently evaluated a zombie server while its healthy server sat elsewhere.

**Suggested next steps:** on your infra, try killing the DB under a running container to see the new envelopes + branded fallback live; or if you'd like another pass, the next session could survey new layers (e.g., Lighthouse-style performance budgets or deeper load behavior).
