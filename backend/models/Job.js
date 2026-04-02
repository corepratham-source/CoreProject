import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  requirements: [mongoose.Schema.Types.Mixed],
  responsibilities: [String],
  experienceMin: Number,
  experienceMax: Number,
  salaryMin: Number,
  salaryMax: Number,
  function: {
    type: String,
    enum: [
      "Sales & Business Development",
      "Marketing & Brand",
      "Finance & Accounts",
      "Human Resources (HR)",
      "Operations & Supply Chain",
      "Manufacturing / Engineering",
      "Procurement & Sourcing",
      "Technology / IT / Data",
      "Quality & Compliance",
      "Customer Service & Support",
      "Administration & Facilities",
      "Strategy & Leadership"
    ]
  },

  formFields: [
    {
      label: { type: String },
      type: { type: String },      
      required: { type: Boolean }
    }
  ]
});

export default mongoose.model("Job", jobSchema);