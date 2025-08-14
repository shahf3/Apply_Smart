import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import ReactQuill from 'react-quill';
import { PenTool, AlertCircle } from 'lucide-react';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import { designSystem } from './designSystem';

function CoverLetterGenerator() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!resumeText || !jobDescription) {
      setError('Please provide both resume text and job description.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('cover-letter/generate-cover-letter', { resumeText, jobDescription });
      setGeneratedLetter(response.data.coverLetter);
    } catch (error) {
      setError('Failed to generate cover letter.');
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
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; font-size: 14px; color: #111827; }
              h1, h2, h3, h4, h5, h6 { color: #111827; margin: 0 0 12px; }
              p { margin: 0 0 12px; }
            </style>
          </head>
          <body>${generatedLetter}</body>
        </html>
      `;
      await axios.post('cover-letter/save-html', { fileName, htmlContent: htmlWrapper });
      const pdfResponse = await axios.post('cover-letter/generate-cover-letter-pdf', { fileName, coverLetterHtml: htmlWrapper });
      const pdfUrl = `http://localhost:5000${pdfResponse.data.pdfUrl}`;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      setError('Failed to export PDF.');
    }
  };

  const SkeletonLoader = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-pulse space-y-4">
      <div className={`${designSystem.colors.neutral[100]} h-8 rounded-md`} />
      <div className={`${designSystem.colors.neutral[100]} h-24 rounded-md`} />
      <div className={`${designSystem.colors.neutral[100]} h-24 rounded-md`} />
      <div className={`${designSystem.colors.neutral[100]} h-12 rounded-md`} />
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={`bg-white rounded-xl ${designSystem.shadows.lg} ${designSystem.borders.accent} ${designSystem.spacing.md} max-w-2xl mx-auto`} role="region" aria-label="Cover Letter Generator Section">
      <h3 className={`${designSystem.typography.heading} text-lg mb-4 border-b ${designSystem.borders.accent} pb-2 flex items-center gap-2`} data-tooltip-id="cover-letter-heading" data-tooltip-content="Generate a tailored cover letter">
        <PenTool className="w-5 h-5 text-blue-600" /> Cover Letter Generator
      </h3>
      <Tooltip id="cover-letter-heading" />
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
        <>
          <div>
            <label className={`${designSystem.typography.body} block text-sm font-medium mb-1`}>Resume Text</label>
            <textarea placeholder="Paste your resume here." rows={4} className={`w-full ${designSystem.borders.default} rounded-lg ${designSystem.spacing.xs} mb-2 focus:ring-2 focus:ring-blue-500 sm:text-sm`} value={resumeText} onChange={(e) => setResumeText(e.target.value)} aria-label="Enter resume text" />
          </div>
          <div>
            <label className={`${designSystem.typography.body} block text-sm font-medium mb-1`}>Job Description</label>
            <textarea placeholder="Paste job description here." rows={4} className={`w-full ${designSystem.borders.default} rounded-lg ${designSystem.spacing.xs} mb-2 focus:ring-2 focus:ring-blue-500 sm:text-sm`} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} aria-label="Enter job description" />
          </div>
          <motion.button onClick={handleGenerate} disabled={loading} className={`${designSystem.colors.primary} text-white rounded-lg ${designSystem.spacing.xs} font-medium mb-2 disabled:opacity-50`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label={loading ? 'Generating cover letter' : 'Generate cover letter'}>
            {loading ? 'Generating.' : 'Generate Cover Letter'}
          </motion.button>
          {generatedLetter && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="mt-4">
              <h4 className={`${designSystem.typography.heading} text-base mb-2`} data-tooltip-id="generated-letter" data-tooltip-content="Your generated cover letter">Your Cover Letter</h4>
              <Tooltip id="generated-letter" />
              <div className={`${designSystem.colors.neutral[50]} rounded-lg ${designSystem.spacing.sm} mb-2`}>
                <ReactQuill value={generatedLetter} onChange={setGeneratedLetter} className="bg-white" aria-label="Edit generated cover letter" />
              </div>
              <motion.button className={`${designSystem.colors.success} text-white rounded-lg ${designSystem.spacing.xs} font-medium`} onClick={handleDownloadPDF} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Export cover letter as PDF">
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