import express from "express";
import { upload } from "../middleware/upload.js";
import { createApplication, matchJobsForCandidate, saveCustomerAnswers } from "../controllers/applicationController.js";

const router = express.Router();

router.post("/create-application", upload.single("resume"), createApplication);
router.get("/:applicationId/match", matchJobsForCandidate);
router.post("/:applicationId/customer-questions", saveCustomerAnswers);

export default router;