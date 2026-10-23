import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";
import useSeo from "../hooks/useSeo";
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
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="au-page">
      <div className="au-card">
        <div className="au-side">
          <h2>Welcome back!</h2>

          <ul className="au-points">
            <li>✔ Free mock tests</li>
            <li>✔ Score aur accuracy ki history</li>
            <li>✔ Latest govt job alerts</li>
          </ul>
        </div>

        <div className="au-form">
          <h2>Login</h2>
         

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

            <button type="submit" className="au-btn" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>

          <p className="au-switch">
             <Link to="/signup">Create Account </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;