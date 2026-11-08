import { Link } from "react-router-dom";
import usePremium from "../hooks/usePremium";
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
};

function ExamCard({ exam }) {
  const premium = usePremium();
  const accent = colors[exam.category] || "#4f46e5";
  const icon = icons[exam.category] || "📚";

  const comingSoon = !exam.tests || exam.tests <= 0;
  const canOpen = exam.free || premium;

  let label = "Start Free";
  if (comingSoon) label = "Jald aa raha hai";
  else if (!exam.free) label = premium ? "Start Premium" : "Unlock Premium";

  const target = !comingSoon && !canOpen ? "/membership" : `/exams/${exam._id}`;

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
      <p>{comingSoon ? "Tests jald aa rahe hain" : `${exam.tests} Mock Tests`}</p>
      <Link
        to={target}
        className="card-btn"
        style={{ background: comingSoon ? "#64748b" : accent }}
      >
        {label}
      </Link>
    </div>
  );
}

export default ExamCard;