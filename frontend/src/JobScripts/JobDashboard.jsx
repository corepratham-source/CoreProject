import { useEffect, useState } from "react";
import api from "../api";
import "./JobDashboard.css";

export default function JobDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchJobs();
  }, []);

  // 🔹 Fetch candidates
  const openCandidates = async (job) => {
    try {
      setSelectedJob(job);
      setLoading(true);

      const res = await api.get(`/applications/${job._id}/top`);
      setCandidates(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
    setCandidates([]);
  };

  return (
    <div className="dashboard">
      <h2 className="title">Job Dashboard</h2>

      <div className="jobGrid">
        {jobs.map((job) => (
          <div key={job._id} className="jobCard">
            <h3>{job.title}</h3>
            <p className="desc">{job.description.slice(0, 120)}...</p>

            <button onClick={() => openCandidates(job)}>
              View Top Candidates
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedJob && (
        <div className="modalOverlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedJob.title} - Candidates</h3>

            {loading ? (
              <p>Loading...</p>
            ) : candidates.length === 0 ? (
              <p>No strong candidates yet</p>
            ) : (
              candidates.map((c, i) => (
                <div key={i} className="candidateCard">
                  <p><b>Name:</b> {c.name}</p>
                  <p><b>Email:</b> {c.email}</p>
                  <p>
                    <b>Resume:</b>{" "}
                    <a href={c.resumeUrl} target="_blank" rel="noreferrer">
                      View Resume
                    </a>
                  </p>
                  <p><b>Score:</b> {c.score}</p>
                  <p><b>Reason:</b> {c.feedback}</p>
                </div>
              ))
            )}

            <button className="closeBtn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}