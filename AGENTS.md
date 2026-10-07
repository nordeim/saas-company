# AGENTS.md — SAAS Company (NovaAI)

Single Next.js 16 App Router application cloning the reference dark-theme
SaaS marketing site (`saas-company.base44.app` — "NovaAI") with a functional
superset: real cookie-session auth, a persisted workflow dashboard, a working
newsletter/demo-capture API, and SEO surfaces. Stack: React 19, TypeScript
strict, Tailwind CSS v4 (CSS-first — no `tailwind.config.*`), Prisma 6 +
SQLite at `db/custom.db`, Vitest + Playwright. Clone remote:
`https://github.com/nordeim/saas-company.git`; pushes go to the SSH remote
via `docs/ssh_git_wrapper_v3.py`.

## Commands

| Task | Command |
|------|---------|
| Install | `npm install` |
| Dev server (port 3000) | `npm run dev` |
| Production build | `npm run build` |
| Production server | `npm run start` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Unit tests (92 checks) | `npm run test` |
| Browser E2E (150 checks; needs a build) | `npm run test:e2e` |
| Prisma client after schema change | `npx prisma generate` |
| Recreate DB from schema | `npm run db:push` |
| Seed demo workspace | `npm run db:seed` |
| End-to-end smoke suite (42 checks) | `./scripts/smoke-test.sh` (needs `npm run build` first) |

**Gate order before every push:** `npm run lint` → `npm run typecheck` →
`npm run test` (92/92) → `npm run build` → `./scripts/smoke-test.sh` (42/42)
→ `npm run test:e2e` (150/150) — 284 checks across three layers (boots the standalone server on :3100 against its own
`db/e2e.db`). There is no hosted CI; the local gate is the only gate.
`next.config.ts` sets `ignoreBuildErrors` — the explicit `typecheck` step is
what catches type errors; never skip it.

First-run setup: `npm install && cp .env.example .env && npm run db:push &&
npm run db:seed && npm run dev`. Demo login: `demo@novaai.app` /
`Demo1234!`.

## Gotchas (verified the hard way)

1. **The exported-`DATABASE_URL` trap.** A shell-exported absolute
   `DATABASE_URL` overrides the repo `.env` for the Prisma CLI **and** the
   Next runtime — the server silently opens a foreign database file (the
   historical 12/30 smoke failure). `scripts/smoke-test.sh` and
   `playwright.config.ts` PIN their own `DATABASE_URL` per command; keep that
   discipline in every script that boots a server or runs Prisma.
2. **Relative `file:` URLs are schema-anchored.** `DATABASE_URL` in `.env` is
   `file:../db/custom.db`, which resolves against `prisma/schema.prisma` for
   the CLI and against the same anchor at runtime via `src/lib/db-path.ts`
   (unit-tested by `tests/db-path.test.ts`). One string → one file:
   `<repo>/db/custom.db`. The `db/` folder sits at the repo root and is
   git-ignored (`db/*.db`).
3. **Tailwind v4 is CSS-first.** Tokens live in `src/app/globals.css` under
   `@theme` — never add a `tailwind.config.*` or the `@config` bridge. Two
   v4 traps are load-bearing here: theme vars must be FULL color values
   (bare HSL triplets resolve to transparent), and `button,
   [role="button"] { cursor: pointer }` is set in the base layer because v4's
   preflight sets no pointer. See `docs/Tailwind-V4-Validation-Report.md`.
4. **v4 serializes `bg-white/10`-style colors through `oklab()`** —
   rendering-identical to the reference's rgba strings but
   computed-string-different. E2E assertions accept either spelling (see the
   mobile-navigation spec comments); never "fix" the CSS to chase byte-parity.
5. **The UI font is GOOGLE's "Vend Sans"** (variable wght 300-700),
   self-hosted as the two gstatic subsets in `src/fonts/` — the SAME bytes
   the live serves (`fonts.gstatic.com/s/vendsans/v1/…`, traced via
   performance entries in Session 5). Session 1 misidentified it as
   "Base44-hosted Wix Madefor" (the Wix faces are declared only in the
   live's unused login-bundle css) and the wrong metrics (+2.4% glyph
   width) drifted every text surface for four sessions. Never trust a
   font's NAME — trace its bytes.
6. **The reference ships INERT classes** — its markup carries utilities
   its compiled css never emits (the pricing Pro card's `scale-[1.02]
   md:scale-105` renders UNSCALED: `scale: none`, 540px at every width).
   Match the RENDERED computed style, not the class string; v4 here WOULD
   emit those utilities (540×1.05 = the old 567px D19 delta).
7. **The reference is a moving target.** The live app at
   `saas-company.base44.app` has been redeployed with different products
   across this repo's history (the previous cycle cloned a PM workspace
   called ORBITAL). Visual parity was re-measured against the CURRENT live
   (dark NovaAI marketing site); the measurements live in
   `Project_Architecture_Document.md` §5 and the e2e pins.
8. **Rate limits are per-process.** Auth endpoints throttle 10
   attempts/IP/15 min (in-memory `src/lib/rate-limit.ts`). E2E specs sign in
   through the UI sparingly; per-test logins would trip the limiter
   mid-suite.
9. **Dependency overrides are load-bearing.** `package.json` pins
   `overrides` for `braces`/`micromatch`/`fast-glob`/`deepmerge-ts` — the
   patched transitive versions for advisories whose parents haven't shipped
   fixes (the residual `braces` GHSA-vfj7-8cjw-p6xm covers every published
   version; lint-toolchain-only — see the remediation plan F10). Never run
   `npm audit fix --force` here: it would downgrade `eslint-config-next`
   16→14 to silence a dev-time advisory.
10. **`/dashboard` is session-gated** (`redirect("/login?from_url=/dashboard")`)
   — expect 307 for anonymous requests; the smoke suite pins both the 307
   and the cookie'd 200.
11. **The reference ships TWO token blocks — `:root` and `.dark`.** The app
   never mounts `.dark`, so `:root` is what renders: primary = hsl(267 100%
   57%) = #8624ff, accent/electric-blue = hsl(220 100% 50%) = #0055ff, while
   `violet` (the magenta used by text/border/bg-violet) = #d500ff. Session 1
   read the `.dark` block and shipped the wrong primary/accent for two
   sessions — the Session-3 audit fixed it (see
   `docs/remediation-plan-session3.md` F1/F2).
12. **Arbitrary aspect ratios use the SLASH (`aspect-[16/9]`), never the
   colon spelling** — writing the ratio with a colon inside the brackets
   emits the invalid `aspect-ratio: 16:9` into the compiled CSS and postcss
   fails the whole build with an opaque `CssSyntaxError … Missed semicolon`
   at a flattened column. Worse: Tailwind's scanner reads class candidates
   from MARKDOWN too — documenting the colon spelling in a .md file breaks
   the build just like using it in a component (docs/ is `@source not`-ed
   in globals.css for exactly this reason; Session 4 hit both).
13. **The reference's /login loads its OWN css bundle** (light `:root`, body
   white + zinc-950 + the system font stack) — the login route swaps the
   body theme via a route-scoped `<style>` in `login/page.tsx`; every other
   route keeps the dark theme. Also: the reference's compiled `space-y-*`
   puts the gap on the FOLLOWING sibling (v3-style) — v4's
   margin-bottom-on-preceding is lost on inline labels (the login form)
   AND is cancelled by the alternate-states' back-button `-mb-2`, so the
   route style restores that pattern inside forms (`.space-y-1\.5`) and
   the auth stack (`.auth-stack` / `.auth-stack-sm6`). The card's
   ALTERNATE states (sign-up / forgot / reset-success) use a DIFFERENT
   layout from the default: back-button + h2 + form, NO logo chip,
   NO Google button, NO OR divider, and shadcn-style alert banners
   (bg-red-50/70 / bg-green-50/70) rendered BETWEEN the last field and
   the submit button — measured in Session 5, pinned by
   `tests/e2e/login-states.spec.ts`.
14. **The navbar is section-aware and never gains a background.** It is
   `bg-transparent` at every scroll depth (no scrolled-glass bar); a
   scroll-spy highlights the section in view (last section whose top passed
   the ⅔ viewport line) and the chrome swaps to black variants while the
   nav band overlaps `[data-nav-theme="light"]` sections (the white
   features section). Pinned by `tests/e2e/navbar-behavior.spec.ts`.
15. **The dashboard mockup is STATIC on the reference** — zero running
   animations, solid `bg-primary/80` list dots (never re-add the
   `skeleton-wave` shimmer: as an UNLAYERED class it overrides the layered
   `bg-primary/80` utility). The pricing toggle defaults to ANNUAL
   (Pro $39/mo annual, $49/mo monthly — the $39 Session 1 read was the
   annual price).
16. **Hover-state probes need REAL pointer events** (Session 6) — an
   agent-browser `mouse move` reported `:hover` matching while no hover
   utility applied (a false negative Playwright's real `page.mouse.move`
   disproved — the Get Started pill's shimmer was working all along).
   Related: the live's arrow slide renders v3 `transform: matrix(1,0,0,1,2,0)`
   while v4 emits `translate: 2px` — compare RENDERED geometry, not the
   property name.
17. **The reference's `<head>` is per-route** (Session 6): content routes
   ship og:title = the page title, description = "X on SAAS Company. …",
   and og:url = canonical = the route (implemented here through
   `src/lib/seo.ts` + per-page `routeMetadata` exports; `/og-image.png`
   is the WORKING replacement for the live's dead og:image URL). Do NOT
   re-add `theme-color` or `viewport-fit` — the live ships neither.
18. **The live's mobile burger is pointer-blocked by its own empty toast
   portal** (fixed top-0 z-[100], 390×32, pointer-events auto — a JS
   click opens the live's menu, a real tap cannot; D32). The clone keeps
   the WORKING burger; never "fix" it toward the live's broken state.
19. **The reference's SPA bundle DOUBLES the tracking scale** (Session 7):
   `tracking-wider` renders 0.1em and `tracking-widest` 0.2em on the live
   — the overrides live in globals.css `@theme`
   (`--tracking-wider`/`--tracking-widest`), while the live's LOGIN bundle
   keeps the standard scale (pinned back in the login route's scoped
   `<style>`). Never "simplify" either side — the divergence is the
   reference's own two-bundle reality.
20. **Breakpoint-mounted chrome needs a resize guard** (Session 7): the
   mobile menu mounted below `md` and hidden above it kept its state (and
   the body scroll-lock) alive when the viewport crossed 768 — the
   `matchMedia("(min-width: 768px)")` close-on-match listener in
   `navbar.tsx` is load-bearing for resize/rotate flows.
21. **The scroll entrances are rAF-driven, NOT CSS transitions** (Session 8):
   the reference uses framer-motion (per-frame inline opacity/transform
   writes, easeOut cubic-bezier(0,0,0.58,1), per-element params); the
   `Reveal` component re-implements it via `src/lib/motion.ts`. Never add
   `transition-*` classes to entrance wrappers — on children that carry
   their own `transition-colors` the cascade SNAPS the entrance and
   corrupts the child's hover timing (the Session-8 F1 bug). The
   per-element parameter table lives in `docs/remediation-plan-session8.md`.
22. **v4 ships THREE more engine shifts beyond oklab** (Sessions 7–8): the
   tracking scale (the live's config doubles the two widest steps —
   `@theme --tracking-*`), the shadow-scale rename (v3 shadow-sm → v4
   shadow-xs — pinned via `--shadow-sm`), and the line-height cascade
   (v3's responsive `text-*` beats `leading-*`; v4's `--tw-leading` always
   wins — pinned per-element via `--tw-leading: initial`). Survey the
   ENGINE layer (computed values + the emitted rules), not just class
   strings — every one of these hid from class-string parity for 6+
   sessions.
23. **v4's default palette is OKLCH-DEFINED — the roundtrip drifts from
   v3's hex** (Session 9): up to 69 RGB units off (green-400; the stars'
   yellow-400, the problem cards' reds, the avatar gradient endpoints,
   every login slate drifted). The pins live in `globals.css` `@theme`
   (`--color-<family>-<shade>: <v3 hex>` — 31 tokens). Never "simplify"
   them back to v4 defaults, and never trust a color assertion that
   accepts both spellings without comparing VALUES. Related v4
   token-emission trap: `ring-ring` reads `--color-ring` (a legacy
   `--ring` HSL variable is NOT the emission path — without the @theme
   token the utility never emits and the ring falls back to currentColor),
   and v4 emits ring-ring AFTER ring-slate-400, so elements carrying both
   need the `input:focus:focus-visible` cascade nudge in the utilities
   layer. The live also ships NO `::selection` rule (ours was an
   invention, removed) and pins `/login` `html { overscroll-behavior-y:
   none }` + a light `--border` (both reproduced route-scoped).

## Architecture invariants

- **Layering:** route handlers (`src/app/api/**`) own validation +
  persistence; views never fetch directly — the dashboard server page loads
  initial state and the client component mutates through the API envelope.
- **The envelope:** every API route returns `{ ok: true, data }` or
  `{ ok: false, error: { code, message } }` via `src/lib/api.ts` (`ok` /
  `fail` / `requireSession`). No route returns bare JSON.
- **Degrade-not-fail AI:** `/api/workflows/generate` asks
  `z-ai-web-dev-sdk` for a workflow draft and falls back to the
  deterministic template (`src/lib/workflow.ts`) on any SDK failure — the
  feature never hard-fails, and the sanitizer clamps LLM output before
  persistence.
- **Legal/FAQ content is code:** `src/lib/legal-content.ts` and
  `src/lib/faq-content.ts` carry the reference-captured copy verbatim;
  content integrity is unit-tested (`content.test.ts`).

## Git workflow

- **`main` only** — no feature branches (operator contract).
- **Commits:** Conventional Commits with emoji prefixes: `:art: feat: …`,
  `:memo: docs: …`, `:bug: fix: …`.
- **Push:** via `docs/ssh_git_wrapper_v3.py` with an externally supplied key
  (see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`) — never a resident
  `~/.ssh` dependency.
- **Never committed:** `.env`, `*.key`, `db/*.db`, `node_modules/`,
  `dev.log`/`server.log`, `tests/e2e/.auth/` (all gitignored).
