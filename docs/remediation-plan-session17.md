# Remediation Plan — Session 17 (2026-10-08)

**Scope:** Fix the issues, bugs and gaps found by the Session 17 parity +
production-readiness audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** fresh paired captures (word parity **1.0000 on all 8
routes** — the reference is UNCHANGED since Session 16; the standing
mobile-nav real-touch probe re-run: the clone's panel byte-identical and
working — the burger opens on a REAL tap into the same seven measured rows
(Features / How It Works / Pricing / Testimonials / FAQ / Log In / Get
Started, all exactly 44px) as the live's panel (opened via JS click — the
live's burger remains pointer-blocked by its empty toast portal, D32) —
**no Tailwind v4 bug**). The Session-17 NEW audit surfaces — layers no
prior session systematically surveyed:

1. **The account-enumeration timing layer (CWE-208):** the login route
   short-circuits `!user || !verifyPassword(...)` — when the email is
   UNKNOWN the scrypt verification is skipped entirely, so the
   unknown-email path answers in ~3.5ms while the wrong-password path
   (scrypt burns ~31ms) answers in ~34ms — a **9.8x median latency delta
   behind an otherwise identical 401 INVALID_CREDENTIALS envelope**
   (probed: 9 samples each path, medians 3.5ms vs 34.1ms, warm
   connections). An attacker measuring response times can enumerate which
   email addresses hold accounts without ever guessing a valid password.
   The rate limit (10/15min) slows but does not stop the census: 10
   probes per window × 144 windows/day = 1,440 candidates/day per IP,
   and a rotating-IP script is unlimited. **F1.**
2. **The registration-concurrency layer (TOCTOU → unhandled P2002):**
   `register/route.ts` checks existence with `findUnique` and then
   `create`s — an async gap. Under truly-parallel duplicate POSTs (10
   independent sockets, same fresh email) the probe observed
   **{"201":1, "409":8, "500":1}** — the loser interleaved the gap, hit
   the `User.email` unique constraint, and the unhandled Prisma P2002
   surfaced as a **bare 500 with an EMPTY body and NO content-type** —
   the worst possible envelope-contract violation (the client receives
   zero information; the frontend's `payload?.error?.message` contract
   dead-ends into `null`). The sequential duplicate (409 EMAIL_TAKEN) is
   already pinned; the CONCURRENT duplicate is not. **F2.**
3. **The registration-access-control layer (PAD §10 MEDIUM, the oldest
   open ledger item):** any visitor can mint an account — the register
   route consults no deployment gate (probed: a fresh visitor's POST
   returns 201 + a signed-in session). The PAD has carried "gate behind
   invite codes or an `ALLOW_REGISTRATION` flag" as an open MEDIUM item
   since the ledger began; the seeded demo workspace makes the
   production posture "workspace open to the public internet once
   deployed." **F3.**
4. **The deployment-artifact layer (PAD §10 LOW):** no Dockerfile ships
   with the repo — the standalone build is Docker-ready by Next's design
   (`output: "standalone"` + `outputFileTracingRoot` are already pinned)
   but the repo carries no image recipe, so every deployment relies on
   the operator machine. **F4.**

Also audited and found CLEAN or ADJUDICATED (non-findings, this
session's evidence): **the Subscriber upsert path** (the newsletter's
`upsert` resolves the unique-email conflict internally — no P2002
exposure; the `Subscriber.email` unique constraint is unreachable as a
raw create), **the DemoRequest model** (no unique constraint — no P2002
site), **the login-card error surfacing** (`payload?.error?.message`
displays an API rejection verbatim — the closed-registration message
will render with ZERO client changes), **the e2e/smoke register
budgets** (the F3 gate defaults OPEN — every existing spec and check
keeps its contract unchanged), and the standing battery above.

A tooling fact re-confirmed this session (the S16 lesson, now
load-bearing for the race probe): undici's `fetch` pool serializes
requests on one socket — the TOCTOU interleave needs TRUE wire-level
concurrency (independent sockets: raw `http.request` with
`keepAlive: false`, or parallel curl processes). The first probe round
(8 shared-socket fetches) never interleaved; the independent-socket
round triggered the bare 500 on its first try.

## Findings → remediation map

| # | Finding | Layer | Severity | Fix |
|---|---------|-------|----------|-----|
| F1 | Login timing side-channel: unknown-email skips scrypt (9.8x median delta behind identical 401s) | Account enumeration (CWE-208) | MEDIUM | R1: the dummy-hash constant-time login |
| F2 | Concurrent duplicate register → unhandled P2002 → bare 500 (empty body, no content-type) | Envelope contract / robustness | MEDIUM | R2: the P2002 catch → 409 envelope |
| F3 | Open registration — no deployment gate (PAD §10 MEDIUM) | Access control | MEDIUM | R3: `ALLOW_REGISTRATION` gate (default open) |
| F4 | No Dockerfile (PAD §10 LOW) | Deployment artifact | LOW | R4: multi-stage Dockerfile + .dockerignore + DEPLOYMENT.md |

## The plan

### R1 — The dummy-hash constant-time login (F1)

- `src/lib/auth.ts` — export `dummyPasswordHash(): string`: a
  module-level `salt:hash` pair (16-byte random salt + scrypt of random
  bytes, 64-byte key — generated ONCE at module init so its shape and
  cost mirror a real stored hash). The login route burns the same scrypt
  cost on the unknown-email path: `const storedHash =
  user?.passwordHash ?? dummyPasswordHash()` → `verifyPassword` runs
  unconditionally → `if (!user || !passwordOk)` returns the identical
  401. The timing profile becomes flat (both paths ~34ms); the envelope
  never changes; valid logins are unaffected.
- RED first: unit cases in `src/lib/auth.test.ts` — the dummy hash has
  the `salt:hash` shape `verifyPassword` parses; it is STABLE across
  calls (a per-process constant — the timing floor must not vary);
  `verifyPassword(anything, dummy)` is NEVER true (it cannot validate);
  it differs from `hashPassword` output for the same input (a distinct
  stored-secret shape, not a derivable constant).
- Smoke pin (the suite's first timing pin — margins are huge): 7+7
  curl-sampled `%{time_total}` medians, unknown-email vs
  wrong-password; the ratio must stay under 2.5x. Post-fix both medians
  sit ~30-35ms (ratio ~1.0-1.2); pre-fix the ratio is ~8-10x (the RED
  evidence). A false failure needs a sustained 2.5x asymmetry between
  two scrypt-dominated paths — implausible by construction.

### R2 — The P2002 race → 409 envelope (F2)

- `src/lib/db-errors.ts` (new, pure — no PrismaClient instantiation at
  import): `isUniqueConstraintError(error): boolean` — true only for
  `Prisma.PrismaClientKnownRequestError` with `code === "P2002"`
  (verified constructible + `.code`-carrying in this repo's generated
  client).
- `src/app/api/auth/register/route.ts` — wrap the `create` in
  try/catch: a P2002 returns `fail("EMAIL_TAKEN", "An account with that
  email already exists.", 409)` (the exact sequential-duplicate
  contract); every other error rethrows (unknown failures keep Next's
  500 path — the route must not swallow what it cannot classify).
- RED first: unit cases in `src/lib/db-errors.test.ts` — a constructed
  `PrismaClientKnownRequestError("dup", { code: "P2002" })` → true; a
  P2025 → false; a plain `Error` → false; a duck-typed
  `{ code: "P2002" }` plain object → false (classification requires the
  class, not the shape — a random `{code}` from JSON.parse must not
  trip it); `null`/`undefined` → false.
- Smoke pin: 10 truly-parallel register POSTs (10 background curl
  processes = 10 independent sockets, same fresh email) — EVERY response
  must be an envelope: HTTP status ∈ {201, 409} AND the body carries
  the `"ok":` marker. Pre-fix the loser is a bare 500 with an empty
  body (RED); post-fix deterministic (the catch guarantees the
  envelope). The smoke server's auth bucket pins
  `AUTH_RATE_LIMIT_MAX=50` (the e2e webServer's own insurance pattern —
  the suite's auth POST count rises to ~30 with the new pins; no
  existing auth-429 pin exists in smoke, verified).

### R3 — The ALLOW_REGISTRATION gate (F3)

- `src/lib/auth.ts` — export `registrationOpen(): boolean`: only the
  exact string `"false"` closes registration (every other value —
  unset, `"true"`, `"0"`, `"no"` — stays OPEN). Default-open keeps the
  e2e suite's register specs, the smoke suite's register checks, and
  the current deployment story byte-compatible; the operator opts INTO
  closure.
- `src/app/api/auth/register/route.ts` — the gate slots AFTER the
  rate-limit check and BEFORE the body parse (a closed deployment owes
  no parse cycles; the "any attempt counts" ordering): closed →
  `fail("REGISTRATION_CLOSED", "Registration is currently closed.",
  403)`. Login stays OPEN on a closed deployment (closing registration
  must never lock out existing users).
- The CLIENT needs zero changes: the login card surfaces
  `payload?.error?.message` verbatim (verified) — a closed deployment's
  visitor sees "Registration is currently closed." in the card's
  existing error banner.
- RED first: unit cases in `src/lib/auth.test.ts` — unset → true;
  `"false"` → false; `"true"`/`"0"`/`"no"` → true.
- Smoke pin: a SECOND mini-server boot (`ALLOW_REGISTRATION=false`,
  :3210, same scratch DB — it never writes): register → 403 + the
  REGISTRATION_CLOSED code; login (demo user) → 200 (existing users
  unaffected). Three checks, fully deterministic.

### R4 — The Dockerfile (F4)

- `Dockerfile` — multi-stage on `node:22-alpine`: deps (npm ci with
  dev deps — prisma generate needs them) → build (`next build`; the
  standalone assembly copies `.next/standalone` + `.next/static` +
  `public`) → runner (non-root `nextjs` user, `ENV
  DATABASE_URL=file:/app/db/custom.db` as the volume mount point,
  `AUTH_SECRET`/`NEXT_PUBLIC_SITE_URL`/rate-limit overrides injected at
  runtime, `HEALTHCHECK` against `/api/health`, `EXPOSE 3000`, `CMD
  ["node", "server.js"]`).
- `.dockerignore` — `node_modules`, `.next`, `db/*.db`, `.git`,
  `skills/` (the 200-folder skills tree is reference material, not a
  runtime dependency — and it is already excluded from every
  toolchain), `docs/screenshots`, `tests`, `dev.log`, `server.log`.
- `docs/DEPLOYMENT.md` — a Docker section with the HONEST label: the
  image recipe follows the standalone-artifact pattern but was NOT
  build-tested in this environment (no Docker daemon in the sandbox —
  verified); the local gate remains the only gate; `docker build`
  smoke instructions for the operator.
- The PAD §10 LOW row closes with the same honest labeling. The gate
  itself proves the Dockerfile breaks nothing (it is not imported by
  any toolchain).

### R5 — Full gate + paired re-verification + docs

- Gate: lint → typecheck → **126 unit** (114 + 4 dummy-hash + 5
  db-errors + 3 registrationOpen) → build → **65 smoke** (60 + the
  race-envelope pin + the timing-parity pin + the closed-gate ×3) →
  **197 e2e** (unchanged — the new contracts live in the deterministic
  layers) — **388 checks total** (final counts from the runs, documented
  everywhere).
- Re-verification: word parity 1.0000 ×8 (fresh port, fresh boot — the
  zombie-server discipline); the RED probe families re-run GREEN on the
  remediated build (the timing ratio collapses to ~1x; the parallel
  register race yields ONLY 201/409 envelopes — zero bare 500s; the
  closed gate 403s on a gated boot; the Dockerfile present); the
  mobile-nav paired probe; console sweep on the touched routes; axe
  /dashboard + /demo still zero.
- Screenshots: the standard set refreshed (VLM spot-check).
- Docs: PAD (revision block; ledger **D83–D86**; §7 counts; §8.2 env
  table + `ALLOW_REGISTRATION`; §10 MEDIUM + LOW rows closed; §11 key
  files), AGENTS (counts; **gotcha 31** — the enumeration-timing class
  + the true-parallel-socket survey method), CLAUDE (session-17
  context), README (badge, the auth row's constant-time claim, the
  closed-registration troubleshooting row, env table + Dockerfile
  pointer), the SKILL doc v2.16.0 (**lessons 42–43**), `.env.example`
  (+`ALLOW_REGISTRATION`), `docs/DEPLOYMENT.md` (the Docker section),
  the remediation plan (this file, ticked), the session log
  `docs/session_29.md`, the repo `worklog.md`.
- Commit (Conventional Commits + emoji) + SSH push via
  `docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified).

## Validation of this plan against the codebase (pre-execution)

- `auth.ts` re-read: `dummyPasswordHash` fits the module's crypto
  family; module-init generation keeps it a per-process constant (the
  stable timing floor); `registrationOpen` follows the
  env-parse-then-fallback pattern of `authRateLimit`'s
  AUTH_RATE_LIMIT_MAX. The co-located `auth.test.ts` already imports
  the module in a node environment — no `next/headers` side effects
  block the import ✓
- `login/route.ts` re-read: the fix is the two-line
  storedHash/passwordOk restructure of the existing `if (!user ||
  !verifyPassword(...))` — the 401 envelope, its code, and its message
  are byte-identical; valid logins gain zero work ✓
- `register/route.ts` re-read: the gate slots after the rate-limit
  block (mirrors the 429 ordering); the P2002 catch wraps ONLY the
  `create` call; the 409 envelope mirrors the sequential-duplicate
  response's exact code + message ✓
- `Prisma.PrismaClientKnownRequestError` verified constructible with
  `.code === "P2002"` in THIS repo's generated client (node -e probe) ✓
- P2002 exposure scan: `User.email @unique` is the only unique
  constraint reachable through a raw `create` (Subscriber goes through
  an idempotent upsert; DemoRequest/Workflow carry no uniques) ✓
- Smoke script re-read: the server boot line takes
  `AUTH_RATE_LIMIT_MAX=50` in place (no existing auth-429 pin —
  verified; the newsletter + generate 429 pins use their own buckets);
  the race/timing/closed-gate pins slot after the existing auth block;
  the auth-POST arithmetic: 6 existing + 10 race + 14 timing = 30 < 50 ✓
- e2e budget recount: the register specs + auth specs run against the
  default-open gate (ALLOW_REGISTRATION unset) — zero spec changes, zero
  budget movement; the F1 fix only ADDS latency to the unknown-email
  path (~34ms — invisible to the specs) ✓
- Pin-conflict scan: no existing unit/smoke/e2e pin asserts login
  latency, register race behavior, or a registration gate; the smoke
  wrong-password pins keep their envelope contract unchanged ✓
- Docs-truth scan: README documents the auth rate limit but says
  nothing about enumeration timing (the new row ADDS the truth); no doc
  claims a registration gate or a Dockerfile today ✓

## Execution order

R1 (RED unit + smoke timing pin → the dummy hash + login route →
GREEN) → R2 (RED unit + smoke race pin → db-errors + the catch →
GREEN) → R3 (RED unit → the gate + smoke closed-server pins → GREEN) →
R4 (Dockerfile + .dockerignore + DEPLOYMENT.md) → full gate → paired
re-verification → screenshots → docs (R5) → commit + SSH push per the
runbook.

### ToDo checklist

- [x] R1: RED `dummyPasswordHash` unit cases (4 × not-exported observed) + the smoke timing-parity pin (RED observed at 11.38x, then 10.49x — the enumeration side-channel) → the dummy hash + the login-route restructure → GREEN (126/126 unit; the pin at 1.07x / 0.66x across runs — both paths scrypt-dominated; the GREEN probe ratio 1.0x: unknown 34.5ms vs wrong-pw 34.9ms)
- [x] R2: RED `isUniqueConstraintError` unit cases (5 × module-not-found observed) + the smoke race-envelope pin → `db-errors.ts` + the register-route catch → GREEN (the probe's pre-fix RED: 10 parallel sockets → {"201":1,"409":8,"500":1} — the loser a bare 500 with an EMPTY body and no content-type; post-fix the probe yields only 201/409 envelopes and the smoke pin passes)
- [x] R3: RED `registrationOpen` unit cases (3 × not-exported observed) → the register-route gate + the smoke closed-server pins → GREEN (403 + REGISTRATION_CLOSED + the demo user still signs in on the :3220 gated boot; pre-fix RED observed as 409 EMAIL_TAKEN — no gate on the old build; one zombie-server twist en route: the syntax-error-crashed first run orphaned a :3210 server whose stale answers masked the fresh boot until the port moved to :3220)
- [x] R4: the Dockerfile (multi-stage deps→build→runner on node:22-alpine, non-root, /app/db volume, HEALTHCHECK /api/health) + `.dockerignore` (skills/, screenshots, test artifacts excluded) + the DEPLOYMENT.md §8 runbook (honestly labeled NOT build-tested — no Docker daemon in this environment; the local gate remains the only gate)
- [x] Full gate: lint ✓ → typecheck ✓ → 126/126 unit → build ✓ → 65/65 smoke → 197/197 e2e (388 checks, no flake)
- [x] Paired re-verification: word parity 1.0000 ×8 (reference UNCHANGED); the RED probe families re-run GREEN (timing ratio 1.0x; the race probe → only 201/409 envelopes, zero bare 500s; the gated boot 403s — pinned deterministically by the smoke :3220 server); mobile-nav paired probe: the clone's panel byte-identical with the live's (7 rows × 44px, opened by a REAL tap — no Tailwind v4 bug; the live's burger remains D32-blocked); the standing drift battery GREEN before the fixes
- [x] Screenshots: the standard 20-shot set refreshed against the remediated build (canonical re-seeded workspace; VLM spot-checks ×5 all PASS — the dashboard's 5-point contract, the resilience banner pair, the login card's 5-point contract, the demo form trio, the mobile menu trio)
- [x] Docs: PAD (revision block; D83–D86; §7.1/7.2/7.3 counts; §8.2 env table +ALLOW_REGISTRATION; §8.3 Docker; §10 MEDIUM + LOW rows CLOSED; §11 key files +db-errors.ts +Dockerfile), AGENTS (gotcha 31 + counts), CLAUDE (session-17 context + checklist counts), README (388 badge + constant-time auth row + closed-registration/race/timing troubleshooting rows + env table + Docker pointer), SKILL v2.16.0 (lessons 42–43), `.env.example` (+ALLOW_REGISTRATION), DEPLOYMENT.md (env table + the §8 Docker runbook; push runbook renumbered §9), session log `docs/session_29.md`, worklog, this plan ticked
- [x] Commit (Conventional Commits + emoji) + SSH push via `docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified: remote refs/heads/main @ d40f047 == local HEAD, tracking ref synced, temp key shredded)
