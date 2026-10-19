import { useState, useEffect } from "react";
import API from "../services/api";

function JobAlerts() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/jobs")
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const today = new Date();

  return (
    <div className="section">
      <h1>Latest Govt Job Alerts</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {jobs.length === 0 && !error && <p>Abhi koi job alert nahi hai.</p>}

      <div className="exam-grid" style={{ marginTop: "20px" }}>
        {jobs.map((job) => {
          const expired = new Date(job.lastDate) < today;
          return (
            <div key={job._id} className="exam-card">
              <span className="badge">{job.organization}</span>
              <h3>{job.title}</h3>
              <p>Last date: {new Date(job.lastDate).toLocaleDateString()}</p>
              {job.eligibility && <p>Eligibility: {job.eligibility}</p>}
              {expired ? (
                <p style={{ color: "#ef4444" }}>Closed</p>
              ) : (
                job.link && (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-btn"
                  >
                    Apply / Details
                  </a>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default JobAlerts;