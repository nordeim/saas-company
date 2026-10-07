# Worklog — saas-company clone build

---
Task ID: 1
Agent: Super Z (main)
Task: Recon the reference site https://saas-company.base44.app/ and both GitHub repos (saas-company scaffold + scandihaven foundation)

Work Log:
- Read uploaded operating instructions (coding specialist contract: plan→implement→verify, root-cause fixes, evidence-backed claims, never weaken gates).
- Cloned `saas-company` (target root; scaffold has configs/docs/skills/tests but NO src app code — the ORBITAL docs+tests describe the PREVIOUS live app) and `scandihaven` (foundation reference: Next 16.3/React 19/Tailwind v4 CSS-first/Vitest/Playwright conventions).
- Key discovery: the live app at saas-company.base44.app has been REDEPLOYED as a completely different product — a dark-themed SaaS marketing site for "NovaAI" ("SAAS Company" title). The repo's ORBITAL specs/tests (v2.x, 115 e2e checks) target the OLD app. Decision (best-recommendation authority granted by user): build the clone of the CURRENT live site; replace stale ORBITAL tests/docs with new ones (user explicitly asked to re-create AGENTS/CLAUDE/README/PAD for the new codebase and to add vitest+playwright suites).
- Surveyed live site with agent-browser (login worked with provided credentials): routes = `/` (landing), `/login`, `/faq`, `/privacy`, `/terms`, `/accessibility`, `/refund-policy`, SPA 404 for everything else (incl. `/checkout` — the demo "Dashboard" link is dead). No dashboard exists on the live app.
- Extracted ground truth: full-page text of every page, rendered HTML dumps (reference-shots/html-*.txt), design tokens from compiled CSS (dark theme: bg #000, card hsl(0 0% 6%), border hsl(0 0% 14%), primary hsl(290 100% 50%) = #D500FF, accent hsl(220 100% 50%), violet #D500FF; fonts = "Vend Sans" = Wix Madefor Display/Text self-hosted woff2 — downloaded both latin files), hero video mp4 (downloaded, 1.9MB), inline keyframes (organic-gradient, border-shimmer, marquee, logo-ns/ew/sn/we, gradientShift, float, pulse-glow, wave-flow, lens-flare).
- Mobile nav (user's focus) measured at 390×844: fixed nav h56 z-50, logo left x24 w90, burger right w24 (lucide-menu→x), open = dropdown panel `md:hidden bg-black/95 backdrop-blur-xl border-b border-white/5` with `px-6 py-4 flex flex-col gap-2` rows 342×44 text-white/70 14px (Features, How It Works, Pricing, Testimonials, FAQ, Log In, Get Started pill).
- VLM-analyzed landing screenshot for section-by-section visual spec.
- Saved per-section HTML in /home/z/my-project/reference-shots/section-*.html (0 hero, 1 dashboard mockup, 2 logos marquee, 3 problem+platform, 4 features tabs [WHITE bg section], 5 how-it-works, 6 pricing, 7 testimonials marquee, 8 CTA, 9 footer).

Stage Summary:
- Target: single Next.js 16 App Router app (repo scaffold stack: React 19, TS strict, Tailwind v4 CSS-first, Prisma+SQLite at db/custom.db, cookie-session auth scrypt+HMAC, vitest+playwright) cloning the CURRENT NovaAI marketing site, plus a functional SUPERSET (working auth, newsletter, a real /dashboard workspace replacing the live's dead /checkout link, SEO/sitemap/robots, health endpoint).
- All reference assets under /home/z/my-project/reference-shots/ + fonts/video already staged into saas-company/src/fonts + public/media.
- Next: build foundation (Task 2).

---
Task ID: 2
Agent: Super Z (main)
Task: Build the complete SAAS Company clone (foundation, all pages, API, superset dashboard, tests, docs, screenshots)

Work Log:
- Foundation: package.json (node-compatible scripts, tsx), next.config.ts (removed ORBITAL SPA rewrites, devIndicators off, standalone), prisma/schema.prisma (User/Subscriber/DemoRequest/Workflow), idempotent seed (demo@novaai.app/Demo1234! + 6 workflows), .env with DATABASE_URL="file:../db/custom.db" + db/ at repo root.
- Fixed the exported-DATABASE_URL env trap (shell-exported absolute var overrides .env for CLI+runtime — unset it; scripts pin their own values, preserving the repo's documented v2.14 discipline). Verified DB resolves to <repo>/db/custom.db for CLI + runtime (db-path.ts contract test passes).
- Design system: globals.css with Tailwind v4 CSS-first @theme tokens measured from the live compiled CSS (#000 bg, #0f0f0f card, #242424 border, #d500ff primary, #008cff accent), self-hosted "Vend Sans" (downloaded Wix Madefor woff2 cuts), all measured custom classes/keyframes (workflows-gradient-text, border-shimmer, anim-logo petals, marquee, float, pulse-glow, skeleton-wave, accordion), base rules (button cursor, heading tracking .02em, reduced-motion).
- Components: exact-SVG logo (paths extracted from live), navbar with glass pill + measured mobile burger dropdown (bg-black/95 blur, 44px rows, Get Started pill), footer with working newsletter form, Reveal (IntersectionObserver; set-state-in-effect lint rule satisfied via timeout fallback).
- Landing: hero (video, shimmer badge SVG, gradient H1 with blend/brightness, Book a Demo), dashboard-preview (browser-chrome animated skeleton, 12-bar chart), logo-cloud (8 measured client wordmarks incl. serif fonts + Gasparyan svg), problem + One Platform showcase (mini dashboard links to REAL /dashboard), features (white section, 3 tabs), how-it-works, pricing (Monthly/Annual toggle, 20% discount, Most Popular), testimonials (drag strip ×8), CTA.
- Pages: /login (reference auth card: 3 states, Google parity-degrade, ?from_url), /faq (verbatim 6-Q accordion), 4 legal pages (verbatim Wix-template copy extracted w/ entity unescaping into lib/legal-content.ts), not-found (slate 404), sitemap.ts, robots.ts, favicon.svg (brand petals).
- Superset dashboard: session-gated /dashboard with stats cards, AI workflow composer (z-ai-web-dev-sdk + deterministic template fallback, sanitized), workflow list (pause/resume/delete), runs chart; API: auth×4 (register signs in immediately), workflows CRUD + generate, newsletter (upsert, rate-limited), demo, health. Security: scrypt+HMAC cookies, per-IP fixed-window rate limits, full input validation, LLM sanitizer.
- Tests: 69 Vitest unit checks (pricing, rate-limit, validation, workflow, auth, content integrity, db-path) + 36 Playwright e2e (landing, mobile-navigation focus, auth, dashboard, pages) + 38-check smoke suite. All green: lint ✓ typecheck ✓ 69/69 ✓ build ✓ 36/36 ✓ 38/38 ✓.
- Parity loop (agent-browser + VLM): hero compare 90% → fixed dev-indicator overlay; full-page compare 96% → fixed Custom/month caption, mockup circles, features tiles; mobile menu compare 95% → fixed Get Started arrow icon. Documented oklab vs rgba serialization as accepted engine artifact (D6).
- Screenshots: 12 shots in docs/screenshots/ (desktop sections, login, FAQ, dashboard, mobile hero/menu/dashboard, 404) + docs/saas-company-dashboard.png (the dashboard image the user's brief referenced).
- Docs rewritten per repo skills: AGENTS.md (commands+gotchas incl. env trap), CLAUDE.md (conventions+principles), README.md (badges/features/stack/quickstart/API/design/testing), Project_Architecture_Document.md v1.0 (9 ADRs, 12 sections, deviations/superset ledger), DEPLOYMENT.md. Removed stale ORBITAL artifacts (v25-v30 specs, ORBITAL scripts, project-management_SKILL.md, old dashboard png).

Stage Summary:
- Complete production-ready clone of the CURRENT saas-company.base44.app (NovaAI marketing site) + functional superset (auth, workflow dashboard w/ AI composer, capture forms, SEO).
- Gate: lint ✓ · typecheck ✓ · Vitest 69/69 ✓ · build ✓ · Playwright 36/36 ✓ · smoke 38/38 ✓.
- VLM parity: hero ~90→fixed, full-page 96%, mobile menu 95%→arrow fixed. Remaining deltas are video-frame timing + documented oklab serialization (rendering-identical).
- Next: commit + push via SSH wrapper (Task 3).

---
Task ID: 3
Agent: Super Z (main)
Task: Git commit + SSH push to git@github.com:nordeim/saas-company.git

Work Log:
- Deployed the paramiko ssh shim (runbook Appendix A, /home/z/my-project/bin/ssh — outside the repo) since the sandbox has no OpenSSH binary; paramiko 5.0.0 installed.
- Operator key materialized to a 0600 file in /tmp (never inside the repo), fingerprint verified (ssh-ed25519, SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU).
- Wrapper dry-run: auth OK, remote main @ 5aea9ab, fast-forward to 8a9582b accepted.
- Real push via docs/ssh_git_wrapper_v3.py: pushed HEAD:refs/heads/main, wrapper verified remote @ 8a9582b == local HEAD, tracking ref synced.
- Operator key + wrapper temp key shredded; dev server stopped; test artifacts cleaned.

Stage Summary:
- Commit 8a9582b ":art: feat: rebuild as the NovaAI marketing-site clone + functional superset" pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 116 files changed, +14,600/−5,285.
- Complete deliverable set in the pushed tree: full app source, Prisma schema+seed, 69 unit + 36 e2e + 38 smoke checks, AGENTS.md/CLAUDE.md/README.md/PAD, DEPLOYMENT.md, 12 screenshots + docs/saas-company-dashboard.png, Tailwind v4 trap report.
- Task complete.

---
Task ID: 4
Agent: Super Z (main, session 2)
Task: Audit the remediated codebase against the live reference; remediate all parity + dependency gaps; re-verify; document; push

Work Log:
- Internalized the operator's coding-specialist contract (plan->implement->verify, root-cause fixes, evidence labels, never weaken gates); refreshed the workspace with git pull (brought in docs/session_1.md, docs/ssh.py, worklog.md @ 7a62618).
- Validated AGENTS/CLAUDE/README/PAD against the codebase: structure, configs (skills/ excluded from all four toolchains), .env DATABASE_URL="file:../db/custom.db" with db/ at repo root, .env.example tracked, 143-check gate all green on the inherited tree.
- Re-surveyed the live reference: UNCHANGED since Session 1 (headings 22/22, links 22/22 identical; /dashboard + /checkout still SPA-404; mobile menu geometry byte-identical: panel class/rect 0,56,390x397, 7 rows 44px). All findings were clone-side gaps.
- Parity audit (DOM difflib + VLM): accessibility page 0.9072 (missing the 8-item commitment list + 4-item coordinator list; extra caption), login 0.9153 (extra back-link; live has zero anchors), privacy/terms/refund 1.0, FAQ answers verified. VLM: full-page 98, mobile menu 95->98, hero 95. Found mid-remediation (VLM re-runs + live DOM): features card diverged per tab (extra SOC2/Alerts badges vs the reference's right-aligned caption; generic template instead of the 12-bar chart + stat chips; instead of the numbered builder steps) + blanket CheckCircle2 icons vs the reference's per-tab lucide icons.
- Dependency audit: npm audit 11 vulns (2 critical). Fixed: vitest 3.2.7->5.0.3 (tinypool/@vitest/mocker chain resolved); prisma restored to 6.19.3 after npm audit fix wrongly downgraded to 6.12.0; overrides added for braces/micromatch/fast-glob/deepmerge-ts. Residual: braces GHSA-vfj7-8cjw-p6xm (no patched version exists upstream; lint-only) — accepted + documented (F10); npm audit fix --force REJECTED (would downgrade eslint-config-next 16->14).
- Remediation (all TDD, RED observed first): R1 accessibility content (content.test.ts pins first, then legal-content.ts + legal-page-view.tsx: lists + disclaimer:null rule); R2 login back-link removed (e2e zero-anchors pin first; live DOM check saved the &nbsp; spacer from wrongful deletion); R3 scroll-dot motion (e2e class pin; globals.css @theme token + keyframe; animate-bounce replaced); R4-R6 dependencies as above; R11 features card rebuilt per tab from the live DOM (ANALYTICS_BARS with exact heights 30-95% + per-bar violet gradients; stat chips 2,847/12.4%/$84.2K; numbered builder steps + pulsing Pipeline Active; per-tab check icons zap+shield / chart-column+clock / workflow+zap).
- Re-verification: page parity -> accessibility 1.0, login 1.0 (both perfect); VLM full-page 98, mobile menu 98, features 95, hero 95. Gate re-locked: lint + typecheck + Vitest 73/73 + build + smoke 38/38 + Playwright 41/41 = 152 checks. npm audit: only the accepted braces advisory.
- Docs: remediation plan saved (docs/remediation-plan-session2.md, findings F1-F10 + R1-R11); README badges/counts/troubleshooting; AGENTS commands + new gotcha #9 (dependency overrides); CLAUDE stack + Session 2 note; PAD revision (D9/D10 ledger rows, 152-check gate, braces known-issue); saas-company_SKILL.md created at the repo root per the distill skills; 13 screenshots refreshed in docs/screenshots/ (incl. new 13-accessibility; dashboard + mobile dashboard recaptured after a scripted-login fix).
- .env.example verified in sync (no new env vars introduced); included in the commit.

Stage Summary:
- The clone is now a verified visual + functional superset of the live reference: every page at 1.0 word parity (FAQ accordion-DOM artifact aside), VLM >=95 on every compared surface, 152 green checks across three test layers.
- Root causes fixed, never gate-weakened: one rejected downgrade (eslint-config-next), one restored downgrade (prisma), overrides for the rest.
- Next: commit + push (Task 5).

---
Task ID: 5
Agent: Super Z (main, session 2)
Task: Final commit + SSH push of the remediated codebase

Work Log:
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified (ssh-ed25519, SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1 record).
- Paramiko shim on PATH (workspace bin/ssh; no OpenSSH binary in this sandbox). Wrapper dry-run: auth OK, remote main @ 7a62618, fast-forward 7a62618..640807f accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ 640807f == local HEAD, tracking ref synced. Key shredded (both the wrapper's temp copy and the /tmp original); working tree clean.

Stage Summary:
- Commit 640807f pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 31 files changed, +1,583/-690: full parity remediation, deps hardened, 152-check gate green, docs + skill + 13 screenshots, remediation plan.
- Task complete.

---
Task ID: 6
Agent: Super Z (main, session 3)
Task: Session 3 audit → remediation → re-verification → docs → push (token-level parity)

Work Log:
- Refreshed the workspace (git pull to e35a248); reviewed AGENTS/CLAUDE/README/PAD/saas-company_SKILL + docs/session_2.md + docs/remediation-plan-session2.md + worklog; validated alignment against the codebase (configs exclude skills/; .env DATABASE_URL="file:../db/custom.db" with db/ at the repo root; .env.example tracked and in sync).
- Baseline gate on the inherited tree: ALL GREEN — lint ✓ typecheck ✓ Vitest 73/73 ✓ build ✓ smoke 38/38 ✓ Playwright 41/41 ✓ (152 checks).
- Neutralized the shell's exported DATABASE_URL trap for the session (per the AGENTS.md discipline).
- Re-surveyed the live reference (agent-browser, 1440/900 + 390/844): UNCHANGED since Session 2 (headings 22/22, links 22/22, mobile-menu geometry byte-identical: panel 0,56,390x397, 7 rows @44px; /checkout still SPA-404 — the /dashboard superset D1 remains valid). Logged in with the operator credentials to confirm the post-login state (lands on /; same chrome).
- Paired parity audit (DOM difflib + computed-style probes + VLM + direct reads of the live's compiled CSS /assets/index-*.css): 11 findings, all clone-side (F1-F11 in docs/remediation-plan-session3.md). HEADLINE: the brand tokens were WRONG since Session 1 — the live ships :root AND .dark token blocks and never mounts .dark; Session 1 read .dark. :root renders: primary = hsl(267 100% 57%) = #8624ff (NOT the 290° magenta), accent/electric-blue = hsl(220 100% 50%) = #0055ff (NOT #008cff). Also: --font-body resolved "Vend Sans Text" while the live renders the Display cut for EVERY element (Book a Demo pill 197px vs 190px); curly vs straight quotes on testimonials + the AI-suggestion card; "on-premise" vs "on-prem"; page titles (FAQ had none; others used long names + em-dash instead of the live's "X | SAAS Company"); the 404 card not quoting the pathname; no Lenis (live runs 1.3.23, defaults, html.lenis); missing noscript (login shell only on the live); missing apple-mobile-web-app-title; stale ORBITAL comment in vitest.config.ts.
- VLM flags verified in the DOM before acting (the repo's lesson #4): mobile-menu "different radius/thinner X/narrower indicator" flags were misreads or oklab artifacts (rects identical); mockup "duller bars" flag at score 85 was disproven by a computed-style probe (exact rgb matches on every surface); testimonial "different text" flag disproven by 1.0 word parity (marquee scroll-position artifact).
- Remediation (TDD — RED observed first: 11/13 new checks failing): new tests/e2e/brand-parity.spec.ts (13 checks: gradient stops via an oklab→sRGB converter, font chain, straight quotes, on-prem, five page titles, 404 pathname span, Lenis poll, login-only noscript, apple-web-app-title) written FIRST, then the fixes: globals.css tokens (primary #8624ff, accent/electric-blue #0055ff, violet #d500ff unchanged; font-body Display-first), testimonials/features/pricing single-template literals (straight quotes, "Save 20%" byte-clean HTML), not-found.tsx pathname quoting (leading slash stripped — live omits it), layout title template "%s | SAAS Company" + per-page short titles (FAQ split into a server page + client FaqView), lenis@^1.3 + smooth-scroll.tsx wrapper (autoRaf, reduced-motion guarded), login-only noscript, appleWebApp meta, vitest.config.ts comment.
- Two RED-spec corrections during GREEN: the gradient pin needed an oklab→rgb converter (v4 serializes alpha colors through oklab — D6) and 3-digit hex expansion (#0055ff serializes as #05f); the Lenis pin needed expect.poll (it mounts in a client effect — a cold-boot race).
- Re-verification: page parity 1.0000 on EVERY page with zero text diffs (login/privacy/terms/accessibility/refund-policy/notfound/landing; FAQ's 0.61 is the known collapsed-accordion DOM artifact); mobile-menu geometry still byte-identical; color surfaces DOM-verified exact (bar gradient rgb(134,36,255)→rgb(0,85,255) both sides); VLM full-page 94-96, mobile menu 95 (remaining flags = video-frame/animation timing, DOM-disproven); gate re-locked at 165 checks (73 unit + 54 e2e + 38 smoke, all green); npm audit unchanged (the accepted braces chain — verified the overrides still hold: braces 3.0.3/micromatch 4.0.8/fast-glob 3.3.3/deepmerge-ts 8.0.2).
- Docs: remediation plan saved (docs/remediation-plan-session3.md, F1-F11 + R1-R10 with pre-execution codebase validation); README (badges/counts/tokens/stack+lenis), AGENTS (counts + gotcha #11 the :root/.dark token trap), CLAUDE (stack/session-3 note), PAD (revision block, §1.2 stack, §5.2 tokens, §5.4 ledger D11-D14, §7 counts, §11 key files), saas-company_SKILL.md v2.2.0 (tokens, lessons 8-11); 13 screenshots refreshed + docs/saas-company-dashboard.png; .env.example re-verified (no new vars).

Stage Summary:
- The clone's brand system now matches the RENDERED reference exactly (tokens, type, quotes, titles, 404, scroll feel) — every page at 1.0 word parity; 165 green checks.
- Root cause documented for posterity: measure RENDERED computed styles, not stylesheet text blocks that may never mount.
- Next: commit + SSH push (Task 7).

---
Task ID: 7
Agent: Super Z (main, session 3)
Task: Final commit + SSH push of the Session 3 remediation

Work Log:
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified (ssh-ed25519, SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1/2 records).
- Paramiko shim on PATH (workspace bin/ssh). Wrapper dry-run: auth OK, remote main @ e35a248, fast-forward e35a248..b6103ff accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ b6103ff == local HEAD, tracking ref synced. Operator key shredded; working tree clean.

Stage Summary:
- Commit b6103ff pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 38 files changed, +720/-127: brand-token restoration + 8 more parity fixes, 13-check brand-parity e2e suite (gate: 165 checks), remediation plan, refreshed screenshots, docs + SKILL v2.2.0.
- Task complete.

---
Task ID: 8
Agent: Super Z (main, session 4)
Task: Session 4 audit → remediation → re-verification → docs → push (behavior-level parity)

Work Log:
- git pull to 612424e (docs/session_3.md added by operator); reviewed all root docs + session docs; baseline gate 165/165 green.
- Live re-survey: reference UNCHANGED since Session 3 (text similarity 1.0000 on all 8 routes); mobile-menu geometry byte-identical; /checkout still 404; logged in with the operator credentials (post-login nav unchanged).
- NEW audit surface (previous sessions only inspected chrome at rest): deep computed-style probes of 13 surface groups + the FIRST scroll-state navbar survey + the live's /login css bundle diff (static/index-Dqfc36mx.css) + both pricing-toggle states driven on the live.
- Findings F1-F6: (F1) /login keeps the dark body theme on the clone — the live's login route loads its own LIGHT css bundle (white bg, zinc-950, system font); typed input text rendered near-invisible WHITE through the inherited --color-card-foreground; (F2) pricing inverted — the live DEFAULTS TO ANNUAL (Pro $49 monthly / $39 annual); the clone shipped monthly-default $39/$31 + a "billed annually" caption the live never renders + a 4px-wider Annual pill (JSX whitespace); (F3) the navbar's scrolled-glass bar (bg-black/80) is an INVENTION — the live nav is bg-transparent at every scroll depth and is section-aware (scroll-spy pills white/30|black/15 + light-mode chrome swap over the white features section); (F4) the mockup's unlayered .skeleton-wave OVERRIDES the layered bg-primary/80 utility (near-invisible dots) + invented grow-in animations (the live mockup is fully static); (F5) the FAQ accordion doesn't animate and keeps closed panels in the DOM (the live uses Radix keyframes + unmounts closed content — the root of the 0.6052 word-parity artifact); (F6) apple-mobile-web-app-status-bar-style default vs the live's black.
- Non-findings dismissed with DOM evidence: mobile menu byte-identical; Get Started pill identical at 768/1440 (earlier delta was font-load timing); One Platform mockup byte-identical; chart bars same source percentages (the live randomizes per load — D20); "15+ vs 10+ hours" VLM misread; footer present; scroll-dot container identical (the 7px dotY delta = animation phase); Pro-card colors D6-identical (oklab spelling); login card spacing root-caused to v4 space-y losing margins on INLINE labels (restored via the route style — label→input gap 10px, card 746px like the live; residual +27px card height documented as accepted D19 font-cut sub-pixel accumulation).
- TDD remediation (every pin observed RED before its GREEN): 13 new e2e checks + 1 new spec file (navbar-behavior) + rewritten pricing unit pins (49/39 + /month both states). R1 login route theme (route-scoped style: light body + light --color-* vars + v3-style space-y inside forms); R2 pricing truth (monthlyPrice 49, default annual, no-whitespace pill, caption /month); R3 section-aware navbar (scroll-spy at the 2/3 viewport line with no-link fallback, [data-nav-theme=light] band-overlap detection, scrolled bar removed); R4 static mockup (skeleton-wave + grown mechanism deleted, dots solid purple); R5 Radix-style accordion (measured keyframes in @theme, --radix-accordion-content-height via ref, unmount-after-close); R6 statusBarStyle black.
- Debugging saga: my component rewrite "normalized" the slash-spelled arbitrary aspect ratio into the colon spelling → invalid aspect-ratio:16:9 CSS → opaque postcss "Missed semicolon" at a flattened column. Two aggravators: turbopack CACHED the broken transform (error persisted after the fix), and Tailwind's scanner reads class candidates from MARKDOWN — writing the colon spelling into the docs re-broke the build even after the component was fixed (docs/ is now @source not-ed). Root causes logged as PAD §5.5 traps 6-8 + SKILL lessons 15-16.
- Re-verified: word parity 1.0000 on EVERY page (FAQ artifact CLOSED); mobile menu byte-identical; navbar scroll map matches the live at all 6 probe positions (logo fill + active section); VLM full 92 / login 95 (was 90 pre-fix) / pricing 97 / mobile 98 — remaining flags all dismissed with DOM evidence; npm audit unchanged (5 accepted braces-chain highs).
- Docs: remediation plan (docs/remediation-plan-session4.md, F1-F6 → R1-R8 with pre-execution validation); README (features/counts 178); AGENTS (gotchas 12-15); CLAUDE (session-4 context); PAD (revision block, ledger D15-D20, §5.5 traps 6-8); saas-company_SKILL.md v2.3.0 (§5 components, §12 lessons 12-16); 13 screenshots refreshed; .env.example re-verified (no new vars).

Stage Summary:
- The clone now matches the reference's BEHAVIOR, not just its pixels at rest: correct pricing model, section-aware navbar, animated accordion with live-identical DOM, light-theme login with visible input text, static mockup. Word parity 1.0000 everywhere; gate re-locked at 179 checks (73 unit + 68 e2e + 38 smoke).
- Root causes documented for posterity: survey interactive chrome in its interactive states; read the ACTIVE toggle state; unlayered CSS beats layered utilities; arbitrary aspect ratios use the SLASH form; rm -rf .next when a CSS error outlives its fix.
- FINAL root cause of the recurring CSS build break: Tailwind v4's scanner reads class candidates from MARKDOWN — writing the colon-spelled aspect ratio into AGENTS.md/PAD/SKILL re-broke the build even after the component was fixed. Fixed BOTH ways: docs reworded to avoid the literal token + globals.css now @source not-excludes docs/, skills/, tests/, scripts/ and all *.md (never class sources).
- Next: commit + SSH push (Task 9).
