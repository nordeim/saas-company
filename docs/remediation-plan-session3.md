# Remediation Plan — Session 3 (2026-10-07)

**Scope:** Fix the issues, bugs and gaps found by the Session 3 parity audit
of this repository against the live reference (`saas-company.base44.app`),
executed TDD-first, gated by the full quality gate (§7.3 of the PAD), and
re-verified by a fresh paired survey.

**Audit method:** fresh DOM captures of every live route (agent-browser,
1440/900 and 390/844), word-level + heading/link difflib comparisons against
the clone, computed-style probes of the VLM-flagged chrome (nav, badge,
fonts, gradients), direct reads of the live's compiled CSS token table
(`/assets/index-BrYDoaSB.css`), VLM side-by-side scoring (z-ai vision), and a
full re-run of the 152-check gate (all green on the inherited tree). Raw
evidence: `/home/z/my-project/session3-ref/` (outside the repo).

**Reference drift check:** the live site is UNCHANGED since the Session 2
survey — identical headings (22/22), identical link map (22/22), identical
mobile-menu geometry (panel 0,56,390×397; 7 rows @44px), `/checkout` still
SPA-404 (the clone's workspace remains the documented superset D1). Every
finding below is therefore a clone-side gap, not reference drift.

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | `--color-primary` token is `#d500ff` (290°); the live's `:root` block — which is the one that applies, the app never mounts `.dark` — defines `--primary: 267 100% 57%` = **#8624FF**, and the live's rendered gradients confirm it (`from-primary` → `rgba(134, 36, 255, …)`). Session 1 measured the unused `.dark` block's value. Affects ~12 gradient surfaces: the hero glow, dashboard-mockup skeleton bars/dots/chart bars, problem-card icon chips, the CTA glow, dashboard charts | `src/app/globals.css` L39 | HIGH | Verified (live compiled CSS + computed gradients) | Visual parity |
| F2 | `--color-accent` / `--color-electric-blue` are `#008cff` (≈207°); the live defines both as `220 100% 50%` = **#0055FF** (`rgba(0, 85, 255)` in every rendered gradient). Affects ~14 surfaces: the Most Popular badge gradient, chart bars, icon gradients, electric-blue borders/text | `src/app/globals.css` L41, L44 | HIGH | Verified (live compiled CSS + computed gradients) | Visual parity |
| F3 | `--font-body` resolves to **"Vend Sans Text"** first; the live uses **"Vend Sans"** (the Display cut) for every element — `--font-body: "Vend Sans", sans-serif` — and no element on the live ever resolves "Vend Sans Text" (censused). Visible metric drift (e.g. Book a Demo pill renders 197px on the clone vs 190px on the live at 1440) | `src/app/globals.css` L59 | MEDIUM | Verified (computed font census both sides) | Visual parity |
| F4 | Testimonial headlines and the features card's AI-suggestion text render with curly quotes `“…”`; the live uses straight ASCII `"` (e.g. `"Cut our pipeline errors by 94%"`, `"Merge steps 3-5 to save 12 min/run"`) | `src/components/sections/testimonials.tsx` L66–67 (`&ldquo;`/`&rdquo;`), `src/components/sections/features.tsx` L156 (`&#8220;`/`&#8221;`) | MEDIUM | Verified (live DOM) | Content parity |
| F5 | David Park testimonial reads "on-premise"; the live reads **"on-prem"** | `src/components/sections/testimonials.tsx` L29 | LOW | Verified (live DOM) | Content parity |
| F6 | Page titles diverge: the FAQ page exports no title at all (renders "SAAS Company"); privacy/terms/accessibility/refund export long names joined with "—" via the layout template. The live uses SHORT names joined with a pipe: `FAQ | SAAS Company`, `Privacy | SAAS Company`, `Terms | SAAS Company`, `Accessibility | SAAS Company`, `Refund Policy | SAAS Company` | `src/app/layout.tsx` L28 (template), `src/app/{faq,privacy,terms,accessibility,refund-policy}/page.tsx` | MEDIUM | Verified (all five `<title>`s captured) | Metadata parity |
| F7 | The 404 card omits the quoted pathname; the live renders `The page "xyz" could not be found in this application.` with the path wrapped in `<span class="font-medium text-slate-700">"xyz"</span>` | `src/app/not-found.tsx` L16–18 | LOW | Verified (live DOM + markup) | Visual parity |
| F8 | The live runs **Lenis 1.3.23** smooth scrolling (`window.lenis` object, `html.lenis`, default options); the clone ships only CSS `scroll-behavior: smooth` — the wheel/touch scroll feel differs | new dependency + wrapper component | MEDIUM | Verified (live runtime probe) | Functional parity |
| F9 | The live's HTML carries the Vite scaffold `<noscript>You need to enable JavaScript to run this app.</noscript>`; the clone has none (invisible with JS on; closes the last word-parity gap on /login) | `src/app/layout.tsx` | INFO | Verified (live HTML) | HTML parity |
| F10 | The live emits `<meta name="apple-mobile-web-app-title" content="SAAS Company">`; the clone doesn't | `src/app/layout.tsx` metadata | INFO | Verified (live head) | Metadata parity |
| F11 | `vitest.config.ts`'s header comment still describes the retired ORBITAL app's seams ("router, clarify questions, plan sanitizer, check-in mapping") — misleading to maintainers | `vitest.config.ts` L4–6 | INFO | Read | Code hygiene |

Non-findings (checked, clean): **mobile navigation** — geometry byte-identical
to the live (panel `md:hidden bg-black/95 backdrop-blur-xl border-b
border-white/5` at 0,56,390×397; 7 rows: 5 anchors + Log In + Get Started,
all 44px, exact hrefs/order; burger button, scroll indicator — incl. the
Session-2 `animate-scroll-dot` — and the Get Started pill are DOM-identical;
the VLM's "thinner X / narrower indicator / different radius" flags were
misreads or the documented oklab-serialization artifact D6). Legal pages
0.995–0.997 word parity with IDENTICAL headings/links (residual deltas are
`<title>` string artifacts). `Save 20%` renders identically (the audit's
"20 %" was the tag-stripper eating React's invisible `<!-- -->` comment
nodes). VLM full-page 96/100 and mobile-menu 94/100 — every remaining flag
traced to line-wrap timing, video/animation frames, or the F1/F2/F3 root
causes above. FAQ word-similarity delta is the known collapsed-accordion DOM
artifact (headings/links identical; content pinned since Session 2). The
152-check gate is green on the inherited tree.

---

## 2. Remediation ToDo (executed in order, TDD)

### R1 — Restore the reference's brand color tokens (F1 + F2)

1. **RED:** new e2e spec `tests/e2e/brand-parity.spec.ts` pinning the
   RENDERED gradients (computed styles accept the rgba or oklab spelling):
   - a `from-primary` surface (hero mockup glow or chart bar) computes to a
     gradient whose first stop is `rgb(134, 36, 255)` (any alpha);
   - a `to-electric-blue` surface (the pricing "Most Popular" badge) computes
     to a gradient whose last stop is `rgb(0, 85, 255)`;
   - `--color-violet` stays magenta: a `text-violet` element computes to
     `rgb(213, 0, 255)`.
2. **GREEN:** in `src/app/globals.css` `@theme`:
   - `--color-primary: #8624ff` (hsl 267 100% 57% — the live's `:root`
     primary; comment explains the `.dark`-block trap);
   - `--color-accent: #0055ff` and `--color-electric-blue: #0055ff`
     (hsl 220 100% 50%);
   - `--color-violet: #d500ff` unchanged.
3. **VERIFY:** pins green after rebuild; spot-check the hero glow + mockup
   chart against the live (computed gradient strings); VLM re-run.

### R2 — Body font = "Vend Sans" (Display cut), like the reference (F3)

1. **RED:** e2e pin: `document.body` computed `font-family` resolves its
   FIRST face to `"Vend Sans"` (the live's exact chain is
   `"Vend Sans", sans-serif`; the clone may keep longer fallbacks — the
   first face is what renders).
2. **GREEN:** `--font-body: "Vend Sans", "Vend Sans Text", ui-sans-serif,
   system-ui, sans-serif` (the Text cut stays as a fallback + its @font-face
   stays; no component changes — everything flows through the token).
3. **VERIFY:** pin green; Book a Demo pill width ≈190px at 1440 (was 197).

### R3 — Straight quotes on testimonial + AI-suggestion copy (F4 + F5)

1. **RED:** e2e pins: the testimonial headline text contains
   `"Cut our pipeline errors by 94%"` (straight quotes) and the section
   text does NOT contain `“`; the copy contains `on-prem option` and NOT
   `on-premise`; the features AI-suggestion row renders
   `"Merge steps 3-5 to save 12 min/run"` with straight quotes.
2. **GREEN:** `testimonials.tsx` — replace `&ldquo;{t.quote}&rdquo;` with
   `"{t.quote}"` (JSX string literal `&quot;`-free: write `"{t.quote}"` via
   `{'"'}`-safe template or the literal `"` character inside a JSX
   expression); fix `on-premise` → `on-prem`. `features.tsx` — replace
   `&#8220;…&#8221;` with straight-quote literals.
3. **VERIFY:** pins green; word-parity re-run (landing → the quote/word
   deltas close).

### R4 — Reference page titles (F6)

1. **RED:** e2e pins: `page.title()` for /faq, /privacy, /terms,
   /accessibility, /refund-policy equals `FAQ | SAAS Company`,
   `Privacy | SAAS Company`, `Terms | SAAS Company`,
   `Accessibility | SAAS Company`, `Refund Policy | SAAS Company`
   respectively (and `/` + `/login` stay `SAAS Company`).
2. **GREEN:** layout template `%s | ${SITE_NAME}`; export per-page
   `metadata.title` as `FAQ`, `Privacy`, `Terms`, `Accessibility`,
   `Refund Policy`.
3. **VERIFY:** pins green; smoke re-run (its page markers unaffected).

### R5 — 404 card quotes the missing pathname (F7)

1. **RED:** e2e pin: visiting an unknown path renders a paragraph matching
   `The page "<path>" could not be found in this application.` with the
   path inside a `span.font-medium.text-slate-700`.
2. **GREEN:** `not-found.tsx` — `usePathname()`; render the live's exact
   sentence with the span-wrapped quoted path.
3. **VERIFY:** pin green.

### R6 — Lenis smooth scrolling (F8)

1. **RED:** e2e pin: on `/`, `typeof window.lenis` is `"object"` and
   `document.documentElement.classList` contains `lenis`.
2. **GREEN:** `npm install lenis@^1.3.23` (runtime dep); new
   `src/components/site/smooth-scroll.tsx` ("use client": create Lenis with
   defaults + `autoRaf`, destroy on unmount, skip entirely when
   `prefers-reduced-motion: reduce`); render `<SmoothScroll />` once in
   `layout.tsx`.
3. **VERIFY:** pin green; the FULL e2e suite re-run (anchor-scroll +
   reveal-dependent specs are the risk surface); manual scroll-feel check
   against the live.

### R7 — noscript + apple-mobile-web-app-title (F9 + F10)

1. **RED:** extend `brand-parity.spec.ts`: `page.content()` contains
   `You need to enable JavaScript to run this app.` inside a `<noscript>`;
   the head contains `apple-mobile-web-app-title` = `SAAS Company`.
2. **GREEN:** `<noscript>` in the layout body; `appleWebApp: { title:
   SITE_NAME }` in the metadata export.
3. **VERIFY:** pins green.

### R8 — vitest config comment (F11, no pin)

Rewrite the header comment to describe THIS app's seams (pricing, rate
limit, validation, workflow, auth, content, db-path). Lint/typecheck cover
it.

### R9 — Full re-verification

1. Gate: `npm run lint` → `npm run typecheck` → `npm run test` (73/73) →
   `npm run build` → `./scripts/smoke-test.sh` (38/38) → `npm run
   test:e2e` (41 + the new brand-parity checks).
2. Parity re-survey: fresh paired captures (landing + mobile menu), VLM
   full-page + mobile-menu re-run (expect ≥96 with the tone flags closed),
   word-parity re-run (expect landing ≈1.0 modulo the React comment
   artifact).
3. `npm audit` — expect only the accepted braces advisory.

### R10 — Docs, screenshots, handoff

- `docs/screenshots/` refreshed from the remediated build (colors/fonts
  changed every hero/mockup/pricing surface; recapture the full set).
- Docs alignment: README design-system table + badge counts, PAD §5.2 token
  table + §5.4 ledger rows (D11 brand tokens restored, D12 body font, D13
  Lenis), AGENTS/CLAUDE notes, `saas-company_SKILL.md` §2/§4/§19.
- `.env.example` re-verified (no new env vars).
- Worklog + commit (`:bug: fix:` / `:memo: docs:` on `main` only) → SSH
   push via `docs/ssh_git_wrapper_v3.py` (runbook:
   `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

---

## 3. Validation of this plan against the codebase (pre-execution review)

| Plan reference | Codebase check | Result |
|----------------|----------------|--------|
| F1/F2 token lines | `globals.css` L39/L41/L44 read; no component hardcodes `#d500ff`/`#008cff` (grep clean — every surface flows through `@theme`); clone's `primary`/`accent`/`electric-blue` class positions match the live's (hero glow, skeleton bars, dots, chart bars, badge) | Aligned |
| F1/F2 blast radius | 26 class usages across 8 files (`dashboard-app`, `problem`, `dashboard-preview`, `logo-cloud`, `features`, `cta`, `how-it-works`, `pricing`); `violet` usages (20 `text-violet` etc.) mirror the live's and keep `#d500ff` — no swap risk | Aligned |
| F3 token line | `globals.css` L58–59 read; both @font-face blocks stay (Display + Text cuts, `src/fonts/`); no e2e pin asserts font-family (grep clean) | Aligned |
| F4/F5 sources | `testimonials.tsx` L66–67 (`&ldquo;`/`&rdquo;`), L29 (`on-premise`); `features.tsx` L156 (`&#8220;`/`&#8221;`) read | Aligned |
| F6 titles | `layout.tsx` L26–29 template read; faq/page.tsx has NO metadata export; privacy/terms/accessibility/refund export long names — confirmed by the rendered `<title>`s | Aligned |
| F7 404 | `not-found.tsx` L16–18 read (sentence without the path); live markup captured (span classes `font-medium text-slate-700`) | Aligned |
| F8 Lenis | live runtime probed: v1.3.23, defaults, `html.lenis`; clone has no lenis (grep clean); anchor-scroll e2e polls `scrollY` with 5s timeout — compatible with animated scrolling | Aligned |
| Test-pin safety | existing color assertions are alpha-only with oklab/rgba dual-accept (`mobile-navigation.spec.ts` L38, L115); no font-family or brand-color pins exist to break | Aligned |
| skills/ exclusion | tsconfig `exclude`, eslint `ignores`, vitest `include`, Next `src/` scoping — all still exclude `skills/` | Aligned |

**Risk assessment:** R1/R2 are token-value edits validated by new computed-
style pins; R3/R5 are surgical content edits; R4 is metadata-only; R6 is the
only new runtime dependency (pinned minor, ~3KB, client-only, destroy-on-
unmount, reduced-motion guarded) with the full e2e suite as its safety net;
R7/R8 are inert. No schema, API, or auth changes. Rollback = revert the
commit (single push).

**Execution order rationale:** root causes first (R1–R2 — every visual
surface), then content/metadata parity (R3–R5), then the one behavioral
addition (R6), then inert parity niceties (R7–R8), then the single
verification + handoff pass (R9–R10). The RED spec is written up front and
observed failing before any GREEN change.
