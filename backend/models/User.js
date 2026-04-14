import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: { type: String, required: true },

  phone: { type: String },

  companyName: { 
    type: String, 
    required: true 
  },

  companyType: {
    type: String,
    enum: ["Startup", "MNC", "Recruitment Agency"]
  },

  companySize: {
    type: String,
    enum: ["1-10", "11-50", "51-200", "200+"]
  },

  companyRole: {
    type: String,
    enum: ["HR", "Founder", "Hiring Manager"]
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);