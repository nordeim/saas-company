# Session 7 Log — Class-String & Head Parity (the Session-6 Remediation, 2026-10-07)

Continuing from Session 6 (main @ 0503ad9, gate 192, word parity 1.0
everywhere). The mandate: refresh, review the session-5/6 docs, re-audit
against the live, remediate TDD-first, re-verify, document, push.

## Phase 1 — Workspace & baseline

- Fresh clone (the workspace had been reset); tree clean at `0503ad9`
  (the operator's session-log commit on top of the verified Session-5
  push `dfa4e65`/`3fd4f20`).
- Root docs + session docs reviewed; codebase validated: `.env`
  `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root ✓,
  `.env.example` tracked and in sync ✓, all four configs exclude
  `skills/` ✓. The shell's exported absolute `DATABASE_URL` neutralized
  for every command (the AGENTS.md discipline).
- Baseline gate: ALL GREEN — lint ✓ typecheck ✓ Vitest 73/73 ✓ build ✓
  smoke 38/38 ✓ Playwright 81/81 ✓ (192 checks). The codebase matched the
  documented Session-5 state exactly.

## Phase 2 — The audit

**Drift check** (8 routes, scroll-passed innerText, difflib): the
reference is UNCHANGED since Session 5 — similarity 1.0000 on every
route. Every finding below is therefore clone-side (or a live-side bug
worth documenting).

**NEW survey surface #1 — the class-string layer** (no prior session
diffed the full DOM skeleton): a tag + class + key-attrs extraction of
the whole landing page, live vs clone, then `diff`. This surfaced FOUR
rendered divergences five sessions of computed-style spot probes had
missed, because each element still painted *something plausible*:

1. **F1 — Testimonial avatars**: the live cycles FOUR per-person gradient
   combos (SC violet→purple-600, MR electric-blue→blue-600, EW
   purple-500→violet, DP blue-500→electric-blue; cards 5–8 repeat); the
   clone rendered ALL as violet→purple-600 (three of four people wore the
   wrong colors).
2. **F2 — Enterprise "Custom" price**: the live renders a plain
   `div.font-heading.text-3xl` (30px/36px); the clone reused the
   numeric-price markup — a text-5xl span in a flex wrapper (48px/48px).
3. **F3 — Testimonial edge fades**: the clone's fade directions were
   SWAPPED (`bg-gradient-to-l` on the left, `to-r` on the right) — no
   darkening at the strip's actual edges, a hard black cut 64–128px
   inside whenever cards slide under.
4. **F4 — AI-suggestion paragraph**: the live's own class carries a
   broken inert token (`text-sl(var(--foreground))]`) so it INHERITS full
   white; the clone shipped `text-white/50`.

**NEW survey surface #2 — the per-route `<head>` map** (all 8 live
routes): the live ships per-route og:title (= the page title),
description = `"X on SAAS Company. {default}"` on the five content
routes, og:url = twitter:url = canonical = the route, a web app manifest,
and og:image + twitter:image (a 1200×630 four-petal render — **whose URL
404s**: a dead media object). The clone had static root og:title, the
default description everywhere, NO og:url/canonical/image/manifest, and
TWO meta tags the live doesn't ship (theme-color, viewport-fit).

**NEW survey surface #3 — real-pointer interaction probes**: an
agent-browser `mouse move` reported the Get Started pill's hover as
BROKEN (`:hover` matched but no utility applied) — Playwright's real
`page.mouse.move` disproved it: full hover parity (shimmer overlay
opacity 1 + the exact pastel gradient + gradientShift 6s; the arrow
slides exactly 2px — v3 `transform: matrix` vs v4 `translate: 2px`,
rendering-identical). **Lesson: hover probes need real pointer events.**

**NEW survey surface #4 — the mobile burger's real clickability** (the
operator's standing ask): **the live's mobile menu is UNOPENABLE by a
real tap at 390** — its own empty toast portal (`fixed top-0 z-[100]`,
390×32, `pointer-events: auto`) covers the nav's top strip and blocks
the burger (a real Playwright click opens nothing; only a JS `.click()`
opens it — the panel itself is byte-identical: 0,56 390×397, 7 rows
@44px, same hrefs, black/95 + blur 24). The clone's burger works — kept
as the intended UX (new ledger entry D32, the D21 class).

Also verified clean: 390 pricing stack (342px @ x24 ×3), hero h1
44px/−0.88px, strip x0 + scrollWidth 2408, the flogo/logo keyframes
(byte-identical in the live's CSS), the anchor/CTA inventory (identical
except D1/D22), reduced-motion behavior, and the post-login live state
with the operator credentials (lands on `/`, Dashboard → /checkout
still 404 — the D1 superset documentation remains valid).

## Phase 3 — Remediation (TDD; 16 e2e pins + 7 unit pins observed RED first)

- **R1** per-person avatar `gradient` fields (the live's exact class
  strings, in strip order).
- **R2** the Enterprise null-price branch renders the live's plain
  30px DIV.
- **R3** the edge fades un-swapped (`to-r` left / `to-l` right).
- **R4** the AI-suggestion paragraph to the rendered truth (full white).
- **R5** the head pattern: new `src/lib/seo.ts`
  (`pageDescription`/`pageTitle`/`routeMetadata`, unit-tested) + per-page
  exports + `login/layout.tsx` (the client page needed a server metadata
  home) + `public/manifest.json` (the live's values, self-hosted) +
  `public/og-image.png` (a generated 1200×630 brand card — the working
  replacement for the live's dead URL) + the invented theme-color and
  viewport-fit removed. `twitter:url` is not expressible through Next's
  metadata API — documented as an accepted engine deviation.
- **R6** `<body>` stripped to the live's bare element; the invented
  `-webkit-font-smoothing: antialiased` declaration deleted (the live
  computes `auto`).
- **R7** three class-string cleanups: the nav pill's invented
  `group-hover:text-black`, the burger's invented `transition-colors`,
  the mockup link's dead overlay span.

Two spec corrections during GREEN: the avatar selector needed scoping to
the 280px cards (12 gradient circles exist on the page), and the head
spec asserts canonical/og:url PATH structure (prerendered pages bake
`metadataBase` at build time — the origin is config, the structure is
the parity claim).

## Phase 4 — Verification

- **Gate: ALL GREEN — 215 checks** (80 unit + 97 e2e + 38 smoke; +7 unit:
  the seo suite; +16 e2e: the section-parity + head-metadata suites).
- **Paired re-survey**: word parity 1.0000 on all 8 routes; avatars
  four-distinct with the live's exact colors (the lab/oklab spelling is
  the D6 serialization class); fades `to right`/`to left` like the live;
  Custom DIV 30px/36; AI-suggestion full white; body bare + `auto`;
  pill/burger class strings exact; head structurally exact per route.
- **VLM**: pricing 99 / testimonials 99 / full 98 — every remaining flag
  dismissed with DOM evidence (the live's randomized feature-bar width
  rendered 0px in the capture — the D20 class; the "FEATURES label" and
  footer-icon flags were misreads — neither side has the label; both
  sides carry lucide-mail).
- **Screenshots**: all 17 standard shots refreshed against the
  remediated build.

## Phase 5 — Docs & handoff

PAD (revision block, ledger D26–D32, §7 counts, §11 key files), AGENTS
(gotchas 16–18: real-pointer hovers, the per-route head pattern, the
live's pointer-blocked burger), CLAUDE (session-6 context, stack counts),
README (215 badge + the SEO feature row + counts),
`saas-company_SKILL.md` v2.5.0 (lessons 20–21), the remediation plan
(`docs/remediation-plan-session6.md`), and this log. `.env.example`
re-verified (no new env vars — all changes are code/assets). Commit +
SSH push per the runbook.
