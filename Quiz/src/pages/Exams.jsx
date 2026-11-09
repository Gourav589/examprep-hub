import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ExamCard from "../components/ExamCard";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Exams.css";

function Exams() {
  useSeo(
    "Free Mock Tests for SSC, Banking, Railway, HP State | ExamPrep Hub",
    "Browse all govt exam mock tests. Search by exam name, pick a category and start practicing for free."
  );

  const [params] = useSearchParams();
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearch(params.get("search") || "");
    setCategory(params.get("category") || "All");
  }, [params]);

  useEffect(() => {
    API.get("/exams")
      .then((res) => setExams(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(exams.map((e) => e.category))];
  const activeCategory = categories.includes(category) ? category : "All";

  const filtered = exams
    .filter(
      (e) =>
        (activeCategory === "All" || e.category === activeCategory) &&
        e.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    // Jin exams ke tests bane hain, wo pehle dikhein
    .sort((a, b) => (b.tests > 0) - (a.tests > 0));

  if (loading) return <div className="section"><p>Loading...</p></div>;

  return (
    <div className="section">
      <h1>Mock Tests</h1>
      <p style={{ color: "#6b7280", marginBottom: "20px" }}>
        Apna exam chuno aur free mock test se practice shuru karo.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        className="exam-search"
        placeholder="Exam dhoondho (jaise SSC, Bank, HP Patwari)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="category-bar">
        {categories.map((c) => (
          <button
            key={c}
            className={`category-btn ${activeCategory === c ? "active" : ""}`}
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