import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./ExamDetail.css";

function ExamDetail() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [tests, setTests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useSeo(
    exam ? `${exam.name} Free Mock Test | ExamPrep Hub` : "Mock Test | ExamPrep Hub",
    exam
      ? `Practice ${exam.name} mock tests online with timer, instant result and section-wise analysis.`
      : "Practice govt exam mock tests online."
  );

  useEffect(() => {
    Promise.all([
      API.get(`/exams/${id}`),
      API.get(`/questions/exam/${id}/tests`),
    ])
      .then(([examRes, testsRes]) => {
        setExam(examRes.data);
        setTests(testsRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="section"><p>Loading...</p></div>;
  if (error) return <div className="section"><p>{error}</p></div>;

  const minutes = exam.durationMinutes || 10;
  const neg = exam.negativeMarking || 0;

  return (
    <div className="section">
      <span className="badge">{exam.category}</span>
      <h1>{exam.name}</h1>
      <p className="ed-sub">
        {exam.free ? "Free for everyone" : "Premium members only"} | {minutes} minute har test | Negative marking:{" "}
        {neg > 0 ? `${neg} per galat jawab` : "nahi hai"}
      </p>

      <div className="ed-actions">
        <Link to={`/exams/${id}/leaderboard`} className="card-btn" style={{ background: "#f59e0b" }}>
          Leaderboard
        </Link>
        <Link to="/exams" className="card-btn" style={{ background: "#64748b" }}>
          Saare exams
        </Link>
      </div>

      <h2 style={{ margin: "26px 0 14px" }}>Available Tests</h2>

      {tests.length === 0 && (
        <p>Is exam ke tests abhi taiyar nahi hain. Jald aa rahe hain.</p>
      )}

      <div className="ed-grid">
        {tests.map((t) => (
          <div key={t.testNumber} className="ed-test">
            <div className="ed-test-top">
              <h3>Test {t.testNumber}</h3>
              <span className={"ed-tag " + (exam.free ? "free" : "premium")}>
                {exam.free ? "Free" : "Premium"}
              </span>
            </div>
            <p>{t.questions} questions</p>
            <p>{minutes} minute</p>
            <Link
              to={`/exams/${id}/test?test=${t.testNumber}`}
              className="card-btn"
              style={{ marginTop: "12px" }}
            >
              Start Test
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExamDetail;