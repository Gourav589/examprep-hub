import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";

function ExamDetail() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/exams/${id}`)
      .then((res) => setExam(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, [id]);

  if (error) return <div className="section"><p>{error}</p></div>;
  if (!exam) return <div className="section"><p>Loading...</p></div>;

  return (
    <div className="section">
      <span className="badge">{exam.category}</span>
      <h1>{exam.name}</h1>
      <p>{exam.tests} Mock Tests</p>
      <p>{exam.free ? "Free for everyone" : "Premium members only"}</p>
      <Link to={`/exams/${id}/test`} className="card-btn" style={{ marginRight: "10px" }}>
        Start Test
      </Link>
      <Link to="/" className="card-btn">Back to Home</Link>
    </div>
  );
}

export default ExamDetail;