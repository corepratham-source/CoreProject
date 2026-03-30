import cloudinary from "./cloudinary.js";
import fs from "fs";

export const uploadResumeToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "resumes",
      resource_type: "raw", // 🔥 IMPORTANT for PDFs/DOCX
    });

    // delete local temp file after upload
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw err;
  }
};