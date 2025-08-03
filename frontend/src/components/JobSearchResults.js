import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  Filter,
  ChevronDown,
  TrendingUp,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    remote_only: false,
    min_salary: '',
    max_salary: '',
    employment_type: '',
    experience_level: ''
  });

  const employmentTypes = [
    { value: '', label: 'All Types' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ];

  const experienceLevels = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'principal', label: 'Principal' },
    { value: 'intern', label: 'Intern' },
    { value: 'trainee', label: 'Trainee' },
    { value: 'apprentice', label: 'Apprentice' },
    { value: 'associate', label: 'Associate' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'fresher', label: 'Fresher' }
  ];

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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      remote_only: false,
      min_salary: '',
      max_salary: '',
      employment_type: '',
      experience_level: ''
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.remote_only) count++;
    if (filters.min_salary) count++;
    if (filters.max_salary) count++;
    if (filters.employment_type) count++;
    if (filters.experience_level) count++;
    return count;
  };

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
        params: { 
          title, 
          location, 
          page: newPage, 
          limit: 12,
          ...filters
        },
      });

      // The new API returns jobs already grouped by source
      setResults(response.data.jobs);
      setPage(newPage);
      setHasMore(response.data.has_more);
      
      // Log performance metrics if available
      if (response.data.query_time) {
        console.log(`Job search completed in ${response.data.query_time}ms`);
      }
      
      // Log any API errors
      if (response.data.errors && response.data.errors.length > 0) {
        console.warn('Job search API errors:', response.data.errors);
      }
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

  const totalJobs = Object.values(results).reduce((sum, jobs) => sum + (Array.isArray(jobs) ? jobs.length : 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Find Your Perfect Job
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Discover opportunities that match your skills and ambitions across multiple job platforms
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 mb-8"
        >
          {/* Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Job Search</h2>
            </div>
            
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </motion.button>
          </div>

          {/* Main Search Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="relative lg:col-span-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Job Title (e.g., Software Engineer)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                list="title-suggestions"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 text-gray-900 placeholder-gray-500"
              />
              <datalist id="title-suggestions">
                {suggestions.titles.map((suggestion, index) => (
                  <option key={index} value={suggestion} />
                ))}
              </datalist>
            </div>

            <div className="relative lg:col-span-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Location (e.g., San Francisco)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                list="location-suggestions"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 text-gray-900 placeholder-gray-500"
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl px-6 py-4 font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl lg:col-span-1"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Searching...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Search Jobs</span>
                  <span className="sm:hidden">Search</span>
                </div>
              )}
            </motion.button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200 pt-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Advanced Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-center"
                  >
                    Clear All Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {/* Remote Only Toggle */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="remote-only"
                      checked={filters.remote_only}
                      onChange={(e) => handleFilterChange('remote_only', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="remote-only" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Remote Only
                    </label>
                  </div>

                  {/* Salary Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Min Salary
                    </label>
                    <input
                      type="number"
                      placeholder="50000"
                      value={filters.min_salary}
                      onChange={(e) => handleFilterChange('min_salary', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Max Salary
                    </label>
                    <input
                      type="number"
                      placeholder="150000"
                      value={filters.max_salary}
                      onChange={(e) => handleFilterChange('max_salary', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Employment Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Employment Type
                    </label>
                    <select
                      value={filters.employment_type}
                      onChange={(e) => handleFilterChange('employment_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                      {employmentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Experience Level
                    </label>
                    <select
                      value={filters.experience_level}
                      onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Summary */}
        {totalJobs > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="text-gray-700 text-sm sm:text-base">
                Found <span className="font-semibold text-blue-600">{totalJobs}</span> jobs for 
                <span className="font-semibold"> "{title}"</span>
                {location && <span> in "{location}"</span>}
                {getActiveFilterCount() > 0 && (
                  <span className="text-gray-500"> with {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} applied</span>
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* No Results State */}
        <AnimatePresence>
          {Object.keys(results).length === 0 && !loading && !error && title && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Jobs Found</h3>
                <p className="text-gray-600 mb-4">
                  No jobs found for "{title}"{location ? ` in "${location}"` : ''}
                </p>
                <p className="text-gray-500 text-sm">Try adjusting your search criteria or filters</p>
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{source}</h3>
                </div>
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job, index) => (
                  <motion.div
                    key={`${source}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (sourceIndex * 0.1) + (index * 0.05), duration: 0.5 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="group"
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                      {/* Job Title */}
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {job.title || 'No Title Available'}
                      </h4>

                      {/* Company */}
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 text-sm truncate">{job.company || 'Company Not Listed'}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 text-sm truncate">{job.location || 'Location Not Specified'}</span>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 space-y-3 mb-6">
                        {job.salary && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600 font-medium">
                              ${job.salary.toLocaleString()}/year
                            </span>
                          </div>
                        )}
                        {job.employment_type && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600 capitalize">{job.employment_type}</span>
                          </div>
                        )}
                        {job.matched_keywords && job.matched_keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.matched_keywords.slice(0, 3).map((keyword, i) => (
                              <span
                                key={i}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
                              >
                                {keyword}
                              </span>
                            ))}
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
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 group/btn shadow-lg hover:shadow-xl"
                        >
                          <span>Apply Now</span>
                          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </motion.a>
                      ) : (
                        <div className="w-full bg-gray-100 text-gray-400 rounded-xl px-4 py-3 text-center text-sm font-medium">
                          Application link unavailable
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
            className="text-center mt-12"
          >
            <motion.button
              onClick={loadMore}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 rounded-2xl px-8 py-4 font-medium hover:bg-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span>Loading more jobs...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Load More Jobs</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 pb-8"
        >
          <p className="text-gray-500 text-sm">
            Powered by multiple job platforms • Real-time search results
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default JobSearchResults;