import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Mistakes.css";

const LETTERS = ["A", "B", "C", "D"];

function Mistakes() {
  useSeo(
    "Mistakes Notebook | ExamPrep Hub",
    "Revise the questions you got wrong and master them."
  );

  const user = JSON.parse(localStorage.getItem("user"));

  const [summary, setSummary] = useState(null);
  const [examId, setExamId] = useState("");
  const [data, setData] = useState({ items: [], lockedCount: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadSummary = () =>
    API.get("/mistakes/summary")
      .then((res) => {
        setSummary(res.data);
        const first = res.data.exams.find((e) => e.active > 0) || res.data.exams[0];
        setExamId((cur) =>
          res.data.exams.some((e) => e.examId === cur) ? cur : first ? first.examId : ""
        );
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (user) loadSummary();
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (!examId) {
      setData({ items: [], lockedCount: 0 });
      return;
    }
    API.get("/mistakes", { params: { exam: examId } })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, [examId, summary]);

  const remove = async (id) => {
    if (!window.confirm("Is question ko notebook se hata dein?")) return;
    try {
      await API.delete(`/mistakes/${id}`);
      loadSummary();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (!user) {
    return (
      <div className="section">
        <h1>Mistakes Notebook</h1>
        <p>Notebook dekhne ke liye pehle login karo.</p>
        <Link to="/login" className="card-btn" style={{ marginTop: "12px" }}>Login</Link>
      </div>
    );
  }

  if (loading) return <div className="section"><p>Loading...</p></div>;

  const current = summary && summary.exams.find((e) => e.examId === examId);

  return (
    <div className="section">
      <h1>📒 Mistakes Notebook</h1>
      <p className="mn-sub">
        Test mein jo question galat hue, wo yahan jama hote hain. Unka revision test do, aur jo sahi nikle
        wo "mastered" hokar yahan se hat jate hain.
      </p>

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      {summary && summary.exams.length === 0 && (
        <div className="mn-empty">
          <h3>Abhi notebook khaali hai 🎉</h3>
          <p>
            Koi test do. Jo question galat honge wo yahan apne aap jama ho jayenge.
            (Sirf is update ke baad diye gaye tests ke galat jawab jama hote hain.)
          </p>
          <Link to="/exams" className="card-btn" style={{ marginTop: "12px" }}>Test do</Link>
        </div>
      )}

      {summary && summary.exams.length > 0 && (
        <>
          <div className="mn-chips">
            {summary.exams.map((e) => (
              <button
                key={e.examId}
                className={"mn-chip" + (e.examId === examId ? " active" : "")}
                onClick={() => setExamId(e.examId)}
              >
                {e.name} <b>{e.active}</b>
                {e.locked > 0 && <span className="mn-lock"> +{e.locked} 🔒</span>}
              </button>
            ))}
          </div>

          {current && current.active > 0 && (
            <div className="mn-actions">
              <Link
                to={`/mistakes/practice?exam=${examId}`}
                className="mn-revise"
              >
                🔁 Revision test do ({Math.min(15, current.active)} questions)
              </Link>
              <span className="mn-count">{current.active} galat question baaki</span>
            </div>
          )}

          {data.lockedCount > 0 && (
            <div className="mn-locked">
              🔒 {data.lockedCount} galat question premium tests ke hain. Unhe dekhne aur revise karne ke
              liye <Link to="/membership">premium unlock karo</Link>.
            </div>
          )}

          {data.items.length === 0 && current && current.active === 0 && (
            <p style={{ marginTop: "16px" }}>Is exam ke saare galat question master ho gaye. Shabash!</p>
          )}

          <div className="mn-list">
            {data.items.map((m) => (
              <div key={m._id} className="mn-item">
                <div className="mn-item-top">
                  <span className="mn-tag">{m.section}</span>
                  <span className="mn-times">{m.timesWrong} baar galat</span>
                </div>

                <h3>{m.question}</h3>

                <div className="mn-options">
                  {m.options.map((opt, i) => (
                    <p key={i} className={i === m.correctIndex ? "ok" : ""}>
                      <b>{LETTERS[i]}.</b> {opt} {i === m.correctIndex && "✔"}
                    </p>
                  ))}
                </div>

                {m.explanation && <div className="mn-expl">Samjho: {m.explanation}</div>}

                <button className="mn-remove" onClick={() => remove(m._id)}>
                  Notebook se hatao
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Mistakes;