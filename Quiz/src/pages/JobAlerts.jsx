import { useState, useEffect } from "react";
import API from "../services/api";
import "./JobAlerts.css";
import useSeo from "../hooks/useSeo";
function JobAlerts() {
  useSeo(
  "Latest Govt Job Alerts 2026 | ExamPrep Hub",
  "Latest government job notifications with last date, eligibility and official apply links."
);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/jobs")
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const daysLeft = (date) =>
    Math.ceil((new Date(date) - now) / (1000 * 60 * 60 * 24));

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      j.organization.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="section">
      <h1>Latest Govt Job Alerts</h1>
      <p className="ja-sub">Naye sarkari naukri ke notifications ek jagah.</p>

      <input
        className="ja-search"
        placeholder="Job ya organization dhoondho (jaise SSC, Railway)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && filtered.length === 0 && !error && (
        <p>Abhi koi job alert nahi hai.</p>
      )}

      <div className="ja-grid">
        {filtered.map((job) => {
          const left = daysLeft(job.lastDate);
          const expired = left < 0;
          const urgent = !expired && left <= 7;

          return (
            <div key={job._id} className={"ja-card" + (expired ? " expired" : "")}>
              <div className="ja-top">
                <span className="ja-org">{job.organization}</span>
                {expired ? (
                  <span className="ja-badge closed">Closed</span>
                ) : urgent ? (
                  <span className="ja-badge urgent">{left} din baaki</span>
                ) : (
                  <span className="ja-badge open">{left} din baaki</span>
                )}
              </div>

              <h3>{job.title}</h3>
              <p className="ja-line">
                📅 Last date: {new Date(job.lastDate).toLocaleDateString()}
              </p>
              {job.eligibility && (
                <p className="ja-line">🎓 Eligibility: {job.eligibility}</p>
              )}

              {!expired && job.link && (
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ja-btn"
                >
                  Apply / Details →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default JobAlerts;