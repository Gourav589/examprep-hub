import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function AdminExams() {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", tests: 0, free: true });
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
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/exams", form);
      setForm({ name: "", category: "", tests: 0, free: true });
      setMessage("Exam added");
      loadExams();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its questions?`)) return;
    try {
      await API.delete(`/exams/${id}`);
      setMessage("Exam deleted");
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

      <div className="auth-box" style={{ margin: "20px 0", maxWidth: "500px" }}>
        <h2>Add New Exam</h2>
        <form onSubmit={handleAdd}>
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
            placeholder="Number of mock tests"
            value={form.tests}
            onChange={handleChange}
          />
          <label style={{ display: "block", marginBottom: "15px" }}>
            <input
              name="free"
              type="checkbox"
              checked={form.free}
              onChange={handleChange}
              style={{ width: "auto", marginRight: "8px" }}
            />
            Free exam
          </label>
          <button type="submit">Add Exam</button>
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
          }}
        >
          <div>
            <h3>{exam.name}</h3>
            <p>
              {exam.category} | {exam.tests} tests | {exam.free ? "Free" : "Premium"}
            </p>
          </div>
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
      ))}
    </div>
  );
}

export default AdminExams;