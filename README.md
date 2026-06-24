# Integration 10 — Dockerize the Four-Service Stack

Compose the Lab's FastAPI backend and Next.js frontend with
**containerized Neo4j and Weaviate** into a one-command Dockerized
stack delivered as a 3-Team-Member team.

> Read the full Integration guide on the cohort site:
> <https://LevelUp-Applied-AI.github.io/aispire-14005-pages/modules/module-10/a0cae6a2>
>
> Team-facing spec:
> <https://LevelUp-Applied-AI.github.io/aispire-14005-pages/modules/module-10/4ba363ed>

## Team Roles

See [TEAM.md](TEAM.md) for role assignments and the per-role file
checklist. See [CONTRIBUTING.md](CONTRIBUTING.md) for the internal-PR
review convention and the contract-change protocol.

## The stack

| Service | Image / build | Host port | Healthcheck |
|---|---|---|---|
| `neo4j` | `neo4j:5-community` | 7687 (Bolt), 7474 (HTTP) | `cypher-shell 'RETURN 1'` |
| `weaviate` | `semitechnologies/weaviate:1.24.10` | 8080 | `wget /v1/.well-known/ready` |
| `api` | build `api/Dockerfile` (context = repo root) | 8000 | `GET /readyz` (probes both backends) |
| `web` | build `web/Dockerfile` (context = `./web`) | 3000 | `GET /` |

Bring-up order is enforced by healthchecks and `depends_on:
condition: service_healthy`:

```
neo4j  ─┐
        ├─▶ api ─▶ web
weaviate┘
```

The data tier becomes healthy first; `api` waits for both backends (its
`/readyz` probes Neo4j and Weaviate), then `web` waits for `api`.

## Starter Layout

```
api/                      Pre-implemented FastAPI backend (Backend lead owns)
web/                      Pre-implemented Next.js frontend (Frontend lead owns)
docker-compose.yml        Four-service stack — Infra-Integration lead
scripts/
  seed_neo4j.sh           Seeds the recipe graph into Neo4j
  seed_weaviate.sh        Seeds the chunked-docs fixture into Weaviate
  healthcheck_stack.sh    Polls `docker compose ps` until all healthy
.env.example              Placeholder credentials (copy to .env)
TEAM.md                   Team roster + per-role file checklist
CONTRIBUTING.md           Branch convention + internal-PR protocol
tests/integration/        End-to-end smoke harness
```

---

## Runbook

### 1. Clone

```bash
git clone <your-team-fork-url> m10-i10
cd m10-i10
```

### 2. Environment setup

```bash
cp .env.example .env
# Edit .env and set a real NEO4J password. Keep NEO4J_AUTH in sync with
# NEO4J_USER / NEO4J_PASSWORD (NEO4J_AUTH format is <user>/<password>).
# Never commit .env — it is gitignored.
```

`.env` keys:

| Key | Purpose |
|---|---|
| `NEO4J_AUTH` | `<user>/<password>` the neo4j container provisions on first boot |
| `NEO4J_USER` | interpolated into the api env and the neo4j healthcheck |
| `NEO4J_PASSWORD` | same — must match the password half of `NEO4J_AUTH` |
| `WEB_ORIGIN` | CORS origin the api allows (where the browser loads the UI) |

### 3. Build & start

```bash
docker compose up -d --build
```

First boot is slow: the api image installs the ML stack, and on first
start the api lifespan downloads spaCy `en_core_web_sm`, `flan-t5-base`,
and `all-MiniLM-L6-v2` (~1 GB). The api healthcheck has a generous
`start_period` to cover the cold model cache.

Wait until every service reports healthy:

```bash
bash scripts/healthcheck_stack.sh
```

(Or use the built-in gate: `docker compose up -d --wait --build`.)

### 4. Seed the data stores

Both scripts are idempotent — safe to re-run.

```bash
bash scripts/seed_neo4j.sh      # recipe graph → Neo4j (MERGE-based)
bash scripts/seed_weaviate.sh   # chunked docs → Weaviate (skips existing)
```

### 5. Demo

```bash
# RAG answer with citations + confidence:
curl -s -X POST http://localhost:8000/rag/answer \
  -H 'Content-Type: application/json' \
  -d '{"question": "How do I prep ginger for stir-fry?"}' | jq .
```

Expected shape (non-sentinel answer, non-empty citations, positive
confidence):

```json
{
  "answer": "...[1]...",
  "citations": [{"chunk_id": 3, "score": 0.71}],
  "confidence": 0.71
}
```

**Browser demo** — open the UI:

- RAG (cited answer): <http://localhost:3000/rag>
- Entity extraction: <http://localhost:3000/extract>
- Knowledge-graph query: <http://localhost:3000/kg>

Neo4j Browser is also available at <http://localhost:7474> (log in with
the `NEO4J_USER` / `NEO4J_PASSWORD` from your `.env`).

### 6. Teardown

```bash
docker compose down      # stop containers, KEEP volumes (data persists)
docker compose down -v   # stop AND wipe neo4j_data + weaviate_data
```

After `down -v` you must re-run both seed scripts on the next `up`.

---

## End-to-end test

With the stack up and seeded:

```bash
pytest tests/integration/test_stack_e2e.py -v
```

The test skips automatically when no stack is reachable on
`localhost:8000`, so it is safe to run in any environment.

## Troubleshooting

- **`port is already allocated`** — another process (or a stray
  container) holds 8080/7687/7474/8000/3000. Find it with
  `docker ps` / `ss -ltnp` and stop it, or stop the conflicting stack.
- **api never goes healthy** — first boot is downloading models; give it
  several minutes. Tail logs: `docker compose logs -f api`.
- **`/rag/answer` returns the sentinel** ("I cannot answer this from the
  available sources") — Weaviate has not been seeded yet. Run
  `bash scripts/seed_weaviate.sh`.

## Submission

Team submission (one per team): the team submitter pastes the team
fork's main-branch URL into TalentLMS → Module 10 → Integration Task.

Per-Team-Member participation confirmation (one per Team Member): each
Team Member separately submits a TalentLMS checkbox confirming
participation, naming their assigned role, and naming the files they
authored.

---

## License

This repository is provided for educational use only. See
[LICENSE](LICENSE) for terms. You may clone and modify this repository
for personal learning and practice, and reference code you wrote here
in your professional portfolio. Redistribution outside this course is
not permitted.
