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

      await axios.post("http://localhost:5000/api/cover-letter/save-html", {
        fileName,
        htmlContent: htmlWrapper,
      });

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
    <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-blue-50 pb-2 flex items-center gap-2">✍️ Cover Letter Generator</h3>
      <textarea
        placeholder="Paste your resume here..."
        rows={4}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-blue-500"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />
      <textarea
        placeholder="Paste job description here..."
        rows={4}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-blue-500"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-2 hover:from-blue-700 hover:to-purple-700 font-medium mb-2"
      >
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>
      {generatedLetter && (
        <div className="mt-4">
          <h4 className="text-base font-semibold text-gray-800 mb-2">Your Cover Letter</h4>
          <div className="bg-gray-50 rounded-lg p-4 mb-2">
            <ReactQuill value={generatedLetter} onChange={setGeneratedLetter} />
          </div>
          <button
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 font-medium"
            onClick={handleDownloadPDF}
          >
            Export as Formatted PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default CoverLetterGenerator;
