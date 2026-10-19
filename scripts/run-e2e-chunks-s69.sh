#!/bin/bash
# S69 baseline e2e gate — chunked runner (the house pattern: the sandbox
# reaps long-detached runs, so the 500-check suite runs in chunks with
# incremental tallies). Built from the S68 runner per gotcha 66c/67 — the
# session69 spec APPENDED as its own chunk, the S68 list untouched.
# Usage: bash scripts/run-e2e-chunks-s69.sh [start-chunk]
# NOTE: research/ and this script are session scratch — NOT part of the gate.
cd /home/z/my-project/saas-company || exit 1
unset DATABASE_URL

TALLY_FILE=research/e2e-tally-s69.txt
mkdir -p research
[ -f "$TALLY_FILE" ] || echo "passed=0 chunks=0" > "$TALLY_FILE"

CHUNKS=(
  "auth brand-parity dashboard demo error-boundary"
  "head-metadata hydration landing login-states mobile-navigation"
  "mockup-motion-parity motion-parity navbar-behavior pages"
  "palette-parity performance-budget reduced-motion resilience"
  "resource-hygiene section-parity session-lifecycle session23-honesty"
  "session24-temporal session25-chart session26-chart-rank session27-stat-honesty"
  "session28-tie-break session29-first-run session29-jsonld session30-dual-ceiling"
  "session31-chart-edge session31-head-parity session32-head-parity session32-membership"
  "session33-concurrent-limiter session35-parity session36-interaction-parity session37-gradient-parity"
  "session37-sitemap-parity session37-transition-parity session38-logo-petals session38-shine-parity"
  "session38-static-inventory session39-period-parity session39-reduced-motion-loops session39-scroll-dot-period session39-stacking-inventory"
  "session40-responsive-inventory session41-focus-inventory session43-thankyou-input-surface session44-urlstate-selection-surface session45-traversal-media-video"
  "session46-clipboard-drag-offline typography-parity"
  "session42-print-responsive session47-print-text-entrances"
  "session48-pdflinks-buildfix session49-fontembedding-metadata"
  "session50-imagelayer-alternates session51-vectorlayer-reset-badge"
  "session52-structurallayer-convergence session53-resourcelayer-alternates session54-interiorlayer-laws session55-functionlayer-laws session56-imagelayer-interiors session57-payload-annots-qq"
  "session58-textposition-laws"
  "session59-colorfill-laws"
  "session60-literalrule-laws"
  "session61-readingorder-laws"
  "session62-transfermode-laws"
  "session63-pinnedframe-laws"
  "session64-smaskinterior-laws"
  "session65-gradientvalue-laws"
  "session66-scninvocation-laws"
  "session67-doinvocation-laws"
  "session68-gsinvocation-laws"
  "session69-gstream-laws"
)

START=${1:-1}
i=0
for chunk in "${CHUNKS[@]}"; do
  i=$((i+1))
  [ "$i" -lt "$START" ] && continue
  echo "=== CHUNK $i/${#CHUNKS[@]}: $chunk ==="
  SPECS=""
  for s in $chunk; do SPECS="$SPECS tests/e2e/$s.spec.ts"; done
  out=$(npx playwright test $SPECS --reporter=line 2>&1 | tail -20)
  echo "$out" | tail -4
  if ! echo "$out" | grep -qE " [0-9]+ passed"; then
    echo "!!! CHUNK $i FAILED — re-run: bash scripts/run-e2e-chunks-s69.sh $i"
    exit 1
  fi
  passed=$(echo "$out" | grep -oE "[0-9]+ passed" | tail -1 | grep -oE "[0-9]+")
  failed=$(echo "$out" | grep -oE "[0-9]+ failed" | tail -1 | grep -oE "[0-9]+" || echo 0)
  if [ "$failed" != "0" ]; then
    echo "!!! CHUNK $i HAS $failed FAILURES — re-run: bash scripts/run-e2e-chunks-s69.sh $i"
    exit 1
  fi
  cur=$(grep -oE "passed=[0-9]+" "$TALLY_FILE" | cut -d= -f2)
  curc=$(grep -oE "chunks=[0-9]+" "$TALLY_FILE" | cut -d= -f2)
  echo "passed=$((cur+passed)) chunks=$((curc+1))" > "$TALLY_FILE"
  cat "$TALLY_FILE"
done
echo "=== ALL CHUNKS GREEN ==="
cat "$TALLY_FILE"
