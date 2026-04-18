import jwt from "jsonwebtoken";
import Test from "../models/Test.js";
import TestResult from "../models/TestResults.js";

// ✅ GET TEST (via token)
export const getTestByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.TEST_SECRET);

    const { jobId, candidateId } = decoded;

    // Check already attempted
    const existing = await TestResult.findOne({ candidateId, jobId });
    if (existing) {
      return res.status(400).json({ error: "Test already attempted" });
    }

    const test = await Test.findOne({ jobId });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    res.json({
      testId: test._id,
      duration: test.questions.length * test.durationPerQuestion,
      questions: test.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options
      }))
    });

  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};


// SUBMIT TEST
export const submitTest = async (req, res) => {
  try {
    const { token, answers, tabSwitchCount } = req.body;

    const decoded = jwt.verify(token, process.env.TEST_SECRET);

    const { jobId, candidateId } = decoded;

    const test = await Test.findOne({ jobId });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // prevent reattempt
    const existing = await TestResult.findOne({ candidateId, jobId });
    if (existing) {
      return res.status(400).json({ error: "Already submitted" });
    }

    let score = 0;

    const evaluatedAnswers = answers.map(ans => {
      const question = test.questions.id(ans.questionId);

      if (!question) return null;

      const isCorrect = question.correctAnswer === ans.selectedOption;

      if (isCorrect) score += question.marks || 1;

      return {
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        correct: isCorrect
      };
    }).filter(Boolean);

    const total = test.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const result = await TestResult.create({
      candidateId,
      jobId,
      testId: test._id,
      score,
      total,
      answers: evaluatedAnswers,
      tabSwitchCount
    });

    res.json({
      message: "Test submitted",
      score,
      total,
      percentage: ((score / total) * 100).toFixed(2)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// GET RESULTS FOR DASHBOARD
export const getResultsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const results = await TestResult.find({ jobId })
      .populate("candidateId", "name email");

    res.json(
      results.map(r => ({
        name: r.candidateId?.name,
        email: r.candidateId?.email,
        score: r.score,
        total: r.total,
        percentage: ((r.score / r.total) * 100).toFixed(2)
      }))
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};