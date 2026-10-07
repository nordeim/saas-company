# SAAS Company — Engineering Skill Document

> **Version:** 2.1.0 · **Last updated:** 2026-10-07 (Session 2 remediation)
> **Scope:** Every design decision, anti-pattern, debugging procedure, and
> parity method a future agent needs to work in this codebase.
> **Companion docs:** `README.md` (user-facing) · `AGENTS.md` (operator) ·
> `CLAUDE.md` (agent contract) · `Project_Architecture_Document.md` (source of
> truth) · `docs/remediation-plan-session2.md` (this revision's audit).

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
| Fonts | Self-hosted Wix Madefor ("Vend Sans") + next/font (Playfair, DM Serif Display) | Byte-identical type rendering with the reference |
| Tests | Vitest 5 (73) · Playwright 1.63 (41) · bash/curl smoke (38) | 152 checks; the local gate is the only gate (no hosted CI) |

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
| `--color-primary`/`--color-violet` | `#d500ff` | Brand magenta |
| `--color-accent`/`--color-electric-blue` | `#008cff` | Gradient partner |
| `--color-destructive` | `#ef4444` | Problem cards, delete |
| `--font-heading`/`--font-body` | "Vend Sans" / "Vend Sans Text" | Self-hosted Wix Madefor woff2 in `src/fonts/`, declared via `@font-face` |
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
chrome, pinned by `tests/e2e/mobile-navigation.spec.ts`), `footer.tsx`
(working newsletter form), `logo.tsx` (exact SVG wordmark + animated petals),
`reveal.tsx` (IntersectionObserver entrances), `legal-page-view.tsx` (shared
template: optional caption, per-section lists).

Landing sections (`src/components/sections/`): hero (video + shimmer badge +
gradient H1 + the scroll indicator), dashboard-preview (browser-chrome
skeleton), logo-cloud (8 measured wordmarks incl. serif fonts + Gasparyan
svg), problem, features (three-tab card — per-tab content measured from the
live DOM in Session 2), how-it-works, pricing (Monthly/Annual toggle, 20%
discount), testimonials, cta.

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
npm run test          # 73/73
env -u DATABASE_URL npm run build
./scripts/smoke-test.sh   # 38/38 (boots prod on :3200, own db/smoke.db)
npm run test:e2e      # 41/41 (boots prod on :3100, own db/e2e.db)
npm audit             # expect only the accepted braces advisory
git status            # no .env, *.key, db/*.db, dev.log staged
```

Then: Conventional Commits with emoji (`:art: feat:`, `:bug: fix:`,
`:memo: docs:`) on `main` only; push via
`python3 docs/ssh_git_wrapper_v3.py --key-file <key outside the repo>`.

## §12. Lessons Learnt (Sessions 1–2)

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
primary #d500ff · primary-foreground #ffffff · accent #008cff ·
accent-foreground #ffffff · violet #d500ff · electric-blue #008cff ·
background #000000 · foreground #ffffff · card #0f0f0f ·
card-foreground #ffffff · muted #161616 · muted-foreground #a1a1aa ·
border #242424 · input #242424 · destructive #ef4444
```

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
  `docs/remediation-plan-session2.md` (F1–F10, R1–R11).
- **Push runbook:** `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` (the
  paramiko ssh shim lives at `docs/ssh.py` for sandboxes without OpenSSH).
- **Tailwind v4 traps:** `docs/Tailwind-V4-Validation-Report.md` + PAD §5.5.
- **Deployment:** `docs/DEPLOYMENT.md`.
- **Evidence base:** Session 2 parity artifacts under
  `/home/z/my-project/session2-ref/` (outside the repo).
- **Quick reference:** demo login `demo@novaai.app` / `Demo1234!`; ports —
  dev 3000, smoke 3200, e2e 3100; the gate order is §11.
