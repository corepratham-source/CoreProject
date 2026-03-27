import { useState } from "react";
import api from "../api";
import "./CreateJob.css";

export default function CreateJob() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      if (!file) {
        alert("Please upload a job description file");
        return;
      }

      const formData = new FormData();
      formData.append("jd", file);

      setLoading(true);

      const res = await api.post("/jobs", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setJobId(res.data._id);
      setCandidates([]);

      alert("Job Created Successfully 🚀");
    } catch (err) {
      console.error("Create job error:", err);
      alert("Error creating job");
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      if (!jobId) return alert("Create a job first");

      setLoading(true);

      const res = await api.get(`/jobs/${jobId}/match`);
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching candidates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
  <div className="appCard">

    {/* 🔹 Navbar */}
    <div className="navbar">
      <div className="logo">
        <img src="https://res.cloudinary.com/dwnzd0c2t/image/upload/v1774591468/coreLogo_xpqd8n.png" alt="Core Logo" />
      </div>

      <div className="navButtons">
        <button className="login">Login</button>
        <button className="signup">Sign Up</button>
      </div>
    </div>

    {/* 🔹 Hero Section */}
    <div className="hero">
      <h1>Create a Job Instantly</h1>
      <p>Upload a job description and let AI extract everything for you</p>
    </div>

    {/* 🔹 Upload Card */}
    <div className="uploadCard">

      <label className="fileUpload">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        <span>📄 Choose Job Description</span>
      </label>

      {file && <p className="fileName">{file.name}</p>}
      <br/>
      <button onClick={handleSubmit} disabled={loading} className="primaryBtn">
        {loading ? "Processing..." : "Upload & Create Job"}
      </button>

    </div>

    {/* 🔹 Result Section */}
    {jobId && (
      <div className="resultCard">
        <button onClick={fetchCandidates} className="secondaryBtn">
          View Top Candidates
        </button>
      </div>
    )}

    {/* 🔹 Candidates */}
    {candidates.length > 0 && (
      <div className="candidates">
        <h3>Top Candidates</h3>

        {candidates.map((c, i) => (
          <div key={i} className="candidateCard">
            <p className="name">{c.name}</p>
            <p>{c.email}</p>
            <p className="score">Score: {c.score}</p>
            <p className="feedback">{c.feedback}</p>
          </div>
        ))}
      </div>
    )}

  </div>
</div>
  );
}