import ReportRequest from "../models/ReportRequest.js";
import Report from "../models/Reports.js"; // 🔥 NEW
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const requestReport = async (req, res) => {
  try {
    const { name, company, email, reportId } = req.body;

    const existing = await ReportRequest.findOne({ email });

    if (existing) {
    return res.status(400).json({
        error: "You have already requested a report"
    });
    }
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // 🔹 save lead
    await ReportRequest.create({
      name,
      company,
      email,
      reportId
    });

    // 🔥 EMAIL WITH ACTUAL REPORT LINK
    const emailHtml = `
Hi ${name},

Here is your requested report:

${report.location} ${report.category} Hiring Intelligence Report

📄 Download Report:
${report.document}

${report.description || ""}

If you have any hiring requirements, please go to jobs.careersatcore.com/client .

— CORE Team
    `;
try {
          await resend.emails.send({
            from: "Core Team <no-reply@careersatcore.com>",
            to: [email],
            subject: `${report.location} ${report.category} Hiring Report`,
            html: emailHtml
          });
        console.log("[ApplicationController] INFO: Match email sent successfully");
      } catch (err) {
        console.error("[ApplicationController] ERROR: Failed to send match email:", err.message);
      }
    
    
    res.json({ success: true });

  } catch (err) {
    console.error("Report request error:", err);
    res.status(500).json({ error: err.message });
  }
};