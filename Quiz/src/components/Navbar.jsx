import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  useLocation(); // page badalne par Navbar dobara render hota hai

  const user = JSON.parse(localStorage.getItem("user"));

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/exams?search=${encodeURIComponent(q)}` : "/exams");
    setQuery("");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">ExamPrep Hub</Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/exams">Mock Tests</Link>
        <Link to="/jobs">Job Alerts</Link>

        {user && user.role === "admin" && <Link to="/admin">Admin Panel</Link>}
        {user && user.role !== "admin" && <Link to="/my-results">My Results</Link>}

        <form className="nav-search" onSubmit={handleSearch}>
          <input
            placeholder=" search Box"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        {user ? (
          <button className="user-chip" onClick={onMenuClick}>
            {user.name} <span className="chip-arrow">▼</span>
          </button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <button className="user-chip" onClick={onMenuClick} aria-label="Open menu">
              ☰
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;