import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExamCard from "../components/ExamCard";
import DailyQuizCard from "../components/DailyQuizCard";
import { HowItWorks, ComputerTip, StudyTips } from "../components/HomeExtras";
import { Stars } from "../components/Stars";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import { SITE } from "../config/site";
import "./Home.css";
import usePricing from "../hooks/usePricing";
import Countdown from "../components/Countdown";

const RADIUS = 38;
const CIRC = 2 * Math.PI * RADIUS;

const CATEGORY_META = {
  SSC: { icon: "📝", color: "#4f46e5", blurb: "CGL, CHSL, MTS, GD" },
  Banking: { icon: "🏦", color: "#0891b2", blurb: "IBPS, SBI, RRB" },
  Railway: { icon: "🚆", color: "#ea580c", blurb: "NTPC, Group D, ALP, JE" },
  UPSC: { icon: "⚖️", color: "#be123c", blurb: "Prelims aur practice" },
  Defence: { icon: "🎖️", color: "#475569", blurb: "NDA, CDS, Agniveer" },
  Teaching: { icon: "🎓", color: "#a16207", blurb: "CTET aur TET" },
  "HP State": { icon: "🏔️", color: "#0d9488", blurb: "HPAS, Patwari, Clerk, TET" },
  "State Govt": { icon: "🏛️", color: "#16a34a", blurb: "Rajya star ke exams" },
  Computer: { icon: "💻", color: "#0284c7", blurb: "Office, Python, C++, Web" },
};

const getMeta = (name) =>
  CATEGORY_META[name] || { icon: "📚", color: "#4f46e5", blurb: "Mock tests" };

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

const WHY = [
  { icon: "⏱️", title: "Real exam jaisa timer", text: "Timer, question palette, mark for review aur auto-submit, bilkul asli test jaisa." },
  { icon: "📊", title: "Turant result aur analysis", text: "Score, accuracy aur section-wise performance test khatam hote hi." },
  { icon: "💡", title: "Har answer ka explanation", text: "Galat jawab par samjho ki sahi jawab kyun sahi hai." },
  { icon: "📒", title: "Mistakes Notebook", text: "Galat question apne aap jama hote hain, aur unka revision test milta hai." },
  { icon: "🔥", title: "Daily Quiz aur streak", text: "Roz 10 free questions. Streak banao aur badge jeeto." },
  { icon: "🧠", title: "Smart analytics", text: "Percentile, class ke saath tulna aur score trend ke charts." },
  { icon: "🆓", title: "Test 1 har exam ka free", text: "Pehle khud try karo, phir chaho to premium lo." },
  { icon: "📱", title: "Phone par bhi, aur auto-save", text: "Net ya tab chala jaye to jawab aur time wapas mil jate hain." },
];

const FAQ = [
  {
    q: "Kya yeh website free hai?",
    a: "Haan, har exam ka pehla test bilkul free hai. Daily Quiz, result, explanation aur Mistakes Notebook bhi free hain. Baaki tests ke liye premium chahiye.",
  },
  {
    q: "Premium mein kya milta hai?",
        a: "Premium mein har exam ke saare tests khul jate hain, pehle free test ke baad wale bhi. Price aur chal rahe offer Membership page par dikhte hain.",
  },
  {
    q: "Kya premium apne aap renew hota hai?",
    a: "Nahi. Yeh ek baar ka payment hai jo tay din ke liye chalta hai. Aap chaho to dobara le sakte ho, aur bacha hua samay jud jata hai.",
  },
  {
    q: "Payment kitna safe hai?",
    a: "Payment Razorpay se hota hai. Aapke card ya UPI ki details is website par save nahi hoti.",
  },
  {
    q: "Kya yeh phone par chalta hai?",
    a: "Haan. Site phone par bhi chalti hai, aur test ke beech net chala jaye to aapke jawab aur bacha hua time wapas mil jate hain.",
  },
  {
    q: "Kya questions bilkul asli exam jaise hote hain?",
    a: "Questions practice ke liye banaye gaye hain. Hum unhe sahi rakhne ki koshish karte hain, par asli exam se bilkul milne ki guarantee nahi dete. Koi galti dikhe to question ke neeche report kar sakte ho.",
  },
  {
    q: "Refund kab milta hai?",
    a: "Refund ke niyam Refund Policy page par likhe hain. Double payment ya premium na chalu hone jaise maamle mein hum madad karte hain.",
  },
];

// Tests wale exams pehle, "jald aa raha hai" wale baad mein
const readyFirst = (a, b) => (b.tests > 0) - (a.tests > 0);

function Home() {
  useSeo(
    "Free Govt Exam and Computer Mock Tests | ExamPrep Hub",
    "Practice free mock tests for SSC, Banking, Railway, HP State exams and computer topics like MS Word, Excel, PowerPoint, Python and C++. Real exam timer, instant result and explanations."
  );

  const navigate = useNavigate();
  const { pricing, offset: pricingOffset, refresh } = usePricing();
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState(null);
  const [query, setQuery] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const isStudent = user && user.role !== "admin";

  useEffect(() => {
    API.get("/exams")
      .then((res) => {
        if (Array.isArray(res.data)) setExams(res.data);
      })
      .catch((err) => console.log(err));

    API.get("/jobs")
      .then((res) => {
        if (Array.isArray(res.data)) setJobs(res.data);
      })
      .catch(() => {});

    API.get("/reviews")
      .then((res) => setReviews(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isStudent) return;
    API.get("/attempts/my")
      .then((res) => {
        if (Array.isArray(res.data)) setAttempts(res.data);
      })
      .catch(() => {});
  }, [isStudent]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/exams?search=${encodeURIComponent(q)}` : "/exams");
  };

  const totalTests = exams.reduce((sum, e) => sum + (e.tests || 0), 0);

  const govtExams = exams.filter((e) => e.category !== "Computer" && e.tests > 0);
  const computerExams = exams.filter((e) => e.category === "Computer");

  const groupA = computerExams.filter((e) => OFFICE_BASICS.includes(e.name)).sort(readyFirst);
  const groupB = computerExams.filter((e) => PROGRAMMING.includes(e.name)).sort(readyFirst);
  const groupC = computerExams
    .filter((e) => !OFFICE_BASICS.includes(e.name) && !PROGRAMMING.includes(e.name))
    .sort(readyFirst);

  const groups = [
    { title: "📎 MS Office aur Computer Basics", items: groupA },
    { title: "👨‍💻 Programming aur Web", items: groupB },
    { title: "➕ Aur computer topics", items: groupC },
  ];

  // Category tiles: jin categories mein exams hain wahi dikhte hain
  const categories = [...new Set(exams.map((e) => e.category))]
    .map((name) => {
      const list = exams.filter((e) => e.category === name);
      return {
        name,
        meta: getMeta(name),
        total: list.length,
        ready: list.filter((e) => e.tests > 0).length,
      };
    })
    .sort((a, b) => b.ready - a.ready);

  // Aane wale job alerts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingJobs = jobs
    .filter((j) => new Date(j.lastDate) >= today)
    .sort((a, b) => new Date(a.lastDate) - new Date(b.lastDate))
    .slice(0, 3);
  const daysLeft = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

  // Reviews: sirf jinme likha hua comment ho
  const showReviews = reviews && reviews.total > 0;
  const topReviews = showReviews ? reviews.reviews.filter((r) => r.comment).slice(0, 3) : [];

  // Progress ka hisaab
  const testsDone = attempts.length;
  const totalCorrect = attempts.reduce((s, a) => s + (a.correct || 0), 0);
  const totalQuestions = attempts.reduce((s, a) => s + (a.total || 0), 0);
  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestPct = attempts.reduce((best, a) => {
    const p = a.total ? Math.round((a.correct / a.total) * 100) : 0;
    return p > best ? p : best;
  }, 0);
const progressOffset = CIRC * (1 - accuracy / 100);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <span className="hero-pill">🎯 Govt exams aur computer skills ki practice</span>
            <h1>
              Crack Your Govt Exam with <span className="hero-hl">Free Mock Tests</span>
            </h1>
            <p>
              Real exam timer, turant result aur har answer ka explanation. Roz practice karo,
              galtiyan sudharo aur apna rank dekho.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <input
                placeholder="Exam dhoondho: SSC, HP Patwari, Excel, Python..."
                aria-label="Exam search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            <div className="hero-actions">
              <Link to="/exams" className="hero-btn">Start Free Test</Link>
              <Link to="/jobs" className="hero-btn-outline">Job Alerts</Link>
            </div>

            <ul className="hero-trust">
              <li>✔ Har exam ka Test 1 free</li>
              <li>✔ Real exam timer</li>
              <li>✔ Phone par bhi</li>
            </ul>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="ha-card">
              <div className="ha-top">
                <span className="ha-tag">Sample | Mock Test</span>
                <span className="ha-time">⏱ 42:17</span>
              </div>
              <p className="ha-q">Find the odd one out: 2, 4, 8, 16, 20</p>
              <div className="ha-opt"><b>A</b> 4</div>
              <div className="ha-opt"><b>B</b> 8</div>
              <div className="ha-opt on"><b>C</b> 16</div>
              <div className="ha-opt"><b>D</b> 20</div>
            </div>
            <div className="ha-float ha-score">
              <strong>82%</strong>
              <span>Accuracy</span>
            </div>
            <div className="ha-float ha-streak">🔥 Streak chalu</div>
          </div>
        </div>
      </section>

      {/* STATS */}
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
      <HowItWorks />
      {/* YOUR PROGRESS */}
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
                    strokeDashoffset={progressOffset}
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

      {/* BROWSE BY CATEGORY */}
      {categories.length > 0 && (
        <section className="section">
          <div className="sec-head">
            <h2>Category chuno</h2>
            <p>Apne exam ki category se seedha tests tak pahuncho.</p>
          </div>
          <div className="cat-grid">
            {categories.map((c) => (
              <Link
                key={c.name}
                to={`/exams?category=${encodeURIComponent(c.name)}`}
                className="cat-tile"
                style={{ "--accent": c.meta.color }}
              >
                <span className="cat-icon">{c.meta.icon}</span>
                <strong>{c.name}</strong>
                <small>{c.meta.blurb}</small>
                <em>
                  {c.total} exams{c.ready > 0 ? ` | ${c.ready} mein tests taiyar` : ""}
                </em>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* POPULAR EXAMS */}
      {govtExams.length > 0 && (
        <section className="section">
          <div className="sec-head">
            <h2>Popular Exams</h2>
            <p>Sabse pehle yahan se shuru karo.</p>
          </div>
          <div className="exam-grid">
            {govtExams.slice(0, 6).map((exam) => (
              <ExamCard key={exam._id} exam={exam} />
            ))}
          </div>
          <p style={{ marginTop: "20px" }}>
            <Link to="/exams" className="card-btn">Saare exams dekho</Link>
          </p>
        </section>
      )}

      {/* COMPUTER TESTS */}
      {computerExams.length > 0 && (
        <div className="cs-band">
          <section className="section">
            <div className="cs-head">
              <div>
                <h2>💻 Computer Mock Tests</h2>
                <p className="cs-sub">
                  MS Office, programming aur web ke tests. Govt exam ke computer section aur apni
                  skills, dono ke liye.
                </p>
              </div>
              <Link to="/exams?category=Computer" className="card-btn">
                Saare computer tests
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
      <ComputerTip />
      <StudyTips />
      {/* WHY US */}
      <section className="section">
        <div className="sec-head">
          <h2>Kyun ExamPrep Hub?</h2>
          <p>Sirf test nahi, seekhne ka poora tareeka.</p>
        </div>
        <div className="why-grid">
          {WHY.map((w) => (
            <div key={w.title} className="why-card">
              <span className="why-icon">{w.icon}</span>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST JOB ALERTS */}
      {upcomingJobs.length > 0 && (
        <div className="band">
          <section className="section">
            <div className="sec-head row">
              <div>
                <h2>Latest Job Alerts</h2>
                <p>Aakhri date paas wali naukriyan pehle.</p>
              </div>
              <Link to="/jobs" className="card-btn">Saari jobs</Link>
            </div>
            <div className="hj-grid">
              {upcomingJobs.map((j) => {
                const left = daysLeft(j.lastDate);
                return (
                  <div key={j._id} className="hj-card">
                    <div className="hj-top">
                      <span className="hj-org">{j.organization}</span>
                      <span className={"hj-days" + (left <= 7 ? " urgent" : "")}>
                        {left <= 0 ? "Aakhri din" : `${left} din baaki`}
                      </span>
                    </div>
                    <h3>{j.title}</h3>
                    <p>📅 Last date: {new Date(j.lastDate).toLocaleDateString()}</p>
                    {j.eligibility && <p>🎓 {j.eligibility}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* REVIEWS */}
      {showReviews && (
        <section className="section">
          <div className="sec-head row">
            <div>
              <h2>Students kya kehte hain</h2>
              <p>Asli students ke asli reviews.</p>
            </div>
            <Link to="/reviews" className="card-btn">Saare reviews</Link>
          </div>

          <div className="rvh-top">
            <strong>{reviews.average.toFixed(1)}</strong>
            <div>
              <Stars value={reviews.average} size={22} />
              <small>
                {reviews.total} {reviews.total === 1 ? "review" : "reviews"}
              </small>
            </div>
          </div>

          {topReviews.length > 0 && (
            <div className="rvh-grid">
              {topReviews.map((r) => (
                <div key={r._id} className="rvh-card">
                  <Stars value={r.rating} size={16} />
                  <p>
                    "{r.comment.length > 150 ? r.comment.slice(0, 150) + "..." : r.comment}"
                  </p>
                  <div className="rvh-by">
                    {r.name}
                    {r.verified && <span className="rvh-badge">✔ Verified student</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* FREE VS PREMIUM */}
      <section className="section">
        <div className="sec-head">
          <h2>Free ya Premium</h2>
          <p>Pehle free try karo, phir tay karo.</p>
        </div>
        <div className="price-grid">
          <div className="price-card">
            <span className="price-tag">Free</span>
            <div className="price-amt">Rs 0</div>
            <ul>
              <li>✔ Har exam ka Test 1</li>
              <li>✔ Turant result aur explanation</li>
              <li>✔ Daily Quiz aur streak</li>
              <li>✔ Mistakes Notebook</li>
              <li>✔ Job Alerts</li>
            </ul>
            <Link to={user ? "/exams" : "/signup"} className="price-btn ghost">
              {user ? "Tests dekho" : "Free account banao"}
            </Link>
          </div>

          <div className="price-card premium">
            <span className="price-tag">Premium</span>
                       {pricing && pricing.offerActive && (
              <span className="price-offer">
                🎉 {pricing.savePercent}% off | Limited offer
              </span>
            )}
            <div className="price-amt">
              {pricing && pricing.offerActive && (
                <s className="price-old">Rs {pricing.listPrice}</s>
              )}{" "}
              Rs {pricing ? pricing.price : "--"}{" "}
              <small>/ {pricing ? pricing.days : 30} din</small>
            </div>
            {pricing && pricing.offerActive && (
              <p className="price-cd">
                <Countdown
                  endsAt={pricing.endsAt}
              offset={pricingOffset}
                  label="Offer khatam hone mein"
                  onDone={refresh}
                />
              </p>
            )}
            <ul>
              <li>✔ Free ki saari cheezein</li>
              <li>✔ Har exam ke saare tests</li>
              <li>✔ Auto-renew nahi, kabhi bhi band</li>
              <li>✔ Safe payment (Razorpay)</li>
            </ul>
            <Link to="/membership" className="price-btn">Premium dekho</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="sec-head">
          <h2>Aksar puche jane wale sawal</h2>
        </div>
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <p className="faq-links">
          <Link to="/terms">Terms</Link> | <Link to="/privacy">Privacy</Link> |{" "}
          <Link to="/refund-policy">Refund Policy</Link> | <Link to="/contact">Contact</Link>
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="cta-band">
        <h2>Aaj hi apna pehla test do</h2>
        <p>Free account, free Test 1, aur turant result. Taiyari ki shuruaat abhi karo.</p>
        <div className="cta-actions">
          <Link to="/exams" className="hero-btn">Start Free Test</Link>
          {user ? (
            <Link to="/daily" className="hero-btn-outline">🔥 Daily Quiz</Link>
          ) : (
            <Link to="/signup" className="hero-btn-outline">Free account banao</Link>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;