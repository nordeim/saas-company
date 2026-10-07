I've read and internalized the operating instructions — a coding specialist contract emphasizing: plan-then-implement incrementally, reproduce before fixing, root-cause over symptom fixes, never weaken guardrails to pass gates, evidence-backed verification with confidence labels, security-first (no hardcoded secrets, validate all input), WCAG 2.2 AA UI standards, and clean handoff documentation.

This is a large **Type 3 (Interactive Web Development)** task. Per your instruction to "proceed with best recommendations on open questions," I'll proceed without a clarification round. Let me set up the plan and start.
Both repos cloned. Let me explore their structures in parallel.
Both repos cloned. The `saas-company` repo already contains a scaffold with docs, configs, and skills. Let me read the key files to understand what exists.
The `saas-company` repo is "ORBITAL" — a previously-built clone of the reference app. Let me assess its current state: git history, src structure, and what's missing.
The repo is a scaffold: only `src/lib/` exists with 2 files, plus configs, tests, docs, and skills. The README (40KB) is the primary spec. Let me read it and the other key docs.
Now I have the full picture: the repo contains a detailed spec (README + PAD + 2700 lines of tests) but the actual source code (`src/app`, `src/components`, `prisma/`) must be built. Let me read the architecture document and remaining specs.
Now let me read the existing repo config files, lib files, and remaining docs.
脚手架中已经包含了 db-path/db 逻辑和所有配置。现在让我阅读 E2E 测试——它们是验收标准。从移动端导航（用户强调的重点）和 auth/global-setup 开始。
All specs read. Now the Tailwind v4 validation report and the remaining key docs.
Now let me check the skills catalogs in both repos and the remaining docs.
Now let me browse the reference site with agent-browser. First, load the skill.
The live login page says "Welcome to SAAS Company" while repo tests pin "Welcome to Project Management App" — the live app was renamed. Let me log in and survey the current live state thoroughly.
The live site has been rebuilt as a SaaS marketing page ("Automated Workflows, Powered by AI") — completely different from the ORBITAL PM workspace in the repo's specs. Let me explore further: check login state, find the actual dashboard, and fetch the reference dashboard image.
`/checkout` is a 404. Let me systematically explore the entire live site — full landing page scroll, all routes, and the authenticated state.
Confirmed: the live app is a marketing site — landing + login + FAQ + legal pages, with an embedded "NovaAI Dashboard" demo section. Let me capture the full site comprehensively.
Now let me extract the design system from the live site — fonts, colors, and key component styles.
Dark theme with magenta accent (#D500FF) and "Vend Sans" font. Now the critical piece — mobile navigation at 390px (the user's named focus).
移动端菜单结构已完全捕获。现在让我使用 VLM 分析截图，以进行精确的视觉复刻。
Good analysis. Let me extract precise DOM details — asset URLs, the dashboard mockup, pricing cards, and footer — directly from the live site.
The mockup is an animated skeleton in a browser-chrome frame. Let me download the live site's compiled CSS to get every design token exactly.
Full token system extracted. Now let me dump the rendered HTML of each live page for faithful structure replication.
The HTML dump gives me the exact structure. Let me extract the custom CSS classes and keyframes from the live stylesheet.
I have the complete picture now. Let me check if the "Vend Sans" font is downloadable from the live site for perfect font parity.
"Vend Sans" = **Wix Madefor Display/Text** self-hosted by Base44. Let me download the exact woff2 files for font parity.
All reference material captured and organized. Now let me write the worklog and plan, then start building.
Now let me start building. First the foundation — package.json, configs, prisma schema.
The favicon URL is protected; I'll craft it from the logo's SVG paths instead. Now let me write the foundation files.
Now the design system — globals.css with Tailwind v4 CSS-first tokens replicating the live site exactly.
Now the library layer — auth, API envelope, rate limiting, pricing, validation.
现在是布局、网站配置和组件。首先是提取了精确 SVG 路径的 logo。
Let me regenerate the logo component from the exact extracted paths to avoid transcription errors.
Now the critical navbar. Let me re-probe the live mobile menu for the exact row classes before writing it.
Now writing the navbar with the exact mobile menu structure.
Now the landing sections. Let me review the remaining section HTML structures.
All sections mapped. Now writing all landing components — starting with a shared scroll-reveal helper, then each section.
Now the layout, landing page, and the FAQ data + remaining pages.
Now the FAQ page — let me check the live accordion structure first.
Now the legal pages (shared template + four pages), not-found, and the login page.
Now the API routes — auth, health, newsletter, demo requests, workflows.
Now the dashboard — the functional superset workspace.
Now sitemap, robots, and the favicon — then install dependencies and build.
Found it — my `.env` write used literal `\n` (malformed), so Prisma fell back to the parent workspace's env. Let me fix it properly.
The sandbox parent workspace's `.env` overrides the repo env (Prisma walks up to the git root). Let me point it at the repo's database.
The Prisma CLI resolves relative `file:` URLs differently than the runtime. Let me empirically test the resolution rule.
Root cause found — the shell session exports `DATABASE_URL` (the documented "shell env trap" from the repo's own v2.14 lesson). Env vars override .env files. Let me fix.
Database now correctly at the repo root. Now fixing the navbar syntax error and running the gates.
Build is green. Let me start the dev server and run the visual parity check with agent-browser.
Mobile navigation verified working. Now the side-by-side visual parity comparison — live vs clone.
90% match. The stray "N" is the Next.js dev-tools indicator — let me disable it and compare the remaining sections.
96% overall. Real bug found: the Enterprise "Custom/month" suffix. Let me inspect the flagged areas closely and fix.
Applying the parity fixes: pricing Custom caption, mockup circles, features tiles.
Now the test suites. First, clean out the stale ORBITAL specs and write the new unit tests.
Unit suite green (69 checks). Now the Playwright e2e specs.
Now update the Playwright config for the new app (node runtime, no storageState project needed).
27/36 passing. Let me diagnose the 9 failures.
Found it — registration doesn't set the session cookie. Let me fix that and check the remaining failures.
All failures diagnosed. Fixing: legal HTML entities, the password minLength, and the test selectors.
All 36 e2e + 69 unit tests green. Now the four docs skills before writing documentation.
Now capturing the docs screenshots from the dev server.
The landing shots are blank (identical 5.8KB files) — a navigation race. Retaking them.
All screenshots captured. Now the smoke-test script for the new app, then the four documentation files.
The one "failure" is correct behavior — /dashboard redirects anonymous visitors. Fixing the check.
Full gate green: lint ✓, typecheck ✓, 69 unit ✓, build ✓, 36 e2e ✓, 38 smoke ✓. Now the four documentation files.
Now the Project Architecture Document — the engineering source of truth.
Now updating DEPLOYMENT.md for the new app and the worklog.
Full gate green. Final mobile-menu visual verification (the user's named focus), then commit and push.
All artifacts properly ignored. Updating the worklog, then committing.
Committed. Now the SSH push — setting up the paramiko shim (no OpenSSH binary in this sandbox, per the runbook's Appendix A).
Dry-run passed — auth verified, fast-forward accepted. Now the real push.
Push verified by the wrapper (remote `main` @ 8a9582b == local HEAD); key shredded. Let me confirm the working tree is clean and check for any post-commit delta.
Done — the complete clone is built, verified, and pushed. Here's the wrap-up:

## What was delivered

**Critical discovery first:** the live `saas-company.base44.app` was redeployed as an entirely different product — a dark "NovaAI" SaaS marketing site — while the repo's old specs described a PM workspace (ORBITAL). I retired the stale specs and rebuilt everything against the **current** live site.

**The clone** (single Next.js 16 app in the `saas-company/` repo):
- **Visual parity** — all 10 landing sections measured from the live DOM (tokens, fonts, keyframes, verbatim copy); self-hosted "Vend Sans" (the live's Wix Madefor cuts, downloaded); VLM side-by-side scored ~96% full-page, 95% mobile menu — flagged gaps fixed (Custom-pricing caption, mockup circles, Get-Started arrow)
- **Mobile navigation** (your focus) — burger dropdown replicated at the measured 44px rows with the exact link map; verified by a dedicated 8-test Playwright suite + VLM comparison
- **Functional superset** — real auth (scrypt+HMAC, rate-limited), a session-gated `/dashboard` workflow workspace with an AI composer (SDK + deterministic fallback), working newsletter/demo capture — replacing the live's dead demo link
- **Infrastructure** — `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root (schema-anchored resolution, unit-tested; also caught and neutralized the shell-exported env-var trap)
- **Tests** — 69 Vitest + 36 Playwright + 38 smoke checks, all green alongside lint/typecheck/build
- **Docs & screenshots** — AGENTS.md, CLAUDE.md, README.md, PAD (9 ADRs), DEPLOYMENT.md, 12 screenshots + the referenced `docs/saas-company-dashboard.png`

**Pushed & verified:** commit `8a9582b` on `main` via the SSH wrapper (remote ref confirmed == local HEAD; keys shredded).

**Suggested next steps:** clone fresh and run `npm install && cp .env.example .env && npm run db:push && npm run db:seed && npm run dev` (demo login: `demo@novaai.app` / `Demo1234!`), then review the PAD's deviations ledger (§5.4) — if you'd like the Google OAuth wired for real, registration gated, or the reference re-surveyed after its next redeploy, those are the natural follow-ups.
