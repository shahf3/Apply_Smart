import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactQuill, { Quill } from "react-quill";
import { PenTool, AlertCircle, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Brush, Eraser, ListOrdered, List } from "lucide-react";
import axios from "axios";
import "react-quill/dist/quill.snow.css";

const FontStyle = Quill.import("attributors/style/font");
const SizeStyle = Quill.import("attributors/style/size");
const AlignStyle = Quill.import("attributors/style/align");
const ColorStyle = Quill.import("attributors/style/color");
const BackgroundStyle = Quill.import("attributors/style/background");

FontStyle.whitelist = ["Inter", "Arial", "Georgia", "Times New Roman", "Courier New"];
SizeStyle.whitelist = ["12px", "14px", "16px", "18px", "20px", "22px"];

Quill.register(FontStyle, true);
Quill.register(SizeStyle, true);
Quill.register(AlignStyle, true);
Quill.register(ColorStyle, true);
Quill.register(BackgroundStyle, true);

const FONTS = FontStyle.whitelist;
const SIZES = SizeStyle.whitelist;

export default function CoverLetterGenerator() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quillRef = useRef(null);

  const modules = useMemo(
    () => ({
      toolbar: false,
      clipboard: { matchVisual: false },
    }),
    []
  );

  const formats = [
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "list",
    "indent",
    "link",
  ];

  const format = (name, value) => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;
    quill.focus();
    quill.format(name, value);
  };

  const applyList = (type) => format("list", type); 
  const indent = (dir) => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;
    const range = quill.getSelection();
    if (!range) return;
    //const [line, _] = quill.getLine(range.index);
    const current = quill.getFormat(range).indent || 0;
    format("indent", Math.max(0, current + (dir === "in" ? 1 : -1)));
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    format("link", url);
  };

  const clearFormats = () => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;
    const range = quill.getSelection() || { index: 0, length: quill.getLength() };
    quill.removeFormat(range.index, range.length);
  };

  const handleGenerate = async () => {
    if (!resumeText || !jobDescription) {
      setError("Please provide both resume text and job description.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("cover-letter/generate-cover-letter", {
        resumeText,
        jobDescription,
      });
      setGeneratedLetter(data?.coverLetter || "");
    } catch {
      setError("Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const fileName = `cover_letter_${Date.now()}`;
      const html = `
        <html>
          <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <style>
              @page { margin: 2.5cm; }
              body { font-family: Arial, Helvetica, sans-serif; color:#111827; line-height:1.6; font-size:14px; }
              h1,h2,h3,h4,h5,h6 { margin:0 0 12px; color:#111827; }
              p { margin:0 0 12px; }
              ul,ol { margin:0.5rem 0; padding-left:1.25rem; }
              a { color:#111827; text-decoration:underline; }
            </style>
          </head>
          <body>${generatedLetter}</body>
        </html>
      `.trim();

      await axios.post("cover-letter/save-html", { fileName, htmlContent: html });
      const pdfRes = await axios.post("cover-letter/generate-cover-letter-pdf", {
        fileName,
        coverLetterHtml: html,
      });

      const urlFromApi = String(pdfRes.data?.pdfUrl || "/");
      const pdfUrl = /^https?:\/\//i.test(urlFromApi)
        ? urlFromApi
        : new URL(urlFromApi, window.location.origin).toString();

      window.open(pdfUrl, "_blank", "noopener");
    } catch {
      setError("Failed to export PDF.");
    }
  };

  /* --------------------------- Skeleton loader --------------------------- */
  const Skeleton = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 animate-pulse">
      <div className="h-8 rounded-md bg-slate-200" />
      <div className="h-24 rounded-md bg-slate-200" />
      <div className="h-24 rounded-md bg-slate-200" />
      <div className="h-12 rounded-md bg-slate-200" />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      role="region"
      aria-label="Cover Letter Generator Section"
      className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 md:p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
        <PenTool className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Cover Letter Generator</h3>
      </div>

      <AnimatePresence>
        {!!error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <Skeleton />
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resume Text</label>
            <textarea
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here."
              className="w-full rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm text-slate-800 bg-white outline-none overflow-y-auto
                         [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description here."
              className="w-full rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm text-slate-800 bg-white outline-none overflow-y-auto
                         [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
            />
          </div>

          <motion.button
            onClick={handleGenerate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
            aria-label={loading ? "Generating cover letter" : "Generate cover letter"}
          >
            {loading ? "Generating." : "Generate Cover Letter"}
          </motion.button>

          {generatedLetter && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-semibold text-slate-900">Your Cover Letter</h4>
                {/* Simple word count */}
                <span className="text-xs text-slate-500">
                  {generatedLetter.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              {/* Custom toolbar: Tailwind only */}
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur rounded-t-lg border border-b-0 border-slate-200 px-3 py-2 flex flex-wrap gap-2">
                {/* Font family */}
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-slate-500" />
                  <select
                    onChange={(e) => format("font", e.target.value)}
                    className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
                    defaultValue=""
                    aria-label="Font family"
                  >
                    <option value="" disabled>
                      Font
                    </option>
                    {FONTS.map((f) => (
                      <option key={f} value={f} style={{ fontFamily: f }}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font size */}
                <select
                  onChange={(e) => format("size", e.target.value)}
                  className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
                  defaultValue=""
                  aria-label="Font size"
                >
                  <option value="" disabled>
                    Size
                  </option>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* Basic styles */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("bold", true)}
                    className="h-8 px-2 rounded-md border border-slate-300 text-sm"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => format("italic", true)}
                    className="h-8 px-2 rounded-md border border-slate-300 text-sm italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => format("underline", true)}
                    className="h-8 px-2 rounded-md border border-slate-300 text-sm underline"
                  >
                    U
                  </button>
                  <button
                    type="button"
                    onClick={() => format("strike", true)}
                    className="h-8 px-2 rounded-md border border-slate-300 text-sm line-through"
                  >
                    S
                  </button>
                </div>

                {/* Colors */}
                <div className="flex items-center gap-2">
                  <Brush className="w-4 h-4 text-slate-500" />
                  <input
                    type="color"
                    onChange={(e) => format("color", e.target.value)}
                    className="h-8 w-10 rounded-md border border-slate-300 bg-white p-1"
                    aria-label="Text color"
                  />
                  <input
                    type="color"
                    onChange={(e) => format("background", e.target.value)}
                    className="h-8 w-10 rounded-md border border-slate-300 bg-white p-1"
                    aria-label="Highlight color"
                  />
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("align", "")}
                    className="h-8 w-8 grid place-items-center rounded-md border border-slate-300"
                    aria-label="Align left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("align", "center")}
                    className="h-8 w-8 grid place-items-center rounded-md border border-slate-300"
                    aria-label="Align center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("align", "right")}
                    className="h-8 w-8 grid place-items-center rounded-md border border-slate-300"
                    aria-label="Align right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("align", "justify")}
                    className="h-8 w-8 grid place-items-center rounded-md border border-slate-300"
                    aria-label="Justify"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                </div>

                {/* Lists and indent */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyList("ordered")}
                    className="h-8 w-8 grid place-items-center rounded-md border border-slate-300"
                    aria-label="Ordered list"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyList("bullet")}
                    className="h-8 w-8 grid place-items-center rounded-md border border-slate-300"
                    aria-label="Bullet list"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => indent("out")}
                    className="h-8 px-2 rounded-md border border-slate-300 text-sm"
                    aria-label="Outdent"
                  >
                    Out
                  </button>
                  <button
                    type="button"
                    onClick={() => indent("in")}
                    className="h-8 px-2 rounded-md border border-slate-300 text-sm"
                    aria-label="Indent"
                  >
                    In
                  </button>
                </div>

                {/* Link and clear */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={insertLink}
                    className="h-8 w-8 grid place-items-center rounded-md border border-slate-300"
                    aria-label="Insert link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={clearFormats}
                    className="h-8 w-8 grid place-items-center rounded-md border border-slate-300"
                    aria-label="Clear formatting"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div
                className="border border-slate-200 rounded-b-lg overflow-hidden"
              >
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={generatedLetter}
                  onChange={setGeneratedLetter}
                  modules={modules}
                  formats={formats}
                  className="bg-white"
                />
              </div>

              <div className="mt-3 flex gap-2">
                <motion.button
                  onClick={handleDownloadPDF}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium"
                >
                  Export as Formatted PDF
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
