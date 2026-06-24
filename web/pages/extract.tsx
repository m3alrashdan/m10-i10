import { useState } from "react";
import type { ExtractResponse } from "../lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ExtractPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ExtractResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!text.trim()) {
      setError("Please enter text to extract entities.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetch(`${API_URL}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (r.status === 422) {
        setError("Text shape rejected by validation (empty or > 5000 chars).");
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

      const data = (await r.json()) as ExtractResponse;
      setResult(data);
    } catch {
      setError("Could not reach the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Extract — Named Entity Recognition</h1>

      <label htmlFor="text">Text</label>

      <textarea
        id="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text to extract named entities from..."
        rows={6}
        cols={60}
      />

      <div>
        <button onClick={submit} disabled={loading || !text.trim()}>
          {loading ? "Extracting..." : "Extract"}
        </button>
      </div>

      {error && (
        <p role="alert" data-testid="error">
          {error}
        </p>
      )}

      {result && (
        <section>
          <h2>Entities</h2>

          {result.entities.length === 0 ? (
            <p>No entities found.</p>
          ) : (
            <ul>
              {result.entities.map((entity, index) => (
                <li key={`${entity.text}-${index}`} data-testid="entity-span">
                  <strong>{entity.text}</strong> — {entity.label} (
                  {entity.start}–{entity.end})
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}