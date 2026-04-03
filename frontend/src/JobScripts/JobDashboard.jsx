import { useEffect, useState } from "react";
import api from "../api";
import "./JobDashboard.css";

export default function JobDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [showJD, setShowJD] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await api.get("/jobs/all");
      setJobs(res.data);
    };
    fetchJobs();
  }, []);

  const openCandidates = async (job) => {
    setSelectedJob(job);
    setLoading(true);

    const res = await api.get(`/jobs/${job._id}/match`);
    const data = res.data;
    setCandidates(Array.isArray(data) ? data : data.matches || []);

    setLoading(false);
  };

  const openJD = (job) => {
    setSelectedJob(job);
    setShowJD(true);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setCandidates([]);
    setShowJD(false);
  };

  const removeJob = async (job) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/jobs/${job._id}`);
      setJobs(jobs.filter((j) => j._id !== job._id));
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };


  return (
    <div className="dashboard">
      <h2 className="title">Job Dashboard</h2>

      <div className="jobGrid">
        {jobs.map((job) => (
          <div key={job._id} className="jobCardRow">
            <p key={job._created_at}>{job._created_at}</p>

            {/* LEFT SIDE */}
            <div className="jobInfo">
              <h3>{job.title}</h3>
            </div>

            {/* RIGHT SIDE BUTTONS */}
            <div className="jobActions">
              <button onClick={() => openJD(job)} className="jdBtn">
                View Job
              </button>

              <button onClick={() => openCandidates(job)}>
                View Top Candidates
              </button>

              <button onClick={() => removeJob(job)}>
                Delete Job
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* 🔥 JD MODAL */}
      {showJD && selectedJob && (
        <div className="modalOverlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedJob.title}</h3>
            <pre className="jdText">{selectedJob.description}</pre>

            <button className="closeBtn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🔥 CANDIDATES MODAL */}
      {selectedJob && !showJD && (
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
                    <button
                    className="resumeBtn"
                    onClick={() => setSelectedResume(c)}
                    >
                    View Resume
                    </button>
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
      {/*RESUME MODAL*/}
      {selectedResume && (
        <div className="modalOverlay" onClick={() => setSelectedResume(null)}>
            <div className="modal resumeModal" onClick={(e) => e.stopPropagation()}>
            
            <h3>{selectedResume.name}'s Resume</h3>
            <h4>Created at : {selectedResume._created_at}</h4>

            <div className="resumeContent">
                <pre>{selectedResume.resumeText || "No resume text available"}</pre>
            </div>

            {selectedResume.resumeUrl && (
                <a
                href={selectedResume.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="downloadLink"
                >
                Download Resume
                </a>
            )}

            <button className="closeBtn" onClick={() => setSelectedResume(null)}>
                Close
            </button>
            </div>
        </div>
        )}
    </div>
  );
}