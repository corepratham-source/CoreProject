import { generateTestToken } from "../services/testToken.js";
import { Resend } from "resend";
import Application from "../models/Application.js";
const resend = new Resend(process.env.RESEND_API_KEY);
export const sendTestLink = async (req, res) => {
  try {
    const { candidateId, jobId, email } = req.body;

    const token = generateTestToken(candidateId, jobId);
    const application = await Application.findOne({ candidateId });
    const name = application ? application.name : null;
    const link = `${process.env.FRONTEND_URL}/test?token=${token}`;
    const emailHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
      
      <h2 style="color: #111; margin-bottom: 10px;">Assessment Invitation</h2>
      
      <p style="color: #444; font-size: 15px; line-height: 1.6;">
        Hi <strong>${name || "Candidate"}</strong>,
      </p>

      <p style="color: #444; font-size: 15px; line-height: 1.6;">
        Your profile has been evaluated by our system and shows a strong match for a role you applied to. 
        Based on this, the hiring team has expressed interest in moving forward with your application.
      </p>

      <p style="color: #444; font-size: 15px; line-height: 1.6;">
        As the next step, you are required to complete an online assessment. This will help us further evaluate your suitability for the role.
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${link}" 
           style="background: #e11d48; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
          Start Your Test
        </a>
      </div>

      <div style="background: #f9fafb; border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-top: 20px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #111;">Important Instructions:</p>
        <ul style="margin: 0; padding-left: 18px; color: #444; font-size: 14px; line-height: 1.6;">
          <li>This test link is valid for <strong>24 hours</strong> from the time of receiving this email.</li>
          <li>The test can be attempted <strong>only once</strong>.</li>
          <li>Please ensure you complete the test in one sitting.</li>
          <li><strong>Copy-paste actions are strictly prohibited.</strong></li>
          <li><strong>Tab switching or leaving the test window may lead to automatic submission or disqualification.</strong></li>
          <li>Ensure a stable internet connection before starting the test.</li>
        </ul>
      </div>

      <p style="color: #444; font-size: 15px; line-height: 1.6; margin-top: 20px;">
        We recommend attempting the test at the earliest convenience to avoid expiration of the link.
      </p>

      <p style="color: #444; font-size: 15px; line-height: 1.6;">
        Wishing you the very best.
      </p>

      <p style="color: #111; font-weight: bold; margin-top: 20px;">
        — Team CORE
      </p>

      <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; color: #888; text-align: center;">
        This is an automated message. Please do not reply to this email.
      </p>

    </div>
  </div>
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