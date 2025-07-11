import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function ResumeHtmlEditor({ userId }) {
  const [resumes, setResumes] = useState([]);
  const [selectedHtmlUrl, setSelectedHtmlUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [pdfLink, setPdfLink] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await axios.get(`/resumes/${userId}`);
        setResumes(res.data);
      } catch (err) {
        console.error("Failed to load resumes", err);
      }
    }
    fetchResumes();
  }, [userId]);

  const handleSelectChange = async (e) => {
    const resumeId = e.target.value;
    try {
      const res = await axios.get(`/resume-details/${resumeId}`);
      if (res.data && res.data.path) {
        const cleanFileName = res.data.filename.replace(/\.[^/.]+$/, "");
        setFileName(cleanFileName);
        setSelectedHtmlUrl(`/html/${cleanFileName}.html`);
        setPdfLink(null);
      }
    } catch (err) {
      console.error("Failed to fetch resume details", err);
    }
  };

  const handleSave = async () => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    const htmlContent = doc.documentElement.outerHTML;

    try {
      await axios.post("/save-html", { fileName, htmlContent });
      alert("Resume saved successfully.");
    } catch (err) {
      console.error("Error saving HTML:", err);
      alert("Failed to save changes.");
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.post("/export-pdf", { fileName });
      setPdfLink(res.data.pdfUrl);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Could not export PDF");
    }
  };

  return (
    <div>
      <h2>Edit Your Resume</h2>

      <label>Your Uploaded Resumes:</label>
      <select onChange={handleSelectChange} defaultValue="">
        <option value="" disabled>-- Select a Resume --</option>
        {resumes.map((resume) => (
          <option key={resume.id} value={resume.id}>📄 {resume.filename}</option>
        ))}
      </select>

      {selectedHtmlUrl && (
        <>
          <iframe
            ref={iframeRef}
            src={selectedHtmlUrl}
            style={{ width: "100%", height: "800px", border: "1px solid #ccc", marginTop: "20px" }}
            title="Editable Resume Preview"
            onLoad={() => {
              try {
                const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
                doc.body.contentEditable = true;
                doc.designMode = "on";
              } catch (error) {
                console.error("Cross-origin access denied", error);
              }
            }}
          />
          <div style={{ marginTop: "15px" }}>
            <button onClick={handleSave}>Save Changes</button>
            <button style={{ marginLeft: "10px" }} onClick={handleExport}>Export to PDF</button>
          </div>
          {pdfLink && (
            <div style={{ marginTop: "15px" }}>
              <a href={pdfLink} target="_blank" rel="noopener noreferrer">Download Edited PDF</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ResumeHtmlEditor;
