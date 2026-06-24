#!/usr/bin/env bash
# Seed the running Weaviate container with the chunked-docs fixture.
#
# Idempotent — api/seed_weaviate.py creates the `Chunk` class only if it
# does not exist and skips chunk_ids already present.
#
# The seeder runs INSIDE the api container: it needs sentence-transformers,
# weaviate-client, and the rest of the api requirements, which live in the
# api image (not on the host). The api container's WEAVIATE_URL env already
# points at http://weaviate:8080, so no URL needs to be passed in.
#
# Path note: the api Dockerfile copies the package to /app/api/ with
# WORKDIR /app, so the seeder is invoked as `python api/seed_weaviate.py`.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "Seeding Weaviate (chunked-docs fixture, idempotent) ..."
docker compose exec -T api python api/seed_weaviate.py

echo "Weaviate seeded: Chunk class populated (re-runnable — skips existing)."
