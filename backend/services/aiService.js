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

export const parseJobDescription = async (text) => {
  const prompt = `
You MUST return ONLY valid JSON.
Function in this context means Sales, Marketing, Engineering, Manufacturing etc.
Salary could be in any currency - convert to INR if possible.
Salary could also be monthly or yearly - convert to yearly if possible.
Salary could also be not in LPA - convert to LPA if possible. Example - 50000 per month should be converted to 6 LPA.
Salary should compulsorily be in LPA and yearly. If you cannot find salary information, return null for both salaryMin and salaryMax.
Experience should be in years. If experience is given in months, convert to years.
SYSTEM CONTEXT

{
  "title": "string",
  "requirements": [],
  "responsibilities": [],
  "experienceMin": number,
  "experienceMax": number,
  "salaryMin": number,
  "salaryMax": number,
  "function": string
}

Text:
${text}
`;

  for (let model of MODELS) {
    try {

      const response = await groq.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);

    } catch (err) {
      console.error(`Model ${model} failed:`, err.message);
    }
  }

  // 🔥 FINAL FALLBACK (never break app)
  return {
    title: "Unknown Role",
    requirements: [],
    responsibilities: [],
    experience: "Not specified"
  };
};