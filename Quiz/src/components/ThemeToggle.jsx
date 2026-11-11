import useTheme from "../hooks/useTheme";

function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-btn"
      onClick={toggle}
      aria-label={dark ? "Light mode chalao" : "Dark mode chalao"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

export default ThemeToggle;