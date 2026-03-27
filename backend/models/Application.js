import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  experience: Number,
  salary: Number,
  function: String,
  resumeText: String,
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);