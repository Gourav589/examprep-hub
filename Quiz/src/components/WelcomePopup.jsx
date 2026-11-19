import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { SITE } from "../config/site";
import "./WelcomePopup.css";

const KEY = "welcomePopupDismissedAt";
const HIDE_HOURS = 24;
const DELAY_MS = 6000;

// In pages par popup kabhi nahi aata
const BLOCKED = [
  /^\/login/,
  /^\/signup/,
  /^\/verify-email/,
  /^\/forgot-password/,
  /^\/reset-password/,
  /^\/admin/,
  /^\/exams\/[^/]+\/test/,
  /^\/terms/,
  /^\/privacy/,
  /^\/refund-policy/,
  /^\/contact/,
  /^\/membership/,
];

const isLoggedIn = () => {
  try {
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
};

const recentlyDismissed = () => {
  try {
    const t = Number(localStorage.getItem(KEY));
    return t && Date.now() - t < HIDE_HOURS * 3600 * 1000;
  } catch {
    return false;
  }
};

function WelcomePopup() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const firstBtn = useRef(null);

  const close = () => {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      // storage band ho to bhi popup band ho jayega
    }
    setOpen(false);
  };

  // Kab dikhana hai
  useEffect(() => {
    setOpen(false);

    if (BLOCKED.some((rx) => rx.test(pathname))) return;
    if (isLoggedIn() || recentlyDismissed()) return;

    const timer = setTimeout(() => {
      // Dobara check: is beech user login kar chuka ho to nahi
      if (!isLoggedIn() && !recentlyDismissed()) setOpen(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Esc se band, peeche ka scroll band, aur pehle button par focus
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (firstBtn.current) firstBtn.current.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="wp-overlay" onClick={close}>
      <div
        className="wp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wp-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="wp-x" onClick={close} aria-label="Band karo">
          ✕
        </button>

        <div className="wp-emoji">🎯</div>
        <h2 id="wp-title">{SITE.name} par free account banao</h2>
        <p className="wp-sub">
          Apna progress save karo aur taiyari ek jagah se chalao. Signup bilkul free hai.
        </p>

        <ul className="wp-list">
          <li>✔ Har exam ka Test 1 free</li>
          <li>✔ Turant result aur har answer ka explanation</li>
          <li>✔ Daily Quiz, streak aur Mistakes Notebook</li>
          <li>✔ Rank aur analytics</li>
        </ul>

        <Link to="/signup" className="wp-primary" onClick={close} ref={firstBtn}>
          Free account banao
        </Link>
        <Link to="/login" className="wp-secondary" onClick={close}>
          Pehle se account hai? Login
        </Link>
        <button className="wp-later" onClick={close}>
          Abhi nahi
        </button>
      </div>
    </div>
  );
}

export default WelcomePopup;