import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./TestPage.css";

const TOTAL_SECONDS = 10 * 60;

function TestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [error, setError] = useState("");

 useEffect(() => {
  API.get(`/questions/exam/${id}`)
    .then((res) => setQuestions(res.data))
    .catch((err) => setError(err.response?.data?.message || err.message))
    .finally(() => setLoading(false));
}, [id]);
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
  try {
    const { data } = await API.post(`/questions/exam/${id}/submit`, {
      testNumber: 1,
      answers,
    });
    navigate(`/exams/${id}/result`, { state: data });
  } catch (err) {
    setError(err.message);
  }
};

useEffect(() => {
  if (timeLeft <= 0) handleSubmit();
}, [timeLeft]);

  const formatTime = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (error) return <div className="test-wrapper"><p>{error}</p></div>;
  if (questions.length === 0) return <div className="test-wrapper"><p>Loading...</p></div>;

  const q = questions[current];

  const selectOption = (index) => {
    setAnswers({ ...answers, [q._id]: index });
  };

  return (
    <div className="test-wrapper">
      <div className="test-header">
        <span>Question {current + 1} of {questions.length}</span>
        <span className="timer">{formatTime(timeLeft)}</span>
      </div>

      <div className="test-body">
        <div className="question-box">
          <p className="section-tag">{q.section}</p>
          <h3>{q.question}</h3>

          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`option ${answers[q._id] === i ? "selected" : ""}`}
              onClick={() => selectOption(i)}
            >
              {opt}
            </button>
          ))}

          <div className="nav-buttons">
            <button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
              Previous
            </button>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent(current + 1)}>Next</button>
            ) : (
              <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            )}
          </div>
        </div>

        <div className="palette">
          <h4>Question Palette</h4>
          <div className="palette-grid">
            {questions.map((item, i) => (
              <button
                key={item._id}
                className={`palette-btn ${answers[item._id] !== undefined ? "answered" : ""} ${i === current ? "active" : ""}`}
                onClick={() => setCurrent(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestPage;