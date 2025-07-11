import React, { useState } from "react";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";

function CoverLetterGenerator() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/cover-letter/generate-cover-letter", {
        resumeText,
        jobDescription,
      });
      setGeneratedLetter(response.data.coverLetter);
    } catch (error) {
      alert("Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const fileName = `cover_letter_${Date.now()}`;
      const htmlWrapper = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                line-height: 1.6;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            ${generatedLetter}
          </body>
        </html>
      `;

      // Save HTML to server
      await axios.post("http://localhost:5000/api/cover-letter/save-html", {
        fileName,
        htmlContent: htmlWrapper,
      });

      // Trigger PDF export
      const pdfResponse = await axios.post("http://localhost:5000/api/cover-letter/generate-cover-letter-pdf", {
        fileName,
        coverLetterHtml: htmlWrapper
      });

      const pdfUrl = `http://localhost:5000${pdfResponse.data.pdfUrl}`;
      window.open(pdfUrl, "_blank");

    } catch (error) {
      alert("Failed to export PDF");
      console.error(error);
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>AI-Powered Cover Letter Generator</h3>

      <textarea
        placeholder="Paste your resume here..."
        rows={6}
        style={{ width: "100%", marginBottom: "10px" }}
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />

      <textarea
        placeholder="Paste job description here..."
        rows={6}
        style={{ width: "100%", marginBottom: "10px" }}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>

      {generatedLetter && (
        <>
          <h4 style={{ marginTop: "20px" }}>Your Cover Letter</h4>
          <ReactQuill value={generatedLetter} onChange={setGeneratedLetter} />
          <button style={{ marginTop: "10px" }} onClick={handleDownloadPDF}>
            Export as Formatted PDF
          </button>
        </>
      )}
    </div>
  );
}

export default CoverLetterGenerator;
