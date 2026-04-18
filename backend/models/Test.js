import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [
    {
      type: String,
      required: true
    }
  ],
  correctAnswer: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    default: 1
  }
});

const testSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
    unique: true // 🔥 One test per job (you can remove if multiple tests needed)
  },

  title: {
    type: String,
    default: "Assessment Test"
  },

  instructions: {
    type: String,
    default: "Answer all questions carefully."
  },

  questions: [questionSchema],

  durationPerQuestion: {
    type: Number,
    default: 60 // seconds (you wanted 1 min per question)
  },

  totalMarks: {
    type: Number,
    default: function () {
      return this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    }
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default mongoose.model("Test", testSchema);