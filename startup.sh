#!/bin/sh
# Vanta Fiber / App Builder sandbox restart contract.
# Dev server contract: Vite dev on 0.0.0.0:8080 (preview proxy target).
PROBE_URL="${VITE_PREVIEW_PROBE_URL:-http://127.0.0.1:8080/}"
if curl -fsS -o /dev/null "$PROBE_URL" 2>/dev/null; then
  exit 0
fi
cd "$(dirname "$0")"
exec npm run dev
