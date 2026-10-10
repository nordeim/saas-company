# SAAS Company — Engineering Skill Document

> **Version:** 2.31.0 · **Last updated:** 2026-10-10 (Session 32 remediation)
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

## §12. Lessons Learnt (Sessions 1–29)

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
34. **Survey the SESSION-LIFECYCLE layer — expire the cookie mid-session
    and watch every mutation** (Session 13): a cookie-expired 401 is a
    different failure CLASS than a network abort (an abort means "retry
    might work"; a 401 means "the session is GONE") — but the dashboard
    treated them identically, and the "Try again." banner LIED (every
    retry 401s forever; the user stranded on /dashboard). The honest
    contract is the server gate's own: redirect to
    `/login?from_url=/dashboard` — enforced client-side by the `apiFetch`
    wrapper (the 401 sentinel is caught by the existing catch blocks, so
    no unhandled rejection). Pin the two failure classes PAIRWISE: the
    cookie-deletion probe (ctx.clearCookies → mutation → URL assertion)
    and the abort probe (banner + stays) — one without the other lets the
    classes silently re-merge.
35. **An app without error boundaries is one malformed envelope away from
    losing its brand at the worst moment — pin the boundary with a
    route-fulfilled contract violation, not a synthetic throw** (Session
    13): the repo shipped no `error.tsx`/`global-error.tsx`, so ANY
    client render error surfaced Next.js's default unbranded page
    ("This page couldn't load") — reachable through a realistic path
    (refresh() guarded `payload?.ok` but not the SHAPE of `payload.data`;
    a `{ok:true,data:[{runs:null}]}` row passes `Array.isArray` and
    crashes `w.runs.toLocaleString()` in the article template). Fix BOTH
    layers: the branded boundary (dark card, role="alert", Try again via
    `reset()` — restores the segment with the server-provided state —
    plus Go-to-home) AND the shape-guard where the data enters
    (`Array.isArray(payload.data)`). The e2e pin routes the LIST endpoint
    to fulfill the violating row — the same fault-injection discipline
    as lesson 32, one layer up the stack. Related: Escape-closing the
    mobile menu must RETURN FOCUS to the burger (`burgerRef`) — the
    focused link unmounts with the panel and activeElement falls to
    `body`, stranding keyboard users (WCAG 2.4.3).
36. **Audit REACHABILITY, not just behavior — a shipped API with zero UI
    consumers is dead code dressed as a feature** (Session 14):
    `POST /api/demo` shipped complete (validation, rate limit, the
    DemoRequest model) but NOTHING called it — the hero's "Book a Demo"
    pill anchored to `#pricing` (correct live-parity) and the feature
    was unreachable from every surface. The fix is the missing FRONT
    half: a first-class route (`/demo`) over the content-page pattern
    (server page + client view, Navbar/Footer, Reveal), the form
    mirroring the API's OWN validation rules, the composer's catch
    contract, and a sitemap entry. Verify the live actually 404s the
    route before calling it pure superset (the live's SPA serves its
    404 shell for unknown paths — same bytes as a known-404 route). And
    beware the collateral: any script that signs in and then revisits
    `/login` hits the new authenticated-redirect (the screenshot
    refresh script's re-sign-in blocks had to navigate to `/dashboard`
    directly).
37. **Success is a message class too — errors alert, successes confirm
    politely; and computed sub-millisecond durations serialize in
    scientific notation** (Session 14): the dashboard's failure paths
    had `role="alert"` banners but ZERO aria-live regions — a
    screen-reader user's pause/resume/delete/compose changed the stats
    in total silence (WCAG 4.1.3 Status Messages). The fix: a sr-only
    `role="status"` `aria-live="polite"` region announcing every
    successful mutation ("Paused {name}.", "Workflow created.",
    "Deleted {name}.") — the success-class mirror of the error-banner
    contract. Related serialization trap: the reduced-motion clamp
    (`animation-duration: 0.01ms`) reads back as `"1e-05s"` in Chrome's
    computed style — compare PARSED milliseconds, never the authored
    string; and the browser's own 404-document resource log is inherent
    noise on BOTH sides (the live's 404 console ships two 401s — parity
    adjudication, not an app bug).
38. **Guard WHERE a user-controlled redirect can ship the browser —
    and pin the docs-truth layer** (Session 15): any query param that
    becomes a post-auth `router.push` target is an OPEN REDIRECT
    (CWE-601) until proven otherwise — `/login?from_url=https://…`
    genuinely shipped the just-authenticated browser off-site (the
    pre-fix probe's network log carried the external `?_rsc=…`
    request). The guard (`safeRedirectPath`): prefix checks (`//`,
    `/\`, non-`/`) + a WHATWG dummy-origin re-parse; only same-site
    absolute paths survive, everything else falls back to a known-safe
    internal page. Pin the honest use case TOO (`from_url=/faq`
    round-trips) or the guard silently breaks the feature it protects.
    Same session: README promised `Retry-After` on 429s that no route
    emitted — survey the DOCS layer for claims the code doesn't keep,
    and pin them where the docs make them (the smoke layer for HTTP
    headers).
39. **A hang is not a failure — and a JS-only rebuild blinds the
    chunk-against-disk zombie check** (Session 15): ADR-004's
    degrade-not-fail covers SDK FAILURES, not hangs — a black-holed
    `await` blocks the request forever with the UI's busy guard
    engaged and no error ever arrives to trigger the catch. Every
    external await needs a timeout that RESOLVES with the fallback
    (the deterministic template), while genuine rejections still
    PROPAGATE — two different contracts, deliberately distinct.
    Related tooling traps: (a) the Bash output layer can SWALLOW
    `[m`-style character pairs from file contents — `const [mode,
    setMode]` displayed as `const ode, setMode]` and looked like a
    syntax error while tsc/esbuild/build were all green (hex-dump
    before believing a "corrupt" file); (b) the zombie-server
    chunk-against-disk discipline is BLIND when only JS changed (the
    CSS chunk name is content-hashed and unchanged — the old process
    served FRESH static HTML from disk while hydrating it with its own
    STALE in-memory JS, and its exhausted in-memory rate buckets
    turned every probe into a lie) — when ps//proc are process-blind,
    move the survey to a FRESH PORT with a fresh boot instead of
    trusting a reboot.
40. **Rate-limit the EXPENSIVE endpoint, not just the sensitive ones —
    and key authenticated buckets per USER** (Session 16): auth,
    newsletter, and demo were all limited while `/api/workflows/generate`
    — the only endpoint that costs real money per call — was unlimited
    (the probe drove 15/15 rapid authenticated POSTs all 200 in 8.1s).
    The audit question that finds this class: "which endpoint is most
    expensive per call, and is IT limited?" The fix keys the bucket
    per-USER (`gen:${userId}`) — an IP-keyed bucket on an authenticated
    route makes a shared-egress office share one abuser's budget. And
    the CLIENT contract stayed untouched BY DESIGN: compose()'s
    `genRes.ok` degrade means a 429 still creates the template workflow
    — the feature never hard-fails, the limiter only caps the LLM spend
    (pin the degrade with a route-fulfilled 429 so it can't silently
    break). Related: Next.js protects its dynamic PAGES with no-store
    but NOT route-handler JSON — emit `Cache-Control: private,
    no-store` at the single ok()/fail() seam (RFC 9111 permits
    heuristic storage of unmarked 200s), and drop the X-Powered-By
    banner (`poweredByHeader: false` — the live ships none).
41. **Probe authenticated APIs through the PAGE, not `page.request` —
    and re-seed the dev DB when a survey depends on the canonical
    workspace** (Session 16): Playwright's APIRequestContext REFUSES to
    send `Secure` cookies over plain http, while Chromium page
    navigations treat `http://127.0.0.1` as a trustworthy origin and DO
    send them — the production session cookie (`secure: true`) quietly
    never reaches `page.request` calls, and every authenticated probe
    401s as if the session were broken (the v1 survey's 15/15 "401s"
    were a tool artifact, not a defect). Authenticated API probing must
    go through IN-PAGE fetches after a navigation (the realistic
    browser path). Two same-class traps: after an API register,
    navigate DIRECTLY to the target (a /login visit hits the S14
    authenticated gate and redirects); and the DEV `db/custom.db`
    DRIFTS across sessions of probe traffic (S12–S15's pauses
    accumulated until every seeded workflow was paused and the
    resilience screenshot's Pause-button locator found nothing) —
    `npm run db:push && npm run db:seed` restores the canonical
    workspace (the e2e/smoke suites are immune: they boot fresh DBs).

42. **An identical envelope can still leak through LATENCY — survey the
    timing side of every auth response** (Session 17): the login 401 was
    byte-identical for unknown-email and wrong-password, but the unknown
    path SKIPPED scrypt entirely (~3.5ms vs ~34ms — a 9.8x median delta).
    That is a complete registered-address census at 1,440
    candidates/day/IP even under the 10/15min rate limit (rotating IPs
    are unlimited). The audit question: "do the FAILURE paths of this
    endpoint cost the same?" The fix pattern — a module-init dummy hash
    (`dummyPasswordHash()`: random salt + scrypt of random bytes, the
    SAME cost as a real stored hash, a stable per-process constant)
    burned unconditionally: `storedHash = user?.passwordHash ??
    dummyPasswordHash()` → verifyPassword always runs → the timing floor
    flattens to 1.0x while the response NEVER changes. Pin it with a
    timing assertion that has structural margins (7+7 curl-sampled
    MEDIANS, ratio < 2.5x — both paths scrypt-dominated post-fix, so a
    false failure needs an implausible sustained asymmetry).

43. **Probing a race needs TRUE wire-level concurrency — and a crashed
    script orphans its servers** (Session 17): undici's fetch pool
    serializes every request on ONE socket — a Promise.all of 10 fetches
    to the same origin is effectively SEQUENTIAL at the server, and a
    TOCTOU window (findUnique→create) never interleaves (the first
    probe round returned {"201":1,"409":9} and looked clean). To race
    for real: independent sockets — parallel curl processes, or
    node:http with `agent: new http.Agent({ keepAlive: false })` per
    request — which produced {"201":1,"409":8,"500":1} on the first
    try: the loser's unhandled P2002 was a BARE 500 with an EMPTY body
    and no content-type (the envelope contract's worst violation — the
    client's `payload?.error?.message` contract dead-ends into null).
    The fix: classify the Prisma error by CLASS AND CODE
    (`isUniqueConstraintError`: instanceof
    PrismaClientKnownRequestError + code === "P2002" — a duck-typed
    plain `{code:"P2002"}` object from JSON.parse must NOT trip it) and
    convert it to the exact sequential-duplicate envelope; every other
    error rethrows. And the zombie-server family's new member: a bash
    SYNTAX ERROR mid-script aborts AFTER the server-boot lines execute
    but BEFORE the kill runs (bash parses incrementally) — the orphan
    later answers a fresh boot's health check on the same port (the
    EADDRINUSE from the new boot is silently swallowed into the log;
    the checks ran against the STALE OLD-BUILD process — the S17
    closed-gate pins read "409 EMAIL_TAKEN" where 403 was expected
    until the auxiliary server moved to its own port). Boot-and-kill
    blocks go at a block's END or in a trap, and every auxiliary server
    gets its OWN PORT.
44. **The Next.js 16 production runtime swallows your logs — a boot
    diagnostic must write to fd 2 DIRECTLY** (Session 18): three output
    channels failed silently before the fourth worked. A module-init
    `console.error` in a route module EXECUTED (the login route kept
    answering) and never reached the log — the production server
    captures console methods into its internal pipeline. The
    instrumentation hook's `process.stderr.write` RAN (proved by a
    side-effect `appendFileSync` marker) and never reached the log —
    the stream object itself is wrapped. And the `await
    import("node:fs")` inside `register()` compiled to the TURBOPACK
    CHUNK LOADER promise, which RACED at boot — hung on one boot
    (silent no-write), resolved on the next — so even a correct
    writeSync after it is non-deterministic. What works: the STATIC
    `import { writeSync } from "node:fs"` at module top (the bundler
    resolves the builtin synchronously — no loader, no race) +
    `writeSync(2, message)` — the raw file descriptor, below every
    object the runtime can replace (verified: 206 bytes, the warning in
    the standalone boot log). Boot-time diagnostics live in
    `src/instrumentation.ts`, never in route modules.
45. **`next build` COPIES `.env` INTO `.next/standalone/` — and your
    env-probe may be testing the wrong thing** (Session 18): a full
    forensic loop (module-init warning → hook warning → direct-write
    warning, each "still silent!") ended at the discovery that the
    AUTH_SECRET under test was NEVER unset — the build had copied the
    repo's `.env` (with its dev secret) into the standalone directory,
    and the server's env loading sets it from the FILE regardless of
    the shell. Two rules fall out: (1) when probing env-dependent boot
    behavior of the standalone server, inspect `.next/standalone/.env`
    FIRST (the Docker path differs — `.dockerignore` excludes `.env`,
    so containers rely on runtime injection; a standalone-DIRECTORY
    deployment ships the build-time env — audit it before copying the
    directory anywhere); (2) `kill $PID; wait $PID` is UNRELIABLE in
    this sandbox (the :3030/:3033/:3044 zombies each outlived their
    kill) — every boot-and-probe cycle should take a FRESH PORT, and a
    parity battery that collapses to 0.0000 with CONCATENATED words
    ("FeaturesHow") is the zombie's gotcha-26 signature (old-build HTML
    hydrated against regenerated chunks), not a real regression.
46. **Catching an error REMOVES the framework's log line — a wrapper
    must restore the operator's sight itself** (Session 19): Next.js
    logs UNhandled route errors (the Prisma stack + digest land in the
    server log — verified while cataloguing the bare-500 crash paths).
    The moment `apiRoute()` catches the error to answer the
    INTERNAL_ERROR envelope, that stack VANISHES — the catch must
    re-log via the fd-2 seam (`writeSync(2, …)`, lesson 44's channel)
    or the operator is blind to exactly the failures the wrapper now
    handles (verified: 9 `[api:unhandled]` stacks in the broken-DB
    server's log). Same session, same family: **`redirect()` inside a
    try/catch is SWALLOWED** — it throws a control error
    (NEXT_REDIRECT) that a page-level catch converts into the degraded
    view, silently breaking the authenticated gate; keep redirect
    calls OUTSIDE error catches (two narrow blocks beat one wide one).
47. **Pass the base URL EXPLICITLY to every probe script — a defaulted
    port can silently evaluate a zombie** (Session 19): the drift
    re-run's RUNNER booted a healthy fresh server on :3075, but the
    SURVEY script it invoked carried its own hardcoded :3070 default —
    so the survey probed a stale zombie serving the old build (its
    chunks regenerated away) while the healthy server sat unused, and
    a perfectly good build "collapsed" to 0.0000. The diagnosis
    pattern that resolved it in minutes: (1) curl the served HTML's
    CSS chunk href and diff it against the disk chunk; (2) load the
    page in Chromium and count `document.styleSheets` + read
    `getComputedStyle(document.body).backgroundColor` (a styled page
    reads rgb(0,0,0); an unstyled one reads the UA default); (3)
    re-probe on the VERIFIED port. Every runner must export its base
    URL and every survey must REQUIRE it (no silent defaults), and
    port-zombie symptoms (concatenated words) mean check WHAT you are
    probing before blaming the build.
48. **The FRAMEWORK answers unexported HTTP methods with bare 405s — the
    method layer sits BELOW every handler and every wrapper** (Session
    20): a GET on a POST-only route never reaches the handler, its
    `apiRoute` wrapper, its rate limiter, or its session gate — Next.js
    itself answers `405` with an EMPTY body, NO content-type, NO
    `Allow`, and NO cache-control (probed across 11 method-mismatch
    requests; the `next.config.ts` security headers DO cover framework
    answers — only the envelope layer is absent). The invariant "no
    route returns bare JSON" is false exactly where your code cannot
    see it. The fix pattern: guard EXPORTS — `export const GET =
    methodGuard("OPTIONS, POST")` claims each unimplemented method for
    the envelope (the RFC 9110 §15.4.6 `Allow` header arrives free via
    the `fail()` seam), and an explicit `OPTIONS` export replaces
    Next's auto-answer (204 + Allow — the auto-answer enumerates
    EXPORTS and would over-report once the guards exist). Survey the
    method matrix of EVERY route file, not just the handlers it
    exports.
49. **POST/PATCH route handlers buffer the FULL body at
    `request.json()` — nothing in the framework caps the size, and a
    raw-fetch probe of an SPA reads its un-hydrated shell** (Session
    20): a 50MB login body was fully buffered and JSON-parsed (314ms)
    before validation answered — no ceiling in code, none in the
    deployment docs, and the rate limits cap frequency, never size.
    The guard pattern: read the DECLARED `content-length` BEFORE the
    parse (`bodyTooLarge`: an O(1) header read — nothing buffered —
    answering 413 PAYLOAD_TOO_LARGE above 128KB; re-probed: the 50MB
    body rejected in 91ms); place it parse-adjacent, exactly where the
    memory is consumed — requests rejected earlier never buffer;
    chunked bodies without a declaration are the reverse proxy's
    residual to cap (document it). And the parity-tooling half of the
    same lesson: a raw-fetch word-parity probe of the LIVE collapses
    to ~0.07 because the SPA's initial HTML is a ~130-word shell — the
    honest comparison renders BOTH sides in Chromium and diffs
    `document.body.innerText`; the same family: the live's
    `/dashboard` HTTP status is 200 for ANY route (the 404 is the
    CLIENT-rendered view) — adjudicate on rendered content, not the
    status line.
50. **Cap the OUTPUT side too — and pair every list ceiling with
    honest aggregates** (Session 21): S20 capped what a request may
    CARRY (the 128KB input ceiling), but the OUTPUT side was unbounded
    — `GET /api/workflows` had no `take` (probed on a probe-only DB
    with 400 seeded workflows: a 134.5KB response, the dashboard
    mounting 400 article cards — 9,649 DOM nodes — while the runs
    chart sliced to 8; the LIST rendered everything). The fix rides
    SQL `take: MAX_WORKFLOW_LIST` in BOTH the route and the page query
    (the wire-level cap, not a client slice) AND moves the stat cards
    to server-side aggregates shipped as the envelope's additive
    `meta` sibling of `data` — a capped list without honest aggregates
    silently turns summary cards into subset summaries (a ceiling
    that lies is worse than no ceiling); the `meta` field stays
    strictly OPTIONAL in the client so every bare-array mock keeps
    working; the capped UI states the truth ("Showing the 100 most
    recent of N workflows."). And the audit question that found it:
    survey what a response may RETURN, what a page query may FETCH,
    and what the client may RENDER — the three legs of output volume,
    each with its own ceiling seam.
51. **Every mutation deserves a limiter — and detached probe servers
    outlive their diagnostics** (Session 21): `POST /api/workflows`
    was the ONLY unthrottled mutation in the app (auth, newsletter,
    demo, and generate all carry limiters) — a script minted unbounded
    rows with one tiny JSON POST each; the fix is the
    `generateRateLimit` pattern (`workflowRateLimit(userId)`: 30 per
    USER per 15 min, `WORKFLOW_RATE_LIMIT_MAX` override, the 429
    envelope + Retry-After, ordered after the session gate and before
    the body parse). Two survey-tooling companions: Playwright's
    `context.cookies(url)` FILTERS Secure cookies on plain http —
    127.0.0.1 is trustworthy for navigation (the cookie is sent) but
    cookie ENUMERATION with a URL argument drops it (enumerate with no
    arguments and match by name — the gotcha-30 family); and a
    `setsid`-detached survey server OUTLIVES its diagnostic session —
    the next runner's fresh boot on the same port hits a
    silently-swallowed EADDRINUSE and probes the STALE build (the
    gotcha-26/31 family's fourth member: kill detached servers
    explicitly, or probe on fresh ports).

52. **Race the WRITE, don't check-then-write** (Session 22): S17 closed
    CREATE's register race with a P2002 classifier — the classifier
    approach catches the SYMPTOM after the fact. The `[id]` PATCH/
    DELETE routes still ran `findFirst` → parse → `update`/`delete` by
    bare id, and a DELETE committing inside the parse window threw
    UNCLASSIFIED P2025 → the 500 INTERNAL_ERROR envelope for a
    legitimate two-tab user (probed 3/3 with a ~100KB body streamed at
    60KB/s + a DELETE at +0.7s; the parallel DELETE double-fire hit 500
    in 2/5 tries — nondeterministic, the worst kind). The honest fix
    carries the ownership predicate IN the write:
    `updateMany({ where: { id, userId }, data })` and
    `deleteMany({ where: { id, userId } })` — count 0 IS the honest
    404, and neither operation can throw P2025, so the race is closed
    BY CONSTRUCTION. Companion trap: Prisma's `updateMany({data:{}})`
    is a no-op returning count 0 EVEN FOR AN EXISTING ROW — an
    empty-patch 200 contract needs its own read branch. And the
    ownership guard itself had no wire-level pin anywhere (the suites
    only ever acted as the row's owner) — pin cross-user isolation
    (user A on user B's row → 404 ×3) or a dropped `userId` in the
    WHERE is a silent IDOR, not a failing check.

53. **Smoke-pin authoring is code — the pins catch their own bugs**
    (Session 22): TWO pin bugs surfaced mid-execution, both caught BY
    the pins they live in (the S21 family's third and fourth members).
    First: curl's `-w '%{http_code}'` writes NO trailing newline —
    `cat c*` concatenates six codes into ONE line, so
    `grep -c '^200$'` can never match (count per-file with an explicit
    newline printf). Second: bash's `${f/c/r}` parameter substitution
    replaces the FIRST 'c' ANYWHERE in the string — a mktemp dir name
    like `/tmp/tmp.XcR3xq` gets rewritten before the `c<index>` stem
    you meant (pair files by explicit index). The meta-lesson is the
    S21 one recurring: deterministic pins that fail inexplicably are
    usually telling you your PROBE is wrong, not the system — read the
    pin's own mechanics before blaming the route. Companion this
    session: the VLM check-prompt drift family's FIFTH member — a
    FAIL verdict with an EMPTY deviations list is model noise; demand
    a NAMED deviation or adjudicate with deterministic evidence (the
    open-description probe + untouched bytes + the e2e suite).

54. **The client dispatches failure classes too — mirror the server's
    honesty downward (Session 23)**: S13's law ("failure CLASSES need
    distinct UI contracts") does not stop at the wire. S22 made the
    raced PATCH/DELETE answer the honest 404 — but the client's catch
    still treated it like a network fault: the retry-lie banner
    ("Try again" — every retry 404s forever) plus the ghost row staying
    mounted. The fix gives the 404 its own CLIENT contract (the
    401-sentinel's pattern): drop the row locally, re-sync, announce
    politely (a raced DELETE is IDEMPOTENT SUCCESS — the row being gone
    is what Delete asked for); only the RETRYABLE classes keep the
    banner. The sibling defect: `refresh()` had no in-flight ordering
    guard — two concurrent actions on different rows fire two GETs,
    and a delayed stale snapshot landing LAST resurrected the deleted
    row (probed deterministically via route-delay); a useRef sequence
    counter drops any response superseded by a newer refresh. Pin
    traps this session: **Next.js's route announcer is itself a
    role=alert element carrying the page title** — an unfiltered
    alert-count pin can never pass; filter by text (the
    session-lifecycle pattern).

55. **A mock's glob is narrower than you think — and a checksum that
    covers names can miss statuses (Session 23)**: the standard
    capture script's error-boundary mock used `page.route("**/api/
    workflows")` — a glob that does NOT match `/api/workflows/[id]` —
    so the mock's own Pause-click ESCAPED to the real server and
    landed on the dev DB (twice: two sessions closed with "canonical"
    checks while their own capture runs had paused rows — the seed
    checksum covers rows/names, not STATUSES). Cover the [id] routes
    in the mock's regex, and verify the dev DB's LOGICAL state (rows
    + active count + runs sum) before AND after every capture run.
    Companion this session: the VLM check-prompt drift family's SIXTH
    member — a "missing 3 workflow cards" verdict on a 900px viewport
    screenshot, disproven by the viewport cut (the cards extend below
    the fold by design); state the VIEWPORT contract in the prompt.

56. **A hang is not a failure — pin it with the clock, not the wall
    (Session 24)**: no client fetch carried a timeout, so a black-
    holed request (a stalled connection — the CLIENT twin of the S15
    server-side hang) neither resolved nor rejected: the busy spinner
    stayed engaged FOREVER with no banner and no recovery. The
    resilience suites covered ABORTS, which reject immediately — the
    hang class was invisible to every gate until probed with a
    NEVER-FULFILLING `page.route`. The fix family: `fetchWithTimeout`
    (an AbortController + setTimeout wrapper riding every client fetch
    site) converts the hang into the existing network-fault catches.
    Two pin-authoring discoveries: an inert fetch MOCK cannot observe
    the abort rejection (a never-settling mock ignores the signal —
    unit-pin the seam against a REAL hung TCP socket: `net.createServer`
    that accepts and never answers), and Playwright's `clock` API
    (`page.clock.install()` BEFORE navigation + `fastForward`) makes a
    20s ceiling cost milliseconds of wall-clock. The sibling law: every
    action start clears BOTH error surfaces — a "Try again." banner
    left mounted after a SUCCESSFUL unrelated action is a lie by
    staleness (the S13/S23 family's temporal member).

57. **The seed must write where the app reads — make the placement
    OBSERVABLE (Session 24)**: the first-run `db:push`/`db:seed` relied
    on env resolution outside the app's tested db-path seam, and this
    sandbox's shell-exported absolute `DATABASE_URL` + a parent
    `.env` (gotcha 1's vectors — the parent WALKS UP into Prisma's env
    auto-load) silently redirected a whole first-run to a foreign
    database while the app opened the 0-byte in-repo file (login
    answered P2021 INTERNAL_ERROR with the seed reporting SUCCESS).
    The fix: the seed resolves through `resolveCliDatabaseUrl()` (the
    deterministic precedence: explicit process env → the repo's own
    .env → the default, all through the anchor logic) BEFORE
    constructing its client, and PRINTS `seed-target:`; db:push/
    migrate/reset route through a wrapper printing `[db]
    DATABASE_URL=`. The meta-lesson: a silent placement assumption is
    a latent first-run breaker — surface the resolved target wherever
    two tools must agree on the same file, and pin the agreement (the
    smoke seed-target pin). Companion this session: the VLM drift
    family's SEVENTH and EIGHTH members — the hero's primary CTA IS
    "Book a Demo" (Get Started lives in the navbar — the landing spec
    pins both roles), and the demo page's footer sits below the 900px
    fold (footerTop 1009 of a 1378px page) — always adjudicate a FAIL
    against the PINNED contract and the geometry before touching
    code.

58. **Every ceiling must say what it hides — probe capped surfaces
    with data that EXCEEDS the cap (Session 25)**: the runs chart
    rendered `slice(0, 8)` silently — with a 12-row probe workspace it
    showed 8 bars with NO note while the heading read "Runs by
    workflow". The workflow LIST was fixed for exactly this lie in
    Session 21 ("a ceiling that lies is worse than no ceiling") — but
    the chart's ceiling never got the honesty because every probe and
    every gate ran against the SEEDED 6-row workspace, which hides
    every ceiling above 6. The survey discipline: for every capped
    surface (list caps, chart slices, pagination windows), seed PAST
    the cap and look for the missing note. The fix family: the same
    S21-pattern note with the TRUE server-side total
    ("Showing the 8 most recent of N workflows."). Companion
    discoveries: the note's first draft used `text-white/40` — the
    post-fix axe scan caught it at 3.5:1 on the dark card (and the
    LIST's S21 note had carried the same latent violation for four
    sessions, never rendered because it needs a >100-row workspace —
    an axe scan only catches what RENDERS); and the chart's rows were
    div soup — a screen reader read the texts but never announced
    "list, 8 items" (the fix: a semantic `ul`/`li`, visually
    identical under preflight).

59. **A budget you measured but never pinned is a regression waiting
    to happen (Session 25)**: the S21/S22 performance surveys measured
    LCP/TTFB/DOM-node ceilings ad hoc — and nothing in the gate held
    them, so a future change (a 5,000-node DOM, a blocking import, a
    hero-asset regression) would have passed all 486 checks while
    halving the site's speed. The fix: `tests/e2e/performance
    -budget.spec.ts` pins landing DOM ≤ 1200 / landing LCP ≤ 1500ms /
    login LCP ≤ 800ms / the authed dashboard DOM ≤ 500 — deliberately
    GENEROUS 2–4x margins over the measured values, because the
    budget's job is to catch GROSS regressions, not to chase
    milliseconds (generous ceilings are the de-flake strategy, not a
    weakness; sample LCP to settled with a buffered
    PerformanceObserver — never a fixed-offset read). The meta-law
    extends the S21 output-ceiling family from the WIRE to the RUNTIME
    and the RENDER: cap the body, cap the list, and PIN the budget you
    measured. Companion this session: the VLM check-prompt drift
    family's NINTH and TENTH members — an invented "Watch demo"
    secondary CTA + an omitted beta badge on the landing prompt, and
    an invented "Sign in" heading + "NovaAI logo" on the login prompt
    (the pinned contracts: the beta badge + Book a Demo + the hero
    video, and "Welcome to SAAS Company" with the reference's own 'S'
    chip) — write the check prompt FROM the spec's pinned assertions,
    never from memory of what the page "should" look like.

60. **A ranked surface must rank by its own title — and the cap can
    hide the champion entirely (Session 26)**: the runs chart under
    "Runs by workflow" charted `workflows.slice(0, 8)` — the 8 most
    RECENT rows (mirroring the list), not the top 8 BY RUNS. A 12-row
    probe workspace whose OLDEST row carried 12,000 runs (13x the top
    displayed row) rendered the champion INVISIBLE with every bar a
    4%–7.5% stub — the `maxRuns` denominator came from a row the chart
    never displayed, so the bar-length encoding carried no information
    exactly when a runs ranking is meaningful. Two survey disciplines:
    probe every RANKED surface with a workspace whose top row by the
    ranking key is NOT the newest row (in the seeded 6-row workspace
    recency and rank coincide — the question is invisible), and when a
    ranked surface draws from CAPPED data, remember the cap itself can
    exclude every high-ranked row (at >100 workflows the client state
    is the capped newest-100 list — the smoke suite's own 111-row
    workspace holds the champion in ZERO of the newest-100 rows). An
    honest ranking over capped data must be SERVER-SIDE — the
    envelope's `meta` sibling (the S21 stat-cards precedent) carries
    `topRuns` across the FULL workspace, with a pure client-side
    fallback seam (`rankByRuns()`) for the meta-less contract. And the
    self-describing-note law extends: the truncation note now NAMES
    the criterion ("Showing the top 8 of N workflows by runs.") — a
    note that hides its own selection criterion is half-honest.

61. **Adjudicate the VLM against MECHANISM, not against the frame
    (Session 26)**: two more check-prompt drifts took the family to
    twelve. The ELEVENTH: a single-frame screenshot of the ANIMATED
    gradient heading caught a white-dominant instant (the violet band
    is off-text ~86% of its 14s cycle — `background-size: 400%`), and
    the VLM called the gradient "missing" — the adjudication was a
    TIME-SAMPLED probe (8 distinct background positions over 3.2s
    proved the animation RUNNING; the gotcha-15/24 single-frame
    family: never adjudicate an animated surface from one frame).
    The TWELFTH: the prompt itself invented a "dashboard mockup with
    browser chrome" INSIDE the hero — the hero's video is the
    full-bleed looping BACKGROUND (`section video`, pinned by src;
    the spec's pin is a DOM attribute, not a viewport position), the
    mockup is a separate below-the-fold section, and the "scroll
    indicator" the VLM saw at the bottom is the hero's own by-design
    element. The meta-law (now three sessions deep): write the check
    prompt FROM the spec's pinned assertions — and when the VLM
    reports a deviation, verify the CLAIM against the spec + a
    geometry/time probe before believing either the verdict OR your
    own prompt.


62. **A workspace-level rate must weight by what it aggregates — the
    average-of-averages fallacy (Session 27)**: the stat card rendered
    Prisma's `_avg successRate` — the UNWEIGHTED mean over
    per-workflow rates. The extreme probe shape (1 row: 12,000 runs @
    60% + 4 rows: 3 runs @ 100%) displayed 92.0% while the
    workspace's true rate was 60.0% — a 32-point divergence sitting
    directly beside "Total runs 12,012" (the run-share reading the
    adjacency invites: "92% of my 12,012 runs succeed" is off by
    ~4,000 runs). Averaging pre-aggregated values without weighting
    by sample size is the classic statistical fallacy — and it hides
    in plain sight because the seeded demo data (rates 97.8–100)
    renders both semantics identically at one decimal. The fix
    pattern: the pure `weightedSuccessRate()` seam
    (`Σ(runs × successRate) / Σ(runs)`, null iff Σruns = 0) shared by
    the route's meta, the page's initial paint, AND the client's
    fallback memo — one definition, no drift; the wire field and the
    label NAME their criterion (`meta.stats.successRate` /
    "Success rate" — a field named "avg" carrying a weighted rate
    would be the lesson-60 chart lie one layer down). The pin
    discipline: a wire pin needs probe data where the semantics
    DIVERGE (the smoke's 105 volumetric probe rows at successRate 50:
    unweighted 52.7 vs weighted 93.1 — at the old 99.5 BOTH rendered
    99.5%, pinning nothing); and the e2e pin derives its expectation
    from the SURVIVING rows (session23-honesty has deleted two seeds
    by then) while carrying a self-checking discrimination
    meta-assertion (weighted ≠ unweighted at one decimal — the S17
    timing-ratio pattern: the pin verifies it still pins).

63. **A finally block's `process.exit(0)` swallows the in-flight
    error — the completion log line is the check, never the exit
    code alone (Session 27)**: the standing screenshot capture script
    failed mid-run after shot 13 (after the mobile section the
    desktop page sat on /accessibility, so the resilience-shot Pause
    click found no button and timed out) — and its `finally` block's
    `process.exit(ok ? 0 : 1)` PREEMPTED the pending catch handler,
    so the run exited 0 having refreshed only 17 of 20 shots; the S26
    session closed "20 screenshots refreshed" on the exit code's word
    (the gotcha-32 channels family: a swallowed channel lies — the
    log line "20 shots captured" never printed and nobody looked).
    The laws: never `process.exit(0)` from a finally (drift forces 1;
    shot failures propagate to the catch; only a clean full run
    exits 0), and verify the COMPLETION artifact (the log line, the
    file count, the timestamp set) — an exit code is a summary, not
    a proof. The audit corollary: when a multi-step script's step
    count matters, count the OUTPUTS (this session's `ls` showed
    14/15/16 stale at the clone timestamp — the git-checkout mtime
    was the tell).

64. **A value computed at more than one seam must share its ARITHMETIC,
    not just its formula — float addition is order-dependent at exact
    display boundaries (Session 28)**: the "Hours saved" card had two
    computations behind one definition — the server's (SQLite's SUM,
    extended-precision, grid-exact at every probed shape) and the
    client fallback's (a naive JS float reduce over the list in
    createdAt-DESC order). At a workspace whose true decimal sum sits
    exactly on x.5, the JS reduce answered 48.499999999999993 where
    the decimal truth is 48.5 — displaying 48 where the server
    displayed 49 (four of six probed drift shapes diverged by 1
    between the seams). The law: when a value is computed at more
    than one seam, share the pure seam AND make the seam's arithmetic
    ORDER-FREE — `sumHours()` accumulates INTEGER TENTHS (associative
    by construction) and every persisted value sits on the 0.1 grid,
    so the exactness is closed by construction, not by rounding luck.
    The survey corollary: extend a boundary probe to the CLASS (the
    integer runs sum was exact everywhere; the run-weighted rate
    survived a 50,000-shape flip search — both adjudicated CLEAN and
    documented so the next session does not re-litigate).

65. **A suite's per-process budgets grow with the suite — re-count
    them every cycle (Session 28)**: the e2e webServer's
    `AUTH_RATE_LIMIT_MAX=50` pin was set in Session 11 when the suite
    made ~10 auth flows; seventeen sessions of spec growth later the
    suite made ~45 (38 signIn calls + the register round-trips that
    share login's bucket) — and the first Session-28 full run 429'd
    the LAST files alphabetically (session27/session28) while the
    isolated re-run on a fresh server passed 3/3. That signature —
    late-file failures in the full run, clean in isolation — is a
    budget exhaustion, not a defect. The law: when the suite grows,
    re-count EVERY per-process budget it consumes (auth flows,
    workflow creates, generate calls); a pin sized at the suite's
    authoring-time footprint is a razor edge two cycles later. And
    the tooling twin: never launch a full-suite run inside a command
    that can time out mid-run — the killed run's playwright+webServer
    orphans itself, the next run's `reuseExistingServer` latches onto
    the orphan's server, and when the orphan's run finally tears down
    it kills the server OUT FROM UNDER the live run (the
    gotcha-26/31 zombie family's fifth member: 233/235 failed with
    ERR_CONNECTION_REFUSED until the orphans were cleared and the
    suite re-ran clean).

66. **Playwright restarts the worker after a failed test — a
    state-sharing spec's module-level identifiers silently regenerate
    (Session 29)**: the first-run spec's first authoring had ONE `await`
    bug in test (a) (`expect(statValue(...))` receiving a Promise —
    `expect(pending).toBe("0")` fails instantly); the failure restarted
    the worker, the spec module RELOADED, the module-level
    `Date.now()`-suffixed EMAIL regenerated, and `beforeAll` re-ran in
    the new worker — registering a NEW user. Test (b) then ran against
    an EMPTY workspace (chart 2 ≠ 3) and test (c) read ZERO rows for
    "the" user — the secondary failures pointed at the WRONG layer
    ("the wire says 2 rows, the file says 0" was the tell that the
    STATE, not the code, had split). Two laws: (1) mark
    state-sharing groups `test.describe.serial` — fail-fast is the
    honest structure (the remaining tests SKIP instead of running
    against split state; applied to session28-tie-break
    retroactively); (2) always diagnose the FIRST failure in a run —
    the cascade after a worker restart is noise, and chasing it sends
    you hunting DB-identity bugs that do not exist.

67. **Structured data is content — derive it, never re-type it
    (Session 29)**: the JSON-LD superset (Organization + WebSite +
    SoftwareApplication on the landing; FAQPage on /faq) lives or
    dies by the content-as-code law — every fact derives from its
    ONE content source at render time (the offers from the pricing
    module — Free $0, Pro $49, Enterprise's null "Custom" price
    OMITTED because an Offer without a price is invalid schema and
    an invented 0 would be a lie; the FAQ entities VERBATIM from
    the FAQ content module; the description from the SEO default),
    and the PIN derives from the same modules (the first e2e spec
    importing from src/): a pricing or FAQ edit that skips the
    schema FLIPS the pin instead of drifting silently. And prove
    the mount is invisible to every standing gate BEFORE authoring:
    an inline `application/ld+json` script never renders into
    `document.body.innerText` (the word-parity battery is immune),
    creates no resource-timing entry (the transfer budgets are
    immune), and has no box (CLS is immune) — re-verify the battery
    after the mount anyway (measured, not remembered).

68. **The reference WILL redeploy under you — harden the parity
    battery with a column per surface class, so the redeployment
    surfaces as a MEASURED diff, not a stale doc claim (Session 30)**:
    the S29 record said "the reference ships NO structured data"
    (true at its measurement time); by S30 the live had REDEPLOYED
    with a full JSON-LD layer (a minimal WebSite + Organization on
    every route, BreadcrumbLists on the content routes) — caught
    only because the rebuilt drift battery carried a NEW JSON-LD
    mount column (the S29-suggested fifth surface). The law: every
    parity claim has a LIFETIME measured in reference-deployments,
    not sessions — when a surface class is worth one battery run, it
    is worth a battery COLUMN (word parity, the mobile-nav panel,
    the SEO surface, and now the structured-data mounts), so the
    next redeployment is a diff against yesterday's capture, never
    an argument with a stale ledger row. The adjudication pattern:
    the historical row STAYS (it was true); the new row documents
    the redeployment and the clone's parity+superset answer.

69. **fullPage screenshots capture beyond-viewport content WITHOUT
    scrolling — IO-gated entrances leave below-fold sections as
    blank bands (Session 30)**: the first 20-shot refresh produced a
    landing-full whose pricing/testimonials bands were empty black
    (the IntersectionObserver-driven Reveal entrances never fired —
    Playwright's captureBeyondViewport does NOT scroll), and the
    section shots captured MID-ENTRANCE (the rAF entrances run
    delay + 600–900ms AFTER the IO trigger — a screenshot right
    after `scrollIntoViewIfNeeded` catches opacity ~0). The fix: a
    SCROLL-THROUGH pass before the capture (viewport steps, ~140ms
    pauses — every IO fires, every entrance settles) + a post-action
    settle, and VERIFY THE BANDS (a VLM read or pixel-variance —
    stdev ~0 means blank; the rendered page reads ~100+), never the
    exit code alone (the gotcha-41 completion-line law's twin:
    a "successful" capture can be visually empty).

70. **A proxy is not a measurement — a parity claim inherits the
    precision of the WEAKEST instrument behind it (Session 31)**:
    the head layer's parity had "been verified" for 30 sessions —
    but the actual chain was: word parity (never sees meta content)
    stood in for the head; the S6 map recorded the description
    PATTERN but never its LENGTH; the head-metadata e2e pinned only
    `startsWith` prefixes. The live had been truncating its
    content-route descriptions at 80 chars mid-word the whole time
    ("…with an immersi.") while the clone shipped the full text —
    invisible to every standing gate, caught on the FIRST run of
    the battery's new canonical/og column (the session_60 candidate's
    own suggestion: "the live's canonical pattern is currently
    word-parity's proxy, not its own measured surface"). The law:
    when a surface matters enough to claim parity on, MEASURE THE
    SURFACE ITSELF — exact strings, exact lengths, exact tag sets —
    because every layer of indirection between the claim and the
    measurement is a place where drift hides (a prefix assertion
    passes forever while the tail drifts; a word-parity 1.0000 says
    NOTHING about `og:description`). The battery-column discipline
    of lesson 68 is the instrument; this lesson is why the
    instrument must read the ACTUAL surface, not a proxy for it.
    The sibling catch the same column made: the 404's canonical
    pointed at Next.js's INTERNAL route id (`/_not-found`) while
    the live pointed at the requested URL — a bug by any standard,
    hidden because nothing measured the 404's head at all.

71. **A fix and its pin share the same blind spot until the pin
    measures MORE than the fix touches — and frameworks write to the
    DOM after your effects run (Session 32)**: the S31 404-canonical
    fix mutated `document.querySelector`'s FIRST match in a one-shot
    effect, and the e2e pin read the same first match — both sides of
    the contract were blind to Next 16's client metadata resolution
    APPENDING its own head copies AFTER the mount effects run. The
    rendered 404 carried TWO canonical links and TWO og:url metas for
    a full session: the first (mutated, correct) plus the appended
    `/_not-found` copy (a URL that does not exist, referenced by a
    canonical) — and every gate stayed green because the fix and the
    pin shared the selector. Two laws: (a) pin the COUNTS
    (`querySelectorAll().length`), never just the first match — a
    duplicate-tag class is invisible to every first-match assertion
    BY CONSTRUCTION; and (b) a DOM-normalizing effect on
    framework-managed head tags needs a MutationObserver on
    `document.head` to catch the late insertion (idempotent
    re-normalization, disconnected on unmount). The session's other
    head lesson: Next's Twitter metadata type carries NO `url` field —
    the arbitrary-meta channel (`metadata.other: { "twitter:url": … }`)
    is the emission path when the typed API lacks a tag the reference
    ships. And the battery-column compounding: the S31 canonical/og
    column measured FOUR tags' VALUES; the S32 head-tag SET column
    measured WHICH tags exist — the twitter:url gap was structurally
    invisible to the sixth column and caught by the seventh on its
    first run. Each column generalizes the one before it (values →
    exact values → tag sets); the next generalization is already
    suggested by this session's shape (the DOM-attribute layer —
    `itemprop`/`data-*` attributes on body content, unmeasured).

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
