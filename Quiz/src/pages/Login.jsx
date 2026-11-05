import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Auth.css";

function Login() {
  useSeo("Login | ExamPrep Hub", "Login to your ExamPrep Hub account to take mock tests and track your results.");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user && data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      const info = err.response?.data;
      if (info && info.needsVerification) {
        navigate("/verify-email", { state: { email: info.email || email } });
        return;
      }
      setError(info?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="au-page">
      <div className="au-card">
        <div className="au-side">
          <h2>Welcome back!</h2>
          <p>Login karo aur apni exam preparation wahin se shuru karo jahan chhodi thi.</p>
          <ul className="au-points">
            <li>✔ Free mock tests</li>
            <li>✔ Score aur accuracy ki history</li>
            <li>✔ Latest govt job alerts</li>
          </ul>
        </div>

        <div className="au-form">
          <h2>Login</h2>
          <p className="au-sub">Apne account mein ghusne ke liye details bharo.</p>

          {error && <div className="au-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Apna password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <p style={{ textAlign: "right", margin: "-6px 0 14px", fontSize: "13px" }}>
              <Link to="/forgot-password" style={{ color: "#2563eb" }}>
                Password bhool gaye?
              </Link>
            </p>

            <button type="submit" className="au-btn" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>

          <p className="au-switch">
            Naye ho? <Link to="/signup">Account banao</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;