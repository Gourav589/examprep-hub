import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  let links = [
    { to: "/", label: "Home", icon: "🏠", end: true },
    { to: "/exams", label: "All Tests", icon: "📝" },
    { to: "/jobs", label: "Job Alerts", icon: "📢" },
  ];

  if (user && user.role === "admin") {
    links = [
      { to: "/admin", label: "Dashboard", icon: "🏠", end: true },
      { to: "/admin/exams", label: "Exams", icon: "📝" },
      { to: "/admin/questions", label: "Questions", icon: "❓" },
      { to: "/admin/students", label: "Students", icon: "👨‍🎓" },
      { to: "/admin/jobs", label: "Job Alerts", icon: "📢" },
    ];
  } else if (user) {
    links.splice(2, 0, { to: "/my-results", label: "My Attempts", icon: "📊" });
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onClose();
    navigate("/login");
  };

  return (
    <aside className={"sidebar" + (open ? " open" : "")}>
      <div className="sidebar-top">
        <div className="sidebar-brand">ExamPrep Hub</div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
          ✕
        </button>
      </div>

      <nav>
        {links.map((l) => (
          <NavLink
            key={l.label}
            to={l.to}
            end={l.end}
            onClick={onClose}
            className={({ isActive }) => "side-link" + (isActive ? " active" : "")}
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        {user ? (
          <>
            <p className="side-hello">Hi, {user.name}</p>
            <button className="side-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={onClose} className="side-login">Login</Link>
            <Link to="/signup" onClick={onClose} className="side-signup">Sign Up</Link>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;