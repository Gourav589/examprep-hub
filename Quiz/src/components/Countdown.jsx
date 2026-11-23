import { useState, useEffect } from "react";

const pad = (n) => String(n).padStart(2, "0");

function Countdown({ endsAt, offset = 0, label = "", onDone }) {
  const end = new Date(endsAt).getTime();
  const remaining = () => Math.max(0, end - (Date.now() + offset));
  const [ms, setMs] = useState(remaining);

  useEffect(() => {
    setMs(remaining());
    const timer = setInterval(() => {
      const left = remaining();
      setMs(left);
      if (left <= 0) {
        clearInterval(timer);
        if (onDone) onDone();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt, offset]);

  if (ms <= 0) return null;

  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return (
    <span className="cd">
      {label && <span>{label} </span>}
      <b>
        {d > 0 && `${d}d `}
        {pad(h)}:{pad(m)}:{pad(s)}
      </b>
    </span>
  );
}

export default Countdown;