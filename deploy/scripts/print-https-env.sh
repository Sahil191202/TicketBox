#!/usr/bin/env bash
# Day 9 — wrapper for HTTPS .env / Vite / webhook printout
# Usage:
#   export DOMAIN=yourdomain.com
#   bash deploy/scripts/print-https-env.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$ROOT/Backend/infra/scripts/10-print-https-env.sh"

if [[ ! -f "$SCRIPT" ]]; then
  echo "Missing $SCRIPT"
  exit 1
fi

bash "$SCRIPT"
