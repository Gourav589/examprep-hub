import { useState } from "react";

const KEY = "theme";

function current() {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export default function useTheme() {
  const [theme, setTheme] = useState(current);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // storage band ho to bhi mode badal jayega
    }
    setTheme(next);
  };

  return [theme, toggle];
}