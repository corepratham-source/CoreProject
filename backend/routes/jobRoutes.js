import express from "express";
import { createJob, matchCandidatesForJob, deleteJob, getMyJobs, getJobById } from "../controllers/jobController.js";
import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", upload.single("jd"), protect, createJob);
router.get("/:jobId/match", matchCandidatesForJob);
router.get("/my-jobs", protect, getMyJobs);
router.delete("/:jobId", deleteJob);
router.get("/:jobId", getJobById);

export default router;