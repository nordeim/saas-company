# Session 13 Log — Rendered-Palette & Engine-Token Parity (the Session-9 Remediation, 2026-10-07)

Continuing from Session 11 (main @ e598a51 — the verified Session-8 push
`01072c6`+`fbbec41` plus the operator's session_12.md transcript note). The
mandate: refresh, review the session-11/12 + remediation-plan-8 docs,
re-audit against the live, remediate TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- `git pull` brought in `docs/session_12.md` (fbbec41 → e598a51); tree
  clean. Root docs + status docs reviewed; codebase validated: `.env`
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root ✓,
  `.env.example` tracked and in sync ✓, all four configs exclude
  `skills/` ✓. The shell's exported absolute `DATABASE_URL` neutralized
  for every command (the AGENTS.md trap was live in this shell).
- Baseline gate: ALL GREEN — lint ✓ typecheck ✓ Vitest 92/92 ✓ build ✓
  smoke 38/38 ✓ Playwright 136/136 ✓ (266 checks). The codebase matched
  the documented Session-8 state exactly.
- Survey tooling: the session wrapper pattern (boot → probe → kill in one
  command, pinning its own `DATABASE_URL`) reused under `scripts/s13` in
  the workspace (outside the checkout).

## Phase 2 — The audit

**Drift check** (8 routes, scroll-passed innerText): the reference is
UNCHANGED — similarity 1.0000 on every route. Every finding below is
clone-side (or a live-side behavior worth documenting).

**NEW survey surface #1 — the INTERACTIVE-STATE MATRIX** (default/hover/
active computed styles of every visible interactive element + a keyboard
focus-visible walk on `/` and `/login`, Playwright real pointer events):
the landing matched everywhere except the palette values (below) and the
transparent shadow-slot counts; the login walk exposed the ring divergence
(F2) and drove the login palette probes.

**NEW survey surface #2 — THE RENDERED PALETTE** (the session's headline):
v4's default palette is OKLCH-DEFINED (`node_modules/tailwindcss/theme.css`
— `--color-slate-700: oklch(37.2% 0.044 257.287)`), and the oklch→sRGB
roundtrip renders up to 69 RGB units off the v3 hex the live's compiled
css carries. Verified end-to-end: the conversion math predicted slate-700
→ rgb(49,65,88) and the live's Google button measured rgb(51,65,85) vs
the clone's rgb(49,65,88) — EXACTLY the predicted v4 value. 30 used
tokens drift (green-400 −69R, green-500 −34R, red-500/700, purple-600
(the avatar gradient endpoints), blue-600, yellow-400 (the stars),
amber/orange, 7 slates, 5 grays, red-200, green-200/600/700, yellow-500,
amber-500, blue-500, purple-500, slate-300); 7 exact matches left alone.

**NEW survey surface #3 — the RING emission path**: the live's
keyboard-focused Sign in renders `white 0 0 0 2px, rgb(9,9,11) 0 0 0 4px,
shadow-sm` (slate-950 ring); the clone rendered `white … white` — the
ring at currentColor. Root cause: Session 8's R5 pinned the LEGACY
`--ring` HSL variable, but v4's `ring-ring` utility emits
`--tw-ring-color: var(--color-ring)` — the token was never in `@theme`,
so the utility never emitted, so `focus-visible:ring-2` fell back to
currentColor. The motion-parity spec pinned the class string + the
variable — both green while the ring rendered wrong (the Session-4
logo-pin lesson repeated).

**NEW survey surface #4 — the BROWSER-CHROME styling layer**
(::selection/scrollbars/cursors/tap-highlight/color-scheme/overscroll,
per route): the clone's violet `::selection` rule is an INVENTION (the
live ships none on `/`, only unused `.selection:*` variants on `/login`);
the live's `/login` pins `html { overscroll-behavior-y: none }` (the
landing stays auto); everything else matched (color-scheme normal both,
cursors, the strip's scrollbar utilities).

**NEW survey surface #5 — the form-control & media attribute inventory**:
the hero video's attributes identical (autoplay/loop/muted/playsInline/
preload=metadata/objectFit cover/1920×1080); forms/buttons/types
identical; the clone's a11y labels are supersets (below).

**NEW survey surface #6 — the ARIA SNAPSHOT TREE** (Playwright
`ariaSnapshot()`, never surveyed): the clone's supersets measured and
documented (the named nav, the labeled logo link/svg, the `<main>`
landmark, aria-hidden decorative icons, aria-pressed feature tabs, the
newsletter labels, the Next.js route announcer) and the live's noise (its
"Notifications alt+T" toast region; its unnamed-img icon soup).

**NEW survey surface #7 — the `:root` custom-property inventory**: 0
value diffs on `/`; on `/login` only inert/spelling entries (the live's
`--ease-out: cubic-bezier(.16,1,.3,1)` has no consumer; its px-spelled
`--radius-*` render identical values).

**The standing asks re-verified**: the mobile menu paired probe (real-tap
clone vs JS-click live) — the panel is byte-identical (`px-6 py-4 flex
flex-col gap-2` at 0,56 390×396, six rows @44px, same hrefs), the burger
identical (no transition classes either side — no v4 trap), the resize
guard closes the clone's menu across 768, and the live's menu does NOT
close on Escape (the clone's Escape-close documented as the D21/D39/D32
intended-UX superset family).

**NEW survey surface #8 — the HTTP header inventory**: the live ships
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, and
`Strict-Transport-Security: max-age=31536000`; the standalone server
shipped none — a production-parity gap.

## Phase 3 — Remediation (TDD; 13 e2e + 4 smoke pins observed RED first)

- **R1** the 31 `@theme` palette pins (30 drifted + slate-200 for
  byte-stable serialization) — `tests/e2e/palette-parity.spec.ts` (14
  checks: the problem reds, the stars, the tab grays, the features
  greens, the avatar gradient endpoints, the login slates).
- **R2** `--color-ring: hsl(240 10% 3.9%)` in `@theme` + the
  utilities-layer `input:focus:focus-visible` cascade nudge (v4 emits
  ring-ring AFTER ring-slate-400, flipping the live's order — the rule
  restores the inputs' slate-400 while the Sign in keeps slate-950).
  Build lesson re-learned: backticks inside the login route's
  template-literal `<style>` comment break the JSX parse (Session 7's
  TS1381) — comments rewritten without backticks.
- **R3** the invented `::selection` rule removed.
- **R4** `html { overscroll-behavior-y: none }` in the login route style.
- **R5** `body { --color-border: #e5e7eb }` in the login route style
  (the live's login-bundle `--border`; inert — width-0 borders).
- **R6** the four security headers via `next.config.ts` `headers()` +
  four smoke checks (38 → 42).
- **R7** documentation (below).

## Phase 4 — Verification

- **Gate: ALL GREEN — 284 checks** (92 unit + 150 e2e = 136 + 14
  palette-parity + 42 smoke = 38 + 4 headers). The full suite survived
  the palette pins (the brand-parity and section-parity specs were
  audited for conflicts first — brand-parity converts oklab→sRGB and
  pins only custom tokens; section-parity pins structure).
- **Paired re-survey**: word parity 1.0000 on all 8 routes; the
  previously-drifted values now MATCH exactly (red-500 rgb(239,68,68)
  both sides; green-500 rgb(34,197,94); tab gray-600 rgb(75,85,99); the
  stars rgb(250,204,21); the login Google text/border and the Sign in
  bg/border all byte-identical).
- **VLM**: problem IDENTICAL; testimonials IDENTICAL; login IDENTICAL;
  the mobile-menu shot verified open with all rows.
- **Screenshots**: all 17 standard shots refreshed against the
  remediated build.

## Phase 5 — Docs & handoff

PAD (revision block, ledger D49–D56, §5.5 trap 15, §7 counts, §11 key
files), AGENTS (gotcha 23, counts), CLAUDE (session-9 context, counts),
README (284 badge, the palette-parity + security-header rows, counts),
`saas-company_SKILL.md` v2.8.0 (lessons 26–27), the remediation plan
(`docs/remediation-plan-session9.md`), and this log. `.env.example`
re-verified (no new env vars — all changes are code/config). Commit +
SSH push per the runbook.
