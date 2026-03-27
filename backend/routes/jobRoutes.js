import express from "express";
import { createJob, matchCandidatesForJob } from "../controllers/jobController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", upload.single("jd"), createJob);
router.get("/:jobId/match", matchCandidatesForJob);

export default router;