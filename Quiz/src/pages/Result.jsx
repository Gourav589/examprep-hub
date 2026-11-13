import { useState } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import API from "../services/api";
import "./Result.css";

const RADIUS = 60;
const CIRC = 2 * Math.PI * RADIUS;

const REASONS = [
  { value: "wrong_answer", label: "Sahi jawab galat hai" },
  { value: "wrong_question", label: "Question galat ya adhoora hai" },
  { value: "typo", label: "Spelling ya typing ki galti" },
  { value: "other", label: "Kuch aur" },
];

function Result() {
  const { state } = useLocation();
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [reportOpen, setReportOpen] = useState(null);
  const [reason, setReason] = useState("wrong_answer");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState({});
  const [reportError, setReportError] = useState("");
  const [sending, setSending] = useState(false);

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

  const {
    total,
    correct,
    wrong,
    skipped,
    sections = {},
    review = [],
    negativeMarking = 0,
    testNumber = 1,
  } = state;

  const marks =
    typeof state.marks === "number"
      ? state.marks
      : typeof state.score === "number"
      ? state.score
      : correct;

  const pct = total ? Math.round((marks / total) * 100) : 0;
  const penalty = Math.round(wrong * negativeMarking * 100) / 100;

  let title = "Don't give up!";
  let note2 = "Galtiyon se seekho aur dobara try karo.";
  if (pct >= 80) {
    title = "Excellent!";
    note2 = "Bahut badhiya performance, aise hi practice jaari rakho.";
  } else if (pct >= 60) {
    title = "Good job!";
    note2 = "Solid effort. Galat questions dekho aur dobara try karo.";
  } else if (pct >= 40) {
    title = "Keep practicing!";
    note2 = "Thodi aur practice se score tezi se badhega.";
  }

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

  const retryLink = `/exams/${id}/test?test=${testNumber}`;

  const openReport = (qid) => {
    setReportOpen(qid);
    setReason("wrong_answer");
    setNote("");
    setReportError("");
  };

  const sendReport = async (qid) => {
    setSending(true);
    setReportError("");
    try {
      await API.post("/reports", { questionId: qid, reason, note });
      setSent({ ...sent, [qid]: true });
      setReportOpen(null);
    } catch (err) {
      setReportError(err.response?.data?.message || err.message);
    }
    setSending(false);
  };

  return (
    <div className="rs-wrap">
      <div className="rs-hero">
        <div className="rs-hero-text">
          <span className="rs-tag">TEST {testNumber} COMPLETE</span>
          <h1>{title}</h1>
          <p>{note2}</p>
          <div className="rs-stats">
            <div className="rs-stat">
              <small>SCORE</small>
              <strong>{marks} / {total}</strong>
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
          {negativeMarking > 0 && (
            <p style={{ marginTop: "12px", fontSize: "14px" }}>
              Negative marking: {wrong} galat x {negativeMarking} = -{penalty} marks
            </p>
          )}
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

          <Link to={retryLink} className="rs-reco">
            <span className="rs-reco-icon">🔁</span>
            <div>
              <strong>Yahi test dobara do</strong>
              <small>Apna score behtar karo</small>
            </div>
          </Link>

          <Link to={`/exams/${id}`} className="rs-reco">
            <span className="rs-reco-icon">🧪</span>
            <div>
              <strong>Doosra test chuno</strong>
              <small>Is exam ke saare tests dekho</small>
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
          {wrong > 0 && user && user.role !== "admin" && (
            <Link to="/mistakes" className="rs-reco">
              <span className="rs-reco-icon">📒</span>
              <div>
                <strong>Galat questions revise karo</strong>
                <small>{wrong} question Mistakes Notebook mein jama hue</small>
              </div>
            </Link>
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
          const qid = r.questionId;

          return (
            <div key={qid || i} className="rs-review">
              <p className="rs-q">
                <b>{i + 1}.</b> {r.question}
              </p>
              <p className={"rs-ans " + (isSkipped ? "skip" : isCorrect ? "ok" : "bad")}>
                Aapka jawab: {isSkipped ? "Skip kiya" : r.options[r.picked]}
              </p>
              {!isCorrect && (
                <p className="rs-ans ok">Sahi jawab: {r.options[r.correctIndex]}</p>
              )}

              {r.explanation && <div className="rs-expl">Samjho: {r.explanation}</div>}

              {qid && user && user.role !== "admin" && (
                <>
                  {sent[qid] ? (
                    <p className="rs-report-ok">✔ Report bhej di gayi. Shukriya!</p>
                  ) : reportOpen === qid ? (
                    <div className="rs-report-form">
                      <select value={reason} onChange={(e) => setReason(e.target.value)}>
                        {REASONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <input
                        placeholder="Chhota note (zaroori nahi)"
                        maxLength={300}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                      {reportError && (
                        <span style={{ color: "#b91c1c", fontSize: "13px" }}>{reportError}</span>
                      )}
                      <div className="rs-report-actions">
                        <button
                          type="button"
                          className="rs-report-send"
                          disabled={sending}
                          onClick={() => sendReport(qid)}
                        >
                          {sending ? "Bhej rahe hain..." : "Report bhejo"}
                        </button>
                        <button
                          type="button"
                          className="rs-report-cancel"
                          onClick={() => setReportOpen(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="rs-report-btn"
                      onClick={() => openReport(qid)}
                    >
                      🚩 Is question mein galti hai?
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="rs-links">
        <Link to={`/exams/${id}`} className="rs-btn ghost">Back to Exam</Link>
        <Link to={`/exams/${id}/leaderboard`} className="rs-btn ghost">Leaderboard</Link>
        <Link to={retryLink} className="rs-btn primary">Try Again</Link>
      </div>
    </div>
  );
}

export default Result;