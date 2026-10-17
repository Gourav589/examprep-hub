import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExamCard from "../components/ExamCard";
import API from "../services/api";
import "./Home.css";

function Home() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/exams")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setExams(res.data);
        } else {
          setError("Server ne list ki jagah kuch aur bheja");
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Crack Your Govt Exam</h1>
        <p>Free mock tests, previous papers and latest job alerts in one place</p>
        <Link to="/exams" className="hero-btn">Start Free Test</Link>
      </section>

      <section className="section">
        <h2>Popular Exams</h2>
       
        <div className="exam-grid">
          {exams.map((exam) => (
            <ExamCard key={exam._id} exam={exam} />
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;