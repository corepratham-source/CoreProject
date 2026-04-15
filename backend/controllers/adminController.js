import StagingJob from "../models/StagingJob.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

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

    // 1. MOVE → create in actual Job
    const newJob = await Job.create({
      ...stagingJob.toObject(),
      _id: undefined // prevent duplicate ID
    });

    // 2. DELETE from staging
    await StagingJob.findByIdAndDelete(jobId);

    res.json({
      message: "Job approved",
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