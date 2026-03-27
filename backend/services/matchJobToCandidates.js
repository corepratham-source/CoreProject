import Job from "../models/Job.js";
import Application from "../models/Application.js";
import PairedScore from "../models/PairedScores.js";
import { scoreResume } from "./scoringService.js";

/**
 * Utility → range with 15% tolerance
 */
const withTolerance = (min, max) => {
  if (min == null && max == null) return [null, null];

  const tolMin = min != null ? min * 0.85 : null;
  const tolMax = max != null ? max * 1.15 : null;

  return [tolMin, tolMax];
};

export const matchJobToCandidates = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  let candidates = await Application.find();

  // 🔹 STEP 1: EXPERIENCE FILTER
  if (job.experienceMin != null || job.experienceMax != null) {
    const [minExp, maxExp] = withTolerance(job.experienceMin, job.experienceMax);

    candidates = candidates.filter(c => {
      if (c.experience == null) return true;
      if (minExp != null && c.experience < minExp) return false;
      if (maxExp != null && c.experience > maxExp) return false;
      return true;
    });
  }
  console.log(`After experience filter: ${candidates.length} candidates`);

  // 🔹 STEP 2: SALARY FILTER (skip if JD doesn't have it)
  if (job.salaryMin != null || job.salaryMax != null) {
    const [minSal, maxSal] = withTolerance(job.salaryMin, job.salaryMax);

    candidates = candidates.filter(c => {
      if (c.salary == null) return true;
      if (minSal != null && c.salary < minSal) return false;
      if (maxSal != null && c.salary > maxSal) return false;
      return true;
    });
  }

  console.log(`After salary filter: ${candidates.length} candidates`);

  // 🔹 STEP 3: FUNCTION FILTER
  if (job.function) {
    candidates = candidates.filter(c =>
      !c.function || c.function.toLowerCase() === job.function.toLowerCase()
    );
  }
  console.log(`After function filter: ${candidates.length} candidates`);

  // 🔥 STEP 4: LLM SCORING (only filtered candidates)
  const results = [];

  await Promise.all(
    candidates.map(async (candidate) => {
      try {
        // ✅ Check cache first
        const existing = await PairedScore.findOne({
          jobId,
          applicationId: candidate._id
        });

        if (existing) {
          results.push({
            candidate,
            score: existing.score,
            feedback: existing.feedback
          });
          return;
        }

        // 🔹 Score using LLM
        const { score, feedback } = await scoreResume(job, candidate.resumeText);

        // 🔹 Save (avoid duplicates)
        try {
          await PairedScore.create({
            jobId,
            applicationId: candidate._id,
            score,
            feedback
          });
        } catch (err) {
          // duplicate safe
        }

        results.push({ candidate, score, feedback });

      } catch (err) {
        console.error("Scoring error:", err.message);
      }
    })
  );

  return results.sort((a, b) => b.score - a.score);
};