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
| Unit tests (73 checks) | `npm run test` |
| Browser E2E (41 checks; needs a build) | `npm run test:e2e` |
| Prisma client after schema change | `npx prisma generate` |
| Recreate DB from schema | `npm run db:push` |
| Seed demo workspace | `npm run db:seed` |
| End-to-end smoke suite (38 checks) | `./scripts/smoke-test.sh` (needs `npm run build` first) |

**Gate order before every push:** `npm run lint` → `npm run typecheck` →
`npm run test` (73/73) → `npm run build` → `./scripts/smoke-test.sh` (38/38)
→ `npm run test:e2e` (41/41) — 152 checks across three layers (boots the standalone server on :3100 against its own
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
5. **Self-hosted Vend Sans.** The reference's "Vend Sans" is Base44-hosted
   Wix Madefor; this repo self-hosts the two latin woff2 cuts in
   `src/fonts/` and declares them in `globals.css` (`@font-face`) — do not
   swap them for a Google font.
6. **The reference is a moving target.** The live app at
   `saas-company.base44.app` has been redeployed with different products
   across this repo's history (the previous cycle cloned a PM workspace
   called ORBITAL). Visual parity was re-measured against the CURRENT live
   (dark NovaAI marketing site); the measurements live in
   `Project_Architecture_Document.md` §5 and the e2e pins.
7. **Rate limits are per-process.** Auth endpoints throttle 10
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
