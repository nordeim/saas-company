# Session 15 Log — The Looping-Motion Layer, the Under-Glow, Dashboard A11y & Asset Caching (the Session-10 Remediation, 2026-10-08)

Continuing from Session 13 (main @ 694cd7f — the verified Session-9 push
`d7392d1`+`cb25c61` plus the operator's session_14.md transcript note). The
mandate: refresh, review the session-13/14 + remediation-plan-9 docs,
re-audit against the live, remediate TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- Fresh clone (the workspace had been reset); `.env` re-created from
  `.env.example` (AUTH_SECRET generated); `db/custom.db` pushed + seeded at
  the repo root. **The exported-DATABASE_URL trap struck immediately**: the
  first `db:seed` silently wrote a FOREIGN file at
  `/home/z/my-project/db/custom.db` (the shell re-exports the absolute value
  into every command) — neutralized per-command thereafter and the foreign
  file removed. The AGENTS.md gotcha 1 discipline is load-bearing in this
  sandbox.
- Root docs + status docs (session_13/14, remediation-plan-9, worklog)
  reviewed; the scandihaven reference repo + both skills catalogs reviewed
  (the avant-garde-design-v4 mobile-nav debugging taxonomy, the tdd skill,
  clone-app-pat-pro); the repo `skills/` folder excluded from every
  toolchain (verified: tsconfig/eslint ignore it; vitest matches only
  `src/**/*.test.ts` + `tests/**/*.test.ts`; playwright's testDir is
  `tests/e2e`).
- Baseline gate: ALL GREEN — lint ✓ typecheck ✓ Vitest 92/92 ✓ build ✓
  smoke 42/42 ✓ Playwright 150/150 ✓ (284 checks). The codebase matched the
  documented Session-9 state exactly.

## Phase 2 — The audit

**Drift check** (8 routes, scroll-passed innerText): the reference is
UNCHANGED — similarity 1.0000 on every route.

**The operator's dashboard question settled first**: logged into the live
with the provided credentials — the login redirects to `/` with the navbar
UNCHANGED (still "Log In" + "Get Started"), and every plausible
authenticated route (`/dashboard`, `/app`, `/home`, `/workflows`,
`/workspace`, `/settings`, `/account`) renders the SPA 404 even
authenticated. The live has NO authenticated experience; the reference
image the operator's brief cites (`docs/saas-company-dashboard.png`) is
THIS REPO's own dashboard (VLM-verified: the demo@novaai.app workspace).
The clone's `/dashboard` remains the D1 designed superset.

**NEW survey surface #1 — THE LOOPING-MOTION LAYER** (the session's
headline): a full-page census sampling every element's computed
transform/opacity across multiple 600–700ms rounds AFTER all entrances
settle (still-changing = loop), plus `animate:{…}`/`transition:{…}` config
extraction from the live's JS bundle. **The live runs TWELVE looping
animations; the clone shipped FOUR.** The eight missing groups (all
framer-driven, all invisible to the CSS-property censuses that produced
Session 4's "the mockup is completely STATIC" verdict — framer writes
inline styles per frame, so `animationName` reads `none` on an element
that is mid-loop): the hero mockup's ambient `-inset-32` glow
(`scale:[1,1.15,1] opacity:[.3,.5,.3]`, 4s easeInOut), the red
browser-chrome dot (`scale:[1,1.2,1]`, 2s), the four side-list dots (same,
`delay:i*.1` — the bundle's map starts at 1), the under-glow
(`y:[0,-12,0] opacity:[.3,.5,.3]`, 3s), and the One-Platform
mini-dashboard's four skeleton opacity pairs (`.5↔1`, `.3↔.8` delay .5,
four tiles `.4↔1` delay `t*.2`, the wide box `.3↔.9` delay 1 — all 3s).

**NEW survey surface #2 — the under-glow structure**: the live's glow is a
SIBLING of the mockup card (child of the `relative w-full max-w-4xl
mx-auto` wrapper — unclipped) while the clone's was the LAST CHILD OF THE
CARD (clipped by `overflow-hidden`). Pixel adjudication settled the
rendering: the live BLEEDS below/right of the card edge (brightness 1.3–2.5
vs background 0.0), the clone bled NOTHING (0.0) with a brighter in-card
strip (7.2 vs 2.7). The live's glow also renders UNCENTERED — its framer
`y` transform REPLACES v3's `--tw-translate-x` composition, so the
`-translate-x-1/2` class is inert in effect (left edge at the wrapper's
center-x = 720, extending 149px past the card's right edge).

**NEW survey surface #3 — zoom/reflow** (WCAG 1.4.4/1.4.10, designed for
Session 9 but dropped): 640/320 viewports — ZERO horizontal scroll both
sides, no clipped text, only decorative overflow families (identical both
sides; the one delta — the live's glow overflowing at 320 — is the
structure finding above). CLEAN.

**NEW survey surface #4 — the asset-caching headers**: the clone's hashed
chunks ship immutable ✓, but the `public/` folder ships `max-age=0` — the
1.9MB hero video re-validates every load; the live's CDN serves its static
assets `public, max-age=604800`.

**NEW survey surface #5 — the dashboard's first axe audit** (the superset
surface was never a11y-audited): two violations — `color-contrast`
SERIOUS (the `text-white/40` muted lines: the count badge, category tags,
run stats — 3.6:1 on the dark cards) and `page-has-heading-one` (no h1 on
/dashboard).

**The standing asks re-verified**: the mobile menu paired probe — the
panel byte-identical (0,56 390×397, seven rows all 44px, same hrefs), the
burger identical (342,16 24×24, same classes, no transition classes either
side — no v4 trap), the clone's real-tap opens/locks/Escape-closes, the
resize guard closes across 768, the live's tap still pointer-blocked
(D32). The testimonial strip: byte-identical classes and computed
overflow/cursor/snap/scrollWidth, and identical drag behavior (mouse-drag
scrolls neither side). The pricing toggle: the clone's `aria-pressed` is
an undocumented D55-class superset (now ledgered D61). The mockup
header-bar gradients: D6 oklab serialization (dismissed,
rendering-identical).

## Phase 3 — Remediation (TDD; 14 e2e pins observed RED first, then GREEN)

- **R1** the seven `@theme --animate-*` tokens + keyframes
  (`mockup-ambient`/`mockup-dot`/`mockup-glow`/`skel-line`/`skel-violet`/
  `skel-tile`/`skel-wide` — the measured framer configs verbatim) + the
  class attachments with the measured delays (`delay:i*.1` on the list
  dots, `.5`/`t*.2`/`1` on the skeletons).
- **R2** the under-glow restructure: moved out of the card to a SIBLING
  (the live's DOM: wrapper > [card, glow]) + `translate-none` (v4's
  `translate` property would keep it centered — the pin reproduces the
  live's rendered geometry) + `animate-mockup-glow`.
- **R3** (with R1) the mini-dashboard skeleton loops.
- **R4** the dashboard a11y: the breadcrumb "Dashboard" span → the page's
  single `<h1>`; the four `text-white/40` lines → `text-white/60` (≥7:1).
- **R5** the asset-caching headers via `next.config.ts` (`/media/:path*`,
  `/favicon.svg`, `/og-image.png`, `/manifest.json` → `public,
  max-age=604800`) + the smoke pin (42 → 43).
- **Spec corrections**: the landing suite's "the mockup runs zero
  animations" pin (the Session-4 verdict, now falsified) rewritten to pin
  the seven measured loops; its describe-block comment updated. Selector
  lesson: escape-free `[class*="…"]` attribute selectors inside nested
  evaluate strings (the `.bg-white\/20` class selectors double-escape
  through the template-literal → evaluate layering).

## Phase 4 — Verification

- **Gate: ALL GREEN — 299 checks** (92 unit + 164 e2e = 150 + 14
  mockup-motion-parity + 43 smoke = 42 + 1 asset-caching).
- **Paired re-survey**: word parity 1.0000 on all 8 routes; **the loop
  census: 12 = 12, element-for-element**; the glow geometry byte-identical
  (x=720 right=1317 w=597, +149 past the card's right edge, parent
  overflow visible, translate none — the live's mid-oscillation and the
  clone's sampled within the same 0→−12px band); the pixel bleed matches
  (both sides bleed softly below/right of the card edge); VLM mockup
  IDENTICAL + One-Platform IDENTICAL; the cache header verified
  (`max-age=604800` on the hero video).
- **Screenshots**: all 17 standard shots refreshed against the remediated
  build (the mobile-menu shot verified open with all rows).

## Phase 5 — Docs & handoff

PAD (revision block, ledger D57–D62, §5.5 trap 16, §7 counts, §11 key
files), AGENTS (gotcha 15 rewritten + gotcha 24, counts), CLAUDE
(session-10 context, counts), README (299 badge, the
mockup-motion-parity + asset-caching rows), `saas-company_SKILL.md` v2.9.0
(lessons 28–29), the remediation plan
(`docs/remediation-plan-session10.md`), and this log. `.env.example`
re-verified (no new env vars — all changes are code/config). Commit + SSH
push per the runbook.
