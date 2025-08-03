const natural = require('natural');

class JobFilter {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
  }

  /**
   * Apply all filters to a job array
   */
  filterJobs(jobs, filters) {
    return jobs.filter(job => {
      return this.matchesAllFilters(job, filters);
    });
  }

  /**
   * Check if job matches all applied filters
   */
  matchesAllFilters(job, filters) {
    // Remote only filter
    if (filters.remote_only && !this.isRemoteJob(job)) {
      return false;
    }

    // Salary range filter
    if (filters.min_salary || filters.max_salary) {
      if (!this.matchesSalaryRange(job, filters.min_salary, filters.max_salary)) {
        return false;
      }
    }

    // Employment type filter
    if (filters.employment_type && !this.matchesEmploymentType(job, filters.employment_type)) {
      return false;
    }

    // Experience level filter
    if (filters.experience_level && !this.matchesExperienceLevel(job, filters.experience_level)) {
      return false;
    }

    return true;
  }

  /**
   * Check if job is remote
   */
  isRemoteJob(job) {
    const remoteKeywords = [
      'remote', 'work from home', 'wfh', 'virtual', 'telecommute', 
      'distributed', 'anywhere', 'worldwide', 'global'
    ];

    const textToCheck = [
      job.title,
      job.description,
      job.location
    ].join(' ').toLowerCase();

    return remoteKeywords.some(keyword => textToCheck.includes(keyword));
  }

  /**
   * Check if job salary matches the specified range
   */
  matchesSalaryRange(job, minSalary, maxSalary) {
    if (!job.salary) return true; // If no salary filter, include all jobs

    const jobSalary = job.salary;

    if (minSalary && jobSalary < parseInt(minSalary)) {
      return false;
    }

    if (maxSalary && jobSalary > parseInt(maxSalary)) {
      return false;
    }

    return true;
  }

  /**
   * Check if job employment type matches filter
   */
  matchesEmploymentType(job, filterType) {
    if (!filterType || !job.employment_type) return true;

    const jobType = job.employment_type.toLowerCase();
    const filterTypeLower = filterType.toLowerCase();

    return jobType === filterTypeLower;
  }

  /**
   * Check if job experience level matches filter
   */
  matchesExperienceLevel(job, filterLevel) {
    if (!filterLevel) return true;

    const jobText = [
      job.title,
      job.description
    ].join(' ').toLowerCase();

    const levelKeywords = this.getExperienceLevelKeywords(filterLevel);
    
    return levelKeywords.some(keyword => jobText.includes(keyword));
  }

  /**
   * Get keywords for each experience level
   */
  getExperienceLevelKeywords(level) {
    const levelMap = {
      'entry': ['entry level', 'entry-level', 'junior', 'beginner', 'graduate', 'new grad', 'recent graduate'],
      'junior': ['junior', 'entry level', 'entry-level', 'beginner', '1-2 years', '1+ years'],
      'mid': ['mid level', 'mid-level', 'intermediate', '3-5 years', '3+ years', 'experienced'],
      'senior': ['senior', 'lead', 'principal', '5+ years', '7+ years', '10+ years'],
      'lead': ['lead', 'senior', 'principal', 'team lead', 'technical lead'],
      'principal': ['principal', 'senior', 'architect', 'expert'],
      'intern': ['intern', 'internship', 'student', 'co-op'],
      'trainee': ['trainee', 'apprentice', 'training', 'learning'],
      'apprentice': ['apprentice', 'trainee', 'learning'],
      'associate': ['associate', 'junior', 'entry level'],
      'graduate': ['graduate', 'new grad', 'recent graduate', 'entry level'],
      'fresher': ['fresher', 'new graduate', 'entry level', 'no experience']
    };

    return levelMap[level] || [];
  }

  /**
   * Sort jobs by relevance score
   */
  sortByRelevance(jobs, query, userLocation = null) {
    return jobs.map(job => {
      const relevanceScore = this.calculateRelevanceScore(job, query, userLocation);
      return { ...job, relevance_score: relevanceScore };
    }).sort((a, b) => b.relevance_score - a.relevance_score);
  }

  /**
   * Calculate relevance score for sorting
   */
  calculateRelevanceScore(job, query, userLocation = null) {
    const queryTokens = this.tokenizer.tokenize(query.toLowerCase());
    const titleTokens = this.tokenizer.tokenize(job.title.toLowerCase());
    const descTokens = this.tokenizer.tokenize(job.description.toLowerCase());

    let score = 0;

    // Title relevance (highest weight)
    const titleSimilarity = this.calculateCosineSimilarity(queryTokens, titleTokens);
    score += titleSimilarity * 0.5;

    // Description relevance
    const descSimilarity = this.calculateCosineSimilarity(queryTokens, descTokens);
    score += descSimilarity * 0.3;

    // Location match
    if (userLocation && job.country_code) {
      const locationMatch = this.calculateLocationMatch(userLocation, job.country_code);
      score += locationMatch * 0.2;
    }

    // Bonus for complete information
    if (job.salary) score += 0.05;
    if (job.employment_type) score += 0.05;
    if (job.apply_link) score += 0.05;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate cosine similarity
   */
  calculateCosineSimilarity(tokens1, tokens2) {
    if (!tokens1.length || !tokens2.length) return 0;

    const allTokens = [...new Set([...tokens1, ...tokens2])];
    const vector1 = allTokens.map(token => tokens1.filter(t => t === token).length);
    const vector2 = allTokens.map(token => tokens2.filter(t => t === token).length);

    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Calculate location match score
   */
  calculateLocationMatch(userLocation, jobCountryCode) {
    if (!userLocation || !jobCountryCode) return 0;

    if (userLocation.country_code === jobCountryCode) {
      return 1.0;
    }

    return 0;
  }

  /**
   * Apply source-aware ranking boost
   */
  applySourceBoost(jobs, sourceBoosts = {}) {
    return jobs.map(job => {
      const boost = sourceBoosts[job.source] || 1.0;
      return {
        ...job,
        relevance_score: job.relevance_score * boost
      };
    }).sort((a, b) => b.relevance_score - a.relevance_score);
  }

  /**
   * Remove duplicate jobs based on title and company
   */
  removeDuplicates(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get filter statistics
   */
  getFilterStats(jobs, filters) {
    const totalJobs = jobs.length;
    const filteredJobs = this.filterJobs(jobs, filters);
    
    return {
      total: totalJobs,
      filtered: filteredJobs.length,
      filters_applied: Object.keys(filters).filter(key => filters[key]).length
    };
  }

  /**
   * Validate filter parameters
   */
  validateFilters(filters) {
    const errors = [];

    if (filters.min_salary && isNaN(filters.min_salary)) {
      errors.push('min_salary must be a number');
    }

    if (filters.max_salary && isNaN(filters.max_salary)) {
      errors.push('max_salary must be a number');
    }

    if (filters.min_salary && filters.max_salary && 
        parseInt(filters.min_salary) > parseInt(filters.max_salary)) {
      errors.push('min_salary cannot be greater than max_salary');
    }

    const validEmploymentTypes = [
      'full-time', 'part-time', 'contract', 'freelance', 'internship'
    ];

    if (filters.employment_type && !validEmploymentTypes.includes(filters.employment_type)) {
      errors.push('invalid employment_type');
    }

    const validExperienceLevels = [
      'entry', 'junior', 'mid', 'senior', 'lead', 'principal', 
      'intern', 'trainee', 'apprentice', 'associate', 'graduate', 'fresher'
    ];

    if (filters.experience_level && !validExperienceLevels.includes(filters.experience_level)) {
      errors.push('invalid experience_level');
    }

    return errors;
  }
}

module.exports = JobFilter; 