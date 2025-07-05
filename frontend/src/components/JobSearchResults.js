import React, { useState } from 'react';
import axios from 'axios';

function JobSearchResults() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setJobs([]);

    try {
      const response = await axios.get('http://localhost:5000/api/search-jobs', {
        params: { title, location }
      });
      setJobs(response.data.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-search-card">
      <h3>🔍 Job Search</h3>

      <div className="search-controls">
        <input
          type="text"
          placeholder="Job Title (e.g. Data Analyst)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location (e.g. Canada)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading jobs...</p>}
      {error && <p className="error">{error}</p>}

      {jobs.length > 0 && (
        <ul className="job-list">
          {jobs.map((job, index) => (
            <li key={index} className="job-card">
              <h5>{job.title || 'No Title'}</h5>
              <p><strong>Company:</strong> {job.company || 'N/A'}</p>
              <p><strong>Location:</strong> {job.location || 'N/A'}</p>
              <p><strong>Source:</strong> {job.source}</p>
              {job.apply_link ? (
                <a href={job.apply_link} target="_blank" rel="noopener noreferrer">Apply Now</a>
              ) : (
                <p>No link available</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default JobSearchResults;
