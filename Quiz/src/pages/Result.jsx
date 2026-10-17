import { useLocation, Link, useParams } from "react-router-dom";

function Result() {
  const { state } = useLocation();
  const { id } = useParams();

  if (!state) {
    return (
      <div className="section">
        <p>Koi result nahi mila.</p>
        <Link to="/" className="card-btn">Home</Link>
      </div>
    );
  }

  const accuracy = state.total
    ? Math.round((state.correct / state.total) * 100)
    : 0;

  return (
    <div className="section">
      <h1>Your Result</h1>
      <h2>Score: {state.score} / {state.total}</h2>
      <p>Correct: {state.correct} | Wrong: {state.wrong} | Skipped: {state.skipped}</p>
      <p>Accuracy: {accuracy}%</p>

      <h3 style={{ marginTop: "20px" }}>Section-wise</h3>
      {Object.entries(state.sections).map(([name, s]) => (
        <p key={name}>{name}: {s.correct} / {s.total}</p>
      ))}

      <h3 style={{ marginTop: "20px" }}>Review</h3>
      {state.review.map((r, i) => (
        <div key={i} style={{ marginBottom: "15px" }}>
          <p><b>{i + 1}. {r.question}</b></p>
          <p>Your answer: {r.picked === null ? "Skipped" : r.options[r.picked]}</p>
          <p>Correct answer: {r.options[r.correctIndex]}</p>
        </div>
      ))}

      <Link to={`/exams/${id}`} className="card-btn">Back to Exam</Link>
    </div>
  );
}

export default Result;