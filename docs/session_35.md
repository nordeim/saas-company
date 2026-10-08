# Session 35 Log — The Method-and-Payload Audit (the Session-20 Remediation, 2026-10-09)

Continuing from Session 33/34 (remote main @ 7898e75 — the verified
Session-19 push `6be9888` + the session-34 transcript). The mandate:
refresh, review the session-33/34 + remediation-plan-19 docs, re-audit
against the live (with the standing mobile-navigation and Tailwind-v4
vigilance), remediate TDD-first, re-verify, document, push.

## Phase 0 — The workspace recovery

The sandbox was fully reset this time: a fresh
`git clone https://github.com/nordeim/saas-company.git` landed at
`7898e75` on main (== origin/main, clean — the session-34 transcript
commit on top of the S19 remediation `6be9888`). The environment was
rebuilt from scratch: `npm install`, `.env` from `.env.example` (a fresh
`AUTH_SECRET`), `prisma generate`, `db:push` + `db:seed` (the canonical
checksum `e7f6c011` confirmed). The exported-`DATABASE_URL` trap was
LIVE (a stale absolute path) — neutralized per-command
(`env -u DATABASE_URL`) all session. The previous sessions' survey
scripts were wiped with the sandbox and recreated under
`/home/z/my-project/scripts/` (the local-only discipline).

## Phase 1 — Docs & baseline

- Root docs (AGENTS 33 gotchas / CLAUDE / README / PAD ledger at D92 /
  SKILL v2.18.0) + status docs (session_33, session_34 — the previous
  conversation's transcript, remediation-plan-19 all ticked but the
  final push item — whose push itself is verified by session_34's
  transcript + the git state, the record-next-cycle pattern; worklog)
  reviewed; the `skills/` folder excluded from every toolchain
  (re-verified).
- Baseline gate: lint ✓ typecheck ✓ Vitest 137/137 ✓ build ✓ smoke
  79/79 ✓ Playwright 197/197 — **413 checks, fully green, no flake.**

## Phase 2 — The audit (the reference UNCHANGED; two new survey surfaces + the standing battery's own tooling lesson)

**Drift battery** (recreated with an EXPLICIT `--base` — gotcha 33): the
first run collapsed to 0.07 parity on every route — diagnosed as THIS
SESSION'S OWN tooling bug, not drift: the survey's raw-`fetch` word
comparison read the live's UN-HYDRATED SPA shell (~130 words on every
route) while the clone's SSR HTML carried the full text. The honest
method (the one 19 sessions of GREEN runs implicitly used): render BOTH
sides in Chromium and diff `document.body.innerText`. Re-run GREEN:
**word parity 1.0000 on all 8 routes** (reference UNCHANGED). **The
mobile-nav paired real-touch probe** (390×844, `hasTouch`): the clone's
burger opens with a REAL tap into the byte-identical panel — seven rows
(6 anchors + the Log In button — the first probe's selector missed the
button and undercounted 6), every row exactly 44px (the live's burger
remains pointer-blocked, D32). **No Tailwind v4 bug.** The live LOGIN
re-verified with the operator credentials (sepnetflix2023@outlook.com):
sign-in redirects to `/` with the navbar UNCHANGED and `/dashboard`
renders the SPA 404 VIEW even authenticated — the server answers 200
for any route; the 404 is the client-rendered content ("404 Page Not
Found — The page 'dashboard' could not be found in this application.
Go Home") — **D62 holds**, adjudicated on the rendered content.

The Session-20 NEW surfaces — the layers of **method-and-payload
honesty** (what the wire carries below and before every handler):

1. **The method-mismatch layer:** the first systematic catalog of what
   a request using a method the route does NOT export answers — the
   framework-owned layer BELOW every handler, the one layer `apiRoute`
   never sees. **11 probes answered a BARE `405` with an EMPTY body, NO
   content-type, NO `Allow` header, and NO `Cache-Control`** — GET on
   the six POST-only routes (login, register, logout, newsletter, demo,
   generate), POST on the two GET-only routes (me, health),
   PUT/PATCH/DELETE on workflows, and HEAD on a POST-only route. The
   security-header set from `next.config.ts` DOES cover framework
   answers (verified in the catalog — nosniff/DENY/referrer/HSTS all
   present); only the envelope layer is absent. The architecture
   invariant — "no route returns bare JSON" — was violated on the one
   path family no wrapper can reach. **F1.** (Next's own auto-OPTIONS
   answers correctly: 204 + `Allow: OPTIONS, POST` on login,
   `GET, HEAD, OPTIONS` on health — and unknown API routes serve the
   app's BRANDED 404 page — both adjudicated CLEAN.)
2. **The request-size layer:** every POST/PATCH route buffers the full
   request body into memory at `request.json()` with no ceiling
   anywhere — probed: a **50MB login body was fully buffered and
   JSON-parsed (314ms)** before validation answered 400; a 10MB
   newsletter body likewise. The largest real payload in the app is
   < 2KB; the rate limits cap frequency (10/15min) but never size; and
   DEPLOYMENT.md §2's proxy guidance said nothing about body caps. **F2.**
3. **The dependency-currency layer** (the standing re-run): `npm audit`
   — exactly the single documented F10 braces chain; `npm outdated` —
   majors only (prisma 6→7/8, eslint 9→10, typescript 5.9→7,
   lucide-react 0.5→1.53) plus the in-range Playwright 1.64.
   **Adjudicated CLEAN** (unchanged from S19).

Also adjudicated CLEAN with evidence: the unknown-API-route layer (the
branded 404 page serves any unknown path — browsers get the branded
view, API clients an honest 404), the OPTIONS auto-answer layer (204 +
Allow, standard preflight), the cookie-attribute layer (re-verified in
`src/lib/auth.ts`: `httpOnly: true`, `sameSite: "lax"`, `secure` in
production, `path: "/"`, the 7-day maxAge — the CSRF posture behind
the POST-only mutations), the scrypt parameters (16-byte salt, 64-byte
key), and the register-409 EMAIL_TAKEN enumeration surface (by-design
registration UX, rate-limited — the standard SaaS trade-off, distinct
from the S17 *timing* leak which was invisible).

## Phase 3 — Remediation, TDD-first

The plan (`docs/remediation-plan-session20.md`) was written and
validated against the codebase before any fix.

**R1 — the method-mismatch envelope (F1):** RED first (the 11-probe
catalog above; then 8 unit pins observed RED — the helpers did not
exist). GREEN: `methodGuard(allow)` + `optionsGuard(allow)` in
`src/lib/api.ts` — every route file now EXPORTS a guard for each
method it does not implement: the 405 `METHOD_NOT_ALLOWED` envelope
(generic copy — internals never leak) with the RFC 9110 §15.4.6
`Allow` header listing the route's REAL methods (login:
`OPTIONS, POST`; me/health: `GET, HEAD, OPTIONS`; workflows:
`GET, HEAD, OPTIONS, POST`; `[id]`: `GET, HEAD, OPTIONS, PATCH,
DELETE`), `application/json` + `private, no-store` arriving free via
the `fail()` seam. The explicit `OPTIONS` export replaces Next's
auto-answer with the same 204 + Allow shape plus the no-store
directive (the auto-answer enumerates EXPORTS and would over-report
once the guards exist). The guards are module-level consts — zero
request-path cost for real traffic.

**R2 — the request-size ceiling (F2):** `bodyTooLarge(request)` +
`MAX_JSON_BODY_BYTES` (128KB — 60x the largest legitimate payload) in
`src/lib/api.ts`, placed immediately BEFORE `request.json()` in each
of the 7 body-parsing handlers (login, register, newsletter, demo,
workflows POST, generate POST, `[id]` PATCH) — exactly where the
memory is consumed; requests rejected earlier (rate limit, session
gate) never parse and never buffer. A declared over-ceiling
`content-length` answers the 413 `PAYLOAD_TOO_LARGE` envelope (an O(1)
header read — nothing is buffered). Chunked bodies without a
declaration fall through to the parse path — the residual is the
proxy's to close (the DEPLOYMENT.md §2 body-cap note, the
belt-and-braces half). Unit 145/145 (8 new guard pins in
`src/lib/api-guards.test.ts`, the S19 mocking pattern); smoke 94/94
(15 new pins — the method envelope ×10 incl. the Allow/no-store/
content-type assertions and the OPTIONS 204; the login 2MB → 413 +
envelope code; the broken server's fresh newsletter bucket carries
the 2MB → 413 and the under-ceiling 100KB → 400 VALIDATION — the
ceiling does not over-block).

Two mid-execution probe bugs were caught by the pins themselves (the
discipline working): the newsletter 413 pin first tripped the MAIN
server's consumed newsletter rate bucket (moved to the broken-DB third
server's fresh bucket — the guard fires before any DB touch, so the
broken DB is irrelevant there), then failed again because the "2MB"
probe body was actually 31 bytes (the generator forgot to pad the
email — the route correctly parsed it, passed validation, and hit the
broken DB's upsert for an INTERNAL_ERROR 500; the route was right, the
probe was wrong). Fixed: a genuinely padded body → 413 GREEN.

## Phase 4 — The gate, re-verification & screenshots

**Full gate: lint ✓ typecheck ✓ Vitest 145/145 ✓ build ✓ smoke 94/94 ✓
Playwright 197/197 — 436 checks, fully green, no flake.**

Re-verification: the method + body-size catalog re-run on the
remediated build (fresh :3090 boot) — every method-mismatch row an
envelope (405 + `METHOD_NOT_ALLOWED` + `application/json` + the real
`Allow` + `private, no-store`; the security headers still present;
OPTIONS still 204 with the correct Allow; HEAD carrying the envelope
headers), and every giant body a 413 envelope **in 15-91ms** (vs the
pre-fix 314ms full parse of the 50MB body — the rejection now happens
before any buffering). The drift battery re-run: **word parity 1.0000
×8, the mobile-nav byte-identical, D62 holds** — the route changes
caused zero regressions.

Screenshots: the standard 20-shot set refreshed (fresh :3095 boot, the
canonical workspace, checksum-verified before and after). VLM
spot-checks ×5 — the first pass flagged the hero (the dashboard mockup
"missing" — it sits below the 900px fold) and the login card twice
(the "S" logo + "Welcome to SAAS Company" heading, then the
Google→or→email element order) — all three adjudicated as CHECK-PROMPT
drift against the ACTUAL contracts (verified in the markup; word
parity 1.0000 + the e2e login-states pins had already proven the pages
correct). The prompts were corrected to the real contracts; **5/5
PASS** (the S19 lesson recurring — the deterministic evidence always
adjudicates).

## Phase 5 — Documentation

PAD (revision block; ledger **D93–D94**; §7.1/7.2/7.3 counts; §11 key
files incl. the merged api.ts row + the stale 65-check smoke row
fixed), AGENTS (counts + **gotcha 34** + the envelope invariant line
now naming the method guards and the size ceiling), CLAUDE
(session-20 context + the pre-push checklist counts), README (436
badge, the method-envelope and payload-ceiling key-feature/troubleshooting
rows, the stale 126/65 count pair in the Testing block fixed), the
SKILL doc **v2.19.0 (lessons 48–49)**, DEPLOYMENT.md §2 (the proxy
body-cap note), `.env.example` verified in sync (no new vars — the
ceiling is a code constant), the remediation plan session20 (ticked),
this session log, the repo worklog.

## Phase 6 — Commit & push

Single `:bug: fix:` commit to `main` (all code + tests + docs +
screenshots), pushed via `docs/ssh_git_wrapper_v3.py` with the
operator-supplied SSH key (the runbook's wrapper-verified sequence);
no branches (the operator contract). The session transcript
(`docs/session_36.md`) follows as the closing docs commit.
