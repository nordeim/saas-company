# SAAS Company — Engineering Skill Document

> **Version:** 2.11.0 · **Last updated:** 2026-10-08 (Session 12 remediation)
> **Scope:** Every design decision, anti-pattern, debugging procedure, and
> parity method a future agent needs to work in this codebase.
> **Companion docs:** `README.md` (user-facing) · `AGENTS.md` (operator) ·
> `CLAUDE.md` (agent contract) · `Project_Architecture_Document.md` (source of
> truth) · `docs/remediation-plan-session2.md` (Session 2) ·
> `docs/remediation-plan-session3.md` (Session 3) ·
> `docs/remediation-plan-session4.md` (Session 4) ·
> `docs/remediation-plan-session5.md` (Session 5) ·
> `docs/remediation-plan-session6.md` (Session 6) ·
> `docs/remediation-plan-session7.md` (Session 7 — this revision's audit).

---

## §1. Project Identity & Design Philosophy

This repository is a **self-hosted, production-grade clone of
`https://saas-company.base44.app/`** — the dark-theme "NovaAI" SaaS marketing
site — rebuilt as a single deployable Next.js 16 application and extended into
a **functional superset**: where the reference ships dead links (its
"Dashboard" demo 404s; its footer form does nothing), this app runs a real
session-gated workflow workspace with an AI composer and working capture
forms.

Two laws govern every change:

1. **Parity is measured, never remembered.** The reference is a Base44 app
   that has been redeployed as different products across this repo's history
   (a PM workspace called ORBITAL, now the NovaAI marketing site). Before
   touching chrome, re-survey the live site (agent-browser at 1440/768/390 +
   VLM side-by-side). Copy is captured verbatim — **including the reference's
   own typos** (the footer reads "© 2026 NovaaAI" — double 'a' — cloned
   faithfully; do not "fix" it).
2. **Degrade, never fail.** External dependencies (the AI SDK) sit behind
   sanitizers and deterministic fallbacks. An environment without SDK access
   gets the template workflow — never a 500.

When parity and a functional superset conflict, document the deviation in the
PAD's §5.4 ledger instead of silently picking a side.

## §2. Tech Stack & Environment (locked versions)

| Layer | Version | Why it matters |
|---|---|---|
| Next.js | 16.4.0 (App Router, `output: "standalone"`) | One deployable unit; `outputFileTracingRoot` pinned so the standalone layout survives nested clones |
| React | 19.x | Required by Next 16 |
| TypeScript | 5 (strict, `noImplicitAny: false` template legacy) | The explicit `typecheck` gate is the ONLY type gate — the build sets `ignoreBuildErrors` |
| Tailwind CSS | 4 (CSS-first) | Tokens in `@theme` inside `src/app/globals.css`; NO `tailwind.config.*` ever |
| Prisma | 6.19.3 + SQLite | `db push` (no migrations by design); `db/custom.db` at the repo root |
| Auth | Node `crypto` (scrypt + HMAC-SHA256) | Zero external auth services; timing-safe comparisons |
| AI | z-ai-web-dev-sdk 0.0.x (server-only) | `src/lib/workflow.ts` fallback keeps the feature alive without it |
| Fonts | Self-hosted **Google "Vend Sans"** (variable wght 300-700, the exact gstatic subsets) + next/font (Playfair, DM Serif Display) | Byte-identical type rendering with the reference (Session 5 forensics) |
| Tests | Vitest 5 (80) · Playwright 1.63 (109) · bash/curl smoke (38) | 227 checks; the local gate is the only gate (no hosted CI) |
| Smooth scroll | lenis 1.3.x | The reference's momentum scrolling (`window.lenis`); wrapper in `src/components/site/smooth-scroll.tsx` |

Dependency policy: `package.json` carries `overrides` for
`braces`/`micromatch`/`fast-glob`/`deepmerge-ts` — patched transitive versions
for advisories whose parents haven't shipped fixes. The residual `braces`
GHSA-vfj7-8cjw-p6xm has no patched release upstream (vulnerable ≤ 3.0.3, the
latest published) and is lint-toolchain-only. **Never run
`npm audit fix --force` here** — it would downgrade `eslint-config-next`
16→14 to silence a dev-time advisory.

## §3. Bootstrapping & Configuration

```bash
npm install
cp .env.example .env           # DATABASE_URL="file:../db/custom.db"
npm run db:push && npm run db:seed   # demo@novaai.app / Demo1234!
npm run dev                    # :3000
```

The three env vars (`.env.example` is the contract):

| Var | Meaning |
|---|---|
| `DATABASE_URL` | Relative `file:` URLs resolve against `prisma/schema.prisma` for the CLI **and** against the same anchor at runtime (`src/lib/db-path.ts`) — one string → `<repo>/db/custom.db` in every context |
| `AUTH_SECRET` | HMAC secret for session cookies. Unset ⇒ insecure dev-only constant (loudly documented) |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata/sitemap/robots |

**The env trap (hard-won, twice):** a shell-exported absolute `DATABASE_URL`
overrides `.env` for the Prisma CLI AND the Next runtime — the server silently
opens a foreign database file. Symptom: `Error code 14: Unable to open the
database file` or smoke checks failing against empty tables. Fix: `env -u
DATABASE_URL <command>` or pin the value per command. Every script that boots
a server (`smoke-test.sh`, `playwright.config.ts` webServer, e2e
global-setup) pins its own value — keep that discipline.

## §4. The Design System (measured, code-first)

Tokens live ONLY in `src/app/globals.css` under `@theme` — full color values,
never bare HSL triplets (v4 resolves those to transparent):

| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#000000` | Page canvas |
| `--color-card` | `#0f0f0f` | Raised dark surfaces |
| `--color-border`/`--color-input` | `#242424` | Hairlines |
| `--color-primary` | `#8624ff` (hsl 267 100% 57%) | The `:root` primary — the purple gradient partner (mockup bars, glows, chips, stats) |
| `--color-violet` | `#d500ff` (hsl 290 100% 50%) | Brand magenta — text/border/bg-violet surfaces |
| `--color-accent`/`--color-electric-blue` | `#0055ff` (hsl 220 100% 50%) | Electric blue — the gradient end |
| `--color-destructive` | `#ef4444` | Problem cards, delete |
| `--font-heading`/`--font-body` | "Vend Sans" for BOTH | The live uses the Display cut for every element (no element resolves the Text cut — censused); the Text cut stays as fallback |
| `--font-serif` | Playfair Display → DM Serif Display | Client wordmarks; declared in `@theme inline` so the next/font var chain survives (the v4 var()-chain trap) |

Custom measured classes & keyframes (reuse — never re-derive):
`.workflows-gradient-text`, `.animated-gradient-text`, `.border-shimmer-*`,
`.anim-logo-*` (the four-petal logo choreography), `.get-started-shimmer`,
`.skeleton-wave`, `.accordion-panel`, marquee/float/pulse-glow, and
`animate-scroll-dot` (the hero indicator: translateY 0→8px, 1.7 s ease-in-out —
rAF-sampled from the reference; replaced Tailwind's `animate-bounce` which
bounced in place).

Base rules that carry parity: `button, [role="button"] { cursor: pointer }`
(v4 preflight sets no pointer); `h1–h6 { letter-spacing: .02em }` with the
hero H1 overriding to `-0.02em` inline; `prefers-reduced-motion` collapses
every animation (duration 0.01ms, iteration 1).

## §5. Component Architecture & Patterns

Four-layer model — dependencies point downward only:

```
Layer 0  prisma/schema.prisma        — the source of truth; regenerate after edits
Layer 1  src/app/api/**/route.ts     — validation + persistence + rate limiting
Layer 2  src/lib/*.ts                — pure domain logic (unit-tested, no React/Prisma imports)
Layer 3  pages & components          — presentation; server pages gate sessions before render
```

Load-bearing patterns:

- **The envelope (Pattern A):** every handler returns `ok(data)` /
  `fail(code, message, status)` from `src/lib/api.ts`; the client treats
  `ok: false` as an inline error string, never a throw.
- **SQLite URL resolution (Pattern B):** `src/lib/db-path.ts` resolves the
  relative `file:` URL against the schema anchor BEFORE the first client is
  built; `tests/db-path.test.ts` pins the contract (including the
  standalone-server `chdir` repair).
- **Degrade-not-fail AI (Pattern C):** `templateWorkflow(idea)` stands in;
  the SDK result must pass `sanitizeGeneratedWorkflow` (name ≤ 120,
  description ≤ 500, fixed category vocabulary) before persisting.
- **Session-gated pages (Pattern D):** `const userId = await sessionUserId();
  if (!userId) redirect("/login?from_url=/dashboard")` — anonymous visitors
  never see the workspace shell.

Chrome components (`src/components/site/`): `navbar.tsx` (fixed nav, glass
pill at md+, the measured mobile burger dropdown — the highest-regression
chrome, pinned by `tests/e2e/mobile-navigation.spec.ts`; **section-aware**
like the reference: scroll-spy pills + light-mode swap over
`[data-nav-theme="light"]` sections, always `bg-transparent` — pinned by
`tests/e2e/navbar-behavior.spec.ts`), `footer.tsx` (working newsletter
form), `logo.tsx` (exact SVG wordmark + animated petals, `currentColor`
fill so the light-mode swap is a class change), `reveal.tsx`
(IntersectionObserver entrances), `legal-page-view.tsx` (shared template:
optional caption, per-section lists), `faq-view.tsx` (the reference's Radix
accordion pattern: measured keyframes + unmounted closed panels).

Landing sections (`src/components/sections/`): hero (video + shimmer badge +
gradient H1 + the scroll indicator), dashboard-preview (browser-chrome
skeleton — STATIC like the reference, solid purple dots, no shimmer/grow
animations), logo-cloud (8 measured wordmarks incl. serif fonts + Gasparyan
svg), problem, features (three-tab card — per-tab content measured from the
live DOM in Session 2), how-it-works, pricing (Monthly/Annual toggle —
defaults to ANNUAL like the reference; Pro $49/mo monthly, $39/mo annual),
testimonials, cta.

## §6. Domain Modules (the "hooks" of this codebase)

`src/lib/` — pure, co-located `*.test.ts`, no framework imports:

| Module | Responsibility | Pinned by |
|---|---|---|
| `auth.ts` | scrypt hash/verify (64-byte key, per-user salt), HMAC tokens `userId.expiry.signature`, cookie lifecycle | `auth.test.ts` |
| `rate-limit.ts` | pure fixed-window limiter — auth 10/IP/15min, newsletter 5/IP/10min → `429 RATE_LIMITED` | `rate-limit.test.ts` |
| `validation.ts` | trim, length caps, enum membership, email shape | `validation.test.ts` |
| `pricing.ts` | plans, periods, the 20% annual discount, captions (Custom has no /month suffix) | `pricing.test.ts` |
| `workflow.ts` | status/category vocabularies, template + sanitizer | `workflow.test.ts` |
| `legal-content.ts` / `faq-content.ts` | verbatim reference copy; accessibility page carries two lists + `disclaimer: null` (the only page without the caption) | `content.test.ts` |
| `db-path.ts` / `db.ts` | URL resolution seam + Prisma singleton (memoized on `globalThis` in dev) | `tests/db-path.test.ts` |

## §7. Content as Code

All reference copy is compiled into the bundle — no runtime fetches:
`src/lib/legal-content.ts` (4 legal pages), `src/lib/faq-content.ts` (6 Q&A).
The legal view renders `page.disclaimer` only when non-null and per-section
`list` blocks with the reference's exact classes (`list-disc list-inside mt-4
space-y-2` / `list-none mt-4 space-y-1`). Content changes go RED-first in
`content.test.ts`, then the content module — never the reverse.

## §8. Accessibility Implementation

- The clone carries aria attributes the reference lacks (burger
  `aria-expanded`/`aria-controls`/`aria-label`; tab buttons `aria-pressed`) —
  superset-friendly, invisible to parity.
- `prefers-reduced-motion` collapses every animation and transition.
- The reference itself is the visual target — WCAG contrast comes from its
  measured palette; deviations only in the documented ledger direction.
- Login page is intentionally a bare card (no nav/footer/anchors) — reference
  parity, pinned by the e2e "renders no anchors" spec.

## §9. Anti-Patterns & Common Bugs (the don't list)

1. **Never add a `tailwind.config.*`** or the `@config` bridge — v4 is
   CSS-first; tokens in `@theme` only.
2. **Never use bare HSL triplets under `@theme`** — they resolve to
   transparent. Full hex values.
3. **Never "fix" reference typos** — the footer's "NovaaAI" is faithful
   parity, pinned by the smoke suite.
4. **Never chase byte-parity on alpha colors** — v4 serializes `bg-white/10`
   through `oklab()`; rendering is identical to rgba. Assertions accept
   either spelling.
5. **Never trust an inherited `DATABASE_URL`** — pin or unset per command.
6. **Never call `npm audit fix --force`** — it downgrades the Next 16 eslint
   toolchain (see §2).
7. **Never bypass `requireSession()`** in a protected handler; never return
   bare JSON outside the envelope.
8. **Never persist unsanitized LLM output** — the sanitizer clamps before any
   DB write.
9. **Never sign in per e2e test** — the per-IP rate limiter will trip
   mid-suite (10/15min). Specs share sessions sparingly.
10. **Never skip `npm run typecheck`** because the build passed — the build
    sets `ignoreBuildErrors`.

## §10. Debugging Guide

| Symptom | Root cause | Procedure |
|---|---|---|
| `P1003` missing tables / empty lists | DB not pushed, or the env trap opened a foreign file | `env -u DATABASE_URL npm run db:push`; verify with a guarded prisma count |
| `Error code 14: unable to open database file` | Inherited absolute `DATABASE_URL` | Same fix; scripts pin their own value |
| Login returns 429 mid-suite | Rate limiter engaged | Wait for the window (`Retry-After`) or restart the server process |
| E2e "login page renders no anchors" fails | Someone re-added a link to the auth card | The reference `/login` is a dead-end card — remove the link |
| Full-page screenshot shows blank sections | IntersectionObserver reveals didn't fire below the fold | Scroll through the page first (the capture scripts do a scroll pass), then screenshot |
| Computed style differs on `bg-white/10` | oklab serialization (D6) | Expected — accept either spelling in assertions |
| VLM flags "missing text" in features/testimonials | Reveal-state capture artifact | Verify in DOM (diff headings/links) before changing code |

## §11. Pre-Ship Checklist

```bash
npm run lint          # eslint .            — exit 0
npm run typecheck     # tsc --noEmit         — exit 0
npm run test          # 80/80
env -u DATABASE_URL npm run build
./scripts/smoke-test.sh   # 38/38 (boots prod on :3200, own db/smoke.db)
npm run test:e2e      # 109/109 (boots prod on :3100, own db/e2e.db)
npm audit             # expect only the accepted braces advisory
git status            # no .env, *.key, db/*.db, dev.log staged
```

Then: Conventional Commits with emoji (`:art: feat:`, `:bug: fix:`,
`:memo: docs:`) on `main` only; push via
`python3 docs/ssh_git_wrapper_v3.py --key-file <key outside the repo>`.

## §12. Lessons Learnt (Sessions 1–12)

1. **The reference is a moving target** — it was a different app (ORBITAL) in
   this repo's previous cycle. Re-survey before touching chrome (ADR-009).
2. **The env trap strikes twice** — Session 1 hit it at 12/30 smoke failures;
   Session 2 hit it again mid-verification (a `node -e` check without the
   guard opened the parent workspace's empty DB and reported P2021). Every
   DB-touching command gets `env -u DATABASE_URL` or a pinned value.
3. **Full-page screenshots need a scroll pass** — both sites reveal sections
   via IntersectionObserver; capturing without scrolling yields
   un-revealed (blank) sections that VLM misreads as missing content.
   Session 2's first full-page compare scored a bogus 85 until the captures
   were made comparable.
4. **Live DOM beats VLM impressions** — the VLM claimed the scroll indicator
   was "missing on the clone"; DOM queries showed both sites have it (the
   VLM had the direction backwards). Always confirm VLM findings in the DOM
   before changing code.
5. **Verify what you think you know before editing** — the login page
   remediation planned to remove an `&nbsp;` spacer paragraph; a live-DOM
   check showed the reference HAS the spacer (only the back-link was extra).
   Removing it would have broken parity.
6. **`npm audit fix` can downgrade** — it "fixed" the prisma chain by moving
   6.19.3 → 6.12.0 (a year of fixes lost). Prefer explicit `overrides` +
   `npm update` to the declared latest.
7. **TDD across layers** — Session 2's fixes each went RED first: unit pins
   (content), then e2e pins (features cards, login bare-card, scroll-dot
   class), then the code. Every RED was observed failing before its GREEN.
8. **Read the token block that RENDERS, not the one that exists** — the
   reference's stylesheet ships `:root` AND `.dark` token blocks; the app
   never mounts `.dark`. Session 1 measured the `.dark` block and shipped a
   wrong primary/accent for two sessions (Session 3's F1/F2). Always verify
   tokens against RENDERED computed styles, not just the stylesheet text.
9. **The reference's typography is single-face** — "Vend Sans" (the Display
   cut) renders EVERY element on the live; "Vend Sans Text" is declared but
   never resolved by any element. A `--font-body` pointing at the Text cut
   produces measurable metric drift (Book a Demo pill 197px vs 190px).
10. **VLM "different colors" findings can be wrong even when the direction
    feels right** — Session 3's mockup compare scored 85 with "duller bars"
    flags; the DOM probe showed exact rgb matches on every surface. Settle
    color disputes with computed-style probes (oklab converts to rgb:
    `oklab(0.550071 0.118375 -0.255039)` = `rgb(134, 36, 255)`).
11. **`find text` can click the wrong element** — `find text "Sign in"`
    matched the "Sign in to continue" subtitle (never the button) and
    silently no-opped the scripted login; role-based clicks
    (`find role button click --name "Sign in"`) are the reliable form.
12. **Survey interactive chrome in its INTERACTIVE states, not just at
    rest** (Session 4) — the navbar's scrolled-glass bar survived three
    sessions of audits because full-page screenshots only ever draw the
    nav at scrollY 0 over the dark hero. Scroll the page and re-probe
    computed styles at multiple depths before calling chrome done; the
    reference's nav turned out to be section-aware (scroll-spy + a
    light-mode swap over the white features section) with NO scrolled
    background at all.
13. **Read the state that's ACTIVE, not the one that's visible** (Session
    4) — the pricing toggle defaults to ANNUAL on the live; Session 1 read
    "$39" off the page without checking which pill was active and shipped
    the wrong monthly price for three sessions. When a control has state,
    drive it through every state and record which one is the default.
14. **Unlayered custom CSS beats layered utilities** (Session 4) — the
    unlayered `.skeleton-wave` background silently overrode the layered
    `bg-primary/80` utility on the mockup dots, rendering them as faint
    white waves instead of solid purple. When a class's computed style
    contradicts its utility list, check the layer cascade.
15. **Arbitrary aspect ratios use the SLASH form** (Session 4) — the colon
    spelling of the ratio emits the invalid `aspect-ratio: 16:9` and
    postcss fails the whole build with an opaque `Missed semicolon` at a
    flattened column. Two aggravators: turbopack CACHES the broken CSS
    transform (`rm -rf .next` when a CSS error outlives its fix), and
    Tailwind's scanner reads class candidates from MARKDOWN — documenting
    the colon spelling in a .md breaks the build exactly like using it in
    a component (docs/ is `@source not`-ed in globals.css).
16. **v4 `space-y-*` margins vanish on inline children** (Session 4) — v4
    puts the gap on the PRECEDING sibling (`:not(:last-child)`
    margin-bottom), and vertical margins don't apply to inline boxes: the
    login form's inline labels lost ~4px of gap per field. The reference's
    compiled v3-style (margin-top on the following sibling) renders
    correctly — restored via a scoped rule in the login route style.
    Session 5 corollary: a negative margin on the preceding child
    CANCELS the gap entirely (the login alternate-states' back button
    carries the reference's `-mb-2` — under v4 the back→h2 gap rendered
    −8px vs the live's +8px, a 16px card delta the VLM caught).
17. **Never trust a font's NAME — trace its bytes** (Session 5) — the
    reference's computed `font-family` read `"Vend Sans"` but the RENDERED
    face was Google Fonts' Vend Sans variable font (gstatic), NOT the
    "Base44-hosted Wix Madefor" Session 1 identified from @font-face
    declarations in an unused bundle. Four sessions of sub-pixel drift
    (pill widths, the D19 card delta, the testimonials strip) were the
    wrong file's metrics (+2.4% glyph width at 14px). The authoritative
    probes: `performance.getEntriesByType('resource')` for the woff2 URLs,
    `document.fonts` for the weight census, fontTools name tables for the
    file identity. (`document.fonts.check()` is UNRELIABLE — it returns
    true for unknown families.)
18. **The reference ships INERT classes** (Session 5) — its markup carries
    utilities its compiled css never emits: the pricing Pro card's
    `scale-[1.02] md:scale-105` renders UNSCALED (`scale: none`, 540px at
    every width). Match the RENDERED computed style, not the class string
    — v4 here WOULD emit those utilities (540 × 1.05 = the exact 567px we
    used to render and had documented as the accepted D19 deviation).
19. **Eval-based `input.value=` writes do NOT sync React state** (Session
    5) — an eval-driven fill can submit EMPTY forms while looking
    successful (the live login probe reported "Invalid email or password"
    for credentials that work — the form had actually submitted empty).
    Always drive forms with the browser tool's native `fill` (Playwright's
    value-tracker-aware path) when the page is a React app.
20. **Diff the CLASS-STRING layer, not just computed styles** (Session 6)
    — a full-DOM skeleton diff (tag + class + key attrs, both sides)
    surfaced four RENDERED divergences five sessions of computed-style
    spot probes had missed: the testimonial avatars (all rendered the
    first person's gradient — the class was present, just identical on
    every card), the Enterprise "Custom" price (the numeric-price markup
    reused at the wrong size), the edge fades (direction-swapped classes
    that still painted *a* gradient), and the AI-suggestion color (a
    `/50` opacity variant). Computed-style probes only answer the
    questions you thought to ask; the skeleton diff asks them all.
21. **agent-browser's `mouse move` can report FALSE hover failures**
    (Session 6) — the probe showed `:hover` matching on the element while
    no hover utility applied; Playwright's real `page.mouse.move` + a
    computed-style re-probe showed the Get Started pill's shimmer working
    perfectly. Hover-state parity claims need REAL pointer events. Also:
    v3 compiles `group-hover:translate-x-0.5` to `transform:
    matrix(1,0,0,1,2,0)` while v4 emits `translate: 2px` — the same 2px
    render through different PROPERTIES; compare geometry, not property
    names.
22. **Survey the TYPOGRAPHY layer — the reference's CONFIG overrides
    scale values** (Session 7) — a systematic computed-letter-spacing +
    first-resolved-font-family diff of every text element found what six
    sessions of computed-style spot probes had missed: the live's SPA
    bundle DOUBLES the two widest tracking steps (`tracking-wider` 0.1em,
    `tracking-widest` 0.2em — every eyebrow rendered at half the live's
    tracking here), while its LOGIN bundle keeps the standard scale (the
    "or" divider computes 0.6px there vs 1.2px on the landing badge).
    v4's `--tracking-*` `@theme` variables are the override point
    (utilities emit `letter-spacing: var(--tracking-*)`), and
    route-scoped pins handle the two-bundle divergence. The same survey
    surfaced the live's INLINE font-family wordmarks — the third face
    (DM Serif Display) had never rendered here because a CLASS
    (`font-serif`, Playfair-first) stood in for the live's inline style.
    Classes and computed styles answer different questions; ask both.
23. **Breakpoint-mounted chrome needs a RESIZE guard** (Session 7) — the
    mobile menu (mounted below md, CSS-hidden above it) kept its `open`
    state AND its body scroll-lock alive when the viewport crossed 768px:
    the desktop page froze (overflow:hidden) until Escape. The
    `matchMedia("(min-width: 768px)")` close-on-match listener is the
    standard guard (the resize-while-open failure class in the
    mobile-navigation testing taxonomy). Related: the body scroll-lock
    itself is a documented SUPERSET — the live locks nothing when its
    menu is open (verified via JS-click).
24. **Survey the MOTION layer — the ENGINE, not just the timings** (Session
    8): the first systematic computed-`transition-*`/`animation-*` diff
    found the clone's entire entrance system broken — a CSS-transition
    approximation of the live's framer-motion rAF engine SNAPS on children
    whose own `transition-colors` wins the property-list cascade, and its
    `duration-700`/`ease-out`/stagger classes permanently corrupt every
    card's hover timing. The live's engine: per-frame inline
    `opacity`/`transform` writes (MutationObserver-visible), easing
    `cubic-bezier(0, 0, 0.58, 1)` (fit from sampled frames), per-element
    y/duration/stagger (extractable from the SPA bundle's
    `initial/whileInView/transition` configs), settled inline exactly
    `opacity: 1; transform: none;`. Class strings cannot see ANY of this —
    both sides carried byte-identical classes while rendering different
    motion. Also: an element's "color" can LIE about its rendering — the
    live's navbar logo swaps a React-driven PATH FILL attribute
    (white→black) while its anchor's color stays white; pixel sampling +
    the path's computed fill were needed to see the truth a computed
    `.color` read hid.
25. **v4's engine shifts come in FAMILIES** (Sessions 7–8): the tracking
    scale (config-doubled steps), the shadow-scale rename (v3 shadow-sm →
    v4 shadow-xs), the transition-colors property list (9 vs 6
    properties), and the line-height cascade inversion (v3's responsive
    `text-*` beats `leading-*` because media-query rules sort after base
    utilities; v4's `--tw-leading` var mechanism always lets leading win).
    Each hid from class-string parity for 6+ sessions. The fix points
    differ per shift — `@theme` vars where v4 consumes them
    (`--tracking-*`, `--shadow-sm`), a same-layer utility override where
    the value is hardcoded (`.transition-colors`), and per-element inline
    pins where the CASCADE order itself is the divergence
    (`--tw-leading: initial`). When one config-level shift is found, audit
    the whole utility engine for its siblings.
26. **Survey the RENDERED PALETTE, not the class strings** (Session 9):
    v4's default palette is OKLCH-DEFINED and the oklch→sRGB roundtrip
    renders up to 69 RGB units off the v3 hex the reference's compiled css
    carries (green-400 rgb(5,223,114) vs #4ade80; red-500, purple-600,
    yellow-400 — the stars, the problem reds, the avatar gradient
    endpoints, every login slate). Class strings match, word parity is
    1.0000, and even spelling-tolerant color specs stay green while the
    pixels drift. The survey that finds it: convert every used
    default-palette computed value to sRGB and compare against the live's
    measured rgb. The fix: `@theme --color-<family>-<shade>: <v3 hex>`
    (31 tokens). Corollary: computed lab()/oklab() SPELLINGS with equal
    values are D6-class noise (slate-200) — compare values, not strings.
27. **A utility that references a missing @theme token never emits — pin
    the RENDERED effect, not the variable** (Session 9): v4's `ring-ring`
    reads `--color-ring`, so a shadcn-style legacy `--ring` HSL variable
    (even correctly defined and asserted by a spec!) leaves the utility
    un-emitted and the ring falls back to currentColor — the Sign in's
    keyboard ring rendered WHITE for a session while the spec passed on
    the class string + the variable value. The Session-4 logo lesson,
    generalized: specs must pin what RENDERS (the boxShadow string), not
    the mechanism's inputs. Same family: v4 emits `ring-ring` AFTER
    `ring-slate-400` in the compiled sheet — when an element carries both
    (the login inputs), the v3-era outcome needs a specificity nudge
    (`input:focus:focus-visible { --tw-ring-color: var(--color-slate-400) }`)
28. **Survey the LOOP layer — a "static" verdict from animation-property
    reads is worthless against a JS animation engine** (Session 10): the
    live's mockup was declared "completely STATIC" in Session 4 (a
    CSS-property census read `animationName: none` on everything) — while
    framer-motion pulsed EIGHT loop groups underneath (the ambient glow,
    the red chrome dot, the staggered list dots, the under-glow, and the
    mini-dashboard's skeleton shapes). framer writes inline
    transform/opacity PER FRAME; the `animation`/`transition` computed
    properties stay `none` the whole time. The survey that finds it:
    (a) sample every element's computed transform/opacity across multiple
    rounds AFTER all entrances settle — still-changing = looping; (b)
    extract the `animate:{…}`/`transition:{…}` configs from the live's JS
    bundle (rg over the fetched bundle — the configs sit right next to the
    class strings). The fix: measured `@theme --animate-*` keyframe tokens
    (the D10 animate-scroll-dot pattern); loops pause under
    prefers-reduced-motion via the global collapse (the D47 superset).
29. **framer's inline transform REPLACES tailwind v3's translate
    composition — match the rendered geometry, and remember v4's
    `translate` property is separate** (Session 10): the live's under-glow
    carries `-translate-x-1/2` but renders UNCENTERED (left edge at the
    parent's center, bleeding past the card's right edge) because
    framer's per-frame `transform: translateY(…)` overwrites v3's
    `--tw-translate-x` composition. In v4, `-translate-x-1/2` emits the
    SEPARATE `translate: -50%` property — which does NOT conflict with a
    transform — so reproducing the live's rendering needs an explicit
    `translate-none` pin. Pixel adjudication (brightness below the card
    edge vs background) settles clipping questions the DOM cannot: both
    the rect and the computed styles survive ancestor `overflow: hidden`,
    only the rendered pixels tell the truth.
30. **Survey the CONSOLE layer — a clean render can still ship a broken
    hydration** (Session 11): the 404 page looked perfect in every
    screenshot, passed word parity, and quoted the right path — while
    tripping React #418 on EVERY load (the statically-prerendered client
    component rendered `usePathname()` while the prerendered HTML shipped
    the internal route id `"_not-found"`; React discarded the server tree
    and re-rendered client-side). A `pageerror` listener per route is a
    five-line survey that catches the whole class. The companion trap:
    `usePathname()` settles to the INTERNAL route id (`/_not-found`) once
    the App Router settles — the real URL exists only during the
    hydration render — so a 404 that quotes its URL must read
    `window.location.pathname` behind a `useSyncExternalStore` mount gate
    (server snapshot false: server and hydration renders agree, the URL
    fills one post-hydration commit and stays).
31. **Alpha composites through ANCESTOR opacity — audit the EFFECTIVE
    alpha, not the utility class; and separate engine shifts from design
    choices with a CONTROL before pinning** (Session 11): the dashboard's
    paused/draft articles carry `opacity-80`, so a `text-white/50`
    description rendered at effective white/40 (3.61:1) — the axe report
    was right and every class-string read was wrong. The glyph-interior
    pixel sample (4× device scale; the uniform ink color IS the rendered
    truth) localized it, and the controlled experiment — rgba vs oklab
    vs `color-mix(in oklab, … , transparent)` over the same background,
    all rendering the identical #818181 — proved the v4 color engine was
    INNOCENT before anything got pinned. The same discipline applies to
    flaky assertions: a transitioning property sampled at a fixed offset
    (the ring pin's 200ms) reads mid-flight values (`3.98466px`, alpha
    .996) AND the settled value serializes two ways (`rgb(9,9,11)` /
    `rgba(9,9,11,1)`) — poll to settled and match both spellings; and a
    blind Tab×N walk lands on different elements when hydration shifts
    the tab order — tab-until-focused, then read.
32. **Survey the FAULT layer — abort the network mid-action and watch the
    console AND the UI** (Session 12): every happy-path test passed for
    eleven sessions while the dashboard's pause/delete/sign-out handlers
    carried NO catch — a route-aborted fetch surfaced `pageerror:
    TypeError: Failed to fetch` with zero user feedback (and Sign out's
    navigation never ran — the user was stranded). `page.route(...abort())`
    around each mutation is a five-line probe that exposes the whole
    class; the fix contract is the composer's own pattern (catch → a
    visible `role="alert"` surface → zero pageerrors), and the failed
    Sign out STAYS on the page (the session cookie is still live —
    navigating away would lie to the user).
33. **React Float's automatic preloads TRAVEL — audit `<link
    rel="preload">` on EVERY route, not just the page that owns the
    resource; and before believing a mid-verification regression, verify
    the server serves the CURRENT build** (Session 12): React 19
    auto-preloads eager `<img>`s rendered in the SSR shell, and the
    Next.js router's RSC prefetch INJECTS those head links into every
    route that links to the page (the navbar's logo Link) — the
    Gasparyan logo's preload became a console warning + a wasted fetch on
    six routes that never render it (`loading="lazy"` suppresses the
    emission; the visible layer is unchanged for a below-fold 4KB local
    SVG). The companion discipline: a sudden word-parity collapse
    (links CONCATENATED in innerText, everything `display: inline` or
    `block` with no utilities applied) is the signature of a ZOMBIE
    server serving a stale build whose CSS chunks the new builds deleted
    — compare the served HTML's CSS chunk filename against
    `.next/standalone/.next/static/chunks/` on disk before touching any
    code; the Playwright/smoke suites are immune (they boot their own
    servers).

## §13. Pitfalls to Avoid

- Assuming `.env` wins over the shell environment (it doesn't — exported
  vars override dotenv in Node and Prisma alike).
- Comparing animated states across captures (charts, bars, video frames) —
  sample final states or wait out the entrance animations.
- Touching `skills/` from the build — every config excludes it (tsconfig
  `exclude`, eslint `ignores`, vitest `include`, Next `src/` scoping). It's
  operator documentation, never compiled code.
- Deep-linking assumptions into the features tabs — tab state is local;
  deep-linkable tabs would need `?tab=` handling (a documented non-goal).

## §14. Best Practices

- Write the failing pin first (unit for pure seams, e2e for chrome, smoke for
  HTTP contracts) — then the smallest change that turns it green.
- Re-run the paired survey (live vs clone) after any chrome change; record
  VLM scores in the worklog.
- Keep capture scripts outside the repo (`/home/z/my-project/scripts/`) —
  they're session artifacts, not product code.
- One logical change per commit; the message explains why.

## §15. Coding Patterns (with examples)

```tsx
// Envelope-consuming client (never throws into render):
const payload = await res.json().catch(() => null);
if (res.ok && payload?.ok) { /* use payload.data */ }
else { setError(payload?.error?.message ?? "Something went wrong."); }

// Session gate (server page):
const userId = await sessionUserId();
if (!userId) redirect("/login?from_url=/dashboard");

// Per-tab measured content (features card):
{active === "analytics" && (
  <div className="flex items-end gap-1 h-32">
    {ANALYTICS_BARS.map((bar) => (
      <div key={bar.i} className="flex-1 rounded-t-sm"
           style={{ background: `linear-gradient(to top, ${bar.bottom}, ${bar.top})`, height: bar.height }} />
    ))}
  </div>
)}

// Optional legal list with the reference's exact classes:
{section.list && (
  <ul className={section.list.style === "disc"
    ? "list-disc list-inside mt-4 space-y-2" : "list-none mt-4 space-y-1"}>
    {section.list.items.map((item, j) => <li key={j}>{item}</li>)}
  </ul>
)}
```

## §16. Coding Anti-Patterns

- Returning bare `NextResponse.json(...)` from a handler (breaks the
  envelope contract the smoke suite asserts).
- Importing Prisma or React inside `src/lib/*.ts` pure modules.
- Fetching from components — views mutate through the API envelope; server
  pages load initial state.
- Hand-rolling a second color token outside `@theme`.
- Storing the operator SSH key anywhere inside the repo — keys arrive
  out-of-band per the wrapper runbook and are shredded after use.

## §17. Responsive Breakpoint Reference

| Width | Behavior |
|---|---|
| < 768 (`default`) | Burger dropdown (`md:hidden bg-black/95 backdrop-blur-xl border-b border-white/5`, `px-6 py-4 flex flex-col gap-2`, 44px rows: 5 anchors + Log In button + Get Started pill) |
| ≥ 768 (`md`) | Center glass pill (`bg-white/10 backdrop-blur-md`), LOG IN + white Get Started pill; burger hidden |
| ≥ 1024 (`lg`) | Full section layouts (grid splits, larger type scales) |

The mobile menu's geometry is pinned by `tests/e2e/mobile-navigation.spec.ts`
(rows 342×44, exact hrefs and order, close-on-navigate, Escape, the 768
pill). Treat failures there as parity regressions.

## §18. Z-Index Layer Map

| Layer | z | Owner |
|---|---|---|
| Page content | auto | sections |
| Fixed nav | `z-50` | `navbar.tsx` |
| Nav dropdown panel | (in flow under nav) | mobile menu |
| Dev overlay | — | disabled (`devIndicators: false`) for parity screenshots |

## §19. Color Reference (complete `@theme` set)

```
primary #8624ff · primary-foreground #ffffff · accent #0055ff ·
accent-foreground #ffffff · violet #d500ff · electric-blue #0055ff ·
background #000000 · foreground #ffffff · card #0f0f0f ·
card-foreground #ffffff · muted #161616 · muted-foreground #a1a1aa ·
border #242424 · input #242424 · destructive #ef4444
```

(Session 3: primary/accent/electric-blue were re-measured from the live's
compiled CSS `:root` block — Session 1 had read the unmounted `.dark` block.
The reference's own CSS declares BOTH blocks; `:root` is what renders.)

Login/404 pages run the reference's light slate theme (slate-50…900) instead
of the dark tokens — intentional reference parity.

## §20. TypeScript Interface Reference

```ts
interface LegalSection {
  h2: string | null;
  paras: string[];
  list?: { style: "disc" | "none"; items: string[] };
}
interface LegalPage {
  title: string;
  disclaimer: string | null;   // null on ACCESSIBILITY only
  sections: LegalSection[];
}
type WorkflowStatus = "active" | "paused" | "draft";
type WorkflowCategory = "Marketing" | "Sales" | "Engineering" | "Ops" | "Finance" | "Support";
type BillingPeriod = "monthly" | "annual";
// Envelope (src/lib/api.ts):
//   ok<T>(data: T, status?) → { ok: true, data }
//   fail(code, message, status) → { ok: false, error: { code, message } }
//   requireSession() → { user } | { response: 401 envelope }
```

## §21. Appendices

- **Audit history:** Session 2's full findings/fixes ledger —
  `docs/remediation-plan-session2.md` (F1–F10, R1–R11); Session 3 —
  `docs/remediation-plan-session3.md` (F1–F11, R1–R10); Session 4 —
  `docs/remediation-plan-session4.md` (F1–F6, R1–R8); Session 5 —
  `docs/remediation-plan-session5.md` (F1–F5, R1–R4); Sessions 6–9 —
  `docs/remediation-plan-session{6,7,8,9}.md` (the class-string/head,
  typography, motion, and rendered-palette surveys).
- **Push runbook:** `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` (the
  paramiko ssh shim lives at `docs/ssh.py` for sandboxes without OpenSSH).
- **Tailwind v4 traps:** `docs/Tailwind-V4-Validation-Report.md` + PAD §5.5.
- **Deployment:** `docs/DEPLOYMENT.md`.
- **Evidence base:** Session 2/3/4 parity artifacts under
  `/home/z/my-project/session{2,3,4}-ref/` (outside the repo).
- **Quick reference:** demo login `demo@novaai.app` / `Demo1234!`; ports —
  dev 3000, smoke 3200, e2e 3100; the gate order is §11.
