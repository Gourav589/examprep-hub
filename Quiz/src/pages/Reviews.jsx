import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import { Stars, StarInput } from "../components/Stars";
import "./Reviews.css";

const LABELS = ["", "Kharab", "Theek-thaak", "Accha", "Bahut accha", "Shandaar"];

function Reviews() {
  useSeo(
    "Student Reviews and Ratings | ExamPrep Hub",
    "Read what students say about ExamPrep Hub mock tests, and share your own rating."
  );

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = () => {
    API.get("/reviews")
      .then((res) => {
        setData(res.data);
        if (res.data.mine) {
          setRating(res.data.mine.rating);
          setComment(res.data.mine.comment || "");
        }
      })
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (rating < 1) {
      setMsg({ type: "err", text: "Pehle star chuno" });
      return;
    }

    setSaving(true);
    try {
      const res = await API.put("/reviews", { rating, comment });
      setMsg({ type: "ok", text: res.data.message });
      load();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || err.message });
    }
    setSaving(false);
  };

  const removeMine = async () => {
    if (!window.confirm("Apna review hata dein?")) return;
    try {
      await API.delete("/reviews/mine");
      setRating(0);
      setComment("");
      setMsg({ type: "ok", text: "Aapka review hata diya gaya" });
      load();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || err.message });
    }
  };

  const adminRemove = async (id) => {
    if (!window.confirm("Yeh review hata dein?")) return;
    try {
      await API.delete(`/reviews/${id}`);
      load();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || err.message });
    }
  };

  if (error) return <div className="section"><p>{error}</p></div>;
  if (!data) return <div className="section"><p>Loading...</p></div>;

  const max = Math.max(1, ...Object.values(data.distribution));

  return (
    <div className="section">
      <h1>Student Reviews</h1>
      <p className="rv-sub">Asli students ne kya kaha, aur aap bhi apni rating do.</p>

      <div className="rv-top">
        <div className="rv-summary">
          <div className="rv-avg">{data.total ? data.average.toFixed(1) : "-"}</div>
          <Stars value={data.average} size={26} />
          <p className="rv-count">
            {data.total} {data.total === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="rv-bars">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="rv-bar-row">
              <span>{n} ★</span>
              <div className="rv-bar">
                <div
                  className="rv-bar-fill"
                  style={{ width: `${(data.distribution[n] / max) * 100}%` }}
                />
              </div>
              <span className="rv-bar-num">{data.distribution[n]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rv-form-card">
        {!user && (
          <>
            <h3>Review dene ke liye login karo</h3>
            <p style={{ color: "#64748b", margin: "6px 0 14px" }}>
              Sirf registered students review de sakte hain.
            </p>
            <Link to="/login" className="card-btn">Login</Link>
          </>
        )}

        {isAdmin && (
          <p style={{ color: "#64748b" }}>
            Admin review nahi de sakta. Galat review par Delete ka button dikhega.
          </p>
        )}

        {user && !isAdmin && (
          <form onSubmit={handleSubmit}>
            <h3>{data.mine ? "Apna review badlo" : "Apna review likho"}</h3>

            <div className="rv-pick">
              <StarInput value={rating} onChange={setRating} />
              <span className="rv-label">{LABELS[rating] || "Star chuno"}</span>
            </div>

            <textarea
              className="rv-text"
              rows={4}
              maxLength={500}
              placeholder="Aapko kya accha laga? Kya sudhaar chahiye? (zaroori nahi)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="rv-counter">{comment.length} / 500</div>

            {msg.text && <div className={"rv-msg " + msg.type}>{msg.text}</div>}

            <div className="rv-actions">
              <button type="submit" className="rv-btn" disabled={saving}>
                {saving ? "Please wait..." : data.mine ? "Update karo" : "Review bhejo"}
              </button>
              {data.mine && (
                <button type="button" className="rv-btn-danger" onClick={removeMine}>
                  Mera review hatao
                </button>
              )}
            </div>

            <p className="rv-note">
              Test dene ke baad review karoge to aapke naam ke saath "Verified student" ka badge dikhega.
            </p>
          </form>
        )}
      </div>

      <h2 style={{ margin: "28px 0 14px" }}>Sabke reviews</h2>

      {data.reviews.length === 0 && (
        <p>Abhi koi review nahi hai. Pehla review aap do!</p>
      )}

      <div className="rv-list">
        {data.reviews.map((r) => (
          <div key={r._id} className="rv-item">
            <div className="rv-item-top">
              <div>
                <strong>{r.name}</strong>
                {r.verified && <span className="rv-badge">✔ Verified student</span>}
              </div>
              <span className="rv-date">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>

            <Stars value={r.rating} size={18} />

            {r.comment && <p className="rv-comment">{r.comment}</p>}

            {isAdmin && (
              <button className="rv-admin-del" onClick={() => adminRemove(r._id)}>
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reviews;