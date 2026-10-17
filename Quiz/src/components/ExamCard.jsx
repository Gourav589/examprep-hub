import { Link } from "react-router-dom";
import "./ExamCard.css";

function ExamCard({ exam }) {
  return (
    <div className="exam-card">
      <span className="badge">{exam.category}</span>
      <h3>{exam.name}</h3>
      <p>{exam.tests} Mock Tests</p>
       <Link to={`/exams/${exam._id}`} className="card-btn">
        {exam.free ? "Start Free" : "Unlock Premium"}
      </Link>
    </div>
  );
}

export default ExamCard;