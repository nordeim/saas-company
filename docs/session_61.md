I'll start by internalizing the instructions and setting up the workspace. This is a complex multi-phase code audit & remediation task with explicit directives to proceed with best judgment on open questions, so I'll begin immediately.
Workspace has been reset. Let me clone the repos and check the environment.
Repo cloned successfully on `main` branch. Now let me read the key documentation files.
All files exist. Let me read the core documentation files — starting with the smaller session docs and README.
Session 29 is complete; this will be Session 30. Now let me read the core docs — AGENTS.md, README.md first.
Now let me read README.md and the session 29 remediation plan.
Now let me read CLAUDE.md key sections and worklog tail to complete my understanding.
I now have a solid picture of the project. Session 29 closed at 554 checks green. This will be **Session 30**. Let me read the remaining key docs (PAD essentials, skills catalog) and set up the environment in parallel.
Now let me set up the environment. First, kick off `npm install` and read the `.env.example` and db-path implementation.
The `.env.example` already specifies `DATABASE_URL="file:../db/custom.db"` — exactly what the user wants. Let me create `.env`, verify the db-path implementation, and check install progress.
The db-path implementation correctly anchors `file:../db/custom.db` to the repo root's `db/` folder. Let me create `.env` and wait for install.
**Critical trap detected**: the seed wrote to `/home/z/my-project/db/custom.db` (the PARENT directory) instead of the repo's `db/` folder — this is the documented gotcha-1 "exported DATABASE_URL trap". Let me neutralize it and re-seed correctly.
The trap is neutralized; DB seeded at the correct repo-root `db/custom.db` (checksum `e7f6c011` — canonical). Now let me read the PAD's key sections (§7 gate, deviations ledger) and CLAUDE.md's session-29 context.
I now have deep understanding of the project. Let me update my todo list and proceed with environment verification: baseline gate + scandihaven clone in parallel.
Unit: 190/190 ✓. Now start the build in background and review the scandihaven reference repo.
Let me check scandihaven's skills catalog and its SEO/JSON-LD patterns for reference.
Now let me check build progress and read the essential skills (tdd, code-review-and-audit, agent-browser, tailwind-patterns).
Build clean, smoke 124/124 ✓. Now run e2e in background and read the skills meanwhile.
The code-review-and-audit skill's native CLI fallback applies (lint/typecheck/test already green). Now let me audit the recent S29 code changes and validate alignment.
S29 seams all present. Now audit the configs (vitest/playwright), sitemap/SEO, and mobile nav component.
Configs all aligned. Now the mobile navigation component — the user's flagged focus area.
Navbar implements all documented protections (resize guard, Escape focus return, scroll lock). Let me check e2e progress and the audit tooling state.
The e2e run died with the shell. Let me restart it properly detached with setsid.
E2E running (15/240+). While it runs, let me do the security audit phase and check agent-browser availability.
Security audit clean (braces lint-toolchain residual is documented gotcha-9; DEV_SECRET is the documented dev fallback). Now let me boot a probe server and start the live-reference drift battery.
Probe server live on :3260. Now let me open the reference site with agent-browser and log in.
Live's "Dashboard" link → `/checkout` → 404 (the documented dead demo link). Let me probe the live's `/dashboard` directly.
Live `/dashboard` renders the SPA 404 — clone's dashboard remains the documented superset. Let me check e2e progress, then build the drift battery script.
E2E seems stalled at 15. Let me check for the documented zombie-server hazard on :3100.
The e2e process died again — but agent-browser survived. Let me check the probe server and use a double-fork script approach for e2e.
E2E now survives (66/240 and running). The probe server died too — let me restart it with the same double-fork pattern.
Probe server healthy. Now let me write the Session-30 drift battery script following the house pattern.
**Two significant findings**: (1) the manifest check FAILED (404), and (2) **the live reference now ships JSON-LD on every route** — it previously shipped none (documented D62/D113). The reference is a moving target (gotcha 7). Let me investigate both.
My battery probed the wrong manifest URL (`manifest.webmanifest` vs the actual `manifest.json`). Let me verify the clone's real manifest and extract the live's JSON-LD content.
**Major finding**: the live has been redeployed with an SEO layer — WebSite+Organization JSON-LD on every route plus BreadcrumbList on content routes. The D62/D113 "reference ships none" record is stale (gotcha 7 in action). Let me see the rest of the probe output.
The live's panel selector missed. Let me dump the live's nav DOM after the JS click to find the menu structure.
Mobile nav verified: live's open menu = 7 rows × 44px (Features/How It Works/Pricing/Testimonials/FAQ/Log In/Get Started) — **byte-identical to the clone's REAL-tap-opened panel; no Tailwind v4 bug**. Now let me capture the exact BreadcrumbList names on the live's remaining content routes.
All live data captured. **E2E shows 240 done** — let me verify the final gate result.
**Baseline gate: 554/554 ALL GREEN** — codebase fully aligned with docs. Now let me examine the dual-ceiling surfaces (F2) in the dashboard code before writing the plan.
The dual-ceiling boundary is precisely mapped: at 100 rows the list note is absent (`100 < 100` false), at 101 it renders — unpinned boundary. Let me check the /demo title, then write the remediation plan.
All data gathered. Now the pin-conflict scans before writing the plan — first, what the session29-jsonld spec currently pins.
Scans clean. Let me check the current mount points, then write the remediation plan.
Now I'll write the Session 30 remediation plan.
Plan saved. Now validating it against the codebase before execution — checking the layout structure and route metadata names.
Plan fully validated against the codebase. Now executing TDD — first the **RED phase**: unit pins for the new builders. Let me review the current test file style.
Now writing the RED-phase unit pins for the Session 30 builders.
**RED observed** (10 failed — structural, the builders don't exist). Now the GREEN phase: implementing the builders.
The @graph node lacks its own `@context` (the graph root carries it) while a standalone script needs one. Let me refine the agreement pin to compare the node minus the script-level `@context`.
Unit GREEN: 25/25 (+10 pins). Now the mounts — layout pair first.
Now the landing's SoftwareApplication mount and the breadcrumb mounts on the content routes.
Now the FAQ page (breadcrumb + FAQPage) and the four legal routes + demo.
All mounts in place. Now evolving the session29-jsonld spec to the parity mount structure with the new every-route/breadcrumb pins.
Let me fix a typo artifact I left in the spec (the bogus `crams` helper).
Now for R2 — the dual-ceiling spec. Let me study the session28 dedicated-user pattern first.
Let me check the dashboard's stat-card structure for exact locators before writing the spec.
All conventions gathered. Now writing the dual-ceiling boundary spec.
Now R3 — fix the battery's manifest URL, then run lint/typecheck/build.
That's the documented instrumentation warning (gotcha-32's static-import pattern), not a failure. Let me verify the build completed.
Build clean, 200/200 unit. Now restart the probe server with the NEW build and verify the mounts live.
Counts are off — the layout pair may not be rendering. Let me inspect the actual scripts on each route.
The probe server is serving the STALE build — the zombie-server gotcha again. Let me diagnose and clear it.
Counts look doubled — likely the RSC Flight payload embedding the type string. Let me count actual script tags properly.
Mounts are exactly right (3/4/3/2 — the doubled counts were my grep matching the RSC payload). Now run the new specs in isolation.
**All 7 new specs GREEN.** Now the full gate — smoke first, then complete e2e in background while re-running the drift battery.
**Drift battery FULLY GREEN** — parity 1.0000 ×8, mobile nav byte-identical, SEO clean, and the JSON-LD column now shows the clone at parity+superset vs the live. While e2e runs, let me check the screenshots inventory and rebuild the capture script.
**FULL GATE: 569 checks ALL GREEN** (200 unit + 124 smoke + 245 e2e — up from 554). Now the screenshot refresh.
20 shots refreshed, DB canonical. Let me verify the mobile dashboard shot captured correctly (it needed a session).
Now the VLM spot-checks on 5 key shots with contract-precise prompts (derived from pinned assertions).
3/4 — the (4) FAIL is my prompt's viewport assumption (the mockup sits below the fold in a 900px shot). Adjudicating against the full-page shot.
The full-shot VLM result is suspicious — let me check the image dimensions directly.
The shot IS full-height (7498px) — the VLM likely misread the downsampled tall image. Let me crop the pricing band and adjudicate with pixel evidence.
Content IS rendering (stdev 108 — rich). My band offsets were just wrong. Let me crop the correct bands.
The e2e suite pins the pricing section in the DOM (245/245), so this is a screenshot-capture issue — the `Reveal` entrance animations leave below-fold sections at opacity 0 without a scroll-through first. Let me verify and fix the capture.
Section map acquired — pricing is at y 4800-5826. Let me check whether the section shots (02-04) captured correctly, then fix the full-page capture with a scroll-through.
Section shots are blank too — the reveal isn't triggering. Let me examine the Reveal/motion implementation.
Found it: my rebuilt capture script doesn't settle after actions (sections captured mid-entrance) and fullPage capture never triggers below-fold IntersectionObservers. Let me fix the script.
Fixed and verified. Now the remaining VLM spot-checks (dashboard + mobile menu).
**VLM: 5/5 PASS.** Now the documentation phase. Let me look at the PAD's ledger tail and §11 to add the D115-D116 entries.
Now updating the PAD — revision block, ledger D115-D116, §7 counts, §7.2 suites, §11 key files.
Now the ledger D115-D116 rows and the §7 counts.
The ledger rows got mis-ordered (D113 was replaced instead of extended). Let me restore D113 and reorder properly.
Ledger correctly ordered now. Updating §7 counts, §7.2, §7.3, and §11.
Now updating §7.2's Playwright suite list tail and §11 key files.
Now §11 key files — updating the seo.ts row and adding the dual-ceiling spec row.
PAD complete. Now AGENTS.md — counts, invariant line, battery surfaces.
Now adding gotcha 44 and updating the invariant line in AGENTS.md.
Now adding gotcha 44 to AGENTS.md.
AGENTS.md done. Now CLAUDE.md — stack table counts and session context.
Now README.md — the badge, the JSON-LD row, and the verification block.
Let me update the README's SEO row for the Session 30 parity extension.
Now the SKILL.md version bump and lessons 68-69.
Now ticking the remediation plan's ToDo with measured results.
Now writing the formal session log — docs/session_60.md.
Now the worklog entry.
Worklog complete. Now the final pre-commit verification — .env.example sync, git status review, and the JSON-LD validity re-check.
All verifications green. Now staging and committing the Session 30 remediation.
Commit `f1df32a` created. Now let me read the SSH wrapper runbook and prepare the push.
I have the runbook. Let me check the environment (ssh shim, paramiko) and set up the key.
Paramiko works. Now deploying the ssh shim (Appendix A, with the bidirectional stdin pump) outside the repo.
**Fingerprint matches the S1–S29 record exactly.** Now the dry-run with the shim on PATH.
Dry-run confirms the fast-forward `09e89fc..f1df32a`. Executing the real push.
**PUSH VERIFIED — remote main @ `f1df32a` == local HEAD.** Now shredding the operator key and doing the independent verification.
Remote verified independently. Now the closing convention — recording the pushed hash and the closing commit.
All verified: both commits pushed (`f1df32a` + `002585c`), remote == local, tree clean, zero zombies, keys shredded. Let me update the workspace worklog and finalize.
**Session 30 complete — all 15 task-chain steps executed and pushed to `main`.**

## What happened this session

**The headline finding:** The live reference site **redeployed a structured-data layer** between sessions — it now ships JSON-LD on *every* route (WebSite + Organization pair) plus BreadcrumbLists on content routes. The old "reference ships none" record was stale (gotcha 7: the reference is a moving target). My rebuilt drift battery's new JSON-LD column caught it.

**The remediation (TDD: RED → GREEN, gate 554 → 569):**
- **D115 — JSON-LD parity + superset**: sitewide WebSite + Organization pair mounted once in the root layout, BreadcrumbLists on the 5 content routes + `/demo` (crumb names derive from each route's own metadata stem — content-as-code), while the S29 supersets stand (SoftwareApplication with PLANS-derived offers on the landing, FAQPage on /faq)
- **D116 — dual-ceiling boundary pins**: the 100/101-row edge (no list note at exactly 100; honest note + invisible oldest at 101; stats stay true across the cap)
- **Mobile nav verified**: clone's burger opens with a REAL tap, 7 rows × exactly 44px, byte-identical to the live — **no Tailwind v4 bug**

**Verified:** full gate 569/569 (200 unit + 124 smoke + 245 e2e) · word parity 1.0000 ×8 · 20 screenshots refreshed (with the fullPage blank-band fix, VLM 5/5) · all docs aligned (PAD, AGENTS gotcha 44, CLAUDE, README, SKILL v2.29.0, session log, worklogs) · commits `f1df32a` + `002585c` pushed via the SSH wrapper, both wrapper-verified, keys shredded.

**Suggested next:** the S31 candidates are recorded in `docs/session_60.md` (battery canonical/og column, the CHART_ROWS 8/9 note-transition edge, JSON-LD refinements once real profile URLs exist). You can re-run the full gate anytime: `npm run lint && npm run typecheck && npm run test && npm run build && ./scripts/smoke-test.sh && npm run test:e2e`.
