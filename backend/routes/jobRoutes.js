require("dotenv").config();
const express = require("express");
const JobAggregator = require('../utils/jobAggregator');
const JobFilter = require('../utils/jobFilter');
const router = express.Router();

const jobAggregator = new JobAggregator();
const jobFilter = new JobFilter();

/**
 * Enhanced job search endpoint with all new features
 */
router.get("/search-jobs", async (req, res) => {
  const {
    title = "",
    location = "",
    page = 1,
    limit = 12,
    remote_only = false,
    min_salary,
    max_salary,
    employment_type,
    experience_level,
  } = req.query;

  // Validate required parameters
  if (!title.trim()) {
    return res.status(400).json({ 
      error: "Job title is required.",
      code: "MISSING_TITLE"
    });
  }

  // Parse and validate parameters
  const pageInt = parseInt(page) || 1;
  const limitInt = parseInt(limit) || 12;
  const remoteOnlyBool = remote_only === "true";
  const minSalaryNum = min_salary ? parseInt(min_salary) : null;
  const maxSalaryNum = max_salary ? parseInt(max_salary) : null;

  // Validate filters
  const filters = {
    remote_only: remoteOnlyBool,
    min_salary: minSalaryNum,
    max_salary: maxSalaryNum,
    employment_type: employment_type || '',
    experience_level: experience_level || ''
  };

  const filterErrors = jobFilter.validateFilters(filters);
  if (filterErrors.length > 0) {
    return res.status(400).json({
      error: "Invalid filter parameters",
      details: filterErrors,
      code: "INVALID_FILTERS"
    });
  }

  try {
    // Normalize user location to get country code
    let userLocation = null;
    if (location) {
      const locationData = await jobAggregator.normalizer.normalizeLocation(location);
      userLocation = locationData;
      filters.country_code = locationData.country_code;
    }

    // Aggregate jobs from multiple sources
    const results = await jobAggregator.aggregateJobs(
      title,
      filters,
      pageInt,
      limitInt
    );

    // Group jobs by source for frontend display
    const groupedJobs = {};
    results.jobs.forEach(job => {
      if (!groupedJobs[job.source]) {
        groupedJobs[job.source] = [];
      }
      groupedJobs[job.source].push(job);
    });

    const response = {
      jobs: groupedJobs,
      total_count: results.total_count,
      page: pageInt,
      limit: limitInt,
      has_more: results.has_more,
      query_time: results.query_time,
      sources: results.sources,
      errors: results.errors,
      filters_applied: Object.keys(filters).filter(key => filters[key]).length
    };

    return res.json(response);

  } catch (error) {
    console.error('Job search error:', error);
    return res.status(500).json({
      error: "Failed to search jobs",
      message: error.message,
      code: "SEARCH_FAILED"
    });
  }
});

/**
 * Get job search suggestions
 */
router.get("/suggestions", async (req, res) => {
  const { partial = "" } = req.query;

  try {
    const suggestions = await jobAggregator.getSuggestions(partial);
    
    return res.json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error);
    return res.status(500).json({
      error: "Failed to get suggestions",
      message: error.message
    });
  }
});

/**
 * Get job search statistics and performance metrics
 */
router.get("/stats", async (req, res) => {
  try {
    const configErrors = jobAggregator.validateConfiguration();
    
    const stats = {
      api_configuration: {
        valid: configErrors.length === 0,
        errors: configErrors
      },
      sources_configured: Object.keys(jobAggregator.apiKeys).length,
      source_boosts: jobAggregator.sourceBoosts,
      timestamp: new Date().toISOString()
    };

    return res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({
      error: "Failed to get statistics",
      message: error.message
    });
  }
});

/**
 * Health check endpoint for job search service
 */
router.get("/health", async (req, res) => {
  try {
    const configErrors = jobAggregator.validateConfiguration();
    
    const health = {
      status: configErrors.length === 0 ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      configuration_errors: configErrors.length,
      services: {
        normalizer: "ok",
        filter: "ok",
        aggregator: configErrors.length === 0 ? "ok" : "error"
      }
    };

    return res.json(health);
  } catch (error) {
    return res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
