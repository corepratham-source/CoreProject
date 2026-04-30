import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "./services/uploadResume.js"; 

/* ===== ROUTES ===== */
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import testInviteRoutes from "./routes/testInviteRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

/* ===== APP ===== */
const app = express();
app.set("trust proxy", 1);

/* =======================
   🔐 CORS (MERGED SAFE)
======================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://jobs.careersatcore.com"
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.options("*", cors());

/* =======================
   🧱 MIDDLEWARE
======================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =======================
   📁 UPLOAD SETUP (NEW)
======================= */
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* =======================
   📊 MODELS (NEW)
======================= */

const leadSchema = new mongoose.Schema({
  name: String,
  company: String,
  email: String
});

const Lead = mongoose.model("Lead", leadSchema);

/* =======================
   🔐 SIMPLE ADMIN AUTH (NEW)
======================= */
const ADMIN_EMAIL = "ashutosh@careersatcore.com";
const ADMIN_PASSWORD = "Core@2026";
const JWT_SECRET = process.env.JWT_SECRET;

const protectAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Not authorized" });

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/* =======================
   📊 REPORT ROUTES (NEW)
======================= */
app.get("/api/reports", async (req, res) => {
  const reports = await Report.find();
  res.json(reports);
});

app.post("/api/leads", async (req, res) => {
  await Lead.create(req.body);
  res.json({ message: "Lead saved" });
});

/* =======================
   🔐 ADMIN ROUTES (NEW)
======================= */
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

app.post("/api/admin/reports", protectAdmin, upload.single("document"), async (req, res) => {
  let docUrl = null;
  const filePath = req.file?.path;

  try {
    // 🔥 Upload to Cloudinary if file exists
    if (filePath) {
      const uploadResult = await uploadToCloudinary(filePath, "reports");
      docUrl = uploadResult.url;
    }

    const report = await Report.create({
      ...req.body,
      profilesAnalyzed: Number(req.body.profilesAnalyzed),
      isTrending: req.body.isTrending === "true",
      document: docUrl
    });

    res.json(report);

  } catch (err) {
    console.error("Report upload error:", err);
    res.status(500).json({ error: err.message });

  } finally {
    // 🧹 ALWAYS delete temp file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }
  }
});
app.get("/api/admin/reports", protectAdmin, async (req, res) => {
  res.json(await Report.find());
});

app.get("/api/admin/leads", protectAdmin, async (req, res) => {
  res.json(await Lead.find().sort({ createdAt: -1 }));
});

app.delete("/api/admin/reports/:id", protectAdmin, async (req, res) => {
  await Report.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* =======================
   🧠 EXISTING ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/test-invites", testInviteRoutes);
app.use("/api/reports", reportRoutes);

/* =======================
   ❤️ HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.send("API Running");
});

/* =======================
   🚀 START SERVER
======================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT || 5000, () =>
      console.log("Server running on port " + (process.env.PORT || 5000))
    );
  })
  .catch(err => console.log(err));