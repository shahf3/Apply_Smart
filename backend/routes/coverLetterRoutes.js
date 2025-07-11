const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { exec } = require("child_process");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const router = express.Router();
const upload = multer({ dest: "uploads/" });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// === Route: Convert PDF to HTML (via pdf2htmlex) ===
router.post("/convert-pdf-to-html", upload.single("resume"), async (req, res) => {
  const filePath = req.file.path;
  const fileName = path.basename(filePath, path.extname(filePath));
  const htmlOutputDir = path.join(__dirname, "..", "public", "html");
  const htmlOutputPath = path.join(htmlOutputDir, `${fileName}.html`);

  if (!fs.existsSync(htmlOutputDir)) {
    fs.mkdirSync(htmlOutputDir, { recursive: true });
  }

  const cmd = `pdf2htmlex ${filePath} ${htmlOutputPath}`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Conversion error: ${stderr}`);
      return res.status(500).json({ error: "Failed to convert PDF" });
    }

    const publicUrl = `/html/${fileName}.html`;
    res.json({ htmlUrl: publicUrl });
  });
});

// === Route: Save HTML content to file ===
router.post("/save-html", (req, res) => {
  const { fileName, htmlContent } = req.body;
  const filePath = path.join(__dirname, "..", "public", "html", `${fileName}.html`);
  fs.writeFile(filePath, htmlContent, (err) => {
    if (err) {
      console.error("Failed to save HTML:", err);
      return res.status(500).json({ error: "Failed to save HTML" });
    }
    res.json({ message: "HTML saved successfully" });
  });
});

// === Route: Export saved HTML as PDF ===
router.post("/export-pdf", (req, res) => {
  const { fileName } = req.body;
  const htmlPath = path.join(__dirname, "..", "public", "html", `${fileName}.html`);
  const pdfPath = path.join(__dirname, "..", "public", "pdf", `${fileName}.pdf`);

  if (!fs.existsSync(htmlPath)) {
    return res.status(404).json({ error: "HTML file not found" });
  }

  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

  const cmd = `wkhtmltopdf file://${htmlPath} ${pdfPath}`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`PDF export error: ${stderr}`);
      return res.status(500).json({ error: "Failed to export PDF" });
    }

    const publicPdfUrl = `/pdf/${fileName}.pdf`;
    res.json({ pdfUrl: publicPdfUrl });
  });
});

// === Route: Generate cover letter with Gemini AI ===
router.post("/generate-cover-letter", async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: "Resume and job description are required." });
  }

  const prompt = `You are a professional career assistant. Write a highly personalized and ATS-optimized cover letter tailored to the job description below, using the candidate's resume information.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return ONLY the letter content, no formatting, no explanation. Make it professional, concise, and enthusiastic.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text().trim();

    res.json({ coverLetter });
  } catch (error) {
    console.error("Gemini cover letter error:", error);
    res.status(500).json({ error: "Failed to generate cover letter." });
  }
});

// === Route: Generate PDF from cover letter HTML ===
router.post("/generate-cover-letter-pdf", async (req, res) => {
  const { fileName, coverLetterHtml } = req.body;

  if (!fileName || !coverLetterHtml) {
    return res.status(400).json({ error: "Missing fileName or coverLetterHtml" });
  }

  const htmlPath = path.join(__dirname, "..", "public", "html", `${fileName}.html`);
  const pdfPath = path.join(__dirname, "..", "public", "pdf", `${fileName}.pdf`);

  try {
    fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

    fs.writeFileSync(htmlPath, coverLetterHtml, "utf8");
    console.log("HTML written to:", htmlPath);

    const cmd = `wkhtmltopdf file://${htmlPath} ${pdfPath}`;
    console.log("Running command:", cmd);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("wkhtmltopdf error:", error);
        console.error("stderr:", stderr);
        return res.status(500).json({ error: "PDF generation failed" });
      }

      console.log("PDF generation stdout:", stdout);
      console.log("PDF written to:", pdfPath);

      const publicUrl = `/pdf/${fileName}.pdf`;
      return res.json({ pdfUrl: publicUrl });
    });
  } catch (err) {
    console.error("Cover letter PDF export failed:", err);
    res.status(500).json({ error: "Failed to create cover letter PDF" });
  }
});

module.exports = router;
