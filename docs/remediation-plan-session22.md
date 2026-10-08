# Remediation Plan — Session 22 (2026-10-09)

**Scope:** Fix the issues, bugs and gaps found by the Session 22
mutation-concurrency audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** the standing drift battery first (word parity **1.0000
on all 8 routes**, both sides rendered in Chromium — the reference is
UNCHANGED since Session 21; the mobile-nav paired real-touch probe: the
clone's burger opens with a REAL tap into the byte-identical panel — the
same seven rows (6 anchors + the Log In button), every row exactly 44px,
while the live's burger remains pointer-blocked (D32) — **no Tailwind v4
bug**; the live LOGIN re-verified with the operator credentials — D62
holds). Then the Session-22 NEW audit surface — the layer the prior
sessions suggested and nobody had systematically surveyed:

1. **The mutation-concurrency layer (the UPDATE/DELETE twin of S17's
   register race):** S17 raced CREATE (findUnique→create → P2002 → the
   409 classifier, D-facto fixed); S21 capped the CREATE frequency. But
   the `[id]` mutation routes still run the **read-check-act** pattern:
   `findFirst` (ownership) → `request.json()` (a window WIDE enough to
   stream a full under-ceiling body) → `update`/`delete` by bare `id`.
   Nothing classifies **P2025** (record-not-found) anywhere in the
   codebase — `grep P2025 src/` returns only the S17 unit pin that
   *rejects* it as a P2002. Probed on a probe-only DB
   (`db/probe-s22.db`, gotcha-30 discipline):
   **Race B (PATCH-vs-DELETE, the deterministic one):** a ~100KB PATCH
   body (under the S20 128KB ceiling) streamed at 60KB/s parses for
   ~1.7s; a DELETE fired at +0.7s commits mid-parse; the PATCH's
   `update()` then throws P2025 → the apiRoute wrapper answers the
   **500 INTERNAL_ERROR envelope** — **3/3 tries**. A legitimate
   two-tab user (rename in one tab, delete in the other) sees
   "Something went wrong on our side. Please try again."
   **Race A (DELETE‖DELETE double-fire):** six-parallel-curl probe on
   one victim — the loser whose `findFirst` passed before the winner's
   delete committed reads P2025 → **500 INTERNAL_ERROR (2/5 tries** in
   the 2-parallel probe; nondeterministic — which is exactly the
   problem: the same user action answers 404 or 500 depending on
   scheduling luck). **F1.**

2. **The cross-user ownership pin gap:** the ownership (IDOR) guard on
   the `[id]` routes is enforced by the `findFirst({ id, userId })`
   pre-check — but NO wire-level pin anywhere proves user A cannot
   read/patch/delete user B's row (the smoke and e2e suites only ever
   act as the row's owner; `grep ownership|cross-user` over the suites
   returns nothing). The S22 fix moves the ownership into the write's
   WHERE clause — a regression there (a dropped `userId`) would be
   caught by NOTHING today. **F2.**

Also surveyed and found CLEAN or ADJUDICATED (non-findings, this
session's evidence): **the performance layer** (the S21-suggested
Lighthouse-style budgets — Chromium-rendered on the drift server:
landing TTFB 22ms / LCP 732ms / 2.2MB transfer (the 1.9MB hero video is
the reference's own parity asset) / 860 DOM nodes; login LCP 188ms /
6.3KB; dashboard LCP 120ms / 11.1KB / 314 DOM nodes — the S21 ceiling
holding; every route comfortably inside the Core-Web-Vitals "good"
bands), **the SEO static-asset layer** (re-verified: `sitemap.xml`
answers 200 `application/xml` with all 8 routes + lastmod; `robots.txt`
disallows `/api/` + `/dashboard` — the honest SUPERSET semantics;
`og-image.png` a real 1200×630 PNG; `manifest.json` valid; the per-route
`routeMetadata` head pattern intact), **the PATCH numeric-integrity
layer** (re-verified: `runs`/`successRate`/`timeSavedHours` remain
server-controlled), **the PATCH/DELETE rate-limiter question**
(adjudicated NON-finding: PATCH/DELETE grow no rows — the S21 rationale
for the creation ceiling was unbounded ROW GROWTH; a rename-spam on
one's own bounded workspace is write amplification, not data growth,
and adding limiters would tax the UI's own pause/resume/delete flows),
and **the dependency currency** (the standing re-run: the documented
F10 chain only; majors only).

## The fixes (TDD-first)

### R1 — the ownership-scoped atomic writes (F1)

The race is closed **by construction**, not by catching its symptom: the
write itself carries the ownership predicate, so there is no window
between check and act.

1. **PATCH** (`src/app/api/workflows/[id]/route.ts`): the pre-parse
   `findFirst` pre-check is REMOVED (the atomic write is the check —
   this also drops one query); after validation,
   `db.workflow.updateMany({ where: { id, userId }, data: patch })` —
   `count === 0` → the honest `404 NOT_FOUND` (the same answer the
   sequential miss always gave); `count === 1` → a follow-up
   `findFirst` returns the row the smoke pins expect (`data.status`,
   `data.name`). `updateMany` NEVER throws P2025.
2. **The empty-patch preservation:** a `{}` body historically answered
   `200 + the row` (`update({data:{}})` returns the row). Prisma's
   `updateMany({data:{}})` is a no-op returning `count: 0` **even when
   the row exists** (probed) — it cannot distinguish "no fields" from
   "no row". The route special-cases the empty patch: `findFirst` →
   200 + row / 404. The long-standing contract is preserved exactly.
   (A row deleted between `updateMany` and the follow-up `findFirst`
   answers 404 — honest for the row's CURRENT state; the client
   refreshes and sees the truth.)
3. **DELETE**: `db.workflow.deleteMany({ where: { id, userId } })` —
   `count === 0` → 404; else `ok({ deleted: true })`. One atomic query,
   race-free: the double-fire loser deterministically reads 404 (was a
   404-or-500 coin flip, probed 2/5).
4. **GET** stays as-is (`findFirst`, read-only, no race).

### R2 — the wire-level pins (F1 evidence + F2 guard)

A new "Session 22" smoke section (after the Session-21 section), riding
a SECOND and THIRD registered account (fresh per-user workflow-creation
buckets — the main user's `WORKFLOW_RATE_LIMIT_MAX=2` bucket is already
consumed by the S21 pins):

1. **The cross-user ownership battery (F2):** register + login user B;
   B creates a workflow; the MAIN session (user A / demo) probes
   GET/PATCH/DELETE on B's row → **404 ×3**; B's GET still answers 200
   (the row survived the attack).
2. **The empty-patch contract:** a `{}` PATCH on B's row → 200 + the
   row's name (the preserved long-standing behavior — the Prisma
   updateMany-empty quirk pin).
3. **Race B (deterministic RED):** B creates a second workflow; a
   ~100KB PATCH body streams at 60KB/s (~1.7s parse); a DELETE fires at
   +0.7s; the PATCH must answer **404 + NOT_FOUND** (pre-fix: 500 —
   observed 3/3 in the probe) and the DELETE **200**.
4. **Race A (the invariant):** user C creates one workflow; SIX
   truly-parallel DELETEs (independent curl processes — the S17
   wire-level-concurrency lesson) → **exactly one 200** and every
   answer an envelope in {200, 404} — **zero 500s** (pre-fix: the
   interleaved loser hit the unclassified P2025's 500 in 2/5 probe
   tries).

### Validation before execution (performed against the codebase)

- Prisma semantics probed on the probe DB: `updateMany` matching →
  `count: 1`; no-match → `count: 0`; **empty data → `count: 0` even for
  an existing row** (the quirk driving R1.2); `deleteMany` → 1/0/0
  (match/again/no-match — never throws); `update` on a missing row →
  P2025 (the pre-fix mechanism confirmed).
- Response-contract scan: the smoke pins read `data.status` (pause pin)
  and `data.ok`/`data.id` (create/rename/delete pins) — R1 preserves
  every shape; the e2e suites drive PATCH/DELETE only through the UI
  (no direct route pins to break); NO 413/size pin targets the
  workflows PATCH route (dropping the pre-parse findFirst cannot flip a
  pinned 404-before-413 ordering — no such pin exists).
- Client-contract scan: `dashboard-app.tsx`'s `!res.ok → banner` paths
  are unchanged (the sequential already-deleted 404 shows the same
  banner today — no regression, no e2e impact); `busyId` already guards
  same-row double-clicks in one tab.
- Bucket arithmetic: the S21 section leaves the MAIN user's creation
  bucket exhausted (2/2); B and C are FRESH users → 2 and 1 creates
  respectively (≤ `WORKFLOW_RATE_LIMIT_MAX=2` each); the auth-limiter
  budget grows by 4 POSTs (~33 total ≤ the pinned 50).

## Post-execution verification

1. Full gate: lint → typecheck → unit (156) → build → smoke (103 + the
   new Section) → e2e (197) — the gate count rises with the new pins.
2. The race probe re-run on the remediated build (probe-only DB):
   Race B → PATCH 404 / DELETE 200; Race A → one 200 + N×404, zero
   500s.
3. The drift battery re-run (the [id] route was touched — the
   regression guard): word parity 1.0000 ×8, mobile-nav byte-identical,
   D62 holds.
4. The standard 20-shot screenshot refresh + VLM spot-checks ×5.

## ToDo

- [x] R1.1 PATCH → ownership-scoped `updateMany` (+ the follow-up read)
- [x] R1.2 the empty-patch preservation branch
- [x] R1.3 DELETE → ownership-scoped `deleteMany`
- [x] R2 the smoke "Session 22" section (cross-user battery + contracts + both races) — 14 checks
- [x] RED observed on the pre-fix build (Race B → 500 + INTERNAL_ERROR envelope code; 115 passed / 2 failed)
- [x] Full gate green — 470 = 156 unit + 117 smoke + 197 e2e (smoke run twice, no flake)
- [x] Race probe re-run GREEN — Race B: PATCH 404 ×3 / DELETE 200 ×3; Race A: one 200 + one 404 every try, zero 500s
- [x] Drift battery re-run GREEN — word parity 1.0000 ×8, mobile-nav byte-identical (7 × 44px, REAL tap), D62 holds
- [x] Screenshots (20) + VLM spot-checks (5) PASS — after adjudicating the FIFTH check-prompt drift (a FAIL-with-empty-DEVIATIONS on the dashboard shot, disproven by the open-description probe)
- [x] PAD ledger D97–D98 + §7 counts + §11 key files (incl. the new [id]-route row)
- [x] AGENTS gotcha 36 + counts (117/470) + the invariant line naming the ownership-scoped writes
- [x] CLAUDE session-22 context + the stale stack-table counts fixed (smoke 117, unit 156)
- [x] README badge/counts (470/117) + the concurrency row
- [x] SKILL v2.21.0 lessons 52–53
- [x] .env.example verified in sync (no new env vars — the fix is code-only)
- [x] remediation plan ticked + session log `docs/session_41.md`
- [x] worklog.md updated
- [x] commit on main + SSH wrapper push (wrapper-verified — the hash recorded below post-push)
