import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ExamCard from "../components/ExamCard";
import API from "../services/api";
import "./Exams.css";

function Exams() {
  const [params] = useSearchParams();
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearch(params.get("search") || "");
  }, [params]);

  useEffect(() => {
    API.get("/exams")
      .then((res) => setExams(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(exams.map((e) => e.category))];

  const filtered = exams.filter(
    (e) =>
      (category === "All" || e.category === category) &&
      e.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  if (loading) return <div className="section"><p>Loading...</p></div>;

  return (
    <div className="section">
      <h1>Mock Tests</h1>
     

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        className="exam-search"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="category-bar">
        {categories.map((c) => (
          <button
            key={c}
            className={`category-btn ${category === c ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 && !error && <p>Koi exam nahi mila.</p>}

      <div className="exam-grid">
        {filtered.map((exam) => (
          <ExamCard key={exam._id} exam={exam} />
        ))}
      </div>
    </div>
  );
}

export default Exams;