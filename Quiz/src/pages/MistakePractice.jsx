import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Mistakes.css";

const LETTERS = ["A", "B", "C", "D"];

function MistakePractice() {
  useSeo("Revision Test | ExamPrep Hub", "Revise your mistakes and master them.");

  const [params] = useSearchParams();
  const exam = params.get("exam") || "";

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    API.get("/mistakes/practice", { params: exam ? { exam } : {} })
      .then((res) => setQuestions(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [exam]);

  const submit = async () => {
    const answered = Object.keys(answers).length;
    if (answered === 0) {
      setError("Kam se kam ek question ka jawab do");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const { data } = await API.post("/mistakes/practice/submit", { answers });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="section"><p>Loading...</p></div>;

  if (!result && questions.length === 0) {
    return (
      <div className="section">
        <h1>Revision Test</h1>
        <p>{error || "Revise karne ke liye abhi koi galat question nahi hai."}</p>
        <Link to="/mistakes" className="card-btn" style={{ marginTop: "12px" }}>
          Notebook par wapas jao
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="section">
        <h1>Revision Result</h1>

        <div className="mn-result">
          <div>
            <strong>{result.correct}</strong>
            <span>Master ho gaye 🎉</span>
          </div>
          <div>
            <strong>{result.wrong}</strong>
            <span>Abhi aur revise karo</span>
          </div>
          <div>
            <strong>{result.remaining}</strong>
            <span>Notebook mein baaki</span>
          </div>
        </div>

        <div className="mn-list">
          {result.results.map((r, i) => (
            <div key={r.questionId} className={"mn-item " + (r.correct ? "good" : "bad")}>
              <h3>{i + 1}. {r.question}</h3>
              <p className={r.correct ? "mn-ans-ok" : "mn-ans-bad"}>
                Aapka jawab: {LETTERS[r.picked]}. {r.options[r.picked]}
              </p>
              {!r.correct && (
                <p className="mn-ans-ok">
                  Sahi jawab: {LETTERS[r.correctIndex]}. {r.options[r.correctIndex]}
                </p>
              )}
              {r.explanation && <div className="mn-expl">Samjho: {r.explanation}</div>}
            </div>
          ))}
        </div>

        <div className="mn-actions" style={{ marginTop: "20px" }}>
          {result.remaining > 0 && (
            <button className="mn-revise" onClick={load}>🔁 Dobara revise karo</button>
          )}
          <Link to="/mistakes" className="card-btn">Notebook par jao</Link>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="section">
      <h1>🔁 Revision Test</h1>
      <p className="mn-sub">
        Yeh aapke apne galat question hain. Sahi jawab doge to wo notebook se hat jayenge.
        Is test ka score leaderboard ya result history mein nahi jata.
      </p>

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <div className="mn-list">
        {questions.map((q, i) => (
          <div key={q._id} className="mn-item">
            <div className="mn-item-top">
              <span className="mn-tag">{q.examName} | {q.section}</span>
            </div>
            <h3>{i + 1}. {q.question}</h3>

            <div className="mn-pick">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={"mn-opt" + (answers[q._id] === idx ? " selected" : "")}
                  onClick={() => setAnswers({ ...answers, [q._id]: idx })}
                >
                  <span className="mn-letter">{LETTERS[idx]}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mn-actions" style={{ marginTop: "20px" }}>
        <button className="mn-revise" onClick={submit} disabled={submitting}>
          {submitting ? "Check ho raha hai..." : `Jawab check karo (${answeredCount}/${questions.length})`}
        </button>
        <Link to="/mistakes" className="card-btn" style={{ background: "#64748b" }}>
          Wapas
        </Link>
      </div>
    </div>
  );
}

export default MistakePractice;