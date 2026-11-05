import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Auth.css";

function ForgotPassword() {
  useSeo("Forgot Password | ExamPrep Hub", "Reset your ExamPrep Hub password using your email.");

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);
    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      setMsg({ type: "ok", text: data.message });
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || err.message });
    }
    setLoading(false);
  };

  return (
    <div className="au-page">
      <div className="au-card">
        <div className="au-side">
          <h2>Password bhool gaye?</h2>
          <p>Koi baat nahi. Apni email likho, hum aapko password reset ka link bhej denge.</p>
          <ul className="au-points">
            <li>✔ Link 30 minute tak chalta hai</li>
            <li>✔ Link sirf ek baar use hota hai</li>
          </ul>
        </div>

        <div className="au-form">
          <h2>Reset link mangao</h2>
          <p className="au-sub">Wahi email likho jisse account banaya tha.</p>

          {msg.text && (
            <div
              className={msg.type === "ok" ? "au-ok" : "au-error"}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="au-btn" disabled={loading}>
              {loading ? "Please wait..." : "Reset link bhejo"}
            </button>
          </form>

          <p className="au-switch">
            Yaad aa gaya? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;