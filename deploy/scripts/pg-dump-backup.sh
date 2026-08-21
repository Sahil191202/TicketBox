#!/usr/bin/env bash
# Day 10 — wrapper for pg_dump from monorepo root
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
bash "$ROOT/Backend/infra/scripts/11-pg-dump-backup.sh"
