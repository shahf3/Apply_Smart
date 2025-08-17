import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import { 
  PenTool, 
  AlertCircle, 
  Download, 
  Sparkles, 
  FileText, 
  Briefcase,
  Loader2,
  Button,
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
  AlertDescription
} from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

export default function CoverLetterGenerator() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume text and job description to generate your cover letter.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock generated cover letter
      setGeneratedLetter(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #1f2937;">
          <div style="margin-bottom: 2rem;">
            <p style="margin-bottom: 1rem;">[Your Name]<br/>
            [Your Address]<br/>
            [City, State ZIP Code]<br/>
            [Your Email]<br/>
            [Your Phone Number]</p>
            
            <p style="margin-bottom: 1rem;">[Date]</p>
            
            <p style="margin-bottom: 1rem;">[Hiring Manager's Name]<br/>
            [Company Name]<br/>
            [Company Address]</p>
          </div>
          
          <p style="margin-bottom: 1rem;"><strong>Dear Hiring Manager,</strong></p>
          
          <p style="margin-bottom: 1rem;">I am writing to express my strong interest in the position at your company. Based on the job description you provided and my experience outlined in my resume, I believe I would be an excellent fit for this role.</p>
          
          <p style="margin-bottom: 1rem;">My background in [relevant field] has prepared me well for the challenges and opportunities this position presents. I am particularly excited about [specific aspect from job description] and how my skills in [relevant skills from resume] can contribute to your team's success.</p>
          
          <p style="margin-bottom: 1rem;">Thank you for considering my application. I look forward to the opportunity to discuss how my experience and passion can benefit your organization.</p>
          
          <p style="margin-bottom: 1rem;">Sincerely,<br/>
          [Your Name]</p>
        </div>
      `);
    } catch (error) {
      setError('Unable to generate cover letter at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    // In a real app, this would call a backend service to generate a PDF
    alert('PDF download functionality would be implemented here.');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const staggerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <>
      <style jsx global>{`
        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.6);
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
        }
        * { scroll-behavior: smooth; }

        /* ReactQuill Custom Styling */
        .ql-toolbar {
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
          border-color: #e5e7eb !important;
          background: #fafafa !important;
        }
        .ql-container {
          border-bottom-left-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
          border-color: #e5e7eb !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
        }
        .ql-editor {
          min-height: 200px !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
        }
        @media (max-width: 768px) {
          .ql-editor {
            min-height: 150px !important;
            font-size: 13px !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 custom-scrollbar overflow-y-auto">
        <div className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
                <PenTool className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                Cover Letter Generator
              </h1>
              <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Create professional, personalized cover letters tailored to any job description.
              </p>
            </motion.div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-4xl mx-auto"
                >
                  <Alert variant="destructive" className="bg-red-50 border-red-200 shadow-sm">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content Grid */}
            <motion.div variants={staggerVariants} className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {/* Input Section */}
              <motion.div variants={itemVariants} className="space-y-6">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-blue-600" /></div>
                      Resume Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="resume" className="text-sm font-medium text-gray-700 sr-only">Paste your resume text here</Label>
                    <Textarea id="resume" placeholder="Copy and paste your resume content..." className="min-h-[150px] md:min-h-[200px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm custom-scrollbar" value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"><Briefcase className="w-4 h-4 text-indigo-600" /></div>
                      Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="job-description" className="text-sm font-medium text-gray-700 sr-only">Paste the job posting details</Label>
                    <Textarea id="job-description" placeholder="Copy and paste the job description..." className="min-h-[150px] md:min-h-[200px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm custom-scrollbar" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                  </CardContent>
                </Card>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                  <Button onClick={handleGenerate} disabled={loading || !resumeText.trim() || !jobDescription.trim()} className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all duration-300">
                    {loading ? (
                      <><Loader2 className="w-5 h-5 mr-3 animate-spin" />Generating...</>
                    ) : (
                      <><Sparkles className="w-5 h-5 mr-3" />Generate Cover Letter</>
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Output Section */}
              <motion.div variants={itemVariants}>
                {loading ? (
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm h-full">
                    <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                        <h3 className="text-lg font-semibold text-gray-900">Crafting your letter...</h3>
                        <p className="text-gray-600">Analyzing your resume and the job requirements.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : generatedLetter ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">Your Personalized Cover Letter</span>
                          <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50"><Download className="w-4 h-4 mr-2" />Export PDF</Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 rounded-xl p-1">
                          <ReactQuill value={generatedLetter} onChange={setGeneratedLetter} theme="snow" modules={{ toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'bullet' }]] }} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm h-full">
                    <CardContent className="p-12 text-center flex flex-col items-center justify-center h-full">
                      <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <PenTool className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to begin?</h3>
                      <p className="text-gray-600">Your generated cover letter will appear here once you provide the necessary information.</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}