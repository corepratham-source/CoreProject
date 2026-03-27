import Application from "../models/Application.js";
import { extractResumeText } from "../services/resumeParser.js";
import { matchCandidateToJobs } from "../services/matchCandidateToJobs.js";
import fs from "fs";

export const createApplication = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "Resume file is required" });
  }
  const filePath = file.path;
  try {
    const resume = await extractResumeText(filePath);
    const application = await Application.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      experience: req.body.experience,
      salary: req.body.salary,
      function: req.body.function,
      resumeText: resume
    });
    res.status(201).json(application);
  } catch (err) {
    console.error("Create application error:", err);
    res.status(500).json({ error: err.message });
  }
  finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("File delete error:", err.message);
        } else {
          console.log("Temp file deleted:", filePath);
        }
      });
    }
  }
};


export const matchJobsForCandidate = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const results = await matchCandidateToJobs(applicationId);

    res.json({
      count: results.length,
      matches: results.map(r => ({
        jobId: r.job._id,
        title: r.job.title,
        score: r.score,
        feedback: r.feedback
      }))
    });

  } catch (err) {
    console.error("Candidate match error:", err);
    res.status(500).json({ error: err.message });
  }
};