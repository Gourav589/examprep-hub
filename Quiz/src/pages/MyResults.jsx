import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function MyResults() {
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/attempts/my")
      .then((res) => setAttempts(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="section"><p>Loading...</p></div>;

  if (error) {
    return (
      <div className="section">
        <p>{error}</p>
        <Link to="/login" className="card-btn">Login</Link>
      </div>
    );
  }

  return (
    <div className="section">
      <h1>My Results</h1>
      {attempts.length === 0 && <p>Abhi tak koi test nahi diya.</p>}

      {attempts.map((a) => {
        const accuracy = a.total ? Math.round((a.correct / a.total) * 100) : 0;
        return (
          <div key={a._id} className="exam-card" style={{ marginBottom: "15px" }}>
            <h3>{a.exam ? a.exam.name : "Exam (hata diya gaya)"}</h3>
            <p>
              Score: {a.score} / {a.total} | Correct: {a.correct} | Wrong: {a.wrong} | Skipped: {a.skipped}
            </p>
            <p>Accuracy: {accuracy}%</p>
            <p style={{ color: "#6b7280" }}>{new Date(a.createdAt).toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
}

export default MyResults;