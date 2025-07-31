import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building2, ExternalLink, Clock, DollarSign, AlertCircle } from 'lucide-react';

import axios from 'axios';

function JobSearchResults() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [suggestions, setSuggestions] = useState({ titles: [], locations: [] });

  // Fetch suggestions dynamically
  useEffect(() => {
    const fetchSuggestions = async (partial = '') => {
      try {
        const res = await axios.get('http://localhost:5000/api/jobs/suggestions', {
          params: { partial },
        });
        setSuggestions(res.data);
      } catch (err) {
        console.warn('Failed to fetch suggestions:', err);
        setSuggestions({
          titles: ['Software Engineer', 'Data Scientist', 'Nurse', 'Product Manager'],
          locations: ['United States', 'United Kingdom', 'Ireland', 'Japan', 'Remote'],
        });
      }
    };
    fetchSuggestions();
  }, []);

  // Update suggestions on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      const partial = title || location;
      if (partial) {
        axios
          .get('http://localhost:5000/api/jobs/suggestions', { params: { partial } })
          .then(res => setSuggestions(res.data))
          .catch(err => console.warn('Failed to update suggestions:', err));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [title, location]);

  // Geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await axios.get('http://localhost:5000/api/geolocation', {
              params: { lat: latitude, lon: longitude },
            });
            if (res.data.country) {
              setLocation(res.data.country);
            }
          } catch (error) {
            console.warn('Geolocation lookup failed:', error);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  const handleSearch = async (newPage = 1) => {
    if (!title.trim()) {
      setError('Please enter a job title.');
      return;
    }

    setLoading(true);
    setError('');
    if (newPage === 1) setResults({});

    try {
      const response = await axios.get('http://localhost:5000/api/jobs/search-jobs', {
        params: { title, location, page: newPage, limit: 10 },
      });

      const grouped = {};
      response.data.jobs.forEach(job => {
        if (!grouped[job.source]) grouped[job.source] = [];
        grouped[job.source].push(job);
      });

      setResults(prev => ({
        ...prev,
        ...grouped,
      }));
      setPage(newPage);
      setHasMore(response.data.count > newPage * 10);
    } catch (err) {
      setError(
        err.response?.status === 400
          ? err.response.data.error
          : 'Failed to fetch jobs. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      handleSearch(page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-gray-600 text-lg">Discover opportunities that match your skills and ambitions</p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Job Search</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Job Title (e.g., Data Scientist)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                list="title-suggestions"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              />
              <datalist id="title-suggestions">
                {suggestions.titles.map((suggestion, index) => (
                  <option key={index} value={suggestion} />
                ))}
              </datalist>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Location (e.g., New York)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                list="location-suggestions"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
              />
              <datalist id="location-suggestions">
                {suggestions.locations.map((suggestion, index) => (
                  <option key={index} value={suggestion} />
                ))}
              </datalist>
            </div>

            <motion.button
              onClick={() => handleSearch(1)}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 py-3 font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Searching...
                </div>
              ) : (
                'Search Jobs'
              )}
            </motion.button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {Object.keys(results).length === 0 && !loading && !error && title && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">
                  No jobs found for "{title}"{location ? ` in "${location}"` : ''}
                </p>
                <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Cards by Source */}
        {Object.keys(results).length > 0 &&
          Object.entries(results).map(([source, jobs], sourceIndex) => (
            <motion.div
              key={source}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sourceIndex * 0.1, duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{source} Jobs</h3>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job, index) => (
                  <motion.div
                    key={`${source}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (sourceIndex * 0.1) + (index * 0.05), duration: 0.5 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group"
                  >
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                      {/* Job Title */}
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {job.title || 'No Title'}
                      </h4>

                      {/* Company */}
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">{job.company || 'N/A'}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">{job.location || 'N/A'}</span>
                      </div>

                      {/* Additional Info */}
                      <div className="flex-1 space-y-2 mb-4">
                        {job.salary && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">
                              ${job.salary.toLocaleString()}/year
                            </span>
                          </div>
                        )}
                        {job.employment_type && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">{job.employment_type}</span>
                          </div>
                        )}
                      </div>

                      {/* Apply Button */}
                      {job.apply_link ? (
                        <motion.a
                          href={job.apply_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                        >
                          Apply Now
                          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </motion.a>
                      ) : (
                        <div className="w-full bg-gray-100 text-gray-400 rounded-xl px-4 py-3 text-center text-sm">
                          No application link available
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

        {/* Load More Button */}
        {hasMore && Object.keys(results).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.button
              onClick={loadMore}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 rounded-xl px-8 py-3 font-medium hover:bg-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  Loading more jobs...
                </div>
              ) : (
                'Load More Jobs'
              )}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default JobSearchResults;