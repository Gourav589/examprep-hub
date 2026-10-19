import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const emptyForm = {
  testNumber: 1,
  section: "",
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
};

function AdminQuestions() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/exams")
      .then((res) => {
        setExams(res.data);
        if (res.data.length > 0) setExamId(res.data[0]._id);
      })
      .catch((err) => setMessage(err.message));
  }, []);

  const loadQuestions = (id) => {
    if (!id) return;
    API.get(`/questions/admin/exam/${id}`)
      .then((res) => setQuestions(res.data))
      .catch((err) => setMessage(err.response?.data?.message || err.message));
  };

  useEffect(() => {
    loadQuestions(examId);
  }, [examId]);

  const setOption = (index, value) => {
    const options = [...form.options];
    options[index] = value;
    setForm({ ...form, options });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/questions", { ...form, exam: examId });
      setForm({ ...emptyForm, testNumber: form.testNumber, section: form.section });
      setMessage("Question added");
      loadQuestions(examId);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await API.delete(`/questions/${id}`);
      setMessage("Question deleted");
      loadQuestions(examId);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="section">
      <h1>Manage Questions</h1>
      <Link to="/admin" className="card-btn">Back to Admin Panel</Link>

      {message && <p style={{ margin: "15px 0", color: "#4f46e5" }}>{message}</p>}

      <div className="auth-box" style={{ margin: "20px 0", maxWidth: "600px" }}>
        <h2>Add Question</h2>

        <select
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
        >
          {exams.map((ex) => (
            <option key={ex._id} value={ex._id}>{ex.name}</option>
          ))}
        </select>

        <form onSubmit={handleAdd}>
          <input
            type="number"
            min="1"
            placeholder="Test number (1, 2, 3...)"
            value={form.testNumber}
            onChange={(e) => setForm({ ...form, testNumber: e.target.value })}
          />
          <input
            placeholder="Section (Maths, Reasoning, English...)"
            value={form.section}
            onChange={(e) => setForm({ ...form, section: e.target.value })}
          />
          <input
            placeholder="Question"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
          />
          {form.options.map((opt, i) => (
            <input
              key={i}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              required
            />
          ))}
          <select
            value={form.correctIndex}
            onChange={(e) => setForm({ ...form, correctIndex: e.target.value })}
            style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
          >
            <option value={0}>Correct answer: Option 1</option>
            <option value={1}>Correct answer: Option 2</option>
            <option value={2}>Correct answer: Option 3</option>
            <option value={3}>Correct answer: Option 4</option>
          </select>
          <button type="submit" disabled={!examId}>Add Question</button>
        </form>
      </div>

      <h2 style={{ marginBottom: "15px" }}>Questions ({questions.length})</h2>
      {questions.map((q, i) => (
        <div key={q._id} className="exam-card" style={{ marginBottom: "12px" }}>
          <p style={{ color: "#4f46e5", fontSize: "13px" }}>
            Test {q.testNumber} | {q.section}
          </p>
          <h3>{i + 1}. {q.question}</h3>
          {q.options.map((opt, idx) => (
            <p key={idx} style={{ color: idx === q.correctIndex ? "#16a34a" : "#6b7280" }}>
              {idx === q.correctIndex ? "✔ " : ""}{opt}
            </p>
          ))}
          <button
            onClick={() => handleDelete(q._id)}
            style={{
              marginTop: "10px",
              padding: "6px 14px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminQuestions;