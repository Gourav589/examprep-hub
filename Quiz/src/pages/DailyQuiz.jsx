import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./DailyQuiz.css";

const LETTERS = ["A", "B", "C", "D"];

const BADGES = [
  { days: 3, icon: "🥉", name: "3 din" },
  { days: 7, icon: "🥈", name: "7 din" },
  { days: 30, icon: "🥇", name: "30 din" },
];

function StreakBar({ streak }) {
  return (
    <div className="dq-streak">
      <div className="dq-flame">🔥</div>
      <div>
        <strong>{streak.current} din ki streak</strong>
        <small>Sabse lambi: {streak.longest} din | Kul quiz: {streak.total}</small>
      </div>
      <div className="dq-badges">
        {BADGES.map((b) => (
          <span
            key={b.days}
            className={"dq-badge" + (streak.longest >= b.days ? " on" : "")}
            title={`${b.days} din ki streak`}
          >
            {b.icon}
            <i>{b.name}</i>
          </span>
        ))}
      </div>
    </div>
  );
}

function DailyQuiz() {
  useSeo(
    "Daily Quiz | ExamPrep Hub",
    "Take a free 10-question daily quiz, build your streak and earn badges."
  );

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    API.get("/daily/today")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (Object.keys(answers).length === 0) {
      setError("Kam se kam ek question ka jawab do");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await API.post("/daily/submit", { answers });
      setData(res.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
    setSubmitting(false);
  };

  if (!user) {
    return (
      <div className="section">
        <h1>🔥 Daily Quiz</h1>
        <p className="dq-sub">Roz 10 questions, free. Streak banao aur badge jeeto.</p>
        <Link to="/login" className="card-btn">Login karo</Link>
      </div>
    );
  }

  if (loading) return <div className="section"><p>Loading...</p></div>;
  if (!data) return <div className="section"><p>{error || "Quiz nahi khul paya"}</p></div>;

  const header = (
    <>
      <h1>🔥 Daily Quiz</h1>
      <p className="dq-sub">
        Aaj ({data.date}): 10 questions, sabke liye ek jaise. {data.participants} students ne aaj diya.
      </p>
      {!isAdmin && <StreakBar streak={data.streak} />}
    </>
  );

  if (!data.ready) {
    return (
      <div className="section">
        {header}
        <div className="dq-empty">
          Aaj ka quiz abhi taiyar nahi hai (free tests ke kam se kam 5 questions chahiye).
          Thodi der baad dobara aao.
        </div>
      </div>
    );
  }

  if (data.done) {
    const pct = data.total ? Math.round((data.score / data.total) * 100) : 0;
    return (
      <div className="section">
        {header}

        <div className="dq-score">
          <strong>{data.score} / {data.total}</strong>
          <span>{pct}% sahi</span>
          <p>
            {data.streak.todayDone
              ? "Aaj ka quiz ho gaya ✔ Kal naya quiz aur streak aage badhao!"
              : ""}
          </p>
        </div>

        <div className="dq-list">
          {data.results.map((r, i) => (
            <div key={r.questionId} className={"dq-item " + (r.correct ? "good" : "bad")}>
              <h3>{i + 1}. {r.question}</h3>
              <p className={r.correct ? "dq-ok" : "dq-bad"}>
                Aapka jawab:{" "}
                {r.picked === null ? "Skip kiya" : `${LETTERS[r.picked]}. ${r.options[r.picked]}`}
              </p>
              {!r.correct && (
                <p className="dq-ok">
                  Sahi jawab: {LETTERS[r.correctIndex]}. {r.options[r.correctIndex]}
                </p>
              )}
              {r.explanation && <div className="dq-expl">Samjho: {r.explanation}</div>}
            </div>
          ))}
        </div>

        <div className="dq-actions">
          <Link to="/mistakes" className="card-btn">📒 Galat questions revise karo</Link>
          <Link to="/exams" className="card-btn" style={{ background: "#64748b" }}>Mock Tests</Link>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="section">
      {header}

      {isAdmin && (
        <div className="dq-empty">Admin preview: aap quiz dekh sakte ho, par de nahi sakte.</div>
      )}
      {error && <p style={{ color: "#b91c1c", margin: "10px 0" }}>{error}</p>}

      <div className="dq-list">
        {data.questions.map((q, i) => (
          <div key={q._id} className="dq-item">
            <span className="dq-tag">{q.section}</span>
            <h3>{i + 1}. {q.question}</h3>
            <div className="dq-pick">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={"dq-opt" + (answers[q._id] === idx ? " selected" : "")}
                  onClick={() => setAnswers({ ...answers, [q._id]: idx })}
                >
                  <span className="dq-letter">{LETTERS[idx]}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!isAdmin && (
        <div className="dq-actions">
          <button className="dq-submit" onClick={submit} disabled={submitting}>
            {submitting ? "Check ho raha hai..." : `Jawab bhejo (${answeredCount}/${data.questions.length})`}
          </button>
        </div>
      )}
    </div>
  );
}

export default DailyQuiz;