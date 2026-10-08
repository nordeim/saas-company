# Session 29 Log — Constant-Time Login, the Register Race & the Deployment Gate (the Session-17 Remediation, 2026-10-08)

Continuing from Session 27/28 (main @ 685aab6 — the verified Session-16
push `f53e6eb` + the session-log update). The mandate: refresh, review
the session-27/28 + remediation-plan-16 docs, re-audit against the live
(with the standing mobile-navigation and Tailwind-v4 vigilance),
remediate TDD-first, re-verify, document, push.

## Phase 0 — The workspace reset

This session began with the sandbox **fully reset** (the prior run died
mid-Session-17 to a broken tool session AFTER its code-level audit had
identified the four candidate defects — its findings were re-derived
from scratch here): fresh `git clone`, `npm install`, `cp .env.example
.env` (with a fresh `AUTH_SECRET`), `prisma generate`, `db:push` +
`db:seed` (seed-checksum `e7f6c011`). The exported-DATABASE_URL trap was
LIVE in the new shell (`file:/home/z/my-project/db/custom.db` — a stale
path) — neutralized per-command (`env -u DATABASE_URL`) all session.
No zombie servers this time (the reset reaped everything — verified
before the first boot); no Docker daemon (verified — F4 ships with
honest labeling).

## Phase 1 — Docs & baseline

- Root docs (AGENTS 30 gotchas / CLAUDE / README / PAD Session-16
  revision, ledger at D82, §10's open MEDIUM + LOW / SKILL v2.15.0) +
  status docs (session_27, session_28, remediation-plan-16, worklog)
  reviewed; the `skills/` folder excluded from every toolchain
  (re-verified: eslint `ignores` / vitest `include` / tsconfig scope).
- All Session-16 fixes verified in code before any change:
  `generateRateLimit` (per-USER buckets + the override), the
  `Cache-Control: private, no-store` seam in `api.ts`, and
  `poweredByHeader: false` — plus `.env.example` matching the codebase.
- Baseline gate: lint ✓ typecheck ✓ Vitest 114/114 ✓ build ✓ smoke
  60/60 ✓ Playwright 197/197 — **371 checks, fully green, no flake.**

## Phase 2 — The audit (the reference UNCHANGED; four new survey surfaces)

**Drift battery** (8 routes, fresh :3031 boot, live vs clone): word
parity **1.0000 on every route** — the live is unchanged since Session
16.

**Standing mobile-nav paired probe** (real-touch 390×844): the clone's
burger opens with a REAL tap into the byte-identical panel — the same
seven rows (Features / How It Works / Pricing / Testimonials / FAQ /
Log In / Get Started), all exactly 44px, matching the live's panel
(opened via JS click — the live's burger remains pointer-blocked,
D32). **No Tailwind v4 bug.**

The Session-17 NEW surfaces — layers no prior session systematically
surveyed:

1. **The account-enumeration timing layer (CWE-208):** the login route
   short-circuits `!user || !verifyPassword(...)` — the unknown-email
   path skips scrypt entirely. Probed on a fresh :3030 production
   server (9+9 warm samples): **unknown-email median 3.5ms vs
   wrong-password median 34.1ms — a 9.8x latency delta behind an
   otherwise byte-identical 401 INVALID_CREDENTIALS envelope**. The
   rate limit slows but does not stop the census (1,440
   candidates/day/IP; rotating IPs unlimited). **F1.**
2. **The registration-concurrency layer (TOCTOU → unhandled P2002):**
   the register route's `findUnique`→`create` is an async gap. The
   first probe round (8 shared-socket undici fetches) never
   interleaved — undici's pool SERIALIZES on one socket. The
   independent-socket probe (10 raw `http.request`s, `keepAlive:
   false`) triggered it on the first try: **{"201":1, "409":8,
   "500":1} — the loser's unhandled P2002 surfaced as a BARE 500 with
   an EMPTY body and NO content-type** (the envelope contract's worst
   violation). **F2.**
3. **The registration-access-control layer (PAD §10 MEDIUM, the oldest
   open ledger item):** any visitor can mint an account — the register
   route consults no deployment gate (probed: a fresh visitor's POST →
   201 + a signed-in session). **F3.**
4. **The deployment-artifact layer (PAD §10 LOW):** no Dockerfile —
   the standalone build is Docker-ready by Next's design but the repo
   ships no image recipe. **F4.**

Adjudicated CLEAN with evidence: the Subscriber upsert path (the
newsletter's upsert resolves the unique-email conflict internally —
no P2002 exposure), the DemoRequest model (no unique constraint), the
login-card error surfacing (`payload?.error?.message` displays an API
rejection verbatim — a closed-registration message renders with ZERO
client changes), and the e2e/smoke register budgets (the F3 gate
defaults OPEN — every existing contract unchanged).

## Phase 3 — Remediation, TDD-first

The remediation plan (`docs/remediation-plan-session17.md`) was
written and validated against the codebase (seam fits, the
PrismaClientKnownRequestError constructor probed in THIS repo's
generated client, the P2002 exposure scan — `User.email @unique` is
the only raw-create-reachable unique, the smoke auth-POST arithmetic
30 < 50, the pin-conflict and docs-truth scans) before any fix.

**R1 — the dummy-hash constant-time login (F1):** RED first (4 unit
`not a function` + the smoke timing pin RED at **11.38x** — the
enumeration side-channel caught by the suite's first timing pin).
`dummyPasswordHash()` in `src/lib/auth.ts` (module-init salt:hash
decoy, the same 16-byte-salt/64-byte-key scrypt cost, a stable
per-process constant) + the login route's restructure
(`storedHash = user?.passwordHash ?? dummyPasswordHash()` →
verifyPassword runs unconditionally). GREEN: 126/126 unit; the smoke
timing pin at **1.07x / 0.66x** across runs; the GREEN probe ratio
**1.0x** (34.5ms vs 34.9ms).

**R2 — the P2002 race → 409 envelope (F2):** RED first (5 unit
module-not-found). `isUniqueConstraintError()` in the new pure
`src/lib/db-errors.ts` (instanceof PrismaClientKnownRequestError +
code === "P2002" — a duck-typed `{code:"P2002"}` object does NOT trip
it) + the register route's create catch → the exact sequential
duplicate contract (409 EMAIL_TAKEN); every other error rethrows. The
smoke race pin: 10 truly-parallel curl POSTs (independent sockets) —
every response must be an envelope. GREEN across runs.

**R3 — the ALLOW_REGISTRATION gate (F3):** RED first (3 unit
not-exported). `registrationOpen()` in auth.ts (only the exact string
"false" closes; unset/"true"/"0"/"no" stay open — operators opt INTO
closure) + the register-route gate (after the rate limit, before the
body parse) returning 403 REGISTRATION_CLOSED. The smoke closed-gate
pins boot a SECOND mini-server with `ALLOW_REGISTRATION=false`:
register → 403 + the code; the demo user still signs in. Pre-fix RED
observed as 409 EMAIL_TAKEN (the old build registered the user
instead of gating).

**R4 — the Dockerfile (F4):** multi-stage on node:22-alpine (deps →
build with a throwaway DATABASE_URL → runner: non-root node user, the
traced standalone node_modules, the /app/db VOLUME with the absolute
`file:/app/db/custom.db` default, runtime-injected AUTH_SECRET, the
/api/health HEALTHCHECK) + `.dockerignore` (skills/, screenshots, test
artifacts never enter the context) + DEPLOYMENT.md §8. **Honest
labeling: NOT build-tested here (no Docker daemon)** — the local gate
remains the only gate.

**Two mid-execution traps, caught and fixed:**
- A display-layer invisible typo (the S15 gotcha class — the Bash
  output layer SWALLOWED an extra `'` in a smoke line; the file read
  `field "['ok']')"` while displaying `field "['ok']")"`) broke the
  script's parse mid-block. Found by `bash -n` + octal dump; fixed
  byte-wise.
- The resulting mid-script abort ORPHANED the closed-gate server on
  :3210 (bash parses incrementally — the boot lines EXECUTED before
  the parser died, the kill never ran). The next run's fresh boot
  silently lost EADDRINUSE to the zombie, whose OLD-build answers
  (409 EMAIL_TAKEN) masked the fix. Killed-by-fresh-port: the
  closed-gate server moved to :3220. Logged as AGENTS gotcha 31 +
  SKILL lesson 43.

**Full gate: lint ✓ typecheck ✓ Vitest 126/126 ✓ build ✓ smoke
65/65 ✓ Playwright 197/197 — 388 checks, fully green, no flake.**

## Phase 4 — Re-verification & screenshots

- The RED probe families re-run GREEN on the remediated build (fresh
  :3030 boot, fresh scratch DB): the timing ratio **1.0x**; the race
  probe → only 201/409 envelopes, zero bare 500s; the Dockerfile
  present. The gated-boot 403 is pinned deterministically by the smoke
  :3220 server.
- The standing drift battery had already confirmed the reference
  UNCHANGED (word parity 1.0000 ×8; the mobile nav byte-identical,
  real-tap).
- The standard 20-shot screenshot set refreshed against the
  remediated build (the canonical workspace re-seeded first — the
  gotcha-30 discipline); VLM spot-checks ×5 all PASS (the dashboard's
  5-point contract, the resilience banner pair, the login card's
  5-point contract, the demo form trio, the mobile menu trio).

## Phase 5 — Documentation

PAD (revision block; ledger **D83–D86**; §7.1/7.2/7.3 counts; §8.2
env table + `ALLOW_REGISTRATION`; §8.3 Docker; **§10's MEDIUM and LOW
rows CLOSED**; §11 key files), AGENTS (counts + **gotcha 31**),
CLAUDE (session-17 context + checklist counts), README (388 badge,
the constant-time auth row, three new troubleshooting rows, the env
table row, the Docker pointer), the SKILL doc **v2.16.0 (lessons
42–43)**, `.env.example` (+`ALLOW_REGISTRATION`), DEPLOYMENT.md (the
env table + the §8 Docker runbook), the remediation plan session17
(ticked), this session log, the repo worklog.

## Phase 6 — Commit & push

Single `:bug: fix:` commit to `main` (all code + tests + docs +
screenshots), pushed via `docs/ssh_git_wrapper_v3.py` with the
operator-supplied SSH key (the runbook's wrapper-verified sequence);
no branches (the operator contract).
