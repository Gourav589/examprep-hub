import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h3>ExamPrep Hub</h3>
          <p>Govt exams free mock tests or latest job alerts.</p>
        </div>
        <div className="footer-links">
          <Link to="/exams">Mock Tests</Link>
          <Link to="/jobs">Job Alerts</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>
      <p className="footer-copy">© 2026 ExamPrep Hub. All rights reserved.</p>
    </footer>
  );
}

export default Footer;