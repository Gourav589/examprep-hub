import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExamCard from "../components/ExamCard";
import API from "../services/api";
import "./Home.css";

function Home() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    API.get("/exams")
      .then((res) => {
        if (Array.isArray(res.data)) setExams(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Crack Your Govt Exam</h1>
        <p>Free mock tests, previous papers and latest job alerts in one place</p>
        <Link to="/exams" className="hero-btn">Start Free Test</Link>
      </section>

      <section className="section">
        <h2>Kaise kaam karta hai</h2>
        <div className="steps-grid">
          <div className="step-box">
            <span className="step-num">1</span>
            <h3>Account banao</h3>
            <p>Free signup karo, sirf 1 minute lagta hai.</p>
          </div>
          <div className="step-box">
            <span className="step-num">2</span>
            <h3>Test do</h3>
            <p>Apna exam chuno aur timer ke saath mock test do.</p>
          </div>
          <div className="step-box">
            <span className="step-num">3</span>
            <h3>Result dekho</h3>
            <p>Score, accuracy aur section-wise analysis turant paao.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Popular Exams</h2>
        <div className="exam-grid">
          {exams.slice(0, 6).map((exam) => (
            <ExamCard key={exam._id} exam={exam} />
          ))}
        </div>
        <p style={{ marginTop: "20px" }}>
          <Link to="/exams" className="card-btn">Saare exams dekho</Link>
        </p>
      </section>
    </>
  );
}

export default Home;