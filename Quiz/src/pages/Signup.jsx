import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Auth.css";

function Signup() {
  useSeo("Create Free Account | ExamPrep Hub", "Sign up free and start practicing govt exam mock tests today.");

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
      navigate("/verify-email", { state: { email: data.email || email } });
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
          <p className="au-sub">Sirf 1 minute mein shuru karo.</p>

          {error && <div className="au-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Aapka naam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password (kam se kam 8 akshar)</label>
            <input
              type="password"
              placeholder="Mazboot password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="au-btn" disabled={loading}>
              {loading ? "Please wait..." : "Sign Up"}
            </button>
          </form>

          <p className="au-terms">
            Sign up karke aap hamari <Link to="/terms">Terms</Link> aur{" "}
            <Link to="/privacy">Privacy Policy</Link> se sehmat hote ho.
          </p>

          <p className="au-switch">
            Pehle se account hai? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;