import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";

function CoverLetterGenerator() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [loading, setLoading] = useState(false);

  // Design System
  const designSystem = {
    colors: {
      primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
      accent: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
      neutral: {
        50: "bg-gray-50",
        100: "bg-gray-100",
        200: "bg-gray-200",
        900: "text-gray-900",
      },
      success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      error: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    typography: {
      heading: "font-sans font-bold text-gray-900",
      subheading: "font-sans font-medium text-gray-600",
      body: "font-sans text-gray-700",
    },
    spacing: {
      xs: "p-2",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
    shadows: {
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
    },
    borders: {
      default: "border border-gray-200",
      accent: "border border-blue-200",
    },
  };

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

  // Skeleton Loader
  const SkeletonLoader = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="animate-pulse space-y-4"
    >
      <div className={`${designSystem.colors.neutral[100]} h-8 rounded-md`} />
      <div className={`${designSystem.colors.neutral[100]} h-24 rounded-md`} />
      <div className={`${designSystem.colors.neutral[100]} h-24 rounded-md`} />
      <div className={`${designSystem.colors.neutral[100]} h-12 rounded-md`} />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl ${designSystem.shadows.lg} ${designSystem.borders.accent} ${designSystem.spacing.md}`}
      role="region"
      aria-label="Cover Letter Generator Section"
    >
      <h3
        className={`${designSystem.typography.heading} text-lg mb-4 border-b ${designSystem.borders.accent} pb-2 flex items-center gap-2`}
        data-tooltip-id="cover-letter-heading"
        data-tooltip-content="Generate a tailored cover letter"
      >
        ✍️ Cover Letter Generator
      </h3>
      <Tooltip id="cover-letter-heading" />
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          <textarea
            placeholder="Paste your resume here..."
            rows={4}
            className={`w-full ${designSystem.borders.default} rounded-lg ${designSystem.spacing.xs} mb-2 focus:ring-2 ${designSystem.colors.primary.split(" ")[2]}`}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            aria-label="Enter resume text"
          />
          <textarea
            placeholder="Paste job description here..."
            rows={4}
            className={`w-full ${designSystem.borders.default} rounded-lg ${designSystem.spacing.xs} mb-2 focus:ring-2 ${designSystem.colors.primary.split(" ")[2]}`}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            aria-label="Enter job description"
          />
          <motion.button
            onClick={handleGenerate}
            disabled={loading}
            className={`${designSystem.colors.primary} text-white rounded-lg ${designSystem.spacing.xs} font-medium mb-2 disabled:opacity-50`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={loading ? "Generating cover letter" : "Generate cover letter"}
          >
            {loading ? "Generating..." : "Generate Cover Letter"}
          </motion.button>
          {generatedLetter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-4"
            >
              <h4
                className={`${designSystem.typography.heading} text-base mb-2`}
                data-tooltip-id="generated-letter"
                data-tooltip-content="Your generated cover letter"
              >
                Your Cover Letter
              </h4>
              <Tooltip id="generated-letter" />
              <div className={`${designSystem.colors.neutral[50]} rounded-lg ${designSystem.spacing.sm} mb-2`}>
                <ReactQuill
                  value={generatedLetter}
                  onChange={setGeneratedLetter}
                  className="bg-white"
                  aria-label="Edit generated cover letter"
                />
              </div>
              <motion.button
                className={`${designSystem.colors.success} text-white rounded-lg ${designSystem.spacing.xs} font-medium`}
                onClick={handleDownloadPDF}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Export cover letter as PDF"
              >
                Export as Formatted PDF
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default CoverLetterGenerator;