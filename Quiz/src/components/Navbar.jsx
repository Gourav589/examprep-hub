import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">ExamPrep Hub</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/exams">Mock Tests</Link>
        <Link to="/jobs">Job Alerts</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;