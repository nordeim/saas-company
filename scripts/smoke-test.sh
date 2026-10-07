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
DATABASE_URL="$SMOKE_DB_URL" AUTH_SECRET="smoke-secret" PORT=$PORT NODE_ENV=production \
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

echo "== smoke: pages =="
for PATH_ROUTE in / /login /faq /privacy /terms /accessibility /refund-policy; do
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
