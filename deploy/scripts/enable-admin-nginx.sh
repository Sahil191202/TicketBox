#!/usr/bin/env bash
# Day 7 — install admin SPA nginx site on Ubuntu EC2.
# Run from the machine that has the TicketBox repo checked out, e.g.:
#   bash deploy/scripts/enable-admin-nginx.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/deploy/nginx/admin.conf"
DEST_AVAIL="/etc/nginx/sites-available/ticketbox-admin"
DEST_ENABLED="/etc/nginx/sites-enabled/ticketbox-admin"

if [[ ! -f "$SRC" ]]; then
  echo "Missing $SRC — run from a checkout that includes deploy/nginx/admin.conf"
  exit 1
fi

if [[ ! -f /var/www/admin/index.html ]]; then
  echo "WARNING: /var/www/admin/index.html not found. Upload dist/ first (Day 6)."
fi

sudo cp "$SRC" "$DEST_AVAIL"
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf "$DEST_AVAIL" "$DEST_ENABLED"
sudo nginx -t
sudo systemctl reload nginx

echo "OK — admin site enabled. Open http://YOUR_EC2_PUBLIC_IP"
