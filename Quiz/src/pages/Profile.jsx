import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Profile.css";

function Profile() {
  const stored = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState(stored ? stored.name : "");
  const [nameMsg, setNameMsg] = useState({ type: "", text: "" });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

  if (!stored) {
    return (
      <div className="section">
        <p>Profile dekhne ke liye pehle login karo.</p>
        <Link to="/login" className="card-btn">Login</Link>
      </div>
    );
  }

  const saveName = async (e) => {
    e.preventDefault();
    setNameMsg({ type: "", text: "" });
    try {
      const { data } = await API.put("/auth/profile", { name });
      localStorage.setItem("user", JSON.stringify({ ...stored, name: data.name }));
      setNameMsg({ type: "ok", text: "Naam badal gaya" });
    } catch (err) {
      setNameMsg({ type: "err", text: err.response?.data?.message || err.message });
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });

    if (newPassword !== confirm) {
      setPwMsg({ type: "err", text: "Naya password aur confirm password match nahi karte" });
      return;
    }

    try {
      await API.put("/auth/password", { oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
      setPwMsg({ type: "ok", text: "Password badal gaya" });
    } catch (err) {
      setPwMsg({ type: "err", text: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="section">
      <h1>My Profile</h1>
      <p className="pf-sub">
        {stored.email} | {stored.role === "admin" ? "Admin" : "Student"}
      </p>

      <div className="pf-grid">
        <div className="pf-card">
          <h3>Naam badlo</h3>
          {nameMsg.text && <div className={"pf-msg " + nameMsg.type}>{nameMsg.text}</div>}
          <form onSubmit={saveName}>
            <label>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
            <button type="submit" className="pf-btn">Save Name</button>
          </form>
        </div>

        <div className="pf-card">
          <h3>Password badlo</h3>
          {pwMsg.text && <div className={"pf-msg " + pwMsg.type}>{pwMsg.text}</div>}
          <form onSubmit={savePassword}>
            <label>Purana password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <label>Naya password (kam se kam 8 akshar)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label>Naya password dobara likho</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button type="submit" className="pf-btn">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;