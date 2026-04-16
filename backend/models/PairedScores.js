import mongoose from "mongoose";

const pairedScoreSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
  score: Number,
  feedback: String
}, { timestamps: true });

// Prevent duplicates (VERY IMPORTANT)
pairedScoreSchema.index({ jobId: 1, applicationId: 1 }, { unique: true });

export default mongoose.model("PairedScore", pairedScoreSchema);