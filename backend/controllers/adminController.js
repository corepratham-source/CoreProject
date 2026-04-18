import StagingJob from "../models/StagingJob.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Test from "../models/Test.js";
import bcrypt from "bcrypt";
import { generateTestFromJD } from "../services/generateTest.js";

// GET ALL STAGING JDs
export const getStagingJobs = async (req, res) => {
  try {
    const jobs = await StagingJob.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// APPROVE JD
export const approveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const stagingJob = await StagingJob.findById(jobId);
    if (!stagingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    // 1. CREATE FINAL JOB
    const newJob = await Job.create({
      ...stagingJob.toObject(),
      _id: undefined
    });

    // 2. DELETE STAGING
    await StagingJob.findByIdAndDelete(jobId);

    // 3. GENERATE TEST USING FINAL JOB (CORRECT ID)
    let questions = [];

    try {
      questions = await generateTestFromJD(newJob);
    } catch (err) {
      console.error("Test generation failed:", err.message);
    }

    // 4. STORE TEST WITH CORRECT jobId
    if (questions.length > 0) {
      try {
        await Test.create({
          jobId: newJob._id,
          title: `${newJob.title} Assessment`,
          questions: questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: 1
          }))
        });
      } catch (err) {
        console.error("Test save failed:", err.message);
      }
    }

    res.json({
      message: "Job approved + test created",
      job: newJob
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const stagingJob = await StagingJob.findById(jobId);
    if (!stagingJob) {
      return res.status(404).json({ error: "Job not found" });
    }
    // 1. DELETE from staging
    await StagingJob.findByIdAndDelete(jobId);

    res.json({
      message: "Job rejected and deleted from staging",
      job: stagingJob
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: "Admin",
      email,
      password: hashed,
      role: "admin"
    });

    res.json({ message: "Admin created" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};