import express from "express";
import { requestReport } from "../controllers/reportController.js";

const router = express.Router();

router.post("/request", requestReport);

export default router;