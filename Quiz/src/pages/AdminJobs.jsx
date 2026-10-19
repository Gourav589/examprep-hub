import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const emptyForm = { title: "", organization: "", lastDate: "", eligibility: "", link: "" };

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const loadJobs = () => {
    API.get("/jobs")
      .then((res) => setJobs(res.data))
      .catch((err) => setMessage(err.message));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/jobs", form);
      setForm(emptyForm);
      setMessage("Job added");
      loadJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await API.delete(`/jobs/${id}`);
      setMessage("Job deleted");
      loadJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="section">
      <h1>Manage Job Alerts</h1>
      <Link to="/admin" className="card-btn">Back to Admin Panel</Link>

      {message && <p style={{ margin: "15px 0", color: "#4f46e5" }}>{message}</p>}

      <div className="auth-box" style={{ margin: "20px 0", maxWidth: "500px" }}>
        <h2>Add Job</h2>
        <form onSubmit={handleAdd}>
          <input name="title" placeholder="Job title (e.g. SSC CGL 2026)" value={form.title} onChange={handleChange} required />
          <input name="organization" placeholder="Organization (e.g. SSC)" value={form.organization} onChange={handleChange} required />
          <input name="lastDate" type="date" value={form.lastDate} onChange={handleChange} required />
          <input name="eligibility" placeholder="Eligibility (e.g. Graduate)" value={form.eligibility} onChange={handleChange} />
          <input name="link" placeholder="Official link (https://...)" value={form.link} onChange={handleChange} />
          <button type="submit">Add Job</button>
        </form>
      </div>

      <h2 style={{ marginBottom: "15px" }}>All Jobs ({jobs.length})</h2>
      {jobs.map((job) => (
        <div
          key={job._id}
          className="exam-card"
          style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <h3>{job.title}</h3>
            <p>{job.organization} | Last date: {new Date(job.lastDate).toLocaleDateString()}</p>
          </div>
          <button
            onClick={() => handleDelete(job._id)}
            style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminJobs;