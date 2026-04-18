import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import testInviteRoutes from "./routes/testInviteRoutes.js";

const app = express();

// 🔥 VERY IMPORTANT (Railway / proxies)
app.set("trust proxy", 1);

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://jobs.careersatcore.com"
];

// ✅ CORS CONFIG (COOKIE SAFE)
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Handle preflight explicitly
app.options("*", cors());

// ✅ Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Cookie parser (MANDATORY)
app.use(cookieParser());

// ✅ Debug (optional but useful)
app.use((req, res, next) => {
  console.log("API HIT:", req.method, req.url);
  next();
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/test-invites", testInviteRoutes);

// ✅ Health check (helps Railway debugging)
app.get("/", (req, res) => {
  res.send("API Running");
});

// ✅ DB + Server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT || 5000, () =>
      console.log("Server running on port " + (process.env.PORT || 5000))
    );
  })
  .catch(err => console.log("Mongo Error:", err));