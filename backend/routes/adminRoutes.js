import express from "express";
import { getStagingJobs, approveJob, rejectJob, addAdmin } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/staging-jobs", protect, adminOnly, getStagingJobs);
router.post("/approve/:jobId", protect, adminOnly, approveJob);
router.post("/reject/:jobId", protect, adminOnly, rejectJob);
router.post("/add-admin", protect, adminOnly, addAdmin);

export default router;