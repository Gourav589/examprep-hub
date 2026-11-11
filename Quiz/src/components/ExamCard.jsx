import { Link } from "react-router-dom";
import "./ExamCard.css";

const icons = {
  SSC: "📝",
  Banking: "🏦",
  Railway: "🚆",
  "State Govt": "🏛️",
  UPSC: "⚖️",
  Defence: "🎖️",
  Teaching: "🎓",
  "HP State": "🏔️",
  Computer: "💻",
};

const colors = {
  SSC: "#4f46e5",
  Banking: "#0891b2",
  Railway: "#ea580c",
  "State Govt": "#16a34a",
  UPSC: "#be123c",
  Defence: "#475569",
  Teaching: "#a16207",
  "HP State": "#0d9488",
  Computer: "#0284c7",
};

// Computer ke topic ke hisaab se icon (javascript ko java se pehle rakha hai)
const topicIcons = [
  ["javascript", "🟨"],
  ["java", "☕"],
  ["c++", "⚙️"],
  ["c programming", "🔧"],
  ["python", "🐍"],
  ["html", "🌐"],
  ["sql", "🗄️"],
  ["excel", "📊"],
  ["powerpoint", "📽️"],
  ["word", "📄"],
  ["internet", "📧"],
  ["network", "🔌"],
  ["operating", "🖥️"],
  ["data structures", "🧩"],
  ["awareness", "🧠"],
  ["ccc", "🎓"],
];

function pickIcon(exam) {
  if (exam.category === "Computer") {
    const name = exam.name.toLowerCase();
    const hit = topicIcons.find(([key]) => name.includes(key));
    if (hit) return hit[1];
  }
  return icons[exam.category] || "📚";
}

function ExamCard({ exam }) {
  const accent = colors[exam.category] || "#4f46e5";
  const icon = pickIcon(exam);

  const comingSoon = !exam.tests || exam.tests <= 0;
  const freeTests = typeof exam.freeTests === "number" ? exam.freeTests : 1;

  return (
    <div
      className="exam-card category-card"
      style={{
        borderTopColor: accent,
        background: `linear-gradient(160deg, ${accent}44 0%, ${accent}1f 100%)`,
        opacity: comingSoon ? 0.85 : 1,
      }}
    >
      <div className="card-icon" style={{ background: accent + "44" }}>
        {icon}
      </div>
      <span className="badge" style={{ color: accent, background: accent + "22" }}>
        {exam.category}
      </span>
      <h3>{exam.name}</h3>
      <p>
        {comingSoon
          ? "Tests jald aa rahe hain"
          : `${exam.tests} Mock Tests${freeTests > 0 ? ` | ${freeTests === 1 ? "Test 1 free" : `${freeTests} free`}` : ""}`}
      </p>
      <Link
        to={`/exams/${exam._id}`}
        className="card-btn"
        style={{ background: comingSoon ? "#64748b" : accent }}
      >
        {comingSoon ? "Jald aa raha hai" : "Tests dekho"}
      </Link>
    </div>
  );
}

export default ExamCard;