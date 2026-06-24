"""End-to-end smoke harness — Infra-Integration lead authors.

Verifies the demo `/rag/answer` call returns a grounded answer (200 with
non-empty citations, positive confidence, non-sentinel answer) against the
seeded fixture.

This is a RUNTIME check: it talks to a stack that is already up and seeded
(`docker compose up -d --wait --build` + `bash scripts/seed_*.sh`). When no
stack is reachable on localhost:8000 — e.g., the autograder's structural
job, which exercises compose topology statically — the test SKIPS rather
than fails. Used locally during demo-prep and by the TA during walkthrough.

Run it after bringing the stack up:

    docker compose up -d --wait --build
    bash scripts/seed_neo4j.sh
    bash scripts/seed_weaviate.sh
    pytest tests/integration/test_stack_e2e.py -v
"""
import json
import os
import urllib.error
import urllib.request

import pytest

API_BASE = os.environ.get("API_BASE_URL", "http://localhost:8000")
SENTINEL = "I cannot answer this from the available sources"
DEMO_QUESTION = "How do I prep ginger for stir-fry?"


def _get(url: str, timeout: float = 5.0):
    with urllib.request.urlopen(url, timeout=timeout) as resp:
        return resp.status, resp.read()


def _post_json(url: str, payload: dict, timeout: float = 60.0):
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, json.loads(resp.read())


def _stack_is_up() -> bool:
    """True if the api answers /readyz with 200 (stack up AND backends ready)."""
    try:
        status, _ = _get(f"{API_BASE}/readyz", timeout=3.0)
        return status == 200
    except (urllib.error.URLError, OSError):
        return False


pytestmark = pytest.mark.skipif(
    not _stack_is_up(),
    reason=(
        "stack not reachable at "
        f"{API_BASE}/readyz — bring it up with "
        "`docker compose up -d --wait --build` and run the seed scripts first"
    ),
)


def test_stack_e2e_seeded_rag_query():
    """The demo curl returns a grounded answer against the seeded fixture.

    Mirrors the autograder's content check: 200 alone is insufficient
    because the empty-retrieval sentinel also returns 200. Require all
    three of: citations present, confidence > 0, answer != sentinel.
    """
    status, data = _post_json(
        f"{API_BASE}/rag/answer", {"question": DEMO_QUESTION}
    )

    assert status == 200, f"expected 200, got {status}"

    # Response shape contract: answer / citations / confidence.
    assert set(data) >= {"answer", "citations", "confidence"}, data
    assert isinstance(data["answer"], str)
    assert isinstance(data["citations"], list)
    assert isinstance(data["confidence"], (int, float))

    # Grounding contract — proves retrieval + generation actually worked.
    assert len(data["citations"]) > 0, f"no citations: {data}"
    assert data["confidence"] > 0, f"confidence not positive: {data['confidence']}"
    assert data["answer"] != SENTINEL, "answer is the empty-retrieval sentinel"

    # Each citation carries the chunk_id / score contract fields.
    for cite in data["citations"]:
        assert "chunk_id" in cite and "score" in cite, cite
