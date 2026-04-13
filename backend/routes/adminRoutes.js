import express from "express";
import { getStagingJobs, approveJob } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// you can later add admin middleware here
router.get("/staging-jobs", protect, adminOnly, getStagingJobs);
router.post("/approve/:jobId", protect, adminOnly, approveJob);
export default router;