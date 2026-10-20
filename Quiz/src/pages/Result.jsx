import { useLocation, Link, useParams } from "react-router-dom";
import "./Result.css";

const RADIUS = 60;
const CIRC = 2 * Math.PI * RADIUS;

function Result() {
  const { state } = useLocation();
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!state) {
    return (
      <div className="rs-wrap">
        <div className="rs-card">
          <p>Koi result nahi mila. Page refresh karne par result chala jata hai.</p>
          <div className="rs-links" style={{ marginTop: "16px" }}>
            <Link to="/my-results" className="rs-btn primary">My Results dekho</Link>
            <Link to="/exams" className="rs-btn ghost">Mock Tests</Link>
          </div>
        </div>
      </div>
    );
  }

  const { total, correct, wrong, skipped, sections = {}, review = [] } = state;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  let title = "Don't give up!";
  let note = "Galtiyon se seekho aur dobara try karo.";
  if (pct >= 80) {
    title = "Excellent!";
    note = "Bahut badhiya performance, aise hi practice jaari rakho.";
  } else if (pct >= 60) {
    title = "Good job!";
    note = "Solid effort. Galat questions dekho aur dobara try karo.";
  } else if (pct >= 40) {
    title = "Keep practicing!";
    note = "Thodi aur practice se score tezi se badhega.";
  }

  // Donut ke teen hisse: sahi, galat, skip
  const seg = (n) => (total ? (n / total) * CIRC : 0);
  const segments = [
    { len: seg(correct), color: "#34d399" },
    { len: seg(wrong), color: "#f87171" },
    { len: seg(skipped), color: "#cbd5e1" },
  ];
  let used = 0;

  const sectionList = Object.entries(sections).map(([name, s]) => ({
    name,
    correct: s.correct,
    total: s.total,
    pct: s.total ? Math.round((s.correct / s.total) * 100) : 0,
  }));

  const barColor = (p) => (p >= 70 ? "#10b981" : p >= 40 ? "#f59e0b" : "#ef4444");

  const weakest = sectionList.length
    ? [...sectionList].sort((a, b) => a.pct - b.pct)[0]
    : null;

  return (
    <div className="rs-wrap">
      <div className="rs-hero">
        <div className="rs-hero-text">
          <span className="rs-tag">TEST COMPLETE</span>
          <h1>{title}</h1>
          <p>{note}</p>
          <div className="rs-stats">
            <div className="rs-stat">
              <small>SCORE</small>
              <strong>{correct} / {total}</strong>
            </div>
            <div className="rs-stat">
              <small>CORRECT</small>
              <strong>{correct}</strong>
            </div>
            <div className="rs-stat">
              <small>WRONG</small>
              <strong>{wrong}</strong>
            </div>
            <div className="rs-stat">
              <small>SKIPPED</small>
              <strong>{skipped}</strong>
            </div>
          </div>
        </div>

        <div className="rs-donut">
          <svg width="170" height="170" viewBox="0 0 170 170">
            <circle cx="85" cy="85" r={RADIUS} className="donut-bg" />
            {segments.map((s, i) => {
              if (s.len <= 0) return null;
              const offset = -used;
              used += s.len;
              return (
                <circle
                  key={i}
                  cx="85"
                  cy="85"
                  r={RADIUS}
                  className="donut-seg"
                  stroke={s.color}
                  strokeDasharray={`${s.len} ${CIRC - s.len}`}
                  strokeDashoffset={offset}
                />
              );
            })}
          </svg>
          <div className="rs-donut-text">
            <strong>{pct}%</strong>
            <span>Score</span>
          </div>
        </div>
      </div>

      <div className="rs-grid">
        <div className="rs-card">
          <div className="rs-card-head">
            <h3>Section-wise performance</h3>
            <small>{sectionList.length} sections</small>
          </div>

          {sectionList.length === 0 && <p>Section ka data nahi hai.</p>}

          {sectionList.map((s) => (
            <div key={s.name} className="rs-bar-row">
              <div className="rs-bar-top">
                <span>{s.name}</span>
                <span style={{ color: barColor(s.pct) }}>
                  {s.correct}/{s.total} · {s.pct}%
                </span>
              </div>
              <div className="rs-bar">
                <div
                  className="rs-bar-fill"
                  style={{ width: `${s.pct}%`, background: barColor(s.pct) }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rs-card">
          <div className="rs-card-head">
            <h3>Recommended next</h3>
          </div>

          <Link to={`/exams/${id}/test`} className="rs-reco">
            <span className="rs-reco-icon">🔁</span>
            <div>
              <strong>Dobara test do</strong>
              <small>Apna score behtar karo</small>
            </div>
          </Link>

          {weakest && weakest.pct < 70 && (
            <div className="rs-reco plain">
              <span className="rs-reco-icon">📚</span>
              <div>
                <strong>{weakest.name} revise karo</strong>
                <small>Yahan sabse kam score aaya ({weakest.pct}%)</small>
              </div>
            </div>
          )}

          {user && user.role !== "admin" && (
            <Link to="/my-results" className="rs-reco">
              <span className="rs-reco-icon">📊</span>
              <div>
                <strong>Purane results dekho</strong>
                <small>Apni progress track karo</small>
              </div>
            </Link>
          )}

          <Link to="/exams" className="rs-reco">
            <span className="rs-reco-icon">📝</span>
            <div>
              <strong>Doosra exam chuno</strong>
              <small>Saare mock tests dekho</small>
            </div>
          </Link>
        </div>
      </div>

      <div className="rs-card" style={{ marginTop: "20px" }}>
        <div className="rs-card-head">
          <h3>Answer review</h3>
          <small>{review.length} questions</small>
        </div>

        {review.map((r, i) => {
          const isSkipped = r.picked === null;
          const isCorrect = r.picked === r.correctIndex;
          return (
            <div key={i} className="rs-review">
              <p className="rs-q">
                <b>{i + 1}.</b> {r.question}
              </p>
              <p className={"rs-ans " + (isSkipped ? "skip" : isCorrect ? "ok" : "bad")}>
                Aapka jawab: {isSkipped ? "Skip kiya" : r.options[r.picked]}
              </p>
              {!isCorrect && (
                <p className="rs-ans ok">Sahi jawab: {r.options[r.correctIndex]}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rs-links">
        <Link to={`/exams/${id}`} className="rs-btn ghost">Back to Exam</Link>
        <Link to={`/exams/${id}/test`} className="rs-btn primary">Try Again</Link>
      </div>
    </div>
  );
}

export default Result;
