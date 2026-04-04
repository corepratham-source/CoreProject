import Job from "../models/Job.js";
import Application from "../models/Application.js";
import PairedScore from "../models/PairedScores.js";
import { scoreResume } from "./scoringService.js";

const withTolerance = (min, max) => {
  if (min == null && max == null) return [null, null];

  const tolMin = min != null ? min * 0.70 : null;
  const tolMax = max != null ? max * 1.30 : null;

  return [tolMin, tolMax];
};

export const matchCandidateToJobs = async (applicationId) => {
  const candidate = await Application.findById(applicationId);
  if (!candidate) throw new Error("Candidate not found");

  let jobs = await Job.find();

  // 🔹 EXPERIENCE FILTER
  jobs = jobs.filter(job => {
    if (candidate.experience == null) return true;

    const [minExp, maxExp] = withTolerance(job.experienceMin, job.experienceMax);

    if (minExp != null && candidate.experience < minExp) return false;
    if (maxExp != null && candidate.experience > maxExp) return false;

    return true;
  });

  // 🔹 SALARY FILTER (skip if JD missing)
  jobs = jobs.filter(job => {
    if (candidate.expectedSalary == null || candidate.expectedSalary == 0) return true;
    if (job.salaryMin == null || job.salaryMax == null || job.salaryMin <= 0 || job.salaryMax <= 0) return true;

    const [minSal, maxSal] = withTolerance(job.salaryMin, job.salaryMax);

    if (minSal != null && candidate.expectedSalary < minSal) return false;
    if (maxSal != null && candidate.expectedSalary > maxSal) return false;

    return true;
  });


  // 🔹 FUNCTION FILTER
  if (candidate.function) {
    jobs = jobs.filter(job =>
      !job.function || job.function.toLowerCase() === candidate.function.toLowerCase()
    );
  }


  // 🔥 LLM SCORING
  const results = [];

  await Promise.all(
    jobs.map(async (job) => {
      try {
        const existing = await PairedScore.findOne({
          jobId: job._id,
          applicationId
        });

        if (existing) {
          results.push({
            job,
            score: existing.score,
            feedback: existing.feedback
          });
          return;
        }

        const { score, feedback } = await scoreResume(job, candidate.resumeText);

        try {
          await PairedScore.create({
            jobId: job._id,
            applicationId,
            score,
            feedback
          });
        } catch (err) {}

        results.push({ job, score, feedback });

      } catch (err) {
        console.error("Scoring error:", err.message);
      }
    })
  );

  return results.sort((a, b) => b.score - a.score);
};