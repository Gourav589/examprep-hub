import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

function Signup() {
  const [name, setName] = useState("");
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
      const { data } = await API.post("/auth/signup", { name, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="au-page">
      <div className="au-card">
        <div className="au-side">
          <h2>Join ExamPrep Hub</h2>
          <p>Ek free account banao aur govt exam ki taiyari ek jagah se karo.</p>
          <ul className="au-points">
            <li>✔ Signup bilkul free</li>
            <li>✔ Timer ke saath real test experience</li>
            <li>✔ Section-wise result analysis</li>
          </ul>
        </div>

        <div className="au-form">
          <h2>Create Account</h2>
    

          {error && <div className="au-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder=" password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="au-btn" disabled={loading}>
              {loading ? "Please wait..." : "Sign Up"}
            </button>
          </form>

          <p className="au-switch">
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;