const axios = require('axios');
const natural = require('natural');
const fuzzball = require('fuzzball');

// Initialize tokenizer
const tokenizer = new natural.WordTokenizer();

class JobNormalizer {
  constructor() {
    this.opencageApiKey = process.env.OPENCAGE_API_KEY;
    this.cache = new Map();
  }

  /**
   * Normalize location using OpenCage API and extract country code
   */
  async normalizeLocation(location) {
    if (!location || typeof location !== 'string') {
      return { normalized: '', country_code: null };
    }

    const cacheKey = `location_${location.toLowerCase()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: location,
          key: this.opencageApiKey,
          limit: 1,
          no_annotations: 1
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const apiResult = response.data.results[0];
        const components = apiResult.components;
        
        const normalized = [
          components.city || components.town || components.village,
          components.state,
          components.country
        ].filter(Boolean).join(', ');

        const countryCode = components.country_code?.toUpperCase() || null;

        const result = { normalized, country_code: countryCode };
        this.cache.set(cacheKey, result);
        return result;
      }
    } catch (error) {
      console.warn(`OpenCage API error for location "${location}":`, error.message);
    }

    // Fallback: return original location with null country code
    const result = { normalized: location, country_code: null };
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Normalize job data from any source into standard format
   */
  async normalizeJob(source, rawJob) {
    const normalized = {
      title: '',
      company: '',
      location: '',
      apply_link: '',
      salary: null,
      employment_type: '',
      description: '',
      country_code: null,
      source: source,
      original_id: rawJob.id || rawJob.job_id || rawJob.uuid || null,
      created_at: rawJob.created_at || rawJob.date_posted || new Date().toISOString(),
      matched_keywords: []
    };

    // Extract and normalize title
    normalized.title = this.extractTitle(rawJob);
    
    // Extract and normalize company
    normalized.company = this.extractCompany(rawJob);
    
    // Extract and normalize location
    const locationData = await this.normalizeLocation(this.extractLocation(rawJob));
    normalized.location = locationData.normalized;
    normalized.country_code = locationData.country_code;
    
    // Extract apply link
    normalized.apply_link = this.extractApplyLink(rawJob);
    
    // Extract and normalize salary
    normalized.salary = this.extractSalary(rawJob);
    
    // Extract and normalize employment type
    normalized.employment_type = this.extractEmploymentType(rawJob);
    
    // Extract description
    normalized.description = this.extractDescription(rawJob);

    return normalized;
  }

  /**
   * Extract title from various API formats
   */
  extractTitle(rawJob) {
    return rawJob.title || 
           rawJob.job_title || 
           rawJob.name || 
           rawJob.position || 
           rawJob.role || 
           '';
  }

  /**
   * Extract company from various API formats
   */
  extractCompany(rawJob) {
    return rawJob.company || 
           rawJob.company_name || 
           rawJob.employer || 
           rawJob.organization || 
           rawJob.employer_name || 
           '';
  }

  /**
   * Extract location from various API formats
   */
  extractLocation(rawJob) {
    return rawJob.location || 
           rawJob.city || 
           rawJob.place || 
           rawJob.area || 
           rawJob.address || 
           '';
  }

  /**
   * Extract apply link from various API formats
   */
  extractApplyLink(rawJob) {
    return rawJob.apply_link || 
           rawJob.url || 
           rawJob.link || 
           rawJob.application_url || 
           rawJob.redirect_url || 
           '';
  }

  /**
   * Extract and normalize salary from various formats
   */
  extractSalary(rawJob) {
    const salary = rawJob.salary || 
                   rawJob.salary_min || 
                   rawJob.salary_max || 
                   rawJob.compensation || 
                   rawJob.pay || 
                   '';

    if (!salary) return null;

    // Handle different salary formats
    if (typeof salary === 'number') return salary;
    
    if (typeof salary === 'string') {
      // Extract numbers from strings like "$50,000 - $70,000" or "€30k-40k"
      const numbers = salary.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        // Take the first number as base salary
        let baseSalary = parseInt(numbers[0]);
        
        // Handle k/thousand notation
        if (salary.toLowerCase().includes('k')) {
          baseSalary *= 1000;
        }
        
        return baseSalary;
      }
    }

    return null;
  }

  /**
   * Extract and normalize employment type
   */
  extractEmploymentType(rawJob) {
    const type = rawJob.employment_type || 
                 rawJob.type || 
                 rawJob.job_type || 
                 rawJob.contract_type || 
                 '';

    if (!type) return '';

    const normalized = type.toLowerCase().trim();
    
    // Map common variations to standard types
    const typeMap = {
      'full-time': 'full-time',
      'fulltime': 'full-time',
      'full time': 'full-time',
      'permanent': 'full-time',
      'part-time': 'part-time',
      'parttime': 'part-time',
      'part time': 'part-time',
      'contract': 'contract',
      'freelance': 'freelance',
      'internship': 'internship',
      'intern': 'internship',
      'temporary': 'contract',
      'temp': 'contract'
    };

    return typeMap[normalized] || normalized;
  }

  /**
   * Extract description from various API formats
   */
  extractDescription(rawJob) {
    return rawJob.description || 
           rawJob.summary || 
           rawJob.details || 
           rawJob.content || 
           rawJob.job_description || 
           '';
  }

  /**
   * Calculate weighted relevance score for a job
   */
  calculateRelevanceScore(job, query, userLocation = null) {
    const queryTokens = tokenizer.tokenize(query.toLowerCase());
    const titleTokens = tokenizer.tokenize(job.title.toLowerCase());
    const descriptionTokens = tokenizer.tokenize(job.description.toLowerCase());
    
    let score = 0;
    
    // Title relevance (highest weight)
    const titleSimilarity = this.calculateCosineSimilarity(queryTokens, titleTokens);
    score += titleSimilarity * 0.5;
    
    // Description relevance
    const descSimilarity = this.calculateCosineSimilarity(queryTokens, descriptionTokens);
    score += descSimilarity * 0.3;
    
    // Location match (if user location provided)
    if (userLocation && job.country_code) {
      const locationMatch = this.calculateLocationMatch(userLocation, job.country_code);
      score += locationMatch * 0.2;
    }
    
    // Employment type bonus
    if (job.employment_type) {
      score += 0.05;
    }
    
    // Salary information bonus
    if (job.salary) {
      score += 0.05;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate cosine similarity between two token arrays
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
    
    // Simple country code match
    if (userLocation.country_code === jobCountryCode) {
      return 1.0;
    }
    
    // Fuzzy match for country names
    const userCountry = userLocation.country || '';
    const jobCountry = this.getCountryName(jobCountryCode);
    
    if (userCountry && jobCountry) {
      const similarity = fuzzball.ratio(userCountry.toLowerCase(), jobCountry.toLowerCase());
      return similarity / 100;
    }
    
    return 0;
  }

  /**
   * Get country name from country code
   */
  getCountryName(countryCode) {
    const countries = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'IE': 'Ireland',
      'JP': 'Japan',
      // Add more as needed
    };
    return countries[countryCode] || countryCode;
  }

  /**
   * Extract matched keywords for highlighting
   */
  extractMatchedKeywords(job, query) {
    const queryTokens = tokenizer.tokenize(query.toLowerCase());
    const titleTokens = tokenizer.tokenize(job.title.toLowerCase());
    const descTokens = tokenizer.tokenize(job.description.toLowerCase());
    
    const allJobTokens = [...new Set([...titleTokens, ...descTokens])];
    const matched = [];
    
    for (const queryToken of queryTokens) {
      for (const jobToken of allJobTokens) {
        if (jobToken.includes(queryToken) || queryToken.includes(jobToken)) {
          matched.push(jobToken);
        }
      }
    }
    
    return [...new Set(matched)].slice(0, 5); // Limit to 5 keywords
  }
}

module.exports = JobNormalizer; 