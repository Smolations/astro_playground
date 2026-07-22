#!/usr/bin/env bash
# Drive the AstroPlayground SPA headlessly and screenshot it. See ../SKILL.md.
#
# Usage: run.sh <steps.json> <out-dir> [network] [viewport] [base-url]
#   steps.json  ordered step spec consumed by shot.js (see its header / SKILL.md)
#   out-dir     where screenshots land (created if missing)
#   network     compose network (auto-discovered if omitted)
#   viewport    WxH (default 1000x800)
#   base-url    default http://assets:5173 (reached from inside the compose net)
set -euo pipefail

STEPS="${1:?usage: run.sh <steps.json> <out-dir> [net] [viewport] [base-url]}"
OUT="${2:?usage: run.sh <steps.json> <out-dir> [net] [viewport] [base-url]}"
NET="${3:-}"
VIEWPORT="${4:-1000x800}"
BASE="${5:-http://assets:5173}"

# Default compose project name is the repo dir (astro_playground); auto-discover
# the network so a renamed checkout still works.
if [ -z "$NET" ]; then
  NET="$(docker network ls --format '{{.Name}}' | grep -m1 'astro.*_default' || true)"
  NET="${NET:-astro_playground_default}"
fi

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STEPS_ABS="$(cd "$(dirname "$STEPS")" && pwd)/$(basename "$STEPS")"
# Persistent playwright-npm cache so repeat runs skip the ~15s install.
CACHE="${TMPDIR:-/tmp}/aplay-pw-cache"
mkdir -p "$OUT" "$CACHE"

docker run --rm --network "$NET" \
  -e BASE_URL="$BASE" -e VIEWPORT="$VIEWPORT" \
  -v "$SKILL_DIR/shot.js:/shot.js:ro" \
  -v "$STEPS_ABS:/steps.json:ro" \
  -v "$OUT:/out" \
  -v "$CACHE:/pw" \
  mcr.microsoft.com/playwright:v1.48.0-jammy \
  bash -c 'npm i --prefix /pw playwright@1.48.0 >/dev/null 2>&1; NODE_PATH=/pw/node_modules node /shot.js'

echo "screenshots -> $OUT"
