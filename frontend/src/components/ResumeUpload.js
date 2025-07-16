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
    <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-blue-50 pb-2 flex items-center gap-2">📄 Resume Upload</h3>
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <input 
          type="file" 
          accept=".pdf,.doc,.docx" 
          onChange={handleFileChange} 
          required 
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-2 hover:from-blue-700 hover:to-purple-700 font-medium">
          Upload Resume
        </button>
      </form>
      <div className="resume-list mt-6">
        <h4 className="text-base font-semibold text-gray-800 mb-2">Your Resumes</h4>
        {resumes.length > 0 ? (
          <ul className="divide-y divide-blue-50">
            {resumes.map((resume) => (
              <li key={resume.id} className="flex items-center gap-3 py-2">
                <div className="resume-icon w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-lg font-bold">
                  {getFileExtension(resume.filename)}
                </div>
                <span className="text-gray-900 font-medium truncate">{resume.filename}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No resumes uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

export default ResumeUpload;