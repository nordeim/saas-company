#!/usr/bin/env bash
# S76 capture — boot the clone standalone on :3500 against db/capture77.db
set -e
cd /home/z/my-project/saas-company
unset DATABASE_URL
export DATABASE_URL="file:/home/z/my-project/saas-company/db/capture77.db"
export PORT=3500
export HOSTNAME=127.0.0.1
export AUTH_RATE_LIMIT_MAX=50
rm -rf .next/standalone/.next/static 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/public 2>/dev/null || true
cp -r public .next/standalone/public
cd .next/standalone
exec node server.js
