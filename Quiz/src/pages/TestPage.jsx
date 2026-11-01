import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../services/api";
import "./TestPage.css";

const LETTERS = ["A", "B", "C", "D"];
const RADIUS = 34;
const CIRC = 2 * Math.PI * RADIUS;

function TestPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const testNumber = Number(params.get("test")) || 1;
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [visited, setVisited] = useState({});
  const [totalSeconds, setTotalSeconds] = useState(600);
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [examRes, qRes] = await Promise.all([
          API.get(`/exams/${id}`).catch(() => null),
          API.get(`/questions/exam/${id}`, { params: { test: testNumber } }),
        ]);
        if (cancelled) return;

        const ex = examRes ? examRes.data : null;
        const secs = (ex && ex.durationMinutes ? ex.durationMinutes : 10) * 60;

        setExam(ex);
        setTotalSeconds(secs);
        setTimeLeft(secs);
        setQuestions(qRes.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, testNumber]);

  const started = questions.length > 0;

  // Timer sirf tab chalu hota hai jab questions aa jayein
  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [started]);

  // Jo question abhi khula hai use "visited" maano
  useEffect(() => {
    if (questions[current]) {
      const qid = questions[current]._id;
      setVisited((v) => ({ ...v, [qid]: true }));
    }
  }, [current, questions]);

  const submitTest = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const { data } = await API.post(`/questions/exam/${id}/submit`, {
        testNumber,
        answers,
      });
      navigate(`/exams/${id}/result`, { state: data });
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
      setSubmitting(false);
    }
  };

  // Time khatam hone par apne aap submit
  useEffect(() => {
    if (started && timeLeft <= 0) submitTest();
  }, [timeLeft]);

  if (loading) return <div className="tp-wrap"><p>Loading...</p></div>;

  if (error) {
    return (
      <div className="tp-wrap">
        <p>{error}</p>
        {error.toLowerCase().includes("premium") && (
          <p style={{ marginTop: "12px" }}>
            <Link to="/membership" className="card-btn">Premium unlock karo</Link>
          </p>
        )}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="tp-wrap">
        <p>Is test ke questions abhi available nahi hain.</p>
        <p style={{ marginTop: "12px" }}>
          <Link to={`/exams/${id}`} className="card-btn">Back to Exam</Link>
        </p>
      </div>
    );
  }

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / questions.length) * 100);
  const neg = exam ? exam.negativeMarking || 0 : 0;

  const formatTime = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  const selectOption = (index) => setAnswers({ ...answers, [q._id]: index });

  const clearResponse = () => {
    const copy = { ...answers };
    delete copy[q._id];
    setAnswers(copy);
  };

  const toggleMark = () => setMarked({ ...marked, [q._id]: !marked[q._id] });

  const handleSubmitClick = () => {
    const left = questions.length - answeredCount;
    const msg = `Answered: ${answeredCount}, Not answered: ${left}.\nTest submit karna hai?`;
    if (window.confirm(msg)) submitTest();
  };

  const statusOf = (item) => {
    if (marked[item._id]) return "marked";
    if (answers[item._id] !== undefined) return "answered";
    if (visited[item._id]) return "not-answered";
    return "not-visited";
  };

  const timeSafe = Math.max(timeLeft, 0);
  const offset = CIRC * (1 - timeSafe / totalSeconds);
  const warnAt = Math.min(60, Math.floor(totalSeconds / 5));

  return (
    <div className="tp-wrap">
      <div className="tp-header">
        <div className="tp-title">
          <p className="tp-exam">
            {exam ? exam.name : "Mock Test"} | Test {testNumber}
          </p>
          <p className="tp-sub">
            Answered {answeredCount} / {questions.length}
            {neg > 0 && ` | Galat jawab par -${neg}`}
          </p>
          <div className="tp-progress">
            <div className="tp-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <button className="tp-submit" onClick={handleSubmitClick} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Test"}
        </button>
      </div>

      {submitError && <p className="tp-error">{submitError}</p>}

      <div className="tp-body">
        <div className="tp-question-card">
          <span className="tp-qnum">
            Question {current + 1} of {questions.length}
          </span>
          {q.section && <span className="tp-section">{q.section}</span>}

          <h2 className="tp-question">{q.question}</h2>

          <div className="tp-options">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={"tp-option" + (answers[q._id] === i ? " selected" : "")}
                onClick={() => selectOption(i)}
              >
                <span className="tp-letter">{LETTERS[i]}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>

          <div className="tp-actions">
            <button
              className="tp-btn ghost"
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
            >
              ← Previous
            </button>

            <button className="tp-btn ghost" onClick={clearResponse}>
              Clear
            </button>

            <button
              className={"tp-btn mark" + (marked[q._id] ? " on" : "")}
              onClick={toggleMark}
            >
              {marked[q._id] ? "★ Marked" : "☆ Mark for Review"}
            </button>

            {current < questions.length - 1 ? (
              <button className="tp-btn primary" onClick={() => setCurrent(current + 1)}>
                Next →
              </button>
            ) : (
              <button className="tp-btn primary" onClick={handleSubmitClick}>
                Finish
              </button>
            )}
          </div>
        </div>

        <div className="tp-side">
          <div className="tp-card tp-timer-card">
            <div className="tp-ring-wrap">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r={RADIUS} className="ring-bg" />
                <circle
                  cx="45"
                  cy="45"
                  r={RADIUS}
                  className={"ring-fg" + (timeSafe < warnAt ? " danger" : "")}
                  strokeDasharray={CIRC}
                  strokeDashoffset={offset}
                />
              </svg>
              <span className="tp-time">{formatTime(timeSafe)}</span>
            </div>
            <p className="tp-timer-label">Time Remaining</p>
          </div>

          <div className="tp-card">
            <h4>Question Palette</h4>
            <div className="tp-palette">
              {questions.map((item, i) => (
                <button
                  key={item._id}
                  className={
                    "tp-pal " + statusOf(item) + (i === current ? " current" : "")
                  }
                  onClick={() => setCurrent(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="tp-legend">
              <span><i className="dot answered" /> Answered</span>
              <span><i className="dot not-answered" /> Not answered</span>
              <span><i className="dot marked" /> Marked</span>
              <span><i className="dot not-visited" /> Not visited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestPage;