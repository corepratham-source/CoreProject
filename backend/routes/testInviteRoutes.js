import express from "express";
import { sendTestLink } from "../controllers/testInviteController.js";
const router = express.Router();

router.post("/send-test-link", sendTestLink);

export default router;