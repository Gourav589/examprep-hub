import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./AdminReports.css";

const REASONS = {
  wrong_answer: "Sahi jawab galat hai",
  wrong_question: "Question galat ya adhoora hai",
  typo: "Spelling ya typing ki galti",
  other: "Kuch aur",
};

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    API.get("/reports/admin")
      .then((res) => setReports(res.data))
      .catch((err) => setMessage(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (report) => {
    const q = report.question;
    setEditingId(report._id);
    setForm({
      id: q._id,
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      section: q.section,
      testNumber: q.testNumber,
      explanation: q.explanation || "",
    });
  };

  const setOption = (i, value) => {
    const options = [...form.options];
    options[i] = value;
    setForm({ ...form, options });
  };

  const save = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.put(`/questions/${form.id}`, {
        question: form.question,
        options: form.options,
        correctIndex: form.correctIndex,
        section: form.section,
        testNumber: form.testNumber,
        explanation: form.explanation,
      });
      setMessage("Question theek ho gaya, report band ho gayi");
      setEditingId(null);
      setForm(null);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const resolve = async (id) => {
    try {
      await API.patch(`/reports/${id}/resolve`);
      setMessage("Report band kar di gayi");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="section">
      <h1>Question Reports ({reports.length})</h1>
      <Link to="/admin" className="card-btn">Back to Admin Panel</Link>

      {message && <p className="ar-msg">{message}</p>}
      {loading && <p>Loading...</p>}
      {!loading && reports.length === 0 && (
        <p style={{ marginTop: "16px" }}>Koi open report nahi hai. Sab theek hai!</p>
      )}

      {reports.map((r) => (
        <div key={r._id} className="exam-card ar-card">
          <p className="ar-meta">
            {r.exam} | Test {r.question.testNumber} | {r.question.section} | Reporter: {r.reporter} |{" "}
            {new Date(r.createdAt).toLocaleDateString()}
          </p>

          <p className="ar-reason">
            🚩 {REASONS[r.reason] || r.reason}
            {r.note && <span>: {r.note}</span>}
          </p>

          <h3>{r.question.question}</h3>
          {r.question.options.map((opt, i) => (
            <p key={i} style={{ color: i === r.question.correctIndex ? "#16a34a" : "#6b7280" }}>
              {i === r.question.correctIndex ? "✔ " : ""}{opt}
            </p>
          ))}
          {r.question.explanation && (
            <p className="ar-expl">Samjho: {r.question.explanation}</p>
          )}

          {editingId === r._id && form ? (
            <form onSubmit={save} className="ar-form">
              <label>Question</label>
              <input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                required
              />
              {form.options.map((opt, i) => (
                <div key={i}>
                  <label>Option {i + 1}</label>
                  <input value={opt} onChange={(e) => setOption(i, e.target.value)} required />
                </div>
              ))}
              <label>Sahi option</label>
              <select
                value={form.correctIndex}
                onChange={(e) => setForm({ ...form, correctIndex: e.target.value })}
              >
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
                <option value={2}>Option 3</option>
                <option value={3}>Option 4</option>
              </select>
              <label>Explanation</label>
              <textarea
                rows={3}
                maxLength={1000}
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              />
              <div className="ar-actions">
                <button type="submit" className="ar-save">Save aur report band karo</button>
                <button
                  type="button"
                  className="ar-cancel"
                  onClick={() => {
                    setEditingId(null);
                    setForm(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="ar-actions">
              <button className="ar-edit" onClick={() => startEdit(r)}>Question theek karo</button>
              <button className="ar-ok" onClick={() => resolve(r._id)}>Galti nahi hai, band karo</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminReports;