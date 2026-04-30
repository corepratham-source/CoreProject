import ReportRequest from "../models/ReportRequest.js";
import Report from "../models/Reports.js"; // 🔥 NEW
import { sendMail } from "../services/gmailService.js";

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
    const emailText = `
Hi ${name},

Here is your requested report:

${report.location} ${report.category} Hiring Intelligence Report

📄 Download Report:
${report.document}

${report.description || ""}

If you have any hiring requirements, please go to jobs.careersatcore.com/client .

— CORE Team
    `;

    await sendMail({
      to: [email],
      subject: `${report.location} ${report.category} Hiring Report`,
      text: emailText
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Report request error:", err);
    res.status(500).json({ error: err.message });
  }
};