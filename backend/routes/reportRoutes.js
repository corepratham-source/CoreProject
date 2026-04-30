import express from "express";
import { requestReport } from "../controllers/reportController.js";
import Report from "../models/Reports.js";

const router = express.Router();

router.post("/request", requestReport);

router.get("/", async (req, res) => {
  const reports = await Report.find();
  res.json(reports);
});

export default router;