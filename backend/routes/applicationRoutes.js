import express from "express";
import { upload } from "../middleware/upload.js";
import { createApplication, matchJobsForCandidate } from "../controllers/applicationController.js";

const router = express.Router();

router.post("/create-application", upload.single("resume"), createApplication);
router.get("/:applicationId/match", matchJobsForCandidate);

export default router;