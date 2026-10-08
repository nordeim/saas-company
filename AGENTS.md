# AGENTS.md — SAAS Company (NovaAI)

Single Next.js 16 App Router application cloning the reference dark-theme
SaaS marketing site (`saas-company.base44.app` — "NovaAI") with a functional
superset: real cookie-session auth, a persisted workflow dashboard, a working
newsletter/demo-capture API, and SEO surfaces. Stack: React 19, TypeScript
strict, Tailwind CSS v4 (CSS-first — no `tailwind.config.*`), Prisma 6 +
SQLite at `db/custom.db`, Vitest + Playwright. Clone remote:
`https://github.com/nordeim/saas-company.git`; pushes go to the SSH remote
via `docs/ssh_git_wrapper_v3.py`.

## Commands

| Task | Command |
|------|---------|
| Install | `npm install` |
| Dev server (port 3000) | `npm run dev` |
| Production build | `npm run build` |
| Production server | `npm run start` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Unit tests (126 checks) | `npm run test` |
| Browser E2E (197 checks; needs a build) | `npm run test:e2e` |
| Prisma client after schema change | `npx prisma generate` |
| Recreate DB from schema | `npm run db:push` |
| Seed demo workspace | `npm run db:seed` |
| End-to-end smoke suite (65 checks) | `./scripts/smoke-test.sh` (needs `npm run build` first) |

**Gate order before every push:** `npm run lint` → `npm run typecheck` →
`npm run test` (126/126) → `npm run build` → `./scripts/smoke-test.sh` (65/65)
→ `npm run test:e2e` (197/197) — 388 checks across three layers (boots the standalone server on :3100 against its own
`db/e2e.db`, `AUTH_RATE_LIMIT_MAX=50`, `GENERATE_RATE_LIMIT_MAX=50`). There is no hosted CI; the local gate is the only gate.
`next.config.ts` sets `ignoreBuildErrors` — the explicit `typecheck` step is
what catches type errors; never skip it.

First-run setup: `npm install && cp .env.example .env && npm run db:push &&
npm run db:seed && npm run dev`. Demo login: `demo@novaai.app` /
`Demo1234!`.

## Gotchas (verified the hard way)

1. **The exported-`DATABASE_URL` trap.** A shell-exported absolute
   `DATABASE_URL` overrides the repo `.env` for the Prisma CLI **and** the
   Next runtime — the server silently opens a foreign database file (the
   historical 12/30 smoke failure). `scripts/smoke-test.sh` and
   `playwright.config.ts` PIN their own `DATABASE_URL` per command; keep that
   discipline in every script that boots a server or runs Prisma.
2. **Relative `file:` URLs are schema-anchored.** `DATABASE_URL` in `.env` is
   `file:../db/custom.db`, which resolves against `prisma/schema.prisma` for
   the CLI and against the same anchor at runtime via `src/lib/db-path.ts`
   (unit-tested by `tests/db-path.test.ts`). One string → one file:
   `<repo>/db/custom.db`. The `db/` folder sits at the repo root and is
   git-ignored (`db/*.db`).
3. **Tailwind v4 is CSS-first.** Tokens live in `src/app/globals.css` under
   `@theme` — never add a `tailwind.config.*` or the `@config` bridge. Two
   v4 traps are load-bearing here: theme vars must be FULL color values
   (bare HSL triplets resolve to transparent), and `button,
   [role="button"] { cursor: pointer }` is set in the base layer because v4's
   preflight sets no pointer. See `docs/Tailwind-V4-Validation-Report.md`.
4. **v4 serializes `bg-white/10`-style colors through `oklab()`** —
   rendering-identical to the reference's rgba strings but
   computed-string-different. E2E assertions accept either spelling (see the
   mobile-navigation spec comments); never "fix" the CSS to chase byte-parity.
5. **The UI font is GOOGLE's "Vend Sans"** (variable wght 300-700),
   self-hosted as the two gstatic subsets in `src/fonts/` — the SAME bytes
   the live serves (`fonts.gstatic.com/s/vendsans/v1/…`, traced via
   performance entries in Session 5). Session 1 misidentified it as
   "Base44-hosted Wix Madefor" (the Wix faces are declared only in the
   live's unused login-bundle css) and the wrong metrics (+2.4% glyph
   width) drifted every text surface for four sessions. Never trust a
   font's NAME — trace its bytes.
6. **The reference ships INERT classes** — its markup carries utilities
   its compiled css never emits (the pricing Pro card's `scale-[1.02]
   md:scale-105` renders UNSCALED: `scale: none`, 540px at every width).
   Match the RENDERED computed style, not the class string; v4 here WOULD
   emit those utilities (540×1.05 = the old 567px D19 delta).
7. **The reference is a moving target.** The live app at
   `saas-company.base44.app` has been redeployed with different products
   across this repo's history (the previous cycle cloned a PM workspace
   called ORBITAL). Visual parity was re-measured against the CURRENT live
   (dark NovaAI marketing site); the measurements live in
   `Project_Architecture_Document.md` §5 and the e2e pins.
8. **Rate limits are per-process.** Auth endpoints throttle 10
   attempts/IP/15 min (in-memory `src/lib/rate-limit.ts`; override with
   `AUTH_RATE_LIMIT_MAX` — the Playwright webServer pins 50 because the
   suite's own ~10 UI sign-ins share one IP and one process with the
   limiter; at the default they sat at EXACTLY the budget — Session 11
   saw one extra signed-in spec trip a mid-suite 429 that broke an
   unrelated pin).
9. **Dependency overrides are load-bearing.** `package.json` pins
   `overrides` for `braces`/`micromatch`/`fast-glob`/`deepmerge-ts` — the
   patched transitive versions for advisories whose parents haven't shipped
   fixes (the residual `braces` GHSA-vfj7-8cjw-p6xm covers every published
   version; lint-toolchain-only — see the remediation plan F10). Never run
   `npm audit fix --force` here: it would downgrade `eslint-config-next`
   16→14 to silence a dev-time advisory.
10. **`/dashboard` is session-gated** (`redirect("/login?from_url=/dashboard")`)
   — expect 307 for anonymous requests; the smoke suite pins both the 307
   and the cookie'd 200.
11. **The reference ships TWO token blocks — `:root` and `.dark`.** The app
   never mounts `.dark`, so `:root` is what renders: primary = hsl(267 100%
   57%) = #8624ff, accent/electric-blue = hsl(220 100% 50%) = #0055ff, while
   `violet` (the magenta used by text/border/bg-violet) = #d500ff. Session 1
   read the `.dark` block and shipped the wrong primary/accent for two
   sessions — the Session-3 audit fixed it (see
   `docs/remediation-plan-session3.md` F1/F2).
12. **Arbitrary aspect ratios use the SLASH (`aspect-[16/9]`), never the
   colon spelling** — writing the ratio with a colon inside the brackets
   emits the invalid `aspect-ratio: 16:9` into the compiled CSS and postcss
   fails the whole build with an opaque `CssSyntaxError … Missed semicolon`
   at a flattened column. Worse: Tailwind's scanner reads class candidates
   from MARKDOWN too — documenting the colon spelling in a .md file breaks
   the build just like using it in a component (docs/ is `@source not`-ed
   in globals.css for exactly this reason; Session 4 hit both).
13. **The reference's /login loads its OWN css bundle** (light `:root`, body
   white + zinc-950 + the system font stack) — the login route swaps the
   body theme via a route-scoped `<style>` in `login/page.tsx`; every other
   route keeps the dark theme. Also: the reference's compiled `space-y-*`
   puts the gap on the FOLLOWING sibling (v3-style) — v4's
   margin-bottom-on-preceding is lost on inline labels (the login form)
   AND is cancelled by the alternate-states' back-button `-mb-2`, so the
   route style restores that pattern inside forms (`.space-y-1\.5`) and
   the auth stack (`.auth-stack` / `.auth-stack-sm6`). The card's
   ALTERNATE states (sign-up / forgot / reset-success) use a DIFFERENT
   layout from the default: back-button + h2 + form, NO logo chip,
   NO Google button, NO OR divider, and shadcn-style alert banners
   (bg-red-50/70 / bg-green-50/70) rendered BETWEEN the last field and
   the submit button — measured in Session 5, pinned by
   `tests/e2e/login-states.spec.ts`.
14. **The navbar is section-aware and never gains a background.** It is
   `bg-transparent` at every scroll depth (no scrolled-glass bar); a
   scroll-spy highlights the section in view (last section whose top passed
   the ⅔ viewport line) and the chrome swaps to black variants while the
   nav band overlaps `[data-nav-theme="light"]` sections (the white
   features section). Pinned by `tests/e2e/navbar-behavior.spec.ts`.
15. **The dashboard mockup LOOPS — never re-add the skeleton-wave shimmer,
   and never trust a CSS-property census against a JS animation engine.**
   The live pulses the ambient `-inset-32` glow (scale 1→1.15→1 + opacity
   .3→.5→.3, 4s), the red chrome dot (scale 1→1.2→1, 2s), the four list
   dots (same, staggered delay:i*.1), the under-glow (y 0→−12→0 + opacity
   .3→.5→.3, 3s — a SIBLING of the card, unclipped, rendered UNCENTERED:
   its framer transform kills the `-translate-x-1/2`, pinned via
   `translate-none`), and the One-Platform mini-dashboard's skeleton
   shapes (opacity pairs at 3s with delays) — reproduced as the measured
   `animate-mockup-*`/`animate-skel-*` keyframes in globals.css. The list
   dots keep their SOLID `bg-primary/80` fill (never re-add the
   `skeleton-wave` shimmer: as an UNLAYERED class it overrides the layered
   `bg-primary/80` utility). Session 4's "the mockup is completely
   STATIC" census was an artifact: framer writes inline styles per frame,
   so `animationName` reads `none` on an element that is mid-loop — survey
   motion by sampling VALUES over time (see PAD §5.5 trap 16). The pricing
   toggle defaults to ANNUAL (Pro $39/mo annual, $49/mo monthly — the $39
   Session 1 read was the annual price).
16. **Hover-state probes need REAL pointer events** (Session 6) — an
   agent-browser `mouse move` reported `:hover` matching while no hover
   utility applied (a false negative Playwright's real `page.mouse.move`
   disproved — the Get Started pill's shimmer was working all along).
   Related: the live's arrow slide renders v3 `transform: matrix(1,0,0,1,2,0)`
   while v4 emits `translate: 2px` — compare RENDERED geometry, not the
   property name.
17. **The reference's `<head>` is per-route** (Session 6): content routes
   ship og:title = the page title, description = "X on SAAS Company. …",
   and og:url = canonical = the route (implemented here through
   `src/lib/seo.ts` + per-page `routeMetadata` exports; `/og-image.png`
   is the WORKING replacement for the live's dead og:image URL). Do NOT
   re-add `theme-color` or `viewport-fit` — the live ships neither.
18. **The live's mobile burger is pointer-blocked by its own empty toast
   portal** (fixed top-0 z-[100], 390×32, pointer-events auto — a JS
   click opens the live's menu, a real tap cannot; D32). The clone keeps
   the WORKING burger; never "fix" it toward the live's broken state.
19. **The reference's SPA bundle DOUBLES the tracking scale** (Session 7):
   `tracking-wider` renders 0.1em and `tracking-widest` 0.2em on the live
   — the overrides live in globals.css `@theme`
   (`--tracking-wider`/`--tracking-widest`), while the live's LOGIN bundle
   keeps the standard scale (pinned back in the login route's scoped
   `<style>`). Never "simplify" either side — the divergence is the
   reference's own two-bundle reality.
20. **Breakpoint-mounted chrome needs a resize guard** (Session 7): the
   mobile menu mounted below `md` and hidden above it kept its state (and
   the body scroll-lock) alive when the viewport crossed 768 — the
   `matchMedia("(min-width: 768px)")` close-on-match listener in
   `navbar.tsx` is load-bearing for resize/rotate flows.
21. **The scroll entrances are rAF-driven, NOT CSS transitions** (Session 8):
   the reference uses framer-motion (per-frame inline opacity/transform
   writes, easeOut cubic-bezier(0,0,0.58,1), per-element params); the
   `Reveal` component re-implements it via `src/lib/motion.ts`. Never add
   `transition-*` classes to entrance wrappers — on children that carry
   their own `transition-colors` the cascade SNAPS the entrance and
   corrupts the child's hover timing (the Session-8 F1 bug). The
   per-element parameter table lives in `docs/remediation-plan-session8.md`.
22. **v4 ships THREE more engine shifts beyond oklab** (Sessions 7–8): the
   tracking scale (the live's config doubles the two widest steps —
   `@theme --tracking-*`), the shadow-scale rename (v3 shadow-sm → v4
   shadow-xs — pinned via `--shadow-sm`), and the line-height cascade
   (v3's responsive `text-*` beats `leading-*`; v4's `--tw-leading` always
   wins — pinned per-element via `--tw-leading: initial`). Survey the
   ENGINE layer (computed values + the emitted rules), not just class
   strings — every one of these hid from class-string parity for 6+
   sessions.
23. **v4's default palette is OKLCH-DEFINED — the roundtrip drifts from
   v3's hex** (Session 9): up to 69 RGB units off (green-400; the stars'
   yellow-400, the problem cards' reds, the avatar gradient endpoints,
   every login slate drifted). The pins live in `globals.css` `@theme`
   (`--color-<family>-<shade>: <v3 hex>` — 31 tokens). Never "simplify"
   them back to v4 defaults, and never trust a color assertion that
   accepts both spellings without comparing VALUES. Related v4
   token-emission trap: `ring-ring` reads `--color-ring` (a legacy
   `--ring` HSL variable is NOT the emission path — without the @theme
   token the utility never emits and the ring falls back to currentColor),
   and v4 emits ring-ring AFTER ring-slate-400, so elements carrying both
   need the `input:focus:focus-visible` cascade nudge in the utilities
   layer. The live also ships NO `::selection` rule (ours was an
   invention, removed) and pins `/login` `html { overscroll-behavior-y:
   none }` + a light `--border` (both reproduced route-scoped).
24. **A JS animation engine is INVISIBLE to a CSS-property census**
   (Session 10): framer-motion writes inline `transform`/`opacity` per
   frame, so an element can be mid-loop while `getComputedStyle()
   .animationName` reads `none` — the Session-4 "static mockup" verdict
   shipped static for six sessions while the live pulsed eight loop
   groups. Survey the LOOP layer by sampling computed VALUES across
   multiple rounds after entrances settle AND by extracting the
   `animate:{…}`/`transition:{…}` configs from the live's JS bundle.
   Related: framer's inline transform REPLACES v3's `--tw-translate-*`
   composition (the live's under-glow renders un-centered) — v4's
   `translate` property is SEPARATE from `transform`, so reproducing that
   geometry needs an explicit `translate-none` (PAD §5.5 trap 16).
25. **A statically-prerendered CLIENT component cannot render route state
   at SSR — and `usePathname()` settles to the INTERNAL route id on
   404s** (Session 11): the not-found page shipped React #418 on EVERY
   unknown route (the prerendered HTML quoted `"_not-found"` while the
   hydration render carried the real URL — a text mismatch by
   construction), and post-settle `usePathname()` returns `/_not-found`,
   not the browser URL. The pattern: a `useSyncExternalStore` mount gate
   (server snapshot false) reading `window.location.pathname` — pinned
   by `tests/e2e/hydration.spec.ts`. Sweep the CONSOLE layer (pageerror)
   on every route — a clean render can still ship a broken hydration.
   Related Session-11 lessons: sample TRANSITIONING properties to
   settled (the ring pin's fixed-200ms mid-flight samples + its
   blind-Tab×4 focus misses made the gate itself flaky — poll, and
   tab-until-focused), and alpha composites through ANCESTOR opacity
   (the paused cards' `opacity-80` turned `text-white/50` into effective
   white/40 — audit the EFFECTIVE alpha, not the class; the clone-only
   axe violations on `/`, `/faq`, and the 404 are LIVE-PARITY — D63,
   not bugs to fix).
26. **React Float auto-preloads eager `<img>`s rendered in the SSR shell —
   and the Next.js router's RSC prefetch INJECTS those head links into
   every route that links to the page** (Session 12): the Gasparyan
   logo's automatic `<link rel="preload" as="image">` traveled from the
   landing into /faq, /privacy, /terms, /accessibility, /refund-policy,
   and /dashboard (the navbar's logo `<Link href="/">` prefetch), where
   the image never renders — a console "preloaded but not used" warning
   + a wasted fetch on six routes. `loading="lazy"` suppresses the
   emission entirely (pinned by `tests/e2e/resource-hygiene.spec.ts` +
   the smoke static-HTML pin). Audit `<link rel="preload">` on EVERY
   route, not just the page that owns the resource. Related Session-12
   lessons: fault-inject the network (`page.route(...abort())`) before
   trusting a happy path — the dashboard's pause/delete/sign-out carried
   NO catch and surfaced `TypeError: Failed to fetch` pageerrors with
   zero user feedback (now banners — `tests/e2e/resilience.spec.ts`);
   and before believing a mid-verification regression, verify the server
   serves the CURRENT build — compare the served HTML's CSS chunk
   filename against `.next/standalone/.next/static/chunks/` on disk (a
   ZOMBIE server on :3000 serving a stale build whose CSS chunks were
   deleted renders UNSTYLED: links concatenate in innerText and word
   parity collapses; the Playwright/smoke suites are immune — they boot
   their own servers).
27. **A 401 is not a network fault — failure CLASSES need distinct UI
   contracts; and ship `error.tsx`/`global-error.tsx` before you need
   them** (Session 13): a cookie-expired session makes every dashboard
   mutation 401 — and "Try again." banners LIE (each retry 401s forever).
   The honest contract is the server gate's own: redirect to
   `/login?from_url=/dashboard` (the `apiFetch` wrapper in
   `dashboard-app.tsx`; pinned pairwise against the abort-banner class
   by `tests/e2e/session-lifecycle.spec.ts`). Likewise a render fault
   (malformed API data — a row with `runs: null` passes the
   `Array.isArray` envelope guard and crashes the article template) must
   surface the BRANDED boundary (`src/app/error.tsx`), never Next.js's
   default "This page couldn't load" page — the app loses its identity
   exactly when the user is already having a bad day (pinned by
   `tests/e2e/error-boundary.spec.ts`; pin the boundary with a
   route-fulfilled contract violation, not a synthetic throw). Related:
   Escape-closing the mobile menu must RETURN FOCUS to the burger
   (`burgerRef`) — the focused link unmounts with the panel and
   `activeElement` falls to `body`, stranding keyboard users (WCAG
   2.4.3).
28. **Audit REACHABILITY, not just behavior — and success is a
   message class too** (Session 14): grep every API route for a UI
   consumer BEFORE calling it a shipped feature — `POST /api/demo`
   shipped complete (validation + rate limit + model) with ZERO
   consumers: dead code dressed as a superset. A feature unreachable
   from any URL is not a feature (`/demo` is its front half — D73).
   Likewise `/login` must redirect ALREADY-authenticated visitors to
   the workspace (D74) — and NOTE: any script or spec that signs in and
   then revisits `/login` will hit the redirect (the screenshot
   refresh script's re-sign-in blocks had to navigate to `/dashboard`
   directly). And successful mutations need STATUS MESSAGES (WCAG
   4.1.3): errors alert (`role="alert"`), successes confirm politely
   (a sr-only `role="status"` `aria-live="polite"` region — D75) —
   pre-fix the dashboard had zero live regions; a screen-reader user's
   actions changed the stats in total silence. Related: computed
   `animation-duration` for sub-millisecond values serializes in
   SCIENTIFIC NOTATION ("1e-05s" for the authored 0.01ms clamp) —
   compare parsed milliseconds, never the string; and the browser's
   own 404-document resource log is inherent noise on BOTH sides (the
   live's 404 ships two 401s — the D68 parity family).
29. **Guard WHERE a user-controlled redirect can ship the browser — and
   a hang is not a failure** (Session 15): any query param that becomes
   a post-auth `router.push` target is an OPEN REDIRECT (CWE-601) until
   proven otherwise — `/login?from_url=https://evil.example/phish`
   genuinely shipped the just-authenticated browser off-site (the
   network log carried `?_rsc=…`). The guard (`safeRedirectPath`):
   prefix checks + a WHATWG dummy-origin re-parse; only same-site
   absolute paths survive (D76). Likewise the HANG class: ADR-004's
   degrade-not-fail covers SDK FAILURES, not hangs — a black-holed
   `await` blocks the request forever with the UI's busy guard
   engaged; every external await needs a timeout that RESOLVES with
   the fallback (a hang is a degrade condition; a rejection still
   propagates — D78). And survey the DOCS-TRUTH layer: README promised
   `Retry-After` on 429s that no route emitted (D79) — pin what the
   docs claim. Related traps this session: the Bash output layer can
   SWALLOW `[m`-style character pairs from file contents (a
   `const [mode, setMode]` line DISPLAYED as `const ode, setMode]` —
   looked like a syntax error while tsc/esbuild/build were all green;
   hex-dump before believing a "corrupt" file), and the
   chunk-against-disk zombie check is BLIND when only JS changed (the
   CSS chunk name is content-hashed and the CSS was untouched — the
   old process served fresh static HTML from disk with its own stale
   hydrated JS; when ps//proc are process-blind, move the survey to a
   FRESH PORT with a fresh boot instead of trusting a reboot).
30. **Rate-limit the expensive endpoint, not just the sensitive ones —
   and probe authenticated APIs through the PAGE, not `page.request`**
   (Session 16): auth/newsletter/demo were all limited while
   `/api/workflows/generate` — the ONLY endpoint that costs real money
   per call — was unlimited (the probe drove 15/15 rapid authenticated
   POSTs all 200 in 8.1s). The fix keys the bucket PER-USER
   (`gen:${userId}` — the route is authenticated; an IP-keyed bucket
   would make a shared-egress office share one abuser's budget),
   overrides via `GENERATE_RATE_LIMIT_MAX` (the AUTH_RATE_LIMIT_MAX
   pattern), and keeps the CLIENT contract untouched: compose()'s
   `genRes.ok` degrade means a 429 still creates the template workflow
   — the feature never hard-fails, the limiter only caps the LLM spend
   (D80). The envelope also now carries `Cache-Control: private,
   no-store` at the ok()/fail() seam (Next protects dynamic PAGES with
   no-store but NOT route-handler JSON — D81), and
   `poweredByHeader: false` drops the X-Powered-By banner the live
   doesn't ship (D82). Survey-tooling traps: Playwright's
   `page.request` (APIRequestContext) REFUSES to send `Secure` cookies
   over plain http while Chromium page navigations treat 127.0.0.1 as
   trustworthy and DO send them — authenticated API probing must go
   through in-page fetches after a navigation; and after an API
   register, navigate DIRECTLY to the target page (a `/login` visit
   hits the S14 authenticated gate and redirects). Also: the DEV
   `db/custom.db` can DRIFT across sessions of probe traffic
   (S12–S15's pauses accumulated until every seeded workflow was
   paused — the resilience screenshot's Pause-button locator found
   nothing); re-seed with `npm run db:push && npm run db:seed` when a
   survey depends on the canonical workspace (e2e/smoke are immune —
   they boot fresh DBs).

31. **Identical envelopes can still leak through LATENCY — and a crashed
   script orphans its servers (Session 17).** The login 401 was
   byte-identical for unknown-email and wrong-password, but the unknown
   path SKIPPED scrypt: ~3.5ms vs ~34ms — a 9.8x median delta that
   enumerates registered addresses at 1,440 candidates/day/IP even under
   the rate limit (CWE-208). The fix pattern: burn a fixed-cost dummy
   hash (`dummyPasswordHash()`) whenever the lookup misses — the response
   never changes, only the timing floor flattens (pinned by the suite's
   first timing pin: 7+7 curl medians, ratio < 2.5x). The same session's
   RACE class: undici's fetch pool serializes on ONE socket — probing a
   TOCTOU window (findUnique→create) needs TRUE wire-level concurrency
   (independent sockets: parallel curl processes or http.request with
   keepAlive: false); the loser's unhandled P2002 was a bare 500 with an
   EMPTY body. And the zombie-server family gained a new member: a
   SYNTAX ERROR mid-script aborts bash AFTER the server-boot lines but
   BEFORE the kill — the orphan then answers a later run's fresh boot on
   the same port (the EADDRINUSE is silently swallowed; the health check
   sees the STALE process serving the OLD build — the S17 closed-gate
   smoke pins read "409 EMAIL_TAKEN" instead of 403 until the port
   moved to :3220). Boot-and-kill server blocks belong at the END of a
   script block or in a trap — and give every auxiliary server its own
   port.
## Architecture invariants

- **Layering:** route handlers (`src/app/api/**`) own validation +
  persistence; views never fetch directly — the dashboard server page loads
  initial state and the client component mutates through the API envelope.
- **The envelope:** every API route returns `{ ok: true, data }` or
  `{ ok: false, error: { code, message } }` via `src/lib/api.ts` (`ok` /
  `fail` / `requireSession`). No route returns bare JSON.
- **Degrade-not-fail AI:** `/api/workflows/generate` asks
  `z-ai-web-dev-sdk` for a workflow draft and falls back to the
  deterministic template (`src/lib/workflow.ts`) on any SDK failure — the
  feature never hard-fails, and the sanitizer clamps LLM output before
  persistence.
- **Legal/FAQ content is code:** `src/lib/legal-content.ts` and
  `src/lib/faq-content.ts` carry the reference-captured copy verbatim;
  content integrity is unit-tested (`content.test.ts`).

## Git workflow

- **`main` only** — no feature branches (operator contract).
- **Commits:** Conventional Commits with emoji prefixes: `:art: feat: …`,
  `:memo: docs: …`, `:bug: fix: …`.
- **Push:** via `docs/ssh_git_wrapper_v3.py` with an externally supplied key
  (see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`) — never a resident
  `~/.ssh` dependency.
- **Never committed:** `.env`, `*.key`, `db/*.db`, `node_modules/`,
  `dev.log`/`server.log`, `tests/e2e/.auth/` (all gitignored).
