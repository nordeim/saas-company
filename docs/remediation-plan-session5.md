# Remediation Plan — Session 5 (2026-10-07)

**Scope:** Fix the issues, bugs and gaps found by the Session 5 parity audit
of this repository against the live reference (`saas-company.base44.app`),
executed TDD-first, gated by the full quality gate (§7.3 of the PAD), and
re-verified by a fresh paired survey.

**Audit method:** fresh DOM captures of every live route (agent-browser,
1440/900 + 390/844 — text similarity 1.0000 on all 8 routes vs the Session-4
ground truth: the **reference is UNCHANGED**), then a deep probe of
**interactive states no prior session surveyed**: the login card's alternate
modes driven natively (sign-up, forgot, wrong-password error, password
mismatch, reset-success), a real operator login on the live (post-login
chrome, CTA targets), keyboard-focus computed styles, the pricing toggle at
390px, the testimonials strip's scroll container, the newsletter form's
browser-validated submit, and the mobile menu's navigate-on-click behavior.
Plus a font-forensics pass (document.fonts, performance resource entries,
canvas measureText, fontTools name tables) that traced the live's actual
font assets. Raw evidence: `/home/z/my-project/session5-ref/` (outside the
repo). Every fill on the live used agent-browser's native `fill` (eval-based
`input.value=` writes do not sync React state — an earlier probe artifact).

---

## 1. Findings (audit output)

| # | Finding | Location | Severity | Confidence | Class |
|---|---------|----------|----------|------------|-------|
| F1 | **The UI typeface is the wrong font.** The live renders **Google Fonts' "Vend Sans"** — a variable font (wght 300–700) served from `fonts.gstatic.com/s/vendsans/v1/E21l_d7ijufNwCJPEUscVA9V.woff2` (performance entries + document.fonts: 5 weight entries 300/400/500/600/700, one family). The clone self-hosts **Wix Madefor Display/Text** (fontTools name tables: family "Wix Madefor Display Regular" / "Wix Madefor Text Regular", axes wght 400–800). The Session-1 identification "Vend Sans = Base44-hosted Wix Madefor" is wrong: the Wix Madefor @font-faces exist only in the live's /login css bundle (whose route renders the SYSTEM font stack — S4 measurement), while every dark-route surface renders Google's Vend Sans. Measured metric drift: canvas `measureText("Annual")` @14px = **44.31px live vs 45.37px clone** (+2.4%) — the root cause of the pricing toggle deltas (Annual pill 161 vs 165px, Monthly 92 vs 94px, wrap 275 vs 281px), the D19 Pro-card +27px, the testimonials scrollWidth delta (2408 vs 2456px), and the accumulated sub-pixel drift S4 dismissed as "font-cut accumulation" | `src/fonts/*.woff2` (wrong files), `src/app/globals.css` (@font-face + font chains) | HIGH | Verified (gstatic resource entries, document.fonts weight census, fontTools names, canvas metrics, paired pill measurements) | Visual (systemic) |
| F2 | **The login card's alternate states diverge structurally from the live** (Sessions 1–4 only measured the default sign-in state). LIVE sign-up: "Back to sign in" button at TOP (`flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors -mb-2`), **H2** "Create your account" (`text-xl sm:text-2xl font-bold text-slate-900`), form `space-y-3 sm:space-y-4` with **Email + Password ("Min. 8 characters") + Confirm Password ("Re-enter password")**, "Create account" submit — **no logo chip, no subtitle, no Google, no OR divider, no forgot link, no name field**. LIVE forgot: back button at top, H2 "Reset your password", subtitle "Enter your email and we'll send you a link to reset your password", form `space-y-4 sm:space-y-5` (Email + "Send reset link") — no logo/Google/divider/"Need an account?". LIVE reset-success (never surveyed): H2 "Check your email", "We've sent password reset instructions to {email}", GREEN alert (`bg-green-50/70 border-green-200 rounded-xl` + inner `text-green-700 text-sm`): "Please check your email for the password reset link. It may take a few minutes to arrive.", "Back to sign in" (`w-full … justify-center` variant) — shown unconditionally (no user enumeration). LIVE error: shadcn Alert `div[role=alert]` (`relative w-full border p-4 [&>svg~*]:pl-7 … bg-red-50/70 border-red-200 rounded-xl`, inner `[&_p]:leading-relaxed text-red-700 text-sm`), copy "Invalid email or password" (mismatch: "Passwords do not match"), positioned **between the password field and the submit button**. CLONE today: one shared layout for all modes (logo + subtitle + Google + OR always), Name field instead of Confirm Password, wrong subtitles ("Start automating in minutes" / "We'll send you a reset link"), error = plain centered `p[role=alert] text-red-600` "Incorrect email or password." rendered AFTER the submit button, reset-success = inline notice text | `src/app/login/page.tsx` | HIGH | Verified (all states driven natively on the live; full HTML captured) | Structure + copy + interaction |
| F3 | **The keyboard focus ring is not the live's.** The live's base layer ships `* { border-color: hsl(var(--border)); outline-color: hsl(var(--ring) / .5) }` with `--ring: 290 100% 50%` — the UA default focus ring renders **violet at 50%** (measured on a focused nav link: `auto 1px rgba(213, 0, 255, 0.5)`). The clone ships an INVENTED `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px }` (renders #8624ff, 2px, offset) and no outline-color tint (the UA ring renders default white/60 on the dark canvas) | `src/app/globals.css` (base layer) | MEDIUM | Verified (computed outline both sides + the live's compiled `*{}` rule) | Visual (keyboard) |
| F4 | **Mobile-menu anchor click: the live does NOT scroll** (URL hash updates, scrollY stays 0 — a live bug; desktop nav clicks DO scroll, 3323px). The clone closes the menu and smooth-scrolls to the section (4033px at 390w) — the intended UX | `src/components/site/navbar.tsx` | LOW | Verified (paired, 3.5s settle) | **Intentional superset** — keep + document |
| F5 | **Invisible accessibility supersets** (keep + document): the clone's login inputs carry `autoComplete` attrs (email/current-password/name/new-password — the live has none) and the burger carries `aria-expanded`/`aria-label` (the live has none) | `src/app/login/page.tsx`, `src/components/site/navbar.tsx` | INFO | Verified | Superset (documented) |

Non-findings (checked, clean — dismissed with DOM evidence):

- **Reference drift**: none — text similarity 1.0000 on all 8 routes;
  headings/links identical; mobile-menu geometry byte-identical
  (panel 0,56,390×397; 7 rows @44px, exact hrefs/order).
- **Pricing at 390**: card widths/CTAs/prices identical (Free $0 "Get
  Started Free", Pro $39 annual-default "Start Pro Trial", Enterprise
  "Contact Sales" — no $ price either side); the 6px toggle-wrap delta is
  the F1 font metrics (same classes both sides).
- **Testimonials strip**: identical container
  (`flex gap-6 overflow-x-auto overflow-y-hidden scroll-smooth
  [&::-webkit-scrollbar]:hidden`), no snap, no running animations;
  scrollWidth delta = F1.
- **Newsletter form**: browser-level `type=email required` validation blocks
  invalid submits identically (no request either side); the clone's
  persisting superset (role=status feedback) unchanged.
- **Post-login live state** (operator credentials still valid): lands on `/`,
  identical chrome, Get Started → #pricing, Dashboard → `/checkout` (still
  SPA-404 — the D1 superset remains valid); no logout control on the landing.
- **Login focus ring on inputs**: white 2px + slate-400 4px shadows and
  slate-50/50 bg — D6-identical both sides (oklab spelling).
- **Bare-border audit**: every `border` width class in the clone carries an
  explicit color utility — porting the live's universal border-color default
  is cascade-safe.

---

## 2. Remediation ToDo (executed in order, TDD)

### R1 — The authentic Vend Sans (F1)

1. **RED:** extend `tests/e2e/brand-parity.spec.ts` with a typeface block:
   (a) a focused nav link's computed font-family chain is exactly
   `"Vend Sans", sans-serif` (the live's chain — the clone today appends
   `"Vend Sans Text", ui-sans-serif, …`); (b) the pricing Annual pill
   measures 159–163px at 1440 (today 165); (c) canvas
   `measureText("Annual")` at `14px "Vend Sans"` is 43.8–44.8px (today
   45.37); (d) `document.fonts` exposes NO "Vend Sans Text" family (today
   it does).
2. **GREEN:** replace the two Wix Madefor files with Google's authentic
   variable subsets — `src/fonts/vend-sans-latin.woff2` +
   `src/fonts/vend-sans-latin-ext.woff2` (36,288 + 11,984 bytes, from
   `fonts.gstatic.com/s/vendsans/v1/…`, license: Google Fonts OFL terms);
   rewrite the @font-face blocks (family "Vend Sans", `font-weight: 300 700`,
   the exact Google latin/latin-ext unicode-ranges, `font-display: swap`);
   delete the "Vend Sans Text" family + its file; set `--font-heading` /
   `--font-body` to `"Vend Sans", sans-serif` (the live's `:root` chain).
3. **VERIFY:** pins green; re-measure the toggle (161/92/275), the Pro card
   (D19 expected to close → ~540px), the testimonials scrollWidth; full e2e
   suite (the existing font pins keep passing — first face unchanged).

### R2 — Login alternate states to the live's measured structures (F2)

1. **RED:** new e2e block (extend `tests/e2e/pages.spec.ts` login section or
   the brand-parity suite):
   - sign-up state (click "Need an account? Sign up"): heading is an **h2**
     "Create your account"; NO h1, NO "Continue with Google", NO "or"
     divider, NO logo "S" chip; fields = email + password (placeholder
     "Min. 8 characters") + confirm (placeholder "Re-enter password"); a
     "Back to sign in" button exists; NO "Name" field.
   - forgot state: h2 "Reset your password"; subtitle "Enter your email and
     we'll send you a link to reset your password"; "Send reset link"
     submit; NO Google/divider; "Back to sign in" present.
   - error state (native fill, wrong password): a `div[role="alert"]` whose
     class contains `bg-red-50/70` and `border-red-200`, text
     "Invalid email or password", and it renders BETWEEN the password
     input and the submit button (DOM order pin).
   - mismatch (sign-up, differing passwords): alert text
     "Passwords do not match".
   - reset success (forgot + valid email submit): h2 "Check your email",
     the submitted address rendered, a green alert (`bg-green-50/70`,
     `border-green-200`) reading "Please check your email for the password
     reset link. It may take a few minutes to arrive.", and a full-width
     "Back to sign in".
2. **GREEN:** rebuild `src/app/login/page.tsx` per-mode layouts with the
   measured classes (back-button/h2/form stack for signup+forgot; the
   shadcn-style alert banners; exact copy; submit-button copy unchanged).
   Keep the functional supersets: real register/login APIs (signup maps
   email+password+confirm → the register API — confirm is client-validated
   with the live's "Passwords do not match" copy), the forgot flow shows
   the live's unconditional success view (the live itself never enumerates
   and has no visible mail guarantee; the clone's no-mail-transport
   deviation stays documented in the PAD's deviations ledger), the
   autoComplete attrs (F5).
3. **VERIFY:** pins green; screenshots of all four states; the auth.spec
   round-trip still green (register now needs confirm — update its helper);
   rate-limit discipline (one wrong-password attempt per run).

### R3 — The live's focus-ring base rule (F3)

1. **RED:** e2e pin: on `:focus` (programmatic) of a nav link the computed
   `outline-color` is `rgba(213, 0, 255, 0.5)` (accept the oklab spelling);
   on keyboard focus (`Tab`) the outline-style is the UA default `auto`
   (NOT `solid`) — i.e. the invented rule is gone.
2. **GREEN:** in `globals.css` base layer, replace
   `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px }`
   with the live's universal rule:
   `* { border-color: var(--color-border); outline-color: rgb(213 0 255 / 0.5) }`
   (violet = hsl(290 100% 50%) at 50%, the live's `--ring` value; the
   border-color half is the live's cascade default — verified cascade-safe
   in §1's bare-border audit).
3. **VERIFY:** pin green; keyboard Tab sweep screenshot; the FAQ/login
   focus-dependent specs still green.

### R4 — Full re-verification + docs + handoff

1. Gate: `npm run lint` → `npm run typecheck` → `npm run test` →
   `npm run build` → `./scripts/smoke-test.sh` (38/38) → `npm run test:e2e`
   (all green incl. the new pins).
2. Paired re-survey: pill/toggle/Pro-card/testimonials metrics, the four
   login states, focus rings, mobile menu; VLM full-page + login pair.
3. Docs: PAD (§5.2 fonts, §5.4 ledger D19 resolution + new supersets D21
   [mobile-menu scroll], D22 [autocomplete/aria supersets], D23 [auth-file
   swap provenance], §5.5 trap 9 "trace the font's actual bytes"), AGENTS
   (gotcha 16: fonts), CLAUDE (session-5 context), README (fonts section),
   `saas-company_SKILL.md` (§2 stack, §4 design system, §12 lessons).
4. Screenshots refresh (pricing default, login ×4 states, mockup, navbar
   light mode, mobile menu, hero).
5. `.env.example` re-verify (no env changes expected); worklog; commit
   (`:bug: fix:` / `:memo: docs:` on `main` only) → SSH push via
   `docs/ssh_git_wrapper_v3.py`.

---

## 3. Validation of this plan against the codebase (pre-execution review)

| Plan reference | Codebase check | Result |
|----------------|----------------|--------|
| F1 font surface | `globals.css` L32-48: two @font-face blocks (Vend Sans + Vend Sans Text, both `font-weight: 400 800`, both `src: url("../fonts/*.woff2")`); font chains at L81-82 append "Vend Sans Text" + system stack; fontTools confirms both files are Wix Madefor (axes 400-800); the live's chains: `--font-heading/--font-body: "Vend Sans", sans-serif` (extracted from its compiled `:root` this session) | Aligned |
| F2 login surface | `login/page.tsx` read: single shared layout, `heading`/`subheading` per mode, Name field when signup, error/notice `<p>` after the submit button, "Forgot password?"/"Need an account?" row at the bottom; `auth.spec.ts` register flow uses name+email+password (needs the confirm-field update); no e2e pins the alternate-state structure (grep: pages.spec pins only the default-state anchors) | Aligned |
| F3 focus surface | `globals.css` L135-138: the invented `:focus-visible` rule; no universal outline-color; the live's rule extracted from its compiled css (`*{border-color:hsl(var(--border));outline-color:hsl(var(--ring) / .5)}`); `--color-border: #242424` exists (the same value the live's `--border` resolves to) | Aligned |
| F4 superset | `navbar.tsx` mobile-menu onClick closes the menu and lets the anchor scroll (Lenis smooth); no e2e pins scroll-yness of the live (untestable); document-only | Aligned |
| Test-pin safety | brand-parity font pins assert the FIRST face ("Vend Sans") — unaffected by the chain tail change; the login-theme pins assert /login's system-font body (the route style keeps overriding) — unaffected; mobile-navigation pins are geometry-only — unaffected; auth.spec's register helper needs a mechanical update (confirm field) | Aligned |
| skills/ exclusion | tsconfig `exclude`, eslint `ignores`, vitest `include`, playwright `testDir` — all still exclude `skills/` (re-verified this session) | Aligned |

**Risk assessment:** R1 is the highest-leverage change (the font reflows
every text surface) but is a pure asset+declaration swap — the e2e suite
pins the visible geometry (mobile rows 44px, toggle classes, card classes)
and the VLM pass guards the rest; D19's resolution is the expected
side-benefit. R2 is confined to one client component + its specs; the API
contract is untouched (register keeps accepting name — the client sends
`name: ""`-equivalent or the email local-part; confirm is client-side).
R3 is a base-layer rule swap guarded by its own pin. No schema, API, auth,
or dependency changes. Rollback = revert the commit (single push).

**Execution order rationale:** R1 first (its reflow may shift every
measurement taken after it), then R2 (the biggest structural surface),
then R3 (a one-rule swap), then the single verification + handoff pass
(R4). Every RED is observed failing before its GREEN.
