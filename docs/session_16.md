I'll continue the task from where we left off. Let me set up the task tracking and begin with refreshing the workspace.
The workspace has been reset. Let me clone the repositories and check the uploaded file.
仓库已克隆。现在我来审查仓库结构和关键文档。
Repo cloned. Task 1 done. Now let me review the root documentation files.
Now the README, Architecture doc, and SKILL doc:
Now let me read the current status docs — session_13, session_14, and the worklog:
session_14.md is the operator's transcript note for the Session-9 work (logged in session_13.md). Now the worklog and remediation plan:
I have the full session history. Let me check the HEAD commit and read the Session-9 remediation plan:
I now have a complete picture of the project history. Let me validate the codebase state against the documented Session-9 baseline:
Configs validated — vitest/playwright already wired correctly, `.env.example` tracked, `db/` at root. Now let me set up `.env`, neutralize the shell DATABASE_URL trap, and install dependencies:
The shell trap is live (exported absolute DATABASE_URL). I've unset it in this persistent session. Now installing dependencies:
The seed ran but I don't see `custom.db` in `db/`. Let me investigate:
The shell trap re-armed itself — each new Bash invocation re-sources the exported `DATABASE_URL`. Let me check its source:
The env is injected externally into every Bash call. Following AGENTS.md gotcha #1, I'll neutralize it per-command. Cleaning up the foreign DB and re-pushing correctly:
`db/custom.db` now correctly at repo root. Running the baseline gate (lint → typecheck → unit):
Unit: 92/92 ✓. Now the production build:
**BASELINE GATE: ALL GREEN — 284 checks** (92 unit + 150 e2e + 42 smoke). Codebase matches the documented Session-9 state exactly. Now reviewing the scandihaven reference repo and skills catalogs:
The catalogs are reviewed. Now let me check the Tailwind v4 mobile-nav references (the user's standing concern) and the TDD skill:
让我从战略上审查 PAD（工程单一事实源）：
Documentation review complete. I have full context: 9 prior sessions of parity work, 284-check gate green. Now a key observation — the user's brief emphasizes the **post-login dashboard** of the reference site. Session 1 noted "No dashboard exists on the live app" (the /checkout demo link 404s), but the user's brief says "After you log in, you'll see a dashboard". The live's **authenticated dashboard experience has never been surveyed for parity** — the clone's dashboard was built as a from-scratch superset. This is a prime new audit surface.

Let me set up the survey tooling and check the reference site:
Now let me start the paired survey. First, set up a named session and log into the live reference:
Live login page confirmed. Now logging in with the provided credentials:
After login, the live redirects to `/` (landing). Let me probe for the authenticated dashboard route:
The live's `/dashboard` is a 404 even authenticated. Let me inspect the reference dashboard image to understand what the user's brief describes:
The image is the **clone's** dashboard (from the repo's own screenshots — `demo@novaai.app`). Now let me examine what the LIVE actually shows post-login — checking navbar state and session behavior:
The live's landing shows NO session-state change after login. Let me probe other potential authenticated routes and the from_url flow:
Confirmed: **the live app has NO authenticated dashboard** — all routes 404 post-login, landing unchanged. The repo's `/dashboard` remains the designed superset (D1), and the user's reference image is the repo's own dashboard screenshot. This definitively settles the dashboard question.

Now let me set up this session's survey infrastructure — boot the clone server and run the drift check:
**DRIFT CHECK: reference UNCHANGED — 1.0000 on all 8 routes.** Now the standing mobile-nav paired verification plus the new Session-10 survey surfaces. First, the mobile nav + zoom/reflow probe:
Mobile nav behaviors verified (clone: tap-open ✓, scroll-lock ✓, Escape ✓, resize guard ✓; live: tap blocked — the known D32). The panel selector needs fixing for the geometry check. Let me also identify the `-bottom-16` overflow difference. First, check the navbar implementation:
Rich findings. Key deltas: (1) the hero mockup's bottom-glow parent differs (live: outer wrapper, clone: inside the card — different clipping at 320px), (2) the clone's pricing toggle carries `aria-pressed` (undocumented a11y superset), (3) testimonial strip + drag behavior identical. Let me investigate the glow-parent difference at 1440:
**Major finding** — the hero mockup's bottom glow renders differently: live = sibling of the card (unclipped, left-edge at parent center — the `-translate-x-1/2` appears INERT, opacity 0.36), clone = inside the card (clipped by overflow-hidden, centered, opacity 1). Let me dig deeper:
**FINDING F1 CHARACTERIZED — the hero mockup's bottom glow:**

Identical class strings both sides, but rendered completely differently:
- **Live**: sibling of the card (unclipped), framer-motion **pulsing opacity 0.31–0.49** + y-oscillation transform (which **kills the `-translate-x-1/2`** — left edge sits at parent center, extending past the card's right edge)
- **Clone**: inside the card (**clipped by overflow-hidden**), statically centered, opacity 1

Let me capture the visual evidence:
The VLM's clipping readout contradicts the computed styles — let me adjudicate with pixel-level evidence (brightness below the card's bottom edge):
**像素判定：**实况环境光（live glow）产生溢出**在卡片下方/右侧之外**（亮度 1.3–2.3 对比背景 0.0）—— 柔和、脉动、未裁剪；而克隆版（clone）在内部被硬裁剪（0.0 溢出，内部亮度 7.2）。VLM 之前搞反了图像 —— 计算出的样式 + 像素证据证实：**实况 = 未裁剪且脉动的兄弟元素；克隆版 = 裁剪且静态的子元素**。这就是本次会话的主要发现。

现在让我从实况的 bundle 中提取实况环境的 framer 动画配置：
**Live glow config extracted:** framer-motion `animate: { y: [0, -12, 0], opacity: [0.3, 0.5, 0.3] }, transition: { duration: 3, repeat: Infinity }`. The framer transform kills the tailwind translate — that's why the live renders uncentered. Now let me enumerate ALL looping framer animations in the live bundle to catch any others the clone misses:
More looping animations discovered. Let me identify each with its element context:
Bundle evidence shows the live's mockup has **pulsing red chrome dot, staggered list dots, and pulsing skeleton shapes** — contradicting the documented "static mockup" (gotcha 15). Let me verify the rendered truth on the live:
**F2 CONFIRMED — rendered truth:** the live's mockup ANIMATES (red dot scale 1.0→1.2, list dots pulsing, skeletons' opacity oscillating 0.3↔1.0) while the clone renders everything static. This falsifies gotcha 15's "static mockup" claim — the live's framer loops write inline styles invisible to CSS-property surveys. Let me run a comprehensive animation census of the whole mockup region:
该普查捕获了原型区域循环，但 `h-4/bg-white/20` 骨架屏脉冲作用域在别处（整页搜索）。让我定位每个循环元素的区域：
The pulsing skeletons live in the **dashboard-preview section** (y=1835), separate from the hero mockup. Let me run a full-page loop census on both sides, classifying loops vs entrances:
**DEFINITIVE CENSUS:** The live runs 12 looping animations; the clone implements only 4. **8 missing loop groups** (all framer-driven, invisible to CSS-property surveys): hero ambient glow, red chrome dot, 4 list dots, bottom glow + 4 dashboard-preview skeleton pulse groups. Plus the bottom glow's structural difference.

Now the remaining new surfaces — asset caching/compression headers and the clone dashboard's axe audit:
Asset-caching survey: clone's hashed chunks get immutable caching ✓, but `public/` assets (the 1.9MB hero video) ship `max-age=0` while the live's assets get 7-day CDN caching — a production gap. Now the dashboard axe audit:
The string-function evaluate isn't auto-invoked — needs IIFE form (learned earlier). Fixing:
Dashboard axe findings: 2 violations (`color-contrast` on `text-white/40` elements, missing `<h1>`) — superset quality gaps. Now let me verify the clone's dashboard-preview skeleton structure (do the elements exist at all?):
The hero mockup component is clear. The pulsing h-4/h-3/h-12/h-20 skeletons are in a DIFFERENT section (y=1835, `py-16 md:py-28 overflow-hidden`) — the "One Platform" showcase. Let me check:
The mini-dashboard skeletons exist in the clone (problem.tsx lines 131-139) — static. Now let me check for spec conflicts before planning remediation:
Specs checked — no hard conflicts (the "static parity" comment + palette `find()` need care). Let me dismiss the VLM's "gradient" observation on the mockup header bars, then verify the `translate-none` utility exists in v4:
`translate-none` exists in v4 ✓. The gradient check failed on module path — rerunning from the survey dir:
D6 oklab 已排除 ✓。调查已完成。在编写方案之前，让我先检查一下 `palette-spec` 的上下文和当前的仪表盘结构：
Palette spec is compatible. Let me check the globals.css animation token pattern before writing the plan:
The pattern is clear. Survey complete — now writing the remediation plan:
Now executing TDD — RED specs first. Let me check the e2e spec conventions:
Now writing the RED spec — `tests/e2e/mockup-motion-parity.spec.ts`:
Now the smoke RED addition for the cache headers:
Now observing RED against the current (pre-fix) build:
**RED observed: 14/14 failed** ✓. Now the GREEN implementations. First, the animation tokens + keyframes in globals.css:
Now the keyframes — adding them near the other keyframes (after scroll-dot):
Now the dashboard-preview.tsx changes (ambient, red dot, list dots, glow restructure):
Now the problem.tsx skeleton loops:
Now the dashboard a11y fixes (h1 + contrast):
Now the cache headers in next.config.ts:
All GREEN edits applied. Let me also correct the outdated "static parity" comment in landing.spec.ts:
Now rebuild and verify GREEN:
Typecheck errors in my spec — fixing the string-evaluate typing:
8/14 green. 6 failures — likely CSS-selector escaping in my evaluate strings. Let me inspect the failure details:
Double-escaping issue in nested evaluate strings. Let me fix with escape-free attribute selectors (the palette-parity pattern):
Some replacements missed due to escape-layer mismatches. Let me fix by line number directly:
Now let me fix the contrast test — checking its error and rewriting it robustly:
The computed color serializes in modern syntax (`color(srgb ... / a)`). Rewriting the assertion to parse alpha robustly:
**14/14 GREEN** ✓. Now the smoke suite with the new cache-header check:
**Smoke: 43/43** ✓ (the pre-fix survey measured `max-age=0` — the RED evidence). Now the full gate — unit + complete e2e:
One legacy failure — the Session-4 "zero animations" pin, now falsified by rendered evidence. Let me correct it to pin the new truth:
The glow (now a sibling inside the section) counts too — 7 animations. Fixing the expectation:
Now the complete gate re-run — full e2e suite:
**FULL GATE: ALL GREEN — 299 checks** (92 unit + 164 e2e + 43 smoke). Now Phase 4 — the paired re-verification. Restarting the survey server with the new build:
The survey server died between Bash calls. Let me restart it with proper detachment:
The sandbox kills detached processes per-call. Let me use the prior sessions' wrapper pattern (boot → probe → kill in one command):
**LOOP PARITY ACHIEVED: 12 = 12, element-for-element.** Now verifying the glow's rendered geometry matches the live:
**Glow geometry: EXACT parity** (x=720, right=1317, w=597, +149 past card right — byte-identical; the 61/64 belowParent delta is just the y-oscillation phase). Now VLM spot checks + pixel adjudication on the remediated mockup:
**VLM: IDENTICAL** ✓. Pixel bleed now matches (both sides bleed softly). Quick VLM check of the One-Platform showcase, then the standard screenshot refresh:
**VLM: IDENTICAL** on both surfaces. Re-verification complete. Now refreshing the 17 standard screenshots:
All 17 shots refreshed. Quick verification of the mobile-menu shot (standing ask) and the dashboard:
Mobile menu verified ✓. Now Phase 5 — documentation alignment. Starting with the PAD revision block and ledger:
Now I'll prepend the Session-10 revision entry:
Now the ledger rows D57–D62 in §5.4:
Now trap 16 in §5.5, the §7 counts, and §11 key files:
Now the §7 counts, §11 key files, and the "Last Updated" date:
PAD done. Now AGENTS.md — rewriting gotcha 15 and updating counts:
Now CLAUDE.md — session-10 context + counts:
Now README.md — badge counts and testing rows:
Now the SKILL doc — version bump + lessons 28–29:
Now the session log — docs/session_15.md:
Now updating the repo worklog.md with the Session-10 entries:
Now updating the workspace-level worklog, then running the final gate on the exact tree:
One flaky failure in the palette spec (passed in the earlier full run). Re-running that spec:
**FINAL GATE: ALL GREEN — 299 checks.** Now reviewing the tree before commit:
Tree is clean — only expected changes. Committing:
Committed `05d08f0`. Now the SSH push — reviewing the runbook and setting up the wrapper:
Environment reset — need to deploy the paramiko shim. Reading Appendix A:
Deploying the shim and installing paramiko:
Python version mismatch — pip targets 3.13 while python3 is 3.12. Installing for the right interpreter:
Paramiko 5.0.0 installed. Now materializing the operator key (0600, outside the repo) and verifying the fingerprint:
Fingerprint matches all prior sessions ✓. Dry-run now:
The wrapper defaulted to its legacy remote — pointing it at saas-company:
Dry-run passed — fast-forward `694cd7f..05d08f0` accepted. Real push:
**PUSH VERIFIED** — remote main @ `05d08f0` == local HEAD. Shredding the key and recording the push:
All pushes verified — remote main @ `ba9fe50` == local HEAD, tree clean, keys shredded. Final cleanup:
**Session 10 complete — everything pushed and verified on `main`** (`05d08f0` + `ba9fe50`, remote confirmed via independent ls-remote, keys shredded, tree clean).

**What I did:** After confirming the reference was unchanged (word parity 1.0000 on all 8 routes), I ran **six new survey surfaces** no prior session covered. The headline: **the live's mockup is NOT static — it runs 12 looping animations, and the clone shipped only 4**. framer-motion writes inline styles per frame, so the CSS-property census behind Session 4's "static mockup" verdict could never see them (found via multi-round value sampling + bundle config extraction). Fixed with **7 measured `--animate-*` keyframe tokens** — plus the under-glow restructured to the live's unclipped, un-centered sibling geometry (byte-identical), the dashboard's first axe audit fixed (h1 + AA contrast), CDN-grade asset caching, and the operator's dashboard question settled definitively (the live has no authenticated experience). Final gate: **299/299 checks, loop census 12 = 12, VLM IDENTICAL** on both changed surfaces.

**Suggested next steps:**
1. Fresh-clone check: `npm install && cp .env.example .env && npm run db:push && npm run db:seed && npm run dev` — the hero mockup now pulses like the live
2. If the live redeploys, re-run the drift check before touching chrome
3. Standing follow-ups remain: Google OAuth wiring and containerized CI (PAD §10)
