I'll start by internalizing the task and setting up a structured plan. Let me first check the current workspace state and the uploaded prompt file.
Workspace has been reset. Let me read the uploaded prompt file and clone the repo.
The prompt file wasn't uploaded (content is in the message). Let me check the existing git repo in my-project and clone the saas-company repo.
This is the workspace scaffold. Now let me clone the saas-company repo (workspace was reset, so fresh clone is needed).
Repo cloned successfully on `main` branch. The repo is mature (Session 45+ work done). Let me mark progress and explore the docs folder and key structures.
Latest docs confirmed. Now let me check sizes of the key files to plan my reading strategy.
The repo is mature: Next.js 16 + React 19 + Prisma/SQLite + Tailwind v4, with vitest/playwright already configured. No `.env` yet. Now let me read the history docs (small ones first, fully).
Session 45 is confirmed complete (gate 756). This session continues as **Session 46**. Let me read the remediation plan and worklog tail.
Now the worklog tail for the latest entries and S46 candidates.
Session 45 closed at gate 756; this is **Session 46**. Now let me read the core docs. I'll read README fully first, then key sections of the others.
README understood. Now let me read AGENTS.md (the operational rules and gotchas).
Now let me check CLAUDE.md's structure and read its session context block.
Core docs internalized. Now let me validate understanding against the codebase structure and check the skills catalog.
Codebase validated — structure matches docs. Now let me check the repo's skills catalog and remaining configs.
Phase 1 docs review is complete. Now let me set up the environment: create `.env`, install dependencies, and seed the DB (careful with the gotcha-1 exported-DATABASE_URL trap — note the parent `/home/z/my-project/.env` exists, which is exactly the walk-up trap the repo docs warn about).
The shell has an exported `DATABASE_URL` pointing to the parent workspace — the exact gotcha-1 trap. I'll unset it in every command. Let me verify the .env and install dependencies.
DB seeded at canonical state (checksum `e7f6c011` — matches the S42–S45 record). Now the baseline gate, starting with lint + typecheck + unit tests.
Lint ✓, typecheck ✓, unit 248/248 ✓ — matching the S45 record. Now the production build.
The e2e run seems to have issues — let me see the full summary.
The failures are just a missing Playwright browser binary (workspace was reset). Installing Chromium:
The full e2e suite needs more time. Let me check for zombies from the killed run, then run it in the background with logging.
No zombies. The suite runs serially (1 worker). Let me run it in the background with a log.
The background run died. Let me retry with setsid and a proper log location inside the workspace.
E2E is running and passing. Let me poll until it completes.
Progress stalled at 5 tests. Let me check the process state.
The detached process was killed between tool calls. Let me check the log and run the suite in chunks instead (each under the 10-min tool limit).
The suite needs chunked runs. Let me check the global-setup to understand DB seeding between chunks.
Global setup re-seeds idempotently — chunking is safe. Let me count tests per spec to balance the chunks.
383 tests across 54 specs. I'll run the suite in 6 balanced chunks (each chunk self-contained: re-seeds DB + boots its own server). Chunk 1:
Chunk 1: 78/78 ✓. Chunk 2:
All 6 chunks passed: **78+62+68+74+71+30 = 383/383 e2e GREEN**. 

**BASELINE GATE: 756/756 ALL GREEN** (248 unit + 125 smoke + 383 e2e; lint/typecheck/build clean) — the Session-45 record verified exactly. Let me update progress and start the Phase 2 audit of recent changes.
**Phase 2 — Audit.** Let me examine the S45 diff (the remediation commit) for conformance.
The S45 diff is small: registry extension + new spec + docs. Let me review the code changes for conformance.
Registry diff conforms. Let me scan the new S45 spec file briefly for quality.
The S45 spec conforms — **audit verdict: no defects** (gate 756/756 on the pulled tree is the strongest evidence). Now Phase 3 — parity work. Let me probe the live reference site first (reference-regression watch, gotcha 7: the live is a moving target).
Live site is up and unchanged. Now let me write the Session-46 recon script following the house pattern (measure BEFORE designing contracts).
`research/` is gitignored (house convention confirmed). Now writing the Session-46 recon script — measuring the route-watch + the three twenty-first-surface candidates (clipboard/keyboard, drag-and-drop, offline) paired clone-vs-live, plus the live dashboard login re-verification:
Now boot the clone standalone server and run the recon in one session (server + script + teardown):
The command failed silently — likely the complex background chain. Let me split it: first prepare the recon DB, then boot the server + run recon.
Rich results already: **R2b structural parity is exact** (both strips identical: grab cursor, 3208px scrollWidth), **R2c shows the clone's offline superset** (718 words rendered offline vs the live's 136-word shell), and R2a shows deltas to investigate (the live ships a user-select rule + event listeners the clone lacks). The crash was in the mobile-nav burger locator (the gotcha-47 aria trap on the live). Let me check the clone's navbar structure, then fix the recon script.
The clone's burger uses `aria-controls='mobile-menu'`; the live's needs a structural fallback. Let me fix the recon script with per-phase resilience, a robust burger finder, the oncopy null-check fix, and a native wheel test:
R1 is clean — **no recovery, no regression** (byte-identical word parity on all 8 routes; statuses + sitemaps at the registered sets). R2a shows near-parity with small deltas to adjudicate. Let me see the rest.
Excellent data. Key findings so far:
- **R1**: zero drift — all 8 routes byte-identical
- **R2a**: live ships one `.select-none` CSS rule (need to check if any element uses it); listener counts are library internals
- **R2b**: structural parity EXACT (3208px/8 cards/grab cursor); behaviorally neither side pans on mouse-drag or wheel — parity
- **R2c**: clone renders 718 words offline vs live's 136-word SPA shell — the SSR superset
- **R3**: live login redirected to `/` (need explicit /dashboard probe); the live's dormant toaster container intercepts burger clicks (D124 family — needs force-click)

Let me check the clone's testimonial strip implementation and then write the adjudication probes:
The clone's strip is native `overflow-x-auto` + cosmetic `cursor-grab` (no JS drag) — behavioral parity holds. The clone doesn't use `select-none` anywhere. Now the adjudication probes:
Let me see the full adjudication report for A1, A2, and A3-clone:
Major findings:
- **A1**: `.select-none` is INERT on the live (zero carriers on all routes) — gotcha-6 family, rendered parity holds
- **A2**: the live's `/dashboard` renders its SPA 404 (16 words, h1 "404") — the registered soft-404 record confirmed, no recovery; the clone's working dashboard remains the registered superset
- **A3**: my menu probe found no fixed panels on either side — the probe's finder is wrong (the e2e suite proves the clone menu opens). Let me check the actual panel structure:
The clone's menu is a normal-flow div (`id="mobile-menu"`, `hidden` at rest) — not fixed. My probe's finder was wrong. Let me write the corrected probe:
The clone's menu works perfectly (7 rows @44px, close-on-reclick, close-on-navigate + scroll). But my live-side finder matched the page wrapper (height 10036) — not the actual menu. Let me dump the live's actual navbar structure at 390:
The live's burger is confirmed bare (no aria-*) — but no panel appeared after my click. The filter may be too narrow (a full-height overlay would be excluded). Let me dump the post-click DOM directly:
No menu appeared, and the nav HTML is just the logo SVG. The suspicion: the live's dormant toaster (z-100, fixed top-0) may be blocking the burger. Let me probe the hit-target truth:
**Decisive finding:** The live's menu opens via JS click (identical 7-row/44px structure to the clone!) but **NOT via real pointer clicks** — two dormant react-hot-toast containers (`fixed top-0 z-[100]`, `pointer-events: auto`, height 32) sit over the burger's upper band at 390. Let me refine: does clicking the burger's lower part (below y32) work? And what's the exact hit target?
**The Session-46 headline finding is complete:**
- **LIVE burger at 390**: y20 ❌ | y28 ❌ | y36 ✅ | y44 ❌(outside) — the icon's upper 2/3 is blocked by its own dormant toast containers
- **CLONE burger**: y20 ✅ | y28 ✅ | y36 ✅ — fully clickable
- Menu panel structure when opened: **byte-identical** (7 rows @44px, same classes)
- Desktop 1440: toasters move to bottom-right, no interference

This is a new reference-state record (gotcha-18 family). Let me complete the Phase-4 standing SEO verification on the standalone boot, then write the remediation plan:
All Phase-4 standing requirements verified (robots, 8-URL sitemap, working og-image, 6 JSON-LD blocks, canonical). Now writing the Session-46 remediation plan:
Plan saved. Now validating the plan's assumptions against the codebase conventions before executing — checking the session-log numbering and the spec conventions:
Conventions confirmed (S46 → session_98/99). Now writing the session46 spec — the TDD versioning pins:
I introduced a module-scope `globalPage` anti-pattern — exactly the S45 in-flight catch (the helper must take the page as a parameter). Fixing now:
Let me verify the spec is clean and run it (F1):
**F1 GREEN: 8/8 first run.** Now F2 — the paired drift battery:
TS syntax in a .mjs file — fixing the annotations:
26/28 — both failures are battery instrumentation bugs, not drift: (1) the structure check sorted to the inner wrapper (no bg classes), (2) the sitemap origin strip failed because the clone emits `localhost:3000` (NEXT_PUBLIC_SITE_URL default) while my server runs on `:3300`. Fixing both:
**F2 GREEN: 28/28 ZERO DRIFT** (after two in-flight battery instrumentation adjudications). Now F3 — the full gate. Lint, typecheck, unit, clean build:
**FULL GATE: ALL GREEN — 391/391 e2e** (86+62+68+74+71+30; the 383 standing + 8 session46). **Gate raised 756 → 764.** Now F4 — the screenshot refresh with DB canonical state verification:
The inline escaping broke. Let me extract the DB probe into its own script file:
BigInt from SQLite counts — fixing serialization:
16 shots captured; shot 14 hit a redirect loop. Let me check how the proven resilience spec triggers this state:
The spec aborts SPECIFIC API routes, not all. Let me check the dashboard's gating to understand the loop:
Both gates use the same `sessionUserId()`. Let me debug the actual redirect chain:
The loop pattern is clear: document requests to `/dashboard` see NO session while RSC fetches DO. Let me log the actual cookies per request to find the truth:
Cookie logging via `headers()` is unreliable (a known Playwright quirk — httpOnly cookies live in `headersArray()`). The key evidence: the session alternates between requests. Let me test the decisive variable — `NODE_ENV` — since the e2e webServer (which works) pins `NODE_ENV=production`:
The standalone server forces `NODE_ENV=production` → the cookie is `Secure`. Let me get the actual wire headers with the reliable async API:
**THE COOKIE IS PRESENT ON EVERY REQUEST** — yet /dashboard 307s while /login 307s back! Both pages call the same `sessionUserId()`. The only code that runs before both: the **proxy (middleware)**. Let me read its full logic:
The proxy is clean. The prime suspect now: Playwright's route interception breaking the redirect+cookie chain. Testing the goto WITHOUT routes active:
All three failed — and the "login" itself never reached /dashboard (the waitForURL regex matched `from_url=/dashboard`!). The server 307s /dashboard despite the valid cookie. Let me verify server-side with curl:
**The API route sees the session; the page does not — with the same cookie!** Let me compare how the API's `me` handler reads the session vs the page:
**FOUND IT — a zombie server holds :3300** (EADDRINUSE; the probe's own server never started — the responses came from an orphan from an earlier run). This is the documented **gotcha 46: kill by PORT, never by argv**. Let me clean up all zombies and re-probe cleanly:
The zombie ran with `recon46-secret` + `recon46.db`. But the API-vs-page divergence persists as a pattern — the key difference is the **proxy matcher** (runs on `/dashboard`, skipped for `/api/*`). Yet the e2e/smoke suites pass their dashboard flows. Let me check what the smoke suite actually pins, then re-probe on a CLEAN server:
**Line 600: the smoke suite pins cookie'd GET /dashboard → 200 — and it PASSED.** The zombie is the sole cause: my `kill $SERVER_PID` killed the parent `node server.js` but the renamed `next-server (v16.4.0)` child survived (the documented gotcha-46 law — kill by PORT), and my later rebuild diverged the zombie's in-memory state from disk. The 307 loop was **zombie contamination, not a real bug**. Fixing all runners to kill by port:
**F4 COMPLETE: 21/21 screenshots captured, DB canonical (1/6/7120/5/1), zero mutations.** Now the VLM standing checks — let me load the VLM skill for the correct SDK usage:
The CLI pattern is clear. Running the 8 standing VLM checks:
The two failures look like CLI output parsing issues. Let me check the raw responses:
Both shots show the healthy dashboard — my capture approach didn't trigger the degraded states. The SSR initial data means the banner needs a failed ACTION. Let me check the error-boundary spec's pattern and fix the capture:
Now I have the exact patterns. Fixing the capture script's shots 14 + 15:
All 21 shots captured, but the DB mutated (one workflow paused): shot 15's real PATCH `/api/workflows/<id>` wasn't intercepted (the glob `**/api/workflows` doesn't match the id path). Fixing the script and restoring the canonical DB:
**F4 COMPLETE: 21/21 screenshots, DB canonical, zero mutations; VLM 8/8 ZERO flags.** Now F5 — docs alignment. Let me locate the anchors in each doc:
I have the PAD structure. Let me check the revision block ordering and the other docs' anchors:
All anchors located. Let me check the README's verification counts (potential stale numbers), then write the docs-alignment script:
Now writing the docs-alignment script (the house convention — one-shot Python under `research/`):
The script re-applied non-destructive edits (bad idempotency guard — the anchors survive insertion). Let me revert PAD+AGENTS to git state, fix the guard and the invariants anchor, then re-run cleanly:
All 18 edits applied. Let me verify no duplication and spot-check:
Both mentions are legitimate (inventory + gate line). Docs verified. Now ticking the remediation plan and adding the measured-record appendix:
Now the session logs (session_98 curated + session_99 raw, per the house numbering):
Now the repo worklog entry (Task 46 + the closing entry placeholder):
Now updating the shared workspace worklog, then verifying the change set before commit:
15 modified (6 byte-identical deterministic renders — consistent with the S45 pattern) + 4 new files. Now let me review the SSH push runbook before committing:
Runbook internalized (including the S31 trap: the wrapper's default remote is the runbook's example repo — the explicit `--remote` flag is mandatory). First, the commit:
Commit `653b497` created. The workspace reset wiped the ssh shim — deploying it per the runbook Appendix A:
Shim deployed. Now the operator key + fingerprint verification:
Fingerprint verified — matches the S1–S45 record. Dry-run with the explicit `--remote` (the S31 trap):
Dry-run confirms the fast-forward `02727a8..653b497` to the correct remote. Executing the real push:
**PUSH VERIFIED** — wrapper + HTTPS agree at `653b497`, tree clean, key shredded, zero zombies. Now the closing discipline (the pushed-hash record + the closing worklog entry + the closing commit):
**Session 46 fully closed** — `92792b6` pushed, wrapper + HTTPS verified, tree clean, key shredded. Final housekeeping:
**Session 46 complete — all phases delivered and pushed to main (`92792b6`, wrapper + HTTPS double-verified, tree clean, zero zombies, key shredded).**

**The headline:** the reference site's own mobile-menu burger is **two-thirds unclickable at 390px** — its dormant toast containers (`fixed top-0 z-[100]`, pointer-events auto) sit over the icon, so real clicks at the top/center hit the toaster and the menu never opens (only the bottom sliver works). This clone's burger opens at **every point** of the icon — now formally registered as the D160 superset, measured with a new hit-target-map instrument (elementFromPoint + a three-point real-click census).

**Also delivered:**
- **Twenty-first surface (D157–D159):** clipboard/keyboard empty-set at exact parity, testimonial-strip drag contract at parity, offline-render superset (718-word full SSR landing vs the live's 136-word shell)
- **Route-watch:** zero drift — all 8 working routes byte-identical; the live's /dashboard re-verified as SPA-404 even through a real login
- **Gate raised 756 → 764** (248 unit + 125 smoke + 391 e2e — 8 new session46 pins, green on first run); battery 28/28 zero drift
- **The zombie-port law (gotcha 56):** diagnosed an "impossible" redirect loop caused by a renamed `next-server` child surviving kill-by-PID — every survey runner now sweeps ports before/after
- 21 screenshots (DB canonical, zero mutations), VLM 8/8, all six docs aligned, remediation plan + session logs saved

**Suggested next steps:** the S47 candidates are recorded in the worklog — the print-to-PDF text layer, focus-visible rings, or forced-colors surfaces as the twenty-second. The repo is at a clean baseline whenever you're ready.
