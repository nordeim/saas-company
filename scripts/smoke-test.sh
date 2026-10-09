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
SEED_OUT="$(DATABASE_URL="$SMOKE_DB_URL" npx tsx prisma/seed.ts 2>&1)" || { echo "FAIL: seed"; exit 1; }
say_pass "scratch db pushed + seeded"
# Session 24 R3: the seed must WRITE WHERE THE SERVER READS. The seed
# prints its resolved target (seed-target:<url>) — an explicit process
# env (this invocation's discipline) resolves through the repo anchor to
# db/smoke.db. Pre-fix, a PARENT-directory .env could silently win the
# Prisma auto-load and redirect the write outside the repo while the
# server opened the in-repo file (probed in vivo: login answered P2021).
SEED_TARGET_LINE="$(printf '%s\n' "$SEED_OUT" | grep -o 'seed-target:.*' | head -1)"
if printf '%s' "$SEED_TARGET_LINE" | grep -q "db/smoke.db$"; then
  say_pass "seed placement pinned (seed-target resolves to db/smoke.db)"
else
  say_fail "seed placement (expected seed-target ending db/smoke.db, got [$SEED_TARGET_LINE])"
fi

echo "== smoke: boot production server on :$PORT =="
# GENERATE_RATE_LIMIT_MAX=2 (Session 16 F1): the smoke server pins the LLM
# composer's per-user ceiling LOW so the generate-limiter trip below is
# exactly deterministic (nothing else in smoke calls /api/workflows/generate).
# AUTH_RATE_LIMIT_MAX=50 (Session 17): the e2e webServer's own insurance
# pattern — the new login-timing pins (14 POSTs) + the parallel race pin
# (10 POSTs) lift the suite's auth-POST count to ~30; no auth-429 pin exists
# in smoke (the newsletter + generate buckets own those trips).
# WORKFLOW_RATE_LIMIT_MAX=2 (Session 21 R2): the workflow-create limiter
# trips deterministically — the create + invalid-status POSTs consume the
# bucket, so the Session-21 section's next POST answers the 429 envelope.
DATABASE_URL="$SMOKE_DB_URL" AUTH_SECRET="smoke-secret" AUTH_RATE_LIMIT_MAX=50 GENERATE_RATE_LIMIT_MAX=2 WORKFLOW_RATE_LIMIT_MAX=2 PORT=$PORT NODE_ENV=production \
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

echo "== smoke: Session 21 — the data-volume ceiling + creation limiter =="
# R1 (the OUTPUT twin of the S20 request-size ceiling): seed 105 probe rows
# for the demo user DIRECTLY into the smoke scratch DB (the suite's own
# database — no API traffic, no limiter budget). The user now owns 111
# workflows (6 seeded + 1 created - 1 deleted + 105 probe rows; 70 of the
# probe rows active, 35 paused; every probe row runs:10 / hours:1 / 99.5).
# The GET must cap the response at 100 rows while meta carries the TRUTH.
DATABASE_URL="$SMOKE_DB_URL" node -e '
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const user = await p.user.findUnique({ where: { email: "demo@novaai.app" } });
  const rows = Array.from({ length: 105 }, (_, i) => ({
    userId: user.id,
    name: "Probe workflow " + String(i + 1).padStart(3, "0"),
    description: "A smoke probe row for the Session-21 ceiling pin.",
    status: i % 3 === 0 ? "paused" : "active",
    category: "Ops",
    runs: 10,
    successRate: 99.5,
    timeSavedHours: 1,
  }));
  await p.workflow.createMany({ data: rows });
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
' || { say_fail "probe-row seeding"; }

CAPPED=$(curl -s -b /tmp/smoke-cookies.txt "$BASE/api/workflows")
check "workflows list ceiling caps the response at 100 rows" "100" "$(echo "$CAPPED" | python3 -c "import json,sys;print(len(json.load(sys.stdin)['data']))")"
check "workflows list meta.total reports the TRUE count (111)" "111" "$(echo "$CAPPED" | field "['meta']['total']")"
check "workflows list meta.stats.active is the honest aggregate (75)" "75" "$(echo "$CAPPED" | field "['meta']['stats']['active']")"
check "workflows list meta.stats.runs is the honest aggregate (8170)" "8170" "$(echo "$CAPPED" | field "['meta']['stats']['runs']")"
check "workflows list meta.stats.hours is the honest aggregate (265)" "265" "$(echo "$CAPPED" | field "['meta']['stats']['hours']")"

# Session 26 R1 — the chart's RANKING aggregate rides the same meta (the
# S21 stat-cards precedent extended to the ranking surface). The 111-row
# workspace is the case that PROVES the server-side computation: the
# newest-100 list cap contains ZERO seeded rows (105 probe rows fill it
# entirely), so the champion "Anomaly scan on billing events" (3,422 runs,
# 31 days old) is INVISIBLE to any client-side ranking — only the server's
# meta.topRuns can chart it. A client-side-computed topRuns would answer 8
# probe rows (runs:10) here.
check "meta.topRuns carries exactly 8 ranked rows" "8" "$(echo "$CAPPED" | python3 -c "import json,sys;print(len(json.load(sys.stdin)['meta']['topRuns']))")"
check "meta.topRuns[0] is the workspace champion (outside the newest-100 cap)" "Anomaly scan on billing events" "$(echo "$CAPPED" | field "['meta']['topRuns'][0]['name']")"
check "meta.topRuns[0].runs is the champion's true runs (3422)" "3422" "$(echo "$CAPPED" | field "['meta']['topRuns'][0]['runs']")"
check "meta.topRuns[1].runs is the runner-up (2107 — Onboarding email orchestration)" "2107" "$(echo "$CAPPED" | field "['meta']['topRuns'][1]['runs']")"
check "meta.topRuns[6].runs is the probe-row tail (10 — the seeded rows took the top)" "10" "$(echo "$CAPPED" | field "['meta']['topRuns'][6]['runs']")"
CAPPED_CT=$(curl -s -o /dev/null -w '%{header_json}' -b /tmp/smoke-cookies.txt "$BASE/api/workflows" | python3 -c "import json,sys;h=json.load(sys.stdin);print(h.get('cache-control',[''])[0].lower())")
check "capped list keeps the no-store directive" "private, no-store" "$CAPPED_CT"

# R2 (the creation-frequency ceiling): the create + invalid-status POSTs
# above consumed the smoke server's WORKFLOW_RATE_LIMIT_MAX=2 bucket — the
# next POST answers the 429 envelope with the S15 Retry-After contract.
RATE=$(curl -s -b /tmp/smoke-cookies.txt -X POST "$BASE/api/workflows" \
  -H "Content-Type: application/json" -d '{"name":"Should not exist"}')
check "workflow-create limiter trips (429) after the budget" "RATE_LIMITED" "$(echo "$RATE" | field "['error']['code']")"
RATE_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/smoke-cookies.txt -X POST "$BASE/api/workflows" \
  -H "Content-Type: application/json" -d '{"name":"Should not exist either"}')
check "workflow-create limiter answers 429" "429" "$RATE_STATUS"
RATE_RA=$(curl -s -D - -o /dev/null -b /tmp/smoke-cookies.txt -X POST "$BASE/api/workflows" \
  -H "Content-Type: application/json" -d '{"name":"Retry-after probe"}' | python3 -c "import sys;[print(l.split(':',1)[1].strip()) for l in sys.stdin if l.lower().startswith('retry-after')]" | head -1)
if [ -n "$RATE_RA" ] && [ "$RATE_RA" -ge 1 ] 2>/dev/null; then say_pass "workflow-create 429 carries Retry-After ($RATE_RA s)"; else say_fail "workflow-create 429 carries Retry-After"; fi

echo "== smoke: Session 22 — mutation concurrency + cross-user ownership =="
# F1 (the UPDATE/DELETE twin of S17's register race): the [id] routes ran
# read-check-act (findFirst -> parse -> update/delete by bare id) with NO
# P2025 classifier anywhere — a DELETE committing while a slow PATCH body
# parsed threw P2025 out of update() and the wrapper answered the 500
# INTERNAL_ERROR envelope (probed 3/3); the parallel DELETE double-fire hit
# 500 in 2/5 tries (nondeterministic — the same user action answered 404 or
# 500 depending on scheduling). Post-fix the writes are OWNERSHIP-SCOPED
# and atomic (updateMany/deleteMany with userId in the WHERE): count===0 ->
# the honest 404; updateMany/deleteMany never throw P2025 — the race is
# closed by construction.
# F2: the cross-user ownership contract had NO wire-level pin — the fix
# rides the ownership-scoped WHERE clause, so these pins must prove user A
# cannot read/patch/delete user B's row.
# User B and C are FRESH accounts: their per-user workflow-creation buckets
# are untouched (the MAIN user's WORKFLOW_RATE_LIMIT_MAX=2 budget was
# consumed by the workflow-crud + S21 sections above).

REG_B=$(curl -s -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" \
  -d '{"name":"Smoke B","email":"smoke-b@example.com","password":"SmokeB123!"}')
check "user B registration ok" "True" "$(echo "$REG_B" | field "['ok']")"
LOGIN_B=$(curl -s -c /tmp/smoke-cookies-b.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" -d '{"email":"smoke-b@example.com","password":"SmokeB123!"}')
check "user B login ok" "True" "$(echo "$LOGIN_B" | field "['ok']")"

WF_B=$(curl -s -b /tmp/smoke-cookies-b.txt -X POST "$BASE/api/workflows" \
  -H "Content-Type: application/json" -d '{"name":"B private workflow"}')
check "user B workflow create ok" "True" "$(echo "$WF_B" | field "['ok']")"
WF_B_ID=$(echo "$WF_B" | field "['data']['id']")

# --- F2: cross-user ownership — A (the demo session) on B's row -> 404 x3 ---
check "cross-user GET answers 404" "404" "$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/smoke-cookies.txt "$BASE/api/workflows/$WF_B_ID")"
check "cross-user PATCH answers 404" "404" "$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/smoke-cookies.txt -X PATCH "$BASE/api/workflows/$WF_B_ID" -H "Content-Type: application/json" -d '{"name":"hijacked"}')"
check "cross-user DELETE answers 404" "404" "$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/smoke-cookies.txt -X DELETE "$BASE/api/workflows/$WF_B_ID")"
check "B's workflow survived A's attacks" "True" "$(curl -s -b /tmp/smoke-cookies-b.txt "$BASE/api/workflows/$WF_B_ID" | field "['ok']")"

# --- the empty-patch contract: a {} body historically answers 200 + the
#     row; Prisma's updateMany({data:{}}) is a no-op returning count 0 EVEN
#     FOR AN EXISTING ROW (probed) — the route must special-case it ---
EMPTY_PATCH=$(curl -s -b /tmp/smoke-cookies-b.txt -X PATCH "$BASE/api/workflows/$WF_B_ID" \
  -H "Content-Type: application/json" -d '{}')
check "empty-body PATCH keeps the 200 contract" "True" "$(echo "$EMPTY_PATCH" | field "['ok']")"
check "empty-body PATCH returns the row" "B private workflow" "$(echo "$EMPTY_PATCH" | field "['data']['name']")"

# --- F1 Race B (deterministic): a ~100KB PATCH body (under the S20 128KB
#     ceiling) streams at 60KB/s (~1.7s parse); a DELETE fired at +0.7s
#     commits mid-parse; the PATCH's write must answer the honest 404
#     (pre-fix: the 500 INTERNAL_ERROR envelope — unclassified P2025) ---
WF_RACE=$(curl -s -b /tmp/smoke-cookies-b.txt -X POST "$BASE/api/workflows" \
  -H "Content-Type: application/json" -d '{"name":"B race victim"}')
WF_RACE_ID=$(echo "$WF_RACE" | field "['data']['id']")
python3 -c "import json;print(json.dumps({'name':'renamed-race','description':'p'*100000}))" > /tmp/smoke-race-body.json
( sleep 0.7; curl -s -b /tmp/smoke-cookies-b.txt -X DELETE "$BASE/api/workflows/$WF_RACE_ID" \
  -o /tmp/smoke-race-del.json -w '%{http_code}' > /tmp/smoke-race-del.code ) &
RACE_DEL_PID=$!
RACE_PATCH_CODE=$(curl -s --limit-rate 60k -b /tmp/smoke-cookies-b.txt -X PATCH "$BASE/api/workflows/$WF_RACE_ID" \
  -H "Content-Type: application/json" --data-binary @/tmp/smoke-race-body.json \
  -o /tmp/smoke-race-patch.json -w '%{http_code}')
wait "$RACE_DEL_PID"
check "raced PATCH (delete mid-parse) answers 404" "404" "$RACE_PATCH_CODE"
check "raced PATCH envelope code" "NOT_FOUND" "$(field "['error']['code']" < /tmp/smoke-race-patch.json)"
check "racing DELETE answers 200" "200" "$(cat /tmp/smoke-race-del.code)"
rm -f /tmp/smoke-race-body.json

# --- F1 Race A: six truly-parallel DELETEs on one victim (independent curl
#     processes = independent sockets — the S17 wire-level-concurrency
#     lesson): exactly one 200, every answer an envelope in {200,404},
#     ZERO 500s ---
REG_C=$(curl -s -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" \
  -d '{"name":"Smoke C","email":"smoke-c@example.com","password":"SmokeC123!"}')
LOGIN_C=$(curl -s -c /tmp/smoke-cookies-c.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" -d '{"email":"smoke-c@example.com","password":"SmokeC123!"}')
WF_C=$(curl -s -b /tmp/smoke-cookies-c.txt -X POST "$BASE/api/workflows" \
  -H "Content-Type: application/json" -d '{"name":"C race victim"}')
WF_C_ID=$(echo "$WF_C" | field "['data']['id']")
RACEA_DIR=$(mktemp -d)
RACEA_PIDS=""
for i in 1 2 3 4 5 6; do
  curl -s -b /tmp/smoke-cookies-c.txt -X DELETE "$BASE/api/workflows/$WF_C_ID" \
    -o "$RACEA_DIR/r$i" -w '%{http_code}' > "$RACEA_DIR/c$i" &
  RACEA_PIDS="$RACEA_PIDS $!"
done
for p in $RACEA_PIDS; do wait "$p"; done
RACEA_200=$(for f in "$RACEA_DIR"/c*; do printf '%s\n' "$(cat "$f")"; done | grep -c '^200$' || true)
# NB: pair the r-file by INDEX — a `${f/c/r}` substitution would rewrite the
# first 'c' anywhere in the mktemp path, not the c<index> stem (a
# mid-execution pin bug caught BY this pin, the S21 family).
RACEA_BAD=$(for i in 1 2 3 4 5 6; do
  c=$(cat "$RACEA_DIR/c$i")
  if [ "$c" != "200" ] && [ "$c" != "404" ]; then echo "bad:$c"; fi
  if ! grep -q '"ok":' "$RACEA_DIR/r$i"; then echo "bad-body:$c"; fi
done | head -3)
rm -rf "$RACEA_DIR"
check "parallel DELETE race: exactly one 200" "1" "$RACEA_200"
if [ -z "$RACEA_BAD" ]; then
  say_pass "parallel DELETE race: every answer in {200,404} (zero 500s)"
else
  say_fail "parallel DELETE race: $RACEA_BAD (the unclassified P2025 broke the envelope contract)"
fi

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

# Session 19 F1/F2: the crash-path envelope + the branded server-crash
# boundary. A THIRD mini-server boots with an UNWRITABLE DATABASE_URL
# (/dev/null is a char device — ENOTDIR by construction, PID-independent)
# and the SAME AUTH_SECRET as the main server, so the main server's session
# cookie is structurally valid there and the authenticated crash paths are
# reachable. Pre-fix (the catalog in docs/remediation-plan-session19.md):
# seven endpoints answered a BARE 500 with an EMPTY body and NO
# content-type; /dashboard served Next's unbranded __next_error__ document.
echo "== smoke: crash-path envelope (third server on :3230, unwritable DB) =="
BROKEN_PORT=3230
BROKEN_BASE="http://localhost:$BROKEN_PORT"
BROKEN_DB_URL="file:/dev/null/unwritable-s19/custom.db"
DATABASE_URL="$BROKEN_DB_URL" AUTH_SECRET="smoke-secret" PORT=$BROKEN_PORT NODE_ENV=production \
  node .next/standalone/server.js >/tmp/smoke-broken-server.log 2>&1 &
BROKEN_PID=$!
BROKEN_UP=no
for i in $(seq 1 40); do
  if curl -sf "$BROKEN_BASE/api/health" >/dev/null 2>&1; then BROKEN_UP=yes; break; fi
  sleep 0.5
done
if [ "$BROKEN_UP" = "yes" ]; then
  # The S18 field, pinned on the DOWN side for the first time.
  BROKEN_HEALTH=$(curl -s "$BROKEN_BASE/api/health")
  check "broken-db health reports db down" "down" "$(echo "$BROKEN_HEALTH" | field "['data']['db']")"

  CRASH_LOGIN=$(curl -s -X POST "$BROKEN_BASE/api/auth/login" -H "Content-Type: application/json" \
    -d '{"email":"demo@novaai.app","password":"Demo1234!"}')
  CRASH_LOGIN_CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BROKEN_BASE/api/auth/login" -H "Content-Type: application/json" \
    -d '{"email":"demo@novaai.app","password":"Demo1234!"}')
  check "broken-db login answers 500 (not a bare crash)" "500" "$CRASH_LOGIN_CODE"
  check "broken-db login envelope code" "INTERNAL_ERROR" "$(echo "$CRASH_LOGIN" | field "['error']['code']")"
  CRASH_LOGIN_CT=$(curl -s -o /dev/null -w '%{content_type}' -X POST "$BROKEN_BASE/api/auth/login" -H "Content-Type: application/json" \
    -d '{"email":"demo@novaai.app","password":"Demo1234!"}')
  check "broken-db login content-type is json (no bare empty body)" "application/json" "$CRASH_LOGIN_CT"

  check "broken-db register answers 500" "500" "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BROKEN_BASE/api/auth/register" -H "Content-Type: application/json" \
    -d '{"name":"Crash Probe","email":"crash-s19@example.com","password":"Crash123!"}')"
  check "broken-db newsletter answers 500" "500" "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BROKEN_BASE/api/newsletter" -H "Content-Type: application/json" \
    -d '{"email":"crash-s19@example.com"}')"
  check "broken-db demo answers 500" "500" "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BROKEN_BASE/api/demo" -H "Content-Type: application/json" \
    -d '{"name":"Crash Probe","email":"crash-s19@example.com"}')"
  check "broken-db auth/me (session) answers 500" "500" "$(curl -s -b /tmp/smoke-cookies.txt -o /dev/null -w '%{http_code}' "$BROKEN_BASE/api/auth/me")"
  check "broken-db workflows GET (session) answers 500" "500" "$(curl -s -b /tmp/smoke-cookies.txt -o /dev/null -w '%{http_code}' "$BROKEN_BASE/api/workflows")"
  check "broken-db workflows POST (session) answers 500" "500" "$(curl -s -b /tmp/smoke-cookies.txt -o /dev/null -w '%{http_code}' -X POST "$BROKEN_BASE/api/workflows" -H "Content-Type: application/json" \
    -d '{"name":"crash probe workflow"}')"

  # Session 19 F2: the server-crash branded boundary on the page layer.
  check "broken-db /dashboard (session) serves 200 (degraded, not a crash)" "200" "$(curl -s -b /tmp/smoke-cookies.txt -o /dev/null -w '%{http_code}' "$BROKEN_BASE/dashboard")"
  DASH_BODY=$(curl -s -b /tmp/smoke-cookies.txt "$BROKEN_BASE/dashboard")
  if echo "$DASH_BODY" | grep -q "Workspace unavailable"; then
    say_pass "broken-db /dashboard renders the branded fallback view"
  else
    say_fail "broken-db /dashboard renders the branded fallback view (got no 'Workspace unavailable')"
  fi
  if echo "$DASH_BODY" | grep -q "__next_error__"; then
    say_fail "broken-db /dashboard is NOT Next's unbranded error document"
  else
    say_pass "broken-db /dashboard is NOT Next's unbranded error document"
  fi
  # Session 20 F2: the request-size ceiling on a SECOND route — the
  # broken server's newsletter bucket is fresh (one crash-probe POST only;
  # the guard fires BEFORE any DB touch — the broken DB is irrelevant).
  python3 -c "import json;print(json.dumps({'email':'a'*2097152+'@x.example'}))" > /tmp/smoke-big-newsletter.json
  check "oversized newsletter body answers 413" "413" "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BROKEN_BASE/api/newsletter" -H "Content-Type: application/json" --data-binary @/tmp/smoke-big-newsletter.json)"
  python3 -c "import json;print(json.dumps({'email':'a'*100000+'@x.example'}))" > /tmp/smoke-mid-newsletter.json
  check "under-ceiling (100KB) newsletter body still parses (400 VALIDATION, not 413)" "400" "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BROKEN_BASE/api/newsletter" -H "Content-Type: application/json" --data-binary @/tmp/smoke-mid-newsletter.json)"
  rm -f /tmp/smoke-big-newsletter.json /tmp/smoke-mid-newsletter.json
else
  say_fail "crash-path server booted on :$BROKEN_PORT"
fi
kill "$BROKEN_PID" 2>/dev/null
wait "$BROKEN_PID" 2>/dev/null

echo "== smoke: method + payload guards (Session 20) =="
# Session 20 F1: the method-mismatch layer — the FRAMEWORK answered
# unexported methods with a BARE 405 (empty body, no content-type, no
# Allow, no cache-control; the 11-probe catalog in
# docs/remediation-plan-session20.md). The guard exports now answer the
# envelope. Session 20 F2: the request-size ceiling — POST routes
# buffered arbitrarily large bodies (a 50MB login body was fully parsed
# pre-fix); the ceiling reads the DECLARED content-length and answers
# 413 PAYLOAD_TOO_LARGE above 128KB.
MM_LOGIN=$(curl -s -X GET "$BASE/api/auth/login")
check "method-mismatch GET login answers 405 (not the framework's bare 405)" "405" "$(curl -s -o /dev/null -w '%{http_code}' -X GET "$BASE/api/auth/login")"
check "method-mismatch GET login envelope code" "METHOD_NOT_ALLOWED" "$(echo "$MM_LOGIN" | field "['error']['code']")"
check "method-mismatch GET login content-type is json" "application/json" "$(curl -s -o /dev/null -w '%{content_type}' -X GET "$BASE/api/auth/login")"
MM_ALLOW=$(curl -s -o /dev/null -w '%{header_json}' -X GET "$BASE/api/auth/login" | python3 -c "import json,sys;h=json.load(sys.stdin);print([v for k,v in h.items() if k.lower()=='allow'][0][0])" 2>/dev/null)
check "method-mismatch GET login Allow header lists the real methods" "OPTIONS, POST" "$MM_ALLOW"
MM_CC=$(curl -s -o /dev/null -w '%{header_json}' -X GET "$BASE/api/auth/login" | python3 -c "import json,sys;h=json.load(sys.stdin);print([v for k,v in h.items() if k.lower()=='cache-control'][0][0])" 2>/dev/null)
check "method-mismatch GET login carries no-store" "private, no-store" "$MM_CC"
check "method-mismatch POST health answers 405" "405" "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/health")"
check "method-mismatch POST health envelope code" "METHOD_NOT_ALLOWED" "$(curl -s -X POST "$BASE/api/health" | field "['error']['code']")"
check "method-mismatch DELETE workflows answers 405" "405" "$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "$BASE/api/workflows")"
check "method-mismatch POST workflows/[id] answers 405 (guard fires before the session gate)" "405" "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/workflows/guard-probe-id")"
check "OPTIONS login answers 204" "204" "$(curl -s -o /dev/null -w '%{http_code}' -X OPTIONS "$BASE/api/auth/login")"
OPT_ALLOW=$(curl -s -o /dev/null -w '%{header_json}' -X OPTIONS "$BASE/api/auth/login" | python3 -c "import json,sys;h=json.load(sys.stdin);print([v for k,v in h.items() if k.lower()=='allow'][0][0])" 2>/dev/null)
check "OPTIONS login Allow lists the real methods" "OPTIONS, POST" "$OPT_ALLOW"

# Session 20 F2: the request-size ceiling (declared content-length).
python3 -c "import json;print(json.dumps({'email':'big@probe.example','password':'a'*2097152}))" > /tmp/smoke-big-login.json
BIG_LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" --data-binary @/tmp/smoke-big-login.json)
check "oversized (2MB) login body answers 413" "413" "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" --data-binary @/tmp/smoke-big-login.json)"
check "oversized login envelope code" "PAYLOAD_TOO_LARGE" "$(echo "$BIG_LOGIN" | field "['error']['code']")"
rm -f /tmp/smoke-big-login.json
# (The newsletter big-body pins live in the broken-server block below —
# the MAIN server's newsletter bucket is already consumed by the
# newsletter+demo section; the third server's bucket is fresh.)

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
