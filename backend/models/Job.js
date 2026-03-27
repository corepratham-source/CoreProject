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
  function: String,
  formFields: [
    {
      label: { type: String },
      type: { type: String },      
      required: { type: Boolean }
    }
  ]
});

export default mongoose.model("Job", jobSchema);