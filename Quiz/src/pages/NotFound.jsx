import { Link } from "react-router-dom";
import useSeo from "../hooks/useSeo";

function NotFound() {
  useSeo("Page not found | ExamPrep Hub", "This page does not exist.");

  return (
    <div className="section" style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1 style={{ fontSize: "72px", color: "#2563eb" }}>404</h1>
      <h2>Yeh page nahi mila</h2>
      <p style={{ color: "#64748b", margin: "10px 0 22px" }}>
        Jo link aap dhoondh rahe ho wo hata diya gaya hai ya galat likha gaya hai.
      </p>
      <Link to="/" className="card-btn">Home par jao</Link>
    </div>
  );
}

export default NotFound;