import { Link } from "react-router-dom";
import { SITE } from "../config/site";
import "./Footer.css";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/exams", label: "Mock Tests" },
  { to: "/jobs", label: "Job Alerts" },
  { to: "/reviews", label: "Reviews" },
  { to: "/membership", label: "Premium" },
  { to: "/contact", label: "Contact Us" },
];

const popularExams = [
  { to: "/exams?category=HP%20State", label: "HP State Exams" },
  { to: "/exams?search=HP%20TET", label: "HP TET" },
  { to: "/exams?category=SSC", label: "SSC" },
  { to: "/exams?category=Railway", label: "Railway" },
  { to: "/exams?category=Banking", label: "Banking" },
  { to: "/exams", label: "Other Exams" },
];

function Logo() {
  return (
    <svg width="54" height="54" viewBox="0 0 58 58" fill="none" aria-hidden="true">
      <polygon points="29,6 54,17 29,28 4,17" fill="#17306b" />
      <path d="M14 25v9c0 8 7 14 15 17 8-3 15-9 15-17v-9" stroke="#17306b" strokeWidth="3.2" strokeLinejoin="round" />
      <line x1="52" y1="18" x2="52" y2="30" stroke="#f5b50a" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M4 44c9-3 17-1 25 6 8-7 16-9 25-6" stroke="#17306b" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const socialIcons = {
  youtube: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" fill="#ff0000" />
      <path d="M10 9l5 3-5 3z" fill="#fff" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="22,3 2,11 8,13 10,20 13,15.5 18,19.5" fill="#29a9eb" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <text x="3.5" y="19" fontSize="18" fontWeight="700" fill="#0a66c2" fontFamily="Arial, sans-serif">in</text>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4.5l14 15M19 4.5l-14 15" stroke="#111827" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
};

const socialNames = {
  youtube: "YouTube",
  telegram: "Telegram",
  linkedin: "LinkedIn",
  x: "X",
};

function Icon({ type }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (type === "pin") {
    return (
      <svg {...common}>
        <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  if (type === "mail") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    );
  }
  if (type === "phone") {
    return (
      <svg {...common}>
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
      </svg>
    );
  }
  if (type === "link") {
    return (
      <svg {...common}>
        <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
        <path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="currentColor" stroke="none">
      <path d="M12 2l3 6.5 7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14.5l-5-5 7-1z" />
    </svg>
  );
}

function Footer() {
  const [first, ...rest] = SITE.name.split(" ");
  const socials = Object.entries(SITE.socials || {}).filter(([, url]) => url);

  return (
    <footer className="ft">
      <div className="ft-main">
        <div className="ft-col ft-brand">
          <div className="ft-logo">
            <Logo />
            <div>
              <div className="ft-name">
                {first} <span>{rest.join(" ")}</span>
              </div>
              <div className="ft-tag">Practice • Prepare • Perform</div>
            </div>
          </div>

          <p className="ft-about">
            Your one-stop platform for mock tests, exam preparation and a brighter future.
          </p>

          {socials.length > 0 && (
            <div className="ft-social">
              {socials.map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={socialNames[key] || key}
                >
                  {socialIcons[key]}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="ft-col">
          <h4><Icon type="link" /> Quick Links</h4>
          <ul>
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>
                  <span>{l.label}</span>
                  <span className="ft-chev">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ft-col">
          <h4><Icon type="star" /> Popular Exams</h4>
          <ul>
            {popularExams.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>
                  <span>{l.label}</span>
                  <span className="ft-chev">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ft-col ft-contact">
          <h4><Icon type="mail" /> Contact Us</h4>
          <ul>
            {SITE.location && (
              <li>
                <Icon type="pin" />
                <span>{SITE.location}</span>
              </li>
            )}
            <li>
              <Icon type="mail" />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            {SITE.phone && (
              <li>
                <Icon type="phone" />
                <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`}>{SITE.phone}</a>
              </li>
            )}
          </ul>

          <svg className="ft-cap" viewBox="0 0 200 110" aria-hidden="true">
            <polygon points="100,10 190,45 100,80 10,45" fill="#c7d4ec" />
            <path d="M45 62v22c0 12 25 22 55 22s55-10 55-22V62l-55 22z" fill="#b7c6e4" />
            <line x1="178" y1="50" x2="178" y2="88" stroke="#c7d4ec" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      

        

       
      
    </footer>
  );
}

export default Footer;