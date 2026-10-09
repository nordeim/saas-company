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

---
Task ID: 9
Agent: Super Z (main, session 4)
Task: Final commit + SSH push of the Session 4 remediation

Work Log:
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified (ssh-ed25519, SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1/2/3 records).
- Paramiko shim on PATH (workspace bin/ssh). Wrapper dry-run: auth OK, remote main @ 612424e, fast-forward 612424e..5f4293f accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ 5f4293f == local HEAD, tracking ref synced. Operator key shredded; working tree clean.

Stage Summary:
- Commit 5f4293f pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 29 files changed, +1070/-159: the six Session-4 behavior-parity fixes (login light theme, pricing truth, section-aware navbar, static mockup, animated accordion, status-bar-style), 14 new e2e checks (gate: 179 = 73 unit + 68 e2e + 38 smoke), the @source-not scanner guard, remediation plan, refreshed screenshots, docs + SKILL v2.3.0.
- Session 4 complete.

---
Task ID: 10
Agent: Super Z (main, session 5)
Task: Session 5 audit → remediation → re-verification → docs → push (font + interactive-state parity)

Work Log:
- git pull to de18717 (docs/session_4.md added by operator); reviewed all root docs + session docs; baseline gate 179/179 green (lint ✓ typecheck ✓ Vitest 73/73 ✓ build ✓ smoke 38/38 ✓ Playwright 68/68 ✓).
- Live re-survey: reference UNCHANGED since Session 4 (text similarity 1.0000 on all 8 routes); mobile-menu geometry byte-identical; operator credentials still valid (post-login lands on /, Dashboard → /checkout still SPA-404 — the D1 superset remains valid).
- NEW audit surface (never surveyed in Sessions 1-4): the login card's alternate modes driven NATIVELY on the live (sign-up / forgot / wrong-password error / password mismatch / reset-success — earlier eval-based fills silently submitted empty React forms; lesson 19), keyboard-focus computed styles, the pricing toggle at 390, the testimonials strip container, the newsletter form's browser validation, the mobile menu's navigate-on-click, and a font-forensics pass (performance resource entries + document.fonts + canvas measureText + fontTools name tables).
- Findings F1-F5: (F1) THE UI TYPEFACE WAS THE WRONG FONT — the live renders GOOGLE FONTS' "Vend Sans" variable font (wght 300-700, fonts.gstatic.com/s/vendsans/v1/…), not the Wix Madefor files Session 1 self-hosted (the Wix faces exist only in the live's unused login-bundle css); +2.4% glyph width (canvas "Annual" @14px: 44.31 live vs 45.37 clone) was the root cause of the pricing-pill deltas, the D19 Pro-card +27px, and the testimonials scrollWidth delta; (F2) the login card's alternate states diverge structurally (live: back-button+h2+form, NO logo/Google/divider, Email+Password("Min. 8 characters")+Confirm("Re-enter password"), shadcn alert banners BETWEEN field and submit, "Invalid email or password"/"Passwords do not match"/the green check-your-email view; clone had one shared layout with a Name field and post-submit error text); (F3) the focus ring is the live's universal `*{outline-color:hsl(var(--ring)/.5)}` violet/50 tint on the UA default ring (the clone's `:focus-visible{outline:2px solid primary}` was an invention); (F4) the live's mobile-menu anchor click does NOT scroll (live bug) — the clone's scroll kept as intentional superset; (F5) invisible a11y supersets kept (autocomplete attrs, burger aria).
- TDD remediation (every pin observed RED before GREEN): R1 the authentic font swap (src/fonts/vend-sans-latin[-ext].woff2 = the gstatic bytes; @font-face weight 300 700; font chains `"Vend Sans", sans-serif` like the live's :root; the Wix files deleted) — section offsets now match the live EXACTLY (3323/4179/4800/5826 at 1440; identical at 1280/390); R2 the login alternate states rebuilt (per-mode layouts + classes measured from the live; AlertBanner component; register API name now optional — falls back to the email local-part; login error copy "Invalid email or password"; the auth-stack route-style rules restore the v3-style space-y where the back button's -mb-2 cancels v4's preceding-sibling margin; the login h1-h6 inherit the system font like the live's bundle; card heights now EXACT: 746/470/374); R3 the focus-ring base rule (universal border-color + outline-color violet/50, the invented :focus-visible rule deleted); plus the audit's follow-on fixes: the Pro card's inert scale utilities removed (the live's markup carries them but its css never emits them — 540×1.05 was the exact 567px D19 delta) and the testimonials strip made full-bleed (px-6 pb-4 removed; scrollWidth 2408 like the live).
- Spec maintenance: the S4 navbar scroll-spy pin recalibrated 5200→4900 (the authentic font moved the sections to the live's true offsets — at 5200 the active section is Testimonials on BOTH sides, verified on the live); auth.spec pins rewritten to the live truth (error copy, confirm-password flow, reset-success view).
- Re-verified: word parity 1.0000 on EVERY page; pricing toggle EXACT (Annual 161 / Monthly 92 / wrap 275 at 1440 AND 390); Pro card 540 `scale:none`; testimonials sw 2408 pad 0 x 0; focus ring `auto rgba(213,0,255,0.5)`; mobile menu byte-identical; VLM full 97 / login 100 / signup 100 / pricing 100 / mobile 98 (remaining flags all dismissed with DOM evidence — logo SVG byte-identical, marquee position artifacts); npm audit unchanged (5 accepted braces-chain highs).
- Docs: remediation plan (docs/remediation-plan-session5.md, F1-F5 → R1-R4 with pre-execution validation); README (fonts/counts/192); AGENTS (gotchas 5-6 rewritten + 13 extended); CLAUDE (session-5 context, stack); PAD (revision block, §1.2, §5.1, ledger D19 RESOLVED + D21-D25, traps 8-10, §9 counts, glossary); saas-company_SKILL.md v2.4.0 (§2, §12 lessons 16-19); 18 screenshots refreshed (4 NEW login-state shots); .env.example re-verified (no new env vars).

Stage Summary:
- The clone now renders the reference's ACTUAL typeface — the single highest-leverage parity fix of all five sessions: pill widths, card heights, section offsets, and the strip metrics all match the live EXACTLY (D19 closed after being "accepted" in Session 4).
- The auth card's every interactive state (sign-up / forgot / error / reset-success) is now structurally faithful, with the functional supersets (real register/login APIs, honest no-mail notice) preserved and documented.
- Gate re-locked at 192 checks (73 unit + 81 e2e + 38 smoke); VLM 97/100/100/100/98.
- Root causes documented for posterity: trace a font's BYTES not its name (check() lies, performance entries don't); the reference ships inert classes — match rendered computed styles; eval-based React fills silently submit empty forms.
- Next: commit + SSH push (Task 11).

---
Task ID: 11
Agent: Super Z (main, session 5)
Task: Final commit + SSH push of the Session 5 remediation

Work Log:
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified (ssh-ed25519, SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1/2/3/4 records).
- Paramiko shim on PATH (workspace bin/ssh). Wrapper dry-run: auth OK, remote main @ f2e388a (the operator's session-log commit), fast-forward f2e388a..dfa4e65 accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ dfa4e65 == local HEAD, tracking ref synced. Operator key + pub shredded; working tree clean.

Stage Summary:
- Commit dfa4e65 pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 39 files changed: the five Session-5 parity fixes (the authentic Google Vend Sans font, the login alternate states, the focus ring, the inert-scale removal [D19 closed], the full-bleed testimonials strip), 13 new e2e checks (gate: 192 = 73 unit + 81 e2e + 38 smoke), the remediation plan + session log, 18 screenshots (4 new login states), docs + SKILL v2.4.0.
- Session 5 complete.

---
Task ID: 12
Agent: Super Z (main, session 7)
Task: Session 6 audit → remediation → re-verification → docs → push (class-string + head parity)

Work Log:
- Workspace re-cloned (the prior workspace had been reset); tree clean at 0503ad9; root docs + session_5/6 + remediation-plan-session5 + worklog reviewed; the shell's exported absolute DATABASE_URL neutralized for every command (the AGENTS.md discipline).
- Baseline gate on the inherited tree: ALL GREEN — lint ✓ typecheck ✓ Vitest 73/73 ✓ build ✓ smoke 38/38 ✓ Playwright 81/81 ✓ (192 checks). The codebase matched the documented Session-5 state exactly.
- Live re-survey: reference UNCHANGED since Session 5 (text similarity 1.0000 on all 8 routes); operator credentials still valid (post-login lands on /, Dashboard → /checkout still SPA-404 — the D1 superset remains valid); mobile-menu open-state geometry byte-identical (0,56 390×397, 7 rows @44px, black/95 + blur 24).
- NEW audit surface #1 — the CLASS-STRING LAYER (no prior session diffed it): full-DOM skeleton extraction (tag + class + key attrs) of the landing page, live vs clone, then diff. Found FOUR rendered divergences five sessions of computed-style spot probes missed: (F1) the testimonial avatars — the live cycles FOUR per-person gradients (SC violet→purple-600, MR electric-blue→blue-600, EW purple-500→violet, DP blue-500→electric-blue; cards 5-8 repeat) while the clone rendered ALL as violet→purple-600; (F2) the Enterprise "Custom" price — live: a plain div.font-heading.text-3xl (30px/36px); clone: the numeric-price markup (span.text-5xl in a flex wrapper, 48px/48px); (F3) the testimonial edge fades — the clone's directions SWAPPED (bg-gradient-to-l left / to-r right: no darkening at the actual edges, a hard cut 64-128px inside); (F4) the AI-suggestion paragraph — the live's own class is a broken inert token (text-sl(var(--foreground))]) so it INHERITS full white; the clone shipped text-white/50.
- NEW audit surface #2 — the per-route HEAD map (all 8 live routes): the live ships per-route og:title (= the page title), description = "X on SAAS Company. {default}" on the five content routes (default on / and /login), og:url = twitter:url = canonical = the route, a web app manifest, and og:image + twitter:image — a 1200×630 four-petal render whose URL 404s (a dead media object). The clone had static root og:title, the default description everywhere, NO og:url/canonical/image/manifest, and TWO invented metas (theme-color, viewport-fit). (F5)
- NEW audit surface #3 — REAL-POINTER hover probes: agent-browser's mouse move reported the Get Started pill's hover BROKEN (:hover matched, no utility applied) — a FALSE negative; Playwright's real page.mouse.move proved full hover parity (shimmer overlay opacity 1 + the exact pastel gradient + gradientShift 6s; the arrow slides exactly 2px — v3 transform:matrix vs v4 translate:2px, rendering-identical). Lesson recorded: hover probes need real pointer events. (F7's cleanups came from the same DOM diff: the pill's invented group-hover:text-black, the burger's invented transition-colors, the mockup link's dead overlay span.)
- NEW audit surface #4 — the burger's REAL clickability at 390: the LIVE's mobile menu is UNOPENABLE by a real tap — its own empty toast portal (fixed top-0 z-[100], 390×32, pointer-events auto) covers the nav's top strip and blocks the burger (a real Playwright click opens nothing; only a JS .click() opens it). The clone's burger works and opens the byte-identical panel — kept as the intended UX (new ledger entry D32, the D21 class).
- Non-findings dismissed with DOM evidence: 390 pricing stack (342px @ x24 ×3), hero h1 44px/-0.88px, strip x0 + scrollWidth 2408, flogo/logo keyframes byte-identical in the live's CSS, anchor/CTA inventory identical (except D1/D22), reduced-motion comparable, CTA h2 tracking computed-identical (class strings differ — inert), the live's video muted via JS property (attribute absent, behavior identical).
- TDD remediation (every pin observed RED first: 16 e2e + the seo unit suite against the pre-fix tree): R1 per-person avatar gradient fields (the live's exact class strings in strip order); R2 the Enterprise null-price branch renders the live's plain 30px DIV; R3 the fades un-swapped (to-r left / to-l right); R4 the AI-suggestion paragraph to the rendered truth (text-white); R5 the head pattern — new src/lib/seo.ts (pageDescription/pageTitle/routeMetadata, 7 unit checks) + per-page exports + login/layout.tsx (the client page's server metadata home) + public/manifest.json (the live's values, self-hosted) + public/og-image.png (a generated 1200×630 brand card — the working replacement for the live's dead URL) + the invented theme-color/viewport-fit removed (twitter:url is not expressible through Next's metadata API — documented engine deviation); R6 the body stripped to the live's bare element (no classes, -webkit-font-smoothing auto); R7 the three class-string cleanups.
- Spec corrections during GREEN: the avatar selector scoped to the 280px cards (12 gradient circles exist on the page); the head spec asserts canonical/og:url PATH structure (prerendered pages bake metadataBase at build time — the origin is config, the structure is the parity claim). Also hit the Session-5 EADDRINUSE trap during the paired re-verification (a stale server kept serving the OLD build — killed by PID and re-booted before believing any verification numbers).
- Re-verified: word parity 1.0000 on all 8 routes; avatars four-distinct with the live's exact colors (lab/oklab spelling = D6); fades to right/to left like the live; Custom DIV 30px/36; AI-suggestion full white; body bare + auto; pill/burger class strings exact; head structurally exact per route; VLM pricing 99 / testimonials 99 / full 98 — every remaining flag dismissed with DOM evidence (the live's randomized feature-bar width rendered 0px in the capture = the D20 class; the "FEATURES label" + footer-icon flags were misreads).
- Docs: remediation plan (docs/remediation-plan-session6.md, F1-F7 + L1-L3 → R1-R8 with pre-execution validation); README (215 badge, the SEO feature row, counts); AGENTS (gotchas 16-18); CLAUDE (session-6 context, stack counts); PAD (revision block, ledger D26-D32, §7 counts, §11 key files); saas-company_SKILL.md v2.5.0 (lessons 20-21); 17 screenshots refreshed; .env.example re-verified (no new env vars — all changes are code/assets); this session log (docs/session_7.md).

Stage Summary:
- The clone's last-known rendered divergences closed: the avatars, the Custom price, the edge fades, and the AI-suggestion color now match the live exactly, and the head carries the live's full per-route pattern PLUS a working og:image and manifest the live itself cannot serve (its URLs are dead).
- The mobile-menu question the operator keeps asking is now answered with evidence BOTH ways: the clone's burger works (real tap, byte-identical panel), and the LIVE's is pointer-blocked by its own toast portal — the clone is the intended UX (D32).
- Gate re-locked at 215 checks (80 unit + 97 e2e + 38 smoke); VLM 99/99/98; word parity 1.0000 everywhere.
- Root causes documented for posterity: diff the class-string layer (computed-style spot probes only answer the questions you thought to ask); hover parity claims need real pointer events (agent-browser mouse move can report false negatives); v3 transform:matrix vs v4 translate render the same 2px through different properties.
- Next: commit + SSH push (Task 13).

---
Task ID: 13
Agent: Super Z (main, session 7)
Task: Final commit + SSH push of the Session 6 remediation

Work Log:
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified (ssh-ed25519, SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1/2/3/4/5 records).
- Paramiko shim on PATH (workspace bin/ssh, outside the checkout per runbook rule 5). Wrapper dry-run: auth OK, remote main @ 0503ad9 (the operator's session-log commit), fast-forward 0503ad9..bb8d38f accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ bb8d38f == local HEAD, tracking ref synced. Operator key shredded; working tree clean.

Stage Summary:
- Commit bb8d38f pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 40 files changed, +994/-57: the seven Session-6 parity fixes (the four per-person avatar gradients, the Enterprise Custom 30px DIV, the un-swapped edge fades, the full-white AI-suggestion paragraph, the per-route head pattern + working og-image + manifest, the bare body, the three class-string cleanups), 23 new checks (gate: 215 = 80 unit + 97 e2e + 38 smoke), the remediation plan + session log, 17 refreshed screenshots, docs + SKILL v2.5.0.
- Session 6 complete.

---
Task ID: 14
Agent: Super Z (main, session 9)
Task: Session 7 parity audit + remediation (typography layer, asset inventory, keyboard/axe, edge viewports, mobile-menu resize robustness)

Work Log:
- Workspace refreshed (git pull 21826c2..248ab06 — the operator's session_8.md note); root + session docs reviewed; scandihaven patterns re-checked; the shell's exported absolute DATABASE_URL neutralized for every command (the AGENTS.md trap was live in this shell). Sandbox kills background servers — every paired survey ran through a boot→probe→kill wrapper pinning its own DATABASE_URL.
- Baseline gate ALL GREEN (215 = 80 unit + 97 e2e + 38 smoke) — the codebase matched the documented Session-6 state exactly.
- Drift check: reference UNCHANGED since Session 6 — word parity 1.0000 on all 8 routes.
- Operator standing asks re-verified: the live's burger is STILL pointer-blocked by its toast portal (real click times out — D32); post-login still lands on / with unchanged chrome (all dashboard-ish routes SPA-404); docs/saas-company-dashboard.png VLM-verified as the CLONE's own seeded dashboard (the superset the image documents).
- NEW audit surface #1 — full asset/network inventory: hero video md5-IDENTICAL, Gasparyan SVG byte-identical, the live's favicon URL DEAD (storage 404, the og:image class), the live's login apple-touch-icon also dead; document.fonts census showed DM Serif Display loaded on the live but unused on the clone.
- NEW audit surface #2 — the TYPOGRAPHY layer (computed letter-spacing + first-resolved font-family of every element): (F1) the live's SPA bundle DOUBLES the tracking scale (tracking-wider 0.1em, tracking-widest 0.2em — every eyebrow here rendered at HALF the live's tracking for six sessions; class strings identical, only the scale values differ); (F2) the live's login bundle keeps the STANDARD scale (its "or" divider = 0.6px); (F3) the live's three serif wordmarks carry INLINE font-families — Thrune renders DM SERIF DISPLAY, the clone rendered all three Playfair-first; (F4) the Testimonials H2 tracking-tight (−1.2px) vs tracking-normal; (F5) the Gasparyan alt="Logo" vs "Gasparyan logo".
- NEW audit surface #3 — keyboard + axe: 22-step Tab walk IDENTICAL both sides, focus ring violet/50 everywhere; axe-core: the clone's only unique flag = the star rows' bare aria-label on role-less divs (F6); the live's critical flags (unnamed buttons/links, 103 landmark-less nodes) are supersets here; contrast/scrollable-region flags fire on BOTH sides (parity).
- NEW audit surface #4 — edge viewports + resize-while-open: geometry exact at 1920/320; the mobile menu byte-identical at 320–767 (rows/hrefs/blur, Escape/X/navigate all close) BUT (F7) resizing 390→1200 with the menu open left the page scroll-locked (panel mounted-but-hidden + body overflow:hidden until Escape) — fixed with a matchMedia close-on-md listener; the live locks nothing when its menu is open (our lock documented as D39 superset). (F8) no apple-touch-icon here — the working self-hosted one is the D30-class superset (the live's URL is dead).
- Also dismissed with evidence: the badge shimmer (SVG SMIL gradients structurally identical), the live's dead keyframes (lens-flare, .animate-wave-flow), the live's <style>-in-H1 textContent artifact.
- TDD remediation (17 e2e pins observed RED first, then GREEN): R1 @theme tracking overrides + the login route's --tracking-wider: 0.05em pin; R2 the wordmark inline font-families (font-serif dropped — class parity too); R3 tracking-tight on the Testimonials H2; R4 alt="Logo"; R5 role="img" + aria-hidden stars; R6 the navbar matchMedia resize guard; R7 metadata.icons.apple. Build lesson: backticks inside a template-literal <style> comment break the JSX parse (TS1381).
- Re-verified: word parity 1.0000 all 8 routes; the typography diff 14 → 7 (all remaining = text-matcher false positives, live eyebrows vs clone nav pills); VLM hero 100 / pricing 99 (logo-cloud flags dismissed with DOM evidence — all logos/steps/cards exist on both sides); 17 screenshots refreshed.
- Docs: remediation plan (docs/remediation-plan-session7.md, F1–F8 + L1–L4 → R1–R8 with pre-execution validation); PAD (revision block, ledger D33–D40, §5.5 traps 11–12, §7 counts, §11 key files); AGENTS (gotchas 19–20); CLAUDE (session-7 context, counts); README (227 badge, typography row, counts); saas-company_SKILL.md v2.6.0 (lessons 22–23); session log (docs/session_9.md); .env.example re-verified (no new env vars).

Stage Summary:
- The clone's typography now matches the live exactly: every eyebrow renders the live's doubled tracking (with the login route's standard-scale exception reproduced), Thrune wears DM Serif Display, the Testimonials H2 carries tracking-tight, and the Gasparyan alt is verbatim.
- The mobile menu is robust across the resize/rotate boundary (the operator's standing mobile-nav concern closed with both evidence and a fix), the star ratings carry valid ARIA, and a working apple-touch-icon ships app-wide (the live's own URL is dead).
- Byte-verified clean: the hero video and Gasparyan SVG are identical to the live's; the live's favicon/og-image/apple-touch URLs are all dead (our working assets are the supersets).
- Gate re-locked at 227 checks (80 unit + 109 e2e + 38 smoke); VLM hero 100 / pricing 99; word parity 1.0000 everywhere.
- Root causes documented for posterity: survey the TYPOGRAPHY layer (config-level scale overrides + inline font-families are invisible to class-string diffs and word parity); breakpoint-mounted chrome needs a resize guard; asset inventories catch dead-URL drift.
- Next: final gate on the exact tree + commit + SSH push (Task 15).

---
Task ID: 15
Agent: Super Z (main, session 9)
Task: Final commit + SSH push of the Session 7 remediation

Work Log:
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified (ssh-ed25519, SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1-7 records).
- Paramiko shim on PATH (workspace bin/ssh, outside the checkout per runbook rule 5). Wrapper dry-run: auth OK, remote main @ 248ab06, fast-forward 248ab06..4b7b480 accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ 4b7b480 == local HEAD, tracking ref synced. Operator key shredded; working tree clean.

Stage Summary:
- Commit 4b7b480 pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 30 files changed: the eight Session-7 parity fixes (the doubled tracking scale + login pin, the DM Serif Thrune wordmark, the Testimonials H2 tracking-tight, the Gasparyan alt, the valid star ARIA, the mobile-menu resize guard, the working apple-touch-icon), 12 new e2e checks (gate: 227 = 80 unit + 109 e2e + 38 smoke), the remediation plan + session log, refreshed screenshots, docs + SKILL v2.6.0.
- Session 7 complete.

---
Task ID: 16
Agent: Super Z (main, session 11)
Task: Session 8 parity audit + remediation (the motion layer, line-height cascade, shadow/focus tokens, login focus chrome, class cleanups)

Work Log:
- Workspace refreshed (git pull 8a9e043..04c69ed — the operator's session_10.md transcript note); root + session docs reviewed; the shell's exported absolute DATABASE_URL neutralized for every command (the AGENTS.md trap was live in this shell).
- Baseline gate ALL GREEN (227 = 80 unit + 109 e2e + 38 smoke) — the codebase matched the documented Session-7 state exactly.
- Drift check: reference UNCHANGED — word parity 1.0000 on all 8 routes.
- NEW audit surface #1 — THE MOTION LAYER (computed transition/animation of every animated element, live vs clone + MutationObserver entrance traces + per-frame opacity sampling + live-bundle config extraction + bezier fitting): (F1) the live's entrances are framer-motion rAF (per-frame inline opacity/transform, easeOut cubic-bezier(0,0,0.58,1) — fit MAE 0.014, per-element y/duration/stagger, settled "opacity: 1; transform: none;"); the clone's CSS-transition Reveal SNAPPED entrances on transition-colors children (the property-list cascade) and corrupted every card's hover to 0.7s + stagger delays + will-change residue; (F1-MISS) the testimonial cards, mockup, hero mount trio, legal pages, /faq items were never animated; (F1-EXTRA) the logo-cloud container, One-Platform chips, whole-CTA block were invented animations.
- NEW surface #2 — the line-height cascade (140 text elements): the v3/v4 INVERSION (v3's responsive text-* beats leading-* through media-query rule order; v4's --tw-leading always wins) — three rendered diffs (hero subtitle 24→26px, features H3 40→45px, CTA span 60→75px); static text+leading pairs verified matching.
- NEW surface #3 — the shadow scale: v4 renamed the small shadows (v3 shadow-sm → v4 shadow-xs) — the Sign in button rendered one step bigger.
- NEW surface #4 — the login focus chrome: the global violet outline rule doesn't exist in the live's login bundle; the buttons/inputs lack focus-visible:ring-ring (--ring 240 10% 3.9%); the Google-icon wrapper is a SPAN vs the live's DIV.
- NEW surface #5 — geometry 640/1024 + pseudo-elements: IDENTICAL / none both sides.
- The LOGO surprise (pixel evidence mid-remediation): the live's nav logo swaps a REACT-DRIVEN PATH FILL attribute (white→black) over the white features section while its anchor stays bare with color: white — the Session-4 spec had pinned the wrong property (svg .color); also the floating chevron is framer-driven (y:[0,-15,0], 4s — was 6s/-12px) and the pricing CTA disabled:* utilities are PER-PLAN (Free+Pro yes, Enterprise no).
- TDD remediation (12 unit + 21 e2e pins observed RED, then GREEN): R1 src/lib/motion.ts + the rAF-driven Reveal rewrite + the parameter table + entrance additions/removals; R2 --shadow-sm; R3 the .transition-colors property-list override; R4 the three --tw-leading:initial pins; R5 the login --ring + outline neutralization + ring-ring classes + wrapper DIV; R6 the chevron muted-foreground (#a3a3a3); R7 the logo anchor/pill class cleanups + the path-fill swap + per-plan CTA utilities; R8 the float keyframes + anim-flogo-* names.
- Re-verified: word parity 1.0000 all 8 routes; the motion diff 78→17 (all remaining = documented classes or the KEEP-v4 transition-transform engine note); the clone's entrance ramp 412→1024ms vs the live's 415→1034ms; VLM hero/CTA IDENTICAL, features clean after the logo fix (one scroll-spy capture-timing flag dismissed with the suite pins); 17 screenshots refreshed.
- Docs: remediation plan (docs/remediation-plan-session8.md), PAD (revision, ledger D41–D48, §5.3, traps 13–14, counts, key files), AGENTS (gotchas 21–22), CLAUDE (session-8 context), README (266 badge), SKILL v2.7.0 (lessons 24–25), session log (docs/session_11.md), .env.example re-verified.

Stage Summary:
- The clone's entrance system now reproduces the reference's framer-motion engine dependency-free (rAF per-frame inline writes, the measured easing, the per-element parameter table) — entrances animate where the live animates, stay static where the live is static, and every card keeps its own clean hover timing.
- Three v4 engine shifts pinned to v3 values (shadow-sm, the transition-colors list, the line-height cascade), the login focus chrome matched, the logo's light-mode swap re-mechanized to the live's path-fill truth, and the class-string cleanups landed (bare logo anchor, verbatim Log In order, per-plan CTA utilities, flogo petal names).
- Gate re-locked at 266 checks (92 unit + 136 e2e + 38 smoke); VLM hero/CTA IDENTICAL; word parity 1.0000 everywhere.
- Root causes documented for posterity: survey the MOTION layer (the engine that drives entrance animation, not just the transition classes — a CSS approximation of an rAF engine breaks on cascade conflicts); an element's computed .color can lie about its rendering (the live's logo swaps path fill attributes); v4's engine shifts come in families (tracking scale → shadow rename → property lists → cascade inversions — audit the whole utility engine once one is found).
- Next: final gate on the exact tree + commit + SSH push (Task 17).

---
Task ID: 17
Agent: Super Z (main, session 11)
Task: Final commit + SSH push of the Session 8 remediation

Work Log:
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified (ssh-ed25519, SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1-7 records).
- Paramiko shim on PATH (workspace bin/ssh, outside the checkout per runbook rule 5). Wrapper dry-run: auth OK, fast-forward 04c69ed..01072c6 accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ 01072c6 == local HEAD, tracking ref synced. Operator key shredded; working tree clean; remote main re-confirmed at 01072c6 via an independent ls-remote.

Stage Summary:
- Commit 01072c6 pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 43 files changed (+551/−143): the rAF entrance-system rebuild (src/lib/motion.ts + the Reveal rewrite + the per-element parameter table + the entrance additions/removals), the three v4 engine-shift pins (shadow-sm, transition-colors list, the line-height cascade), the login focus chrome, the logo path-fill swap re-mechanization, the chevron/float/flogo/petal fixes, the per-plan CTA utilities, 39 new checks (gate: 266 = 92 unit + 136 e2e + 38 smoke), the remediation plan + session log, 17 refreshed screenshots, docs + SKILL v2.7.0.
- Session 8 complete.

---
Task ID: 18
Agent: Super Z (main, session 13)
Task: Session 9 parity audit + remediation (the rendered palette, the ring emission path, browser-chrome layer, ARIA tree, HTTP headers)

Work Log:
- Workspace refreshed (git pull fbbec41..e598a51 — the operator's session_12.md transcript note); root + session docs reviewed; the shell's exported absolute DATABASE_URL neutralized for every command (the AGENTS.md trap was live in this shell).
- Baseline gate ALL GREEN (266 = 92 unit + 136 e2e + 38 smoke) — the codebase matched the documented Session-8 state exactly.
- Drift check: reference UNCHANGED — word parity 1.0000 on all 8 routes.
- NEW audit surface #1 — THE INTERACTIVE-STATE MATRIX (default/hover/active of every visible interactive element + a keyboard focus walk, real pointer events): landing clean except the palette values; the login walk exposed the ring divergence.
- NEW surface #2 — THE RENDERED PALETTE (the headline): v4's default palette is OKLCH-DEFINED (theme.css) and the oklch→sRGB roundtrip renders up to 69 RGB units off the v3 hex the live's compiled css carries (green-400 rgb(5,223,114) vs #4ade80; red-500/700, purple-600/blue-600 avatar endpoints, yellow-400 stars, 7 slates, 5 grays, amber/orange/greens) — 30 used tokens drift, 7 exact. Conversion math cross-verified against the live's measured rgb (slate-700 predicted + measured rgb(49,65,88) on the clone vs the live's rgb(51,65,85)).
- NEW surface #3 — THE RING EMISSION PATH: the live's keyboard-focused Sign in renders white offset + slate-950 ring; the clone rendered white (currentColor) — Session 8's --ring variable left v4's ring-ring utility un-emitted (--color-ring never in @theme); the motion-parity spec had pinned the class + the variable, not the rendered ring.
- NEW surface #4 — THE BROWSER-CHROME LAYER: the clone's violet ::selection rule is an INVENTION (the live ships none); the live's /login pins html overscroll-behavior-y none; scrollbars/cursors/color-scheme/tap-highlight all matched.
- NEW surface #5 — form/media attributes: video/form/button attributes identical; the clone's aria-labels are supersets.
- NEW surface #6 — THE ARIA SNAPSHOT TREE (first structured survey): the clone's superset family measured (named nav, labeled logo, main landmark, aria-hidden icons, aria-pressed tabs, newsletter labels, the Next route announcer) and the live's noise (its "Notifications alt+T" toast region; its mobile menu does NOT close on Escape).
- NEW surface #7 — the :root var inventory: 0 value diffs on /; login-only inert/spelling entries (the live's --ease-out has no consumer; px- vs rem-spelled radius render identical).
- NEW surface #8 — HTTP headers: the live ships four security headers the standalone server lacked.
- Mobile nav paired re-verification (the standing ask): the panel byte-identical (0,56 390×396, six rows @44px, same hrefs), the burger identical with NO transition classes on either side (no v4 trap), the resize guard closes across 768, real-tap opens the clone (the live's tap stays blocked, D32).
- TDD remediation (13 e2e + 4 smoke pins observed RED, then GREEN): R1 the 31 @theme palette pins + the palette-parity suite; R2 --color-ring + the input:focus:focus-visible cascade nudge (v4 emits ring-ring after ring-slate-400, flipping the live's order on the inputs); R3 the ::selection removal; R4 the login overscroll pin; R5 the login --color-border pin (inert); R6 the four security headers via next.config.ts + 4 smoke checks. Build lesson re-learned: backticks inside the login route's template-literal <style> comment break the JSX parse.
- Re-verified: word parity 1.0000 all 8 routes; the previously-drifted values now byte-match (reds/greens/grays/stars/login slates); VLM problem/testimonials/login IDENTICAL; the mobile-menu shot verified open; 17 screenshots refreshed.
- Docs: remediation plan (docs/remediation-plan-session9.md), PAD (revision, ledger D49–D56, §5.5 trap 15, counts, key files), AGENTS (gotcha 23, counts), CLAUDE (session-9 context), README (284 badge, new rows), SKILL v2.8.0 (lessons 26–27), session log (docs/session_13.md), .env.example re-verified.

Stage Summary:
- The clone's default palette now renders the live's exact v3 hex everywhere (31 @theme pins) — the largest visual-drift family found since the font forensics, invisible to class strings, word parity, and spelling-tolerant specs.
- The login Sign in's keyboard ring now renders the live's slate-950 (the --color-ring emission path + the inputs' cascade nudge), the invented ::selection is gone, the login route pins the live's overscroll + light border, and the production server ships the live's four security headers.
- Gate re-locked at 284 checks (92 unit + 150 e2e incl. the palette-parity suite + 42 smoke incl. the header pins); VLM problem/testimonials/login IDENTICAL; word parity 1.0000 everywhere.
- Root causes documented for posterity: survey the RENDERED PALETTE (v4's oklch defaults are approximations — convert to sRGB and compare VALUES, not spellings); a utility referencing a missing @theme token never emits (pin the RENDERED effect, not the mechanism's variables); v4's compiled rule order can flip v3-era cascade outcomes (specificity nudges for elements carrying conflicting utilities).
- Next: final gate on the exact tree + commit + SSH push (Task 19).

---
Task ID: 19
Agent: Super Z (main, session 13)
Task: Final commit + SSH push of the Session 9 remediation

Work Log:
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified (ssh-ed25519, SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1-8 records).
- Paramiko shim on PATH (workspace bin/ssh, outside the checkout per runbook rule 5). Wrapper dry-run: auth OK, remote main @ e598a51, fast-forward e598a51..d7392d1 accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ d7392d1 == local HEAD, tracking ref synced. Operator key shredded; working tree clean.

Stage Summary:
- Commit d7392d1 pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 28 files changed: the 31 @theme palette pins (the v4 oklch-roundtrip fix — the stars, problem reds, features grays/greens, avatar gradient endpoints, every login slate now render the live's exact v3 hex), the --color-ring emission path + the inputs' cascade nudge (the Sign in's keyboard ring renders the live's slate-950), the ::selection removal, the login overscroll + light-border pins, the four security headers, 18 new checks (gate: 284 = 92 unit + 150 e2e + 42 smoke), the remediation plan + session log, refreshed screenshots, docs + SKILL v2.8.0.
- Session 9 complete.

---
Task ID: 20
Agent: Super Z (main, session 15)
Task: Session 10 parity audit + remediation (the looping-motion layer, the under-glow restructure, the dashboard a11y floor, the asset-caching headers)

Work Log:
- Workspace rebuilt from a fresh clone (the sandbox had been reset); .env re-created from .env.example; db/custom.db pushed + seeded at the repo root. The exported-DATABASE_URL trap struck on the first seed (a foreign file at /home/z/my-project/db/custom.db) — neutralized per-command thereafter; the AGENTS.md gotcha 1 discipline is load-bearing in this sandbox.
- Root docs + status docs (session_13/14, remediation-plan-9, worklog) reviewed; the scandihaven reference repo + both skills catalogs reviewed (avant-garde-design-v4 mobile-nav taxonomy, tdd, clone-app-pat-pro); skills/ excluded from every toolchain (verified across tsconfig/eslint/vitest/playwright).
- Baseline gate ALL GREEN (284 = 92 unit + 150 e2e + 42 smoke) — the codebase matched the documented Session-9 state exactly.
- Drift check: reference UNCHANGED — word parity 1.0000 on all 8 routes.
- The operator's dashboard question settled: logged into the live — the login redirects to / with the navbar UNCHANGED and every plausible authenticated route (/dashboard, /app, /home, /workflows, /workspace, /settings, /account) renders the SPA 404 even authenticated. The live has NO authenticated experience; the reference image is this repo's own dashboard. The clone's /dashboard remains the D1 superset (documented D62).
- NEW audit surface #1 — THE LOOPING-MOTION LAYER (the headline): a full-page census sampling every element's computed transform/opacity across multiple rounds AFTER entrances settle + animate/transition config extraction from the live's JS bundle. The live runs TWELVE loops; the clone shipped FOUR. The eight missing groups (framer-driven, invisible to the CSS-property census behind Session 4's "static mockup" verdict): the ambient -inset-32 glow (scale 1→1.15→1 + opacity .3→.5→.3, 4s), the red chrome dot (scale 1→1.2→1, 2s), the four list dots (same, delay:i*.1), the under-glow (y 0→−12→0 + opacity .3→.5→.3, 3s), and the One-Platform mini-dashboard's four skeleton opacity pairs (3s, delays .5/t*.2/1).
- NEW surface #2 — the under-glow structure: the live's glow is a SIBLING of the card (unclipped; pixel-adjudicated: bleeds below/right, brightness 1.3–2.5 vs background 0.0) and renders UNCENTERED (its framer transform replaces v3's --tw-translate-x — left edge at the wrapper's center, +149px past the card's right edge); the clone's was clipped inside the card, centered, static.
- NEW surface #3 — zoom/reflow at 640/320: zero horizontal scroll both sides, no clipped text — CLEAN (the one decorative delta is the glow structure, above).
- NEW surface #4 — asset-caching headers: public/ shipped max-age=0 (the 1.9MB hero video re-validated every load); the live's CDN serves max-age=604800.
- NEW surface #5 — the dashboard's first axe audit: color-contrast SERIOUS (text-white/40 muted lines, 3.6:1) + page-has-heading-one.
- Standing asks re-verified: the mobile menu panel byte-identical (0,56 390×397, 7 rows @44px), the burger identical (no transition classes either side — no v4 trap), the clone's tap-open/scroll-lock/Escape/resize-guard all working, the live's tap still blocked (D32); the testimonial strip byte-identical incl. drag behavior (mouse-drag scrolls neither side); the pricing toggle's aria-pressed documented as a D55-class superset (D61).
- TDD remediation (14 e2e pins observed RED, then GREEN): R1 the seven @theme --animate-* tokens + keyframes + the measured delay attachments; R2 the under-glow restructure (sibling + translate-none + animate-mockup-glow — the rendered geometry byte-identical to the live); R3 the skeleton loops; R4 the dashboard a11y (the breadcrumb span → the page's single h1; text-white/40 → /60 on the four muted lines); R5 the asset-caching headers + the smoke pin. Spec correction: the landing suite's "zero animations" pin (the falsified Session-4 verdict) rewritten to pin the seven measured loops. Selector lesson: escape-free [class*=] attribute selectors inside nested evaluate strings.
- Re-verified: word parity 1.0000 all 8 routes; the loop census 12 = 12 element-for-element; the glow geometry byte-identical (x=720 right=1317 w=597, +149 past the card right edge); the pixel bleed matches; VLM mockup IDENTICAL + One-Platform IDENTICAL; the cache header verified on the hero video; 17 screenshots refreshed (the mobile-menu shot verified open).
- Docs: remediation plan (docs/remediation-plan-session10.md), PAD (revision, ledger D57–D62, §5.5 trap 16, counts, key files), AGENTS (gotcha 15 rewritten + gotcha 24, counts), CLAUDE (session-10 context), README (299 badge, new rows), SKILL v2.9.0 (lessons 28–29), session log (docs/session_15.md), .env.example re-verified.

Stage Summary:
- The clone now reproduces the live's complete motion picture: entrances (Session 8) AND loops (Session 10) — the full-page loop census reads 12 = 12 element-for-element, and the under-glow renders the live's exact geometry (unclipped sibling, uncentered, pulsing).
- The superset's own quality floor raised: the dashboard passes its first axe audit (h1 + AA-contrast muted lines), and the production server ships CDN-grade asset caching.
- Gate re-locked at 299 checks (92 unit + 164 e2e incl. the mockup-motion-parity suite + 43 smoke incl. the asset-caching pin); VLM IDENTICAL on both changed surfaces; word parity 1.0000 everywhere.
- Root causes documented for posterity: a JS animation engine is invisible to a CSS-property census — survey motion by sampling VALUES over time and extracting the bundle's animate configs; framer's inline transform replaces v3's translate composition (v4's separate translate property needs an explicit kill); pixel adjudication settles clipping questions the DOM cannot.
- Next: final gate on the exact tree + commit + SSH push (Task 21).

---
Task ID: 21
Agent: Super Z (main, session 15)
Task: Final commit + SSH push of the Session 10 remediation

Work Log:
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified (ssh-ed25519, SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1-9 records).
- Environment was reset since Session 13: paramiko 5.0.0 reinstalled for the active interpreter (the system pip targets a different Python — python3 -m pip is the way) and the paramiko ssh shim re-deployed from the runbook's Appendix A to the workspace bin/ (outside the checkout per runbook rule 5).
- Wrapper dry-run (after pointing --remote at git@github.com:nordeim/saas-company.git — the wrapper's default is its legacy task-management remote): auth OK, remote main @ 694cd7f, fast-forward 694cd7f..05d08f0 accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ 05d08f0 == local HEAD, tracking ref synced. Operator key shredded (both the wrapper's temp copy and the /tmp original); working tree clean.

Stage Summary:
- Commit 05d08f0 pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 29 files changed (+1040/−65): the seven measured --animate-* loop tokens + keyframes (the ambient glow, red chrome dot, staggered list dots, under-glow, and mini-dashboard skeletons — the live's eight missing loop groups), the under-glow restructure (sibling + translate-none + animate-mockup-glow — rendered geometry byte-identical), the dashboard a11y floor (the single h1 + white/60 muted lines), the asset-caching headers, 15 new checks (gate: 299 = 92 unit + 164 e2e incl. the mockup-motion-parity suite + 43 smoke incl. the asset-caching pin), the remediation plan + session log, refreshed screenshots, docs + SKILL v2.9.0.
- Session 10 complete.

---
Task ID: 22
Agent: Super Z (main, session 17)
Task: Session 11 audit — the hydration/console layer, the cross-route axe sweep, the API contract, and the gate's own flaky pin

Work Log:
- Fresh clone (workspace reset); .env re-created from .env.example (AUTH_SECRET generated; DATABASE_URL="file:../db/custom.db"), db/custom.db pushed + seeded at the repo root; the exported-DATABASE_URL shell trap neutralized per-command (env -u DATABASE_URL) all session.
- Baseline gate: lint/typecheck/92 unit/build/43 smoke green; e2e 163/164 — the palette-parity keyboard-ring pin flaky at ~30-40% in isolation (the Session-10 tail observation, now diagnosed).
- Drift check: word parity 1.0000 on all 8 routes — the reference UNCHANGED since Session 10.
- NEW surface #1 — the console/pageerror sweep (every route): exactly ONE page error app-wide, React #418 on EVERY 404 load. Root cause: the not-found page is a statically-prerendered CLIENT component — the prerendered HTML ships the internal route id "_not-found" in the pathname span while the hydration render carries the real URL (a text mismatch by construction; React discards the server tree and re-renders client-side). The live's SPA 404 has a clean console.
- NEW surface #2 — the first cross-route axe sweep (clone, 9 routes) + live-side adjudication (/, /faq, 404): the clone's violations on the parity routes ship IDENTICALLY on the live (beta-badge contrast, testimonial scrollable-region, FAQ white/40 + heading structure, 404 landmarks) — parity, NOT bugs (ledgered D63). The dashboard's paused-card description flagged at 3.61:1 (the superset surface — real).
- NEW surface #3 — the pixel-level contrast adjudication + controlled compositing experiment: the paused/draft articles' opacity-80 compounds the description's text-white/50 to EFFECTIVE white/40 (glyph interiors sampled at exactly 103,103,103 over #020202 — 4x device scale); the control (rgba vs oklab vs color-mix over the same bg, all #818181) proved the v4 engine INNOCENT — the ancestor opacity is the whole story.
- NEW surface #4 — the API edge-case probe: invalid UUIDs -> clean 404 envelopes, invalid enums -> 400, oversized ideas -> 400, cookie Secure/HttpOnly/SameSite=lax — but PATCH silently TRUNCATES a 300-char name while POST rejects it (an inconsistent contract).
- NEW surface #5 — the mobile-nav paired re-verification (the standing operator ask, real-touch contexts): clone burger taps open the byte-identical panel (0,56 390x397, seven 44px rows, same classes); scroll-lock/Escape/navigate/resize-guard all working; the live's burger remains pointer-blocked (D32). NO Tailwind v4 bug in the clone's mobile nav — all documented v4 traps pinned by the passing suites.
- VLM spot checks (hero/mockup/mobile-menu/testimonials IDENTICAL); the pricing composite's "logo differs" claim disproven by pixels (0.0% mark / 0.2% wordmark diffs — the mark rotates, mid-phase shapes mislead a VLM); section heights match exactly (pricing 1026=1026, testimonials 697=697).
- The remediation plan written and validated against the codebase (docs/remediation-plan-session11.md F1-F8), then executed TDD-first.

Stage Summary:
- Four clone-side defects found, each with mechanism-level evidence: the 404 hydration error (React #418 every unknown route), the paused-card effective white/40 (3.61:1), the PATCH/POST name-contract split, and the gate's own flaky ring pin (two root causes: mid-transition sampling + blind-Tab focus misses).
- The axe-parity adjudication settles the a11y posture: the clone's remaining marketing-route violations are the live's own design (D63); the clone beats the live on every violation the live alone ships (D55 family).

---
Task ID: 23
Agent: Super Z (main, session 17)
Task: Session 11 remediation + verification + docs + push

Work Log:
- R1 (de-flake, TDD-RED = the captured 3/6 failures): tab-until-the-Sign-in-is-focused (bounded) + expect.poll to the settled 4px ring matching both serializations (rgb(9,9,11) / rgba(9,9,11,1)) — 10/10 isolated + 8/8 full-spec consecutive greens.
- R2 (the 404 hydration fix): RED first (tests/e2e/hydration.spec.ts — zero pageerrors, the quoted path, the static-HTML placeholder contract; the #418 pin failed pre-fix as expected). Fix: useSyncExternalStore mount gate (server snapshot false) reading window.location.pathname — NOT usePathname(), which settles to the internal /_not-found route id post-router (found the hard way: the first fix cut used usePathname and quoted "_not-found"). Verified: empty quotes pre-hydration, the real URL one commit later, STABLE over 4s.
- R3 (the paused-card contrast): RED first (the effective-alpha contrast pin failing at 3.61:1); fix text-white/50 -> text-white/60 on the description (active >=7:1, paused >=5.1:1).
- R4 (the PATCH name contract): RED first (two smoke pins — the 300-char PATCH must 400 VALIDATION; pre-fix it returned 200 with a truncated name); fix: the requiredString validator POST uses.
- R4b (F10, found live during the full-suite run): one extra signed-in spec tripped a mid-suite 429 that broke an UNRELATED Session-10 pin — the suite's ~10 UI sign-ins sat at EXACTLY the limiter default. Fix: AUTH_RATE_LIMIT_MAX (default 10, production unchanged; the Playwright webServer pins 50) + two unit tests (default + override) + .env.example. The R3 pin piggybacks on the seeded-workspace test's sign-in.
- Full gate: ALL GREEN — 307 checks (94 unit = 92+2 rate-limit; 167 e2e = 164+3 hydration; 46 smoke = 43+3 name-contract).
- Re-verification: word parity 1.0000 on ALL 8 routes (the 404 restored after a zombie next-server process on :3000 served a stale build mid-verification — killed by port, re-verified; the playwright/smoke suites were never affected, they boot their own servers); axe /dashboard ZERO violations; the 404 console ZERO pageerrors; the mobile nav re-probed byte-identical; 17 screenshots refreshed (the 404 verified quoting the real URL; the mobile-menu verified open).
- Docs: PAD (revision block, ledger D63-D66, traps 17-18, section 7 counts/conventions, section 8.2 env table, section 11 key files), AGENTS (gate counts, gotcha 8 rewritten, gotcha 25), CLAUDE (session-11 context + counts), README (307 badge, new rows, AUTH_RATE_LIMIT_MAX, troubleshooting), SKILL v2.10.0 (lessons 30-31), remediation plan (F10/R4b appended), session log (docs/session_17.md), .env.example updated.

Stage Summary:
- The clone's production-readiness floor raised: every route now hydrates with ZERO page errors (the 404's React #418 fixed with the useSyncExternalStore + window.location.pathname pattern — the usePathname internal-route-id trap documented), the dashboard passes axe clean, and the API contract is consistent across create/update.
- The gate itself is de-flaked (the ring pin) and de-fragilized (AUTH_RATE_LIMIT_MAX) — 307 checks, deterministic.
- Next: final commit + SSH push (Task 24).

---
Task ID: 24
Agent: Super Z (main, session 17)
Task: Final commit + SSH push of the Session 11 remediation

Work Log:
- Final gate on the exact tree: lint ✓ typecheck ✓ Vitest 94/94 ✓ build ✓ smoke 46/46 ✓ Playwright 167/167 ✓ (307 checks).
- Tree review: .env + db/custom.db ignored ✓, no keys staged ✓, 33 files changed (4 fix files, 4 test files + 1 new spec, 2 scripts/config, 10 docs, 17 screenshots, 2 new docs + worklog).
- Commit 2f8b0eb on main (Conventional Commits + emoji per the contract).
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified: ssh-ed25519 SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1-10 records.
- Environment reset since Session 15: paramiko 5.0.0 reinstalled (python3 -m pip) and the paramiko ssh shim re-deployed from the runbook's Appendix A to the workspace bin/ (outside the checkout per runbook rule 5).
- Wrapper dry-run (pointed at git@github.com:nordeim/saas-company.git — the wrapper's default is its legacy task-management remote): auth OK, remote main @ 49d8a7a, fast-forward 49d8a7a..2f8b0eb accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ 2f8b0eb == local HEAD, tracking ref synced. Operator key shredded (the wrapper's temp copy + the /tmp original); working tree clean.

Stage Summary:
- Commit 2f8b0eb pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 33 files changed (+807/−59): the 404 hydration fix (useSyncExternalStore mount gate + window.location.pathname — React #418 eliminated from every unknown route), the paused-card contrast fix (text-white/60 through the opacity-80), the PATCH name-contract fix (requiredString both paths), the de-flaked ring pin (tab-until-focused + poll-to-settled), the AUTH_RATE_LIMIT_MAX override (default 10; the e2e webServer pins 50), +8 checks (gate: 307 = 94 unit + 167 e2e incl. the hydration suite + 46 smoke incl. the name-contract pins), the remediation plan + session log, refreshed screenshots (the 404 quoting the real URL), docs + SKILL v2.10.0, .env.example with the new optional var.
- Session 11 complete.

---
Task ID: 25
Agent: Super Z (main, session 19)
Task: Session 12 audit — console-noise v2, fault injection, and the resource-preload layer

Work Log:
- git pull (docs/session_18.md transcript arrived); baseline gate: lint/typecheck/94 unit/build/46 smoke green; e2e 166/167 -> 167/167 on re-run — the FAQ motion-parity pin flaky (F1: 2/10 isolated reproduction, root-caused as a pre-reveal race — the first FAQ item is in the initial viewport, so the rAF reveal (delay 0, 400ms) can settle before the post-goto evaluate lands under load).
- Drift check: word parity 1.0000 on all 8 routes — the reference UNCHANGED since Session 11.
- NEW surface #1 — console-noise sweep v2 (pageerror + unhandledrejection + console.error/warn, every route AND during interactions): all routes clean except the Gasparyan preload warning on the navbar routes.
- NEW surface #2 — the first fault-injection sweep (route.abort on the dashboard's API calls): pause/delete/sign-out each produced pageerror "TypeError: Failed to fetch" with ZERO user feedback (sign-out left the user stranded on /dashboard); the composer was the model citizen (catch -> setError -> role=alert, zero pageerrors).
- NEW surface #3 — the resource-preload survey: React Float auto-preloads eager SSR-shell imgs; the Gasparyan preload shipped in the landing HTML and was INJECTED into every navbar-bearing route's head via the Next.js RSC prefetch (the logo Link to /) — a console warning + a wasted fetch on six routes (/faq, /privacy, /terms, /accessibility, /refund-policy, /dashboard). Verified with the /login control (bare card, no logo link -> no injection); the live's img is EAGER with no preload and no warning (its own console noise is two 401 session-check errors — the clone's console is cleaner, D68). Controlled rebuild experiment: loading="lazy" suppresses the Float emission entirely.
- Standing mobile-nav paired re-verification (real-touch 390x844): clone byte-identical (burger 342,16 24x24; panel 0,56 390x397; seven 44px rows; scroll-lock, Escape, resize guard; oklab bg = black/95 rendering-identical) — NO Tailwind v4 bug; the live's burger remains pointer-blocked (D32).
- The remediation plan (docs/remediation-plan-session12.md F1-F8) written + validated against the codebase before execution.

Stage Summary:
- Three defects found with mechanism-level evidence: the flaky FAQ pre-reveal pin (a transient-state sample with no synchronization), the traveling Gasparyan preload (React Float emission + RSC-prefetch injection), and the dashboard's uncaught fetch rejections (the fault layer no prior session probed).
- The reference is UNCHANGED; the clone's console is now cleaner than the live's on every tier.

---
Task ID: 26
Agent: Super Z (main, session 19)
Task: Session 12 remediation + verification + docs

Work Log:
- R1 (de-flake, TDD-RED = the captured 2/10 + full-suite failures): the FAQ pre-reveal contract now pins through the STATIC HTML ('<div style="opacity:0;transform:translateY(15px)">' in /faq's SSR markup) + the settled check converts to expect.poll — 10/10 consecutive isolated greens.
- R2 (the Gasparyan lazy load): RED first (resource-hygiene.spec.ts failed on the injected link; the smoke pin failed on the landing-HTML preload); fix loading="lazy" on the logo-cloud img; GREEN (2/2 e2e + 47/47 smoke).
- R3 (the dashboard fault resilience): RED first (resilience.spec.ts — 3 pins failed on pageerrors "TypeError: Failed to fetch"; the compose regression pin passed); fix: toggleStatus/remove/signOut adopt the composer's catch contract (network rejections AND !res.ok) -> a full-width role="alert" banner under the header, cleared per action; sign-out's failed path STAYS on /dashboard (the session cookie is still live — navigating away would lie). GREEN 4/4.
- Full gate: ALL GREEN — 314 checks (94 unit + 173 e2e = 167 + 2 resource-hygiene + 4 resilience; 47 smoke = 46 + the lazy-img contract pin).
- Re-verification: word parity 1.0000 on ALL 8 routes — one mid-verification "regression" (0.757-0.955 on five routes) was DISPROVEN as a ZOMBIE-SERVER artifact (a stale :3000 process served old HTML referencing CSS chunks the new builds deleted -> unstyled page -> concatenated innerText; killed by port, re-verified clean; the playwright/smoke suites were never affected). Console sweep v2 re-run: zero noise on every route. Mobile nav re-probed byte-identical.
- Screenshots: 17 standard shots refreshed + the new 14-dashboard-resilience-banner.png (18 total), VLM-verified (the banner shows "Could not update that workflow. Try again."; the control shows no error).
- Docs: PAD (revision block, ledger D67-D69, section 7 counts + the two new suites, section 11 key files), AGENTS (counts, gotcha 26: the traveling preload + fault-injection discipline + the zombie-server check), CLAUDE (session-12 context + counts), README (314 badge, the new suites, two troubleshooting rows), SKILL v2.11.0 (lessons 32-33), remediation plan checklist ticked, session log (docs/session_19.md), .env.example re-verified (no changes).

Stage Summary:
- The gate is deterministic again (the FAQ pin de-flaked) and strengthened: the resource-hygiene + resilience suites pin the resource layer and the fault layer for the first time.
- Every route's console is now zero-noise (pageerror, unhandledrejection, console.error, console.warn) — cleaner than the live's own console.
- Next: final commit + SSH push (Task 27).

---
Task ID: 27
Agent: Super Z (main, session 19)
Task: Final commit + SSH push of the Session 12 remediation

Work Log:
- Final quick gate on the exact tree (lint/typecheck/94 unit; the full 314-check gate ran on the identical code state): green.
- Tree review: .env + db/*.db ignored, no keys staged, 25 files changed (2 src fix files, 3 test files incl. 2 new specs, 1 smoke script, 10 docs incl. 2 new, 11 screenshots incl. 1 new).
- Commit bc017f0 on main (Conventional Commits + emoji per the contract).
- Operator key materialized to a 0600 file in /tmp (never inside the repo); fingerprint verified: ssh-ed25519 SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU — matches the Session 1-11 records.
- Paramiko shim already deployed at the workspace bin/ (outside the checkout per runbook rule 5); PATH prepended per-command.
- Wrapper dry-run (pointed at git@github.com:nordeim/saas-company.git): auth OK, remote main @ 23f19fb, fast-forward 23f19fb..bc017f0 accepted.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ bc017f0 == local HEAD, tracking ref synced. Operator key shredded (the wrapper's temp copy + the /tmp original); working tree clean.

Stage Summary:
- Commit bc017f0 pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 25 files changed: the de-flaked FAQ motion-parity pin (the pre-reveal contract pinned through the static SSR HTML + expect.poll), the Gasparyan lazy load (React Float's traveling preload suppressed — console warning + wasted fetch eliminated on six routes), the dashboard's fault-resilience catch contract (toggleStatus/remove/signOut with the role=alert banner), +7 checks (gate: 314 = 94 unit + 173 e2e incl. the resource-hygiene + resilience suites + 47 smoke incl. the lazy-img contract), the remediation plan + session log, 18 screenshots, docs + SKILL v2.11.0.
- Session 12 complete.

---
Task ID: S13-1
Agent: Super Z (main, session 21)
Task: Session 13 — session-lifecycle + render-fault + focus-management audit and remediation of the saas-company clone

Work Log:
- git pull (session_20.md transcript arrived); docs reviewed (AGENTS/CLAUDE/README/PAD/SKILL v2.11.0 + session_19/20 + remediation-plan-12 + worklog); skills/ excluded from all toolchains (verified); the exported-DATABASE_URL shell trap live — neutralized per-command (env -u DATABASE_URL) all session.
- Baseline gate: lint/typecheck/94 unit/build/47 smoke/173 e2e ALL GREEN on the inherited tree (no flake).
- Drift check: word parity 1.0000 on all 8 routes — the reference UNCHANGED. Mobile-nav real-touch paired probe re-run: clone byte-identical and working (burger 342,16 24×24; panel 0,56 390×397, seven 44px rows; scroll-lock/Escape/resize guard; oklab bg = black/95) — NO Tailwind v4 bug; the live's burger remains pointer-blocked (D32).
- Survey (three NEW surfaces): the session-lifecycle layer (cookie deleted post-sign-in → Pause → the 401 banner LIED — "Try again" 401s forever; user stranded on /dashboard; Delete/Compose/refresh same); the render-fault layer (NO error.tsx/global-error.tsx — a {ok:true,data:null} envelope crashes the stats memo → Next.js's DEFAULT unbranded "This page couldn't load" page; refresh() guarded payload?.ok but not the SHAPE of payload.data); the focus-management layer (Escape closed the mobile menu WITHOUT focus return — activeElement fell to body, WCAG 2.4.3). Non-findings: login autocomplete (already the superset), auth cookie flags, double-submit guards, the 401 envelope shape.
- Remediation plan (docs/remediation-plan-session13.md F1-F6 → R1-R4) written + validated against the codebase, then executed TDD-first: R1 the apiFetch 401-redirect wrapper (RED session-lifecycle.spec.ts 3 pins + abort regression pin → the SessionExpired sentinel + router.push("/login?from_url=/dashboard") — the server gate's own contract → GREEN 4/4); R2 the branded error boundaries (RED error-boundary.spec.ts → error.tsx dark recovery card + global-error.tsx root shell + the Array.isArray shape-guard → GREEN 2/2, Try again restores the segment); R3 the burgerRef Escape focus return (RED focus pin in mobile-navigation.spec.ts → GREEN, 9/9 suite).
- Full gate: 321 checks green (94 unit + 180 e2e incl. the session-lifecycle + error-boundary suites + 47 smoke).
- Re-verification: word parity 1.0000 ×8; the three RED probes re-run GREEN (redirect, branded boundary + restore, focus return); console sweep v2 zero noise on every route; one ZOMBIE-SERVER recurrence killed by port (EADDRINUSE :3000; the served CSS chunk verified against disk before trusting results — gotcha 26 discipline); 19 screenshots (18 standard + the new 15-error-boundary evidence shot, VLM-verified).
- Docs: PAD (revision block, ledger D70-D72, §7 counts, §11 key files), AGENTS (counts, gotcha 27: failure-class-distinct UI contracts + ship error boundaries before you need them), CLAUDE (session-13 context), README (321 badge, new suites, two troubleshooting rows), SKILL v2.12.0 (lessons 34-35), remediation plan ticked, session log docs/session_21.md, this worklog. .env.example re-verified (no new env vars).

Stage Summary:
- Three defects fixed with mechanism-level evidence: the session-expiry lying banner (every 7-day+ user hit it — the honest redirect now matches the server gate), the missing error boundaries (any render fault debrandized the app — now the dark recovery card with Try again), and the mobile menu's Escape focus loss (keyboard users stranded — now focus returns to the burger).
- Production-readiness floor raised: the session lifecycle is pinned end-to-end (401 ≠ abort — failure classes distinct), the render-fault layer is pinned with realistic route-fulfilled contract violations, and the a11y floor extends to focus management.
- Survey scripts persisted under /home/z/my-project/scripts/ (session13-red, session13-green, vlm-check-session13, mobilenav-session13.json).
- Session 13 complete.

---
Task ID: S13-2
Agent: Super Z (main, session 21)
Task: Record the verified Session 13 push in the worklog

Work Log:
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ 3064c64 == local HEAD, tracking ref synced. Operator key shredded (the wrapper's temp copy + the /tmp original); working tree clean.

Stage Summary:
- Commit 3064c64 pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 27 files changed: the session-expiry 401-redirect contract (apiFetch + the SessionExpired sentinel — the server gate's own redirect, upheld client-side), the branded error boundaries (error.tsx + global-error.tsx + the Array.isArray shape-guard), the mobile-menu Escape focus return (burgerRef), +7 checks (gate: 321 = 94 unit + 180 e2e incl. the session-lifecycle + error-boundary suites + 47 smoke), the remediation plan + session log, 19 screenshots, docs + SKILL v2.12.0.
- Session 13 complete.

---
Task ID: S14-1
Agent: Super Z (main, session 23)
Task: Session 14 — feature-reachability + authenticated-navigation + status-message + reduced-motion-contract audit and remediation of the saas-company clone

Work Log:
- git pull (session_22.md transcript arrived); all repo docs + session docs reviewed; skills/ excluded from toolchains (verified); DATABASE_URL trap neutralized per-command (env -u DATABASE_URL).
- Baseline gate: 321 inherited checks ALL GREEN (94 unit + 180 e2e + 47 smoke — no flake).
- Drift: word parity 1.0000 on all 8 routes (reference UNCHANGED); mobile-nav real-touch paired probe: clone byte-identical and working — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32).
- Four NEW audit surfaces surveyed with RED-evidence probes: feature-reachability (POST /api/demo shipped complete with ZERO UI consumers — dead code dressed as a superset), authenticated-navigation (/login rendered the login card to a signed-in session), status-messages (zero aria-live regions on the dashboard — successful mutations silent for screen-reader users, WCAG 4.1.3), reduced-motion contract (verified CLEAN by probe — below-fold content visible under emulation — but unpinned).
- Remediation plan session14 written + validated (API contract, routeMetadata semantics, FAQ-view design pattern, auth budget recount, pin-conflict scan), executed TDD-first: R1 the /demo route (page + view + sitemap; demo.spec 6 pins RED→GREEN), R2 the login split (login-card.tsx + the async server gate redirecting authed visitors to /dashboard; auth pin RED→GREEN), R3 the polite announcement region (dashboard pin RED→GREEN), R4 the reduced-motion suite (pin-only; the clamp serializes as "1e-05s" — compared numerically).
- Mid-survey ZOMBIE-SERVER recurrence (gotcha 26): post-rebuild boot silently lost EADDRINUSE to the pre-rebuild process serving deleted CSS chunks (all animations read dead); killed by PID, chunk-verified-against-disk, re-probed clean.
- Full gate: 333 checks green (94 unit + 191 e2e incl. the demo + reduced-motion suites + 48 smoke incl. the /demo page pin). Re-verification: word parity 1.0000 ×8; RED probes re-run GREEN (authed-/login redirect, "Paused {name}." announcement sr-only-verified, /demo 200 + zero console noise); the 404 route's single resource log adjudicated live-parity-or-better (the live's own 404 ships two 401s, D68); 20 screenshots (18 refreshed + boundary recapture + 16-demo-page, VLM-verified).
- Docs: PAD (revision block, D73–D75, §7, §11), AGENTS (gotcha 28 + counts), CLAUDE (session-14 context), README (333 badge + demo-form row + troubleshooting), SKILL v2.13.0 (lessons 36–37), remediation plan session14 (ticked), session log docs/session_23.md, repo worklog.md. .env.example re-verified in sync.

Stage Summary:
- Three defects fixed with mechanism-level evidence: the dead /api/demo endpoint (now the reachable /demo superset route), the authenticated /login card (now the server-gate redirect), and the dashboard's silent successes (now polite status messages).
- Gate raised 321 → 333 checks; the production-readiness floor now covers feature reachability, authenticated navigation, WCAG 4.1.3 status messages, and the reduced-motion contract.
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session14-red.mjs, survey-session14-green.mjs, vlm-check-session14.mjs, capture-error-boundary.mjs).

---
Task ID: S14-2
Agent: Super Z (main, session 23)
Task: Record the verified Session 14 push in the worklog

Work Log:
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/saas-company.git: wrapper verified remote refs/heads/main @ 4f3672e == local HEAD, tracking ref synced. Operator key shredded (the wrapper's temp copy + the /tmp original); working tree clean.

Stage Summary:
- Commit 4f3672e pushed and VERIFIED on git@github.com:nordeim/saas-company.git main — 28 files changed: the reachable /demo superset route (page + view + sitemap — the formerly-dead demo API's front half), the authenticated-/login server-gate redirect (the byte-pinned card split into login-card.tsx), the dashboard's polite status-message live region, +12 checks (gate: 333 = 94 unit + 191 e2e incl. the demo + reduced-motion suites + 48 smoke incl. the /demo page pin), the remediation plan + session log, 20 screenshots, docs + SKILL v2.13.0.
- Session 14 complete.

---
Task ID: S15-1
Agent: Super Z (main, session 25)
Task: Session 15 — redirect-target + superset-a11y + external-dependency-hang + rate-limit-response-contract audit and remediation of the saas-company clone

Work Log:
- git pull (session_24.md transcript arrived); all repo docs + session docs reviewed; skills/ excluded from toolchains (verified); DATABASE_URL trap neutralized per-command (env -u DATABASE_URL).
- Baseline gate: 333 inherited checks ALL GREEN (94 unit + 191 e2e + 48 smoke — no flake).
- Drift: word parity 1.0000 on all 8 routes (reference UNCHANGED); mobile-nav real-touch paired probe: clone byte-identical and working — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32); the Session-11 probe's navigateCloses:false adjudicated a SELECTOR-TYPO artifact (corrected probe GREEN: panel closes on row-navigate, URL anchored to #features).
- Four NEW audit surfaces surveyed with RED-evidence probes: the redirect-target layer (/login?from_url= pushed an attacker URL VERBATIM post-sign-in — a real off-site navigation captured in the network log, CWE-601), the superset-surface a11y layer (axe: /demo heading-order violation — h1-only page + byte-pinned footer h3; dashboard CLEAN), the external-dependency hang class (/api/workflows/generate awaits the SDK with NO timeout — a black-holed connection blocks the composer forever), and the docs-truth layer (README promised Retry-After on 429s that no route emitted).
- Non-findings adjudicated: 405 empty bodies (Next framework behavior — envelope governs handled methods), hero video eager autoplay (live-parity), GET /api/workflows/[id] (route family consumed via PATCH/DELETE), cookie flags (httpOnly/Lax/secure-in-prod), CSRF posture (JSON content-type + Lax).
- Remediation plan session15 written + validated (single-consumer scan, seam fit, fail() signature compat, smoke-bucket arithmetic, auth budget recount, pin-conflict scan), executed TDD-first: R1 the safeRedirectPath guard (17 unit RED → 111/111; 3 auth pins RED→GREEN — the evil targets fall back to /dashboard with ZERO external requests, the legit /faq round-trips), R2 the sr-only h2 on /demo (outline pin RED→GREEN; footer's real column texts learned from the DOM — Product/Legal/Social/Subscribe; + the reduced-motion /demo row, GREEN-on-arrival), R3 the withTimeout hang seam (5 unit RED under fake timers → GREEN; the generate route's SDK call gains SDK_TIMEOUT_MS=10s — a hang RESOLVES with the template, a rejection still propagates), R4 the Retry-After contract (fail(headers) + the four 429 sites; smoke pin RED "got ''" → GREEN 600s).
- Mid-survey ZOMBIE-SERVER recurrence with a NEW twist: the CSS chunk-against-disk check was BLIND (only JS changed — the content-hashed CSS name was unchanged; the old process served FRESH static HTML from disk while hydrating with STALE in-memory JS, and its exhausted auth bucket 429'd every UI sign-in); ps/lsof//proc process-blind in this sandbox — resolved by moving the survey to a FRESH PORT (:3010): all probes GREEN. Related display-layer trap logged: the Bash output layer SWALLOWS [m-style character pairs (const [mode, setMode] displayed as "const ode, setMode]" — hex-dump before believing a "corrupt" file).
- Full gate: 357 checks green (111 unit + 196 e2e incl. the redirect-target + outline + reduced-motion pins + 50 smoke incl. the 429-engages + Retry-After pins). Re-verification: word parity 1.0000 ×8; the four RED probe families re-run GREEN (redirect guard ×4 variants, outline, Retry-After:600, axe-zero on /demo + dashboard); console sweep ZERO on all touched routes; mobile-nav byte-identical.
- Screenshots: 18 standard + the error-boundary recapture + the demo shot (20 total, VLM-verified — demo form complete, login slate clean, branded boundary, dashboard control clean).
- Docs: PAD (revision block, D76–D79, §7, §11), AGENTS (gotcha 29 + counts), CLAUDE (session-15 context), README (357 badge + true Retry-After + open-redirect-guard row), SKILL v2.14.0 (lessons 38–39), remediation plan session15 (ticked), session log docs/session_25.md, this worklog. .env.example re-verified in sync (no new env vars).

Stage Summary:
- Four defects fixed with mechanism-level evidence: the from_url open redirect (CWE-601 — now the safeRedirectPath same-site guard), the /demo heading-order violation (now the sr-only h2 — the superset a11y floor: axe-zero like the dashboard), the SDK hang class (now the 10s withTimeout degrade ceiling), and the missing Retry-After header (now emitted on all four 429 sites).
- Gate raised 333 → 357 checks; the production-readiness floor now covers redirect targets, superset-route a11y, external-dependency hangs, and the docs-truth layer.
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session15-red/green, survey-navigate-close-session15, survey-console-session15, vlm-check-session15).
- Session 15 complete.

---
Task ID: S16-1
Agent: Super Z (main, session 27)
Task: Session 16 — authenticated-endpoint-abuse + response-cache-directive + framework-banner audit and remediation of the saas-company clone

Work Log:
- git pull (session_26.md transcript + prompt-to-review-3.md arrived); all repo docs + session docs reviewed; skills/ excluded from toolchains (verified); DATABASE_URL trap LIVE in the shell — neutralized per-command (env -u DATABASE_URL) all session; zombie servers on :3000/:3010 bypassed via fresh-port boots (:3020-:3023) per the gotcha-26/29 discipline.
- Baseline gate: 357 inherited checks ALL GREEN (111 unit + 196 e2e + 50 smoke — no flake).
- Drift: word parity 1.0000 on all 8 routes (reference UNCHANGED); mobile-nav real-touch paired probe: clone byte-identical and working (corrected navigate-close probe GREEN) — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32).
- Three NEW audit surfaces surveyed with RED-evidence probes: the authenticated-endpoint abuse layer (/api/workflows/generate — the most expensive endpoint per call — had NO rate limit: 15/15 rapid authenticated POSTs all 200 in 8.1s through in-page fetches), the response-cache directive layer (Next protects dynamic PAGES with no-store but NOT route-handler JSON — the envelope carried no Cache-Control; RFC 9111 permits heuristic storage of unmarked 200s), and the framework-banner layer (pages advertised X-Powered-By: Next.js; the live ships none — server: cloudflare).
- Adjudicated CLEAN with evidence: hostile-content rendering (<script>-named workflow + max-length fields: zero dialogs, escaped-as-text, truncate + line-clamp + zero overflow), fresh-user empty state ("No workflows yet"), post-logout back-button (server 307 -> /login?from_url=/dashboard, no bfcache leak), IDOR scoping (userId-scoped findFirst), email normalization, password bounds, seed idempotency, UI busy guards.
- Two survey-tooling traps discovered: page.request (APIRequestContext) REFUSES to send Secure cookies over plain http while Chromium navigations treat 127.0.0.1 as trustworthy (the v1 probe's 401s were a tool artifact — authenticated probing must use in-page fetches); API-register then /login visit hits the S14 authenticated gate (navigate directly).
- Remediation plan session16 written + validated (single-seam scan, pin-conflict scan, e2e generate-budget recount, smoke-bucket arithmetic, docs-truth scan), executed TDD-first: R1 generateRateLimit — per-USER buckets (gen:${userId}), 10/15min default, GENERATE_RATE_LIMIT_MAX override (webServer 50 / smoke 2), 429 + Retry-After; CLIENT contract unchanged by design (compose()'s genRes.ok degrade: a 429 still creates the template workflow — the feature never hard-fails; pinned by the e2e route-fulfilled-429 row). R2 Cache-Control: private, no-store at the ok()/fail() seam (Retry-After survives the merge). R3 poweredByHeader: false.
- RED observed at every layer: 3 unit "not a function"; smoke 7 defect pins failing (429-got-200, code-got-[], Retry-After-got-'', X-Powered-By present, no-store x3 got ''); GREEN after the fixes: 114/114 unit, 60/60 smoke (the trip: POST #1/#2 allowed, POST #3 429 RATE_LIMITED + Retry-After 899s), 197/197 e2e.
- Full gate: 371 checks green. Re-verification on fresh ports: word parity 1.0000 x8; the GREEN probe family (15 POSTs -> 10x200 + 5x429, first 429 at index 10, Retry-After 890s; no-store on the API; no X-Powered-By); console sweep ZERO on /, /login, /demo, /dashboard+composer (fresh-bucket server; the one 429 console line on the exhausted server = the browser's inherent non-2xx resource log, D68 family, survey-induced); axe /dashboard + /demo ZERO; mobile-nav byte-identical.
- Screenshots: 20 refreshed (VLM-verified x4). Workspace-hygiene discovery en route: the DEV db/custom.db had DRIFTED all-paused across S12-S15 probe traffic (the resilience shot's Pause-button locator found nothing) — re-seeded to the canonical workspace (e2e/smoke immune: fresh DBs per run).
- Docs: PAD (revision block, D80-D82, §7 counts, §8.2 env table +GENERATE_RATE_LIMIT_MAX, §11 key files), AGENTS (gotcha 30 + counts), CLAUDE (session-16 context + checklist counts), README (371 badge + composer rate-limit rows + no-store/banner), SKILL v2.15.0 (lessons 40-41), .env.example (+GENERATE_RATE_LIMIT_MAX), remediation plan session16 (ticked), session log docs/session_27.md, this worklog.

Stage Summary:
- Three defects fixed with mechanism-level evidence: the unlimited LLM endpoint (now the per-USER generateRateLimit ceiling with the degrade contract preserved), the missing envelope cache directive (now private, no-store at the single seam), and the framework banner (now poweredByHeader: false, matching the live's posture).
- Gate raised 357 -> 371 checks; the production-readiness floor now covers cost control on the expensive endpoint, API cache hardening, and fingerprint hygiene.
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session16-red/green, survey-session16-console-axe, vlm-check-session16).
- Session 16 complete.

---
Task ID: S17-1
Agent: Super Z (main, session 29)
Task: Session 17 — account-enumeration-timing + registration-concurrency + registration-access-control + deployment-artifact audit and remediation of the saas-company clone

Work Log:
- Sandbox fully reset (the prior run died mid-Session-17 to a broken tool session after its code-level audit): fresh git clone, npm install, .env from .env.example (fresh AUTH_SECRET), prisma generate, db:push + db:seed (seed-checksum e7f6c011). DATABASE_URL trap LIVE (stale exported path) — neutralized per-command (env -u DATABASE_URL) all session; no zombie servers (verified — the reset reaped them); no Docker daemon (verified).
- All repo docs + session docs reviewed; skills/ excluded from toolchains (re-verified); all Session-16 fixes verified in code (generateRateLimit, the no-store seam, poweredByHeader: false, .env.example in sync).
- Baseline gate: 371 inherited checks ALL GREEN (114 unit + 60 smoke + 197 e2e — no flake).
- Drift battery: word parity 1.0000 on all 8 routes (reference UNCHANGED); mobile-nav paired real-touch probe: clone byte-identical (7 rows x 44px, burger opens with a REAL tap) — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32).
- Four NEW audit surfaces surveyed with RED-evidence probes: the account-enumeration timing layer (login's unknown-email path skips scrypt — 3.5ms vs 34.1ms medians, a 9.8x delta behind an identical 401 envelope, CWE-208), the registration-concurrency layer (the findUnique→create TOCTOU window — 10 truly-parallel independent-socket POSTs → {"201":1,"409":8,"500":1}; the loser's unhandled P2002 was a BARE 500 with an EMPTY body and no content-type; undici's single-socket pool SERIALIZES — the race needs true wire-level concurrency), the registration-access-control layer (PAD §10 MEDIUM, the oldest open item — any visitor mints an account, no gate), and the deployment-artifact layer (PAD §10 LOW — no Dockerfile).
- Adjudicated CLEAN: the Subscriber upsert (conflict resolved internally — no P2002 exposure), DemoRequest (no unique), the login-card error surfacing (payload?.error?.message renders a gate message with zero client changes), the e2e/smoke register budgets (the gate defaults open).
- Remediation plan session17 written + validated (PrismaClientKnownRequestError probed constructible in THIS repo's client; the P2002 exposure scan; the smoke auth-POST arithmetic 30 < 50; pin-conflict + docs-truth scans), executed TDD-first: R1 dummyPasswordHash (module-init decoy, same scrypt cost) + the login-route unconditional verifyPassword — RED 11.38x smoke pin → GREEN 1.07x/0.66x + probe ratio 1.0x. R2 isUniqueConstraintError (pure db-errors.ts, class+code classification — duck-typed objects rejected) + the register create catch → 409 EMAIL_TAKEN — the smoke 10-parallel-curl race pin. R3 registrationOpen (only exact "false" closes) + the route gate (403 REGISTRATION_CLOSED) — the smoke second-server pins (:3220, ALLOW_REGISTRATION=false: 403 + code + demo user still signs in). R4 the multi-stage Dockerfile + .dockerignore + DEPLOYMENT.md §8 (honestly labeled NOT build-tested — no Docker daemon).
- Two mid-execution traps caught: a display-layer invisible typo (an extra ' swallowed by the Bash output layer — found by bash -n + octal dump, fixed byte-wise) briefly broke the smoke script's parse; the resulting mid-script abort ORPHANED the closed-gate server on :3210 (bash parses incrementally — boot lines executed before the parser died; the next run's fresh boot silently lost EADDRINUSE and the zombie's old-build answers masked the fix until the port moved to :3220). Logged as gotcha 31 + SKILL lesson 43.
- Full gate: 388 checks green (126 unit + 65 smoke + 197 e2e — no flake). Re-verification: the RED probe families re-run GREEN (timing 1.0x; the race → only 201/409 envelopes; Dockerfile present; the gated 403 pinned by smoke); word parity 1.0000 x8; mobile-nav byte-identical.
- Screenshots: 20 refreshed (VLM spot-checks x5 all PASS). Docs: PAD (revision block, D83-D86, §7 counts, §8.2 env +ALLOW_REGISTRATION, §8.3 Docker, §10 MEDIUM+LOW CLOSED, §11), AGENTS (gotcha 31 + counts), CLAUDE (session-17 context), README (388 badge + constant-time auth row + 3 troubleshooting rows + env table + Docker pointer), SKILL v2.16.0 (lessons 42-43), .env.example (+ALLOW_REGISTRATION), DEPLOYMENT.md (env table + Docker runbook), remediation plan session17 (ticked), session log docs/session_29.md, this worklog.

Stage Summary:
- Four defects fixed with mechanism-level evidence: the login timing side-channel (now the constant-time dummy-hash login), the register TOCTOU race (now the P2002 catch → the exact duplicate envelope), the open registration (now the opt-in ALLOW_REGISTRATION deployment gate — the PAD §10 MEDIUM closed), and the missing Dockerfile (now the standalone-artifact image + runbook — the §10 LOW closed).
- Gate raised 371 → 388 checks; the production-readiness floor now covers anti-enumeration timing, write-path race contracts, registration access control, and the deployment artifact story.
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session17-red, survey-session17-drift, capture-screenshots-s17 + the run wrappers).
- Session 17 complete.

---
Task ID: S18-1
Agent: Super Z (main, session 31)
Task: Session 18 — deployment-honesty (health sight + boot signal + Docker first-run + IP trust) audit and remediation of the saas-company clone

Work Log:
- Sandbox fully reset again (the repo wiped): fresh git clone (HEAD 680e11f on main, clean), repo deployed to the workspace root, npm install, .env from .env.example (fresh AUTH_SECRET), prisma generate, db:push + db:seed (seed-checksum e7f6c011). DATABASE_URL trap LIVE — neutralized per-command (env -u DATABASE_URL) all session.
- All repo docs + session docs reviewed (session_29, session_30 — the prior transcript, remediation-plan-17 ticked, worklog); skills/ excluded from toolchains (re-verified).
- Baseline gate: 388 inherited checks ALL GREEN (126 unit + 65 smoke + 197 e2e — no flake).
- Drift battery: word parity 1.0000 on all 8 routes (reference UNCHANGED); mobile-nav paired real-touch probe: clone byte-identical (7 rows x 44px, burger opens with a REAL tap) — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32). Live LOGIN re-verified with the operator credentials — D62 holds (sign-in -> /, navbar unchanged, /dashboard renders the SPA 404 even authenticated).
- Four NEW audit surfaces surveyed (the deployment-honesty layer — the signals a deployment trusts to describe itself), all RED-confirmed: the health probe's blindness (unwritable DATABASE_URL: health 200 status:ok while login -> BARE 500 empty body; the Docker HEALTHCHECK inherits the blindness), the silent AUTH_SECRET fallback (production import with no AUTH_SECRET: ZERO runtime output; the DEV_SECRET constant is public in the repo), the broken Docker first-run (the S17 runbook's one-off init could not work — the runner ships neither the prisma CLI nor prisma/schema.prisma; a fresh named volume mounts EMPTY), and the half-documented IP trust model (clientIpOf trusts the first XFF hop verbatim — direct exposure = a fresh auth bucket per header-rotated request).
- Adjudicated CLEAN with evidence: the rate-limit bucket lifecycle (opportunistic eviction in checkRate), npm audit (the single documented F10 braces chain, no new advisories), .env.example completeness (every process.env read has a row), the body-parse envelope contract (all five POST routes catch the JSON rejection), the auth crypto seams (timingSafeEqual on both password and session-HMAC paths), the forgot-password stub (documented D23), D62 (re-verified).
- Remediation plan session18 written + validated, executed TDD-first: R1 the DB-aware health route (db: "up"|"down" via SELECT 1 raced against 1.5s through the S15 withTimeout seam; status stays 200 BY DESIGN — a broken DB is not repaired by a restart; smoke pin RED "expected [up] got []" -> GREEN; probe GREEN both directions). R2 the loud AUTH_SECRET boot warning — the session's hardest-won fix: THREE silent channels (route-module console.error — captured by the Next-16 runtime; the instrumentation hook's process.stderr.write — the stream object is wrapped; a dynamic import("node:fs") — compiles to the turbopack chunk loader which RACES at boot) before the working seam: the STATIC node:fs import + fs.writeSync(2, ...) (verified 206 bytes in the standalone boot log); the forensic loop also exposed that next build COPIES the repo .env into .next/standalone/ (the standalone's own env loading SET AUTH_SECRET from the file — every "unset" probe was testing the wrong thing; the definitive GREEN blanked the standalone's .env). 6 unit pins (incl. the NEXT_RUNTIME-unset standalone reality; the ESM namespace of a builtin cannot be spied — node:fs is partially mocked). R3 the self-initializing image (build-stage db push into /app/db/custom.db + runner COPY — a fresh NAMED volume seeds itself on first mount, zero init commands; bind mounts document the checkout path; the first-account-before-ALLOW_REGISTRATION=false note). R4 the IP-trust docs completion (DEPLOYMENT.md §2 inverse warning + the .env-copy note, clientIpOf doc comment, README troubleshooting row).
- One ZOMBIE-SERVER recurrence caught BY the parity battery: the first post-fix drift re-run collapsed to 0.0000 with concatenated words ("FeaturesHow") — a stale :3030 process (kill+wait silently failed; the third such incident after :3033 and :3044) served old-build HTML against regenerated chunks; the fresh-port move (:3065) restored word parity 1.0000 x8 + the byte-identical mobile nav. The kill-unreliability + fresh-port discipline logged as gotcha 32's tail + SKILL lesson 45.
- Full gate: 395 checks green (132 unit + 66 smoke + 197 e2e — no flake). Screenshots: 20 refreshed (capture script recreated; VLM spot-checks x5 all PASS).
- Docs: PAD (revision block, D87-D90, §7 counts, §8.2/8.3 the self-initializing image + the .env-copy note, §11 key files), AGENTS (gotcha 32 + counts), CLAUDE (session-18 context), README (395 badge + DB-aware health row + 4 troubleshooting rows), SKILL v2.17.0 (lessons 44-45), DEPLOYMENT.md (§2 + §8), .env.example re-verified in sync, remediation plan session18 (ticked), session log docs/session_31.md, this worklog.

Stage Summary:
- Four defects fixed with mechanism-level evidence: the DB-blind health probe (now the db: up|down field — the Docker HEALTHCHECK story can finally SEE the database), the silent AUTH_SECRET fallback (now the fd-2 boot warning — after mapping the Next-16 runtime's THREE log-capture layers), the broken Docker first-run (now the self-initializing image — zero-init named volumes), and the half-documented IP trust model (now stated honestly in docs and code).
- Gate raised 388 -> 395 checks; the production-readiness floor now covers deployment observability, configuration safety signals, the image's first-run story, and the limiter's trust model.
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session18-drift, capture-screenshots-s18, vlm-check-session18).
- Session 18 complete.
---
Task ID: S19-1
Agent: Super Z (main, session 33)
Task: Session 19 — crash-path-honesty (envelope on crash paths + branded server-crash boundary) audit and remediation of the saas-company clone

Work Log:
- Workspace recovery: the sandbox was partially reset — the repo still at the workspace root (Session-18 layout) but with a local-only UUID snapshot commit (ca3dc22) while remote main advanced to 37a0f4b (session-32 transcript). Scripts backed up, local reset to origin/main, scripts restored untracked+excluded, redundant clone removed; clean tree at 37a0f4b. Dev DB re-pushed + re-seeded (checksum e7f6c011). DATABASE_URL trap LIVE — neutralized per-command (env -u DATABASE_URL) all session.
- All repo docs + session docs reviewed (session_31, session_32 — the prior transcript, remediation-plan-18 ticked, worklog); skills/ excluded from toolchains (re-verified).
- Baseline gate: 395 inherited checks ALL GREEN (132 unit + 66 smoke + 197 e2e — no flake).
- Drift battery: word parity 1.0000 on all 8 routes (reference UNCHANGED); mobile-nav paired real-touch probe: clone byte-identical (7 rows x 44px, burger opens with a REAL tap) — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32). Live LOGIN re-verified with the operator credentials — D62 holds.
- Two NEW audit surfaces surveyed with RED-evidence probes: the crash-path envelope layer (a production server booted with an unwritable DATABASE_URL — SEVEN endpoints answered a BARE 500 with an EMPTY body and NO content-type: login, register, newsletter, demo, me-with-session, workflows GET/POST — the "no route returns bare JSON" invariant violated on the worst-day paths; the catalog also captured that Next DOES log unhandled route errors, so a catch must re-log or the operator loses the stack) and the server-crash page layer (/dashboard with a session served Next's unbranded __next_error__ document — the S13 branded-boundary goal never covered SERVER-component crashes). The dependency-currency layer adjudicated CLEAN (npm audit: the documented F10 chain only; npm outdated: majors only).
- Also adjudicated CLEAN with evidence: the security-header layer (S9 F6), session-TTL semantics, logout POST-only (no CSRF logout), the client crash half (apiFetch + json-catch + shape-check), the login page's DB independence.
- Remediation plan session19 written + validated (import-graph scan — api.ts is server-only so the static node:fs import is build-safe; route-shape scan — every handler's apiRoute wrap is mechanical; pin-conflict scan — no unit test imports routes; smoke arithmetic; the /dev/null ENOTDIR determinism), executed TDD-first: R1 apiRoute() in src/lib/api.ts (INTERNAL_ERROR envelope + the fd-2 stack RESTORE via the S18 writeSync seam; classification untouched — the S17 P2002 catch and all handled paths pass through verbatim) wrapping every exported handler in all 10 route files + 5 unit pins (RED "not a function" -> GREEN 137/137) + 13 smoke pins on a THIRD mini-server (:3230, unwritable DB, same AUTH_SECRET so the main server's session cookie is valid there; RED against the pre-fix build: envelope code got [], content-type got [], dashboard got [500], no branded fallback, __next_error__ present -> GREEN 79/79). R2 the dashboard page's two NARROW try/catch blocks (redirect calls OUTSIDE — redirect() throws a control error a wide catch would swallow, breaking the S14 gate) rendering the branded dashboard-unavailable.tsx (role=alert, Reload + Go-to-home, status 200 BY DESIGN — the S18 health-probe pattern; /api/health's db field owns the alerting).
- Full gate: 413 checks green (137 unit + 79 smoke + 197 e2e — no flake). Re-verification: the crash catalog GREEN on the remediated build (every 500 an envelope; 9 [api:unhandled] stacks in the broken server's log); the drift battery re-run hit TWO tooling incidents — a zombie :3070 (kill+wait failed again) AND a runner/survey port mismatch (the survey's hardcoded :3070 default probed the zombie while the runner's fresh :3075 server sat unused) — diagnosed by CSS-links-vs-disk + stylesheets-in-Chromium (the fresh server: 141 rules, bodyBg rgb(0,0,0), spaced nav text) and re-probed GREEN on the verified port: word parity 1.0000 x8, mobile-nav byte-identical. The :3100 e2e evidence validated as fresh (the port was dead pre-run). Logged as gotcha 33 + SKILL lesson 47.
- Screenshots: the standard 20-shot set refreshed (fresh :3090 boot, canonical workspace e7f6c011, explicit SHOT_BASE). VLM spot-checks x5 PASS — after adjudicating the first pass's dashboard "failure" as CHECK-PROMPT drift (the prompt expected a "Welcome back" greeting the dashboard never had; its header is the Nova.AI/Dashboard bar + email) and correcting the prompts to the ACTUAL contracts.
- Docs: PAD (revision block, D91-D92, §7 counts, §11 key files), AGENTS (gotcha 33 + counts + the envelope invariant naming apiRoute), CLAUDE (session-19 context + checklist counts), README (413 badge + crash-envelope + workspace-unavailable rows + a stale 126/65 count pair fixed), SKILL v2.18.0 (lessons 46-47), .env.example re-verified in sync, remediation plan session19 (ticked), session log docs/session_33.md, this worklog.

Stage Summary:
- Two defects fixed with mechanism-level evidence: the crash-path envelope violation (7 endpoints answered bare empty 500s — now every escaping error is the INTERNAL_ERROR envelope with the operator's stack RESTORED to fd 2, classification untouched) and the unbranded server-crash dashboard page (Next's __next_error__ document — now the branded Workspace-unavailable degraded view, status 200 by design).
- Gate raised 395 -> 413 checks; the production-readiness floor now covers the crash paths of every API route and the server-component half of the S13 branded-boundary goal.
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session19-drift, survey-session19-crash, survey-session19-live-login, diag-css, run-s19-drift, run-s19-shots, vlm-check-session19).
- Session 19 complete.
---
Task ID: S20-1
Agent: Super Z (main, session 35)
Task: Session 20 — method-and-payload (the method-mismatch envelope + the request-size ceiling) audit and remediation of the saas-company clone

Work Log:
- Workspace fully reset: fresh git clone (HEAD 7898e75 on main, == origin/main, clean — the session-34 transcript on top of the S19 remediation 6be9888). Environment rebuilt: npm install, .env from .env.example (fresh AUTH_SECRET), prisma generate, db:push + db:seed (canonical checksum e7f6c011). Exported DATABASE_URL trap LIVE — neutralized per-command (env -u DATABASE_URL) all session. Survey scripts recreated under /home/z/my-project/scripts/ (local-only).
- All repo docs + session docs reviewed (session_33, session_34 — the prior transcript, remediation-plan-19 all-but-push ticked with the push verified by the git state, worklog); skills/ excluded from toolchains (re-verified).
- Baseline gate: 413 inherited checks ALL GREEN (137 unit + 79 smoke + 197 e2e — no flake).
- Drift battery (recreated, EXPLICIT --base per gotcha 33): the first run collapsed to ~0.07 — THIS SESSION'S OWN tooling bug: the raw-fetch probe read the live's UN-HYDRATED SPA shell (~130 words every route). The honest method renders BOTH sides in Chromium and diffs document.body.innerText. GREEN: word parity 1.0000 x8 (reference UNCHANGED); mobile-nav paired real-touch probe: clone byte-identical (7 rows — 6 anchors + the Log In button — every row 44px, burger opens with a REAL tap; the first probe's selector missed the Log In BUTTON and undercounted 6) — NO Tailwind v4 bug; the live's burger remains pointer-blocked (D32). Live LOGIN re-verified — D62 holds (the SPA-404 adjudicated on the RENDERED content: the server answers 200 for any route).
- Two NEW audit surfaces surveyed with RED-evidence probes: the method-mismatch layer (the framework-owned answer BELOW every handler — 11 probes answered a BARE 405 with an EMPTY body, NO content-type, NO Allow, NO Cache-Control: GET on the six POST-only routes, POST on the two GET-only routes, PUT/PATCH/DELETE on workflows, HEAD on a POST-only route; the security headers DO cover framework answers; Next's auto-OPTIONS 204+Allow and the branded unknown-route 404 both adjudicated CLEAN) and the request-size layer (a 50MB login body fully buffered and JSON-parsed in 314ms before validation — no ceiling in code or docs; the largest real payload < 2KB; the rate limits cap frequency, never size). The currency layer re-adjudicated CLEAN (npm audit: the documented F10 chain only; npm outdated: majors only). Also adjudicated CLEAN: the cookie-attribute layer (httpOnly/Lax/secure-in-prod re-verified in code), scrypt params, the register-409 by-design enumeration trade-off.
- Remediation plan session20 written + validated (route-shape scan — every handler's guard exports are additive module-level consts; pin-conflict scan — no existing pin sends an unexported method or a >128KB body; smoke arithmetic — the new section's auth/newsletter POST budgets; the parse-adjacent placement provably behavior-preserving), executed TDD-first: R1 methodGuard(allow) + optionsGuard(allow) in src/lib/api.ts + guard exports across all 10 route files (the 405 METHOD_NOT_ALLOWED envelope + the RFC 9110 Allow header listing the REAL methods + no-store/content-type via the fail() seam; the explicit OPTIONS export keeps the 204 preflight honest — Next's auto-answer enumerates exports and would over-report) — RED 8/8 unit pins ("the helpers do not exist") -> GREEN 145/145. R2 bodyTooLarge(request) + MAX_JSON_BODY_BYTES (128KB) placed immediately BEFORE request.json() in the 7 body-parsing handlers (a declared over-ceiling body answers 413 PAYLOAD_TOO_LARGE at the header — re-probed: the 50MB body rejected in 91ms vs the pre-fix 314ms full parse; chunked bodies are the proxy's residual — DEPLOYMENT.md §2 body-cap note). Smoke +15 pins (the method envelope x10 incl. Allow/no-store/content-type + OPTIONS 204; login 2MB -> 413 + envelope code; the broken server's fresh newsletter bucket: 2MB -> 413, the under-ceiling 100KB -> 400 VALIDATION — the ceiling does not over-block) -> 94/94. TWO mid-execution probe bugs caught BY the pins: the newsletter 413 pin first tripped the MAIN server's consumed newsletter bucket (moved to the third server's fresh bucket — the guard fires before any DB touch), then failed again because the "2MB" probe body was actually 31 BYTES (the generator forgot to pad the email; the route correctly parsed + validated + hit the broken DB's upsert for INTERNAL_ERROR — the route was right, the probe wrong).
- Full gate: 436 checks green (145 unit + 94 smoke + 197 e2e — no flake). Re-verification: the method + body-size catalog GREEN on the remediated build (every 405 an envelope with Allow + no-store + content-type + the security headers; every giant body a 413 in 15-91ms); the drift battery re-run GREEN (word parity 1.0000 x8, mobile-nav byte-identical, D62 holds) — zero regressions from the route changes.
- Screenshots: the standard 20-shot set refreshed (fresh :3095 boot, canonical workspace verified by checksum before and after). VLM spot-checks x5 PASS — after adjudicating THREE check-prompt drifts against the ACTUAL contracts (the hero's dashboard mockup sits below the 900px fold; the login card's real contract is the S-logo chip + "Welcome to SAAS Company"; its element order is Google -> or -> email -> password -> Sign In) — the S19 lesson recurring: the deterministic evidence (word parity 1.0000 + the e2e login-states pins) always adjudicates.
- Docs: PAD (revision block, D93-D94, §7 counts, §11 key files incl. the merged api.ts row + the stale 65-check smoke row fixed), AGENTS (gotcha 34 + counts + the invariant line naming the method guards + the size ceiling), CLAUDE (session-20 context + checklist counts), README (436 badge + method-envelope + payload-ceiling rows + the stale 126/65 Testing-block counts fixed), SKILL v2.19.0 (lessons 48-49), DEPLOYMENT.md §2 (the proxy body-cap note), .env.example verified in sync (no new vars — the ceiling is a code constant), remediation plan session20 (ticked), session log docs/session_35.md, this worklog.

Stage Summary:
- Two defects fixed with mechanism-level evidence: the method-mismatch layer (11 bare empty 405s — now every unimplemented method on every route answers the METHOD_NOT_ALLOWED envelope with the real-methods Allow header, no-store, and content-type; the explicit OPTIONS export keeps the preflight honest) and the unbounded request-size parse (a 50MB body fully buffered — now a 128KB declared ceiling answers 413 at the header before any buffering, with the proxy note as the belt-and-braces half).
- Gate raised 413 -> 436 checks; the production-readiness floor now covers the method matrix of every route and the request-size layer — the invariant "no route returns bare JSON" holds on the handled, crash, AND method paths.
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session20-drift + run wrapper, survey-session20-method, survey-session20-bodysize, capture-screenshots-s20, vlm-check-session20).
- Session 20 complete.
---
Task ID: S21-1
Agent: Super Z (main, session 39)
Task: Session 21 — data-volume honesty (the workflows list ceiling + honest aggregates + the creation-frequency ceiling) audit and remediation of the saas-company clone

Work Log:
- Workspace: the repo survived the sandbox reset at the workspace root; git pull fast-forwarded a1e1529 -> e850249 (session_37.md — the only delta; the prior transcript's own commit). Environment verified (node_modules, db/, .env); the dev DB had drifted (c4231a70 — prior sessions' probe traffic) -> re-pushed + re-seeded (canonical e7f6c011). Exported DATABASE_URL trap LIVE — neutralized per-command all session.
- All repo docs + session docs reviewed (session_36, session_37 — the prior transcript, remediation-plan-20 fully ticked incl. the wrapper-verified push, worklog); skills/ excluded from toolchains (re-verified).
- Baseline gate: 436 inherited checks ALL GREEN (145 unit + 94 smoke + 197 e2e — no flake).
- Drift battery (fresh :3115 runner, EXPLICIT --base): word parity 1.0000 x8 (reference UNCHANGED); mobile-nav paired real-touch probe: clone byte-identical (7 rows — 6 anchors + the Log In button — every row 44px, REAL tap opens) — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32). Live LOGIN re-verified — D62 holds.
- NEW audit surface (the OUTPUT twin of S20's request-size survey — what a response may RETURN, what a page query may FETCH, what the client may RENDER), RED-confirmed on a probe-only DB (db/probe-s21.db, 400 seeded workflows): GET /api/workflows answered a 134.5KB body (findMany with no take, no pagination, linear growth); GET /dashboard mounted 400 article cards (9,649 DOM nodes, 1036ms — the chart slices to 8, the LIST renders everything); POST /api/workflows is the ONLY unthrottled mutation in the app (a script mints unbounded rows); the stat cards + the "N total" counter derive from the fetched list (a ceiling would silently turn them into subset summaries).
- Adjudicated CLEAN with evidence: the PATCH numeric-integrity layer (runs/successRate/timeSavedHours are server-controlled, not patchable), the SEO static-asset layer (og-image a real 1200x630 PNG; manifest valid; robots/sitemap the honest SUPERSET semantics — the live's allow-all protects nothing), the logging-hygiene layer (the probe server's log after the full survey traffic: boot banner only, zero PII), the hero-video layer (1.9MB, muted + playsInline + aria-hidden), the dependency currency (the documented F10 chain only; majors only).
- Remediation plan session21 written + validated (ok() opts-object additive — every existing call site compiles; the error-boundary mocks' bare-array payloads keep working through the optional-meta fallback; smoke rate-limit arithmetic — create + invalid-status POSTs consume the WORKFLOW_RATE_LIMIT_MAX=2 budget deterministically; the generate route's internal creates ride the separate gen: bucket), executed TDD-first: R1 MAX_WORKFLOW_LIST=100 + statsFromAggregate() in src/lib/workflow.ts + the meta-carrying ok() in src/lib/api.ts + take/count/aggregate in GET /api/workflows AND the dashboard page + the client's serverStats/total state with the memo fallback + the honest truncation note — RED 9/11 ("the helpers do not exist") -> GREEN 11/11. R2 workflowRateLimit(userId) (30/USER/15min, WORKFLOW_RATE_LIMIT_MAX override, 429 + Retry-After, ordered session -> limiter -> body parse) -> GREEN. Smoke +9 pins (105 probe rows seeded directly into the smoke DB: data.length == 100, meta.total == 111, meta.stats.active == 75 / runs == 8170 / hours == 265, no-store intact; the limiter trip 429 + RATE_LIMITED + Retry-After) -> 103/103.
- Full gate: 456 checks green (156 unit + 103 smoke + 197 e2e — no flake; e2e unchanged — the stats values identical server-side/client-side for the seeded story). Re-verification: the data-volume survey GREEN on the remediated build (100 rows / 33.7KB / meta.total 400 / 100 articles / 2,584 DOM nodes / the truncation note visible) — the FIRST re-run probed a ZOMBIE (a setsid-detached diagnostic server still held :3120; the runner's fresh boot hit a silently-swallowed EADDRINUSE — the gotcha-26/31 family's FOURTH member; killed + re-probed GREEN, logged as gotcha 35's tail + SKILL lesson 51); the drift battery re-run GREEN (zero regressions from the route/page/client changes).
- Screenshots: the standard 20-shot set refreshed (fresh :3130 boot, canonical DB verified by seed-checksum before and after). VLM spot-checks x5 — the first pass flagged the login chip's "light gray" background: adjudicated as the FOURTH check-prompt drift (the actual markup is from-slate-100 to-slate-200 — a LIGHT gradient, exactly what the VLM saw; the login card untouched this session; word parity 1.0000 + the untouched bytes prove the page correct). Prompt corrected to the ACTUAL contract -> 5/5 PASS.
- Survey-tooling lessons: Playwright's context.cookies(url) FILTERS Secure cookies on plain http (127.0.0.1 is trustworthy for navigation, not for cookie enumeration — enumerate with no args, match by name); a setsid-detached survey server OUTLIVES its diagnostics (kill explicitly or probe fresh ports); a workspace-root probe script needs NODE_PATH to resolve @prisma/client.
- Docs: PAD (revision block, D95-D96, §7 counts 156/103/197 = 456, §11 key files incl. api-meta/workflow-ceiling rows + the smoke 103 row + the dashboard-app meta row), AGENTS (gotcha 35 + counts + the invariant line naming the meta sibling), CLAUDE (session-21 context + checklist counts), README (456 badge + data-ceiling + creation-limiter rows + the stale 145/94 verification counts fixed), SKILL v2.20.0 (lessons 50-51), DEPLOYMENT.md §3 (the WORKFLOW_RATE_LIMIT_MAX env row), .env.example (the new limiter row — verified in sync), remediation plan session21 (ticked), session log docs/session_38.md, this worklog.

Stage Summary:
- Two defects fixed with mechanism-level evidence: the unbounded workflows list (400 rows -> a 134.5KB response + 400 mounted article cards — now the SQL take caps the wire at 100 rows/34KB while the additive meta sibling carries the TRUE total + honest server-side aggregates, and the capped UI states the truncation truth) and the unthrottled workflow creation (the only unthrottled mutation in the app — now 30/USER/15min with the 429 + Retry-After contract).
- Gate raised 436 -> 456 checks; the production-readiness floor now covers the OUTPUT side of the wire — the invariant "no route returns bare JSON" extends to "no route returns an unbounded JSON".
- Survey scripts persisted under /home/z/my-project/scripts/ (run-s21-drift, run-s21-datavolume + survey-session21-datavolume + seed-probe21, diag-s21-login, diag-s21-cookie, vlm-check-session21).
- Session 21 complete.

---
Task ID: S22-1
Agent: Super Z (main, session 41)
Task: Session 22 — mutation-concurrency (the [id] read-check-act race) + cross-user-ownership audit and remediation of the saas-company clone

Work Log:
- Sandbox fully reset: fresh git clone (HEAD 5d04c52 on main, == origin/main, clean). Environment rebuilt (npm install, .env from .env.example with fresh AUTH_SECRET, prisma generate, db:push + db:seed — canonical e7f6c011). Exported DATABASE_URL trap neutralized per-command all session; no zombie servers (verified).
- All repo docs + session docs reviewed (session_39/session_40 — the Session-21 transcripts, remediation-plan-21 fully ticked incl. the wrapper-verified push, worklog); skills/ excluded from toolchains (re-verified); the skills catalog consulted (code-review-and-audit / tdd / agent-browser families).
- Baseline gate: 456 inherited checks ALL GREEN (156 unit + 103 smoke + 197 e2e — no flake).
- Drift battery (recreated with EXPLICIT --base, Chromium-rendered both sides): word parity 1.0000 x8 (reference UNCHANGED); mobile-nav paired real-touch probe: clone byte-identical (7 rows — 6 anchors + the Log In button — every row 44px, REAL tap opens) — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32). Live LOGIN re-verified — D62 holds.
- NEW audit surface (the S21-suggested layers): the mutation-concurrency semantics + a performance-budget survey. RED-confirmed on a probe-only DB (db/probe-s22.db, gotcha-30): Race B (a ~100KB PATCH body at 60KB/s parses ~1.7s; a DELETE at +0.7s commits mid-parse) — the PATCH's update() threw UNCLASSIFIED P2025 -> the 500 INTERNAL_ERROR envelope 3/3 (a legitimate two-tab user); Race A (parallel DELETE||DELETE) answered 500 in 2/5 (nondeterministic). F2: the cross-user ownership (IDOR) guard had NO wire-level pin anywhere. Performance layer adjudicated CLEAN (landing LCP 732ms / 860 DOM nodes; dashboard LCP 120ms / 314 nodes — the S21 ceiling holding; the 1.9MB hero video is the reference's own parity asset); SEO surface re-verified (sitemap/robots/og-image/manifest all correct); PATCH/DELETE limiters adjudicated NON-findings (no row growth).
- Remediation plan session22 written + validated (Prisma semantics probed: updateMany no-match -> count 0; EMPTY data -> count 0 EVEN for an existing row — the quirk driving the empty-patch branch; deleteMany never throws; response-contract scan preserved every pinned shape; no 413 pin targets the workflows PATCH), executed TDD-first: the smoke "Session 22" section written FIRST (14 checks: the cross-user battery, the empty-patch contract, Race B x3, Race A x2) — RED observed (the raced PATCH answered 500 + INTERNAL_ERROR; 2 failed / 115 passed). TWO mid-execution pin bugs caught BY the pins (curl's -w '%{http_code}' writes NO trailing newline — a concatenated cat c* can never match ^200$; bash's ${f/c/r} rewrites the first 'c' in the mktemp PATH, not the c<index> stem — pair by explicit index).
- GREEN — the fix closes the race BY CONSTRUCTION (the ownership predicate rides the write): PATCH -> updateMany({ where: { id, userId }, data }) (count 0 -> the honest 404; a follow-up findFirst returns the row; the empty-patch {} body keeps its 200 + row contract) and DELETE -> deleteMany({ where: { id, userId } }) (one atomic query; the double-fire loser deterministically reads 404). Lint + typecheck + 156/156 unit + build + SMOKE 117/117 (run twice — no flake) + 197/197 e2e.
- Full gate: 470 checks green (156 unit + 117 smoke + 197 e2e). Re-verification: the race probe GREEN on the remediated build (Race B: PATCH 404 x3 / DELETE 200 x3 — was 500 x3; Race A: one 200 + one 404 every try, zero 500s); the drift battery re-run GREEN (zero regressions from the route change).
- Screenshots: the standard 20-shot set refreshed (a fresh :3140 boot with AUTH_RATE_LIMIT_MAX=50 — the first capture run silently exhausted the default-10 auth bucket and shot the login page into 08/15; re-booted with the e2e convention; the DB logical state verified canonical e7f6c011 before and after — the md5 drift is SQLite page artifacts). VLM spot-checks x5 — after adjudicating the FIFTH check-prompt drift (a FAIL-with-empty-DEVIATIONS on the dashboard shot, disproven by the open-description probe + the untouched bytes + the e2e suite) -> 5/5 PASS.
- Docs: PAD (revision block, ledger D97-D98, section 7 counts 156/117/197 = 470, section 11 key files incl. the [id]-route row), AGENTS (gotcha 36 + counts + the invariant line naming the ownership-scoped writes), CLAUDE (session-22 context + the stale stack-table counts fixed), README (470 badge + the concurrency row + every stale count), SKILL v2.21.0 (lessons 52-53), .env.example verified in sync (no new env vars), remediation plan session22 (ticked), session log docs/session_41.md, this worklog.

Stage Summary:
- One defect fixed with mechanism-level evidence: the [id] mutation-concurrency race (an unclassified P2025 answered 500 INTERNAL_ERROR for legitimate concurrent use — probed 3/3 on the deterministic race, 2/5 on the double-fire) — now the writes carry the ownership predicate (updateMany/deleteMany with userId in the WHERE; count 0 is the honest 404) and the race is closed by construction, with the empty-patch 200 contract preserved.
- One pin gap closed: the cross-user ownership battery (user A on user B's row -> 404 x3 + the survived row) — a dropped userId regression is now a guaranteed smoke failure instead of a silent IDOR.
- Gate raised 456 -> 470 checks; the production-readiness floor now covers the RACE side of every mutation — the invariant "no route returns bare JSON" extends to "no legitimate race returns an INTERNAL_ERROR".
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session22-drift, probe-s22-race, probe-s22-prisma-semantics, survey-s22-perf, capture-s22-shots, vlm-check-s22).
- Session 22 complete.

---
Task ID: S23-1
Agent: Super Z (main, session 43)
Task: Session 23 — client-side failure-class honesty (the honest-404 dispatch + the refresh ordering guard) audit and remediation of the saas-company clone

Work Log:
- Workspace: git pull fast-forwarded d58e188..6ccf116 (session_42.md — the prior transcript; S22 complete and wrapper-verified pushed). Environment verified intact (node_modules, db/, .env); no zombies on the gate ports; the exported DATABASE_URL trap neutralized per-command all session.
- All repo docs + session docs reviewed (session_41/session_42 — the Session-22 transcripts, remediation-plan-22 fully ticked, worklog); skills/ excluded from toolchains (re-verified); the skills catalog consulted.
- Baseline gate: 470 inherited checks ALL GREEN (156 unit + 117 smoke + 197 e2e — no flake).
- Drift battery (recreated with EXPLICIT --base on a fresh :3150 boot, Chromium-rendered both sides): word parity 1.0000 x8 (reference UNCHANGED); mobile-nav paired real-touch probe: clone byte-identical (7 rows — 6 anchors + the Log In button — every row 44px, REAL tap opens) — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32). Live LOGIN re-verified — D62 holds. SEO surface re-verified (sitemap/robots/og-image/manifest all correct); dependency currency re-adjudicated (the documented F10 chain only; majors only).
- NEW audit surface (the S42-suggested "optimistic-UI semantics" — the CLIENT side of the mutation contract): F1 — the honest-404 dispatch missing (S22's honest 404 answered with the retry-lie banner "Try again." + the ghost row staying mounted; probed with two browser contexts on the probe-only server :3160 / db/probe-s23.db, gotcha-30); F2 — refresh() had no in-flight ordering guard (two concurrent actions on different rows; a route-delayed stale snapshot landing last RESURRECTED the deleted row — probed deterministically).
- Remediation plan session23 written + validated against the codebase (session-lifecycle/resilience/error-boundary pins re-read — no conflicts; abort faults reject at fetch, the 401 pins assert the landed login card, the boundary mocks ride the optional-meta fallback), executed TDD-first: the e2e spec written FIRST — RED observed 3/3 on the pre-fix build (the (a)/(b) ghost+banner, the (c) resurrection). TWO mid-execution pin bugs caught BY the pins: Next.js's route announcer is ITSELF a role=alert element carrying the page title (an unfiltered alert-count pin can never pass — filter by text, the session-lifecycle pattern); and suite-order coupling (the spec initially sorted BEFORE dashboard.spec.ts and shared a victim row between tests — renamed session23-honesty.spec.ts with status-tolerant selectors + per-test victim rows).
- GREEN — R1 the client failure-class dispatch: PATCH-404 drops the ghost row locally + re-syncs + the polite role=status announce ("… is no longer in the workspace."); DELETE-404 is the idempotent-success contract ("… was already removed."); the SessionExpired early-return in all three catches enforces the documented "no banner for 401s" S13 contract by construction. R2 the refresh() sequence guard: a useRef counter drops any response superseded by a newer refresh (no stale-snapshot resurrection). Lint + typecheck + 156/156 unit + build + 117/117 smoke + 200/200 e2e (the full suite re-run — the new spec integrated cleanly).
- Full gate: 473 checks green (156 unit + 117 smoke + 200 e2e). Re-verification: the client-honesty probe GREEN on the remediated build (no retry lie, no ghost, no resurrection); the drift battery re-run GREEN (zero regressions from the client change).
- Screenshots: the standard 20-shot set refreshed — the capture phase found its OWN defect (survey tooling, the gotcha-30 family): the error-boundary shot's route mock used the glob **/api/workflows which does NOT match /api/workflows/[id] — the mock's own Pause-click ESCAPED to the real server and paused a dev-DB row (the timestamps proved the S22 sessions had closed with the same drift: the seed checksum covers rows/names, not STATUSES); the mock now covers the [id] routes, the dev DB re-seeded to canonical (e7f6c011), and the re-run 20-shot refresh left it canonical (before/after verified). VLM spot-checks x5 — after adjudicating the SIXTH check-prompt drift (a "missing 3 workflow cards" verdict on the dashboard shot, disproven by the 900px viewport cut — the cards extend below the fold by design; prompt corrected to state the viewport) -> 5/5 PASS.
- Docs: PAD (revision block, ledger D99-D100, §7 counts 156/117/200 = 473, §11 key files incl. the dashboard-app client-dispatch row + the session23-honesty spec row + the stale 103 smoke count fixed to 117), AGENTS (gotcha 37 + counts 473/200 + the invariant line naming the client dispatch), CLAUDE (session-23 context + stack-table/checklist counts), README (473 badge + the client-honesty row + every stale count), SKILL v2.22.0 (lessons 54-55), .env.example verified in sync (no new env vars — the fixes are client-code only), remediation plan session23 (ticked), session log docs/session_43.md, this worklog.

Stage Summary:
- Two defects fixed with mechanism-level evidence: the missing client honest-404 dispatch (the retry-lie banner + the ghost row — now the 404 class mirrors the truth: the row dropped locally, the server re-synced, the polite announce; a raced DELETE is idempotent success) and the unguarded refresh() ordering (a delayed stale snapshot resurrected a deleted row — now the sequence counter guarantees the newest server truth always wins).
- One survey-tooling defect fixed: the capture script's route-mock glob escaped to the real server and landed mutations on the dev DB across TWO sessions (the seed checksum covered rows/names, not statuses) — the mock now covers the [id] routes and the dev DB logical state is verified before/after every capture run.
- Gate raised 470 -> 473 checks; the production-readiness floor now covers the CLIENT side of the mutation contract — the S13 failure-class law ("distinct UI contracts per failure class") is enforced at the wire AND in the client, and the invariant "no route returns bare JSON" extends to "no client renders a lie".
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session23-drift, probe-s23-client-honesty, capture-s23-shots, vlm-check-s23, db-state-s23, boot-s23-drift, boot-s23-probe).
- Session 23 complete.

---
Task ID: S24-1
Agent: Super Z (main, session 45)
Task: Session 24 — temporal-and-placement honesty (the client fetch timeout + the cross-class banner clearing + the deterministic seed placement) audit and remediation of the saas-company clone

Work Log:
- Sandbox fully reset: fresh git clone (HEAD 8f92ff0 on main, == origin/main, clean — Session 23 complete and wrapper-verified pushed; session_44.md the prior transcript). Environment rebuilt (npm install, .env from .env.example with fresh AUTH_SECRET, prisma generate, db:push + db:seed). The exported DATABASE_URL trap LIVE in a new form — the sandbox provisions BOTH a shell-exported absolute DATABASE_URL and a parent /home/z/my-project/.env (gotcha 1's vectors); neutralized per-command (env -u DATABASE_URL) once diagnosed (see F3).
- All repo docs + session docs reviewed (session_43/session_44 — the Session-23 transcripts, remediation-plan-23 fully ticked, worklog); skills/ excluded from toolchains (re-verified); the skills catalog consulted (tdd / agent-browser / code-review-and-audit).
- Baseline gate: 473 inherited checks ALL GREEN (156 unit + 117 smoke + 200 e2e — no flake).
- Drift battery (recreated with EXPLICIT --base on a fresh :3150 boot, Chromium-rendered both sides): word parity 1.0000 x8 (the 8th route being the 404 itself — both sides render the identical 16-word card; /demo is the clone's superset route, excluded by design; reference UNCHANGED); mobile-nav paired real-touch probe: clone byte-identical (7 rows — 6 anchors + the Log In button — every row 44px, REAL tap opens) — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32). Live LOGIN re-verified — D62 holds. SEO surface re-verified (sitemap 200 application/xml x8; robots superset; og-image 1200x630; manifest.json valid); dependency currency re-adjudicated (the documented F10 chain only; majors only).
- NEW audit surface (the S44-suggested surfaces extended to their class — the TEMPORAL + PLACEMENT dimensions of client state): F1 — the client hang class (no client fetch carried a timeout; a never-fulfilling page.route on the PATCH left the busyId spinner STILL engaged after 8s with NO banner — the S12 resilience pins cover aborts, which reject immediately, so the hang class was invisible to every gate; the same class on all five client fetch sites). F2/F2b — the stale-banner class (a failed compose's error stayed mounted after a SUCCESSFUL unrelated pause, and a failed pause's global banner stayed mounted after a SUCCESSFUL compose — probed RED in both directions, the S13/S23 lie-by-staleness family). F3 — the seed-placement class (found IN VIVO during the environment rebuild: the seed reported success but wrote OUTSIDE the repo while the app opened the 0-byte <repo>/db/custom.db and login answered P2021 INTERNAL_ERROR; root cause: gotcha 1's vectors — the sandbox's shell-exported absolute DATABASE_URL + parent .env; the seed's raw new PrismaClient() had no anchor resolution, no observability, no pin; smoke/e2e immune via per-command env pinning).
- Remediation plan session24 written + validated against the codebase (pin-conflict scans: aborts reject at fetch, the S23 delayed-GET is 1200ms, no pin asserts banner survival across a subsequent action, the smoke/e2e seed invocations keep their explicit env; suite-order scan — the new spec sorts after session23-honesty whose tests delete three seeded rows: survivor victims + status-tolerant selectors + composed-row cleanup), executed TDD-first: R1 fetchWithTimeout (src/lib/client-fetch.ts, 20s ceiling — above the server's own 10s SDK timeout) riding ALL five client fetch sites — RED 8/8 unit pins ("the helpers do not exist") + 4/4 e2e (the hang never converts; both banners stay stale) -> GREEN. R2 every action start clears BOTH error surfaces. R3 parseEnvValue + selectDatabaseUrl + resolveCliDatabaseUrl seams in db-path.ts + the seed's pre-set env + seed-target: line + scripts/prisma-with-db.ts routing db:push/migrate/reset (deterministic precedence: process env -> repo .env -> default; non-SQLite passthrough preserved).
- TWO mid-execution pin bugs caught BY the pins (the S22 family): the first hang pin used an inert never-settling fetch mock — which IGNORES the abort signal, making the rejection unobservable (pinned instead against a REAL hung TCP socket: net.createServer accepting and never answering); and the F1 probe's 8s window was shorter than the fix's 20s ceiling (the post-fix probe needed 22s to observe the CONVERSION; the e2e pins used Playwright's clock API — install + fastForward(21_000) — all along, making the ceiling cost milliseconds).
- Full gate: 486 checks green (164 unit + 118 smoke + 204 e2e — the smoke's new seed-target placement pin included; unit + smoke re-run). Re-verification: the temporal probe GREEN 3/3 on the remediated build (the hang converts to the banner + busy release; both stale banners clear); the seed-placement in-vivo verification GREEN ([db] DATABASE_URL=<repo>/db/custom.db + seed-target: + 57344 bytes + 6 rows/5 active, clean shell); the drift battery re-run GREEN (zero regressions from the client changes).
- Screenshots: the standard 20-shot set refreshed (fresh :3170 boot with AUTH_RATE_LIMIT_MAX=50; the error-boundary mock covers the [id] routes — the S23 fix; the dev DB logical state verified CANONICAL before AND after: rows=6, runs=7120, active=5). VLM spot-checks x5 — after adjudicating the SEVENTH and EIGHTH check-prompt drifts (the hero's primary CTA IS "Book a Demo" — Get Started lives in the navbar, both roles pinned by the landing spec; the demo page's footer sits below the 900px fold — footerTop 1009 of a 1378px page, geometry-probed) -> 5/5 PASS with the corrected contracts.
- Docs: PAD (revision block, ledger D101-D103, §7 counts 164/118/200 = 486, §11 key files incl. the client-fetch + db-path-selection + seed/wrapper + session24-temporal-spec rows + the dashboard-app temporal layer), AGENTS (gotcha 38 + counts + the invariant line naming the client timeout + the placement discipline), CLAUDE (session-24 context + stack-table/checklist counts), README (486 badge + the temporal-honesty row + every stale count), SKILL v2.23.0 (lessons 56-57), .env.example verified in sync (no new env vars — the timeout is a code constant), remediation plan session24 (ticked), session log docs/session_45.md, this worklog.

Stage Summary:
- Three defects fixed with mechanism-level evidence: the client hang class (a black-holed request left the busy spinner engaged FOREVER — now every client fetch rides the 20s fetchWithTimeout ceiling and the hang converts into the existing network-fault banner + busy release), the stale-banner class (both error surfaces outlived their context — now every action start clears BOTH, so a failure surface lives exactly until the user's next action of ANY class), and the seed-placement class (the first-run db:push/db:seed relied on env resolution outside the app's tested seam — now deterministic through the db-path selection seams + OBSERVABLE via seed-target:/[db] lines, pinned at the smoke level).
- Gate raised 473 -> 486 checks; the production-readiness floor now covers the TEMPORAL dimension of the client contract (the S23 client-honesty law extended: no client renders a lie, and no client KEEPS rendering one after the truth arrives) + the first-run placement story (the seed always writes where the app reads).
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session24-drift, probe-s24-client-time, capture-s24-shots).
- Session 24 complete.

---
Task ID: S25-1
Agent: Super Z (main, session 47)
Task: Session 25 — runs-chart honesty + observability (the chart truncation note + the semantic list + the performance-budget hook) audit and remediation of the saas-company clone

Work Log:
- Workspace: git pull fast-forwarded 0c19f6c..e302042 (session_46.md — the prior transcript; S24 complete and wrapper-verified pushed). Environment verified intact (node_modules, db/custom.db canonical 6 rows / 7120 runs / 5 active, .env with DATABASE_URL="file:../db/custom.db"); the exported DATABASE_URL trap LIVE — neutralized per-command all session. NEW sandbox behavior discovered: detached servers are REAPED between tool calls (adapted: boot-and-probe in single calls, servers killed at block end).
- All repo docs + session docs reviewed (session_45/session_46 — the Session-24 transcripts, remediation-plan-24 fully ticked, worklog); skills/ excluded from toolchains (re-verified); the skills catalog consulted (tdd / agent-browser / clone-app families).
- Baseline gate: 486 inherited checks ALL GREEN (164 unit + 118 smoke + 204 e2e — no flake).
- Drift battery (recreated from the persisted S24 script, explicit --base on a fresh :3180 boot, Chromium-rendered both sides): word parity 1.0000 x8 (reference UNCHANGED; the 8th route the 404; /demo the superset route, excluded by design); mobile-nav paired real-touch probe: clone byte-identical (7 rows — 6 anchors + the Log In button — every row 44px, REAL tap opens) — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32). Live LOGIN re-verified — D62 holds. SEO surface re-verified (sitemap 200 application/xml x8; robots superset; og-image 1200x630; manifest valid); performance layer re-measured (landing LCP 388ms / 860 DOM; login LCP 192ms; dashboard LCP 100ms); dependency currency re-adjudicated (majors only — the documented F10 chain).
- NEW audit surface (the S46-suggested surfaces extended to their class — the runs chart's honesty + semantics, plus the unguarded performance budgets; probed on :3190 / db/probe-s25.db, gotcha-30, a 12-row workspace seeded directly): F1 — the chart truncation lie (slice(0,8) silently dropped rows with NO note while the heading read "Runs by workflow" — the S21 "a ceiling that lies" family found in the chart; the LIST got its honest note in S21 R1, the chart never did; the seeded 6-row workspace hides every ceiling above 6). F2 — the 4%-floor clamp (runs 3 and 60 render IDENTICAL 4% bars against a 6000 max — ADJUDICATED a non-finding: the adjacent exact values are the honest contract, the floor a visibility minimum). F3 — the chart's missing list semantics (div soup — a screen reader never heard "list, N items"; axe-core on the logged-in dashboard: ZERO violations — the S10 fixes hold). The performance budgets unpinned (the S21/S22 ceilings measured ad hoc — the S46 hook candidate).
- Remediation plan session25 written + validated against the codebase (pin-conflict scans: no spec references the chart; the only 429 pins are route-fulfilled — immune to the config-level limiter pin; suite-order scan: session25-chart sorts after session24-temporal, asserts against surviving rows, mints + cleans up its own surplus via the authenticated create API in-page fetch — gotcha 30), executed TDD-first: RED 3/3 on the pre-fix build (li count 0 — divs; the note absent; the list role absent; the 4 budget pins pass by design — preventive). GREEN: R1 CHART_ROWS + the S21-pattern note with the TRUE total; R2 the semantic ul/li; R3 performance-budget.spec.ts (landing DOM <= 1200 / landing LCP <= 1500ms / login LCP <= 800ms / authed dashboard DOM <= 500 — 2-4x margins, LCP polled to settled) + the WORKFLOW_RATE_LIMIT_MAX=50 webServer insurance pin in playwright.config.ts.
- Caught mid-execution BY the probe: the note's first draft used text-white/40 — the post-fix axe scan flagged it at 3.5:1 on the dark card (below the 4.5:1 floor), and the LIST's S21 note carried the SAME latent violation (never rendered in any scan — it needs a >100-row workspace); BOTH notes now text-white/50 (5.3:1 — the S10/D59 axe lesson re-applied; the gotcha-39 lesson: an axe scan only catches what RENDERS).
- Full gate: 493 checks green (164 unit + 118 smoke + 211 e2e — re-run after the contrast fix). Re-verification: the chart probe GREEN on the remediated build (12 rows -> 8 bars + the honest note; UL semantics; axe zero); the drift battery re-run GREEN (zero regressions from the client change).
- Screenshots: the standard 20-shot set refreshed (fresh :3170 boot with AUTH_RATE_LIMIT_MAX=50; the error-boundary mock covers the [id] routes — the S23 fix; the dev DB logical state verified CANONICAL before AND after: rows=6, runs=7120, active=5). VLM spot-checks x5 — after adjudicating the NINTH and TENTH check-prompt drifts (an invented "Watch demo" CTA + omitted beta badge on the landing prompt — the pinned contracts are the beta badge + Book a Demo + the hero video; an invented "Sign in" heading + "NovaAI logo" on the login prompt — the pinned contract is "Welcome to SAAS Company" with the reference's own 'S' chip, parity since Session 2) -> 5/5 PASS with the corrected contracts.
- Docs: PAD (revision block, ledger D104-D105, section 7 counts 164/118/211 = 493, section 11 key files incl. the dashboard-app chart layer + the two new spec rows), AGENTS (gotcha 39 + counts 493/211 + the invariant line naming the chart honesty + the pinned budgets), CLAUDE (session-25 context + stack-table/checklist counts), README (493 badge + the chart-honesty layer in the dashboard row + every stale count), SKILL v2.24.0 (lessons 58-59), .env.example verified in sync (no new env vars — the limiter pin is a playwright-config override), remediation plan session25 (ticked), session log docs/session_47.md, this worklog.

Stage Summary:
- Two defects fixed with mechanism-level evidence: the chart truncation lie (a >8 workspace silently showed 8 bars with no note — now the S21-pattern honest note with the TRUE total, D104) and the chart's missing list semantics (div soup never announced the list — now a semantic ul/li, D105, visually identical under preflight) — plus a latent contrast violation caught by the post-fix axe scan and fixed in BOTH truncation notes (white/40 -> white/50, 5.3:1).
- One observability layer shipped: the S46-suggested performance-budget hook (tests/e2e/performance-budget.spec.ts — the S21/S22-measured LCP/DOM ceilings pinned into the gate with 2-4x margins + the WORKFLOW_RATE_LIMIT_MAX=50 webServer insurance pin).
- Gate raised 486 -> 493 checks; the production-readiness floor now covers the RENDER-side ceiling honesty (every capped surface says what it hides) and the runtime budgets (a gross performance regression fails the gate instead of passing silently).
- Survey scripts persisted under /home/z/my-project/scripts/ (survey-session25-drift, survey-session25-seo-perf, probe-s25-runs-chart, capture-s25-shots, vlm-check-s25).
- Session 25 complete.

---
Task ID: S26-1
Agent: Super Z (main, session 48/49)
Task: Session 26 — the chart-ranking + transfer-budget audit and remediation of the saas-company clone (the S48 log's three suggested surfaces), with context-reset recovery mid-session

Work Log:
- Workspace: fresh clone at e9fcfd1 (Session 25 complete and wrapper-verified pushed — the fix commit eb995c5, gate 493, plus the closing session_48.md transcript commit). Environment rebuilt after the reset (npm install, fresh AUTH_SECRET, canonical DB 6 rows / 7120 runs / 5 active, .env DATABASE_URL="file:../db/custom.db"); the exported DATABASE_URL trap LIVE — neutralized per-command all session (and one verification script initially preferred process.env over the .env value — the trap skipped the file value entirely; always prefer the .env file value in tooling).
- All repo docs + session docs reviewed (session_47 + remediation-plan-25 fully ticked + the worklog tail + session_48 — the Session-25 transcript suggesting this cycle's three surfaces); skills/ excluded from toolchains (re-verified); the skills catalog consulted (tdd / agent-browser / clone-app families).
- Baseline gate: 493 inherited checks ALL GREEN (164 unit + 118 smoke + 211 e2e — no flake).
- Drift battery: GREEN — word parity 1.0000 x8 (reference UNCHANGED; the 8th route the 404; /demo the superset route, excluded by design); mobile-nav paired real-touch probe: clone byte-identical (7 rows x 44px, REAL tap opens) — NO Tailwind v4 bug; live's burger remains pointer-blocked (D32); live LOGIN re-verified (D62 holds); SEO surface re-verified CLEAN (sitemap 200 application/xml x8; robots superset; og-image 1200x630; manifest valid).
- NEW audit surface (the S48-suggested three, extended to their class; probed on the probe-only server :3190 / db/probe-s26.db, gotcha-30, a 12-row workspace whose OLDEST row carries the HIGHEST runs): F1 — the chart's selection-criterion lie (slice(0,8) charted the 8 most RECENT rows under a heading promising "Runs by workflow"; the champion probe: 12,000-run oldest row INVISIBLE, every bar a 4%-7.5% stub, the maxRuns denominator from a row the chart never displayed). F1b — the deeper lie: at >100 workflows the client state is the capped newest-100 list, so ANY client-side ranking ranks only the newest 100 (the smoke 111-row workspace holds the champion in ZERO of the newest-100 rows) — the honest fix must be server-side. F2 — the keyboard tab-order audit ADJUDICATED CLEAN (34 reachable + focus-styled on /, 6/6 on /login, 27/28 on the dashboard — the 28th the disabled Compose button, correctly skipped; the D63 shared scrollable-region item; aria-pressed toggle buttons legitimate — documented so a future session does not re-litigate blind). F3 — the JS-transfer surface unpinned (measured: landing 172KB/10 script files, login 152KB/9, dashboard 177KB/11 — the 2,214KB landing total dominated by the 1,898KB hero video, the reference's own parity asset).
- Remediation plan session26 written + validated against the codebase (pin-conflict scans clean: no spec references the chart's order; the error-boundary mocks' bare arrays keep working through the meta-optional fallback; session26-chart-rank sorts after session25-chart, single worker, shared e2e.db), executed TDD-first: RED observed on the pre-fix build (unit 6/6 — the seam does not exist; e2e: the first chart row the most RECENT row, the champion crowded out by runs=0 rows, the top bar at 61.57% instead of 100%).
- GREEN: R1 the ranking layer — CHART_ROWS moved to src/lib/workflow.ts + the pure rankByRuns() fallback seam (runs DESC, ties newest-first, non-mutating; 6 unit pins); the GET route's Promise.all gains the top-CHART_ROWS-by-runs query surfaced as the additive meta.topRuns (the S21 stat-cards precedent extended to the ranking surface); the dashboard page passes initialTopRuns for a TRUE first paint; the client consumes meta.topRuns when present with rankByRuns() as the strictly-optional fallback; maxRuns becomes the CHARTED max (the top bar renders 100% of the track); the note names the criterion ("Showing the top 8 of {total} workflows by runs." — text-white/50, the S25 contrast law); the LIST keeps its own recency order and note (the surfaces stay independent). R2 the transfer-budget pins (+3: scripts <= 400KB per route, 2.3-2.6x the measured values, a settled ResourceTiming transferSize read). R1e the smoke topRuns pins (+5 on the 111-row workspace — the case that PROVES the server-side computation).
- Full gate: 511 checks green (170 unit + 123 smoke + 218 e2e — no flake; the plan's predicted 505 was short the sixth unit pin and the fourth ranking pin; the MEASURED gate recorded). Champion probe re-run GREEN (champion first @ 100%, bars descending meaningfully, the note naming the criterion, the list keeping recency). Drift battery re-run GREEN (zero regressions).
- Screenshots: the standard 20-shot set refreshed (the chart's row order changes on every dashboard shot; fresh boot with AUTH_RATE_LIMIT_MAX=50; the dev DB logical state verified CANONICAL before AND after). VLM spot-checks x5 — after adjudicating the ELEVENTH and TWELFTH check-prompt drifts: #11 the animated-gradient single-frame artifact (a time-sampled probe proved the 14s sweep RUNNING — 8 distinct positions over 3.2s; the gotcha-15/24 single-frame family: never adjudicate an animated surface from one frame) and #12 the prompt's invented hero "dashboard mockup" (the hero's video is the full-bleed looping BACKGROUND — section video pinned by src; the mockup is a separate below-the-fold section; the "scroll indicator" the VLM saw is the hero's own by-design element) -> 5/5 PASS with both lessons + the strict verdict-format contract encoded into the check script.
- Docs: PAD (revision block, ledger D106-D107, section 7 counts 170/123/218 = 511, section 11 key files), AGENTS (gotcha 40 + counts 511 + the invariant line naming the ranking layer + the transfer budgets), CLAUDE (session-26 context + stack-table/checklist counts), README (511 badge + the chart-ranking layer in the dashboard row + every stale count), SKILL v2.25.0 (lessons 60-61), .env.example verified in sync (all 7 keys at identical line positions; no new env vars — CHART_ROWS is a code constant), remediation plan session26 (ticked, the measured gate recorded), session log docs/session_49.md, this worklog.

Stage Summary:
- One defect fixed with a two-layer mechanism: the chart's selection-criterion lie (the 8 most RECENT rows charted under a "Runs by workflow" promise — now the server-side meta.topRuns ranks the FULL workspace top-8-by-runs with the pure rankByRuns() fallback seam; the capped client list can never rank honestly at >100 rows — D106) + the self-describing note extended (the note now NAMES its criterion).
- One observability layer shipped: the S48-suggested JS-transfer budgets (scripts <= 400KB per route — a bundle bloat now fails the gate instead of passing silently — D107).
- Gate raised 493 -> 511 checks; the production-readiness floor now covers the RANKING dimension of the render contract (a ranked surface ranks by its own title, honestly at any volume) and the transfer layer of the runtime budgets.
- Survey scripts persisted under /home/z/my-project/scripts/ (s26-drift-battery, s26-probe-db-setup, s26-audit-probe, s26-capture-shots, s26-gradient-probe, s26-vlm-check, s26-verify-db, s26-hero-geometry).
- Session 26 complete — committed to main and pushed via the SSH wrapper (wrapper-verified; the operator key destroyed after use).
