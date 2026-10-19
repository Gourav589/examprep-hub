import { Link } from "react-router-dom";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="section">
      <h1>Admin Panel</h1>
      <p>Welcome, {user?.name}</p>

      <div className="exam-grid" style={{ marginTop: "20px" }}>
        <Link to="/admin/exams" style={{ color: "inherit" }}>
          <div className="exam-card">
            <h3>Manage Exams</h3>
            <p>Naye exam add karna aur delete karna</p>
          </div>
        </Link>

        <Link to="/admin/questions" style={{ color: "inherit" }}>
          <div className="exam-card">
            <h3>Manage Questions</h3>
            <p>Questions add karna aur delete karna</p>
          </div>
        </Link>

        <Link to="/admin/students" style={{ color: "inherit" }}>
          <div className="exam-card">
            <h3>Students</h3>
            <p>Students, tests aur accuracy dekhna</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;