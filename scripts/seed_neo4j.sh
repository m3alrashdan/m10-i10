#!/usr/bin/env bash
# Seed the running Neo4j container with the recipe fixture.
#
# Idempotent — `MERGE` and `CREATE CONSTRAINT IF NOT EXISTS` in
# api/seed.cypher mean repeat runs do not duplicate nodes.
#
# Pipes api/seed.cypher (on the host) into the neo4j container's
# cypher-shell over stdin. Credentials come from .env (loaded below),
# the same file Compose reads for the neo4j healthcheck and the api env.

set -euo pipefail

cd "$(dirname "$0")/.."

# Load .env so NEO4J_USER / NEO4J_PASSWORD are available to this shell.
# Compose reads .env on its own for interpolation, but a host script does
# not inherit it automatically.
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

NEO4J_USER="${NEO4J_USER:-neo4j}"
: "${NEO4J_PASSWORD:?NEO4J_PASSWORD must be set (copy .env.example to .env)}"

echo "Seeding Neo4j (recipe fixture, idempotent) ..."
docker compose exec -T neo4j \
  cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" \
  < api/seed.cypher

echo "Neo4j seeded: recipe graph loaded (re-runnable — MERGE-based)."
