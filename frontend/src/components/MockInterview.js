import React, { useState } from "react";
import axios from "axios";
import { ReactMediaRecorder } from "react-media-recorder";

const MockInterview = () => {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answerMode, setAnswerMode] = useState("text"); // "text" or "video"
  const [videoBlob, setVideoBlob] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Upload resume and job description
  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (resumeFile) formData.append("resume", resumeFile);
    if (jobDescriptionFile) formData.append("jobDescriptionFile", jobDescriptionFile);
    if (jobDescription) formData.append("jobDescription", jobDescription);
    try {
      const res = await axios.post("http://localhost:5000/api/interview/generate-questions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setQuestions(res.data.questions);
      setStep(2);
    } catch (err) {
      alert("Failed to generate questions. Please try again.");
    }
    setLoading(false);
  };

  // Step 2: Answer questions
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (answerMode === "text") {
        const res = await axios.post("http://localhost:5000/api/interview/evaluate-answer", {
          answer,
          question: questions[currentQuestionIdx],
          jobDescription,
        });
        setFeedback(res.data);
      } else if (answerMode === "video" && videoBlob) {
        const formData = new FormData();
        formData.append("video", videoBlob, "answer.webm");
        formData.append("question", questions[currentQuestionIdx]);
        formData.append("jobDescription", jobDescription);
        const res = await axios.post("http://localhost:5000/api/interview/evaluate-video-answer", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setFeedback(res.data);
      }
    } catch (err) {
      alert("Failed to evaluate answer. Please try again.");
    }
    setLoading(false);
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setAnswer("");
    setVideoBlob(null);
    setAnswerMode("text");
    setCurrentQuestionIdx((idx) => idx + 1);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">AI Mock Interview</h2>
      {step === 1 && (
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Upload Resume (PDF/DOCX):</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} required className="block" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Job Description (paste or upload):</label>
            <textarea
              className="w-full border rounded p-2"
              rows={4}
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
            <div className="mt-2">
              <input type="file" accept=".pdf,.txt" onChange={e => setJobDescriptionFile(e.target.files[0])} />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700" disabled={loading}>
            {loading ? "Generating Questions..." : "Start Interview"}
          </button>
        </form>
      )}
      {step === 2 && questions.length > 0 && currentQuestionIdx < questions.length && (
        <div>
          <div className="mb-4">
            <span className="font-semibold">Question {currentQuestionIdx + 1} of {questions.length}:</span>
            <p className="mt-2 text-lg">{questions[currentQuestionIdx]}</p>
          </div>
          <div className="flex gap-2 mb-2">
            <button
              className={`px-3 py-1 rounded ${answerMode === "text" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => setAnswerMode("text")}
              type="button"
            >
              Text Answer
            </button>
            <button
              className={`px-3 py-1 rounded ${answerMode === "video" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => setAnswerMode("video")}
              type="button"
            >
              Video Answer
            </button>
          </div>
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            {answerMode === "text" && (
              <textarea
                className="w-full border rounded p-2"
                rows={4}
                placeholder="Type your answer here..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                required
              />
            )}
            {answerMode === "video" && (
              <div>
                <ReactMediaRecorder
                  video
                  render={({ status, startRecording, stopRecording, mediaBlobUrl, clearBlob }) => (
                    <div>
                      <p>Status: {status}</p>
                      <video src={mediaBlobUrl} controls autoPlay={false} className="w-full mb-2" />
                      <div className="flex gap-2">
                        <button type="button" onClick={startRecording} className="bg-green-600 text-white px-3 py-1 rounded">Start</button>
                        <button type="button" onClick={stopRecording} className="bg-red-600 text-white px-3 py-1 rounded">Stop</button>
                        <button type="button" onClick={clearBlob} className="bg-gray-400 text-white px-3 py-1 rounded">Clear</button>
                      </div>
                      {mediaBlobUrl && (
                        <button
                          type="button"
                          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                          onClick={async () => {
                            const response = await fetch(mediaBlobUrl);
                            const blob = await response.blob();
                            setVideoBlob(blob);
                          }}
                        >
                          Use This Video
                        </button>
                      )}
                    </div>
                  )}
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700"
              disabled={loading || (answerMode === "video" && !videoBlob)}
            >
              {loading ? "Evaluating..." : "Submit Answer"}
            </button>
          </form>
          {feedback && (
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h4 className="font-bold mb-2">AI Feedback</h4>
              <p><strong>Score:</strong> {feedback.score}/10</p>
              <p><strong>Feedback:</strong> {feedback.feedback}</p>
              <ul className="list-disc ml-6 mt-2">
                {feedback.tips && feedback.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
              </ul>
              {currentQuestionIdx < questions.length - 1 && (
                <button onClick={handleNextQuestion} className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Next Question</button>
              )}
              {currentQuestionIdx === questions.length - 1 && (
                <div className="mt-4 font-semibold text-center text-emerald-700">Interview Complete!</div>
              )}
            </div>
          )}
        </div>
      )}
      {step === 2 && questions.length > 0 && currentQuestionIdx >= questions.length && (
        <div className="text-center font-bold text-emerald-700 text-xl">Interview Complete! Well done.</div>
      )}
    </div>
  );
};

export default MockInterview;
