import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { ReactMediaRecorder } from 'react-media-recorder';
import { designSystem } from './designSystem';

function MockInterview() {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answerMode, setAnswerMode] = useState('text');
  const [videoBlob, setVideoBlob] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async (e) => {
    e.preventDefault();
    if (!resumeFile && !jobDescription && !jobDescriptionFile) {
      setError('Please provide a resume or job description.');
      return;
    }
    const formData = new FormData();
    if (resumeFile) formData.append('resume', resumeFile);
    if (jobDescriptionFile) formData.append('jobDescriptionFile', jobDescriptionFile);
    if (jobDescription) formData.append('jobDescription', jobDescription);
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('interview/generate-questions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setQuestions(res.data.questions);
      setStep(2);
    } catch (err) {
      setError('Failed to generate questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (answerMode === 'text' && !answer) {
      setError('Please provide an answer.');
      return;
    }
    if (answerMode === 'video' && !videoBlob) {
      setError('Please record a video answer.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (answerMode === 'text') {
        const res = await axios.post('interview/evaluate-answer', { answer, question: questions[currentQuestionIdx], jobDescription });
        setFeedback(res.data);
      } else if (answerMode === 'video' && videoBlob) {
        const formData = new FormData();
        formData.append('video', videoBlob, 'answer.webm');
        formData.append('question', questions[currentQuestionIdx]);
        formData.append('jobDescription', jobDescription);
        const res = await axios.post('interview/evaluate-video-answer', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setFeedback(res.data);
      }
    } catch (err) {
      setError('Failed to evaluate answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setAnswer('');
    setVideoBlob(null);
    setAnswerMode('text');
    setCurrentQuestionIdx((idx) => idx + 1);
  };

  const SkeletonLoader = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-pulse space-y-4">
      <div className={`${designSystem.colors.neutral[100]} h-8 rounded-md`} />
      <div className={`${designSystem.colors.neutral[100]} h-24 rounded-md`} />
      <div className={`${designSystem.colors.neutral[100]} h-12 rounded-md`} />
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={`bg-white rounded-xl ${designSystem.shadows.lg} ${designSystem.borders.accent} ${designSystem.spacing.md} max-w-2xl mx-auto`} role="region" aria-label="Mock Interview Section">
      <h2 className={`${designSystem.typography.heading} text-lg mb-4 border-b ${designSystem.borders.accent} pb-2 flex items-center gap-2`} title="Practice interviews with AI-generated questions">
        <Mic className="w-5 h-5 text-blue-600" /> AI Mock Interview
      </h2>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {loading ? (
        <SkeletonLoader />
      ) : step === 1 ? (
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className={`${designSystem.typography.body} block text-sm font-medium mb-1`}>Upload Resume (PDF/DOCX)</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} className={`block w-full text-sm ${designSystem.typography.body} ${designSystem.borders.default} rounded-lg cursor-pointer ${designSystem.colors.neutral[50]} focus:outline-none focus:ring-2 focus:ring-blue-500`} aria-label="Upload resume in PDF or DOCX format" />
          </div>
          <div>
            <label className={`${designSystem.typography.body} block text-sm font-medium mb-1`}>Job Description (Paste or Upload)</label>
            <textarea rows={4} placeholder="Paste job description here." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className={`w-full ${designSystem.borders.default} rounded-lg ${designSystem.spacing.xs} focus:ring-2 focus:ring-blue-500 sm:text-sm`} aria-label="Enter job description" />
            <div className="mt-2">
              <input type="file" accept=".pdf,.txt" onChange={(e) => setJobDescriptionFile(e.target.files[0])} className={`block w-full text-sm ${designSystem.typography.body} ${designSystem.borders.default} rounded-lg cursor-pointer ${designSystem.colors.neutral[50]} focus:outline-none focus:ring-2 focus:ring-blue-500`} aria-label="Upload job description in PDF or TXT format" />
            </div>
          </div>
          <motion.button type="submit" disabled={loading} className={`${designSystem.colors.primary} text-white rounded-lg ${designSystem.spacing.xs} font-medium disabled:opacity-50`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label={loading ? 'Generating questions' : 'Start interview'}>
            {loading ? 'Generating Questions...' : 'Start Interview'}
          </motion.button>
        </form>
      ) : step === 2 && questions.length > 0 && currentQuestionIdx < questions.length ? (
        <div>
          <div className="mb-4">
            <span className={`${designSystem.typography.subheading} font-semibold`}>Question {currentQuestionIdx + 1} of {questions.length}:</span>
            <p className="mt-2 text-lg">{questions[currentQuestionIdx]}</p>
          </div>
          <div className="flex gap-2 mb-4">
            <motion.button className={`px-3 py-1 rounded-lg ${answerMode === 'text' ? designSystem.colors.primary : designSystem.colors.neutral[100]} ${answerMode === 'text' ? 'text-white' : 'text-gray-700'}`} onClick={() => setAnswerMode('text')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" aria-label="Answer with text">
              Text Answer
            </motion.button>
            <motion.button className={`px-3 py-1 rounded-lg ${answerMode === 'video' ? designSystem.colors.primary : designSystem.colors.neutral[100]} ${answerMode === 'video' ? 'text-white' : 'text-gray-700'}`} onClick={() => setAnswerMode('video')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" aria-label="Answer with video">
              Video Answer
            </motion.button>
          </div>
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            {answerMode === 'text' && (
              <textarea rows={4} placeholder="Type your answer here." value={answer} onChange={(e) => setAnswer(e.target.value)} required className={`w-full ${designSystem.borders.default} rounded-lg ${designSystem.spacing.xs} focus:ring-2 focus:ring-blue-500 sm:text-sm`} aria-label="Enter your text answer" />
            )}
            {answerMode === 'video' && (
              <div>
                <ReactMediaRecorder
                  video
                  render={({ status, startRecording, stopRecording, mediaBlobUrl, clearBlob }) => (
                    <div className="space-y-4">
                      <p className={`${designSystem.typography.body} text-sm`}>Status: {status}</p>
                      {mediaBlobUrl && (<video src={mediaBlobUrl} controls className="w-full rounded-lg border border-gray-200" aria-label="Preview recorded answer" />)}
                      <div className="flex gap-2">
                        <motion.button type="button" onClick={startRecording} className={`${designSystem.colors.success} text-white px-3 py-1 rounded-lg font-medium`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Start recording">Start</motion.button>
                        <motion.button type="button" onClick={stopRecording} className={`${designSystem.colors.error} text-white px-3 py-1 rounded-lg font-medium`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Stop recording">Stop</motion.button>
                        <motion.button type="button" onClick={clearBlob} className="bg-gray-400 text-white px-3 py-1 rounded-lg font-medium" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Clear recording">Clear</motion.button>
                      </div>
                      {mediaBlobUrl && (
                        <motion.button type="button" className={`${designSystem.colors.primary} text-white px-3 py-1 rounded-lg font-medium`} onClick={async () => { const response = await fetch(mediaBlobUrl); const blob = await response.blob(); setVideoBlob(blob); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Use this video">
                          Use This Video
                        </motion.button>
                      )}
                    </div>
                  )}
                />
              </div>
            )}
            <motion.button type="submit" className={`${designSystem.colors.secondary} text-white rounded-lg ${designSystem.spacing.xs} font-medium disabled:opacity-50`} disabled={loading || (answerMode === 'video' && !videoBlob)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label={loading ? 'Evaluating answer' : 'Submit answer'}>
              {loading ? 'Evaluating.' : 'Submit Answer'}
            </motion.button>
          </form>
          {feedback && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`mt-6 p-4 ${designSystem.colors.neutral[50]} rounded-lg`}>
              <h4 className={`${designSystem.typography.heading} font-bold mb-2`}>AI Feedback</h4>
              <p><strong>Score:</strong> {feedback.score}/10</p>
              <p><strong>Feedback:</strong> {feedback.feedback}</p>
              <ul className="list-disc ml-6 mt-2 text-sm">
                {feedback.tips && feedback.tips.map((tip, idx) => (
                  <motion.li key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                    {tip}
                  </motion.li>
                ))}
              </ul>
              {currentQuestionIdx < questions.length - 1 && (
                <motion.button onClick={handleNextQuestion} className={`${designSystem.colors.success} text-white px-4 py-2 rounded-lg mt-4 font-medium`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Next question">
                  Next Question
                </motion.button>
              )}
              {currentQuestionIdx === questions.length - 1 && (
                <div className="mt-4 font-semibold text-center text-emerald-700">Interview Complete.</div>
              )}
            </motion.div>
          )}
        </div>
      ) : step === 2 && questions.length > 0 && currentQuestionIdx >= questions.length ? (
        <div className="text-center font-bold text-emerald-700 text-xl">Interview Complete. Well done.</div>
      ) : null}
    </motion.div>
  );
}

export default MockInterview;