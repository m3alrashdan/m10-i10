# Team Roster — Module 10 Integration

This file is the team roster artifact for the Module 10 four-service Docker Compose Integration. The instructional team pre-populates the role assignments before handing the template repo to the team; the team fills in the Team Member identifier, branch, and Slack channel fields.

> **No personal names** in this file. Use anonymized initials, role tokens, or team-chosen identifiers. The team grading and TA cross-reference use `git log --author=<email>` for attribution, not names in this file.

---

## Team Identity

- **Team name:** alnashamaa
- **Team Slack channel:** `alnashamaa`
- **Team-formation date:** 2026-06-24
- **Designated team submitter:** `Infra-Integration lead`

---

## Team Roster

| Role                   | Team Member identifier | Assigned by        | Branch                    | Internal-PR reviewer | Primary files owned                                                                                                       |
| ---------------------- | ---------------------- | ------------------ | ------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Backend lead           | **Naseem Migdadi**              | Instructional team | `backend/api-endpoints` | Frontend lead        | `api/main.py`, `api/models.py`, `api/rag.py`, `api/deps.py`, `api/Dockerfile`                                   |
| Frontend lead          | **Raneem Alkaabneh**              | Instructional team | `frontend/nextjs-pages` | Backend lead         | `web/pages/{extract,kg,rag}.tsx`, `web/lib/types.ts`, `web/Dockerfile`, `tests/frontend/playwright/*`             |
| Infra-Integration lead | **Mousa AL-Rashdan**           | Instructional team | `infra/docker-compose`  | Backend lead         | `docker-compose.yml`, `seed_neo4j.sh`, `seed_weaviate.sh`, `.env.example`, `README.md`, `tests/integration/*` |

**Fallback compositions for non-3-Team-Member teams:**

- **2 Team Members:** Frontend and Infra-Integration roles merge. The merged Team Member owns all `web/`, `docker-compose.yml`, and `seed_*.sh` files.
- **4 Team Members:** Infra-Integration splits into "Compose + healthchecks" (owns `docker-compose.yml`, all healthchecks, readiness ordering) and "Seed + runbook" (owns `seed_neo4j.sh`, `seed_weaviate.sh`, `README.md` runbook). The two Team Members internal-review each other.

---

## Per-Role File Checklist (used for TA grading cross-reference)

The TA cross-references this checklist against `git log --author=<email>` on the team fork during per-role grading. Check the box when the Team Member confirms they authored the file.

### Backend lead

- [ ] `api/main.py` — path operations, `lifespan`, CORS middleware
- [ ] `api/models.py` — Pydantic shapes
- [ ] `api/rag.py` — RAG composer with grounding contract
- [ ] `api/deps.py` — `Depends()` functions
- [ ] `api/Dockerfile` — single-stage Python

### Frontend lead

- [ ] `web/pages/extract.tsx`
- [ ] `web/pages/kg.tsx`
- [ ] `web/pages/rag.tsx`
- [ ] `web/lib/types.ts` — three TypeScript interfaces mirroring Pydantic
- [ ] `web/Dockerfile` — multi-stage Node
- [ ] `tests/frontend/playwright/*.spec.ts` — one per page

### Infra-Integration lead

- [X] `docker-compose.yml` — four services, healthchecks, `depends_on` chain, named volumes
- [X] `seed_neo4j.sh`
- [X] `seed_weaviate.sh`
- [X] `.env.example` (no real credentials)
- [X] `README.md` runbook
- [X] `tests/integration/test_stack_e2e.py`

---

## Execution Plan — Team Working Agreement

A clear, binding plan for all three roles. Goal: every member knows exactly
what they own, with no role drift and no broken cross-role contracts.

### A) Status snapshot

| Role | Branch | Status | Next action |
|---|---|---|---|
| **Infra-Integration** | `infra/docker-compose` | ✅ Complete & pushed, verified end-to-end | Open internal PR → main; write contribution paragraph |
| **Frontend** | `frontend/nextjs-pages` | 🔴 Outstanding: the 3 Playwright specs are still empty `test.skip` stubs | **Author the 3 specs** (top priority — blocks submission) |
| **Backend** | `backend/api-endpoints` | 🟢 Working (baseline green) | Own/understand `api/`, freeze the contract, review Infra & Frontend PRs |

### B) Ownership boundaries — nobody touches another role's files (anti role-drift)

| Files | Owner | Must NOT touch |
|---|---|---|
| `api/main.py`, `api/models.py`, `api/rag.py`, `api/deps.py`, `api/Dockerfile` | **Backend** | Frontend, Infra |
| `web/pages/{extract,kg,rag}.tsx`, `web/lib/types.ts`, `web/Dockerfile`, `tests/frontend/playwright/*` | **Frontend** | Backend, Infra |
| `docker-compose.yml`, `.env.example`, `scripts/*`, `README.md`, `tests/integration/*`, `TEAM.md`, `CONTRIBUTING.md` | **Infra** | Backend, Frontend |

> Do not rename the branches — the autograder and the TA cross-reference
> scripts look for these exact names.

### C) Locked contracts — the red lines

**Contract A — Backend ↔ Frontend (most critical):** the Pydantic field
names in `api/models.py` must match `web/lib/types.ts` **field-for-field**.
Locked fields:

```
chunk_id · score · answer · citations · confidence ·
cypher · rows · count · text · label · start · end · entities
```

> Any rename (e.g. `chunk_id → chunkId`) is a silent frontend break that
> only surfaces at the Playwright stage during submission. Rule: **announce
> on Slack before merge**, and the Frontend lead updates `types.ts` in the
> same review cycle.

**Contract B — Infra ↔ Backend (fixed & pushed):**

```
NEO4J_URI=bolt://neo4j:7687       WEAVIATE_URL=http://weaviate:8080
WEB_ORIGIN=http://localhost:3000   NEXT_PUBLIC_API_URL=http://localhost:8000 (build-arg)
```

> CORS must stay `localhost:3000` (never `web:3000`). Any env change is
> announced to Infra before merge.

### D) Per-role plan in detail

#### �� Backend lead — `backend/api-endpoints`
- **Tasks:** own and understand `api/` (already working); freeze the
  contract; optional hardening (per-call generator timeout, structured
  logging) **without** weakening grounding (must return the sentinel when
  citations cannot be resolved) and **without** renaming any field.
- **Must not:** change the `api/Dockerfile` CMD (stays `uvicorn api.main:app`
  from repo root); rename any field without announcing; set `WEB_ORIGIN` to
  a Compose service name.
- **Done when:** the five endpoints work, fields match `types.ts`, and:
  ```bash
  docker compose up -d --build
  curl -fsS -X POST localhost:8000/rag/answer -H 'Content-Type: application/json' \
    -d '{"question":"How do I prep ginger for stir-fry?"}'   # 200 + citations
  ```
- **Review duty:** reviews `infra/*` and `frontend/*` (contract guardian).

#### �� Frontend lead — `frontend/nextjs-pages` ⚠️ outstanding work is here
- **Critical task:** author the 3 Playwright specs (currently stubs → the
  `test_playwright_spec_authored` test is red and blocks submission). Turn
  `test.skip(` into `test(` — a skipped test passes silently and is rejected:
  - `rag.spec.ts`: open `/rag` → type the seeded question → submit → assert
    the answer text renders **plus at least one `[N]`-style citation marker**.
  - `extract.spec.ts`: open `/extract` → enter text → assert entities render
    (`text`/`label`/`start`/`end`).
  - `kg.spec.ts`: open `/kg` → a supported question → assert rows render.
- **Confirm:** `types.ts` mirrors Pydantic (matches today ✅); pages handle
  422/503/network errors; `.dockerignore` exists (so `node_modules` is not
  copied into the image).
- **Must not:** set `NEXT_PUBLIC_API_URL` to a Compose service name (must be
  `localhost:8000`); "fix" `web/Dockerfile` back to the Lab pattern (the
  `node:20-slim` base is intentional).
- **Done when:** against a running + seeded stack:
  ```bash
  cd web && npm ci && npx playwright install --with-deps chromium
  npx playwright test ../tests/frontend/playwright    # the 3 specs green
  ```

#### �� Infra-Integration lead — `infra/docker-compose` ✅ complete & pushed
- `docker-compose.yml` (4 services + healthchecks + depends_on chain + named
  volumes), `scripts/*` (idempotent), `.env.example`, the `README.md` runbook,
  `tests/integration/test_stack_e2e.py`, `TEAM.md`, `CONTRIBUTING.md` — all
  done and verified end-to-end.
- **Remaining:** open the internal PR (Backend review) + write the per-role
  paragraph for the submission.
- **Local verification:**
  ```bash
  docker compose up -d --build && bash scripts/healthcheck_stack.sh
  bash scripts/seed_neo4j.sh && bash scripts/seed_weaviate.sh
  pytest tests/ -q                              # structural
  pytest tests/integration/test_stack_e2e.py -q # e2e (against a running stack)
  ```

### E) Sequence & PR flow (avoids conflicts)

```
Phase 1 — freeze the contract:
   Backend locks models.py field names ─► Frontend confirms types.ts matches
   (they match today — just don't change them without announcing)

Phase 2 — parallel work on branches (disjoint files = zero git conflicts):
   Backend: own/freeze | Frontend: author the 3 specs | Infra: ✅ done

Phase 3 — one internal PR per branch (≥ 1 teammate approval each):
   infra/*    → reviewed by Backend
   frontend/* → reviewed by Backend
   backend/*  → reviewed by Frontend
   every member runs `docker compose up -d` locally before approving

Phase 4 — merge all three into main ─► team submitter opens the submission PR
```

### F) Final submission checklist (in the submission PR description)

- [ ] `docker compose ps` output showing all four services `healthy`
- [ ] Output of `seed_neo4j.sh` and `seed_weaviate.sh`
- [ ] The `/rag/answer` curl command + its 200 response with citations
- [ ] **Screenshot** of the `/rag` page rendering a cited answer
- [ ] `TEAM.md` roster + one contribution paragraph per member (matches `git log --author=<email>`)
- [ ] Each member files the **Participation Confirmation** in TalentLMS (drives the 40-pt per-role tier)

> **Golden rule for the whole team:** no field rename without a prior
> announcement — this is the #1 trap that breaks submission at the Playwright stage.

---

## Escalation Checklist (apply in order)

When a disagreement about scope, role boundaries, or contract changes arises:

1. **Inline comment on the internal PR.** State the disagreement specifically and link the contract artifact (Pydantic shape, TypeScript interface, Compose service entry).
2. **Team Slack channel with TA tagged.** Tag the TA who covers the team. Allow up to 4 working hours for response.
3. **Support Instructor.** If the TA decision is contested or the TA is unavailable, escalate to the Support Instructor via the cohort Slack channel.
4. **Lead Instructor.** Only if a role-rebalancing decision is needed or the disagreement is not resolved by the Support Instructor.

Document the escalation path taken in the team submission PR description.

---

## Contract-Change Protocol

- **Backend lead** announces any Pydantic shape change on the team Slack channel **before** the change lands.
- **Frontend lead** requests new backend fields via an internal-PR comment on the Backend lead's branch — does not assume.
- **Infra-Integration lead** announces any `.env` or DNS-affecting change before the change lands.

The protocol is enforced by the internal-PR review — the reviewer rejects PRs where the contract change was not announced.

---

## Submission

When all three role branches merge to the team fork's `main` and `docker compose up -d` smoke passes locally for each Team Member:

1. The team submitter pastes the team fork URL into TalentLMS → Module 10 → Integration Task.
2. Each Team Member separately submits the participation-confirmation TalentLMS unit naming their assigned role and the files they authored.

HEAD
The two-tier grading model (team tier 60 pts + per-role tier 40 pts) is described in the team-facing Integration Spec at [https://LevelUp-Applied-AI.github.io/aispire-14005-pages/modules/module-10/4ba363ed](https://LevelUp-Applied-AI.github.io/aispire-14005-pages/modules/module-10/4ba363ed).

The two-tier grading model (team tier 60 pts + per-role tier 40 pts) is described in the team-facing Integration Spec at [https://LevelUp-Applied-AI.github.io/aispire-14005-pages/modules/module-10/4ba363ed](https://LevelUp-Applied-AI.github.io/aispire-14005-pages/modules/module-10/4ba363ed).

