const axios = require("axios");
const JobNormalizer = require("./jobNormalizer");
const JobFilter = require("./jobFilter");

class JobAggregator {
  constructor() {
    this.normalizer = new JobNormalizer();
    this.filter = new JobFilter();
    this.apiKeys = {
      adzuna: {
        appId: process.env.ADZUNA_APP_ID,
        appKey: process.env.ADZUNA_APP_KEY,
      },
      jooble: process.env.JOOBLE_KEY,
      theirstack: process.env.THEIRSTACK_KEY,
      rapidapi: process.env.RAPIDAPI_KEY,
    };

    // Source ranking boosts (optional)
    this.sourceBoosts = {
      Adzuna: 1.1,
      Jooble: 1.0,
      TheirStack: 1.05,
      Remotive: 1.15,
      Internships: 1.0,
      "Y Combinator": 1.2,
      Rise: 1.0,
    };
  }

  /**
   * Aggregate jobs from multiple sources
   */
  async aggregateJobs(query, filters = {}, page = 1, limit = 12) {
    const startTime = Date.now();
    const results = {
      jobs: [],
      sources: {},
      total_count: 0,
      page: page,
      limit: limit,
      has_more: false,
      query_time: 0,
      errors: [],
    };

    try {
      // Fetch from multiple sources in parallel
      const sourcePromises = [
        this.fetchAdzunaJobs(query, filters, page, limit),
        this.fetchJoobleJobs(query, filters, page, limit),
        this.fetchTheirStackJobs(query, filters, page, limit),
        this.fetchRemotiveJobs(query, filters, page, limit),
        this.fetchInternshipsJobs(query, filters, page, limit),
        this.fetchYCombinatorJobs(query, filters, page, limit),
        this.fetchRiseJobs(query, filters, page, limit),
      ];

      const sourceResults = await Promise.allSettled(sourcePromises);

      // Process results from each source
      const sourceNames = [
        "Adzuna",
        "Jooble",
        "TheirStack",
        "Remotive",
        "Internships",
        "Y Combinator",
        "Rise",
      ];
      for (let i = 0; i < sourceResults.length; i++) {
        const result = sourceResults[i];
        const sourceName = sourceNames[i];

        if (result.status === "fulfilled") {
          const normalizedJobs = await this.normalizeJobs(
            sourceName,
            result.value
          );
          results.jobs.push(...normalizedJobs);
          results.sources[sourceName] = {
            count: normalizedJobs.length,
            success: true,
          };
        } else {
          results.errors.push({
            source: sourceName,
            error: result.reason.message,
          });
          results.sources[sourceName] = {
            count: 0,
            success: false,
            error: result.reason.message,
          };
        }
      }

      // Apply filters and sorting
      results.jobs = this.filter.filterJobs(results.jobs, filters);
      results.jobs = this.filter.removeDuplicates(results.jobs);
      results.jobs = this.filter.sortByRelevance(results.jobs, query);
      results.jobs = this.filter.applySourceBoost(
        results.jobs,
        this.sourceBoosts
      );

      // Add matched keywords for highlighting
      results.jobs = results.jobs.map((job) => ({
        ...job,
        matched_keywords: this.normalizer.extractMatchedKeywords(job, query),
      }));

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      results.jobs = results.jobs.slice(startIndex, endIndex);
      results.total_count = results.jobs.length;
      results.has_more = results.jobs.length === limit;

      results.query_time = Date.now() - startTime;

      // Log performance metrics
      this.logPerformance(results);
    } catch (error) {
      results.errors.push({
        source: "aggregator",
        error: error.message,
      });
    }

    return results;
  }

  /**
   * Fetch jobs from Adzuna API
   */
  async fetchAdzunaJobs(query, filters, page, limit) {
    const { appId, appKey } = this.apiKeys.adzuna;
    if (!appId || !appKey) {
      throw new Error("Adzuna API keys not configured");
    }

    // Map country codes to Adzuna country codes
    const countryCodeMap = {
      US: "us",
      GB: "gb",
      CA: "ca",
      AU: "au",
      DE: "de",
      FR: "fr",
      IE: "ie",
      NL: "nl",
      SE: "se",
      NO: "no",
      DK: "dk",
    };

    // Default to US if no country code or unsupported country
    const countryCode = filters.country_code
      ? countryCodeMap[filters.country_code] || "us"
      : "us";

    const params = {
      app_id: appId,
      app_key: appKey,
      results_per_page: limit,
      what: query,
      page: page,
    };

    // Add location if available
    if (filters.location) {
      params.where = filters.location;
    }

    try {
      const response = await axios.get(
        `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/${page}`,
        {
          params: {
            app_id: process.env.ADZUNA_APP_ID,
            app_key: process.env.ADZUNA_APP_KEY,
            what: query,
            results_per_page: limit,
            where: filters.location || "",
            sort_by: "date",
          },
        }
      );

      if (!response.data.results) {
        throw new Error("Invalid response from Adzuna API");
      }

      return response.data.results.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company_name,
        location: job.location?.display_name || "",
        apply_link: job.redirect_url,
        salary: job.salary_min || job.salary_max,
        employment_type: job.contract_time,
        description: job.description,
        created_at: job.created,
      }));
    } catch (error) {
      throw new Error(`Adzuna API error: ${error.message}`);
    }
  }

  /**
   * Fetch jobs from Jooble API
   */
  async fetchJoobleJobs(query, filters, page, limit) {
    const apiKey = this.apiKeys.jooble;
    if (!apiKey) {
      throw new Error("Jooble API key not configured");
    }

    const requestBody = {
      keywords: query,
      page: page,
      limit: limit,
    };

    // Add location if available
    if (filters.location) {
      requestBody.location = filters.location;
    }

    // Add remote filter if specified
    if (filters.remote_only) {
      requestBody.remote = true;
    }

    try {
      const response = await axios.post(
        "https://jooble.org/api/jooble",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.jobs) {
        throw new Error("Invalid response from Jooble API");
      }

      return response.data.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        apply_link: job.link,
        salary: job.salary,
        employment_type: job.type,
        description: job.snippet,
        created_at: job.updated,
      }));
    } catch (error) {
      throw new Error(`Jooble API error: ${error.message}`);
    }
  }

  /**
   * Fetch jobs from TheirStack API
   */
  async fetchTheirStackJobs(query, filters, page, limit) {
    const apiKey = this.apiKeys.theirstack;
    if (!apiKey) {
      throw new Error("TheirStack API key not configured");
    }

    const requestBody = {
      job_title_or: query && query.trim() !== "" ? [query] : ["developer"],
      limit: Math.min(Math.max(limit || 10, 1), 50),
      page: Math.max(0, (page || 1) - 1),
      posted_at_max_age_days: 30,
      order_by: [
        { desc: true, field: "date_posted" },
        { desc: true, field: "discovered_at" },
      ],
    };

    // Optional filters
    if (filters.country_code && /^[A-Z]{2}$/.test(filters.country_code)) {
      requestBody.job_country_code_or = [filters.country_code];
    }

    if (filters.remote_only) {
      requestBody.remote = true;
    }

    if (filters.min_salary) {
      requestBody.min_salary_usd = filters.min_salary;
    }

    if (filters.max_salary) {
      requestBody.max_salary_usd = filters.max_salary;
    }

    if (filters.employment_type) {
      const seniorityMap = {
        entry: "junior",
        intern: "junior",
        trainee: "junior",
        associate: "junior",
        graduate: "junior",
        fresher: "junior",
        junior: "junior",
        mid: "mid_level",
        senior: "senior",
        lead: "staff",
        principal: "c_level",
        staff: "staff",
      };

      if (seniorityMap[filters.employment_type]) {
        requestBody.job_seniority_or = [seniorityMap[filters.employment_type]];
      }
    }

    try {
      console.log(
        "[TheirStack] Sending request body:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await axios.post(
        "https://api.theirstack.com/v1/jobs/search",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log('[TheirStack] Raw response:', JSON.stringify(response.data, null, 2));
      if (!response.data || !response.data.jobs) {
        throw new Error("Invalid response from TheirStack API");
      }

      return response.data.results.map((job) => ({
        id: job.job_id,
        title: job.job_title,
        company: job.company_name || "N/A",
        location: job.job_location || "Remote",
        apply_link: job.job_url || job.final_url,
        salary: job.salary_min_usd || job.salary_max_usd || null,
        employment_type: this.mapSeniorityToEmploymentType(job.job_seniority),
        description: job.job_description || "",
        created_at: job.date_posted,
      }));
    } catch (error) {
      console.error(
        "TheirStack API error response:",
        error.response?.data || error.message
      );
      throw new Error(`TheirStack API error: ${error.message}`);
    }
  }

  /**
   * Map TheirStack seniority levels to employment types
   */
  mapSeniorityToEmploymentType(seniority) {
    const mapping = {
      junior: "entry",
      mid_level: "mid",
      senior: "senior",
      staff: "lead",
      c_level: "principal",
    };
    return mapping[seniority] || "full-time";
  }

  /**
   * Fetch jobs from Remotive API
   */
  async fetchRemotiveJobs(query, filters, page, limit) {
    try {
      const response = await axios.get("https://remotive.com/api/remote-jobs", {
        params: {
          search: query,
          limit: limit,
        },
      });

      if (!response.data.jobs) {
        throw new Error("Invalid response from Remotive API");
      }

      return response.data.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company_name || "N/A",
        location: job.candidate_required_location || "Remote",
        apply_link: job.url,
        salary: job.salary || null,
        employment_type: job.job_type || null,
        description: job.description || "",
        created_at: job.publication_date,
      }));
    } catch (error) {
      throw new Error(`Remotive API error: ${error.message}`);
    }
  }

  /**
   * Fetch jobs from Internships API (RapidAPI)
   */
  async fetchInternshipsJobs(query, filters, page, limit) {
    const apiKey = this.apiKeys.rapidapi;
    if (!apiKey) {
      throw new Error("RapidAPI key not configured");
    }

    try {
      const response = await axios.get(
        "https://internships-api.p.rapidapi.com/active-jb-7d",
        {
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "internships-api.p.rapidapi.com",
          },
          params: {
            title_filter: query,
            location_filter: filters.location || "Ireland",
          },
        }
      );

      if (!response.data) {
        throw new Error("Invalid response from Internships API");
      }

      return response.data.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.organization || "N/A",
        location:
          job.countries_derived?.[0] ||
          job.locations_raw?.[0] ||
          job.location_type ||
          "Remote",
        apply_link: job.url,
        salary: job.salary_raw || null,
        employment_type: job.employment_type?.[0] || null,
        description: job.description || "",
        created_at: job.date_posted,
      }));
    } catch (error) {
      throw new Error(`Internships API error: ${error.message}`);
    }
  }

  /**
   * Fetch jobs from Y Combinator API (RapidAPI)
   */
  async fetchYCombinatorJobs(query, filters, page, limit) {
    const apiKey = this.apiKeys.rapidapi;
    if (!apiKey) {
      throw new Error("RapidAPI key not configured");
    }

    try {
      const response = await axios.get(
        "https://free-y-combinator-jobs-api.p.rapidapi.com/active-jb-7d",
        {
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "free-y-combinator-jobs-api.p.rapidapi.com",
          },
        }
      );

      if (!response.data) {
        throw new Error("Invalid response from Y Combinator API");
      }

      return response.data.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company || "N/A",
        location: job.location || "Remote",
        apply_link: job.job_apply_link || job.url || job.link || null,
        salary: null,
        employment_type: null,
        description: job.description || "",
        created_at: job.date_posted,
      }));
    } catch (error) {
      throw new Error(`Y Combinator API error: ${error.message}`);
    }
  }

  /**
   * Fetch jobs from Rise API
   */
  async fetchRiseJobs(query, filters, page, limit) {
    try {
      const response = await axios.get(
        "https://api.joinrise.io/api/v1/jobs/public",
        {
          params: {
            page: page,
            limit: limit,
            query: query,
            location: filters.location || "",
          },
        }
      );

      if (!response.data.jobs) {
        throw new Error("Invalid response from Rise API");
      }

      return response.data.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        apply_link: job.url,
        salary: job.salary || null,
        employment_type: job.type || null,
        description: job.description || "",
        created_at: job.created_at,
      }));
    } catch (error) {
      throw new Error(`Rise API error: ${error.message}`);
    }
  }

  /**
   * Normalize jobs from a specific source
   */
  async normalizeJobs(source, rawJobs) {
    const normalizedJobs = [];

    for (const rawJob of rawJobs) {
      try {
        const normalizedJob = await this.normalizer.normalizeJob(
          source,
          rawJob
        );
        normalizedJobs.push(normalizedJob);
      } catch (error) {
        console.warn(`Failed to normalize job from ${source}:`, error.message);
      }
    }

    return normalizedJobs;
  }

  /**
   * Get suggestions for job titles and locations
   */
  async getSuggestions(partial = "") {
    const suggestions = {
      titles: [],
      locations: [],
    };

    try {
      // Popular job titles based on common searches
      const popularTitles = [
        "Software Engineer",
        "Data Scientist",
        "Product Manager",
        "UX Designer",
        "DevOps Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Data Analyst",
        "Project Manager",
        "Marketing Manager",
        "Sales Representative",
        "Customer Success Manager",
        "Content Writer",
        "Graphic Designer",
        "Business Analyst",
      ];

      // Popular locations
      const popularLocations = [
        "United States",
        "United Kingdom",
        "Canada",
        "Australia",
        "Germany",
        "France",
        "Ireland",
        "Netherlands",
        "Sweden",
        "Norway",
        "Denmark",
        "Remote",
        "New York",
        "London",
        "San Francisco",
        "Toronto",
        "Sydney",
      ];

      if (partial) {
        // Filter suggestions based on partial input
        suggestions.titles = popularTitles
          .filter((title) =>
            title.toLowerCase().includes(partial.toLowerCase())
          )
          .slice(0, 10);

        suggestions.locations = popularLocations
          .filter((location) =>
            location.toLowerCase().includes(partial.toLowerCase())
          )
          .slice(0, 10);
      } else {
        // Return top suggestions
        suggestions.titles = popularTitles.slice(0, 10);
        suggestions.locations = popularLocations.slice(0, 10);
      }
    } catch (error) {
      console.warn("Failed to get suggestions:", error.message);
    }

    return suggestions;
  }

  /**
   * Log performance metrics for monitoring
   */
  logPerformance(results) {
    const metrics = {
      timestamp: new Date().toISOString(),
      query_time: results.query_time,
      total_jobs: results.total_count,
      sources_queried: Object.keys(results.sources).length,
      sources_successful: Object.values(results.sources).filter(
        (s) => s.success
      ).length,
      errors: results.errors.length,
    };

    console.log("Job Search Performance:", JSON.stringify(metrics, null, 2));

    // Log slow queries
    if (results.query_time > 5000) {
      console.warn(`Slow job search query: ${results.query_time}ms`);
    }

    // Log API failures
    if (results.errors.length > 0) {
      console.error("Job search API errors:", results.errors);
    }
  }

  /**
   * Validate API configuration
   */
  validateConfiguration() {
    const errors = [];

    if (!this.apiKeys.adzuna.appId || !this.apiKeys.adzuna.appKey) {
      errors.push("Adzuna API keys not configured");
    }

    if (!this.apiKeys.jooble) {
      errors.push("Jooble API key not configured");
    }

    if (!this.apiKeys.theirstack) {
      errors.push("TheirStack API key not configured");
    }

    // Note: RapidAPI key is optional but recommended for additional sources
    if (!this.apiKeys.rapidapi) {
      errors.push(
        "RapidAPI key not configured (optional but recommended for Y Combinator and Internships)"
      );
    }

    return errors;
  }
}

module.exports = JobAggregator;
