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
  }, [fetchResumes]); // ✅ include fetchResumes only

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
      fetchResumes(); // ✅ still works here
    } catch (err) {
      alert('Upload failed');
    }
  };

  return (
    <div>
      <h3>Upload Resume</h3>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
        <button type="submit">Upload</button>
      </form>

      <h4>Your Resumes</h4>
      <ul>
        {resumes.map((resume) => (
          <li key={resume.id}>{resume.filename}</li>
        ))}
      </ul>
    </div>
  );
}

export default ResumeUpload;
