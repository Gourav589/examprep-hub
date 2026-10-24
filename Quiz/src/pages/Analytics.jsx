import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Analytics.css";

function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/analytics/me")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="section"><p>Analytics bana rahe hain...</p></div>;

  if (error) {
    return (
      <div className="section">
        <p>{error}</p>
        <Link to="/login" className="card-btn">Login</Link>
      </div>
    );
  }

  if (!data.hasData) {
    return (
      <div className="section">
        <h1>My Analytics</h1>
        <p>Abhi analytics ke liye data nahi hai. Pehle kuch tests do.</p>
        <Link to="/exams" className="card-btn" style={{ marginTop: "12px" }}>
          Test do
        </Link>
      </div>
    );
  }

  return (
    <div className="section">
      <h1>My Analytics</h1>
      <p className="an-sub">Python (Pandas, NumPy, Matplotlib, Seaborn) se bana hua analysis.</p>

      <div className="an-stats">
        <div className="an-stat">
          <small>Tests diye</small>
          <strong>{data.testsTaken}</strong>
        </div>
        <div className="an-stat">
          <small>Average score</small>
          <strong>{data.averagePct}%</strong>
        </div>
        <div className="an-stat">
          <small>Best score</small>
          <strong>{data.bestPct}%</strong>
        </div>
        <div className="an-stat highlight">
          <small>Percentile</small>
          <strong>{data.percentile !== null ? `${data.percentile}th` : "-"}</strong>
        </div>
      </div>

      {data.percentile === null && (
        <p className="an-note">
          Percentile dekhne ke liye kam se kam ek aur student ka test dena zaroori hai.
        </p>
      )}
      {data.percentile !== null && (
        <p className="an-note">
          Aapka average score {data.peers} doosre students mein se {data.percentile}% se behtar ya barabar hai.
        </p>
      )}

      {data.weakest && (
        <div className="an-weak">
          Sabse kamzor section: <strong>{data.weakest}</strong>. Pehle yahi revise karo.
        </div>
      )}

      <div className="an-grid">
        {data.charts.sections && (
          <div className="an-card">
            <img src={data.charts.sections} alt="Section-wise accuracy chart" />
          </div>
        )}
        {data.charts.trend ? (
          <div className="an-card">
            <img src={data.charts.trend} alt="Score trend chart" />
          </div>
        ) : (
          <div className="an-card muted">
            Score trend chart ke liye kam se kam 2 tests do.
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;