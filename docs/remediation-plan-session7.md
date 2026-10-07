# Remediation Plan — Session 7 (2026-10-07)

**Scope:** Fix the issues, bugs and gaps found by the Session 7 parity audit
of this repository against the live reference (`saas-company.base44.app`),
executed TDD-first, gated by the full quality gate (§7.3 of the PAD), and
re-verified by a fresh paired survey.

**Audit method:** fresh paired captures of every live route (word parity
1.0000 on all 8 routes vs the Session-6 ground truth: the **reference is
UNCHANGED**). The Session-7 NEW audit surfaces — layers no prior session
surveyed:

1. **The full asset/network inventory** (performance resource entries +
   DOM `<link>`/`<img>`/`<video>` inventories + the `document.fonts` census,
   both sides): byte-verified the hero video (md5-identical) and the
   Gasparyan SVG (identical), and found the live's favicon URL is DEAD.
2. **The typography layer** (computed `letter-spacing` + first-resolved
   `font-family` of EVERY text element, live vs clone, systematically) —
   the survey that found this session's headline bugs: the reference's SPA
   bundle DOUBLES the `tracking-wider`/`tracking-widest` scale steps, and
   the logo-cloud wordmarks carry INLINE font-family styles (one of them
   DM Serif Display — never rendered by the clone).
3. **Keyboard traversal + focus visibility** (22-step Tab walk, both sides)
   and an **axe-core 4 run** (both sides) — clone-side: one invalid-ARIA
   pattern; the live's own critical violations (unnamed buttons/links,
   103 landmark-less nodes) are parity or already superseded here.
4. **Edge viewport geometry** (1920 and 320 — beyond the standard
   1440/1280/768/390 set) and **the mobile menu's resize-while-open
   behavior** (the frontend-ui-testing-journey failure taxonomy applied for
   the first time).

Every conclusion below was settled with computed styles, byte comparisons,
or real pointer events — never VLM impressions.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | **The letter-spacing SCALE diverges systematically.** The reference's SPA css bundle overrides Tailwind's tracking scale: its `tracking-wider` renders **0.1em** (measured 1.2px at the 12px hero badge, the "Saves 4 hours/week" chip, the CTA eyebrow) and its `tracking-widest` renders **0.2em** (measured 2.8px at the 14px "Trusted by" label and the Problem eyebrow, 2.4px at the 12px section eyebrows, 2.4px at the live's FAQ eyebrow). The clone ships v4 defaults (0.05em / 0.1em) — every eyebrow label on every SPA route renders at HALF the reference's tracking. Six sessions missed it: word parity can't see letter-spacing, and no prior computed-style probe asked about it. The class strings are IDENTICAL both sides — only the scale values differ | `src/app/globals.css` (`@theme` — add `--tracking-wider: 0.1em; --tracking-widest: 0.2em;`) | HIGH | Verified (computed letterSpacing on 6+ elements, both sides, multiple routes) | Visual (systematic) |
| F2 | **The login route must NOT inherit the doubled scale.** The live's /login loads its OWN css bundle (`/static/index-*.css`) which uses the STANDARD scale — its "or" divider computes 0.6px (0.05em at 12px). With F1's global override, the clone's login divider would double to 1.2px and break login parity. Pin the standard value back inside the login route's existing scoped `<style>` (the `--tracking-*` custom properties inherit; v4 utilities emit `letter-spacing: var(--tracking-wider)`, so a body-scoped pin covers the route) | `src/app/login/page.tsx` (route `<style>` body rule: add `--tracking-wider: 0.05em;`) | HIGH | Verified (live login computed 0.6px vs live landing 1.2px for the same class) | Visual (route-scoped) |
| F3 | **The "Thrune" wordmark renders the wrong serif face.** The live's three serif wordmarks carry INLINE `style="font-family: …"` declarations (measured: Zphlix `"Playfair Display", serif`, Thrune `"DM Serif Display", serif`, Melpyx `"Playfair Display", serif`) — Thrune renders DM SERIF DISPLAY on the live. The clone uses the `font-serif` class on all three, whose stack is Playfair-first — Thrune renders Playfair (a visibly different face; the live's `document.fonts` census shows "DM Serif Display 400 loaded", the clone's shows it never used). Drop the class and ship the live's inline styles (class strings become byte-identical too) | `src/components/sections/logo-cloud.tsx:29,43,56` | HIGH | Verified (inline style attrs + computed first family, both sides) | Visual |
| F4 | **The Testimonials H2 renders without the reference's tracking-tight.** The live's "Loved by Teams Everywhere" H2 carries `tracking-tight` (computed −1.2px at 48px); the clone's carries `tracking-normal` (computed `normal`). Every other heading matches (the Session-6 CTA-h2 note was a different element and remains correct — both sides' CTA h2 compute `normal`) | `src/components/sections/testimonials.tsx:50` | MEDIUM | Verified (computed letterSpacing, both sides, all H2s) | Visual |
| F5 | **The Gasparyan logo's alt attribute diverges.** The live's img carries `alt="Logo"`; the clone's `alt="Gasparyan logo"`. (The SVG bytes are identical — only the DOM attribute differs.) | `src/components/sections/logo-cloud.tsx:77` | LOW | Verified (DOM attr, both sides) | DOM parity |
| F6 | **The star-rating rows use invalid ARIA.** Each testimonial card's stars container is a plain `div` carrying `aria-label="5 out of 5 stars"` — axe-core flags `aria-prohibited-attr` (aria-label is not allowed on non-interactive, role-less elements). The live has NO aria there at all (its own axe report is worse: unnamed buttons/links). Keep the a11y superset but make it valid: `role="img"` + the existing aria-label on the container, `aria-hidden` on the decorative Star SVGs | `src/components/sections/testimonials.tsx:74` | LOW | Verified (axe-core 4 run, clone 8 nodes; live 0) | Accessibility |
| F7 | **Mobile menu: resizing across the md boundary while open leaves the page scroll-locked.** Open the menu at 390, resize to ≥768: the panel stays mounted (visually hidden by `md:hidden`) and `document.body.style.overflow` stays `"hidden"` — the desktop page cannot scroll until Escape is pressed. Root cause: the `open` state never resets when the burger unmounts. Fix: a `matchMedia("(min-width: 768px)")` listener calls `setOpen(false)` when the query starts matching (the classic resize-while-open failure class from the mobile-navigation testing taxonomy). Note: the body scroll-lock itself is an undocumented superset (the live does NOT lock scroll when its menu is open — verified via JS-click on the live) — keep it as the intended UX and document it in the deviations ledger | `src/components/site/navbar.tsx:78-88` | MEDIUM | Verified (real resize probe, clone; live overflow stays empty with menu open) | Functional bug (superset chrome) |
| F8 | **No apple-touch-icon.** The live's login route ships `<link rel="apple-touch-icon">` (its URL is DEAD — same storage-404 class as its favicon and og:image). The clone ships none. Ship a WORKING self-hosted one app-wide (the favicon.svg asset) — the established D30 working-asset superset pattern | `src/app/layout.tsx` (metadata.icons) | LOW | Verified (link inventory per route, both sides; live URL curl = storage 404) | Superset |

### Live-side bugs found (no clone change — document)

| # | Live bug | Evidence | Clone behavior |
|---|----------|----------|----------------|
| L1 | **The live's favicon URL is DEAD** — `…/images/public/…/e547f20b2_Fabicon.svg` returns `storage: object doesn't exist` from media.base44.com (every route links it) | curl of the exact href | The clone's working self-hosted `/favicon.svg` is the superset (D30 class) — document alongside |
| L2 | **The live's apple-touch-icon (login route) points at the same dead URL** | curl + link inventory | F8 ships the working superset |
| L3 | **The D32 burger pointer-block STILL confirmed** — the empty toast portal (`fixed top-0 z-[100]`, 390×32) still covers the burger; a real click times out; only a JS `.click()` opens the menu | elementFromPoint at the burger center = the toast portal; real-click timeout | The clone's working burger remains the intended UX (D32) |
| L4 | **The live's CSS ships dead keyframes** (`lens-flare` — no referencing class; `.animate-wave-flow` — no DOM user) and its H1 embeds a literal `<style>` node (why the H1's `textContent` leaks `@keyframes organic-gradient`) — inert platform artifacts, no rendered impact | CSS grep + DOM probe + innerText-vs-textContent | No action (documented non-finding) |

### Non-findings (checked, clean — dismissed with evidence)

- **Hero video**: md5-identical bytes (the live's
  `6ef478b34_AI_LandingPage_Veo31…mp4` = our `public/media/hero-ai-loop.mp4`);
  attributes (muted/loop/autoplay/playsInline, 1920×1080) identical.
- **Gasparyan SVG**: byte-identical.
- **Edge viewports 1920 / 320**: h1 size/tracking/box, hero box, page/body
  widths, pricing element widths — all EXACT both sides.
- **Tab order**: a 22-step Tab walk is IDENTICAL on both sides (nav → hero
  CTA → mockup → tabs → pricing buttons → testimonial strip → footer); the
  focus ring computes `rgba(213, 0, 255, 0.5)` (violet/50) everywhere on
  both sides (Session 5's fix holds).
- **axe-core parity**: the color-contrast flag (the violet chip) and the
  scrollable-region-focusable flag (the testimonial strip) fire on the LIVE
  too — parity; the live's button-name/link-name/region violations are
  already superseded here (our newsletter button and logo link are named;
  our pages use landmarks).
- **Badge shimmer**: both sides animate the beta badge via SVG `<linearGradient>`
  + SMIL `<animate>` (no CSS animation on either side) — structurally
  identical; the live's CSS has no `border-shimmer` classes (our class names
  are implementation detail).
- **Post-login live state** (operator credentials): lands on `/`, chrome
  unchanged (Log In + Get Started), `/dashboard` `/app` `/workspace`
  `/checkout` all SPA-404 — the D1 superset documentation remains valid.
  The repo's `docs/saas-company-dashboard.png` is the CLONE's own seeded
  dashboard (demo@novaai.app, 7,120 runs, 160h — the seed data), i.e. the
  image documents this app's superset, not a live surface.
- **Mobile menu geometry**: panel `Wx397 @ (0,56)`, 7 rows @ 44px, exact
  hrefs/order, `bg-black/95` (oklab serialization) + `blur(24px)` at every
  width 320–767; Escape/X/navigate close at every width — byte-identical to
  the live's panel (Session 6 measurements hold).
- **Word parity 1.0000 on all 8 routes** (reference unchanged since
  Session 6).

---

## 2. Remediation (TDD — every pin observed RED before its GREEN)

### R1 — The tracking scale (F1) + the login pin (F2)

- `globals.css` `@theme`: add
  `--tracking-wider: 0.1em; --tracking-widest: 0.2em;` (the reference's SPA
  scale — measured), with a comment citing the probe values.
- `login/page.tsx` route `<style>`: add `--tracking-wider: 0.05em;` to the
  body rule (the login bundle's standard scale — its "or" divider computes
  0.6px on the live).
- **RED first** (new `tests/e2e/typography-parity.spec.ts`):
  - hero badge ("NOW IN PUBLIC BETA…") computes `letter-spacing: 1.2px`
    (0.1em at 12px);
  - "Trusted by 5,000+ teams worldwide" computes `2.8px` (0.2em at 14px);
  - a section eyebrow ("HOW IT WORKS" — text-xs) computes `2.4px`
    (0.2em at 12px);
  - the FAQ page eyebrow ("FAQ") computes `2.4px`;
  - the login "or" divider still computes `0.6px` (the pin — WITHOUT it
    the global override would double it to 1.2px).

### R2 — The wordmark inline font-families (F3)

- `logo-cloud.tsx`: replace the `font-serif` class on the three wordmark
  spans with the live's exact inline styles:
  Zphlix/Melpyx `fontFamily: '"Playfair Display", serif'`,
  Thrune `fontFamily: '"DM Serif Display", serif'` (the faces are already
  loaded — next/font declares both under their real family names; DM Serif
  includes the italic cut Thrune renders in).
- **RED first** (typography spec): the Thrune span's computed
  `font-family` starts with `"DM Serif Display"`; Zphlix and Melpyx start
  with `"Playfair Display"`; none of the three carries a `font-serif`
  class (class-string parity with the live's class-less spans).

### R3 — The Testimonials H2 (F4)

- `testimonials.tsx:50`: `tracking-normal` → `tracking-tight` (the live's
  class; computed −1.2px at 48px).
- **RED first** (typography spec): the H2's computed `letter-spacing` is
  `-1.2px`.

### R4 — The Gasparyan alt (F5)

- `logo-cloud.tsx:77`: `alt="Gasparyan logo"` → `alt="Logo"` (the live's
  verbatim).
- **RED first** (typography spec): the logo-cloud img carries
  `alt="Logo"`.

### R5 — Valid star-rating ARIA (F6)

- `testimonials.tsx:74`: the stars container gets `role="img"` (keeping the
  aria-label — now permitted) and the mapped Star icons get
  `aria-hidden="true"`.
- **RED first** (typography spec): the container computes
  `role="img"` + keeps `aria-label="5 out of 5 stars"`; the stars carry
  `aria-hidden`.

### R6 — Mobile menu close-on-md (F7)

- `navbar.tsx`: add a `matchMedia("(min-width: 768px)")` effect that calls
  `setOpen(false)` when the query starts matching (closes the menu, which
  unmounts the panel AND restores body scroll through the existing effect).
- **RED first** (mobile-navigation spec, new test): open the menu at 390 →
  `setViewportSize(1200)` → the panel is detached and
  `document.body.style.overflow` is `""`.

### R7 — The apple-touch-icon superset (F8)

- `layout.tsx` metadata: `icons: { icon: […], apple: [{ url: "/favicon.svg" }] }`
  — a WORKING self-hosted icon where the live's own URL 404s (the D30
  working-asset pattern).
- **RED first** (head-metadata spec): every route's head carries
  `<link rel="apple-touch-icon" href="…/favicon.svg">`.

### R8 — Documentation alignment

- PAD: revision block; §5.4 ledger — D33 (the doubled SPA tracking scale →
  parity), D34 (wordmark inline font-families → parity), D35 (testimonials
  H2 tracking-tight → parity), D36 (Gasparyan alt → parity), D37 (star
  rating ARIA → superset made valid), D38 (body scroll-lock while the
  mobile menu is open → documented superset; the live locks nothing),
  D39 (apple-touch-icon working superset; the live's URL is dead); §7 test
  counts; the L1/L4 live-side notes.
- AGENTS.md: gotcha — "the reference's SPA bundle overrides the TRACKING
  scale (wider 0.1em / widest 0.2em) while its login bundle doesn't —
  route-scoped token pins are the pattern" + the resize-while-open lesson.
- CLAUDE.md: session-7 context block + stack counts.
- README: feature row (typography parity), counts.
- `saas-company_SKILL.md`: lessons 22–23 (survey the TYPOGRAPHY layer —
  letter-spacing and first-resolved font-family per element, a layer six
  computed-style spot-probe sessions never asked about; inline-style
  parity: the live styles wordmarks inline, classes alone hid the third
  face) + version bump.
- `worklog.md` + this plan; screenshots refresh; `.env.example` re-verified
  (no new env vars — all changes are code).

---

## 3. Pre-execution codebase validation (done before writing this plan)

- Baseline gate on the inherited tree: ALL GREEN — lint ✓ typecheck ✓
  Vitest 80/80 ✓ build ✓ smoke 38/38 ✓ Playwright 97/97 ✓ (215 checks).
- `.env` `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root ✓;
  `.env.example` tracked and in sync ✓; all four configs exclude `skills/` ✓
  (tsconfig `exclude`, eslint `ignores`, vitest `include`, Next `src/`
  scoping). The shell's exported absolute `DATABASE_URL` neutralized for
  every command (the AGENTS.md discipline).
- All fix sites located and read: `globals.css` (theme block lines 55–105,
  `@theme inline` 108–114), `login/page.tsx` (route style 134–171, "or"
  divider 266), `logo-cloud.tsx` (29, 43, 56, 77),
  `testimonials.tsx` (50, 74–77), `navbar.tsx` (78–88, the open state),
  `layout.tsx` (icons 62–64).
- Existing pins audited for conflicts: no spec pins letter-spacing,
  font-serif, the wordmark spans, the Gasparyan alt, star ARIA, or the
  apple-touch-icon (rg over tests/e2e). The brand-parity font-chain pin
  covers the body/heading chain, not the wordmarks. The mobile-navigation
  suite has no resize test to conflict with the new one.
- v4 mechanics verified for the fix: `tracking-wider` compiles to
  `letter-spacing: var(--tracking-wider)` (the compiled CSS shows both the
  `:root` custom property and the var() reference), so `@theme` overrides
  and the login-scoped pin both work; next/font declares `Playfair
  Display` and `DM Serif Display` under their real family names (inline
  `font-family` declarations resolve them), with the italic cut of DM
  Serif already configured in layout.tsx.

## 4. Execution order

R1 (scale + pin, one RED batch) → R2 → R3 → R4 → R5 (typography batch) →
R6 (navbar) → R7 (head) → full gate → paired re-survey (word parity + the
new pins' metrics + tracking/wordmark re-probes + VLM spot checks on the
logo cloud and an eyebrow-heavy section) → screenshots → docs (R8) →
commit + SSH push.
