import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import useExams from "../hooks/useExams";
import { SITE } from "../config/site";
import "./Navbar.css";

const CAT_ICON = {
  SSC: "📝",
  Banking: "🏦",
  Railway: "🚆",
  UPSC: "⚖️",
  Defence: "🎖️",
  Teaching: "🎓",
  "HP State": "🏔️",
  "State Govt": "🏛️",
  Computer: "💻",
};

const TOPIC_ICON = [
  ["javascript", "🟨"],
  ["java", "☕"],
  ["c++", "⚙️"],
  ["c programming", "🔧"],
  ["python", "🐍"],
  ["html", "🌐"],
  ["sql", "🗄️"],
  ["excel", "📊"],
  ["powerpoint", "📽️"],
  ["word", "📄"],
  ["internet", "📧"],
  ["network", "🔌"],
  ["operating", "🖥️"],
  ["data structures", "🧩"],
  ["awareness", "🧠"],
  ["ccc", "🎓"],
];

const OFFICE = [
  "Computer Fundamentals",
  "Computer Awareness (Govt Exams)",
  "MS Word",
  "MS Excel",
  "MS PowerPoint",
  "Internet and Email",
  "CCC Practice",
  "Operating System Basics",
  "Networking Basics",
];

const PROG = [
  "Python",
  "C Programming",
  "C++",
  "Java",
  "JavaScript",
  "HTML and CSS",
  "SQL and DBMS",
  "Data Structures",
];

const iconFor = (e) => {
  if (e.category === "Computer") {
    const n = e.name.toLowerCase();
    const hit = TOPIC_ICON.find(([k]) => n.includes(k));
    if (hit) return hit[1];
  }
  return CAT_ICON[e.category] || "📚";
};

const byReady = (a, b) => (b.tests > 0) - (a.tests > 0);

const examLinks = (list, max) =>
  [...list]
    .sort(byReady)
    .slice(0, max)
    .map((e) => ({
      to: `/exams/${e._id}`,
      label: e.name,
      icon: iconFor(e),
      soon: !(e.tests > 0),
    }));

const catLink = (name) => `/exams?category=${encodeURIComponent(name)}`;

function buildMenus(exams, isAdmin) {
  const cat = (name) => exams.filter((e) => e.category === name);
  const has = (name) => cat(name).length > 0;
  const menus = [];

  // Govt Exams
  const govtCats = ["SSC", "Banking", "Railway", "UPSC", "Defence", "Teaching"].filter(has);
  const govtCols = [
    {
      title: "Exam Categories",
      links: [
        ...govtCats.map((c) => ({ to: catLink(c), label: `${c} Exams`, icon: CAT_ICON[c] })),
        { to: "/exams", label: "All Exams", icon: "🔎" },
      ],
    },
  ];
  ["SSC", "Railway", "Banking"].forEach((c) => {
    if (has(c)) {
      govtCols.push({ title: `${c} Exams`, links: examLinks(cat(c), 8), more: catLink(c) });
    }
  });
  menus.push({ key: "govt", label: "Govt Exams", mega: true, columns: govtCols });

  // HP State
  const hp = [...cat("HP State"), ...cat("State Govt")];
  if (hp.length > 0) {
    const links = examLinks(hp, 16);
    const half = Math.ceil(links.length / 2);
    const cols = [{ title: "HP State Exams", links: links.slice(0, half) }];
    if (links.length > half) {
      cols.push({ title: "More State Exams", links: links.slice(half), more: catLink("HP State") });
    } else {
      cols[0].more = catLink("HP State");
    }
    menus.push({ key: "hp", label: "HP State", mega: true, columns: cols });
  }

  // Computer
  const comp = cat("Computer");
  if (comp.length > 0) {
    const a = comp.filter((e) => OFFICE.includes(e.name));
    const b = comp.filter((e) => PROG.includes(e.name));
    const c = comp.filter((e) => !OFFICE.includes(e.name) && !PROG.includes(e.name));
    const cols = [];
    if (a.length) cols.push({ title: "MS Office & Basics", links: examLinks(a, 9) });
    if (b.length) cols.push({ title: "Programming & Web", links: examLinks(b, 9) });
    if (c.length) cols.push({ title: "More Topics", links: examLinks(c, 9) });
    cols[cols.length - 1].more = catLink("Computer");
    menus.push({ key: "computer", label: "Computer", mega: true, columns: cols });
  }

  // Practice (chhota dropdown)
  const practice = [
    { to: "/daily", label: "Daily Quiz", icon: "🔥" },
    { to: "/mistakes", label: "Mistakes Notebook", icon: "📒" },
  ];
  if (!isAdmin) {
    practice.push({ to: "/my-results", label: "My Results", icon: "📊" });
    practice.push({ to: "/analytics", label: "Analytics", icon: "📈" });
  }
  practice.push({ to: "/reviews", label: "Reviews", icon: "⭐" });
  menus.push({ key: "practice", label: "Practice", mega: false, columns: [{ title: "", links: practice }] });

  return menus;
}

const canHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(hover: hover)").matches;

function Logo() {
  return (
    <svg width="34" height="34" viewBox="0 0 58 58" fill="none" aria-hidden="true">
      <polygon points="29,6 54,17 29,28 4,17" fill="#17306b" />
      <path d="M14 25v9c0 8 7 14 15 17 8-3 15-9 15-17v-9" stroke="#17306b" strokeWidth="3.2" strokeLinejoin="round" />
      <line x1="52" y1="18" x2="52" y2="30" stroke="#f5b50a" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M4 44c9-3 17-1 25 6 8-7 16-9 25-6" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Navbar({ onMenuClick }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const exams = useExams();

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  const [open, setOpen] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [mobileSec, setMobileSec] = useState(null);
  const [query, setQuery] = useState("");

  const timer = useRef(null);
  const navRef = useRef(null);

  const menus = useMemo(() => buildMenus(exams, isAdmin), [exams, isAdmin]);

  const direct = [
    { to: "/jobs", label: "Job Alerts" },
    { to: "/study", label: "Study Material" },
  ];
  if (!isAdmin) direct.push({ to: "/membership", label: "💎 Premium", accent: true });
  if (isAdmin) direct.push({ to: "/admin", label: "Admin Panel", accent: true });

  // Page badalne par sab band
  useEffect(() => {
    setOpen(null);
    setMobile(false);
    setMobileSec(null);
  }, [loc.pathname, loc.search]);

  // Bahar click ya Esc par band
  useEffect(() => {
    const onDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(null);
        setMobile(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const enter = (key) => {
    if (!canHover()) return;
    clearTimeout(timer.current);
    setOpen(key);
  };

  const leave = () => {
    if (!canHover()) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(null), 150);
  };

  const click = (key) => {
    clearTimeout(timer.current);
    setOpen((o) => (canHover() ? key : o === key ? null : key));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/exams?search=${encodeURIComponent(q)}` : "/exams");
    setQuery("");
  };

  const [first, ...rest] = SITE.name.split(" ");

  const renderColumn = (col) => (
    <div key={col.title || "col"} className="nv-col">
      {col.title && <h4>{col.title}</h4>}
      <ul>
        {col.links.map((l) => (
          <li key={l.to + l.label}>
            <Link to={l.to} className="nv-link">
              <span className="ico">{l.icon}</span>
              <span>{l.label}</span>
              {l.soon && <em className="nv-soon">soon</em>}
            </Link>
          </li>
        ))}
      </ul>
      {col.more && (
        <Link to={col.more} className="nv-more">Sab dekho →</Link>
      )}
    </div>
  );

  return (
    <header className="nv" ref={navRef}>
      <div className="nv-bar">
        <Link to="/" className="nv-logo" aria-label={`${SITE.name} home`}>
          <Logo />
          <span className="nv-name">
            {first} <span>{rest.join(" ")}</span>
          </span>
        </Link>

        <nav className="nv-menu" aria-label="Main">
          {menus.map((m) => (
            <div
              key={m.key}
              className={"nv-item " + (m.mega ? "mega" : "small")}
              onMouseEnter={() => enter(m.key)}
              onMouseLeave={leave}
            >
              <button
                type="button"
                className={"nv-top" + (open === m.key ? " on" : "")}
                aria-haspopup="true"
                aria-expanded={open === m.key}
                onClick={() => click(m.key)}
              >
                {m.label} <span className="nv-caret">▾</span>
              </button>

              {open === m.key && (
                <div className={"nv-panel " + (m.mega ? "nv-mega" : "nv-small")}>
                  {m.mega ? (
                    <div
                      className="nv-mega-inner"
                      style={{ gridTemplateColumns: `repeat(${m.columns.length}, minmax(0, 1fr))` }}
                    >
                      {m.columns.map(renderColumn)}
                    </div>
                  ) : (
                    m.columns.map(renderColumn)
                  )}
                </div>
              )}
            </div>
          ))}

          {direct.map((d) => (
            <Link
              key={d.to}
              to={d.to}
              className={"nv-top nv-direct" + (d.accent ? " accent" : "")}
            >
              {d.label}
            </Link>
          ))}
        </nav>

        <div className="nv-right">
          <form className="nv-search" onSubmit={handleSearch}>
            <input
              placeholder="Exam search..."
              aria-label="Exam search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <ThemeToggle />

          {user ? (
            <button className="nv-user" onClick={onMenuClick}>
              <span className="nv-user-name">{user.name}</span> ▼
            </button>
          ) : (
            <>
              <Link to="/login" className="nv-login">Login</Link>
              <Link to="/signup" className="nv-signup">Sign Up</Link>
            </>
          )}

          <button
            type="button"
            className="nv-burger"
            aria-label="Menu"
            aria-expanded={mobile}
            onClick={() => setMobile((m) => !m)}
          >
            {mobile ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="nv-mobile">
          <form className="nv-msearch" onSubmit={handleSearch}>
            <input
              placeholder="Exam dhoondho..."
              aria-label="Exam search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          {menus.map((m) => (
            <div key={m.key} className="nv-acc">
              <button
                type="button"
                className="nv-acc-head"
                aria-expanded={mobileSec === m.key}
                onClick={() => setMobileSec((s) => (s === m.key ? null : m.key))}
              >
                {m.label} <span>{mobileSec === m.key ? "−" : "+"}</span>
              </button>
              {mobileSec === m.key && (
                <div className="nv-acc-body">{m.columns.map(renderColumn)}</div>
              )}
            </div>
          ))}

          {direct.map((d) => (
            <Link key={d.to} to={d.to} className={"nv-acc-link" + (d.accent ? " accent" : "")}>
              {d.label}
            </Link>
          ))}

          {!user && (
            <div className="nv-mauth">
              <Link to="/login" className="nv-login">Login</Link>
              <Link to="/signup" className="nv-signup">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;