import { Link } from "react-router-dom";
import usePremium from "../hooks/usePremium";
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
  const premium = usePremium();
  const accent = colors[exam.category] || "#4f46e5";
  const icon = icons[exam.category] || "📚";

  const canOpen = exam.free || premium;
  const label = exam.free ? "Start Free" : premium ? "Start Premium" : "Unlock Premium";

  return (
    <div
      className="exam-card category-card"
      style={{
        borderTopColor: accent,
        background: `linear-gradient(160deg, ${accent}44 0%, ${accent}1f 100%)`,
      }}
    >
      <div className="card-icon" style={{ background: accent + "44" }}>
        {icon}
      </div>
      <span className="badge" style={{ color: accent, background: accent + "22" }}>
        {exam.category}
      </span>
      <h3>{exam.name}</h3>
      <p>{exam.tests} Mock Tests</p>
      <Link
        to={canOpen ? `/exams/${exam._id}` : "/membership"}
        className="card-btn"
        style={{ background: accent }}
      >
        {label}
      </Link>
    </div>
  );
}

export default ExamCard;