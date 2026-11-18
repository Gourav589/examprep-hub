import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Study.css";

function StudyNote() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");

  useSeo(
    note ? `${note.title} | Study Material | ExamPrep Hub` : "Study Material | ExamPrep Hub",
    note ? note.description || `${note.title}: free notes on ExamPrep Hub.` : "Free study notes."
  );

  useEffect(() => {
    API.get(`/resources/${id}`)
      .then((res) => setNote(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, [id]);

  if (error) return <div className="section"><p>{error}</p></div>;
  if (!note) return <div className="section"><p>Loading...</p></div>;

  return (
    <div className="section">
      <Link to="/study" className="card-btn" style={{ background: "#64748b" }}>
        ← Study Material
      </Link>

      <article className="sn-box">
        <span className="sm-cat">{note.category}</span>
        <h1>{note.title}</h1>
        <p className="sn-date">{new Date(note.createdAt).toLocaleDateString()}</p>
        <div className="sn-text">{note.content}</div>

        <div className="sn-cta">
          <strong>Padh liya? Ab test do.</strong>
          <Link to="/exams" className="card-btn">Mock tests dekho</Link>
        </div>
      </article>
    </div>
  );
}

export default StudyNote;