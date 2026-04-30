import mongoose from "mongoose";

const reportRequestSchema = new mongoose.Schema({
  name: String,
  company: String,
  email: String,
  reportId: String
}, { timestamps: true });

export default mongoose.model("ReportRequest", reportRequestSchema);