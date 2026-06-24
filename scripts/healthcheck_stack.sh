#!/usr/bin/env bash
# Poll `docker compose ps` until all four services report healthy, or
# until the 90s budget (45 iterations x 2s) expires.
#
# Exit 0 once api, web, neo4j, and weaviate are all healthy; exit 1 on
# timeout (and dump `docker compose ps` so the failing service is visible).

set -euo pipefail

cd "$(dirname "$0")/.."

SERVICES="api web neo4j weaviate"
MAX_ITERS=45
SLEEP_SECS=2

# Print the Health state of one service, or "missing" if not present.
# `docker compose ps --format json` emits either an NDJSON stream (one
# object per line, newer Compose) or a single JSON array (older) — handle
# both. A service with no healthcheck reports an empty Health string.
svc_health() {
  docker compose ps "$1" --format json 2>/dev/null | python3 -c '
import json, sys
raw = sys.stdin.read().strip()
if not raw:
    print("missing"); sys.exit(0)
try:
    data = json.loads(raw)
    objs = data if isinstance(data, list) else [data]
except json.JSONDecodeError:
    objs = [json.loads(l) for l in raw.splitlines() if l.strip()]
print(objs[0].get("Health", "") or "none" if objs else "missing")
'
}

echo "Waiting for all services to become healthy: $SERVICES"
for i in $(seq 1 "$MAX_ITERS"); do
  all_healthy=true
  status_line=""
  for svc in $SERVICES; do
    h="$(svc_health "$svc")"
    status_line="$status_line $svc=$h"
    [ "$h" != "healthy" ] && all_healthy=false
  done

  if [ "$all_healthy" = "true" ]; then
    echo "All services healthy:${status_line}"
    exit 0
  fi

  echo "[$i/$MAX_ITERS] not ready yet:${status_line}"
  sleep "$SLEEP_SECS"
done

echo "TIMEOUT: not all services reached healthy within $((MAX_ITERS * SLEEP_SECS))s"
docker compose ps
exit 1
