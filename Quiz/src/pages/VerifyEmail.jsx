import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Auth.css";

function VerifyEmail() {
  useSeo("Verify Email | ExamPrep Hub", "Verify your email to activate your ExamPrep Hub account.");

  const { state } = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(state?.email || "");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(state?.email ? 60 : 0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);
    try {
      const { data } = await API.post("/auth/verify-email", { email, code: code.trim() });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || err.message });
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMsg({ type: "", text: "" });
    try {
      const { data } = await API.post("/auth/resend-code", { email });
      setMsg({ type: "ok", text: data.message });
      setCooldown(60);
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="au-page">
      <div className="au-card">
        <div className="au-side">
          <h2>Email verify karo</h2>
          <p>Humne aapki email par 6 ank ka code bheja hai. Wo code yahan daalo.</p>
          <ul className="au-points">
            <li>✔ Code 15 minute tak chalta hai</li>
            <li>✔ Spam folder bhi dekh lena</li>
          </ul>
        </div>

        <div className="au-form">
          <h2>Verification code</h2>
          <p className="au-sub">{email ? `Code ${email} par gaya hai.` : "Apni email likho."}</p>

          {msg.text && (
            <div className={msg.type === "ok" ? "au-ok" : "au-error"}>{msg.text}</div>
          )}

          <form onSubmit={handleVerify}>
            {!state?.email && (
              <>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </>
            )}

            <label>6 ank ka code</label>
            <input
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              style={{ letterSpacing: "6px", fontSize: "20px", textAlign: "center" }}
              required
            />

            <button type="submit" className="au-btn" disabled={loading || code.length !== 6}>
              {loading ? "Please wait..." : "Verify karo"}
            </button>
          </form>

          <p className="au-switch">
            Code nahi mila?{" "}
            {cooldown > 0 ? (
              <span>{cooldown} second baad dobara bhej sakte ho</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={!email}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Code dobara bhejo
              </button>
            )}
          </p>

          <p className="au-switch">
            <Link to="/login">Login par wapas jao</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;