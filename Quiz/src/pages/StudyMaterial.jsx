import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Study.css";

function StudyMaterial() {
  useSeo(
    "Free Study Material and Notes | ExamPrep Hub",
    "Free notes, shortcuts and useful links for govt exam and computer preparation."
  );

  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/resources")
      .then((res) => setItems(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(items.map((i) => i.category))];
  const active = categories.includes(category) ? category : "All";

  const q = search.trim().toLowerCase();
  const filtered = items.filter(
    (i) =>
      (active === "All" || i.category === active) &&
      (!q || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
  );

  if (loading) return <div className="section"><p>Loading...</p></div>;

  return (
    <div className="section">
      <h1>📚 Study Material</h1>
      <p className="sm-sub">Free notes, shortcuts aur kaam ke links. Padho aur phir test do.</p>

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <input
        className="exam-search"
        placeholder="Notes dhoondho (jaise Excel, HP GK)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="category-bar">
        {categories.map((c) => (
          <button
            key={c}
            className={`category-btn ${active === c ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {items.length === 0 && !error && (
        <p>Study material jald aa raha hai. Tab tak <Link to="/exams">mock tests</Link> do.</p>
      )}
      {items.length > 0 && filtered.length === 0 && <p>Kuch nahi mila.</p>}

      <div className="sm-grid">
        {filtered.map((r) => (
          <div key={r._id} className="sm-card">
            <div className="sm-top">
              <span className="sm-cat">{r.category}</span>
              <span className="sm-type">{r.type === "link" ? "🔗 Link" : "📝 Note"}</span>
            </div>
            <h3>{r.title}</h3>
            {r.description && <p>{r.description}</p>}

            {r.type === "link" ? (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-btn"
              >
                Link kholo →
              </a>
            ) : (
              <Link to={`/study/${r._id}`} className="card-btn">
                Padho →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudyMaterial;