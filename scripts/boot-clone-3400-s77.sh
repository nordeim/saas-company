#!/usr/bin/env bash
# S76 recon — boot the clone standalone server on :3400 against db/recon77.db
# (the S74/S75 recon form; one server life per the gotcha-63 reaper law).
set -e
cd /home/z/my-project/saas-company
unset DATABASE_URL
export DATABASE_URL="file:/home/z/my-project/saas-company/db/recon77.db"
export PORT=3400
export HOSTNAME=127.0.0.1
export AUTH_RATE_LIMIT_MAX=50
# static assets for the standalone build
rm -rf .next/standalone/.next/static 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/public 2>/dev/null || true
cp -r public .next/standalone/public
cd .next/standalone
exec node server.js
