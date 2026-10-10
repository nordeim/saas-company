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
| Unit tests (200 checks) | `npm run test` |
| Browser E2E (245 checks; needs a build) | `npm run test:e2e` |
| Prisma client after schema change | `npx prisma generate` |
| Recreate DB from schema | `npm run db:push` |
| Seed demo workspace | `npm run db:seed` |
| End-to-end smoke suite (124 checks) | `./scripts/smoke-test.sh` (needs `npm run build` first) |

**Gate order before every push:** `npm run lint` → `npm run typecheck` →
`npm run test` (200/200) → `npm run build` → `./scripts/smoke-test.sh` (124/124)
→ `npm run test:e2e` (245/245) — 569 checks across three layers (boots the standalone server on :3100 against its own
`db/e2e.db`, `AUTH_RATE_LIMIT_MAX=100` — raised from 50 in Session 28
when the suite's ~45 auth flows outgrew it — `GENERATE_RATE_LIMIT_MAX=50`). There is no hosted CI; the local gate is the only gate.
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
32. **The Next.js 16 production runtime captures route-module console
   output — and `process.stderr.write` too (Session 18).** A boot-time
   diagnostic (the AUTH_SECRET warning) survived THREE channels' worth of
   silence: a module-init `console.error` executed with the login route
   answering and the log stayed empty; the instrumentation hook's
   `process.stderr.write` ran (proved by a diagnostic `appendFileSync`)
   and the log stayed empty; only `fs.writeSync(2, …)` from a STATIC
   `import { writeSync } from "node:fs"` reliably lands (a dynamic
   `await import("node:fs")` compiles to the turbopack chunk loader,
   which RACES at boot — hung on one boot, resolved on the next). Boot
   diagnostics belong in `src/instrumentation.ts` writing to fd 2
   directly. Related discoveries the same session: **`next build` COPIES
   the repo `.env` into `.next/standalone/`** (an unset-in-shell
   AUTH_SECRET is still SET from the copied file — probe the standalone's
   OWN `.env` when testing env-dependent boot behavior), and the
   `kill $PID; wait $PID` pattern proved UNRELIABLE in this sandbox (the
   :3030/:3033/:3044 zombies) — the parity battery's collapse to 0.0000
   with concatenated words is the zombie's gotcha-26 signature; prefer
   FRESH PORTS per boot-and-probe cycle.
33. **Catching an error REMOVES Next's log line — a wrapper must restore
   the operator's sight itself (Session 19).** Next.js logs UNhandled
   route errors (the Prisma stack + digest in the server log); the moment
   a wrapper catches the error to answer the INTERNAL_ERROR envelope, the
   stack VANISHES from the log — the catch must re-log via the fd-2 seam
   (`writeSync(2, …)`, the gotcha-32 channel) or the operator is blind to
   exactly the failures the wrapper now handles. Related traps the same
   session: **`redirect()` inside a try/catch is swallowed** — it throws
   a control error (NEXT_REDIRECT) that a page-level catch converts into
   the degraded view, silently breaking the authenticated gate (keep
   redirect calls OUTSIDE error catches — two narrow blocks beat one
   wide one); and **pass the base URL EXPLICITLY to every probe script**
   — a survey script that DEFAULTS its probe port silently evaluated a
   zombie serving a stale build while its runner booted a healthy fresh
   server on a different port (the "collapsed" parity was the tooling,
   not the build; diagnosed by CSS-links-vs-disk + counting
   stylesheets-in-Chromium, then re-probed on the verified port).
34. **The FRAMEWORK answers unexported methods with bare 405s — the
   method layer sits BELOW every handler (Session 20).** A GET on a
   POST-only route never reaches the handler or its `apiRoute` wrapper:
   Next.js itself answers `405` with an EMPTY body, NO content-type, NO
   `Allow`, NO cache-control (probed across 11 method-mismatch requests —
   the security-header set from `next.config.ts` DOES cover framework
   answers; only the envelope layer is absent). The fix is guard
   exports: `export const GET = methodGuard("OPTIONS, POST")` per route
   file claims the unimplemented methods for the envelope (the RFC 9110
   §15.4.6 `Allow` header arrives free via the `fail()` seam). Related
   discoveries the same session: **an explicit `OPTIONS` export replaces
   Next's auto-answer** (204 + Allow — the auto-answer enumerates EXPORTS
   and would over-report once guards exist); **POST/PATCH route handlers
   buffer the full body at `request.json()` with no framework ceiling**
   (a 50MB login body was fully parsed in 314ms — read the DECLARED
   `content-length` BEFORE the parse: the `bodyTooLarge` guard rejects
   128KB+ bodies at the header, 91ms, nothing buffered; chunked bodies
   without a declaration are the proxy's residual to cap — DEPLOYMENT.md
   §2); and **a raw-fetch word-parity probe of the LIVE reads the
   un-hydrated SPA shell** (every route "collapses" to ~130 words — the
   honest comparison renders BOTH sides in Chromium and diffs
   `document.body.innerText`; the same class: the live's `/dashboard`
   server-status is 200 for ANY route — the SPA 404 is the RENDERED
   content, adjudicate on what the client sees).
35. **Cap the OUTPUT side too — and pair every list ceiling with honest
   aggregates (Session 21).** S20 capped what a request may CARRY (the
   128KB input ceiling); the OUTPUT side was unbounded: `GET
   /api/workflows` had no `take` (probed: a 400-workflow user's GET
   answered a 134.5KB body, the dashboard mounted 400 article cards —
   9,649 DOM nodes — while the runs chart sliced to 8; the LIST rendered
   everything). The fix rides SQL `take: MAX_WORKFLOW_LIST` (the
   wire-level cap, not a client slice) AND moves the stat cards to
   server-side aggregates shipped as the envelope's additive `meta`
   sibling — because a capped list without honest aggregates silently
   turns the four stat cards into subset summaries (a ceiling that lies
   is worse than no ceiling). The `meta` field is strictly OPTIONAL in
   the client (the e2e error-boundary mocks fulfill with bare arrays and
   must keep working). Related discoveries the same session:
   **`POST /api/workflows` was the ONLY unthrottled mutation** (auth,
   newsletter, demo, generate all carry limiters — a script minted
   unbounded rows with one tiny JSON POST each; now `workflowRateLimit`,
   30/USER/15min, `WORKFLOW_RATE_LIMIT_MAX` override);
   **Playwright's `context.cookies(url)` filters SECURE cookies on plain
   http** — 127.0.0.1 is trustworthy for NAVIGATION (the cookie is sent)
   but cookie ENUMERATION with a URL argument drops it; enumerate with
   `context.cookies()` (no args) and match by name (the gotcha-30
   family); and **a `setsid`-detached survey server OUTLIVES its
   diagnostic session** — the next runner's fresh boot on the same port
   hits a silently-swallowed EADDRINUSE and probes the STALE build (the
   gotcha-26/31 family's fourth member — kill detached servers
   explicitly, or probe on fresh ports).

36. **Race the WRITE, don't check-then-write — and pin the ownership at
   the wire (Session 22).** S17 closed CREATE's race (P2002 → the 409
   classifier); the `[id]` PATCH/DELETE routes still ran
   read-check-act (`findFirst` → parse → `update`/`delete` by bare id):
   a DELETE committing while a slow under-ceiling PATCH body parsed threw
   UNCLASSIFIED P2025 → the 500 INTERNAL_ERROR envelope for a legitimate
   two-tab user (probed 3/3; the parallel DELETE double-fire hit 500 in
   2/5 — nondeterministic). The fix carries the ownership predicate IN
   the write (`updateMany`/`deleteMany` with `userId` in the WHERE;
   count 0 → the honest 404) — closed by construction, not by catching
   the symptom (`updateMany`/`deleteMany` never throw P2025). Two
   adjacent traps probed the same session: **Prisma's
   `updateMany({data:{}})` is a no-op returning count 0 EVEN FOR AN
   EXISTING ROW** — an empty-patch contract needs its own read branch;
   and the ownership (IDOR) guard had NO wire-level pin anywhere — the
   cross-user battery (user A on user B's row → 404 ×3) now pins it
   (a dropped `userId` regression is a guaranteed smoke failure, not a
   silent hole). Smoke-pin authoring traps: curl's `-w '%{http_code}'`
   writes NO trailing newline (a concatenated `cat c*` can never match
   `^200$` — count per-file), and bash's `${f/c/r}` substitution
   rewrites the FIRST 'c' anywhere in the path (a mktemp dir name) —
   pair files by explicit index.

37. **The CLIENT dispatches failure classes too — and a stale client
   snapshot can beat the truth (Session 23).** S13's law ("failure
   CLASSES need distinct UI contracts") did not stop at the wire: S22
   made the raced PATCH/DELETE answer the honest 404, but the client
   catch still wore the retry-lie banner ("Try again" — every retry
   404s forever) and kept the ghost row mounted. The client now
   mirrors the truth: a 404 drops the row locally + re-syncs + the
   polite `role="status"` announce (PATCH: "no longer in the
   workspace"; DELETE: the IDEMPOTENT-SUCCESS "already removed"), the
   `SessionExpired` early-return keeps 401s banner-free by
   construction, and only the RETRYABLE classes (network faults)
   keep the banner. The sibling trap: `refresh()` had no in-flight
   ordering guard — two concurrent actions on DIFFERENT rows (busyId
   only guards one row) fire two GETs, and a delayed stale snapshot
   landing LAST resurrected the deleted row (probed deterministically
   via route-delay); a `useRef` sequence counter drops any response
   superseded by a newer refresh. Pin-authoring traps this session:
   **Next.js's route announcer is itself a `role=alert` element
   carrying the page title** — an unfiltered alert-count pin can never
   pass; filter by text (the session-lifecycle pattern). And
   survey-tooling (the gotcha-30 family): **a `page.route` mock's
   `**/api/workflows` glob does NOT match `/api/workflows/[id]`** —
   the capture script's error-boundary Pause-click escaped the mock
   and landed on the dev DB (the seed checksum covers names/rows, not
   statuses — two sessions closed "canonical" with paused rows);
   cover the [id] routes in the regex and verify the dev DB logical
   state (rows + active count + runs sum) before AND after capture
   runs.

38. **A hang is not a failure — and a failure surface must not outlive
   its action (Session 24).** No client fetch carried a timeout: a
   black-holed request (a stalled connection — the CLIENT twin of
   S15's server-side hang) neither resolves nor rejects, so the
   dashboard's busyId spinner stayed engaged FOREVER with no banner
   and no recovery (the S12 resilience pins cover aborts, which
   reject immediately — the hang class was invisible to the gates
   until probed with a never-fulfilling `page.route`). Every client
   fetch now rides `fetchWithTimeout` (`src/lib/client-fetch.ts`, 20s
   — above the server's own 10s SDK ceiling), converting the hang
   into the existing network-fault contract. Pin it with Playwright's
   `clock` API (`page.clock.install()` + `fastForward`) — the 20s
   ceiling costs milliseconds; an inert fetch MOCK cannot observe the
   abort rejection (unit-pin the seam against a REAL hung TCP
   socket). The sibling law: every action start clears BOTH error
   surfaces — a "Try again." banner left mounted after a SUCCESSFUL
   unrelated action is a lie by staleness. And the first-run placement
   trap (this session's in-vivo RED): the seed and db:push now resolve
   through the db-path seam and PRINT their target (`seed-target:` /
   `[db] DATABASE_URL=`) — the seed must always write where the app
   reads; the sandbox's shell-exported absolute `DATABASE_URL` +
   parent `.env` (gotcha 1's vectors) silently redirected a whole
   first-run to a foreign database while login answered P2021.

39. **Every ceiling must say what it hides — and pin the budgets you
   measured (Session 25).** The runs chart rendered `slice(0, 8)`
   silently: with a 12-row workspace it showed 8 bars with no note while
   the heading read "Runs by workflow" — the same lie the workflow LIST
   was fixed for in Session 21 ("a ceiling that lies is worse than no
   ceiling"); the chart's ceiling never got the honesty because no probe
   ever held >8 rows. Now `CHART_ROWS` + the S21-pattern note with the
   TRUE total (D104) — and the survey discipline: probe EVERY capped
   surface with data that EXCEEDS its cap (the seeded 6-row workspace
   hides every ceiling above 6). The sibling law: performance budgets
   measured ad hoc are REGRESSIONS WAITING — the S21/S22 LCP/DOM-node
   ceilings now live in `tests/e2e/performance-budget.spec.ts` with 2–4x
   margins (the budget catches GROSS regressions, not milliseconds —
   generous ceilings are the de-flake strategy, not a weakness). And the
   a11y twin: a chart's rows are a LIST — div soup never announces
   "list, N items" to a screen reader (now `ul`/`li`, D105); when you
   add a note to a dark card, reach for `text-white/50` FIRST — this
   session's own first draft shipped `text-white/40` and the axe scan
   caught it at 3.5:1 (the S10/D59 lesson: the scan only catches what
   RENDERS — the LIST's S21 note carried the same latent violation for
   four sessions because it needs a >100-row workspace to appear).

40. **A ranked surface must rank by its own title — and the cap can hide
   the champion entirely (Session 26).** The runs chart under the heading
   "Runs by workflow" charted `workflows.slice(0, 8)` — the 8 most
   RECENT rows, mirroring the list: a 12-row workspace whose OLDEST row
   carried 12,000 runs rendered the champion INVISIBLE with every bar a
   4%–7.5% stub (the `maxRuns` denominator came from a row the chart
   never displayed — the bar-length encoding carried no information
   exactly when a runs ranking is meaningful). The survey discipline:
   probe every RANKED surface with a workspace whose top row by the
   ranking key is NOT the newest row (the seeded 6-row workspace hides
   the question — recency and rank coincide). And the deeper trap found
   while designing the fix: at >100 workflows the client's `workflows`
   state is the CAPPED newest-100 list — every old high-run row sits
   OUTSIDE the cap, so ANY client-side ranking ranks only the newest 100
   (the smoke 111-row workspace: the champion sits in ZERO of the
   newest-100 rows). An honest ranking over capped data must be
   SERVER-SIDE — the envelope's `meta` sibling (the S21 stat-cards
   precedent) carries `topRuns` across the FULL workspace; the client
   keeps a pure fallback seam for the meta-less contract. The VLM twin:
   a single-frame screenshot of an ANIMATED surface (the gradient
   heading's 14s sweep) can catch a white-dominant instant — adjudicate
   with a time-sampled probe before believing "missing" (the gotcha-15/24
   single-frame family), and write the check prompt FROM the spec's
   pinned assertions (the hero's video is the full-bleed BACKGROUND —
   `section video` pinned by src — NOT a mockup card; twelfth drift).

41. **A stat card's aggregate must weight by what it aggregates — and a
   `finally` block's `process.exit(0)` swallows the in-flight error
   (Session 27).** The card labeled "Avg success rate" rendered Prisma's
   `_avg successRate` — the UNWEIGHTED mean over workflows: with one
   12,000-run row at 60% and four 3-run rows at 100% it displayed 92.0%
   while the workspace's true (run-weighted) rate was 60.0% — the
   average-of-averages fallacy, displayed directly beside "Total runs
   12,012" (the run-share reading it invites). The law: a workspace-level
   rate must weight by RUNS (`Σ(runs × successRate) / Σ(runs)` — the
   share of runs that succeeded), computed server-side through a pure
   seam shared by the route, the page, and the client fallback; and the
   label + the wire field NAME their criterion ("Success rate" /
   `meta.stats.successRate` — a field named "avg" carrying a weighted
   rate would be the gotcha-40 chart lie one layer down). The pin
   discipline: a discriminating smoke pin needs probe data where the
   semantics DIVERGE (the 105 volumetric probe rows at successRate 50:
   unweighted 52.7 vs weighted 93.1 — at the old 99.5 BOTH rendered
   99.5%, pinning nothing). The tooling twin (caught the same session):
   the standing screenshot capture script failed mid-run after shot 13
   — and its `finally` block's `process.exit(ok ? 0 : 1)` PREEMPTED the
   pending catch handler, so the S26 run "succeeded" (exit 0) having
   refreshed only 17 of 20 shots; never exit 0 from a finally, and check
   the COMPLETION log line, never the exit code alone (the gotcha-32
   channels family — a swallowed channel lies).

42. **A seam's arithmetic is part of its contract — and the suite's own
    budgets grow with it (Session 28).** The "Hours saved" card had two
    computations behind one definition: the SERVER loaders (SQLite's SUM
    — extended-precision, grid-exact at every probed shape) and the
    CLIENT's fallback memo (a naive JS float reduce — ORDER-DEPENDENT at
    exactly-x.5 decimal shapes: [15.4, 17.9, 15.2] is 48.5 in decimal but
    48.499999999999993 in the list's addition order, displaying 48 where
    the server displayed 49 — four of six probed shapes diverged by 1).
    The law: when a value is computed at MORE THAN ONE seam, the
    arithmetic itself must be shared and ORDER-FREE — `sumHours()`
    accumulates INTEGER TENTHS (associative by construction) and every
    persisted hours value sits on the 0.1 grid (POST hardcodes 0; PATCH
    never writes hours), so the exactness is closed by construction, not
    by rounding luck. The survey corollary: extend a boundary probe to
    the CLASS — the runs sum (integer) was exact everywhere, and the
    run-weighted rate survived a 50,000-shape flip search (the
    large-magnitude integer-weighted products keep the toFixed(1)
    display stable) — both adjudicated CLEAN and documented so the next
    session does not re-litigate. And the tooling twin (caught the same
    session): the e2e suite's OWN auth flows grew to ~45 per run and
    crossed the webServer's `AUTH_RATE_LIMIT_MAX=50` mid-suite — the
    Session-11 razor-edge pattern recurring after 17 sessions of spec
    growth; the 429s landed on the LAST files alphabetically
    (session27/session28) while an isolated re-run passed 3/3, the
    signature of a budget exhaustion, not a defect. When the suite
    grows, re-count EVERY per-process budget it consumes — a pin set at
    the suite's size at authoring time is a razor edge at the suite's
    size two cycles later.

43. **Playwright RESTARTS the worker after a failed test — a
    state-sharing spec's module-level identifiers silently regenerate
    (Session 29).** The first-run spec's first authoring had one `await`
    bug in test (a) (`expect(statValue(...))` receiving a Promise —
    `expect(pending).toBe("0")` fails instantly); the failure RESTARTED
    the worker, the spec module RELOADED, the module-level
    `Date.now()`-suffixed EMAIL regenerated, and `beforeAll` re-ran in
    the new worker — registering a NEW user: test (b) then ran against
    an EMPTY workspace (chart 2 ≠ 3) and test (c) read ZERO rows for
    "the" user — the secondary failures pointed at the WRONG layer
    ("the wire and the file disagree" was the tell that the STATE, not
    the code, had split). Two laws: mark state-sharing groups
    `test.describe.serial` (fail-fast — the remaining tests SKIP
    instead of running against split state; also applied to
    session28-tie-break retroactively), and always diagnose the FIRST
    failure in a run — the cascade after a worker restart is noise.
44. **A `fullPage: true` screenshot captures beyond-viewport content
    WITHOUT scrolling — the IntersectionObserver-driven Reveal
    entrances never fire for below-fold sections, so they render as
    blank dark bands (Session 30).** The first 20-shot refresh
    produced a landing-full shot whose pricing/testimonials bands were
    empty black and section shots captured mid-entrance (the rAF
    entrances run delay + 600–900ms AFTER the IO trigger — a
    screenshot immediately after `scrollIntoViewIfNeeded` catches
    opacity ~0). The fix: a SCROLL-THROUGH pass before the capture
    (viewport steps, ~140ms pauses — every IO fires, every entrance
    settles) plus a post-action settle. Verify the captured bands with
    a VLM read (or pixel-variance), never the exit code alone.

## Architecture invariants

- **Layering:** route handlers (`src/app/api/**`) own validation +
  persistence; views never fetch directly — the dashboard server page loads
  initial state and the client component mutates through the API envelope.
- **The envelope:** every API route returns `{ ok: true, data }` or
  `{ ok: false, error: { code, message } }` via `src/lib/api.ts` (`ok` /
  `fail` / `requireSession` + the Session-19 crash-path wrapper
  `apiRoute` — what ESCAPES a handler becomes the INTERNAL_ERROR
  envelope with the stack re-logged to fd 2 — and the Session-20 method
  guards `methodGuard`/`optionsGuard` + the request-size ceiling
  `bodyTooLarge` before every body parse + the Session-21 optional
  `meta` sibling of `data` carrying the capped list's TRUE total +
  honest aggregates + the Session-22 ownership-scoped atomic writes
  `updateMany`/`deleteMany` with `userId` in the WHERE — count 0 is the
  honest 404, and the mutation race is closed by construction). The
  CLIENT mirrors the same honesty (Session 23): a PATCH/DELETE 404 drops
  the ghost row + re-syncs + announces politely (never the retry-lie
  banner — the S13 failure-class law extended to the client; a DELETE 404
  is idempotent success), 401s stay banner-free via the `SessionExpired`
  early-return, and `refresh()`'s sequence guard drops any response
  superseded by a newer refresh (no stale-snapshot resurrection). The
  client's TEMPORAL layer (Session 24): every fetch rides
  `fetchWithTimeout` (the 20s client ceiling — a hang converts into the
  network-fault banner + busy release, never an eternal spinner) and
  every action start clears BOTH error surfaces (a failure surface lives
  exactly until the user's next action of ANY class) + the Session-25
  observability layer: the runs chart's ceiling is honest (CHART_ROWS +
  the S21-pattern note with the TRUE total, D104) with semantic list
  rows (D105), and the measured performance ceilings (LCP/DOM budgets)
  are PINNED in the e2e gate — `tests/e2e/performance-budget.spec.ts` —
  and the Session-26 ranking layer: the chart titled "Runs by workflow"
  RANKS BY RUNS across the FULL workspace via the server-side
  `meta.topRuns` aggregate (the capped client list can never rank
  honestly at >100 rows — D106) with the pure `rankByRuns()` fallback
  seam, and the script-TRANSFER bytes are pinned (scripts ≤ 400KB per
  route — D107), and the Session-27 weighting layer: the stat card
  "Success rate" carries the RUN-WEIGHTED truth (`weightedSuccessRate()`
  — Σ(runs × successRate) / Σ(runs) over the FULL workspace, server-side
  via the shared pure seam; the meta field is `successRate`; the client
  fallback weights identically — D108) with the paint-milestone budgets
  pinned (TTFB ≤ 500ms + FCP ≤ 1000ms per route + the authed-dashboard
  LCP ≤ 1000ms — D109), and the Session-28 exactness layer: the "Hours
  saved" card's sum rides the ORDER-FREE `sumHours()` seam (integer-tenths
  accumulation over the stat-rows fetch — the route, the page, and the
  client fallback share ONE definition; a naive float reduce displayed
  1 low at exactly-x.5 shapes — D110) with the chart's tie-break
  (`runs DESC, createdAt DESC` — D111) and the CLS budgets (≤ 0.1 per
  route — D112) pinned, and the Session-29/30 structured-data layer: the
  sitewide WebSite + Organization pair mounted ONCE in the root layout
  (the live REDEPLOYED its own structured data — a minimal pair on every
  route + BreadcrumbLists on the content routes; the drift battery's
  JSON-LD column caught it — gotcha 7), the BreadcrumbList on the five
  content routes + /demo (the crumb names ARE the routes' own metadata
  stems), and the supersets — the SoftwareApplication with the
  PLANS-derived offers on the landing (Enterprise's null price omitted,
  never an invented 0), the FAQPage on /faq (entities VERBATIM from
  FAQ_ITEMS) — all through the PURE builders in `src/lib/seo.ts`, every
  fact derived from its ONE content source (D113 → D115) — with the
  first-run boundary stories pinned (the empty-to-FIRST transition, the
  all-zero chart's uniform floor, the first-run expiry — D114) and the
  100/101-row dual-ceiling boundary (the list cap's own edge: NO note at
  exactly 100, the honest note + the invisible oldest at 101, the stats
  TRUE across the cap — D116). No route
  returns bare JSON — including on the crash paths AND the
  method-mismatch paths AND the raced paths.
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
