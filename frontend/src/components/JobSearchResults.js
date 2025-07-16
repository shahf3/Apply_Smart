import React, { useState, useEffect } from 'react';
import axios from 'axios';

function JobSearchResults() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  //const [page, setPage] = useState(1);
  //const [hasMore, setHasMore] = useState(true);

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
    <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-blue-50 pb-2 flex items-center gap-2">🔍 Job Search</h3>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-2 hover:from-blue-700 hover:to-purple-700 font-medium"
        >
          Search
        </button>
      </div>
      {loading && <p className="text-blue-600 font-medium">Loading jobs...</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-2 mb-2">{error}</p>}
      {Object.keys(results).length > 0 &&
        Object.entries(results).map(([source, jobs]) => (
          <div key={source} className="mb-6">
            <h4 className="text-base font-semibold text-blue-700 mb-2">{source} Jobs</h4>
            <ul className="divide-y divide-blue-50">
              {jobs.slice(0, 10).map((job, index) => (
                <li key={index} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h5 className="font-semibold text-gray-900">{job.title || 'No Title'}</h5>
                    <p className="text-sm text-gray-600"><strong>Company:</strong> {job.company || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><strong>Location:</strong> {job.location || 'N/A'}</p>
                  </div>
                  {job.apply_link ? (
                    <a
                      href={job.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 font-medium text-sm"
                    >
                      Apply Now
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">No link available</p>
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
