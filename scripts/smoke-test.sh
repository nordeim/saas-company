#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Smoke suite — end-to-end API + page checks against the PRODUCTION build.
#
# Boots the standalone server on :3200 with its OWN scratch database
# (db/smoke.db — schema-pushed + seeded first), then runs numbered checks
# and prints PASS/FAIL per check. Exits non-zero on any failure.
#
# Prerequisites: `npm run build` (the standalone server must exist).
#
# NOTE (the v2.14 lesson, inherited from this repo's history): the script
# PINS its own DATABASE_URL — an exported absolute value in the shell would
# otherwise boot the server against a foreign database file.
# ---------------------------------------------------------------------------
set -u
cd "$(dirname "$0")/.."

PORT=3200
BASE="http://localhost:$PORT"
SMOKE_DB_URL="file:../db/smoke.db"
SMOKE_DB_FILE="db/smoke.db"
PASS=0
FAIL=0
SERVER_PID=""

say_pass() { PASS=$((PASS + 1)); echo "PASS: $1"; }
say_fail() { FAIL=$((FAIL + 1)); echo "FAIL: $1"; }

check() { # check <label> <expected> <actual>
  if [ "$2" = "$3" ]; then say_pass "$1"; else say_fail "$1 (expected [$2] got [$3])"; fi
}

cleanup() {
  if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null; wait "$SERVER_PID" 2>/dev/null; fi
}
trap cleanup EXIT

echo "== smoke: scratch database =="
rm -f "$SMOKE_DB_FILE"
DATABASE_URL="$SMOKE_DB_URL" npx prisma db push --skip-generate >/dev/null 2>&1 || { echo "FAIL: prisma db push"; exit 1; }
DATABASE_URL="$SMOKE_DB_URL" npx tsx prisma/seed.ts >/dev/null 2>&1 || { echo "FAIL: seed"; exit 1; }
say_pass "scratch db pushed + seeded"

echo "== smoke: boot production server on :$PORT =="
# GENERATE_RATE_LIMIT_MAX=2 (Session 16 F1): the smoke server pins the LLM
# composer's per-user ceiling LOW so the generate-limiter trip below is
# exactly deterministic (nothing else in smoke calls /api/workflows/generate).
# AUTH_RATE_LIMIT_MAX=50 (Session 17): the e2e webServer's own insurance
# pattern — the new login-timing pins (14 POSTs) + the parallel race pin
# (10 POSTs) lift the suite's auth-POST count to ~30; no auth-429 pin exists
# in smoke (the newsletter + generate buckets own those trips).
DATABASE_URL="$SMOKE_DB_URL" AUTH_SECRET="smoke-secret" AUTH_RATE_LIMIT_MAX=50 GENERATE_RATE_LIMIT_MAX=2 PORT=$PORT NODE_ENV=production \
  node .next/standalone/server.js >/tmp/smoke-server.log 2>&1 &
SERVER_PID=$!

for i in $(seq 1 40); do
  if curl -sf "$BASE/api/health" >/dev/null 2>&1; then break; fi
  sleep 0.5
done

json() { curl -s "$@"; }
field() { python3 -c "import json,sys;d=json.load(sys.stdin);print(d$1)" 2>/dev/null; }

echo "== smoke: health =="
HEALTH=$(json "$BASE/api/health")
check "health ok envelope" "True" "$(echo "$HEALTH" | field "['ok']")"
check "health app name" "saas-company" "$(echo "$HEALTH" | field "['data']['app']")"
# Session 18 F1: the probe must SEE the database — the db field reports
# SQLite reachability (up when the smoke scratch DB answers SELECT 1).
check "health db probe" "up" "$(echo "$HEALTH" | field "['data']['db']")"

echo "== smoke: auth =="
LOGIN=$(curl -s -c /tmp/smoke-cookies.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@novaai.app","password":"Demo1234!"}')
check "login ok" "True" "$(echo "$LOGIN" | field "['ok']")"

BAD=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"demo@novaai.app","password":"wrong"}')
check "wrong password rejected (401)" "401" "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -d '{"email":"demo@novaai.app","password":"wrong"}')"
check "wrong password code" "INVALID_CREDENTIALS" "$(echo "$BAD" | field "['error']['code']")"

ME=$(curl -s -b /tmp/smoke-cookies.txt "$BASE/api/auth/me")
check "session user resolves" "demo@novaai.app" "$(echo "$ME" | field "['data']['email']")"

ANON=$(curl -s "$BASE/api/auth/me")
check "anonymous me is null" "None" "$(echo "$ANON" | field "['data']")"

REG=$(curl -s -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" \
  -d '{"name":"Smoke User","email":"smoke@example.com","password":"Smoke123!"}')
check "registration ok" "True" "$(echo "$REG" | field "['ok']")"

DUP=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" \
  -d '{"name":"Smoke User","email":"smoke@example.com","password":"Smoke123!"}')
check "duplicate email rejected (409)" "409" "$DUP"

SHORT=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" \
  -d '{"name":"X","email":"short@example.com","password":"short"}')
check "short password rejected (400)" "400" "$SHORT"

# Session 17 F1 (CWE-208): constant-time login — the unknown-email path must
# burn the same scrypt cost as the wrong-password path. 7+7 curl-sampled
# medians; the pre-fix delta was ~9.8x (the unknown path skipped scrypt);
# post-fix both medians sit ~30-35ms and the ratio stays under 2.5x. A false
# failure needs a sustained 2.5x asymmetry between two scrypt-dominated
# paths — implausible by construction.
login_sample() { # login_sample <email> -> prints %{time_total}
  curl -s -o /dev/null -w '%{time_total}\n' -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" -d "{\"email\":\"$1\",\"password\":\"wrong-password-1\"}"
}
UNKNOWN_TIMES=$(for i in 1 2 3 4 5 6 7; do login_sample "enumeration-probe-$i@example.com"; done | sort -g | sed -n '4p')
WRONGPW_TIMES=$(for i in 1 2 3 4 5 6 7; do login_sample "demo@novaai.app"; done | sort -g | sed -n '4p')
TIMING_RATIO=$(awk -v u="$UNKNOWN_TIMES" -v w="$WRONGPW_TIMES" 'BEGIN { if (u <= 0.001) { print "99" } else { printf "%.2f", w / u } }')
TIMING_OK=$(awk -v r="$TIMING_RATIO" 'BEGIN { print (r < 2.5) ? "yes" : "no" }')
if [ "$TIMING_OK" = "yes" ]; then
  say_pass "login timing parity (unknown ${UNKNOWN_TIMES}s vs wrong-pw ${WRONGPW_TIMES}s, ratio ${TIMING_RATIO}x < 2.5x)"
else
  say_fail "login timing parity (ratio ${TIMING_RATIO}x — unknown ${UNKNOWN_TIMES}s vs wrong-pw ${WRONGPW_TIMES}s; the enumeration side-channel is open)"
fi

# Session 17 F2: the register TOCTOU race — 10 truly-parallel duplicate POSTs
# (10 background curl processes = 10 independent sockets; undici/fetch on one
# socket SERIALIZES and never interleaves the findUnique→create gap). Every
# response must be an envelope: status ∈ {201, 409} AND the body carries the
# "ok": marker. Pre-fix the interleaved loser returned a bare 500 with an
# EMPTY body and no content-type; post-fix the P2002 catch guarantees the 409.
RACE_EMAIL="race-s17@example.com"
RACE_DIR=$(mktemp -d)
RACE_PIDS=""
for i in 1 2 3 4 5 6 7 8 9 10; do
  curl -s -o "$RACE_DIR/r$i" -w '%{http_code}' -X POST "$BASE/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Race $i\",\"email\":\"$RACE_EMAIL\",\"password\":\"RacePass123!\"}" > "$RACE_DIR/c$i" &
  RACE_PIDS="$RACE_PIDS $!"
done
# Wait ONLY for the race curls (a bare `wait` would block on the smoke
# server itself — it never exits).
for p in $RACE_PIDS; do wait "$p"; done
RACE_BAD=$(for i in 1 2 3 4 5 6 7 8 9 10; do
  code=$(cat "$RACE_DIR/c$i")
  if [ "$code" != "201" ] && [ "$code" != "409" ]; then echo "bad:$code"; fi
  if ! grep -q '"ok":' "$RACE_DIR/r$i"; then echo "bad-body:$i"; fi
done | head -3)
rm -rf "$RACE_DIR"
if [ -z "$RACE_BAD" ]; then
  say_pass "concurrent duplicate register: all 10 responses are envelopes (201/409 + ok marker)"
else
  say_fail "concurrent duplicate register: $RACE_BAD (the P2002 loser broke the envelope contract)"
fi

# Session 17 F3: the closed-registration deployment gate. A SECOND mini-server
# boots with ALLOW_REGISTRATION=false on :3210 (same scratch DB — a closed
# server never writes): register must 403 with the REGISTRATION_CLOSED code;
# login must still sign the demo user in (closing registration never locks out
# existing users).
echo "== smoke: closed-registration gate (second server on :3220) =="
CLOSED_PORT=3220
CLOSED_BASE="http://localhost:$CLOSED_PORT"
DATABASE_URL="$SMOKE_DB_URL" AUTH_SECRET="smoke-secret" ALLOW_REGISTRATION=false \
  PORT=$CLOSED_PORT NODE_ENV=production \
  node .next/standalone/server.js >/tmp/smoke-closed-server.log 2>&1 &
CLOSED_PID=$!
CLOSED_UP=no
for i in $(seq 1 40); do
  if curl -sf "$CLOSED_BASE/api/health" >/dev/null 2>&1; then CLOSED_UP=yes; break; fi
  sleep 0.5
done
if [ "$CLOSED_UP" = "yes" ]; then
  CLOSED_REG=$(curl -s -X POST "$CLOSED_BASE/api/auth/register" -H "Content-Type: application/json" \
    -d '{"name":"Closed Test","email":"closed-s17@example.com","password":"Closed123!"}')
  CLOSED_CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$CLOSED_BASE/api/auth/register" -H "Content-Type: application/json" \
    -d '{"name":"Closed Test","email":"closed-s17@example.com","password":"Closed123!"}')
  check "closed registration returns 403" "403" "$CLOSED_CODE"
  check "closed registration code" "REGISTRATION_CLOSED" "$(echo "$CLOSED_REG" | field "['error']['code']")"
  CLOSED_LOGIN=$(curl -s -X POST "$CLOSED_BASE/api/auth/login" -H "Content-Type: application/json" \
    -d '{"email":"demo@novaai.app","password":"Demo1234!"}')
  check "closed gate: existing user still signs in" "True" "$(echo "$CLOSED_LOGIN" | field "['ok']")"
else
  say_fail "closed-registration server booted on :$CLOSED_PORT"
fi
kill "$CLOSED_PID" 2>/dev/null
wait "$CLOSED_PID" 2>/dev/null

echo "== smoke: protected reads =="
for ENDPOINT in workflows; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/$ENDPOINT")
  check "/api/$ENDPOINT requires a session (401)" "401" "$CODE"
done

WF=$(curl -s -b /tmp/smoke-cookies.txt "$BASE/api/workflows")
check "workflows list ok" "True" "$(echo "$WF" | field "['ok']")"
WF_COUNT=$(echo "$WF" | python3 -c "import json,sys;print(len(json.load(sys.stdin)['data']))")
check "seeded workflow count" "6" "$WF_COUNT"

echo "== smoke: workflow crud =="
CREATED=$(curl -s -b /tmp/smoke-cookies.txt -X POST "$BASE/api/workflows" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke workflow","description":"created by the smoke suite","category":"Ops"}')
check "workflow create ok" "True" "$(echo "$CREATED" | field "['ok']")"
WF_ID=$(echo "$CREATED" | field "['data']['id']")

BADSTATUS=$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/smoke-cookies.txt -X POST "$BASE/api/workflows" \
  -H "Content-Type: application/json" -d '{"name":"Bad","status":"exploded"}')
check "invalid status rejected (400)" "400" "$BADSTATUS"

PAUSED=$(curl -s -b /tmp/smoke-cookies.txt -X PATCH "$BASE/api/workflows/$WF_ID" \
  -H "Content-Type: application/json" -d '{"status":"paused"}')
check "workflow pause ok" "paused" "$(echo "$PAUSED" | field "['data']['status']")"

# Session 11 F4: PATCH must enforce the same name contract as POST — a
# >120-char name is REJECTED (400 VALIDATION), not silently truncated to
# 120 (the pre-fix PATCH returned 200 with a cut name).
OVERSIZE=$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/smoke-cookies.txt -X PATCH "$BASE/api/workflows/$WF_ID" \
  -H "Content-Type: application/json" -d "{\"name\":\"$(printf 'x%.0s' $(seq 1 300))\"}")
check "patch oversized name rejected (400)" "400" "$OVERSIZE"
OVERSIZE_BODY=$(curl -s -b /tmp/smoke-cookies.txt -X PATCH "$BASE/api/workflows/$WF_ID" \
  -H "Content-Type: application/json" -d "{\"name\":\"$(printf 'x%.0s' $(seq 1 300))\"}")
check "patch oversized name error code" "VALIDATION" "$(echo "$OVERSIZE_BODY" | field "['error']['code']")"
RENAMED=$(curl -s -b /tmp/smoke-cookies.txt -X PATCH "$BASE/api/workflows/$WF_ID" \
  -H "Content-Type: application/json" -d '{"name":"Smoke workflow renamed"}')
check "patch valid name ok" "True" "$(echo "$RENAMED" | field "['ok']")"

DELETED=$(curl -s -b /tmp/smoke-cookies.txt -X DELETE "$BASE/api/workflows/$WF_ID")
check "workflow delete ok" "True" "$(echo "$DELETED" | field "['ok']")"

echo "== smoke: newsletter + demo =="
NEWS=$(curl -s -X POST "$BASE/api/newsletter" -H "Content-Type: application/json" \
  -d '{"email":"smoke-reader@example.com"}')
check "newsletter subscribe ok" "True" "$(echo "$NEWS" | field "['ok']")"
BADNEWS=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/newsletter" \
  -H "Content-Type: application/json" -d '{"email":"nope"}')
check "newsletter invalid email (400)" "400" "$BADNEWS"

DEMO=$(curl -s -X POST "$BASE/api/demo" -H "Content-Type: application/json" \
  -d '{"name":"Smoke","email":"smoke@example.com","plan":"pro"}')
check "demo request ok" "True" "$(echo "$DEMO" | field "['ok']")"

# Session-15 F4: the 429 contract carries the machine-readable Retry-After
# header (README's troubleshooting documents it; pre-fix NO route emitted
# it). Trip the newsletter limiter deterministically — the fresh process
# has already consumed 3 of the 5-POST/10-min news bucket (subscribe,
# invalid-email, demo); two more land the bucket at its ceiling and the
# sixth POST returns 429. The auth bucket is separate, so the suite's
# login-dependent checks above and below are unaffected.
for _ in 1 2; do
  curl -s -o /dev/null -X POST "$BASE/api/newsletter" -H "Content-Type: application/json" \
    -d '{"email":"smoke-reader@example.com"}'
done
RATE_CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/newsletter" \
  -H "Content-Type: application/json" -d '{"email":"smoke-reader@example.com"}')
check "newsletter rate limit engages (429 on the 6th POST)" "429" "$RATE_CODE"
RATE_HEADERS=$(curl -s -D - -o /dev/null -X POST "$BASE/api/newsletter" \
  -H "Content-Type: application/json" -d '{"email":"smoke-reader@example.com"}')
RETRY_AFTER=$(echo "$RATE_HEADERS" | grep -i '^retry-after:' | tr -d '\r' | awk '{print $2}')
if [ -n "$RETRY_AFTER" ] && [ "$RETRY_AFTER" -gt 0 ] 2>/dev/null; then
  say_pass "429 carries a positive Retry-After header (${RETRY_AFTER}s)"
else
  say_fail "429 carries a positive Retry-After header (got '${RETRY_AFTER}')"
fi

# Session-16 F1: the LLM composer endpoint carries its OWN abuse ceiling —
# the most expensive endpoint per call (a live SDK completion) was the only
# unlimited one (the pre-fix probe: 15/15 rapid authenticated POSTs all
# 200 in 8.1s, no 429 ever engaged). The limit is per-USER (the route is
# authenticated — the honest unit), 10/15min by default, and the smoke
# server boots GENERATE_RATE_LIMIT_MAX=2 with nothing else calling generate,
# so the trip is exactly deterministic: POST #1 and #2 allowed, POST #3 429.
GEN1=$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/smoke-cookies.txt -X POST "$BASE/api/workflows/generate" \
  -H "Content-Type: application/json" -d '{"idea":"smoke generate probe 1"}')
check "generate allowed under the limit (200)" "200" "$GEN1"
GEN2=$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/smoke-cookies.txt -X POST "$BASE/api/workflows/generate" \
  -H "Content-Type: application/json" -d '{"idea":"smoke generate probe 2"}')
check "generate allowed at the ceiling (200)" "200" "$GEN2"
GEN3=$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/smoke-cookies.txt -X POST "$BASE/api/workflows/generate" \
  -H "Content-Type: application/json" -d '{"idea":"smoke generate probe 3"}')
check "generate rate limit engages (429 on the 3rd POST)" "429" "$GEN3"
GEN3_BODY=$(curl -s -b /tmp/smoke-cookies.txt -X POST "$BASE/api/workflows/generate" \
  -H "Content-Type: application/json" -d '{"idea":"smoke generate probe 4"}')
check "generate 429 error code" "RATE_LIMITED" "$(echo "$GEN3_BODY" | field "['error']['code']")"
GEN_HEADERS=$(curl -s -D - -o /dev/null -b /tmp/smoke-cookies.txt -X POST "$BASE/api/workflows/generate" \
  -H "Content-Type: application/json" -d '{"idea":"smoke generate probe 5"}')
GEN_RETRY=$(echo "$GEN_HEADERS" | grep -i '^retry-after:' | tr -d '\r' | awk '{print $2}')
if [ -n "$GEN_RETRY" ] && [ "$GEN_RETRY" -gt 0 ] 2>/dev/null; then
  say_pass "generate 429 carries a positive Retry-After header (${GEN_RETRY}s)"
else
  say_fail "generate 429 carries a positive Retry-After header (got '${GEN_RETRY}')"
fi

echo "== smoke: pages =="
for PATH_ROUTE in / /login /demo /faq /privacy /terms /accessibility /refund-policy; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$PATH_ROUTE")
  check "page $PATH_ROUTE serves 200" "200" "$CODE"
done
# /dashboard is session-gated: anonymous gets the login redirect…
check "page /dashboard redirects anonymous (307)" "307" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/dashboard")"
# …and the authenticated session renders the workspace.
check "page /dashboard serves 200 with session" "200" "$(curl -s -b /tmp/smoke-cookies.txt -o /dev/null -w '%{http_code}' "$BASE/dashboard")"

LANDING=$(curl -s "$BASE/")
for MARKER in "Automated Workflows" "Trusted by 5,000+ teams" "Simple, Transparent Pricing" "NovaaAI"; do
  if echo "$LANDING" | grep -q "$MARKER"; then say_pass "landing contains: $MARKER"; else say_fail "landing contains: $MARKER"; fi
done

# Session 12 F2: React Float's automatic <img> preload must NOT ship in the
# landing HTML — the Next.js router's RSC prefetch would inject it into every
# navbar-bearing route's head (where the image never renders: a console
# warning + a wasted fetch). loading="lazy" suppresses the emission.
if echo "$LANDING" | grep -q 'gasparyan-logo.svg" as="image"'; then say_fail "landing ships NO gasparyan preload link (lazy-img contract)"; else say_pass "landing ships NO gasparyan preload link (lazy-img contract)"; fi

NOTFOUND=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/definitely-not-a-route")
check "unknown path 404s" "404" "$NOTFOUND"

# Security headers (Session 9 F6): the live (Base44/Cloudflare) ships this
# exact set; the standalone server must match — production parity + hardening.
# (HSTS is a no-op over plain http locally; it activates behind TLS.)
HEADERS=$(curl -sI "$BASE/")
if echo "$HEADERS" | grep -qi "x-content-type-options: nosniff"; then say_pass "header X-Content-Type-Options: nosniff"; else say_fail "header X-Content-Type-Options: nosniff"; fi
if echo "$HEADERS" | grep -qi "x-frame-options: DENY"; then say_pass "header X-Frame-Options: DENY"; else say_fail "header X-Frame-Options: DENY"; fi
if echo "$HEADERS" | grep -qi "referrer-policy: strict-origin-when-cross-origin"; then say_pass "header Referrer-Policy: strict-origin-when-cross-origin"; else say_fail "header Referrer-Policy: strict-origin-when-cross-origin"; fi
if echo "$HEADERS" | grep -qi "strict-transport-security: max-age=31536000"; then say_pass "header Strict-Transport-Security: max-age=31536000"; else say_fail "header Strict-Transport-Security: max-age=31536000"; fi

# Session 16 F3: the framework banner is OFF — the live ships NO
# X-Powered-By (probed: server: cloudflare, x-render-origin-server:
# uvicorn), and fingerprinting the framework on every page response is
# pure downside (poweredByHeader: false).
if echo "$HEADERS" | grep -qi "x-powered-by"; then say_fail "no X-Powered-By on pages (poweredByHeader: false)"; else say_pass "no X-Powered-By on pages (poweredByHeader: false)"; fi
API_BANNER=$(curl -s -D - -o /dev/null "$BASE/api/health" | grep -i '^x-powered-by:' | tr -d '\r')
if [ -z "$API_BANNER" ]; then say_pass "no X-Powered-By on API responses"; else say_fail "no X-Powered-By on API responses (got '$API_BANNER')"; fi

# Session 16 F2: every envelope API response carries an explicit
# no-store — Next.js protects its dynamic PAGES with no-store but NOT
# route-handler JSON; authenticated data must never transit a cache
# without an explicit directive (RFC 9111 permits heuristic storage of
# unmarked 200s by any cache). Pinned on the happy path, the anonymous
# 401, and the authenticated 200.
CC_HEALTH=$(curl -s -D - -o /dev/null "$BASE/api/health" | grep -i '^cache-control:' | tr -d '\r' | awk '{print tolower($0)}')
if echo "$CC_HEALTH" | grep -q "no-store"; then say_pass "API no-store: /api/health 200 (${CC_HEALTH#cache-control: })"; else say_fail "API no-store: /api/health 200 (got '${CC_HEALTH}')"; fi
CC_ANON=$(curl -s -D - -o /dev/null "$BASE/api/workflows" | grep -i '^cache-control:' | tr -d '\r' | awk '{print tolower($0)}')
if echo "$CC_ANON" | grep -q "no-store"; then say_pass "API no-store: anonymous /api/workflows 401"; else say_fail "API no-store: anonymous /api/workflows 401 (got '${CC_ANON}')"; fi
CC_AUTHED=$(curl -s -D - -o /dev/null -b /tmp/smoke-cookies.txt "$BASE/api/workflows" | grep -i '^cache-control:' | tr -d '\r' | awk '{print tolower($0)}')
if echo "$CC_AUTHED" | grep -q "no-store"; then say_pass "API no-store: authenticated /api/workflows 200"; else say_fail "API no-store: authenticated /api/workflows 200 (got '${CC_AUTHED}')"; fi

# Session 10 F4: the public/ assets ship the live's CDN caching value (the
# 1.9MB hero video re-validated on every load at max-age=0 before).
MEDIA_HEADERS=$(curl -s -I "$BASE/media/hero-ai-loop.mp4")
if echo "$MEDIA_HEADERS" | grep -qi "cache-control: public, max-age=604800"; then say_pass "asset caching: hero video max-age=604800"; else say_fail "asset caching: hero video max-age=604800"; fi

SITEMAP=$(curl -s "$BASE/sitemap.xml")
if echo "$SITEMAP" | grep -q "/faq"; then say_pass "sitemap lists /faq"; else say_fail "sitemap lists /faq"; fi

echo "== smoke: logout =="
LOGOUT=$(curl -s -b /tmp/smoke-cookies.txt -c /tmp/smoke-cookies.txt -X POST "$BASE/api/auth/logout")
check "logout ok" "True" "$(echo "$LOGOUT" | field "['ok']")"
AFTER=$(curl -s -b /tmp/smoke-cookies.txt "$BASE/api/auth/me")
check "session invalidated after logout" "None" "$(echo "$AFTER" | field "['data']")"

echo
echo "=============================="
echo "SMOKE RESULT: $PASS passed, $FAIL failed"
echo "=============================="
[ "$FAIL" -eq 0 ]
