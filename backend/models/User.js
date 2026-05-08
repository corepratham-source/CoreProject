import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },

  password: { 
    type: String, 
    required: true 
  },

  phone: { 
    type: String 
  },

  companyName: { 
    type: String, 
    required: true 
  },

  companyType: {
    type: String,
    enum: [
      "MNC",
      "Public Limited Company",
      "LLP (Limited Liability Partnership)",
      "Partnership Firm",
      "Sole Proprietorship",
      "Others"
    ]
  },

  companySize: {
    type: String,
    enum: [
      "1–10",
      "11–50",
      "51–200",
      "201–500",
      "501–1,000",
      "1,001–5,000",
      "5,001–10,000",
      "10,000+"
    ]
  },

  companyRole: {
    type: String,
    enum: [
      "HR Exec / Mgr",
      "HR Head",
      "CEO",
      "Other"
    ]
  },

  companyRoleCustom: {
    type: String
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);