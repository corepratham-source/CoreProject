import jwt from "jsonwebtoken";

export const generateTestToken = (candidateId, jobId) => {
  return jwt.sign(
    { candidateId, jobId },
    process.env.TEST_SECRET,
    { expiresIn: "1d" }
  );
};