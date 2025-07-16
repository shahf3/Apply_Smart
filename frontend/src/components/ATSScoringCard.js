import React, { useState } from "react";
import axios from "axios";

function ATSScoringSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-blue-50 pb-2 flex items-center gap-2">📊 ATS Resume Scoring</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume (PDF only)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            required
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea
            rows="6"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-2 hover:from-blue-700 hover:to-purple-700 font-medium">
          {loading ? "Scoring..." : "Score Resume"}
        </button>
      </form>
      {score && (
        <div className="score-result bg-blue-50 rounded-lg p-4 mt-6">
          <h4 className="text-lg font-semibold text-blue-700 mb-2">ATS Score: {score.score}/100</h4>
          <p className="text-gray-700 mb-2">{score.summary}</p>
          <div className="mt-2">
            <h5 className="font-semibold text-blue-600 mb-1">🔍 Missing Keywords:</h5>
            <ul className="flex flex-wrap gap-2 mb-2">
              {score.missing_keywords?.map((kw, i) => (
                <li key={i} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-medium">{kw}</li>
              ))}
            </ul>
            <h5 className="font-semibold text-blue-600 mb-1">⚡ Action Verbs:</h5>
            <ul className="flex flex-wrap gap-2 mb-2">
              {score.action_words?.map((word, i) => (
                <li key={i} className="inline-block bg-purple-100 text-purple-700 rounded px-2 py-1 text-xs font-medium">{word}</li>
              ))}
            </ul>
            <h5 className="font-semibold text-blue-600 mb-1">💡 Improvement Suggestions:</h5>
            <ul className="list-disc ml-6 text-sm text-gray-700">
              {score.improvements?.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default ATSScoringSection;
