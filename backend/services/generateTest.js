import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODELS = [
    "llama-3.3-70b-versatile",
    "moonshotai/kimi-k2-instruct",
    "moonshotai/kimi-k2-instruct-0905",
    "openai/gpt-oss-20b",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "allam-2-7b",
    "llama-3.1-8b-instant",
];

export const generateTestFromJD = async (job) => {
  const prompt = `
You MUST return ONLY valid JSON.

Create a multiple choice test for this job.

RULES:
- 15 to 20 questions
- Each question must have 4 options
- Only ONE correct answer
- Questions must be relevant to the job role, skills, and experience
- Question should be indicative of the candidate's ability to perform the job, not just theoretical knowledge
- Avoid generic questions that could apply to any job
- Focus on practical scenarios and problem-solving related to the job description

FORMAT:
{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "one of the options"
    }
  ]
}

JOB DESCRIPTION:
${job.description}
`;

  for (let model of MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      });

      const content = response.choices[0].message.content;

      const clean = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(clean);

      return parsed.questions || [];

    } catch (err) {
      console.error(`Model ${model} failed:`, err.message);
    }
  }

  // fallback
  return [];
};