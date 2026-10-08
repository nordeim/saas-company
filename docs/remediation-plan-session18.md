# Remediation Plan — Session 18 (2026-10-08)

**Scope:** Fix the issues, bugs and gaps found by the Session 18
deployment-honesty audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** the standing drift battery first (word parity **1.0000
on all 8 routes** — the reference is UNCHANGED since Session 17; the
mobile-nav real-touch paired probe re-run: the clone's panel
byte-identical — the same seven rows (Features / How It Works / Pricing /
Testimonials / FAQ / Log In / Get Started), all exactly 44px, opened by a
REAL tap while the live's burger remains pointer-blocked (D32) — **no
Tailwind v4 bug**; the live LOGIN re-verified with the operator
credentials: sign-in redirects to `/` with the navbar UNCHANGED and
`/dashboard` renders the SPA 404 even authenticated — D62 holds, the
live has no authenticated surface). Then the Session-18 NEW audit
surfaces — layers no prior session systematically surveyed:

1. **The health probe's blindness (liveness ≠ health):**
   `/api/health` answers from the route handler alone — it never touches
   the database. Probed on a production server booted with an
   UNWRITABLE `DATABASE_URL` (`file:/proc/9/unwritable-s18/custom.db`):
   **`/api/health` → `200 {"ok":true,"data":{"status":"ok",…}}` while
   `POST /api/auth/login` → a bare `500` with an empty body** — the app
   is completely broken while the probe says healthy. The Dockerfile's
   `HEALTHCHECK` and the whole volume story inherit this blindness: a
   container with a corrupted/missing database volume reports healthy
   forever while every authenticated API call fails. **F1.**
2. **The AUTH_SECRET fallback is silent at runtime:** `secret()` in
   `src/lib/auth.ts` falls back to the `DEV_SECRET` constant — which is
   PUBLIC in this repository — whenever `AUTH_SECRET` is unset. Probed:
   importing the auth module with `NODE_ENV=production` and no
   `AUTH_SECRET` produces **zero runtime output** (the warning exists
   only in README/§8.2 text). A production deployment that forgets the
   env var ships forgeable session tokens with no signal at all —
   every attacker who reads this repo can mint `userId.expiry.sig`
   tokens. **F2.**
3. **The Docker first-run story is broken (the documented init command
   cannot work):** `docs/DEPLOYMENT.md` §8 documents the one-off
   initialization `docker run --rm -v saas-db:/app/db --entrypoint npx
   saas-company prisma db push` — but the runner stage ships ONLY the
   standalone artifact (Dockerfile lines 53–55 copy `.next/standalone`,
   `.next/static`, and `public/`): **neither the `prisma` CLI nor
   `prisma/schema.prisma` exists in the image**, so the command fails
   (npx would fetch the CLI from the network against a missing schema).
   Worse, a fresh NAMED volume mounts EMPTY — the server opens a
   table-less SQLite file and every query 500s while health says "ok"
   (F1's blindness compounds it). The image must carry an
   initialized database so the volume seeds itself on first mount
   (Docker's copy-on-first-mount semantics). **F3.**
4. **The rate limiter's IP-trust model is half-documented:** §7 of
   DEPLOYMENT.md documents the proxy side ("forward … `X-Forwarded-For`
   so the auth rate limiter sees [the client IP]") but never the
   inverse: `clientIpOf()` trusts the FIRST `x-forwarded-for` hop
   verbatim — **directly exposed deployments accept client-SUPPLIED
   XFF values, so a header-rotating script mints a fresh
   `auth:<ip>` bucket per request and the rate limit never engages**.
   The honest completion is a docs-truth fix (the D79 pattern): state
   the trust model and the deployment requirement. **F4.**

Also audited and found CLEAN or ADJUDICATED (non-findings, this
session's evidence): **the rate-limit bucket lifecycle** (opportunistic
eviction of expired entries runs inside every `checkRate` call — the map
stays bounded by the active keys of a 15-minute window; no unbounded
growth), **`npm audit`** (exactly the single documented F10 residual —
the braces GHSA-vfj7-8cjw-p6xm chain through eslint-config-next,
lint-toolchain-only, no runtime exposure; no NEW advisories since
Session 17), **`.env.example` completeness** (every `process.env` read
in `src/` — DATABASE_URL, NEXT_PUBLIC_SITE_URL, AUTH_SECRET,
AUTH_RATE_LIMIT_MAX, GENERATE_RATE_LIMIT_MAX, ALLOW_REGISTRATION — has
a documented row), **the body-parse envelope contract** (all five POST
routes — login, register, newsletter, demo, generate — catch the JSON
parse rejection and answer the 400 BAD_REQUEST envelope), **the auth
crypto seams** (`timingSafeEqual` on BOTH the password comparison and
the session-token HMAC; the logout clear matches the set's
name/path/httpOnly), **the forgot-password stub** (the unconditional
"Check your email" view is the reference's own behavior, mirrored
byte-for-byte and documented as D23 — no mail transport exists in the
self-hosted clone), and **D62** (the live's post-login surface,
re-verified this session with the operator credentials).

## The fixes (TDD-first)

### R1 — the DB-aware health probe (F1)

`src/app/api/health/route.ts` gains a database reachability sub-check
reusing the Session-15 hang seam (`withTimeout` from `src/lib/workflow.ts`
— dependency-free, timer-cleared): `db.$queryRaw\`SELECT 1\`` raced
against a 1.5s timeout (the Docker HEALTHCHECK allows 5s). The
envelope grows one field — `{ status, app, ts, db: "up" | "down" }` —
and **the status code stays 200 in both states by design**: a broken
volume database is not fixed by a container restart, so failing the
Docker healthcheck would only manufacture restart loops; `db: "down"`
is the operator's alerting signal instead (documented in §8). The
existing contracts are untouched (the e2e landing pin asserts
`ok`/`status`/`app` — additive field; the smoke pins are additive
too). RED first: the F1 probe above (health 200-ok while login 500s);
GREEN: the probe re-run shows `db: "down"` on the broken URL and
`db: "up"` on the canonical DB. Smoke pin: `data.db == "up"`.

### R2 — the loud AUTH_SECRET fallback (F2)

A module-init check in `src/lib/auth.ts`: when `NODE_ENV ===
"production"` and `AUTH_SECRET` is unset/blank, `console.error` fires
ONCE per process with the forgeability warning. Dev/test stay silent
(vitest runs NODE_ENV=test; the smoke/e2e servers all set AUTH_SECRET —
verified in their boot lines). RED first: the F2 probe (production
import, zero output); GREEN: the same probe prints the warning. Unit
pins (3, in `src/lib/auth.test.ts` via `vi.resetModules` + dynamic
import): production+unset → the warning fires exactly once;
production+set → silent; test-env+unset → silent.

### R3 — the self-initializing image (F3)

The Dockerfile's build stage pushes the schema into a build-time
database (`npx prisma db push --skip-generate` after `prisma generate`,
with `DATABASE_URL=file:/app/db/custom.db` — `next build` runs against
the same initialized file; no query runs at build time, exactly the S17
design), and the runner stage COPYs `/app/db` (node-owned) so **a fresh
named volume seeds itself from the image on first mount** — `docker
run -v saas-db:/app/db` works with ZERO init commands. The runbook's
broken one-off is replaced: named volumes need nothing; BIND-mount
users initialize from a checkout (`DATABASE_URL="file:/abs/path.db"
npx prisma db push`, `npm run db:seed` for the demo workspace); and the
first-account note lands (registration defaults OPEN — create the
operator account BEFORE `ALLOW_REGISTRATION=false`, or an empty
database with closed registration can never be signed into). Honest
labeling maintained: no Docker daemon here — the recipe is statically
reviewed, not build-tested; the first `docker build` on real infra
remains the image's own verification step.

### R4 — the IP-trust docs completion (F4)

`docs/DEPLOYMENT.md` §7 gains the inverse warning (direct exposure
trusts client-supplied X-Forwarded-For → the auth limiter is bypassable
by header rotation; front every public deployment with a proxy that
OVERWRITES XFF); `src/lib/rate-limit.ts`'s `clientIpOf` doc comment
states the trust model; README's troubleshooting table gains the row.
No behavior change — the deployment posture is the operator's decision;
the docs become as honest as the code (the D79 pattern).

### R5 — full gate + paired re-verification + docs

Gate: lint → typecheck → **132 unit** (126 + 6 instrumentation pins —
the message-content pin + 5 behavioral pins) → build → **66 smoke**
(65 + the health `db` pin) → **197 e2e** (unchanged) — **395 checks**
(final counts from the runs). Re-verification: the F1/F2 probes re-run
GREEN on the remediated build; the standing drift battery re-run (word
parity ×8 + the mobile-nav paired probe — untouched surfaces, the
re-run is the regression guard); the standard 20-shot screenshot set
refreshed (VLM spot-checks); docs: PAD (revision block, ledger
**D87–D90**, §7 counts, §8.2/8.3 notes, §11 key files), AGENTS (counts
+ **gotcha 32**), CLAUDE (session-18 context), README (badge, the
health row, troubleshooting rows), the SKILL doc **v2.17.0 (lessons
44–45)**, DEPLOYMENT.md (R3 + R4), `.env.example` (re-verified — no new
vars), this plan (ticked), the session log `docs/session_31.md`, the
repo `worklog.md`. Commit (Conventional Commits + emoji) + SSH push via
`docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified).

## Validation of this plan against the codebase (pre-execution)

- `src/app/api/health/route.ts` re-read: the route is a single GET with
  no imports beyond `ok` — adding `db` + `withTimeout` slots cleanly;
  `workflow.ts` is dependency-free (no SDK import at module scope — the
  SDK lives in the generate route), so the health route's module graph
  stays light ✓
- `withTimeout` signature verified: `(promise, ms, fallback: () => T)`
  — resolves `fallback()` on timeout, propagates rejection, clears the
  timer in `finally` (no dangling handle) — the health mapping is
  timeout→`null`→`down`, rejection→catch→`down` ✓
- e2e landing health pin re-read: asserts `ok` / `data.status` /
  `data.app` only — the additive `db` field breaks nothing; the
  Playwright webServer polls `/api/health` for readiness and the route
  stays 200 in BOTH db states → zero suite impact ✓
- smoke health pins re-read (lines 64–67): `ok` + `app` — the new
  `data.db == "up"` pin slots after them; the smoke DB is pushed+seeded
  BEFORE the server boots (verified, line 41–43) so the pin is
  deterministic ✓
- `src/lib/auth.ts` re-read: the warning belongs at module scope (the
  S17 `DUMMY_*` init pattern); `auth.test.ts` already imports the
  module in a node environment — `vi.resetModules` + dynamic import +
  `vi.spyOn(console, "error")` pins the behavior ✓
- Dockerfile re-read: the build stage's `COPY . .` brings
  `prisma/schema.prisma` (not dockerignored); `db push` needs only the
  schema + DATABASE_URL; the runner's `COPY --from=build /app/db ./db`
  lands after the standalone copies and before VOLUME; the existing
  `mkdir -p /app/db && chown` becomes redundant-but-harmless (removed
  for clarity) ✓
- Docker volume semantics: a fresh NAMED volume at a path with image
  content copies the image's files in on first mount (documented Docker
  behavior since 1.0); BIND mounts shadow the image content — the
  runbook's bind-mount path documents the checkout-based init ✓
- Boot-env audit: smoke server (AUTH_SECRET="smoke-secret"), closed-gate
  server (:3220, same), e2e webServer (AUTH_SECRET set) — none trip the
  new warning; the dev server runs NODE_ENV=development — silent ✓
- Pin-conflict scan: no existing unit/smoke/e2e pin asserts the health
  payload's exact field set, console output at boot, or Dockerfile
  behavior ✓
- Docs-truth scan: README/DEPLOYMENT/PAD make no claim today about
  health's db-awareness, the warning, or volume self-initialization —
  the new rows ADD truth; the broken init command is REMOVED and
  replaced ✓

## Execution order

R1 (RED probe → health route + smoke pin → GREEN probe) → R2 (RED probe
→ unit pins RED → the warning → GREEN) → R3 (Dockerfile + runbook) →
R4 (docs rows) → full gate → paired re-verification → screenshots →
docs (R5) → commit + SSH push per the runbook.

### ToDo checklist

- [x] R1: the DB-aware health route (`db: "up"|"down"`, 200 always) + the smoke `data.db == "up"` pin; RED (blind 200-ok while login 500s) observed; GREEN probe: `db:"down"` on the broken URL, `db:"up"` on the canonical DB (re-verified on the final build; smoke RED observed as `expected [up] got []` against the pre-fix build, then 66/66 GREEN)
- [x] R2: the production AUTH_SECRET boot warning + 6 unit pins (message content, fires-once, the NEXT_RUNTIME-unset standalone reality, silent when set, silent in dev/test, the edge guard); RED (silent import) observed; GREEN (the warning prints — after THREE silent channels: route-module console.error, hook-time process.stderr.write, and the racing dynamic import; the working seam is the static node:fs import + fs.writeSync(2, …), verified 206 bytes in the standalone boot log)
- [x] R3: the self-initializing image (build-stage `db push` + runner COPY of `/app/db`) + the runbook repair (zero-init named volumes; bind-mount init from a checkout; the first-account-before-closing-registration note; the healthcheck `db` field note)
- [x] R4: the IP-trust docs completion (DEPLOYMENT.md §2 inverse warning + the .env-copy discovery note, `clientIpOf` doc comment, README troubleshooting row)
- [x] Full gate: lint ✓ → typecheck ✓ → 132/132 unit → build ✓ → 66/66 smoke → 197/197 e2e (395 checks, no flake)
- [x] Paired re-verification: the F1/F2 probes GREEN on the remediated build; word parity 1.0000 ×8; the mobile-nav paired probe byte-identical (7 rows × 44px; one ZOMBIE-SERVER recurrence en route — a stale :3030 process served old-build HTML and collapsed the first re-run to 0.0000 with concatenated words, the gotcha-26 signature; resolved by the fresh-port move — the kill+wait pattern proved unreliable)
- [x] Screenshots: the standard 20-shot set refreshed (canonical re-seeded workspace, checksum e7f6c011; VLM spot-checks ×5 all PASS)
- [x] Docs: PAD (revision block, D87–D90, §7 counts, §8.2/8.3 notes, §11), AGENTS (gotcha 32 + counts), CLAUDE (session-18 context), README (395 badge + health row + troubleshooting), SKILL v2.17.0 (lessons 44–45), DEPLOYMENT.md, this plan ticked, session log `docs/session_31.md`, repo `worklog.md`
- [ ] Commit to `main` + SSH push via `docs/ssh_git_wrapper_v3.py` (wrapper-verified, operator key destroyed after) — the final step
