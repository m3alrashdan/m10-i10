import { useState } from "react";
import type { RAGResponse } from "../lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RagPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<RAGResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetch(`${API_URL}/rag/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, k: 4 }),
      });

      if (r.status === 422) {
        setError("Question shape rejected by validation.");
        return;
      }

      if (r.status === 503) {
        setError("The backend is starting up — please try again in a moment.");
        return;
      }

      if (!r.ok) {
        setError(`Unexpected status: ${r.status}`);
        return;
      }

      setResult((await r.json()) as RAGResponse);
    } catch {
      setError("Could not reach the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>RAG — Cited Answer</h1>

      <label htmlFor="question">Question</label>

      <input
        id="question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a recipe question..."
        size={60}
      />

      <button onClick={submit} disabled={loading || !question.trim()}>
        {loading ? "Asking..." : "Ask"}
      </button>

      {error && (
        <p role="alert" data-testid="error">
          {error}
        </p>
      )}

      {result && (
        <article>
          <h2>Answer</h2>

          <p data-testid="rag-answer">
            {result.answer}{" "}
            {result.citations.map((citation, index) => (
              <span
                key={citation.chunk_id}
                data-testid="citation-marker"
              >
                [{index + 1}]
              </span>
            ))}
          </p>

          <p>Confidence: {result.confidence.toFixed(2)}</p>

          <h2>Citations</h2>

          <ul>
            {result.citations.map((citation, index) => (
              <li key={citation.chunk_id}>
                [{index + 1}] chunk_id: {citation.chunk_id}, score:{" "}
                {citation.score.toFixed(3)}
              </li>
            ))}
          </ul>
        </article>
      )}
    </main>
  );
}