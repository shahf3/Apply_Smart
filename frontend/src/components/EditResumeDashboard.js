import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Document, Page, pdfjs } from "react-pdf";

// Option 1: Use the bundled worker (recommended)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Option 2: Alternative CDN
// pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Option 3: If you want to use a specific version, make sure it matches
// pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';

function EditResumeDashboard({ userId }) {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [viewMode, setViewMode] = useState("edit");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await axios.get(`http://localhost:5000/resumes/${userId}`);
        setResumes(res.data);
      } catch (err) {
        console.error("Failed to load resumes", err);
      }
    }
    fetchResumes();
  }, [userId]);

  const handleSelectChange = async (e) => {
    const resumeId = e.target.value;
    setSelectedResumeId(resumeId);
    setPdfError(null);
    setPdfLoading(true);

    try {
      // Fetch resume details to get the correct path
      const resumeDetailsRes = await axios.get(
        `http://localhost:5000/resume-details/${resumeId}`
      );
      const resumeDetails = resumeDetailsRes.data;

      console.log("Resume details:", resumeDetails);

      if (resumeDetails?.path) {
        // Clean the path and construct URL
        const cleanPath = resumeDetails.path.replace(/\\/g, "/");
        const pdfUrl = `http://localhost:5000/${cleanPath}`;
        
        console.log("Constructed PDF URL:", pdfUrl);

        // Test if the PDF URL is accessible
        try {
          const testResponse = await fetch(pdfUrl, { method: "HEAD" });
          console.log("PDF URL test response:", testResponse.status);
          
          if (testResponse.ok) {
            setPdfUrl(pdfUrl);
          } else {
            throw new Error(`PDF not accessible: ${testResponse.status}`);
          }
        } catch (fetchError) {
          console.error("PDF URL test failed:", fetchError);
          setPdfError(`PDF file not accessible: ${fetchError.message}`);
          setPdfUrl(null);
        }
      }

      // Fetch text content
      const contentRes = await axios.get(
        `http://localhost:5000/resume-content/${resumeId}`
      );
      setResumeText(contentRes.data.text_content || "");
    } catch (err) {
      console.error("Failed to fetch resume content", err);
      setResumeText("");
      setPdfError("Failed to load resume");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedResumeId) return;
    try {
      await axios.put(`http://localhost:5000/resumes/${selectedResumeId}`, {
        updatedText: resumeText,
        userId: userId,
      });
      alert("Resume updated successfully");
    } catch (err) {
      console.error("Failed to update resume", err);
      alert("Failed to save resume");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfLoading(false);
    setPdfError(null);
    console.log("PDF loaded successfully with", numPages, "pages");
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
    setPdfError("Failed to load PDF document");
    setPdfLoading(false);
  };

  return (
    <div className="resume-editor">
      <h2>Edit Your Resume</h2>

      <label>Your Uploaded Resumes:</label>
      <select value={selectedResumeId} onChange={handleSelectChange}>
        <option value="" disabled>
          -- Select a Resume --
        </option>
        {resumes.map((resume) => (
          <option key={resume.id} value={resume.id}>
            📄 {resume.filename}
          </option>
        ))}
      </select>

      {selectedResumeId && (
        <>
          <div style={{ margin: "15px 0" }}>
            <button
              onClick={() => setViewMode(viewMode === "edit" ? "pdf" : "edit")}
            >
              Switch to {viewMode === "edit" ? "PDF View" : "Editor"}
            </button>
          </div>

          {viewMode === "edit" ? (
            <>
              <ReactQuill
                theme="snow"
                value={resumeText}
                onChange={setResumeText}
              />
              <button onClick={handleSave} style={{ marginTop: "10px" }}>
                Save Changes
              </button>
            </>
          ) : (
            <div
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginTop: "20px",
              }}
            >
              {pdfLoading && <p>Loading PDF...</p>}
              {pdfError && <p style={{ color: "red" }}>Error: {pdfError}</p>}
              {pdfUrl && !pdfLoading && !pdfError && (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={<p>Loading PDF document...</p>}
                  error={<p>Failed to load PDF</p>}
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      width={600}
                      loading={<p>Loading page {index + 1}...</p>}
                    />
                  ))}
                </Document>
              )}
              {!pdfUrl && !pdfLoading && !pdfError && (
                <p>No PDF available for this resume</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EditResumeDashboard;