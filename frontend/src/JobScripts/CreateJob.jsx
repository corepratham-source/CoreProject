import { useState } from "react";
import api from "../api";
import "./CreateJob.css";

const FUNCTIONS = [
  "Sales & Business Development",
  "Marketing & Brand",
  "Finance & Accounts",
  "Human Resources (HR)",
  "Operations & Supply Chain",
  "Manufacturing / Engineering",
  "Procurement & Sourcing",
  "Technology / IT / Data",
  "Quality & Compliance",
  "Customer Service & Support",
  "Administration & Facilities",
  "Strategy & Leadership"
];

export default function CreateJob() {
  const [file, setFile] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState("");
  const [jobId, setJobId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!file) return alert("Upload JD file");
      if (!selectedFunction) return alert("Select a function");

      const formData = new FormData();
      formData.append("jd", file);
      formData.append("function", selectedFunction); // ✅ send to backend

      setLoading(true);

      const res = await api.post("/jobs", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setJobId(res.data._id);
      setCandidates([]);

      alert("Job Created 🚀");

    } catch (err) {
      console.error(err);
      alert("Error creating job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="appCard">
        <div className="navbar">
          <div className="logo">
            <img src="https://res.cloudinary.com/dwnzd0c2t/image/upload/v1774591468/coreLogo_xpqd8n.png" alt="Core Logo" />
          </div>
          <div className="navButtons">
            <button className="login">Login</button>
            <button className="signup">Sign Up</button>
          </div>
        </div>
        {/* 🔹 HERO */}
        <div className="hero">
          <h1>Create Job</h1>
          <p>Upload JD + Select Function</p>
        </div>

        {/* 🔹 FILE */}
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="fileUpload" />

        {/* 🔹 FUNCTION CHIPS */}
        <div className="chipContainer">
          {FUNCTIONS.map((f) => (
            <div
              key={f}
              className={`chip ${selectedFunction === f ? "active" : ""}`}
              onClick={() => setSelectedFunction(f)}
            >
              {f}
            </div>
          ))}
        </div>

        {/* 🔹 SUBMIT */}
        <button onClick={handleSubmit} className="primaryBtn" disabled={loading}>
          {loading ? "Processing..." : "Create Job"}
        </button>

      </div>
    </div>
  );
}