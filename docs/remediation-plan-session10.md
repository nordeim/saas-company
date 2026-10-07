# Remediation Plan — Session 10 (2026-10-08)

**Scope:** Fix the issues, bugs and gaps found by the Session 10 parity audit
of this repository against the live reference (`saas-company.base44.app`),
executed TDD-first, gated by the full quality gate (§7.3 of the PAD), and
re-verified by a fresh paired survey.

**Audit method:** fresh paired captures (word parity 1.0000 on all 8 routes —
the **reference is UNCHANGED** since Session 9). The Session-10 NEW audit
surfaces — layers no prior session systematically surveyed:

1. **The LOOPING-MOTION layer** (the session's headline): a full-page census
   that samples the computed `transform`/`opacity` of EVERY element across
   multiple rounds (600–700ms apart, after all entrances settle) and
   classifies still-moving elements as loops — PLUS config extraction from
   the live's JS bundle (`animate:{…}`/`transition:{…}` pairs). This is the
   survey class the Session-8 motion audit could not see: framer-motion
   writes inline styles per frame, so an element can be mid-loop while its
   computed `animation`/`transition` properties read `none` — a
   CSS-property survey calls it static. Live: **12 looping elements**;
   clone: **4**.
2. **The post-login/authenticated surface** (the operator's dashboard
   question): logged into the live with the provided credentials and probed
   every plausible authenticated route.
3. **Zoom/reflow accessibility** (WCAG 1.4.4/1.4.10 — designed for Session 9,
   dropped): 200%/400% zoom-equivalent viewports (640/320px), horizontal
   overflow, overflow-element and clipped-text inventories.
4. **The asset-caching header layer**: `Cache-Control`/`ETag` on the HTML,
   the hashed chunks, and the `public/` assets, live vs clone.
5. **The clone dashboard's axe-core audit** (the superset surface was never
   a11y-audited) + the mobile-nav standing re-verification + interaction
   micro-behaviors (pricing toggle ARIA, testimonial strip drag).

Every conclusion below was settled with computed styles sampled over time,
pixel-brightness adjudication, bundle-config extraction, or axe-core — never
VLM impressions.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | **The live runs EIGHT looping-animation groups the clone renders static** (the Session-4 "the mockup is completely STATIC" claim — gotcha 15 — is FALSIFIED for the current live; framer's per-frame inline writes are invisible to CSS-property surveys). Extracted from the live's bundle and verified rendering with multi-round sampling: (a) hero mockup ambient `-inset-32` glow `scale:[1,1.15,1] opacity:[.3,.5,.3]` 4s easeInOut infinite (clone renders opacity 1, static); (b) the mockup's red browser-chrome dot (w-2.5) `scale:[1,1.2,1]` 2s infinite (clone static); (c) the mockup's FOUR side-list dots `bg-primary/80` `scale:[1,1.2,1]` 2s infinite with staggered `delay:i*.1` (0.1/0.2/0.3/0.4 — the map starts at 1; clone static); (d) the One-Platform mini-dashboard's skeletons: `h-4 bg-white/20` `opacity:[.5,1,.5]` 3s, `h-3 bg-violet/30` `opacity:[.3,.8,.3]` 3s delay .5, the four `h-12` tiles `opacity:[.4,1,.4]` 3s delay `t*.2` (0.2–0.8), the `h-20` box `opacity:[.3,.9,.3]` 3s delay 1 (clone static) | `src/app/globals.css` `@theme` (7 new `--animate-*` tokens + keyframes) + `src/components/sections/dashboard-preview.tsx` + `src/components/sections/problem.tsx` | HIGH | Verified (bundle configs + rendered value-sampling both sides; full-page loop census: live 12 loops, clone 4) | Visual (motion layer — the Session-8 family, one level deeper: LOOPS not entrances) |
| F2 | **The hero mockup's under-glow renders structurally different.** The live's `-bottom-16` glow is a SIBLING of the card (child of the `relative w-full max-w-4xl mx-auto` wrapper — unclipped), while the clone's is the LAST CHILD OF THE CARD (clipped by the card's `overflow-hidden`: pixel adjudication — the live bleeds below/right of the card edge (brightness 1.3–2.3 vs background 0.0), the clone bleeds NOTHING (0.0) and renders the in-card strip brighter (7.2 vs 2.7)). The live's glow also renders UNCENTERED: its framer `y` transform REPLACES the v3 `--tw-translate-x` transform (the `-translate-x-1/2` class is inert in effect — left edge at parent center, extending 149px past the card's right edge), and it pulses `y:[0,-12,0] opacity:[.3,.5,.3]` 3s infinite. The clone's renders centered (v4's `translate` property applies), static, opacity 1 | `dashboard-preview.tsx`: move the glow out of the card (sibling, matching the live's DOM) + `translate-none` (kill the v4 translate — match the live's rendered position) + the `animate-mockup-glow` loop | HIGH | Verified (DOM chains both sides, computed transform/translate, pixel-brightness adjudication, the live's bundle config) | Visual (structure + motion) |
| F3 | **The clone's dashboard (the superset surface) fails axe-core twice.** (a) `color-contrast` SERIOUS: `text-white/40` on dark at small sizes — the workflow count badge ("6 total"), the category tags, the run-stats line (white at 40% on #0f0f0f ≈ 3.6:1 < 4.5:1); (b) `page-has-heading-one` MODERATE: no `<h1>` anywhere on /dashboard (the page's headings start at h2) | `src/components/dashboard/dashboard-app.tsx`: the breadcrumb "Dashboard" span → `<h1>` (same classes); `text-white/40` → `text-white/60` on the four muted-text lines (≥7:1) | MEDIUM | Verified (axe-core 4.10 on the logged-in dashboard) | Superset quality (a11y) |
| F4 | **The `public/` assets ship `Cache-Control: public, max-age=0`** — the 1.9MB hero video (the heaviest asset) re-validates on every load; the live's CDN serves its static assets `public, max-age=604800`. (The hashed `/_next/static/*` chunks already ship immutable ✓ — only the `public/` folder lacks caching) | `next.config.ts` `headers()`: `/media/:path*`, `/favicon.svg`, `/og-image.png`, `/manifest.json` → `Cache-Control: public, max-age=604800` (the live's value) + smoke pins | MEDIUM | Verified (curl -I both sides) | Production parity |
| F5 | **The pricing-toggle pills carry `aria-pressed` on the clone; the live has none** (an undocumented D55-class a11y superset — the toggle is a two-state control and `aria-pressed` communicates the state to AT) | PAD §5.4 ledger row (documentation) | DOCS | Verified (both DOMs) | Superset (document) |
| F6 | **The live has NO authenticated experience** (the operator's standing dashboard question, settled definitively): logging in with the provided credentials redirects to `/` with the navbar UNCHANGED (still "Log In" + "Get Started"); `/dashboard`, `/app`, `/home`, `/workflows`, `/workspace`, `/settings`, `/account` all render the SPA 404 even authenticated. The repo's `/dashboard` remains the D1 designed superset, and the operator's reference image (`docs/saas-company-dashboard.png`) is this repo's own dashboard (VLM-verified: the demo@novaai.app workspace) | PAD §5.4 note (documentation) | DOCS | Verified (login flow + route probes on the live) | Live-side (document) |

### Non-findings (checked, clean — dismissed with evidence)

- **Word parity 1.0000 on all 8 routes** (reference unchanged since Session 9).
- **The mobile navigation** (the standing operator ask): panel byte-identical
  (0,56 390×397, seven rows all 44px — Features #features, How It Works
  #how-it-works, Pricing #pricing, Testimonials #testimonials, FAQ /faq, Log
  In, Get Started #pricing); the burger identical (342,16 24×24, the same
  classes, no transition classes either side — no v4 trap); the clone's
  real-tap opens, locks scroll, closes on Escape/navigate, and the resize
  guard closes it across 768; the live's tap remains pointer-blocked (D32).
- **Zoom/reflow at 640/320 (200%/400% zoom equivalents): zero horizontal
  scroll both sides** (documentElement and body), no clipped text elements;
  the only overflowing elements are decorative, absolutely-positioned glows
  and the fixed-width testimonial cards inside their scrollable strip — the
  same families on both sides (the one delta — the live's `-bottom-16` glow
  overflowing at 320 — is F2's unclipped sibling, covered by the fix).
- **The testimonial strip**: byte-identical class strings (`flex gap-6
  overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]…`),
  identical computed overflow/cursor (`grab`)/scroll-snap (`none`)/
  scrollbar-width (`none`)/scrollWidth (3208), and identical drag behavior
  (mouse-drag scrolls NEITHER side — no drag-to-scroll handler on either).
- **The mockup header-bar gradients**: the live's rgba vs the clone's oklab
  spellings of the SAME colors (D6, rendering-identical — dismissed).
- **The mockup bar-chart heights**: the live randomizes per load (D20,
  documented — the clone's measured snapshot is the pinned behavior).
- **The clone's hashed chunks** already ship `immutable` caching ✓.

---

## 2. Remediation (TDD — every pin observed RED before its GREEN)

### R1 — The looping-animation layer (F1): the hero mockup

`globals.css` `@theme` gains (the measured framer configs, verbatim):

```css
--animate-mockup-ambient: mockup-ambient 4s ease-in-out infinite;
--animate-mockup-dot: mockup-dot 2s ease-in-out infinite;
--animate-skel-line: skel-line 3s ease-in-out infinite;
--animate-skel-violet: skel-violet 3s ease-in-out infinite;
--animate-skel-tile: skel-tile 3s ease-in-out infinite;
--animate-skel-wide: skel-wide 3s ease-in-out infinite;
```

with keyframes (ambient: scale 1→1.15→1 + opacity .3→.5→.3; dot: scale
1→1.2→1; the four skeleton opacity pairs [.5,1] / [.3,.8] / [.4,1] / [.3,.9]).

- `dashboard-preview.tsx`: the ambient glow gains `animate-mockup-ambient`;
  the red chrome dot gains `animate-mockup-dot`; the four list dots gain
  `animate-mockup-dot` + `[animation-delay:100ms/200ms/300ms/400ms]`
  (the live's `delay:i*.1`, i starting at 1).
- **RED first** (`tests/e2e/mockup-motion-parity.spec.ts`): the computed
  `animationName`/`animationDuration`/`animationIterationCount` of each
  element + the staggered `animationDelay` chain + a two-sample
  value-change check (the rendered loop actually moves).

### R2 — The under-glow restructure (F2)

- `dashboard-preview.tsx`: the `-bottom-16` glow moves OUT of the card →
  the LAST child of the Reveal wrapper (the live's DOM: wrapper >
  [card, glow]); gains `animate-mockup-glow` (the 3s y/opacity loop) and
  `translate-none` (v4 emits the `translate` property from
  `-translate-x-1/2`, which the live's framer transform kills — the pin
  reproduces the live's RENDERED position: left edge at the wrapper's
  horizontal center, extending past the card's right edge, unclipped).
- **RED first**: the glow's parent is the wrapper (NOT the card); the card
  carries exactly two children; the glow's computed `translate` = `none`;
  its left edge ≈ the wrapper's center-x; `animationDuration` = 3s;
  a two-sample transform/opacity change; the pixel-bleed check (a sampled
  point just below the card's bottom edge inside the glow's x-range is
  brighter than the page background).

### R3 — The mini-dashboard skeleton loops (F1d)

- `problem.tsx`: the four skeleton shapes gain the `animate-skel-*` classes
  + delays (`[animation-delay:500ms]` on the violet line, `200/400/600/800ms`
  on the tiles, `[animation-delay:1s]` on the wide box).
- **RED first**: the animation pins + the delay chain.

### R4 — The dashboard a11y fixes (F3)

- `dashboard-app.tsx`: the breadcrumb "Dashboard" span → `<h1>` (identical
  classes — visually unchanged, semantically the page heading); the four
  `text-white/40` muted lines (count badge, category tag, run stats, empty
  state) → `text-white/60` (≥7:1 on #0f0f0f — passes AA at every size).
- **RED first**: /dashboard renders exactly one `<h1>` with the text
  "Dashboard"; the three flagged lines compute an alpha-composited
  luminance ≥ white/60 (assert the class + the computed color's rgb ≥ 150).

### R5 — The public-asset cache headers (F4)

- `next.config.ts` `headers()`: `Cache-Control: public, max-age=604800` on
  `/media/:path*`, `/favicon.svg`, `/og-image.png`, `/manifest.json` (the
  live's CDN value; the hashed chunks keep their immutable headers).
- **RED first**: `scripts/smoke-test.sh` +1 check — the hero video's
  response carries `max-age=604800` (smoke 42 → 43).

### R6 — Documentation alignment (F5/F6 + the corrections)

- PAD: revision block; ledger **D57** (the looping-motion layer + the
  measured config table), **D58** (the under-glow restructure — sibling,
  unclipped, uncentered, pulsing), **D59** (the dashboard a11y fixes),
  **D60** (the public-asset cache headers), **D61** (the pricing-toggle
  aria-pressed superset), **D62** (the live's post-login surface — no
  authenticated experience, all routes 404); §5.5 **trap 16** (framer
  inline loops are invisible to CSS-property surveys — sample VALUES over
  time; the Session-4 "static mockup" census method falsified); §7 counts;
  §11 key files.
- AGENTS.md: **gotcha 15 REWRITTEN** (the mockup is NOT static — the
  chrome dot, list dots, ambient glow, under-glow, and mini-dashboard
  skeletons LOOP; never re-add the skeleton-wave shimmer — the dots keep
  solid `bg-primary/80` and the loops are transform/opacity only).
- CLAUDE.md: session-10 context block + counts. README: counts, the
  motion-testing row, troubleshooting (asset caching).
- `saas-company_SKILL.md` v2.9.0: lesson 28 (survey the LOOP layer —
  entrances settle, loops run forever; a "static" verdict from
  animation-property reads is worthless against a JS animation engine),
  lesson 29 (framer's inline transform REPLACES tailwind v3's translate
  composition — the rendered position can be structurally "wrong" on the
  live; match the rendered geometry, and v4's separate `translate`
  property needs an explicit kill to reproduce it).
- `worklog.md` + this plan + `docs/session_15.md`; screenshots refresh;
  `.env.example` re-verified (no new env vars — all changes are
  code/config).

---

## 3. Pre-execution codebase validation (done before writing this plan)

- Baseline gate on the inherited tree: ALL GREEN — lint ✓ typecheck ✓
  Vitest 92/92 ✓ build ✓ smoke 42/42 ✓ Playwright 150/150 ✓ (284 checks).
- `.env` `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root ✓
  (re-created from `.env.example` after the fresh clone; the shell's
  exported absolute `DATABASE_URL` neutralized per-command — the AGENTS.md
  trap was live in this shell again, and the first `db:seed` silently wrote
  a foreign file before the discipline was applied).
- `.env.example` tracked and in sync ✓; tsconfig/eslint/vitest/playwright
  all exclude `skills/` ✓.
- Existing pins audited for conflicts: the `landing.spec.ts` "Session 4
  static parity" block pins the dots' solid purple BACKGROUND (unaffected —
  the loops are transform/opacity only; the block's comment gets corrected);
  `motion-parity.spec.ts:140` pins the mockup wrapper's pre-reveal
  translateY(60px) (unaffected — the glow moves to a sibling INSIDE the
  wrapper); `palette-parity.spec.ts:33`'s `[class*="bg-red-500"]` find is
  slash-excluding and color-pinning (unaffected — `animate-mockup-dot`
  adds no slash and no color); no spec pins the glow's parent, the
  skeleton class strings, or asset cache headers.
- v4 mechanics verified: `--animate-*` theme tokens generate `animate-*`
  utilities (the scroll-dot precedent); `translate-none` exists in v4's
  utility set (emits `translate: none`); CSS animations override normal
  author declarations including layered utilities, and the elements being
  looped carry no opacity/transform utilities that would fight the
  keyframes; the existing `prefers-reduced-motion` block collapses ALL
  animations to 0.01ms — the new loops pause under RM automatically (the
  D47-family documented a11y superset — the live's framer loops RUN under
  RM).

## 4. Execution order

R1 (the hero loops + the mockup-motion-parity spec, one RED batch) → R2
(the glow restructure + its RED batch) → R3 (the skeleton loops) → R4 (the
dashboard a11y) → R5 (the cache headers + smoke pin) → full gate → paired
re-survey (the loop census re-run + word parity + VLM spot checks on the
mockup and the One-Platform showcase) → screenshots → docs (R6) → commit +
SSH push.
