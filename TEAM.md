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
| Backend lead           | `be-01`              | Instructional team | `backend/api-endpoints` | Frontend lead        | `api/main.py`, `api/models.py`, `api/rag.py`, `api/deps.py`, `api/Dockerfile`                                   |
| Frontend lead          | `fe-01`              | Instructional team | `frontend/nextjs-pages` | Backend lead         | `web/pages/{extract,kg,rag}.tsx`, `web/lib/types.ts`, `web/Dockerfile`, `tests/frontend/playwright/*`             |
| Infra-Integration lead | `infra-01`           | Instructional team | `infra/docker-compose`  | Backend lead         | `docker-compose.yml`, `seed_neo4j.sh`, `seed_weaviate.sh`, `.env.example`, `README.md`, `tests/integration/*` |

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

## Execution Plan — خطة التنفيذ العملية (Team Working Agreement)

خطة واضحة وملزِمة للأقسام الثلاثة. الهدف: كل عضو يعرف شغله بالضبط، ولا يحصل
تداخل (role drift) ولا كسر عقود بين الأقسام. كل المصطلحات التقنية (أسماء
الملفات، الأوامر، الحقول، الفروع) بالإنجليزية عشان تبقى قابلة للمرجعة من الـ TA.

### A) لقطة الحالة (Status snapshot)

| القسم | الفرع | الحالة | الإجراء التالي |
|---|---|---|---|
| **Infra-Integration** | `infra/docker-compose` | ✅ مكتمل ومرفوع، متحقّق end-to-end | فتح internal PR → main، كتابة فقرة المساهمة |
| **Frontend** | `frontend/nextjs-pages` | 🔴 ناقص: الـ 3 Playwright specs لسا `test.skip` فاضية | **كتابة الـ 3 specs** (أولوية قصوى — توقف التسليم) |
| **Backend** | `backend/api-endpoints` | 🟢 شغّال (baseline أخضر) | امتلاك/فهم `api/`، تثبيت العقد، مراجعة PR تبع Infra و Frontend |

### B) حدود الملكية — لا أحد يلمس ملفات قسم آخر (يمنع role drift)

| الملفات | المالك | ممنوع يلمسها |
|---|---|---|
| `api/main.py`, `api/models.py`, `api/rag.py`, `api/deps.py`, `api/Dockerfile` | **Backend** | Frontend, Infra |
| `web/pages/{extract,kg,rag}.tsx`, `web/lib/types.ts`, `web/Dockerfile`, `tests/frontend/playwright/*` | **Frontend** | Backend, Infra |
| `docker-compose.yml`, `.env.example`, `scripts/*`, `README.md`, `tests/integration/*`, `TEAM.md`, `CONTRIBUTING.md` | **Infra** | Backend, Frontend |

> الفروع لا يُعاد تسميتها — الـ autograder و سكربتات الـ TA تبحث عنها بالاسم الحرفي.

### C) العقود المشتركة المقفولة (Locked contracts) — خط أحمر

**Contract A — Backend ↔ Frontend (الأخطر):** أسماء حقول Pydantic في
`api/models.py` تطابق `web/lib/types.ts` **حرف بحرف**. الحقول المقفولة:

```
chunk_id · score · answer · citations · confidence ·
cypher · rows · count · text · label · start · end · entities
```

> أي rename (مثل `chunk_id → chunkId`) = كسر صامت للفرونت يظهر فقط في مرحلة
> Playwright عند التسليم. القاعدة: **يُعلَن على Slack قبل الدمج**، والـ Frontend
> يحدّث `types.ts` في نفس دورة المراجعة.

**Contract B — Infra ↔ Backend (مثبّت ومرفوع):**

```
NEO4J_URI=bolt://neo4j:7687      WEAVIATE_URL=http://weaviate:8080
WEB_ORIGIN=http://localhost:3000  NEXT_PUBLIC_API_URL=http://localhost:8000 (build-arg)
```

> CORS لازم يبقى `localhost:3000` (مش `web:3000`). أي تغيير env يُعلَن لـ Infra قبل الدمج.

### D) خطة كل قسم بالتفصيل

#### 🟦 Backend lead — `backend/api-endpoints`
- **المهام:** امتلاك وفهم `api/` (شغّال أصلاً)؛ تثبيت العقد؛ تحسينات اختيارية
  (per-call timeout على الـ generator، structured logging) **دون** إضعاف
  grounding (يرجّع الـ sentinel لما تتعذّر الـ citations) و**دون** rename لأي حقل.
- **ممنوع:** تغيير CMD في `api/Dockerfile` (يبقى `uvicorn api.main:app` من جذر
  المشروع)؛ أي rename حقل بلا إعلان؛ ضبط `WEB_ORIGIN` على اسم خدمة Compose.
- **Done عندما:** الـ endpoints الخمسة تعمل، الحقول مطابقة لـ `types.ts`، والتحقق:
  ```bash
  docker compose up -d --build
  curl -fsS -X POST localhost:8000/rag/answer -H 'Content-Type: application/json' \
    -d '{"question":"How do I prep ginger for stir-fry?"}'   # 200 + citations
  ```
- **دور المراجعة:** يراجع `infra/*` و `frontend/*` (حارس العقد).

#### 🟩 Frontend lead — `frontend/nextjs-pages` ⚠️ هنا الشغل الناقص
- **المهمة الحرجة:** كتابة الـ 3 Playwright specs (حالياً stubs → اختبار
  `test_playwright_spec_authored` أحمر ويوقف التسليم). حوّل `test.skip(` إلى
  `test(` لأن الـ skip يمرّ بصمت = مرفوض:
  - `rag.spec.ts`: افتح `/rag` → اكتب السؤال المزروع → submit → تحقّق من ظهور
    نص الإجابة + **علامة citation واحدة على الأقل بصيغة `[N]`**.
  - `extract.spec.ts`: افتح `/extract` → أدخل نص → تحقّق من ظهور entities
    (`text`/`label`/`start`/`end`).
  - `kg.spec.ts`: افتح `/kg` → سؤال مدعوم → تحقّق من ظهور rows.
- **تأكّد من:** مطابقة `types.ts` لـ Pydantic (مطابق حالياً ✅)؛ معالجة الصفحات
  لأخطاء 422/503/network؛ وجود `.dockerignore` (حتى ما ينسخ `node_modules`).
- **ممنوع:** ضبط `NEXT_PUBLIC_API_URL` على اسم خدمة Compose (لازم `localhost:8000`)؛
  "إصلاح" `web/Dockerfile` لصيغة الـ Lab (الـ `node:20-slim` مقصود).
- **Done عندما:** ضد stack شغّال + مزروع:
  ```bash
  cd web && npm ci && npx playwright install --with-deps chromium
  npx playwright test ../tests/frontend/playwright    # الـ 3 specs خضراء
  ```

#### 🟨 Infra-Integration lead — `infra/docker-compose` ✅ مكتمل ومرفوع
- `docker-compose.yml` (4 خدمات + healthchecks + depends_on chain + named volumes)،
  `scripts/*` (idempotent)، `.env.example`، `README.md` runbook،
  `tests/integration/test_stack_e2e.py`، `TEAM.md`، `CONTRIBUTING.md` — كلها
  جاهزة ومتحقّقة end-to-end.
- **المتبقّي:** فتح internal PR (مراجعة Backend) + كتابة per-role paragraph في التسليم.
- **التحقق المحلي:**
  ```bash
  docker compose up -d --build && bash scripts/healthcheck_stack.sh
  bash scripts/seed_neo4j.sh && bash scripts/seed_weaviate.sh
  pytest tests/ -q                              # structural
  pytest tests/integration/test_stack_e2e.py -q # e2e (ضد stack شغّال)
  ```

### E) التسلسل وسير الـ PRs (يتجنّب التضارب)

```
المرحلة 1 — تجميد العقد:
   Backend يثبّت أسماء حقول models.py ─► Frontend يؤكّد types.ts مطابق
   (مطابقان حالياً — فقط لا تغيّروهما بلا إعلان)

المرحلة 2 — شغل متوازٍ على الفروع (ملفات منفصلة = صفر تعارض git):
   Backend: امتلاك/تثبيت | Frontend: كتابة الـ 3 specs | Infra: ✅ خلص

المرحلة 3 — internal PR لكل فرع (موافقة teammate واحدة على الأقل):
   infra/*    → يراجعه Backend
   frontend/* → يراجعه Backend
   backend/*  → يراجعه Frontend
   كل عضو يشغّل `docker compose up -d` محلياً قبل الموافقة

المرحلة 4 — دمج الثلاثة على main ─► team submitter يفتح PR التسليم
```

### F) تشيك ليست التسليم النهائي (في وصف PR التسليم)

- [ ] مخرجات `docker compose ps` تُظهر الأربع خدمات `healthy`
- [ ] مخرجات `seed_neo4j.sh` و `seed_weaviate.sh`
- [ ] أمر curl على `/rag/answer` + رد 200 مع citations
- [ ] **Screenshot** لصفحة `/rag` تعرض إجابة مع citation
- [ ] روستر `TEAM.md` + فقرة مساهمة لكل عضو (تطابق `git log --author=<email>`)
- [ ] كل عضو يعبّئ **Participation Confirmation** في TalentLMS (تحرّك 40 نقطة per-role)

> **القاعدة الذهبية للفريق كله:** لا rename لأي حقل بدون إعلان مسبق — هذا الفخ
> رقم 1 الذي يكسر التسليم في مرحلة Playwright.

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

The two-tier grading model (team tier 60 pts + per-role tier 40 pts) is described in the team-facing Integration Spec at [https://LevelUp-Applied-AI.github.io/aispire-14005-pages/modules/module-10/4ba363ed](https://LevelUp-Applied-AI.github.io/aispire-14005-pages/modules/module-10/4ba363ed).
