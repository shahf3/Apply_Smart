import React, { useState, useEffect } from 'react';
import axios from 'axios';

function JobSearchResults() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Geolocation detection on load
  useEffect(() => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get('http://localhost:5000/api/geolocation', {
            params: { lat: latitude, lon: longitude }
          });
          if (res.data.country) {
            setLocation(res.data.country);
          }
        } catch (error) {
          console.error('Geolocation lookup failed', error);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
      }
    );
  }
}, []);


  const handleSearch = async () => {
    if (!title.trim() || !location.trim()) {
      setError('Please enter both job title and location.');
      return;
    }

    setLoading(true);
    setError('');
    setResults({});

    try {
      const response = await axios.get('http://localhost:5000/api/jobs/search-jobs', {
        params: { title, location }
      });

      const grouped = {};
      response.data.jobs.forEach(job => {
        if (!grouped[job.source]) grouped[job.source] = [];
        grouped[job.source].push(job);
      });

      setResults(grouped);
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
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading jobs...</p>}
      {error && <p className="error">{error}</p>}

      {Object.keys(results).length > 0 &&
        Object.entries(results).map(([source, jobs]) => (
          <div key={source} className="job-source-section">
            <h4>{source} Jobs</h4>
            <ul className="job-list">
              {jobs.slice(0, 10).map((job, index) => (
                <li key={index} className="job-card">
                  <h5>{job.title || 'No Title'}</h5>
                  <p><strong>Company:</strong> {job.company || 'N/A'}</p>
                  <p><strong>Location:</strong> {job.location || 'N/A'}</p>
                  {job.apply_link ? (
                    <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
                      Apply Now
                    </a>
                  ) : (
                    <p>No link available</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

export default JobSearchResults;
