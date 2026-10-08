# Remediation Plan — Session 20 (2026-10-09)

**Scope:** Fix the issues, bugs and gaps found by the Session 20
method-and-payload audit of this repository against the live reference
(`saas-company.base44.app`), executed TDD-first, gated by the full quality
gate (§7.3 of the PAD), and re-verified by a fresh paired survey.

**Audit method:** the standing drift battery first (word parity **1.0000
on all 8 routes**, both sides rendered in Chromium — the reference is
UNCHANGED since Session 19; the mobile-nav paired real-touch probe:
the clone's burger opens with a REAL tap into the byte-identical panel —
the same seven rows (6 anchors + the Log In button), every row exactly
44px, while the live's burger remains pointer-blocked (D32) — **no
Tailwind v4 bug**; the live LOGIN re-verified with the operator
credentials: sign-in redirects to `/` with the navbar UNCHANGED and
`/dashboard` renders the SPA 404 view even authenticated — D62 holds).
Then the Session-20 NEW audit surfaces — layers no prior session
systematically surveyed:

1. **The method-mismatch layer (the invariant vs the framework's own
   answers):** the architecture invariant says "every API route returns
   `{ ok: true, data }` or `{ ok: false, error: { code, message } }` …
   No route returns bare JSON — including on the crash paths" — but the
   crash-path survey (S19) probed only *exported* methods. The first
   systematic catalog of what the wire carries when a request uses a
   method a route does NOT export (the framework-owned layer that sits
   BELOW every handler — `apiRoute` never sees these): **11 probes answer
   a BARE `405` with an EMPTY body, NO content-type, NO `Allow` header,
   and NO `Cache-Control`** — GET on the six POST-only routes (login,
   register, logout, newsletter, demo, generate), POST on the two
   GET-only routes (me, health), PUT/PATCH/DELETE on workflows, and HEAD
   on a POST-only route. The security headers DO apply (the
   `next.config.ts` set covers framework answers too — verified in the
   catalog). Next's own auto-OPTIONS answers correctly (204 + Allow) and
   unknown API routes serve the app's branded 404 page (adjudicated
   below) — only the method-mismatch answer violates the envelope
   invariant. **F1.**
2. **The request-size layer (the unbounded parse):** every POST/PATCH
   route buffers the full request body into memory at `request.json()`
   with no ceiling anywhere — probed: a **50MB login body was fully
   buffered and JSON-parsed (314ms)** before validation answered 400; a
   10MB newsletter body likewise. The largest real payload in the app is
   < 2KB (login/register/newsletter/demo/workflow-create/generate/PATCH
   are all tiny), the rate limits cap *frequency* (10/15min) but never
   *size*, and `docs/DEPLOYMENT.md` §2's proxy guidance (scheme + XFF)
   says nothing about body caps. A single giant request — or a handful
   within any rate budget — buys hundreds of megabytes of server memory
   for free. **F2.**
3. **The dependency-currency layer** (the standing S19 re-run): `npm
   audit` — exactly the single documented F10 braces chain (lint-toolchain
   only, no new advisories); `npm outdated` — majors only (prisma 6→7/8,
   eslint 9→10, typescript 5.9→7, lucide-react 0.5→1.53) plus the
   in-range Playwright 1.64. **Adjudicated CLEAN** (unchanged from the
   Session-19 adjudication; the overrides remain load-bearing, gotcha 9).

Also audited and found CLEAN or ADJUDICATED (non-findings, this
session's evidence): **the unknown-API-route layer** (`/api/nonexistent`
answers the app's own BRANDED 404 page — browsers get the branded view,
API clients get an honest 404 status; the envelope invariant scopes
implemented routes, and Next's 404-document resource log is inherent
noise on both sides — the D68 parity family), **the OPTIONS layer**
(Next auto-answers 204 + `Allow: OPTIONS, POST` on login / `GET, HEAD,
OPTIONS` on health — a correct standard preflight answer, kept), **the
HEAD-on-GET layer** (auto-derived by Next from GET exports — health's
Allow lists it), **the cookie-attribute layer** (re-verified in
`src/lib/auth.ts`: `httpOnly: true`, `sameSite: "lax"`, `secure` in
production, `path: "/"`, the 7-day `maxAge` — the CSRF posture behind
the POST-only mutations), **the scrypt parameters** (per-user 16-byte
salt, 64-byte key — the documented contract), **the register 409
EMAIL_TAKEN enumeration** (by-design registration UX, rate-limited
10/15min — the standard SaaS trade-off, distinct from the S17 *timing*
leak which was invisible), and **npm audit/outdated** (above).

## The fixes (TDD-first)

### R1 — the method-mismatch envelope (F1)

Two guard factories at the existing seam, `src/lib/api.ts`:

```ts
/** Session 20 F1 — the method-mismatch envelope. */
export function methodGuard(allow: string): () => NextResponse {
  return () => fail("METHOD_NOT_ALLOWED",
    "This endpoint does not accept that request method.", 405,
    { Allow: allow });
}

/** The explicit OPTIONS answer (Next's auto-answer shape, our Allow). */
export function optionsGuard(allow: string): () => NextResponse {
  return () => new NextResponse(null, {
    status: 204,
    headers: { Allow: allow, "Cache-Control": NO_STORE },
  });
}
```

Design decisions, each load-bearing:

- **The 405 envelope inherits the full `fail()` seam** —
  `application/json`, `Cache-Control: private, no-store`, generic copy
  (the S16/S19 contracts arrive free), and the RFC 9110 §15.4.6 `Allow`
  header a 405 SHOULD carry (the framework's bare answer never did).
- **`Allow` lists the route's REAL methods** — the semantic contract a
  client needs (`OPTIONS, POST` for login — exactly Next's own pre-fix
  auto-OPTIONS answer on that route), not the guard exports themselves.
- **The explicit `optionsGuard` replaces Next's auto-OPTIONS** with the
  same 204 + Allow shape plus the no-store directive, and keeps the
  preflight answer honest once the guard exports exist (the auto-answer
  enumerates ALL exports — with guards in place it would over-report).
- **Every route file exports the complement of its real methods.** The
  guard matrix (real methods → guard exports):

  | Route | Real | Guard exports | `Allow` value |
  |---|---|---|---|
  | auth/login, auth/register, auth/logout, newsletter, demo, workflows/generate | POST | GET, HEAD, PUT, PATCH, DELETE, OPTIONS | `OPTIONS, POST` |
  | auth/me, health | GET | POST, PUT, PATCH, DELETE, OPTIONS | `GET, HEAD, OPTIONS` |
  | workflows | GET, POST | PUT, PATCH, DELETE, OPTIONS | `GET, HEAD, OPTIONS, POST` |
  | workflows/[id] | GET, PATCH, DELETE | POST, PUT, OPTIONS | `GET, HEAD, OPTIONS, PATCH, DELETE` |

- **The guards are module-level consts** — zero request-path cost for
  real traffic; the unimplemented methods stop at the export before any
  rate-limit, session, or parse work.
- **No handler signature changes** — the real exports (and every pinned
  contract on them) are untouched; the guards only claim the methods
  nothing else claims.

Unit pins (7, new `src/lib/api-guards.test.ts`, the S19
`api-route.test.ts` mocking pattern — `./db` and `./auth` mocked so the
import graph stays pure): the 405 envelope (status + `METHOD_NOT_ALLOWED`
code + generic message), the `Allow` header pass-through, the 405's
`Cache-Control: private, no-store`, the OPTIONS guard's 204 + Allow +
no-store, and (R2 below) the four `bodyTooLarge` behavior pins.

Smoke pins (12, a new `method + payload guards` section on the MAIN
smoke server — these need no broken DB): GET login → 405 / envelope
code / `application/json` / `Allow: OPTIONS, POST` / no-store; POST
health → 405; DELETE workflows → 405; POST `/api/workflows/<id>` → 405;
a 2MB login body → 413 + `PAYLOAD_TOO_LARGE`; a 2MB newsletter body →
413; a 100KB (under-ceiling) login body → 400 VALIDATION (the parse
still happens for honest payloads — the ceiling does not over-block).

### R2 — the request-size ceiling (F2)

A guard at the same seam:

```ts
/** Session 20 F2 — the request-size ceiling (probed: a 50MB body was
 *  fully buffered and parsed; the largest real payload is < 2KB). */
export const MAX_JSON_BODY_BYTES = 128 * 1024;

export function bodyTooLarge(request: Request): NextResponse | null {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_JSON_BODY_BYTES) {
    return fail("PAYLOAD_TOO_LARGE", "Request body is too large.", 413);
  }
  return null;
}
```

Design decisions, each load-bearing:

- **The guard reads the DECLARED `content-length` only** — an O(1)
  header read before any buffering. A chunked body without a declaration
  falls through to the existing parse path; the residual is documented
  in DEPLOYMENT.md §2 (cap bodies at the edge — every real proxy does),
  the belt-and-braces half of the fix.
- **The ceiling is 128KB** — 60x the largest real payload the app ever
  legitimately parses; no honest client is within two orders of
  magnitude of it.
- **Placement: immediately before `request.json()` in each of the 7
  body-parsing handlers** (login, register, newsletter, demo,
  workflows POST, workflows/generate POST, workflows/[id] PATCH). That
  is exactly where the memory is consumed — requests rejected earlier
  (rate limit, session gate) never parse and never buffer, so the guard
  placed parse-adjacent is provably behavior-preserving for every
  existing pin (all pin bodies are < 2KB → `null` → the original parse
  path verbatim). Logout reads no body — no guard (documented).
- **The 413 inherits the `fail()` seam** — envelope, content-type,
  no-store, generic copy.

Unit pins (the four in R1's file): declared > ceiling → 413 +
`PAYLOAD_TOO_LARGE` + no-store; declared == ceiling → null (boundary
inclusive); absent header → null; malformed header → null (falls
through to the parse path, never crashes the guard).

### R3 — the adjudication record (documented, no code change)

The audit rows above (unknown-API-route layer branded-404 CLEAN, OPTIONS
auto-answer CLEAN, cookie attributes re-verified, scrypt parameters,
the register-409 by-design trade-off, the currency re-run unchanged)
land in this plan's adjudicated section — the operators' evidence that
these layers were surveyed, not skipped.

### R4 — full gate + paired re-verification + docs

Gate: lint → typecheck → **145 unit** (137 + 8 guard pins) → build →
**94 smoke** (79 + 15 guard pins) → **197 e2e** (unchanged — no
client-observable behavior change for normal payloads; the e2e webServer
boots a healthy DB and uses only real methods at real sizes) — **436
checks**. Re-verification: the method + body-size catalog re-run on the
remediated build (every method-mismatch row an envelope with Allow +
no-store + content-type; the giant bodies 413; OPTIONS still 204 with
the correct Allow); the standing drift battery re-run (word parity ×8 +
the mobile-nav paired probe — untouched surfaces, the re-run is the
regression guard); the standard 20-shot screenshot set refreshed (VLM
spot-checks); docs: PAD (revision block, ledger **D93–D94**, §7 counts,
§11 key files), AGENTS (counts + **gotcha 34** — the framework answers
unexported methods with bare 405s, the layer below `apiRoute`; guard
exports are how the invariant reaches it), CLAUDE (session-20 context),
README (432 badge + the method-envelope and payload-ceiling rows),
the SKILL doc **v2.19.0 (lessons 48–49)**, DEPLOYMENT.md (§2 — the
proxy body-cap note, the R2 belt-and-braces half), `.env.example`
(re-verified — no new vars; the ceiling is a code constant), this plan
(ticked), the session log `docs/session_35.md`, the repo `worklog.md`.
Commit (Conventional Commits + emoji) + SSH push via
`docs/ssh_git_wrapper_v3.py` (main only, wrapper-verified).

## Validation of this plan against the codebase (pre-execution)

- `src/lib/api.ts` re-read: server-only (the S19 import-graph scan —
  imported by exactly the 10 route files; no client component imports
  it) ✓
- Route shapes re-read (login, newsletter, demo, workflows POST — full
  bodies; the remaining four read before each edit): every handler is a
  plain `async function` returning `apiRoute(async () => { … })` — the
  guard exports are additive module-level consts, claiming only methods
  nothing else claims ✓
- The 11-probe RED catalog captured above IS the RED evidence; the
  smoke pins will additionally be observed RED against the pre-fix
  build (empty envelope code, no content-type, 50MB → 400-not-413)
  before the fix lands ✓
- Pin-conflict scan: no existing unit test imports any route file; no
  existing smoke/e2e pin sends an unexported method or a > 128KB body
  (the e2e register/login/newsletter/demo bodies are all < 1KB; the
  smoke auth section's ~30 POSTs are all tiny) — zero pin conflicts ✓
- Smoke arithmetic: the new section adds 4 zero-body method probes
  (GET/POST/DELETE/POST — no rate-limit budget: the guards fire at the
  export, before any limiter) + 2 giant POSTs and 1 under-ceiling POST
  on login/newsletter (3 auth/newsletter-bucket POSTs; current auth
  usage ~30 + 3 = 33 < 50 budget) ✓
- Timing-pin impact: the guards add zero work to the login POST path
  (module-level consts; the bodyTooLarge header read is O(1) against
  the ~34ms scrypt floor) — the S17 login-timing ratio pin is
  unaffected ✓
- `next/server` import in vitest: the node environment config (the S19
  `api-route.test.ts` precedent — `NextResponse` loads server-side
  without a DOM) ✓
- Dockerfile impact: none — the runner boots the same standalone
  artifact; the guards are module-level code ✓
- The auto-OPTIONS Allow over-report question (the auto-answer
  enumerates exports): neutralized BY DESIGN — the explicit
  `optionsGuard` replaces the auto-answer with the correct method list
  and the identical 204 shape ✓
- The e2e webServer and the smoke server boot their own builds — no
  zombie risk from the new section (both servers die inside their
  scripts; gotcha 31's trap discipline) ✓

## Execution order

R1 + R2 unit pins RED (`methodGuard`/`optionsGuard`/`bodyTooLarge` do
not exist) → implement the three helpers in `api.ts` → GREEN → wrap the
10 route files' guard exports + insert `bodyTooLarge` before the 7
parses → rebuild → the new smoke pins RED-observed-against-pre-fix
(skip: the catalog already observed RED) → GREEN → full gate → the
method + body-size catalog re-run → the drift battery re-run →
screenshots → docs (R4) → commit + SSH push per the runbook → the
session transcript (`docs/session_36.md`) committed and pushed after.

### ToDo checklist

- [x] R1: `methodGuard` + `optionsGuard` in `src/lib/api.ts` + the guard
      exports across all 10 route files + 4 unit pins + 10 smoke pins;
      RED observed (the 11-probe catalog — bare empty 405s, no
      content-type, no Allow, no cache-control; the unit pins observed
      RED 8/8 before the helpers existed); GREEN: every method-mismatch
      row an envelope (405 + METHOD_NOT_ALLOWED + application/json +
      the real Allow + no-store; OPTIONS still 204 with the correct
      Allow)
- [x] R2: `bodyTooLarge` + `MAX_JSON_BODY_BYTES` in `src/lib/api.ts` +
      the guard before the 7 body parses + 4 unit pins + 5 smoke pins;
      RED observed (the 50MB body buffered and parsed to a 400 in
      314ms); GREEN: the giant bodies answer 413 PAYLOAD_TOO_LARGE
      envelopes (re-probed: 91ms, nothing buffered); the under-ceiling
      100KB body still parses to 400 VALIDATION (the ceiling does not
      over-block)
- [x] R3: the adjudication rows (unknown-API-route branded-404 CLEAN,
      OPTIONS auto-answer CLEAN, cookie attributes re-verified, scrypt
      parameters standard, register-409 by-design, currency unchanged)
      — documented adjudication
- [x] Full gate: lint ✓ → typecheck ✓ → 145/145 unit → build ✓ → 94/94
      smoke → 197/197 e2e — **436 checks, no flake**
- [x] Paired re-verification: the method + body-size catalog GREEN on
      the remediated build (every 405 an envelope; every giant body a
      413; the security headers + Allow + no-store + content-type all
      present); word parity 1.0000 ×8 (both sides rendered in Chromium);
      the mobile-nav paired probe byte-identical (7 rows — 6 anchors +
      the Log In button — every row 44px)
- [x] Screenshots: the standard 20-shot set refreshed (canonical
      workspace, VLM spot-checks ×5 PASS — after adjudicating three
      check-prompt drifts: the hero fold, the login card's actual
      S-logo + "Welcome to SAAS Company" contract, and its
      Google→or→email element order)
- [x] Docs: PAD (revision block, D93–D94, §7 counts, §11), AGENTS
      (gotcha 34 + counts + the invariant line naming the method
      guards), CLAUDE (session-20 context), README (436 badge +
      method-envelope + payload-ceiling rows + the stale 126/65 counts
      fixed), SKILL v2.19.0 (lessons 48–49), DEPLOYMENT.md §2 (the
      proxy body-cap note), this plan ticked, session log
      `docs/session_35.md`, repo `worklog.md` — `.env.example` verified
      in sync (no new vars; the ceiling is a code constant)
- [x] Commit to `main` + SSH push via `docs/ssh_git_wrapper_v3.py`
      (wrapper-verified — remote main @ 7826728 == local HEAD, the
      tracking ref synced, the operator key destroyed after; note the
      wrapper's DEFAULT remote is the runbook's original task-management
      repo — always pass `--remote git@github.com:nordeim/saas-company.git`
      explicitly) — the final step
