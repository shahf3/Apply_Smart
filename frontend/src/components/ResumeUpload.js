import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const user_id = localStorage.getItem('user_id');

  const fetchResumes = useCallback(async () => {
    if (!user_id) return;
    try {
      const res = await axios.get(`http://localhost:5000/resumes/${user_id}`);
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [user_id]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !user_id) return;

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('user_id', user_id);

    try {
      await axios.post('http://localhost:5000/upload-resume', formData);
      alert('Resume uploaded!');
      fetchResumes();
      setFile(null); // Clear the file input
    } catch (err) {
      alert('Upload failed');
    }
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toUpperCase();
  };

  return (
    <div className="card">
      <h3>
        <div className="icon">📄</div>
        Upload Resume
      </h3>
      <div className="upload-section">
        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-input-wrapper">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileChange} 
              required 
            />
            <label className="file-input-label">
              {file ? file.name : 'Choose File (PDF, DOC, DOCX)'}
            </label>
          </div>
          <button type="submit" className="upload-button">
            Upload Resume
          </button>
        </form>

        <div className="resume-list">
          <h4>Your Resumes</h4>
          {resumes.length > 0 ? (
            <ul>
              {resumes.map((resume) => (
                <li key={resume.id}>
                  <div className="resume-icon">
                    {getFileExtension(resume.filename)}
                  </div>
                  <span>{resume.filename}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No resumes uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;