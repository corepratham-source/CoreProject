import express from "express";
import { getStagingJobs, approveJob, addAdmin } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/staging-jobs", protect, adminOnly, getStagingJobs);
router.post("/approve/:jobId", protect, adminOnly, approveJob);
router.post("/add-admin", protect, adminOnly, addAdmin);

export default router;