I'll start by reading the uploaded instructions file and checking the current workspace state.
The workspace has previous session artifacts. Let me check for the saas-company repo location and read the persisted instructions file.
The saas-company repo exists. Let me check its git status and read my worklog from the previous session.
工作区完好无损——Sessions 11–13 已完成（321 次检查通过，工作区干净，已与 origin 同步）。现在我将开始 Session 14 的周期。用户提到了 `docs/session_22.md`，这是新推送的 transcript。让我制定我的任务计划并拉取最新更改。
`session_22.md` fetched. Now reviewing all project and session docs.
Session 13's transcript is clear. Now reviewing the remaining project docs to internalize current state.
Now let me review the PAD's key sections (revision block, ledger, gate, known issues).
Docs are clear. Now verifying the codebase state, toolchain exclusions, and the remediation-plan-session13 checklist.
All docs internalized. The `DATABASE_URL` shell trap is live (must neutralize with `env -u DATABASE_URL`). Toolchain exclusions verified: `skills/` excluded from tsconfig/eslint/vitest/playwright. Now running the baseline gate.
**Baseline gate: ALL GREEN — 321 checks** (lint ✓ typecheck ✓ 94 unit ✓ build ✓ 47 smoke ✓ 180 e2e ✓). The codebase matches the documented state exactly.
Now the standing battery — drift check (word parity ×8 routes) and the mobile-nav paired probe. Checking persisted survey scripts first.
The scripts are reusable. First, kill any zombie server on :3000 (gotcha 26), then boot the fresh standalone build and run the paired drift check.
The CSS chunk check needs a closer look — verifying the chunk actually exists on disk.
CSS chunk matches disk — not a zombie server. Now running the paired drift check.
The sandbox killed the background server (known limitation). Restarting server + running drift check in the same Bash call.
**Drift check: word parity 1.0000 on ALL 8 routes — reference UNCHANGED.** Now the mobile-nav paired real-touch probe (the operator's standing ask, with Tailwind v4 vigilance).
**Standing battery complete**: word parity 1.0000 ×8 (reference unchanged), mobile nav byte-identical with real-touch (burger 342,16 24×24; panel 0,56 390×397; seven 44px rows; scroll-lock/Escape/resize guard all working; oklab bg rendering-identical) — **no Tailwind v4 bug**; live's burger remains pointer-blocked (D32).

Now identifying NEW audit surfaces. Let me examine candidate un-probed layers in the code.
Reduced-motion is handled in code (instant settle). Now checking the marketing-site forms — the newsletter and Book-a-Demo flows (Session 12 fault-injected only dashboard mutations; the marketing-tier forms are an un-probed surface).
The footer form upholds the catch contract in code. Now checking the Book-a-Demo flow and the hero CTA target.
**Candidate Finding #1: The `/api/demo` endpoint is dead code** — a fully-built API (validation, rate-limit, Prisma model) with zero UI consumers; the hero's "Book a Demo" anchors to `#pricing`. A half-shipped superset feature. Let me continue surveying for more gaps.
Dashboard mutation UX is now clear — errors have `role="alert"` banners, but successful mutations are silent (no aria-live). Let me probe the remaining candidates empirically: reduced-motion visibility, authenticated `/login` behavior, and focus-visible coverage.
**Probes complete.** Results:
- **P1 reduced-motion: CLEAN** (below-fold content visible at opacity 1 — pin-only candidate)
- **P2 FINDING: `/login` renders the login card to authenticated users** (no redirect to `/dashboard`)
- **P3 focus-visible: CLEAN** (violet ring on every interactive element)
- **P4 FINDING: ZERO aria-live regions on the dashboard** — successful mutations are silent for screen-reader users
- **Plus F1: `/api/demo` is dead code** (fully-built API, zero UI consumers)

Let me validate these findings against the code to design fixes.
The fix patterns are clear. Let me validate the remaining details: live-side `/demo` route existence (pure-superset confirmation), sitemap shape, and e2e specs that visit `/login` while authenticated.
All existing `/login` visits are in anonymous contexts — the F2 fix is compatible with the full battery. Now verifying the live's `/demo`-adjacent routes 404 (pure-superset confirmation) and the live's sitemap.
The live returns 200 for all paths (SPA shell behavior). Let me check what actually renders on the live's `/demo` — real content or the client-rendered 404.
The live's `/demo` serves the same SPA shell as a known-404 route — **`/demo` on the live is the 404 experience, so the clone's `/demo` page is pure superset.** Findings are finalized. Let me study the design patterns for the fixes (seo.ts API + the FAQ content-page design language).
All patterns studied. Let me check the validation helpers and the screenshots script before writing the remediation plan.
All reconnaissance complete. Writing the Session 14 remediation plan now.
Plan written and validated. Now executing **R1 TDD-first** — writing the RED spec before any implementation code.
R1 RED spec written. Now the R2 and R3 RED pins — first reviewing the existing dashboard spec structure.
Adding the R3 RED pins to dashboard.spec.ts and the R2 RED pin to auth.spec.ts.
Now observing RED — running the three new spec families against the current build (no implementation yet).
**RED observed perfectly** — 8 new pins all RED (F1: 404s; F2: no redirect; F3: no live region), 13 pre-existing pins GREEN. Now implementing GREEN. Starting with R1 — the `/demo` page.
Creating the demo view component and page.
R1 implementation complete. Now R2 — splitting the login page into a server gate + client card.
R2 complete. Now R3 — the dashboard's polite live region.
Now mounting the live region in the JSX.
All implementations done. Now R4 — the reduced-motion pin suite.
All remediation code written. Now verifying lint + typecheck, then rebuilding for the GREEN run.
Build clean — `/demo` static, `/login` now dynamic (session gate). Running the GREEN verification.
F2, F3, F4(a/c), sitemap GREEN. Diagnosing the demo.spec failures — checking the Navbar's structure (role=banner assumption) and the animation-duration serialization.
The Navbar is a `<nav>`, not a `<header>` — my banner assertion was wrong. Checking the other failures' details.
Two clear fixes needed: the footer's newsletter email also matches `getByLabel("Email")` (scope to `main`), and the banner assertion (Navbar is a `<nav>`). Let me also check the animation-duration serialization issue.
Surprising result — `animationName: "none"` under emulation. Let me verify the media emulation actually engages and compare normal-motion values.
The scroll dot reads `animationName: "none"` in BOTH modes — the class may be inert. Checking globals.css for the actual keyframe tokens.
The CSS looks correct but computed reads differ — let me see how the passing mockup-motion spec samples these loops.
The passing spec uses the same method — the difference must be my probe's target or server. Testing the exact element the passing spec uses, on my :3000 server.
All animations read dead on my :3000 server — even ones the suite pins green. Checking the e2e webServer config vs my standalone boot, then running the mockup spec against the current build.
The webServer runs the same command. Let me check the actual served CSS for the keyframes — maybe the compiled CSS is missing them.
The served CSS is missing the keyframes entirely. Checking the disk chunk — is this a build problem or a serving problem?
**ZOMBIE SERVER (gotcha 26)!** The disk chunk was deleted by my rebuild, but a stale pre-rebuild process still holds :3000 — my post-rebuild boot silently failed with EADDRINUSE, and probes hit the zombie serving dead CSS chunks. The Playwright e2e results are trustworthy (own server, current build). Killing the port and re-verifying.
The zombie (pid 13488) survived the kill race. Killing by PID and verifying properly.
Fresh server verified — chunk matches disk, keyframes present. Now probing the exact computed serialization under reduced motion.
Truth established: normal motion `4s`/`1.7s` ✓, reduced motion serializes the clamp as **`1e-05s`** (Chrome scientific notation — my `"0.01ms"` assertion was wrong). Fixing both spec issues now.
Now fixing the reduced-motion duration assertion (serialization-agnostic numeric comparison).
8/9 GREEN — (a)'s `getByLabel("Email")` still collides with the footer's newsletter label. Scoping (a) to main too.
**All R1–R4 GREEN.** Now extending the smoke suite with the `/demo` route pin, then running the full gate.
Now running the full gate — unit, then smoke, then the complete e2e suite.
**FULL GATE: ALL GREEN — 333 checks** (94 unit + 191 e2e + 48 smoke). Now the paired re-verification battery.
GREEN re-verification: G1/G2/G3 all pass, 8/9 routes console-clean. The `/nope-404` hit is the browser's automatic document-404 resource log — let me adjudicate it against the live (D68 parity family).
Live ships MORE 404-route noise (two 401s) — clone's single inherent document-log is live-parity-or-better (D68 family). Now re-running the standing drift + mobile-nav battery on the remediated build.
**Standing battery re-verified**: parity 1.0000 ×8, mobile nav byte-identical, no v4 bug. Now refreshing screenshots + adding the `/demo` evidence shot.
Adding the `/demo` evidence shot to the refresh script.
The screenshot script failed at the dashboard sign-in (line 116). Let me inspect what's there.
Found it — the script's section 14 re-signs-in via `/login` while still holding the session from section 08. With the R2 fix, `/login` now correctly redirects to `/dashboard` — the script must adapt (reuse the live session). Checking the mobile section too.
All 18 shots refreshed. The Session-13 error-boundary evidence shot also needs refreshing (code unchanged but let me regenerate for consistency). Checking how it was captured.
The boundary shot was captured inline in Session 13. Writing a small persisted recapture script.
File count jumped unexpectedly — checking the screenshots directory contents.
All 20 shots verified on disk. Now the VLM spot-check of the new and refreshed evidence shots.
VLM verdict: demo page PERFECT, dashboard control clean — but the boundary recapture shows the normal dashboard (my script didn't trigger the crash path). Checking the Session-13 e2e mechanism.
The trigger needs a Pause click (mutation → refresh → malformed GET → crash). Fixing the capture script.
All VLM checks pass. Phase 4 complete — now Phase 5 documentation. Starting with the PAD.
All PAD edit points located. Applying the Session 14 updates.
Now the ledger entries (D73–D75) and §11 key files.
PAD done (fixing the smoke page count too). Now AGENTS.md — gotcha 28 + counts.
AGENTS.md updated. Now CLAUDE.md.
CLAUDE.md done. Now README.md.
Now adding the Session 14 troubleshooting rows.
README done. Now the SKILL doc — v2.13.0 with lessons 36–37.
SKILL doc done. Now ticking the remediation plan checklist and writing the session log.
Now appending to the repo worklog.
All documentation updated. Now the final pre-commit verification layer.
Tree is exactly as expected — code, tests, docs, and screenshots; no `.env` or `db/*.db`. Final confirmation layer green. Committing now.
Committed. Now the SSH push per the runbook.
The runbook is clear (shim exists at `/home/z/my-project/bin/ssh`). Executing the push sequence — materializing the key, verifying the fingerprint, and dry-running.
Fingerprint matches (`3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU`). Dry-run push now.
Dry-run accepted (fast-forward `2184665..4f3672e`). Executing the real push.
Push verified (remote main @ `4f3672e` == local HEAD), key shredded, tree clean. Now recording the verified push in the worklog with a final docs commit.
Both commits pushed and verified. Finally, updating the workspace-level worklog.
**Session 14 complete — everything pushed and verified to `main`** (`4f3672e` + `f3ecd86`, wrapper-verified remote == local HEAD, keys shredded, tree clean).

**What this session did:**

The reference site was **unchanged** (word parity 1.0000 on all 8 routes; mobile menu re-verified byte-identical — **no Tailwind v4 bug**). Three new audit surfaces found and TDD-fixed three defects:

1. **Dead `/api/demo` endpoint** — a fully-built API (validation, rate-limit, DB model) with zero UI consumers. Now `/demo`: a first-class dark-brand Book-a-Demo page with the composer's fault contract, polite confirmation, and sitemap entry (live 404s `/demo`, so it's pure superset).
2. **Authenticated `/login` card** — signed-in visitors got the login form. Now a server gate redirects them to `/dashboard`.
3. **Silent dashboard successes** — zero aria-live regions meant screen-reader users got no mutation feedback. Now a polite WCAG 4.1.3 status region announces every pause/resume/delete/compose.

Gate raised **321 → 333 checks**; 20 screenshots refreshed (VLM-verified); one zombie-server recurrence caught by the chunk-against-disk discipline.

**Suggested next steps:** fresh-clone verify (`npm install && cp .env.example .env && npm run db:push && npm run db:seed && npm run dev`), try `/demo` and the signed-in `/login` redirect, or review `docs/remediation-plan-session14.md` for the full evidence trail.
