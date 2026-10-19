import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png";
function Navbar() {
  const navigate = useNavigate();
  useLocation(); // page badalne par Navbar dobara render hota hai

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
   <Link to="/" className="logo">
  <img src={logo} alt="ExamPrep Hub" className="logo-img" />
 
</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/exams">Mock Tests</Link>
        <Link to="/jobs">Job Alerts</Link>

        {user && user.role === "admin" && <Link to="/admin">Admin Panel</Link>}
        {user && user.role !== "admin" && <Link to="/my-results">My Results</Link>}

        {user ? (
          <>
            <span className="user-name">Hi, {user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
