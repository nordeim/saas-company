# Remediation Plan — Session 23 (2026-10-09)

**Scope:** Fix the issues found by the Session 23 client-side
failure-class honesty audit of this repository (the dashboard's
mutation-feedback semantics — the "optimistic-UI semantics" candidate the
Session-42 log suggested as the next audit surface), executed TDD-first,
gated by the full quality gate (§7.3 of the PAD), and re-verified by the
standing paired survey.

**Audit method:** the standing drift battery first (word parity **1.0000
on all 8 routes**, both sides rendered in Chromium — the reference is
UNCHANGED since Session 22; the mobile-nav paired real-touch probe: the
clone's burger opens with a REAL tap into the byte-identical panel —
seven rows, every row exactly 44px — **no Tailwind v4 bug**; the live's
burger remains pointer-blocked, D32; the live LOGIN re-verified — D62
holds). The SEO surface re-verified CLEAN (sitemap 200 `application/xml`
×8 routes + lastmod; robots the honest superset semantics; og-image a
real 1200×630 PNG; manifest valid). The dependency currency re-adjudicated
(the documented F10 chain only; majors only — unchanged). Then the
Session-23 NEW audit surface — the CLIENT side of the mutation contract:

1. **The honest-404 client dispatch (F1):** Session 22 closed the
   SERVER-side mutation race by construction — the raced PATCH/DELETE now
   answers the honest `404 NOT_FOUND`. But the client's catch treats a
   404 exactly like a network fault: the banner says **"Could not update
   that workflow. Try again."** — a LIE (the row is gone server-side;
   every retry 404s forever), and the **ghost row stays in the list**
   (the refresh only runs on success). Probed on the probe-only server
   (:3160, `db/probe-s23.db`, gotcha-30 discipline) with two browser
   contexts — tab B deletes a row through the UI; tab A (stale list)
   clicks Pause on the deleted row: the banner rendered the retry lie
   AND the row was still mounted. Same defect class as the Session-13
   401-sentinel ("a 401 is not a network fault — failure CLASSES need
   distinct UI contracts") — the 404-after-race class was never given
   its own contract. **F1.**

2. **The refresh() in-flight ordering guard (F2):** `refresh()` has no
   guard against overlapping responses. Two concurrent actions on
   DIFFERENT rows (Pause A + Delete B — `busyId` only guards the same
   row) each fire a refresh GET; if the OLDER response lands LAST (a
   slow proxy, a GC pause, any reordering), its stale snapshot
   overwrites the newer one and **the deleted row resurrects**. Probed
   deterministically: route-delay the first post-mutation GET by 1200ms
   (its server-side snapshot is taken BEFORE the DELETE commits), let
   the second GET through immediately — the list first showed the truth
   (B gone), then the delayed stale response landed and **B resurrected
   while A's pause held** (the stale snapshot wins wholesale, not
   per-field). The client has no last-write-wins discipline for its own
   fetches. **F2.**

Also surveyed and found CLEAN or ADJUDICATED (non-findings, this
session's evidence): **the 401 redirect contract** (re-verified by the
Session-13 suite's pins (a)-(c) — the redirect lands and the login card
renders; the transient pre-navigation banner frame is unobservable in
the pinned flow, and the R1.3 early-return below makes the documented
"the banner never renders for 401s" contract exact), **the composer's
degrade path** (generate 429/failure → the deterministic template — D80,
pinned), **the empty-patch client contract** (the UI never sends `{}` —
every toggle carries `status`; the S22 server branch protects the wire
contract for other clients), **the stats/total honesty at the UI layer**
(S21's meta consumption re-verified in code), and **the
dependent-currency standing re-run** (above).

## The fixes (TDD-first)

### R1 — the client failure-class dispatch (F1)

The catch block keeps its Session-12 contract for network-level faults
(retry IS plausible → the banner). New dedicated branches BEFORE the
throw, mirroring the S13 401 pattern (a failure class that must not wear
the retry banner):

1. **PATCH 404** (`toggleStatus`): the row was deleted out from under
   this tab (another tab/device — S22's by-construction answer). The
   honest mirror: remove the row locally (and decrement `total`), then
   `await refresh()` (re-sync stats/total/list with the server's
   truth), then announce politely — `${w.name} is no longer in the
   workspace.` via the S14 `role="status"` live region. No banner: this
   is not an error, it is the truth catching up.
2. **DELETE 404** (`remove`): idempotent success — the row is gone,
   which is exactly what Delete asked for. `await refresh()` +
   announce `${w.name} was already removed.`
3. **The 401 early-return** (all three catches — toggleStatus/remove/
   compose): `if (e instanceof SessionExpired) return;` — the S13
   comment says "the banner never renders for 401s"; the code now
   enforces exactly that (previously the redirect's unmount made it
   observably true; now it is true by construction).

### R2 — the refresh() in-flight ordering guard (F2)

A `useRef` sequence counter: every `refresh()` invocation takes the
next number; a response whose number is not the CURRENT one (a newer
refresh superseded it) is DROPPED before any `setState`. The newest
snapshot always wins — the deleted row cannot resurrect, and a slow
page-load-era response can never clobber a post-mutation one.

### Validation before execution (performed against the codebase)

- Response-contract scan: the S22 smoke pins target the SERVER envelope
  (404 + NOT_FOUND); no existing unit/smoke/e2e pin asserts the client
  banner on a 404 — the new branches break nothing pinned.
- `session-lifecycle.spec.ts` re-read: pin (a) asserts the redirect
  lands (login card visible) — R1.3's early-return only removes the
  transient banner frame; pin (d) asserts the ABORT banner — the catch
  contract is untouched for network faults.
- `resilience.spec.ts` re-read: route-abort faults reject at `fetch`
  (never reach a `res.status` read) — the R1 branches are unreachable
  for aborts; the banner pins hold.
- The e2e `error-boundary.spec.ts` mocks fulfill `/api/workflows` with
  bare arrays — R2's guard sits BEFORE the payload shape checks and is
  a no-op for a single in-flight response (seq always current).
- The `announce` copy strings ride the existing `role="status"`
  `aria-live="polite"` region (S14 D75) — no new live-region markup.

### Post-execution verification

1. Full gate: lint → typecheck → unit (156) → build → smoke (117) →
   e2e (197 + the new Session-23 spec) — the gate count rises with the
   new pins.
2. The client-honesty probe re-run on the remediated build (probe-only
   DB): F1 → no retry banner, the ghost row removed, the announce
   rendered; F2 → no resurrection (B stays gone; A's pause holds).
3. The drift battery re-run (the client component was touched — the
   regression guard): word parity 1.0000 ×8, mobile-nav byte-identical,
   D62 holds.
4. The standard 20-shot screenshot refresh + VLM spot-checks ×5.

## ToDo

- [x] R1.1 PATCH 404 → the local mirror + refresh + the polite announce
- [x] R1.2 DELETE 404 → the idempotent-success contract
- [x] R1.3 the SessionExpired early-return in all three catches
- [x] R2 the refresh() sequence guard (stale snapshots dropped)
- [x] RED observed on the pre-fix build — the new e2e pins failed 3/3 (the (a)/(b) ghost+banner, the (c) resurrection)
- [x] Full gate green — 473 = 156 unit + 117 smoke + 200 e2e (the count rose 470 → 473)
- [x] The client-honesty probe re-run GREEN (no retry lie, no ghost, no resurrection — bannerText reads the route announcer, not actionError)
- [x] Drift battery re-run GREEN — word parity 1.0000 ×8, mobile-nav byte-identical, D62 holds
- [x] Screenshots (20) + VLM spot-checks (5) PASS
- [x] PAD ledger D99–D100 + §7 counts + §11 key files
- [x] AGENTS gotcha 37 + counts + the invariant line naming the client dispatch
- [x] CLAUDE session-23 context
- [x] README badge/counts + the client-honesty row
- [x] SKILL v2.22.0 lessons 54–55
- [x] .env.example verified in sync (no new env vars — the fixes are client-code only)
- [x] remediation plan ticked + session log `docs/session_43.md`
- [x] worklog.md updated
- [x] commit on main + SSH wrapper push (wrapper-verified — the hash recorded below post-push)
