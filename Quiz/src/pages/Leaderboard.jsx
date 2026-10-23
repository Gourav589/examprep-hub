import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import "./Leaderboard.css";

const medals = ["🥇", "🥈", "🥉"];

function Leaderboard() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/exams/${id}`)
      .then((res) => setExam(res.data))
      .catch(() => {});

    API.get(`/attempts/leaderboard/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="section"><p>Loading...</p></div>;
  if (error) return <div className="section"><p>{error}</p></div>;

  return (
    <div className="section">
      <h1>Leaderboard{exam ? `: ${exam.name}` : ""}</h1>
      <p className="lb-sub">Har student ka sabse achha score gina jata hai.</p>

      {data.me ? (
        <div className="lb-me">
          Aapka rank: <strong>#{data.me.rank}</strong> of {data.totalPlayers} | Best score:{" "}
          <strong>{data.me.bestPct}%</strong>
        </div>
      ) : (
        <div className="lb-me muted">
          Rank dekhne ke liye is exam ka test do (aur login rakho).
        </div>
      )}

      {data.top.length === 0 ? (
        <p>Abhi kisi ne is exam ka test nahi diya. Pehle aap ban jao!</p>
      ) : (
        <div className="lb-table">
          {data.top.map((r) => (
            <div key={r.rank} className={"lb-row" + (r.isMe ? " me" : "")}>
              <span className="lb-rank">{medals[r.rank - 1] || `#${r.rank}`}</span>
              <span className="lb-name">
                {r.name} {r.isMe && <em>(aap)</em>}
              </span>
              <span className="lb-attempts">{r.attempts} test</span>
              <strong className="lb-score">{r.bestPct}%</strong>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link to={`/exams/${id}/test`} className="card-btn">Test do</Link>
        <Link to={`/exams/${id}`} className="card-btn" style={{ background: "#64748b" }}>
          Back to Exam
        </Link>
      </div>
    </div>
  );
}

export default Leaderboard;