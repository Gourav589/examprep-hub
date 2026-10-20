import { Link } from "react-router-dom";
import "./ExamCard.css";

const icons = {
  SSC: "📝",
  Banking: "🏦",
  Railway: "🚆",
  "State Govt": "🏛️",
};

const colors = {
  SSC: "#4f46e5",
  Banking: "#0891b2",
  Railway: "#ea580c",
  "State Govt": "#16a34a",
};

function ExamCard({ exam }) {
  const accent = colors[exam.category] || "#4f46e5";
  const icon = icons[exam.category] || "📚";

  return (
    <div
      className="exam-card category-card"
      style={{
        borderTopColor: accent,
        background: `linear-gradient(160deg, ${accent}33 0%, #ffffff 75%)`,
      }}
    >
      <div className="card-icon" style={{ background: accent + "33" }}>
        {icon}
      </div>
      <span className="badge" style={{ color: accent, background: "white" }}>
        {exam.category}
      </span>
      <h3>{exam.name}</h3>
      <p>{exam.tests} Mock Tests</p>
      <Link
        to={`/exams/${exam._id}`}
        className="card-btn"
        style={{ background: accent }}
      >
        {exam.free ? "Start Free" : "Unlock Premium"}
      </Link>
    </div>
  );
}

export default ExamCard;
