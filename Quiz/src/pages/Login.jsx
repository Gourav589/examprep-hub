import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import { SITE } from "../config/site";
import "./Login.css";

const REMEMBER_KEY = "rememberedEmail";

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function EyeIcon({ off }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}

function LogoMark() {
  return (
    <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
      <polygon points="29,5 55,17 29,29 3,17" fill="#3b82f6" />
      <path d="M13 24v10c0 9 7 15 16 19 9-4 16-10 16-19V24" stroke="#60a5fa" strokeWidth="3" strokeLinejoin="round" />
      <polyline points="14,38 22,38 26,30 31,47 36,35 44,35" stroke="#bfdbfe" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="53" y1="18" x2="53" y2="30" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function PointIcon({ type }) {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "#60a5fa", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "target") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="#60a5fa" />
      </svg>
    );
  }
  if (type === "chart") {
    return (
      <svg {...common}>
        <rect x="4" y="13" width="3.5" height="7" />
        <rect x="10.2" y="8" width="3.5" height="12" />
        <rect x="16.5" y="4" width="3.5" height="16" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M13 2L5 14h6l-1 8 8-12h-6l1-8z" fill="#60a5fa" />
    </svg>
  );
}

function Illustration() {
  return (
    <svg viewBox="0 0 440 240" role="img" aria-label="Mock test illustration">
      {/* plant */}
      <ellipse cx="392" cy="120" rx="14" ry="42" fill="#15803d" transform="rotate(-18 392 150)" />
      <ellipse cx="410" cy="128" rx="13" ry="38" fill="#166534" transform="rotate(14 410 160)" />
      <ellipse cx="376" cy="140" rx="11" ry="30" fill="#22c55e" transform="rotate(-38 376 170)" />
      <path d="M380 196h46l-6 34h-34z" fill="#c7d2fe" />

      {/* laptop */}
      <rect x="150" y="30" width="236" height="150" rx="10" fill="#0b1b4d" stroke="#3b82f6" strokeWidth="2" />
      <rect x="168" y="46" width="200" height="12" rx="6" fill="#1e3a8a" />
      <text x="300" y="56" fill="#7dd3fc" fontSize="12" fontFamily="Arial">00:42:17</text>
      <rect x="170" y="68" width="196" height="96" rx="8" fill="#e8edff" />
      <rect x="184" y="78" width="120" height="6" rx="3" fill="#a5b4fc" />
      <rect x="184" y="90" width="80" height="6" rx="3" fill="#c7d2fe" />
      <g fontFamily="Arial" fontSize="11" fill="#334155">
        <circle cx="190" cy="108" r="5" fill="none" stroke="#94a3b8" />
        <text x="202" y="112">A</text>
        <circle cx="190" cy="124" r="5" fill="#2563eb" />
        <circle cx="190" cy="124" r="2" fill="white" />
        <text x="202" y="128">B</text>
        <circle cx="190" cy="140" r="5" fill="none" stroke="#94a3b8" />
        <text x="202" y="144">C</text>
        <circle cx="190" cy="156" r="5" fill="none" stroke="#94a3b8" />
        <text x="202" y="160">D</text>
      </g>
      <path d="M130 180h276l-10 14H140z" fill="#1e3a8a" />
      <rect x="120" y="192" width="296" height="8" rx="4" fill="#3b82f6" />

      {/* books */}
      <rect x="20" y="150" width="150" height="30" rx="5" fill="#2563eb" />
      <rect x="20" y="150" width="150" height="6" rx="3" fill="#60a5fa" />
      <text x="44" y="172" fill="white" fontSize="15" fontWeight="700" fontFamily="Arial" letterSpacing="1">LEARN</text>

      <rect x="12" y="182" width="165" height="30" rx="5" fill="#3b50d6" />
      <rect x="12" y="182" width="165" height="6" rx="3" fill="#7c8cf0" />
      <text x="34" y="204" fill="white" fontSize="15" fontWeight="700" fontFamily="Arial" letterSpacing="1">PRACTICE</text>

      <rect x="6" y="214" width="180" height="26" rx="5" fill="#5b3fd0" />
      <rect x="6" y="214" width="180" height="6" rx="3" fill="#8b73e8" />
      <text x="30" y="233" fill="white" fontSize="14" fontWeight="700" fontFamily="Arial" letterSpacing="1">ACHIEVE</text>
    </svg>
  );
}

function Login() {
  useSeo(
    "Login | ExamPrep Hub",
    "Login to your ExamPrep Hub account to take mock tests and track your results."
  );

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [brandFirst, ...brandRest] = SITE.name.split(" ");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) setEmail(saved);
    } catch {
      // storage band ho to koi baat nahi
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (remember) {
        localStorage.setItem(REMEMBER_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      navigate(data.user && data.user.role === "admin" ? "/admin" : "/");
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
    <div className="lp-page">
      <div className="lp-card">
        <div className="lp-left">
          <div className="lp-brand">
            <LogoMark />
            <div>
              <h2>
                {brandFirst} <span>{brandRest.join(" ")}</span>
              </h2>
              <small>Practice · Prepare · Perform</small>
            </div>
          </div>

          <div className="lp-hero">
            <h1>
              Your Mock Tests.
              <br />
              Your <span>Success.</span>
            </h1>
            <p>Take mock tests, track your progress and get closer to your dream.</p>
          </div>

          <ul className="lp-points">
            <li><PointIcon type="target" /> Real Exam Pattern</li>
            <li><PointIcon type="chart" /> Detailed Performance Analysis</li>
            <li><PointIcon type="bolt" /> Improve &amp; Succeed</li>
          </ul>

          <div className="lp-art">
            <Illustration />
          </div>
        </div>

        <div className="lp-right">
          <div className="lp-script">Better Tests Brighter Future</div>

          <h2>Welcome Back!</h2>
          <p className="lp-sub">
            Log in to your {SITE.name} account and continue your mock test journey.
          </p>

          {error && <div className="lp-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="lp-field">
              <span className="lp-ico"><UserIcon /></span>
              <input
                type="email"
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="lp-field">
              <span className="lp-ico"><LockIcon /></span>
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                aria-label="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="lp-eye"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Password chhupao" : "Password dikhao"}
              >
                <EyeIcon off={!showPw} />
              </button>
            </div>

            <div className="lp-row">
              <label className="lp-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Email yaad rakho
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="lp-btn" disabled={loading}>
              {loading ? "Please wait..." : "Log In  →"}
            </button>
          </form>

          <p className="lp-switch">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;