import { useState } from "react";
import type { KGResponse, UnsupportedQueryDetail } from "../lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function KgPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<KGResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError(null);
    setSupported(null);
    setResult(null);

    try {
      const r = await fetch(`${API_URL}/kg/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (r.status === 422) {
        const body = await r.json();
        const detail = body.detail as UnsupportedQueryDetail | undefined;

        if (detail?.reason === "unsupported_question") {
          setError("That question shape is not supported. Try one of:");
          setSupported(detail.supported_patterns);
        } else {
          setError("Validation rejected the request.");
        }
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

      setResult((await r.json()) as KGResponse);
    } catch {
      setError("Could not reach the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Knowledge Graph — Recipe Query</h1>

      <label htmlFor="question">Question</label>

      <input
        id="question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. Find Sichuan recipes"
        size={60}
      />

      <button onClick={submit} disabled={loading || !question.trim()}>
        {loading ? "Querying..." : "Ask"}
      </button>

      {error && (
        <p role="alert" data-testid="error">
          {error}
        </p>
      )}

      {supported && (
        <ul data-testid="supported-patterns">
          {supported.map((pattern, index) => (
            <li key={index}>{pattern}</li>
          ))}
        </ul>
      )}

      {result && (
        <section>
          <h2>Cypher</h2>

          <pre>{result.cypher}</pre>

          <h2>Rows ({result.count})</h2>

          <table>
            <tbody>
              {result.rows.map((row, index) => (
                <tr key={index} data-testid="kg-row">
                  {Object.entries(row).map(([key, value]) => (
                    <td key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}