import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import { FileText, AlertCircle, BarChart3, Search } from 'lucide-react';
import axios from 'axios';
import { designSystem } from './designSystem';

function ATSScoringCard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !jobDescription) {
      setError('Please upload a resume and enter a job description.');
      return;
    }
    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('jobDescription', jobDescription);

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('score-resume', formData);
      setScore(res.data.score);
    } catch (err) {
      setError('Failed to score resume.');
    } finally {
      setLoading(false);
    }
  };

  const SkeletonLoader = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-pulse space-y-4">
      <div className={`${designSystem.colors.neutral[100]} h-8 rounded-md`} />
      <div className={`${designSystem.colors.neutral[100]} h-40 rounded-md`} />
      <div className={`${designSystem.colors.neutral[100]} h-12 rounded-md`} />
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={`bg-white rounded-xl ${designSystem.shadows.lg} ${designSystem.borders.accent} ${designSystem.spacing.md} max-w-2xl mx-auto`} role="region" aria-label="ATS Resume Scoring Section">
      <h3 className={`${designSystem.typography.heading} text-lg mb-4 border-b ${designSystem.borders.accent} pb-2 flex items-center gap-2`} data-tooltip-id="ats-heading" data-tooltip-content="Score your resume against job descriptions">
        <BarChart3 className="w-5 h-5 text-blue-600" /> ATS Resume Scoring
      </h3>
      <Tooltip id="ats-heading" />
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
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`${designSystem.typography.body} block text-sm font-medium mb-1`}>Upload Resume (PDF only)</label>
            <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} required className={`block w-full text-sm ${designSystem.typography.body} ${designSystem.borders.default} rounded-lg cursor-pointer ${designSystem.colors.neutral[50]} focus:outline-none focus:ring-2 focus:ring-blue-500`} aria-label="Upload resume in PDF format" />
          </div>
          <div>
            <label className={`${designSystem.typography.body} block text-sm font-medium mb-1`}>Job Description</label>
            <textarea rows="6" placeholder="Paste the job description here." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required className={`w-full ${designSystem.borders.default} rounded-lg ${designSystem.spacing.xs} focus:ring-2 focus:ring-blue-500 sm:text-sm`} aria-label="Enter job description" />
          </div>
          <motion.button type="submit" disabled={loading} className={`${designSystem.colors.primary} text-white rounded-lg ${designSystem.spacing.xs} font-medium disabled:opacity-50`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label={loading ? 'Scoring resume' : 'Score resume'}>
            {loading ? 'Scoring.' : 'Score Resume'}
          </motion.button>
        </form>
      )}
      {score && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`rounded-lg ${designSystem.spacing.sm} mt-6 ${designSystem.colors.neutral[50]}`}>
          <h4 className={`${designSystem.typography.heading} text-lg mb-2`} data-tooltip-id="ats-score" data-tooltip-content="Your resume's ATS compatibility score">
            ATS Score: {score.score}/100
          </h4>
          <Tooltip id="ats-score" />
          <p className={`${designSystem.typography.body} mb-2`}>{score.summary}</p>
          <div className="mt-2">
            <h5 className={`${designSystem.typography.subheading} mb-1`} data-tooltip-id="missing-keywords" data-tooltip-content="Keywords missing from your resume">
              <Search className="w-4 h-4 inline mr-1" /> Missing Keywords:
            </h5>
            <Tooltip id="missing-keywords" />
            <ul className="flex flex-wrap gap-2 mb-2">
              {score.missing_keywords?.map((kw, i) => (
                <motion.li key={i} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-medium" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
                  {kw}
                </motion.li>
              ))}
            </ul>
            <h5 className={`${designSystem.typography.subheading} mb-1`} data-tooltip-id="action-words" data-tooltip-content="Action verbs detected in your resume">
              <FileText className="w-4 h-4 inline mr-1" /> Action Verbs:
            </h5>
            <Tooltip id="action-words" />
            <ul className="flex flex-wrap gap-2 mb-2">
              {score.action_words?.map((word, i) => (
                <motion.li key={i} className="inline-block bg-purple-100 text-purple-700 rounded px-2 py-1 text-xs font-medium" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
                  {word}
                </motion.li>
              ))}
            </ul>
            <h5 className={`${designSystem.typography.subheading} mb-1`} data-tooltip-id="improvements" data-tooltip-content="Suggestions to improve your resume">
              <AlertCircle className="w-4 h-4 inline mr-1" /> Improvement Suggestions:
            </h5>
            <Tooltip id="improvements" />
            <ul className={`list-disc ml-6 text-sm ${designSystem.typography.body}`}>
              {score.improvements?.map((tip, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
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

export default ATSScoringCard;