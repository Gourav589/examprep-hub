import { useState } from "react";
import "./Stars.css";

// Sirf dikhane ke liye (4.3 jaisa decimal bhi chalta hai)
export function Stars({ value = 0, size = 18 }) {
  const pct = (Math.max(0, Math.min(5, value)) / 5) * 100;
  return (
    <span
      className="st-wrap"
      style={{ fontSize: size }}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      <span className="st-base">★★★★★</span>
      <span className="st-fill" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}

// Star chunne ke liye
export function StarInput({ value, onChange, size = 38 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div
      className="si-row"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star`}
          className={"si-star" + (n <= shown ? " on" : "")}
          style={{ fontSize: size }}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}