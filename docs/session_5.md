# Session 5 Log — Font & Interactive-State Parity (2026-10-07)

Continuing from Session 4 (main @ de18717, gate 179, word parity 1.0
everywhere). The mandate: refresh, review the session-4 docs, re-audit
against the live, remediate TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- `git pull` brought in `docs/session_4.md` (Session 4's log, pushed by the
  operator's commit). Working tree clean at `de18717`.
- Root docs + session docs reviewed; codebase validated: `.env`
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root ✓,
  `.env.example` tracked and in sync ✓, all four configs (tsconfig / eslint
  / vitest / playwright) still exclude `skills/` ✓.
- Baseline gate: ALL GREEN — lint ✓ typecheck ✓ Vitest 73/73 ✓ build ✓
  smoke 38/38 ✓ Playwright 68/68 ✓ (179 checks). The codebase matched the
  documented Session-4 state exactly.

## Phase 2 — The audit

**Drift check** (agent-browser, 8 routes, 1440/900): the reference is
UNCHANGED since Session 4 — text similarity 1.0000 on every route. Every
finding below is therefore clone-side.

**New surface — interactive states no prior session drove:**

1. **Login alternate states** (all driven with agent-browser's NATIVE
   `fill` — the first eval-based attempt had silently submitted EMPTY
   React forms; `input.value=` doesn't sync React state):
   the live's sign-up state is a COMPACT layout (back-button at top with
   `-mb-2`, H2 "Create your account", Email + Password ("Min. 8
   characters") + Confirm Password ("Re-enter password"), "Create account")
   with NO logo chip, NO Google, NO OR divider; the forgot state adds the
   subtitle "Enter your email and we'll send you a link to reset your
   password" (h2+subtitle wrapped in `text-center space-y-2`); errors
   render as shadcn ALERT banners (`bg-red-50/70 border-red-200`,
   inner `text-red-700`) BETWEEN the password field and the submit button
   ("Invalid email or password"; mismatch: "Passwords do not match"); the
   reset success view is h2 "Check your email" + the submitted email + a
   GREEN alert ("Please check your email… a few minutes to arrive.") +
   a full-width "Back to sign in" — shown unconditionally (no user
   enumeration). The clone had ONE shared layout for all modes.
2. **Font forensics** (the session's headline): the live's rendered UI font
   is **Google Fonts' "Vend Sans" variable font** —
   `performance.getEntriesByType('resource')` showed
   `fonts.gstatic.com/s/vendsans/v1/E21l_d7ijufNwCJPEUscVA9V.woff2`;
   `document.fonts` showed the 300–700 weight census; fontTools name tables
   proved the clone's self-hosted files were **Wix Madefor Display/Text**
   (the Session-1 "Base44-hosted Wix Madefor" identification was wrong —
   the Wix faces are declared only in the live's login-bundle css, whose
   route renders the SYSTEM stack). Metrics: canvas `measureText("Annual")`
   at 14px = 44.31px (live) vs 45.37px (Wix) — +2.4% glyph width, the root
   cause of the pricing-pill deltas (161 vs 165), the D19 Pro-card +27px,
   and the testimonials scrollWidth delta (2408 vs 2456).
3. **Focus ring**: a focused nav link on the live renders
   `auto 1px rgba(213,0,255,0.5)` — the UA default ring tinted by the
   live's universal base rule `*{border-color:hsl(var(--border));
   outline-color:hsl(var(--ring)/.5)}`. The clone had an invented
   `:focus-visible { outline: 2px solid primary }`.
4. **Mobile menu**: geometry byte-identical (panel 0,56,390×397; 7 rows
   @44px) ✓; the live's anchor click updates the hash but NEVER scrolls
   (a live bug — desktop clicks scroll fine); the clone's close+scroll
   kept as an intentional superset.
5. **Non-findings dismissed with DOM evidence**: pricing cards/CTAs
   identical at 390; the testimonials strip structure identical (no snap,
   no animation); the newsletter form blocked identically by browser
   validation; the post-login live state unchanged (Dashboard → /checkout
   still 404 — the D1 superset documentation remains valid); the nav logo
   SVG byte-identical (the VLM's "different icon" flags were rotation-phase
   and anti-aliasing misreads).

## Phase 3 — Remediation (TDD; every pin observed RED first)

- **R1 — The authentic font.** Replaced the Wix files with Google's two
  gstatic subsets (`src/fonts/vend-sans-latin[-ext].woff2`), rewrote the
  `@font-face` blocks (family "Vend Sans", `font-weight: 300 700`, the
  exact Google unicode-ranges), and set the chains to
  `"Vend Sans", sans-serif` (the live's `:root` verbatim). Result: the
  section offsets now match the live EXACTLY (features 3323 / how-it-works
  4179 / pricing 4800 / testimonials 5826 at 1440 — identical at 1280 and
  390), and the pills render 161/92/275 like the live.
- **R2 — The login alternate states.** Rebuilt `login/page.tsx` with
  per-mode layouts (the measured classes verbatim), an `AlertBanner`
  component (red/green shadcn variants), the exact copy, and the
  `auth-stack` route-style rules (v4's preceding-sibling space-y lets the
  back button's `-mb-2` CANCEL the gap — the rules restore the v3-style
  following-sibling pattern; the forgot variant also restores
  `sm:space-y-6`). The register API's `name` became optional (falls back
  to the email local-part — the live's sign-up has no name field). The
  login h1–h6 now inherit the route's system font (the live's bundle has
  no heading-font rule). Card heights land EXACTLY on the live:
  746 (signin) / 470 (signup) / 374 (forgot).
- **R3 — The focus ring.** The base layer now ships the live's universal
  rule (`* { border-color: …; outline-color: violet/50 }`); the invented
  `:focus-visible` rule deleted.
- **Audit follow-ons** (found while verifying R1): the Pro card's
  `scale-[1.02] md:scale-105` removed — the live's markup carries them
  but its css NEVER EMITS them (rendered `scale: none`, 540px at every
  width; v4 here would actually scale: 540×1.05 = the exact old 567px —
  **D19 RESOLVED**); the testimonials strip made full-bleed (px-6 pb-4
  removed; scrollWidth 2408 = the live).
- **Spec maintenance:** the S4 navbar scroll-spy pin recalibrated
  5200→4900 (with the authentic font, 5200's ⅔ line catches Testimonials —
  verified on the live: Pricing active at 4900); auth.spec rewritten to
  the live truth (error copy, confirm flow, reset-success view).

## Phase 4 — Verification

- **Gate: ALL GREEN — 192 checks** (73 unit + 81 e2e + 38 smoke; +13 e2e:
  the typeface suite ×6, the focus-ring pair, the login-states suite ×5,
  plus the pro-card/testimonials pins).
- **Paired re-survey:** word parity 1.0000 on all 8 routes; pills
  161/92/275 at BOTH 1440 and 390; Pro card 540 `scale:none`; testimonials
  sw 2408 pad 0 x 0; focus ring `auto rgba(213,0,255,0.5)`; login cards
  746/470/374; mobile menu byte-identical.
- **VLM:** full 97 / login 100 / signup 100 / pricing 100 / mobile 98 —
  every remaining flag dismissed with DOM evidence.
- **Screenshots:** 18 shots in `docs/screenshots/` (4 NEW: the login
  signup / forgot / reset-success / error states).

## Phase 5 — Docs & handoff

README (fonts, 192-check badge/table), AGENTS (gotchas 5–6 rewritten —
font forensics + inert classes; 13 extended with the alternate states),
CLAUDE (session-5 context + stack), PAD (revision block, §5.1, ledger
D19→RESOLVED + D21–D25, traps 8–10, counts, glossary),
`saas-company_SKILL.md` v2.4.0 (lessons 16–19), the remediation plan
(`docs/remediation-plan-session5.md`), and this log. `.env.example`
re-verified (no new env vars). Commit + SSH push per the runbook.
