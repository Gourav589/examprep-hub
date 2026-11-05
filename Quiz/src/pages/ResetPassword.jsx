import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import "./Auth.css";

function ResetPassword() {
  useSeo("Set New Password | ExamPrep Hub", "Set a new password for your ExamPrep Hub account.");

  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (password !== confirm) {
      setMsg({ type: "err", text: "Dono password match nahi karte" });
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      setMsg({ type: "ok", text: data.message });
      setDone(true);
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || err.message });
    }
    setLoading(false);
  };

  return (
    <div className="au-page">
      <div className="au-card">
        <div className="au-side">
          <h2>Naya password set karo</h2>
          <p>Kam se kam 8 akshar ka mazboot password rakho, aur use kisi ko mat batao.</p>
        </div>

        <div className="au-form">
          <h2>Reset Password</h2>

          {msg.text && (
            <div className={msg.type === "ok" ? "au-ok" : "au-error"}>
              {msg.text}
            </div>
          )}

          {done ? (
            <Link to="/login" className="au-btn" style={{ display: "block", textAlign: "center" }}>
              Login karo
            </Link>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>Naya password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <label>Naya password dobara likho</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />

              <button type="submit" className="au-btn" disabled={loading}>
                {loading ? "Please wait..." : "Password badlo"}
              </button>
            </form>
          )}

          <p className="au-switch">
            Link kaam nahi kar raha? <Link to="/forgot-password">Naya link mangao</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;