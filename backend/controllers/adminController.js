import StagingJob from "../models/StagingJob.js";
import Job from "../models/Job.js";

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