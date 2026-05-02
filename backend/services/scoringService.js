import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-prompt-guard-2-22m",
    "meta-llama/llama-prompt-guard-2-86m",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-safeguard-20b",
    "openai/gpt-oss-20b",
]

export const scoreResume = async (job, resumeText) => {
  const prompt = `
You MUST return ONLY valid JSON.
Score based on 100 points system.
SYSTEM CONTEXT
   CRITICAL RULES:
1. READ THE RAW TEXT YOURSELF — extract all information by reading it carefully
2. PDF-extracted text may have odd spacing or line breaks — still read it and find the data
3. NEVER return final_score of 0 unless the resume is completely blank/unreadable
4. A wrong-industry candidate still scores 15-35% for general transferable skills
5. If salary/location data is missing → EXCLUDE those parameters and re-normalize weights
6. Always find SOMETHING to score — experience years, education, any skills mentioned

SCORING FRAMEWORK (total = 100 points):

1. EXPERIENCE MATCH (25pts):
   Find years of experience from resume dates or statements.
   - Under minimum required → 0-8pts
   - Within JD range → 20-25pts  
   - Slightly over max → 15-18pts
   - Cannot determine from text → 8pts (partial, do not give 0)

2. LOCATION MATCH (15pts):
   Find candidate city/location from resume address section.
   - Exact city match → 15pts | Same region → 8pts | Different → 0pts
   - Cannot determine → EXCLUDE this parameter, re-normalize

3. SALARY COMPATIBILITY (15pts):
   Find current salary from resume if stated.
   - If NOT found → EXCLUDE, re-normalize, note in salary_note
   - Offered ≥10% above current → 15pts | Below threshold → 0pts

4. EDUCATION MATCH (15pts):
   Find degree and field from resume.
   - Exact required qualification → 15pts
   - Related field → 8-12pts
   - Unrelated field → 3-6pts
   - Not mentioned → 5pts (partial)

5. MANAGEMENT & LEADERSHIP (15pts):
   Does resume show people/team management?
   - Full match → 15pts | Partial → 8-12pts | Missing but required → 4-5pts

6. SKILL & DOMAIN RELEVANCE (15pts):
   Compare resume skills vs JD mandatory skills.
   - Same industry, strong match → 12-15pts
   - Adjacent industry → 5-9pts
   - Completely different industry → 1-4pts

7. INTELLIGENT CAREER ASSESSMENT (10pts):
   Industry alignment, career progression, stability.
   - Perfect alignment → 8-10pts | Partial → 4-6pts | Mismatch → 2-3pts

NORMALIZATION: If salary or location excluded, redistribute their weights proportionally across remaining categories.
     ______________
    🔹 SCORING INTERPRETATION
    0-19 → No match (Auto reject)
    20-39 → Very weak match (Reject)
    40-59 → Moderate match (Only if desperate)
    60-74 → Strong match (Recruiter call justified)
    75-89 → Excellent match (High-priority outreach)
    90-100 → Near-perfect fit (Immediate action)
{
  "score": number,
  "feedback": "string"
}

Compare this resume with job.

JOB:
${job.description}

RESUME:
${resumeText}
`;

  for (let model of MODELS) {
    try {


      const response = await groq.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });

      const content = response.choices[0].message.content;

      const clean = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
      const parsed = JSON.parse(clean);

      return {
        score: parsed.score ?? 0,
        feedback: parsed.feedback ?? "No feedback"
      };

    } catch (err) {
      console.error(`Model ${model} failed:`, err.message);
    }
  }

  // 🔥 FINAL FALLBACK
  return {
    score: 50,
    feedback: "Fallback scoring due to AI failure"
  };
};