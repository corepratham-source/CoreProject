import express from "express";
import { getTestByToken, submitTest, getResultsByJob } from "../controllers/testController.js";

const router = express.Router();

router.get("/:token", getTestByToken);
router.post("/submit", submitTest);
router.get("/results/:jobId", getResultsByJob);

export default router;