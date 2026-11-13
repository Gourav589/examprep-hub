import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExamCard from "../components/ExamCard";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Home.css";
import DailyQuizCard from "../components/DailyQuizCard";
const RADIUS = 38;
const CIRC = 2 * Math.PI * RADIUS;

const OFFICE_BASICS = [
  "Computer Fundamentals",
  "Computer Awareness (Govt Exams)",
  "MS Word",
  "MS Excel",
  "MS PowerPoint",
  "Internet and Email",
  "CCC Practice",
  "Operating System Basics",
  "Networking Basics",
];

const PROGRAMMING = [
  "Python",
  "C Programming",
  "C++",
  "Java",
  "JavaScript",
  "HTML and CSS",
  "SQL and DBMS",
  "Data Structures",
];

const CHIPS = [
  { label: "📄 MS Word", search: "MS Word" },
  { label: "📊 MS Excel", search: "MS Excel" },
  { label: "📽️ PowerPoint", search: "PowerPoint" },
  { label: "🐍 Python", search: "Python" },
  { label: "⚙️ C++", search: "C++" },
  { label: "🌐 HTML and CSS", search: "HTML" },
  { label: "🗄️ SQL", search: "SQL" },
  { label: "🧠 Computer Awareness", search: "Awareness" },
];

// Tests wale exams pehle, "jald aa raha hai" wale baad mein
const readyFirst = (a, b) => (b.tests > 0) - (a.tests > 0);

function Home() {
  useSeo(
    "Free Govt Exam and Computer Mock Tests | ExamPrep Hub",
    "Practice free mock tests for SSC, Banking, Railway, HP State exams and computer topics like MS Word, Excel, PowerPoint, Python and C++."
  );

  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const isStudent = user && user.role !== "admin";

  useEffect(() => {
    API.get("/exams")
      .then((res) => {
        if (Array.isArray(res.data)) setExams(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!isStudent) return;
    API.get("/attempts/my")
      .then((res) => {
        if (Array.isArray(res.data)) setAttempts(res.data);
      })
      .catch(() => {});
  }, [isStudent]);

  const totalTests = exams.reduce((sum, e) => sum + (e.tests || 0), 0);

  const govtExams = exams.filter((e) => e.category !== "Computer" && e.tests > 0);
  const computerExams = exams.filter((e) => e.category === "Computer");

  const groupA = computerExams
    .filter((e) => OFFICE_BASICS.includes(e.name))
    .sort(readyFirst);
  const groupB = computerExams
    .filter((e) => PROGRAMMING.includes(e.name))
    .sort(readyFirst);
  const groupC = computerExams
    .filter((e) => !OFFICE_BASICS.includes(e.name) && !PROGRAMMING.includes(e.name))
    .sort(readyFirst);

  const groups = [
    { title: "📎 MS Office aur Computer Basics", items: groupA },
    { title: "👨‍💻 Programming aur Web", items: groupB },
    { title: "➕ Aur computer topics", items: groupC },
  ];

  // Progress ka hisaab
  const testsDone = attempts.length;
  const totalCorrect = attempts.reduce((s, a) => s + (a.correct || 0), 0);
  const totalQuestions = attempts.reduce((s, a) => s + (a.total || 0), 0);
  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestPct = attempts.reduce((best, a) => {
    const p = a.total ? Math.round((a.correct / a.total) * 100) : 0;
    return p > best ? p : best;
  }, 0);
  const offset = CIRC * (1 - accuracy / 100);

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
          <p>Test 1 har exam ka</p>
        </div>
      </div>
<DailyQuizCard />
      {isStudent && (
        <section className="section">
          <div className="progress-card">
            <div className="progress-head">
              <h2>Your Progress</h2>
              <Link to="/my-results">View details</Link>
            </div>

            {testsDone === 0 ? (
              <p className="progress-empty">
                Abhi tak koi test nahi diya. Pehla test dekar apni progress shuru karo!
              </p>
            ) : (
              <div className="progress-body">
                <div className="progress-ring">
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r={RADIUS} className="pr-bg" />
                    <circle
                      cx="55"
                      cy="55"
                      r={RADIUS}
                      className="pr-fg"
                      strokeDasharray={CIRC}
                      strokeDashoffset={offset}
                    />
                  </svg>
                  <div className="progress-ring-text">
                    <strong>{accuracy}%</strong>
                    <span>Accuracy</span>
                  </div>
                </div>

                <div className="progress-stats">
                  <div className="pstat">
                    <span className="pstat-icon green">✔</span>
                    <div>
                      <strong>{testsDone}</strong>
                      <small>Tests diye</small>
                    </div>
                  </div>
                  <div className="pstat">
                    <span className="pstat-icon orange">★</span>
                    <div>
                      <strong>{totalCorrect}</strong>
                      <small>Sahi jawab</small>
                    </div>
                  </div>
                  <div className="pstat">
                    <span className="pstat-icon blue">🏆</span>
                    <div>
                      <strong>{bestPct}%</strong>
                      <small>Best score</small>
                    </div>
                  </div>
                </div>

                <div className="progress-recent">
                  <h4>Recent tests</h4>
                  {attempts.slice(0, 3).map((a) => {
                    const p = a.total ? Math.round((a.correct / a.total) * 100) : 0;
                    return (
                      <div key={a._id} className="recent-row">
                        <span>{a.exam ? a.exam.name : "Exam"}</span>
                        <strong>{p}%</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section">
        <h2>Popular Exams</h2>
        <div className="exam-grid">
          {govtExams.slice(0, 6).map((exam) => (
            <ExamCard key={exam._id} exam={exam} />
          ))}
        </div>
        <p style={{ marginTop: "20px" }}>
          <Link to="/exams" className="card-btn">Saare exams dekho</Link>
        </p>
      </section>

      {computerExams.length > 0 && (
        <div className="cs-band">
          <section className="section">
            <div className="cs-head">
              <div>
                <h2>💻 Computer Mock Tests</h2>
                
              </div>
              <Link to="/exams?category=Computer" className="card-btn">
                More
              </Link>
            </div>

            <div className="cs-chips">
              {CHIPS.map((c) => (
                <Link
                  key={c.label}
                  to={`/exams?search=${encodeURIComponent(c.search)}`}
                  className="cs-chip"
                >
                  {c.label}
                </Link>
              ))}
            </div>

            {groups.map(
              (g) =>
                g.items.length > 0 && (
                  <div key={g.title} className="cs-group-box">
                    <h3 className="cs-group">{g.title}</h3>
                    <div className="exam-grid">
                      {g.items.slice(0, 8).map((exam) => (
                        <ExamCard key={exam._id} exam={exam} />
                      ))}
                    </div>
                  </div>
                )
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default Home;