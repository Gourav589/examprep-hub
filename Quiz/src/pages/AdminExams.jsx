import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const emptyForm = {
  name: "",
  category: "",
  tests: 0,
  freeTests: 1,
  durationMinutes: 10,
  negativeMarking: 0,
};

function AdminExams() {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadExams = () => {
    API.get("/exams")
      .then((res) => setExams(res.data))
      .catch((err) => setMessage(err.message));
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await API.put(`/exams/${editingId}`, form);
        setMessage("Exam update ho gaya");
      } else {
        await API.post("/exams", form);
        setMessage("Exam add ho gaya");
      }
      setForm(emptyForm);
      setEditingId(null);
      loadExams();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const startEdit = (exam) => {
    setEditingId(exam._id);
    setForm({
      name: exam.name,
      category: exam.category,
      tests: exam.tests,
      freeTests: typeof exam.freeTests === "number" ? exam.freeTests : 1,
      durationMinutes: exam.durationMinutes || 10,
      negativeMarking: exam.negativeMarking || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its questions?`)) return;
    try {
      await API.delete(`/exams/${id}`);
      setMessage("Exam delete ho gaya");
      loadExams();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="section">
      <h1>Manage Exams</h1>
      <Link to="/admin" className="card-btn">Back to Admin Panel</Link>

      {message && <p style={{ margin: "15px 0", color: "#4f46e5" }}>{message}</p>}

      <div className="auth-box" style={{ margin: "20px 0", maxWidth: "520px" }}>
        <h2>{editingId ? "Exam edit karo" : "Add New Exam"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Exam name (e.g. UPSC Prelims)"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="category"
            placeholder="Category (e.g. SSC, Banking)"
            value={form.category}
            onChange={handleChange}
            required
          />
          <input
            name="tests"
            type="number"
            min="0"
            placeholder="Number of mock tests (card par dikhega)"
            value={form.tests}
            onChange={handleChange}
          />
          <label style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
            Pehle kitne tests free (baaki premium)
          </label>
          <input
            name="freeTests"
            type="number"
            min="0"
            max="100"
            value={form.freeTests}
            onChange={handleChange}
          />
          <input
            name="durationMinutes"
            type="number"
            min="1"
            max="300"
            placeholder="Har test ka time (minute)"
            value={form.durationMinutes}
            onChange={handleChange}
          />
          <select
            name="negativeMarking"
            value={form.negativeMarking}
            onChange={handleChange}
            style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
          >
            <option value={0}>Negative marking nahi</option>
            <option value={0.25}>0.25 per galat jawab</option>
            <option value={0.33}>0.33 per galat jawab</option>
            <option value={0.5}>0.5 per galat jawab</option>
            <option value={1}>1 per galat jawab</option>
          </select>
          <button type="submit">{editingId ? "Save Changes" : "Add Exam"}</button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{ marginTop: "10px", background: "#64748b" }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <h2 style={{ marginBottom: "15px" }}>All Exams ({exams.length})</h2>
      {exams.map((exam) => (
        <div
          key={exam._id}
          className="exam-card"
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3>{exam.name}</h3>
            <p>
              {exam.category} | {exam.tests} tests |{" "}
              {typeof exam.freeTests === "number" ? exam.freeTests : 1} free |{" "}
              {exam.durationMinutes || 10} min |{" "}
              {exam.negativeMarking ? `-${exam.negativeMarking} negative` : "no negative"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => startEdit(exam)}
              style={{
                padding: "8px 16px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(exam._id, exam.name)}
              style={{
                padding: "8px 16px",
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
        </div>
      ))}
    </div>
  );
}

export default AdminExams;