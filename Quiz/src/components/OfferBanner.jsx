import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import usePricing from "../hooks/usePricing";
import usePremium from "../hooks/usePremium";
import Countdown from "./Countdown";
import "./OfferBanner.css";

const KEY = "offerBannerClosed";

// In pages par banner nahi aata
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

function OfferBanner() {
  const { pathname } = useLocation();
  const { pricing, offset, refresh } = usePricing();
  const premium = usePremium();
  const [closed, setClosed] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });

  if (closed || premium || !pricing || !pricing.offerActive) return null;
  if (BLOCKED.some((rx) => rx.test(pathname))) return null;

  const close = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      // koi baat nahi
    }
    setClosed(true);
  };

  return (
    <div className="ob" role="region" aria-label="Premium offer">
      <div className="ob-inner">
        <span className="ob-text">
          🎉 <b>Limited offer:</b> Premium <s>₹{pricing.listPrice}</s>{" "}
          <b>sirf ₹{pricing.offerPrice}</b> ({pricing.savePercent}% off)
        </span>

        <Countdown
          endsAt={pricing.endsAt}
          offset={offset}
          label="Khatam hone mein"
          onDone={refresh}
        />

        <Link to="/membership" className="ob-btn">Abhi lo →</Link>
      </div>

      <button className="ob-x" onClick={close} aria-label="Offer banner band karo">
        ✕
      </button>
    </div>
  );
}

export default OfferBanner;