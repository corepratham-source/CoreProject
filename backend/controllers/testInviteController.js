import { generateTestToken } from "../services/testToken.js";
import { Resend } from "resend";

export const sendTestLink = async (req, res) => {
  try {
    const { candidateId, jobId, email } = req.body;

    const token = generateTestToken(candidateId, jobId);

    const link = `${process.env.FRONTEND_URL}/test?token=${token}`;
    const emailHtml = `<p>Hello,</p>
      <p>You have been invited to take a test for a job you applied to. Please click the link below to start the test:</p>
      <a href="${link}">Take Test</a>
      <p>Best of luck!</p>
    `;
    try {
              await resend.emails.send({
                from: "Core Team <no-reply@careersatcore.com>",
                to: [email],
                subject: `Test Invitation`,
                html: emailHtml
              });
          } catch (err) {
            console.error("Mail failed:", err.message);
          } 

    res.json({ message: "Test link sent", link });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};