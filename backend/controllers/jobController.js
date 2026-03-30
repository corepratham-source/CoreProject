import Job from "../models/Job.js";
import fs from "fs";
import { parseJobDescription } from "../services/aiService.js";
import { extractResumeText } from "../services/resumeParser.js";
import { matchJobToCandidates } from "../services/matchJobToCandidates.js";
import { sendMail } from "../services/gmailService.js";

export const createJob = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "Job description file is required" });
  }
  const filePath = file.path;

  try {
    // Step 1: Extract raw text
    const description = await extractResumeText(filePath);

    // Step 2: Parse the job description with AI
    let parsed = {};
    try {
      parsed = await parseJobDescription(description);
      if (Array.isArray(parsed.requirements)) {
        parsed.requirements = parsed.requirements.map(r =>
          typeof r === "object" ? JSON.stringify(r) : r
        );
      }
    } catch (err) {
      console.error("Parsing failed:", err.message);
      parsed = {
        title: "Unknown",
        requirements: [],
        responsibilities: [],
        experienceMin: null,
        experienceMax: null,
        salaryMin: null,
        salaryMax: null,
        function: null
      };
    }

    // Step 3: Save to DB once with all data
    const job = await Job.create({
      ...parsed,
      description,
      formFields: [
        { label: "Full Name", type: "text", required: true },
        { label: "Email", type: "email", required: true },
        { label: "Resume", type: "file", required: true }
      ]
    });
    res.status(201).json(job);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("File delete error:", err.message);
        else console.log("Temp file deleted:", filePath);
      });
    }
  }
};

export const matchCandidatesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const results = await matchJobToCandidates(jobId);

    res.json({
      count: results.length,
      matches: results.map(r => ({
        applicationId: r.candidate._id,
        name: r.candidate.name,
        email: r.candidate.email,
        score: r.score,
        feedback: r.feedback
      }))
    });

  } catch (err) {
    console.error("Job match error:", err);
    res.status(500).json({ error: err.message });
  }
};