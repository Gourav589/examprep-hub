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

  const totalTests = exams.reduce((sum, e) => sum + (e.tests || 0), 0);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <h1>Crack Your Govt Exam</h1>
            <p>Free mock tests, previous papers and latest job alerts in one place</p>
            <div className="hero-actions">
              <Link to="/exams" className="hero-btn">Start Free Test</Link>
              <Link to="/jobs" className="hero-btn-outline">Job Alerts</Link>
            </div>
          </div>
          <img
            src="/hero.png"
            alt="Student preparing for exam"
            className="hero-img"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      </section>

      <div className="stats-strip">
        <div className="stat-box">
          <h2>{exams.length}+</h2>
          <p>Exams</p>
        </div>
        <div className="stat-box">
          <h2>{totalTests}+</h2>
          <p>Mock Tests</p>
        </div>
        <div className="stat-box">
          <h2>Free</h2>
          <p>Start karo</p>
        </div>
      </div>

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

      <div className="band">
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
      </div>
    </>
  );
}

export default Home;