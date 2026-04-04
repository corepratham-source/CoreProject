import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  experience: Number,
  currentSalary: Number,
  expectedSalary: Number,
  function: String,
  subFunction: String,
  resumeText: String,
  resumeURL: String,
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);