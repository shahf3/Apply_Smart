import React, { useState } from "react";
import axios from "axios";

function ATSScoringSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  //const [feedback, setFeedback] = useState("");

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
      //setFeedback(res.data.summary);
    } catch (err) {
      console.error("Scoring failed:", err);
      alert("Failed to score resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card ats-scoring">
      <h3>
        <div className="icon">📊</div>
        ATS Resume Scoring
      </h3>

      <form onSubmit={handleSubmit} className="ats-form">
        <div className="form-group">
          <label>Upload Resume (PDF only)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            required
          />
        </div>

        <div className="form-group">
          <label>Job Description</label>
          <textarea
            rows="6"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="score-button">
          {loading ? "Scoring..." : "Score Resume"}
        </button>
      </form>

      {score && (
        <div className="score-result">
          <h4>ATS Score: {score.score}/100</h4>
          <p>{score.summary}</p>

          <div>
            <h5>🔍 Missing Keywords:</h5>
            <ul>
              {score.missing_keywords?.map((kw, i) => (
                <li key={i}>{kw}</li>
              ))}
            </ul>

            <h5>⚡ Action Verbs:</h5>
            <ul>
              {score.action_words?.map((word, i) => (
                <li key={i}>{word}</li>
              ))}
            </ul>

            <h5>💡 Improvement Suggestions:</h5>
            <ul>
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
