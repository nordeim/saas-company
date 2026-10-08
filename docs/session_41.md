# Session 41 (the Session-22 remediation transcript)

The task chain continued from `docs/session_40.md` / `docs/session_39.md`
(both transcripts of the Session-21 cycle — wrapper-verified at
`0d9d860` + the transcript commits `39e3c10`/`5d04c52`). This cycle is
**Session 22**.

The sandbox had been fully reset: fresh `git clone` (HEAD `5d04c52` on
main, == origin/main, clean). Environment rebuilt — `npm install`, `.env`
from `.env.example` with a fresh `AUTH_SECRET`, `prisma generate`,
`db:push` + `db:seed` (canonical `e7f6c011`). The exported-`DATABASE_URL`
trap neutralized per-command all session (gotcha 1). No zombie servers
(the reset reaped them; verified).

All repo docs re-read (AGENTS 35 gotchas, CLAUDE, README, PAD at D96,
SKILL v2.20.0) + the skills catalog consulted; `skills/` excluded from
every toolchain (re-verified).

**Baseline gate: 456 checks ALL GREEN** (156 unit + 103 smoke + 197 e2e —
no flake).

**Drift battery (recreated, EXPLICIT `--base` per gotcha 33 — a fresh
:3140 runner, Chromium-rendered both sides per gotcha 34):** word parity
**1.0000 ×8** (reference UNCHANGED since Session 21); mobile-nav paired
real-touch probe: clone byte-identical (**7 rows — 6 anchors + the Log In
button — every row exactly 44px, a REAL tap opens the panel; no Tailwind
v4 bug**; the live's burger remains pointer-blocked, D32). Live LOGIN
re-verified with the operator credentials — D62 holds.

Now the **Session-22 audit** — the NEW surface (S21's suggested next
layers): the **mutation-concurrency semantics** (the RACE class on the
UPDATE/DELETE side — S17's register race closed CREATE's P2002 window;
nobody had surveyed the `[id]` routes' read-check-act) and a quick
**performance-budget survey**:

- **RED evidence CONFIRMED — F1 (the mutation-concurrency layer):** on a
  probe-only DB (`db/probe-s22.db`, gotcha-30), a ~100KB PATCH body
  streamed at 60KB/s parses ~1.7s; a DELETE fired at +0.7s commits
  mid-parse; the PATCH's `update()` throws **P2025** and the wrapper
  answers the **500 INTERNAL_ERROR envelope — 3/3 tries** (a legitimate
  two-tab user: rename in one tab, delete in the other). The parallel
  DELETE‖DELETE double-fire answered **500 in 2/5 tries** —
  nondeterministic (the same user action answers 404 or 500 on
  scheduling luck). Nothing in the codebase classifies P2025 (grep
  returns only the S17 unit pin that REJECTS it as a P2002).
- **F2 (the pin gap):** the ownership (IDOR) guard on the `[id]` routes
  had NO wire-level pin anywhere — the suites only ever act as the row's
  owner.
- **Adjudicated CLEAN with evidence:** the performance layer (landing
  TTFB 22ms / LCP 732ms / 860 DOM nodes; login LCP 188ms / 6.3KB;
  dashboard LCP 120ms / 314 DOM nodes — the S21 ceiling holding; the
  2.2MB transfer is the reference's own 1.9MB hero video, a parity
  asset), the SEO surface (re-verified: sitemap 200 `application/xml` ×8
  routes; robots the honest superset semantics; og-image a real
  1200×630 PNG; manifest valid), the PATCH numeric-integrity layer
  (re-verified), the PATCH/DELETE limiter question (NON-finding — no row
  growth; limiters would tax the UI's own mutation flows), and the
  dependency currency (the documented F10 chain only).

Remediation plan session22 written + validated (Prisma semantics probed
on the probe DB: `updateMany` no-match → count 0, **empty data → count 0
even for an existing row** — the quirk driving the empty-patch branch;
`deleteMany` → 1/0/0, never throws; response-contract scan: the smoke
pins read `data.status`/`data.ok`/`data.id` — every shape preserved; no
413/size pin targets the workflows PATCH; the client's `!res.ok → banner`
paths unchanged).

**TDD-first — RED:** the smoke "Session 22" section written FIRST (14
checks: users B and C with fresh creation buckets; the cross-user battery
×4; the empty-patch contract ×2; Race B ×3; Race A ×2; setup ×3). Against
the pre-fix build: **FAIL — the raced PATCH answered 500 + INTERNAL_ERROR
(2 failed, 115 passed)**. TWO mid-execution pin bugs caught BY the pins
(the S21 family): curl's `-w '%{http_code}'` writes NO trailing newline
(a concatenated `cat c*` can never match `^200$` — count per-file), and
bash's `${f/c/r}` substitution rewrote the first 'c' in the mktemp PATH,
not the c<index> stem (pair by explicit index).

**GREEN:** the fix closes the race **by construction** — the writes carry
the ownership predicate: PATCH rides
`updateMany({ where: { id, userId }, data })` (count 0 → the honest 404;
a follow-up `findFirst` returns the row; the empty-patch `{}` body keeps
its 200 + row contract via its own read branch) and DELETE rides
`deleteMany({ where: { id, userId } })` (one atomic query; count 0 → 404;
the double-fire loser deterministically reads 404). Lint ✓ typecheck ✓
**156/156 unit** ✓ build ✓ **SMOKE 117/117** (run twice — no flake) ✓
**197/197 e2e** ✓.

**FULL GATE: 470 checks green** (156 unit + 117 smoke + 197 e2e).

Re-verification: the race probe GREEN on the remediated build (Race B:
PATCH 404 ×3 / DELETE 200 ×3 — was 500 ×3; Race A: one 200 + one 404
every try, zero 500s — was a 404/500 coin flip). The drift battery
re-run GREEN (the route was touched — zero regressions: word parity
1.0000 ×8, mobile-nav byte-identical, D62 holds).

Screenshots: the standard 20-shot set refreshed (a fresh :3140 boot with
`AUTH_RATE_LIMIT_MAX=50` — the first capture run silently exhausted the
default-10 auth bucket and shot the LOGIN page into 08/15; re-booted with
the e2e convention and re-captured; the DB logical state verified
canonical `e7f6c011` before and after — the md5 drift is SQLite page
artifacts, not mutations). VLM spot-checks ×5 — adjudicating the FIFTH
check-prompt drift along the way: a FAIL-with-empty-DEVIATIONS verdict on
the dashboard shot, disproven by the open-description probe (every
contract element confirmed: 5 / 7,120 / 160 / 99.2%, the composer
placeholder, "6 total", the seeded rows) + the untouched dashboard bytes
+ the e2e suite. **VLM: 5/5 PASS.**

DOCUMENTED: PAD (revision block, ledger D97–D98, §7 counts 156/117/197 =
470, §11 key files incl. the new `[id]`-route row), AGENTS (gotcha 36 +
counts + the invariant line naming the ownership-scoped writes), CLAUDE
(session-22 context + the stale stack-table counts fixed), README (470
badge + the concurrency row + every stale count), SKILL v2.21.0 (lessons
52–53), `.env.example` verified in sync (no new env vars — the fix is
code-only), remediation plan session22 (ticked), this session log, the
repo worklog.

Survey scripts persisted under `/home/z/my-project/scripts/`
(survey-session22-drift, probe-s22-race, probe-s22-prisma-semantics,
survey-s22-perf, capture-s22-shots, vlm-check-s22).

**Session 22 complete.**
