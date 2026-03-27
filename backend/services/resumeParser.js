import { readFile } from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

/**
 * Extract text from PDF
 */
export const extractFromPDF = async (filePath) => {
  try {
    const buffer = await readFile(filePath);
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text.trim();
  } catch (err) {
    console.error("PDF extraction error:", err.message);
    return "";
  }
};

/**
 * Extract text from DOC/DOCX
 */
export const extractFromDOC = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value?.trim() || "";
  } catch (err) {
    console.error("DOC extraction error:", err.message);
    return "";
  }
};

/**
 * Auto-detect file type and extract text
 */
export const extractResumeText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") return await extractFromPDF(filePath);
  if (ext === ".docx") return await extractFromDOC(filePath);
  if (ext === ".doc") {
    console.warn("⚠️ .doc fallback (limited support)");
    return await extractFromDOC(filePath);
  }

  throw new Error(`Unsupported file format: ${ext}`);
};