import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  const loadStudents = () => {
    API.get("/admin/students")
      .then((res) => setStudents(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleToggle = async (id) => {
    try {
      await API.patch(`/admin/students/${id}/premium`);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="section">
      <h1>Students ({students.length})</h1>
      <Link to="/admin" className="card-btn">Back to Admin Panel</Link>

      {error && <p style={{ color: "red", margin: "15px 0" }}>{error}</p>}

      <div style={{ marginTop: "20px", overflowX: "auto" }}>
        <table style={{ width: "100%", background: "white", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#e0e7ff" }}>
              <th style={{ padding: "10px" }}>Name</th>
              <th style={{ padding: "10px" }}>Email</th>
              <th style={{ padding: "10px" }}>Tests</th>
              <th style={{ padding: "10px" }}>Accuracy</th>
              <th style={{ padding: "10px" }}>Plan</th>
              <th style={{ padding: "10px" }}>Joined</th>
              <th style={{ padding: "10px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px" }}>{s.name}</td>
                <td style={{ padding: "10px" }}>{s.email}</td>
                <td style={{ padding: "10px" }}>{s.attempts}</td>
                <td style={{ padding: "10px" }}>{s.accuracy}%</td>
                <td style={{ padding: "10px" }}>{s.isPremium ? "Premium" : "Free"}</td>
                <td style={{ padding: "10px" }}>
                  {new Date(s.joined).toLocaleDateString()}
                </td>
                <td style={{ padding: "10px" }}>
                  <button
                    onClick={() => handleToggle(s._id)}
                    style={{
                      padding: "6px 12px",
                      background: s.isPremium ? "#ef4444" : "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    {s.isPremium ? "Remove Premium" : "Make Premium"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && !error && (
          <p style={{ marginTop: "15px" }}>Abhi koi student nahi hai.</p>
        )}
      </div>
    </div>
  );
}

export default AdminStudents;