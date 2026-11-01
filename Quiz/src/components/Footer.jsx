import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h3>ExamPrep Hub</h3>
          <p>Govt exams ke liye free mock tests aur latest job alerts.</p>
        </div>
        <div className="footer-links">
          <Link to="/exams">Mock Tests</Link>
          <Link to="/jobs">Job Alerts</Link>
          <Link to="/membership">Premium</Link>
        </div>
        <div className="footer-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/refund-policy">Refund</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
      <p className="footer-copy">© 2026 ExamPrep Hub. All rights reserved.</p>
    </footer>
  );
}

export default Footer;