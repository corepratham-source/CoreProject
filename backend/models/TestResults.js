import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  selectedOption: String,
  correct: Boolean
});

const testResultSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application", // matches your Application model :contentReference[oaicite:0]{index=0}
    required: true
  },

  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },

  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },

  score: Number,
  total: Number,

  answers: [answerSchema],

  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  tabSwitchCount: {
  type: Number,
  default: 0
}

}, { timestamps: true });

// 🔥 Prevent multiple attempts
testResultSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

export default mongoose.model("TestResult", testResultSchema);