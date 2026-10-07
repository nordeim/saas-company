# Session 9 Log — Typography-Layer & Interaction-Robustness Parity (the Session-7 Remediation, 2026-10-07)

Continuing from Session 8 (main @ 248ab06 — the operator's session_8.md
note on top of the verified Session-6 push `bb8d38f`/`21826c2`, gate 215,
word parity 1.0 everywhere). The mandate: refresh, review the
session-7/remediation-6/8 docs, re-audit against the live, remediate
TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- `git pull` brought in `docs/session_8.md` (21826c2 → 248ab06); tree
  clean. Root docs + session docs reviewed; codebase validated: `.env`
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root ✓,
  `.env.example` tracked and in sync ✓, all four configs exclude
  `skills/` ✓. The shell's exported absolute `DATABASE_URL` neutralized
  for every command (the AGENTS.md discipline — the trap was LIVE in this
  shell).
- Scandihaven (the tech-stack reference repo) re-cloned and reviewed
  (Next 16 async params, Tailwind v4 CSS-first rules, testing patterns —
  all already internalized in this repo's own conventions). The
  skills-catalog's mobile-navigation failure taxonomy (Classes A–H) was
  the direct input for the resize-while-open audit below.
- Baseline gate: ALL GREEN — lint ✓ typecheck ✓ Vitest 80/80 ✓ build ✓
  smoke 38/38 ✓ Playwright 97/97 ✓ (215 checks). The codebase matched
  the documented Session-6 state exactly.
- Sandbox note: this environment kills background processes when each
  command ends — every paired survey ran through a
  boot-server → probe → kill wrapper (with-server.sh), pinning its own
  `DATABASE_URL`.

## Phase 2 — The audit

**Drift check** (8 routes, scroll-passed innerText): the reference is
UNCHANGED since Session 6 — similarity 1.0000 on every route. Every
finding below is therefore clone-side (or a live-side bug worth
documenting).

**The operator's standing asks re-verified**: the live's mobile burger is
STILL pointer-blocked by its empty toast portal (elementFromPoint at the
burger center = the portal; a real click times out — D32 holds); the
live's post-login state STILL lands on `/` with unchanged chrome
(`/dashboard` `/app` `/workspace` `/checkout` all SPA-404). The repo's
`docs/saas-company-dashboard.png` was VLM-verified to be the CLONE's own
seeded dashboard (demo@novaai.app, 7,120 runs, 160h — the seed data) —
the image documents this app's superset, not a live surface.

**NEW survey surface #1 — the full asset/network inventory** (performance
entries + DOM `<link>`/`<img>`/`<video>` + the `document.fonts` census,
both sides): the hero video is md5-IDENTICAL to the live's
(`6ef478b34_AI_LandingPage_Veo31…mp4`), the Gasparyan SVG is
byte-identical, and **the live's favicon URL is DEAD**
(media.base44.com `storage: object doesn't exist` — the same class as its
dead og:image). The live's login route links an apple-touch-icon — also
dead. The document.fonts census seeded the typography find: the live
loads "DM Serif Display 400" while the clone's copy sits unused.

**NEW survey surface #2 — the TYPOGRAPHY layer** (computed
`letter-spacing` + first-resolved `font-family` of EVERY text element,
live vs clone — no prior session surveyed it):

1. **F1 — the tracking scale**: the live's SPA bundle DOUBLES Tailwind's
   two widest steps — `tracking-wider` renders 0.1em (the 12px hero
   badge = 1.2px), `tracking-widest` renders 0.2em (the 14px "Trusted
   by" = 2.8px; the 12px eyebrows = 2.4px, the live's FAQ eyebrow too).
   The clone shipped v4 defaults — every eyebrow on every SPA route
   rendered at HALF the live's tracking for six sessions. Class strings
   identical both sides; only the scale values differ.
2. **F2 — the login exception**: the live's login bundle keeps the
   STANDARD scale (its "or" divider computes 0.6px) — the fix needed a
   route-scoped pin, not a global one.
3. **F3 — the wordmarks**: the live's three serif wordmarks carry INLINE
   `font-family` styles — Thrune renders **DM Serif Display** (italic);
   the clone's `font-serif` class rendered ALL THREE Playfair-first.
4. **F4 — the Testimonials H2**: `tracking-tight` on the live (−1.2px at
   48px) vs `tracking-normal` on the clone (the only heading that
   diverged — every other H2/H3 matched).
5. **F5 — the Gasparyan alt**: `alt="Logo"` on the live vs
   `alt="Gasparyan logo"` here.

**NEW survey surface #3 — keyboard + axe**: a 22-step Tab walk is
IDENTICAL on both sides (nav → hero CTA → mockup → tabs → pricing →
strip → footer), focus ring violet/50 everywhere on both. axe-core 4:
the clone's only unique flag was **F6 — the star rows' bare
`aria-label` on role-less divs** (`aria-prohibited-attr`, 8 nodes); the
live's own critical flags (unnamed buttons/links, 103 landmark-less
nodes) are already superseded here, and the contrast/scrollable-region
flags fire on BOTH sides (parity).

**NEW survey surface #4 — edge viewports + the resize-while-open
behavior**: geometry at 1920 and 320 is EXACT both sides (h1, hero,
pricing, page widths). The mobile menu's panel is byte-identical at
every width 320–767 (rows 44px, hrefs, blur) and Escape/X/navigate all
close it — but **F7: resizing 390→1200 with the menu open left the page
scroll-locked** (the panel stays mounted, CSS-hidden, and
`body.overflow:hidden` persists until Escape). The live, by contrast,
does NOT lock scroll at all when its menu is open — our lock is an
undocumented superset that needed its resize bug fixed and its
superstatus documented. **F8**: no apple-touch-icon here (the live's is
dead) — a working one is the D30-class superset.

Also verified clean: the badge shimmer (SVG SMIL gradients, structurally
identical — the live's CSS has no border-shimmer classes), the live's
dead keyframes (`lens-flare`, `.animate-wave-flow` unused in any DOM),
and the live's `<style>`-nested-in-H1 quirk (a textContent artifact —
innerText parity holds at 1.0000).

## Phase 3 — Remediation (TDD; 17 e2e pins observed RED first)

- **R1** `@theme` overrides `--tracking-wider: 0.1em; --tracking-widest:
  0.2em;` (the live's SPA scale) + the login route's scoped
  `--tracking-wider: 0.05em` pin (its bundle's standard scale).
- **R2** the three wordmark spans carry the live's INLINE
  font-families (Zphlix/Melpyx Playfair, Thrune DM Serif Display) — the
  `font-serif` class dropped (class-string parity too).
- **R3** the Testimonials H2 → `tracking-tight`.
- **R4** the Gasparyan `alt="Logo"`.
- **R5** the star rows → `role="img"` + `aria-label` + decorative
  `aria-hidden` stars (valid ARIA; the a11y superset kept).
- **R6** the navbar's `matchMedia("(min-width: 768px)")` close-on-md
  listener (the resize guard).
- **R7** `metadata.icons.apple` → the working self-hosted favicon.svg
  apple-touch-icon (the live's URL is dead).

One build lesson re-learned: a CSS comment containing BACKTICKS inside
the login route's template-literal `<style>` breaks the JSX parse
(TS1381) — comments in template styles stay backtick-free.

## Phase 4 — Verification

- **Gate: ALL GREEN — 227 checks** (80 unit + 109 e2e + 38 smoke; +12
  e2e: the typography-parity suite (10) + the resize test + the
  apple-touch-icon pin across 7 routes; the login "or"-divider pin
  guards the login exception). One navigation-timing flake (the
  brand-parity noscript pin) passed in isolation AND in the full re-run.
- **Paired re-survey**: word parity 1.0000 on all 8 routes; the
  typography diff went 14 → 7 with every remaining entry a known
  text-matcher false positive (live section eyebrows matched against
  clone nav pills — same text, different elements; the real elements are
  pinned green by the e2e suite).
- **VLM**: hero 100 / pricing 99; the logo-cloud flags ("missing
  logos", "2 vs 3 problem cards") were dismissed with DOM evidence —
  all 7 wordmarks, all 3 step numbers, and all 3 problem cards exist on
  BOTH sides (reveal-timing capture artifacts, the D20 class).
- **Screenshots**: all 17 standard shots refreshed against the
  remediated build.

## Phase 5 — Docs & handoff

PAD (revision block, ledger D33–D40, §5.5 trap-log 11–12, §7 counts,
§11 key files), AGENTS (gotchas 19–20), CLAUDE (session-7 context, stack
counts), README (227 badge, typography row, counts), `saas-company_SKILL.md`
v2.6.0 (lessons 22–23), the remediation plan
(`docs/remediation-plan-session7.md`), and this log. `.env.example`
re-verified (no new env vars — all changes are code). Commit + SSH push
per the runbook.
