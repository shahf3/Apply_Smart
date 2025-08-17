import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { designSystem } from './designSystem';

/** Live camera preview */
function LiveVideo({ stream }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
      const tryPlay = async () => {
        try {
          await video.play();
        } catch {
          /* autoplay can be blocked until next user gesture */
        }
      };
      const onLoaded = () => tryPlay();
      video.addEventListener('loadedmetadata', onLoaded);
      tryPlay();

      return () => {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.srcObject = null;
      };
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  return (
    <video
      ref={ref}
      className="w-full h-full object-contain bg-black rounded-lg"
      muted
      playsInline
      autoPlay
      aria-label="Live camera preview"
    />
  );
}

/** Helper: pick a supported mimeType for MediaRecorder */
function pickSupportedMime() {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    // Some Safari builds may support this; most desktop browsers won’t record mp4
    'video/mp4;codecs=h264,aac',
    'video/mp4',
  ];
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported?.(t)) return t;
  }
  return ''; // Let browser choose default
}

function MockInterview() {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answerMode, setAnswerMode] = useState('text'); // 'text' | 'video'
  const [videoBlob, setVideoBlob] = useState(null);     // Blob used for upload
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Camera state
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraErr, setCameraErr] = useState('');

  // Recording state
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recStatus, setRecStatus] = useState('idle'); // idle | recording | stopped
  const [recordedUrl, setRecordedUrl] = useState(null); // objectURL for playback

  // Open/close camera when switching into/out of video mode
  useEffect(() => {
    let active = true;

    const openCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: true,
        });
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        setCameraStream(stream);
        setCameraErr('');
      } catch {
        setCameraErr('Camera/microphone permission denied or unavailable.');
        setCameraStream(null);
      }
    };

    if (answerMode === 'video') {
      openCamera();
    }

    return () => {
      active = false;
      if (mediaRecorderRef.current?.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      // stop tracks when leaving video mode/unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      setCameraStream(null);

      // cleanup recorded url
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
      setRecordedUrl(null);
      setVideoBlob(null);
      chunksRef.current = [];
      setRecStatus('idle');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerMode]);

  const startRecording = () => {
    if (!cameraStream || recStatus === 'recording') return;
    // wipe previous
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    setVideoBlob(null);
    chunksRef.current = [];

    let mr;
    try {
      const mimeType = pickSupportedMime();
      mr = new MediaRecorder(cameraStream, mimeType ? { mimeType } : undefined);
    } catch (e) {
      setError('Your browser does not support video recording.');
      return;
    }
    mediaRecorderRef.current = mr;

    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    mr.onstop = () => {
      const type = mr.mimeType || 'video/webm';
      const blob = new Blob(chunksRef.current, { type });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setVideoBlob(blob); // auto-select for submission
      setRecStatus('stopped');
    };
    mr.onerror = () => {
      setError('Recording error occurred.');
      setRecStatus('idle');
    };

    try {
      mr.start(250); // collect timeslices for responsiveness
      setRecStatus('recording');
    } catch {
      setError('Failed to start recording.');
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === 'recording') {
      try {
        mr.stop();
      } catch {
        setError('Failed to stop recording.');
      }
    }
  };

  const clearRecording = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setVideoBlob(null);
    chunksRef.current = [];
    setRecStatus('idle');
  };

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
      const res = await axios.post('interview/generate-questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setQuestions(res.data.questions);
      setStep(2);
    } catch {
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
        const res = await axios.post('interview/evaluate-answer', {
          answer,
          question: questions[currentQuestionIdx],
          jobDescription,
        });
        setFeedback(res.data);
      } else {
        const formData = new FormData();
        formData.append('video', videoBlob, 'answer.webm');
        formData.append('question', questions[currentQuestionIdx]);
        formData.append('jobDescription', jobDescription);
        const res = await axios.post('interview/evaluate-video-answer', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFeedback(res.data);
      }
    } catch {
      setError('Failed to evaluate answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setAnswer('');
    // reset any recording state
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setVideoBlob(null);
    chunksRef.current = [];
    setRecStatus('idle');
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl ${designSystem.shadows.lg} ${designSystem.borders.accent} ${designSystem.spacing.md} max-w-2xl mx-auto`}
      role="region"
      aria-label="Mock Interview Section"
    >
      <h2
        className={`${designSystem.typography.heading} text-lg mb-4 border-b ${designSystem.borders.accent} pb-2 flex items-center gap-2`}
        title="Practice interviews with AI-generated questions"
      >
        <Mic className="w-5 h-5 text-blue-600" /> AI Mock Interview
      </h2>

      <AnimatePresence>
        {(error || cameraErr) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600 text-sm">{error || cameraErr}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <SkeletonLoader />
      ) : step === 1 ? (
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className={`${designSystem.typography.body} block text-sm font-medium mb-1`}>
              Upload Resume (PDF/DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className={`block w-full text-sm ${designSystem.typography.body} ${designSystem.borders.default} rounded-lg cursor-pointer ${designSystem.colors.neutral[50]} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Upload resume in PDF or DOCX format"
            />
          </div>
          <div>
            <label className={`${designSystem.typography.body} block text-sm font-medium mb-1`}>
              Job Description (Paste or Upload)
            </label>
            <textarea
              rows={4}
              placeholder="Paste job description here."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={`w-full ${designSystem.borders.default} rounded-lg ${designSystem.spacing.xs} focus:ring-2 focus:ring-blue-500 sm:text-sm`}
              aria-label="Enter job description"
            />
            <div className="mt-2">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setJobDescriptionFile(e.target.files[0])}
                className={`block w-full text-sm ${designSystem.typography.body} ${designSystem.borders.default} rounded-lg cursor-pointer ${designSystem.colors.neutral[50]} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-label="Upload job description in PDF or TXT format"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className={`${designSystem.colors.primary} text-white rounded-lg ${designSystem.spacing.xs} font-medium disabled:opacity-50`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={loading ? 'Generating questions' : 'Start interview'}
          >
            {loading ? 'Generating Questions...' : 'Start Interview'}
          </motion.button>
        </form>
      ) : step === 2 && questions.length > 0 && currentQuestionIdx < questions.length ? (
        <div>
          <div className="mb-4">
            <span className={`${designSystem.typography.subheading} font-semibold`}>
              Question {currentQuestionIdx + 1} of {questions.length}:
            </span>
            <p className="mt-2 text-lg">{questions[currentQuestionIdx]}</p>
          </div>

          <div className="flex gap-2 mb-4">
            <motion.button
              className={`px-3 py-1 rounded-lg ${
                answerMode === 'text' ? designSystem.colors.primary : designSystem.colors.neutral[100]
              } ${answerMode === 'text' ? 'text-white' : 'text-gray-700'}`}
              onClick={() => setAnswerMode('text')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              aria-label="Answer with text"
            >
              Text Answer
            </motion.button>
            <motion.button
              className={`px-3 py-1 rounded-lg ${
                answerMode === 'video' ? designSystem.colors.primary : designSystem.colors.neutral[100]
              } ${answerMode === 'video' ? 'text-white' : 'text-gray-700'}`}
              onClick={() => setAnswerMode('video')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              aria-label="Answer with video"
            >
              Video Answer
            </motion.button>
          </div>

          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            {answerMode === 'text' && (
              <textarea
                rows={4}
                placeholder="Type your answer here."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                className={`w-full ${designSystem.borders.default} rounded-lg ${designSystem.spacing.xs} focus:ring-2 focus:ring-blue-500 sm:text-sm`}
                aria-label="Enter your text answer"
              />
            )}

            {answerMode === 'video' && (
              <div>
                {/* Live preview always visible */}
                <div className="border border-gray-200 rounded-lg overflow-hidden aspect-video bg-black mb-3">
                  {cameraStream ? (
                    <LiveVideo stream={cameraStream} />
                  ) : (
                    <div className="h-full grid place-items-center text-gray-400 text-sm">
                      {cameraErr ? 'Camera unavailable' : 'Waiting for camera...'}
                    </div>
                  )}
                </div>

                {/* Recording controls */}
                <div className="space-y-3">
                  <p className={`${designSystem.typography.body} text-sm`}>
                    Status:{' '}
                    <span className="font-medium">
                      {recStatus === 'recording' ? 'Recording…' : recStatus === 'stopped' ? 'Recorded (preview below)' : 'Ready'}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      type="button"
                      onClick={startRecording}
                      disabled={!cameraStream || recStatus === 'recording'}
                      className={`${designSystem.colors.success} text-white px-3 py-1 rounded-lg font-medium disabled:opacity-60`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={stopRecording}
                      disabled={recStatus !== 'recording'}
                      className={`${designSystem.colors.error} text-white px-3 py-1 rounded-lg font-medium disabled:opacity-60`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Stop
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={clearRecording}
                      disabled={!recordedUrl && !videoBlob}
                      className="bg-gray-400 text-white px-3 py-1 rounded-lg font-medium disabled:opacity-60"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear
                    </motion.button>
                  </div>

                  {/* Recorded clip preview */}
                  {recordedUrl && (
                    <video
                      src={recordedUrl}
                      controls
                      className="w-full rounded-lg border border-gray-200"
                      aria-label="Preview recorded answer"
                    />
                  )}
                </div>
              </div>
            )}

            <motion.button
              type="submit"
              className={`${designSystem.colors.secondary} text-white rounded-lg ${designSystem.spacing.xs} font-medium disabled:opacity-50`}
              disabled={loading || (answerMode === 'video' && !videoBlob)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={loading ? 'Evaluating answer' : 'Submit answer'}
            >
              {loading ? 'Evaluating.' : 'Submit Answer'}
            </motion.button>
          </form>

          {feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`mt-6 p-4 ${designSystem.colors.neutral[50]} rounded-lg`}
            >
              <h4 className={`${designSystem.typography.heading} font-bold mb-2`}>AI Feedback</h4>
              <p>
                <strong>Score:</strong> {feedback.score}/10
              </p>
              <p>
                <strong>Feedback:</strong> {feedback.feedback}
              </p>
              <ul className="list-disc ml-6 mt-2 text-sm">
                {feedback.tips &&
                  feedback.tips.map((tip, idx) => (
                    <motion.li key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                      {tip}
                    </motion.li>
                  ))}
              </ul>
              {currentQuestionIdx < questions.length - 1 && (
                <motion.button
                  onClick={handleNextQuestion}
                  className={`${designSystem.colors.success} text-white px-4 py-2 rounded-lg mt-4 font-medium`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Next question"
                >
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
