import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import axios from "axios";

function ATSScoringSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const designSystem = {
    colors: {
      primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
      accent: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
      neutral: {
        "50": "bg-gray-50",
        "100": "bg-gray-100",
        "200": "bg-gray-200",
        "900": "text-gray-900",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !jobDescription) {
      alert("Please upload a resume and enter a job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("jobDescription", jobDescription);

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/score-resume",
        formData
      );
      setScore(res.data.score);
    } catch (err) {
      alert("Failed to score resume");
    } finally {
      setLoading(false);
    }
  };

  const SkeletonLoader = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="animate-pulse space-y-4"
    >
      <div className={`${designSystem.colors.neutral["100"]} h-8 rounded-md`} />
      <div className={`${designSystem.colors.neutral["100"]} h-40 rounded-md`} />
      <div className={`${designSystem.colors.neutral["100"]} h-12 rounded-md`} />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl ${designSystem.shadows.lg} ${designSystem.borders.accent} ${designSystem.spacing.md}`}
      role="region"
      aria-label="ATS Resume Scoring Section"
    >
      <h3
        className={`${designSystem.typography.heading} text-lg mb-4 border-b ${designSystem.borders.accent} pb-2 flex items-center gap-2`}
        data-tooltip-id="ats-heading"
        data-tooltip-content="Score your resume against job descriptions"
      >
        📊 ATS Resume Scoring
      </h3>
      <Tooltip id="ats-heading" />
      {loading ? (
        <SkeletonLoader />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`${designSystem.typography.body} block text-sm font-medium mb-1`}
            >
              Upload Resume (PDF only)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              required
              className={`block w-full text-sm ${designSystem.typography.body} ${designSystem.borders.default} rounded-lg cursor-pointer ${designSystem.colors.neutral["50"]} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Upload resume in PDF format"
            />
          </div>
          <div>
            <label
              className={`${designSystem.typography.body} block text-sm font-medium mb-1`}
            >
              Job Description
            </label>
            <textarea
              rows="6"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              className={`w-full ${designSystem.borders.default} rounded-lg ${designSystem.spacing.xs} focus:ring-2 focus:ring-blue-500`}
              aria-label="Enter job description"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className={`${designSystem.colors.primary} text-white rounded-lg ${designSystem.spacing.xs} font-medium disabled:opacity-50`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={loading ? "Scoring resume" : "Score resume"}
          >
            {loading ? "Scoring..." : "Score Resume"}
          </motion.button>
        </form>
      )}
      {score && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`score-result ${designSystem.colors.neutral["50"]} rounded-lg ${designSystem.spacing.sm} mt-6`}
        >
          <h4
            className={`${designSystem.typography.heading} text-lg mb-2`}
            data-tooltip-id="ats-score"
            data-tooltip-content="Your resume's ATS compatibility score"
          >
            ATS Score: {score.score}/100
          </h4>
          <Tooltip id="ats-score" />
          <p className={`${designSystem.typography.body} mb-2`}>
            {score.summary}
          </p>
          <div className="mt-2">
            <h5
              className={`${designSystem.typography.subheading} mb-1`}
              data-tooltip-id="missing-keywords"
              data-tooltip-content="Keywords missing from your resume"
            >
              🔍 Missing Keywords:
            </h5>
            <Tooltip id="missing-keywords" />
            <ul className="flex flex-wrap gap-2 mb-2">
              {score.missing_keywords?.map((kw, i) => (
                <motion.li
                  key={i}
                  className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {kw}
                </motion.li>
              ))}
            </ul>
            <h5
              className={`${designSystem.typography.subheading} mb-1`}
              data-tooltip-id="action-words"
              data-tooltip-content="Action verbs detected in your resume"
            >
              ⚡ Action Verbs:
            </h5>
            <Tooltip id="action-words" />
            <ul className="flex flex-wrap gap-2 mb-2">
              {score.action_words?.map((word, i) => (
                <motion.li
                  key={i}
                  className="inline-block bg-purple-100 text-purple-700 rounded px-2 py-1 text-xs font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {word}
                </motion.li>
              ))}
            </ul>
            <h5
              className={`${designSystem.typography.subheading} mb-1`}
              data-tooltip-id="improvements"
              data-tooltip-content="Suggestions to improve your resume"
            >
              💡 Improvement Suggestions:
            </h5>
            <Tooltip id="improvements" />
            <ul className={`list-disc ml-6 text-sm ${designSystem.typography.body}`}>
              {score.improvements?.map((tip, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {tip}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ATSScoringSection;
