# Session 31 Log — The Deployment-Honesty Audit (the Session-18 Remediation, 2026-10-08)

Continuing from Session 29/30 (main @ 680e11f — the verified Session-17
push `d40f047` + the docs commit). The mandate: refresh, review the
session-29/30 + remediation-plan-17 docs, re-audit against the live
(with the standing mobile-navigation and Tailwind-v4 vigilance),
remediate TDD-first, re-verify, document, push.

## Phase 0 — The workspace reset (again)

This session began with the sandbox **fully reset** (the repo gone, a
fresh bootstrap .git with only `.env`/`.gitignore`/`skills/`): fresh
`git clone` (HEAD `680e11f`, main, clean), the repo deployed to the
workspace root (the established layout — the environment skills merged
with the repo's tracked tree, local-only excludes for the environment
artifacts), `npm install`, `cp .env.example .env` (fresh
`AUTH_SECRET`), `prisma generate`, `db:push` + `db:seed`
(seed-checksum `e7f6c011` — the canonical state). The
exported-`DATABASE_URL` trap was LIVE (a stale absolute path) —
neutralized per-command (`env -u DATABASE_URL`) all session. No zombie
ports at the start (verified — the reset reaped everything; they
RETURNED mid-session, see Phase 4).

## Phase 1 — Docs & baseline

- Root docs (AGENTS 31 gotchas / CLAUDE / README / PAD Session-17
  revision, ledger at D86, §10's MEDIUM + LOW CLOSED / SKILL v2.16.0) +
  status docs (session_29, session_30 — the previous conversation's
  transcript, remediation-plan-17 fully ticked, worklog) reviewed; the
  `skills/` folder excluded from every toolchain (re-verified).
- Baseline gate: lint ✓ typecheck ✓ Vitest 126/126 ✓ build ✓ smoke
  65/65 ✓ Playwright 197/197 — **388 checks, fully green, no flake.**

## Phase 2 — The audit (the reference UNCHANGED; four new survey surfaces)

**Drift battery** (8 routes, fresh :3030 boot, live vs clone): word
parity **1.0000 on every route**. **Mobile-nav paired real-touch
probe** (390×844, `hasTouch`): the clone's burger opens with a REAL
tap into the byte-identical panel — the same seven rows, all exactly
44px (the live's burger remains pointer-blocked, D32). **No Tailwind
v4 bug.** The live LOGIN re-verified with the operator credentials
(sepnetflix2023@outlook.com): sign-in redirects to `/` with the navbar
UNCHANGED and `/dashboard` renders the SPA 404 even authenticated —
**D62 holds** (the live has no authenticated surface; the operator's
reference dashboard image is this repo's own).

The Session-18 NEW surfaces — the layers of **deployment honesty**
(the signals a deployment trusts to describe itself):

1. **The health probe's blindness:** `/api/health` answered from the
   route handler alone. Probed with an UNWRITABLE `DATABASE_URL`:
   **health `200 status:ok` while `POST /api/auth/login` → a bare 500
   with an empty body** — and the Dockerfile's HEALTHCHECK polls this
   route, so a broken-volume container reports healthy forever. **F1.**
2. **The silent AUTH_SECRET fallback:** importing the auth module in
   production with no AUTH_SECRET produced **zero runtime output** —
   the warning existed only in README/§8.2 text while the fallback
   constant is PUBLIC in this repo (every session token forgeable).
   **F2.**
3. **The broken Docker first-run story:** the S17 runbook's one-off
   init (`docker run --entrypoint npx saas-company prisma db push`)
   **cannot work** — the runner stage ships neither the prisma CLI nor
   `prisma/schema.prisma` (Dockerfile lines 53–55 copy only the
   standalone artifact, static chunks, public/), and a fresh named
   volume mounts EMPTY → every query 500s while health says ok (F1's
   blindness compounds it). **F3.**
4. **The half-documented IP trust model:** DEPLOYMENT.md documents the
   proxy-forwarding side but never the inverse — `clientIpOf()` trusts
   the first `X-Forwarded-For` hop verbatim, so a directly exposed
   deployment accepts client-supplied values and a header-rotating
   script mints a fresh auth bucket per request. **F4.**

Adjudicated CLEAN with evidence: the rate-limit bucket lifecycle
(opportunistic eviction inside every `checkRate` — no unbounded
growth), `npm audit` (exactly the documented F10 braces chain,
lint-toolchain-only, no new advisories), `.env.example` completeness
(every `process.env` read has a row), the body-parse envelope contract
(all five POST routes catch the JSON rejection), the auth crypto seams
(`timingSafeEqual` on both the password and the session-HMAC paths),
the forgot-password stub (documented D23 — reference parity), and D62
(re-verified).

## Phase 3 — Remediation, TDD-first

The plan (`docs/remediation-plan-session18.md`) was written and
validated against the codebase before any fix.

**R1 — the DB-aware health probe (F1):** RED first (the F1 probe +
the smoke pin RED `expected [up] got []` against the pre-fix build).
The route reuses the S15 `withTimeout` hang seam: `SELECT 1` raced
against 1.5s; the envelope gains `db: "up"|"down"`; **the status stays
200 in both states by design** (a broken volume DB is not repaired by
a restart — failing the Docker healthcheck would only manufacture
restart loops; the field is the alerting signal). GREEN: the probe
shows `db:"down"` on the broken URL / `db:"up"` on the canonical DB;
smoke 66/66.

**R2 — the loud AUTH_SECRET warning (F2):** the hardest-won fix of
the session — **three output channels failed silently before the
fourth worked**:
1. A module-init `console.error` in `auth.ts`: the expression executed
   (the login route kept answering, the built chunk carried the code)
   and the log stayed empty — **Next.js 16's production runtime
   captures route-module console output**.
2. The instrumentation hook (`src/instrumentation.ts`, Next's official
   boot seam) writing via `process.stderr.write`: `register()`
   provably RAN (a diagnostic `appendFileSync` marker fired) and the
   log stayed empty — **the stream object is wrapped too**.
3. A dynamic `await import("node:fs")` inside `register()`: compiled
   to the turbopack chunk-loader promise, which **RACED at boot** —
   hung on one boot (silent no-write), resolved on the next.
4. **The working seam: the STATIC `import { writeSync } from
   "node:fs"` + `writeSync(2, message)`** — the raw file descriptor,
   below every object the runtime can replace. Verified: 206 bytes,
   the warning in the standalone boot log.

En route, the forensic loop exposed the REAL reason every "unset"
probe stayed silent: **`next build` COPIES the repo `.env` into
`.next/standalone/`** — the standalone's own env loading SET
AUTH_SECRET from the copied file regardless of the shell (a
standalone-directory deployment ships the build-time env; the Docker
path is unaffected — `.dockerignore` excludes `.env`). The definitive
GREEN: blank AUTH_SECRET in the standalone `.env` → the warning
prints at boot. 6 unit pins (message content; fires-once; the
NEXT_RUNTIME-unset standalone reality; silent when set; silent in
dev/test; the edge guard — the vitest mock partially mocks node:fs
because the ESM namespace of a builtin cannot be spied).

**R3 — the self-initializing image (F3):** the build stage pushes the
schema into `/app/db/custom.db` (`npx prisma db push --skip-generate`
before `next build`) and the runner COPYs the node-owned directory —
**a fresh NAMED volume seeds itself from the image on first mount
(Docker's copy-on-first-mount): `docker run -v saas-db:/app/db` is
useful on first boot with ZERO init commands.** The runbook's broken
one-off is replaced (bind mounts: initialize from a checkout; the
demo workspace optional via the seed); the
first-account-before-`ALLOW_REGISTRATION=false` note prevents the
empty-DB+closed-registration lockout. Honest labeling maintained: no
Docker daemon here — the Session-18 static review caught the
init-path defect; the first real `docker build` remains the image's
own verification step.

**R4 — the IP-trust docs completion (F4):** DEPLOYMENT.md §2's
inverse warning (+ the .env-copy discovery note), the `clientIpOf`
doc comment's trust model, the README troubleshooting row. No
behavior change — the docs are now as honest as the code (the D79
pattern).

## Phase 4 — The gate, re-verification & a zombie recurrence

**Full gate: lint ✓ typecheck ✓ Vitest 132/132 ✓ build ✓ smoke
66/66 ✓ Playwright 197/197 — 395 checks, fully green, no flake.**

Re-verification: the F1/F2 probes GREEN on the final build; the drift
battery re-run — **and the first re-run COLLAPSED to 0.0000 with
concatenated words ("FeaturesHow")** — the classic gotcha-26 zombie
signature: a stale :3030 process (an earlier probe server whose
`kill $PID; wait $PID` had silently failed — the third such incident
this session, after :3033 and :3044) was serving OLD-build HTML
against the regenerated chunk directory. The fresh-port move (:3065)
restored the truth: **word parity 1.0000 ×8, the mobile-nav
byte-identical** (7 rows × 44px). The kill-unreliability + the
fresh-port discipline are logged as gotcha 32's tail + SKILL lesson
45.

Screenshots: the standard 20-shot set refreshed against the
remediated build (canonical re-seeded workspace, checksum e7f6c011;
the capture script recreated — `scripts/capture-screenshots-s18.mjs`;
VLM spot-checks ×5 all PASS: the dashboard's 5-point contract, the
login card's 5-point contract, the mobile-menu trio, the resilience
banner trio, the branded-boundary 4-point contract).

## Phase 5 — Documentation

PAD (revision block; ledger **D87–D90**; §7.1/7.2/7.3 counts; §8.2/8.3
the self-initializing image + the .env-copy note; §11 key files),
AGENTS (counts + **gotcha 32** — the three-silent-channels saga +
fd-2 discipline + the .env-copy + kill-unreliability), CLAUDE
(session-18 context), README (395 badge, the DB-aware health row, four
new troubleshooting rows), the SKILL doc **v2.17.0 (lessons 44–45)**,
DEPLOYMENT.md (§2 the XFF inverse + the .env-copy note; §8 the
zero-init runbook repair), `.env.example` re-verified in sync (no new
vars), the remediation plan session18 (ticked), this session log, the
repo worklog.

## Phase 6 — Commit & push

Single `:bug: fix:` commit to `main` (all code + tests + docs +
screenshots), pushed via `docs/ssh_git_wrapper_v3.py` with the
operator-supplied SSH key (the runbook's wrapper-verified sequence);
no branches (the operator contract).
