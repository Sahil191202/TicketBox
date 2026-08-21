#!/usr/bin/env bash
# Day 9 — wrapper that runs Backend/infra certbot script from monorepo root
# Usage:
#   export DOMAIN=yourdomain.com
#   export CERTBOT_EMAIL=you@example.com
#   bash deploy/scripts/certbot-ssl.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$ROOT/Backend/infra/scripts/09-certbot-ssl.sh"

if [[ ! -f "$SCRIPT" ]]; then
  echo "Missing $SCRIPT"
  exit 1
fi

bash "$SCRIPT"
