import Application from "../models/Application.js";
import { extractResumeText } from "../services/resumeParser.js";
import { matchCandidateToJobs } from "../services/matchCandidateToJobs.js";
import { uploadToCloudinary  } from "../services/uploadResume.js";
import { Resend } from "resend";
import fs from "fs";

const resend = new Resend(process.env.RESEND_API_KEY);

export const createApplication = async (req, res) => {
  const file = req.file;
  let filePath = null;
  let resUrl = null;
  if (!file) {
    console.warn("[ApplicationController] WARNING: No resume file provided");
    return res.status(400).json({ error: "Resume file is required" });
  }
  try {
    console.log("[ApplicationController] INFO: Uploading resume to Cloudinary");
    if (req.file) {
      const uploadResult = await uploadToCloudinary (req.file.path, "resumes");
      resUrl = uploadResult.url;
      console.log("[ApplicationController] INFO: Resume uploaded successfully");
    }

    filePath = file.path;
    console.log("[ApplicationController] INFO: Extracting resume text");
    const resume = await extractResumeText(filePath);
    console.log("[ApplicationController] INFO: Resume text extracted, length:", resume?.length || 0);
    console.log("[ApplicationController] INFO: Creating application in DB");
    const application = await Application.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      experience: req.body.experience,
      currentSalary: req.body.currentSalary,
      expectedSalary: req.body.expectedSalary,
      function: req.body.functionCategory,
      subFunction: req.body.subFunction,
      noticePeriod: req.body.noticePeriod,
      currentLocation: req.body.currentLocation,
      pincode: req.body.pincode,
      openToRelocation: req.body.openToRelocation,
      resumeText: resume,
      resumeURL: resUrl
    });

    console.log("[ApplicationController] INFO: Application created successfully, ID:", application._id);
    res.status(201).json(application);
  } catch (err) {
    console.error("[ApplicationController] ERROR: Failed to create application:", err.message);
    console.error("[ApplicationController] STACK:", err.stack);
    console.error("Create application error:", err);
    res.status(500).json({ error: err.message });
  }
  finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("[ApplicationController] ERROR: Failed to delete temp file:", err.message);
        } else {
          console.log("[ApplicationController] INFO: Temp file deleted:", filePath);
        }
      });
    }
  }
};


export const matchJobsForCandidate = async (req, res) => {
  console.log("[ApplicationController] INFO: matchJobsForCandidate called, applicationId:", req.params.applicationId);
  try {
    const { applicationId } = req.params;
    console.log("[ApplicationController] INFO: Matching jobs for candidate:", applicationId);
    console.log("[ApplicationController] INFO: Running matchCandidateToJobs");
    const results = await matchCandidateToJobs(applicationId);
    console.log("[ApplicationController] INFO: Match results count:", results.length);
    const candidate = await Application.findById(applicationId);

    const filteredResults = results.filter(r => r.score >= 70);
    console.log("[ApplicationController] INFO: Filtered results (score >= 70):", filteredResults.length);
    if (filteredResults.length > 0) {
        console.log("[ApplicationController] INFO: Sending match email with jobs");
        const generateChartUrl = (score) => {
  const rounded = Math.round(score);

  const chartConfig = {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [rounded, 100 - rounded],
          backgroundColor: ["#16a34a", "#e5e7eb"]
        }
      ]
    },
    options: {
      cutout: "70%",
      plugins: {
        legend: { display: false }
      }
    }
  };

  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify(chartConfig)
  )}`;
};

const jobCards = filteredResults.map((r, i) => `
  <div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:16px;">
    
    <h3 style="margin:0 0 8px 0;color:#111827;">
      ${i + 1}. ${r.job.title}
    </h3>

    <img src="${generateChartUrl(Math.round(r.score))}" 
         style="width:120px;height:120px;display:block;margin:10px auto;" />

    <p style="text-align:center;font-weight:bold;color:#16a34a;">
      ${r.score.toFixed(1)}% Match
    </p>

    <p style="color:#374151;font-size:14px;">
      ${r.feedback}
    </p>
  </div>
`).join("");

const emailHtml = `
<div style="font-family:Arial,sans-serif;background:#f9fafb;padding:24px;">

  <div style="max-width:600px;margin:auto;background:white;border-radius:12px;padding:24px;">

    <h2 style="margin:0;color:#111827;">
    High Match Candidate Identified
    </h2>

    <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />

    <h3 style="margin-bottom:8px;">Candidate</h3>
    <p style="margin:4px 0;"><strong>Name:</strong> ${candidate.name}</p>
    <p style="margin:4px 0;"><strong>Email:</strong> ${candidate.email}</p>
    <p style="margin:4px 0;"><strong>Phone:</strong> ${candidate.phone}</p>
    <p style="margin:4px 0;"><strong>Experience:</strong> ${candidate.experience} years</p>
    <p style="margin:4px 0;"><strong>Current Salary:</strong> ${candidate.currentSalary} LPA</p>
    <p style="margin:4px 0;"><strong>Notice Period:</strong> ${candidate.noticePeriod} days</p>
    <p style="margin:4px 0;"><strong>Current Location:</strong> ${candidate.currentLocation}</p>
    <p style="margin:4px 0;"><strong>Pincode:</strong> ${candidate.pincode}</p>
    <p style="margin:4px 0;"><strong>Open to Relocation:</strong> ${candidate.openToRelocation ? 'Yes' : 'No'}</p>

    <div style="margin:16px 0;">
      <a href="${candidate.resumeURL || '#'}"
         style="display:inline-block;padding:10px 16px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
         View Resume
      </a>
    </div>

    <h3>Matched Jobs</h3>

    ${jobCards}

    <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />

    <p style="font-size:12px;color:#6b7280;text-align:center;">
      Generated by CORE Hiring Engine
    </p>

  </div>
</div>
`;

        
        try {
          await resend.emails.send({
            from: "Core Team <no-reply@careersatcore.com>",
            to: ["prathamchiragghosh@gmail.com","rajiv.ghoshrajiv@gmail.com", "shantanu@careersatcore.com", "piyali@careersatcore.com"],
            subject: `New Candidate Match: ${candidate.name}`,
            html: emailHtml
          });
        console.log("[ApplicationController] INFO: Match email sent successfully");
      } catch (err) {
        console.error("[ApplicationController] ERROR: Failed to send match email:", err.message);
      }
    }
    if (filteredResults.length == 0) {
        console.log("[ApplicationController] INFO: No strong matches found, sending notification email");
        const emailHtml = `
<div style="font-family:Arial,sans-serif;background:#f9fafb;padding:24px;">

  <div style="max-width:600px;margin:auto;background:white;border-radius:12px;padding:24px;">

    <h2 style="color:#111827;">New Candidate Profile</h2>

    <hr style="margin:16px 0;" />

    <p><strong>Name:</strong> ${candidate.name}</p>
    <p><strong>Email:</strong> ${candidate.email}</p>
    <p><strong>Phone:</strong> ${candidate.phone}</p>
    <p><strong>Experience:</strong> ${candidate.experience} years</p>
    <p><strong>Current Salary:</strong> ${candidate.currentSalary} LPA</p>
    <p><strong>Expected Salary:</strong> ${candidate.expectedSalary} LPA</p>
    <p><strong>Notice Period:</strong> ${candidate.noticePeriod} days</p>
    <p><strong>Current Location:</strong> ${candidate.currentLocation}</p>
    <p><strong>Pincode:</strong> ${candidate.pincode}</p>
    <p><strong>Open to Relocation:</strong> ${candidate.openToRelocation ? 'Yes' : 'No'}</p>
    <p><strong>Function:</strong> ${candidate.function}</p>
    <p><strong>Sub-Function:</strong> ${candidate.subFunction}</p>

    <div style="margin:16px 0;">
      <a href="${candidate.resumeURL || '#'}"
         style="display:inline-block;padding:10px 16px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
         View Resume
      </a>
    </div>

    <div style="padding:12px;background:#fef3c7;border-radius:8px;color:#92400e;">
      No strong matches found for this candidate yet.
    </div>

    <hr style="margin:24px 0;" />

    <p style="font-size:12px;color:#6b7280;text-align:center;">
      Generated by CORE Hiring Engine
    </p>

  </div>
</div>
`;
        
        try {
          await resend.emails.send({
            from: "Core Team <no-reply@careersatcore.com>",
            to: ["prathamchiragghosh@gmail.com","rajiv.ghoshrajiv@gmail.com", "shantanu@careersatcore.com", "piyali@careersatcore.com"],
            subject: `New Candidate: ${candidate.name}`,
            html: emailHtml
          });
          console.log("[ApplicationController] INFO: Candidate notification email sent");
      } catch (err) {
        console.error("[ApplicationController] ERROR: Failed to send candidate notification email:", err.message);
      }
    }

    console.log("[ApplicationController] INFO: Returning match results");
    res.json({
      count: results.length,
      matches: results.map(r => ({
        jobId: r.job._id,
        title: r.job.title,
        score: r.score,
        feedback: r.feedback
      }))
    });

  } catch (err) {
    console.error("[ApplicationController] ERROR: Candidate match error:", err.message);
    console.error("[ApplicationController] STACK:", err.stack);
    res.status(500).json({ error: err.message });
  }
};