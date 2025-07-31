require("dotenv").config();
const express = require("express");
const axios = require("axios");
const natural = require("natural");
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
const tokenizer = new natural.WordTokenizer();
const router = express.Router();

async function makeRequestWithRetry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (
        (error.response?.status === 429 || error.response?.status === 503) &&
        attempt < maxRetries
      ) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(
          `Retry ${attempt}/${maxRetries} after ${delay}ms: ${error.message}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

async function normalizeLocation(location) {
  if (!location || location.trim() === "") return { location, country: "" };

  try {
    const response = await makeRequestWithRetry(() =>
      axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: location,
          key: process.env.OPENCAGE_API_KEY,
          limit: 1,
        },
      })
    );

    const result = response.data.results[0];
    if (result) {
      const components = result.components;
      return {
        location: result.formatted,
        country: components.country || "",
      };
    }
  } catch (err) {
    console.warn("Location normalization failed:", err.message);
  }

  return { location, country: "" };
}

function deduplicateJobs(jobs) {
  const seen = new Set();
  return jobs.filter((job) => {
    const key = `${job.title}|${job.company}|${job.location}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function computeCosineSimilarity(text1, text2) {
  const tokens1 = tokenizer.tokenize(text1.toLowerCase());
  const tokens2 = tokenizer.tokenize(text2.toLowerCase());

  const allTokens = Array.from(new Set([...tokens1, ...tokens2]));
  const vec1 = allTokens.map(
    (token) => tokens1.filter((t) => t === token).length
  );
  const vec2 = allTokens.map(
    (token) => tokens2.filter((t) => t === token).length
  );

  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
}

function extractCountryFromLocation(location = "") {
  const map = {
    dublin: "ireland",
    london: "united kingdom",
    berlin: "germany",
    tokyo: "japan",
    paris: "france",
    madrid: "spain",
    barcelona: "spain",
    "san francisco": "usa",
    "new york": "usa",
    chicago: "usa",
    boston: "usa",
    toronto: "canada",
  };
  const key = location.trim().toLowerCase();
  return map[key] || key;
}

function filterRelevantJobs(
  jobs,
  title,
  userCountry,
  remoteOnly = false,
  minSalary,
  maxSalary,
  employmentType,
  experienceLevel
) {
  if (!title || !jobs || jobs.length === 0) return [];

  const country = userCountry?.toLowerCase() || "";
  const relevantJobs = [];

  jobs.forEach((job) => {
    const jobTitle = (job.title || "").toLowerCase();
    const jobLocation = (job.location || "").toLowerCase();

    const similarityScore = computeCosineSimilarity(title, jobTitle);

    const isRemote =
      jobLocation.includes("remote") ||
      jobLocation.includes("worldwide") ||
      jobLocation.includes("anywhere");

    const locationMatch =
      jobLocation.includes(country) ||
      country.includes(jobLocation) ||
      (country === "ireland" && jobLocation.includes("dublin")) ||
      (country === "united kingdom" && jobLocation.includes("london")) ||
      (country === "usa" &&
        (jobLocation.includes("united states") ||
          jobLocation.includes("san francisco") ||
          jobLocation.includes("new york") ||
          jobLocation.includes("boston")));

    const isSameCountry = locationMatch;

    if (remoteOnly && !isRemote) return;
    if (similarityScore < 0.1) return;
    if (!isRemote && country && !isSameCountry) return;

    if ((minSalary || maxSalary) && typeof job.salary !== "number") return;
    if (minSalary && job.salary < minSalary) return;
    if (maxSalary && job.salary > maxSalary) return;

    if (
      employmentType &&
      job.employment_type &&
      job.employment_type.toLowerCase() !== employmentType.toLowerCase()
    )
      return;
    if (
      experienceLevel &&
      job.title &&
      !job.title.toLowerCase().includes(experienceLevel.toLowerCase())
    )
      return;

    const queryTokens = new Set(tokenizer.tokenize(title.toLowerCase()));
    const titleTokens = new Set(tokenizer.tokenize(jobTitle));
    const matchedKeywords = [...queryTokens].filter((token) =>
      titleTokens.has(token)
    );

    relevantJobs.push({
      ...job,
      _score: similarityScore,
      matched_keywords: matchedKeywords,
    });
  });

  return relevantJobs
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...job }) => job);
}

router.get("/search-jobs", async (req, res) => {
  const {
    title = "",
    location = "",
    page = 1,
    limit = 10,
    remote_only = false,
    min_salary,
    max_salary,
    employment_type,
    experience_level,
  } = req.query;

  if (!title.trim())
    return res.status(400).json({ error: "Job title is required." });

  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);
  const remoteOnlyBool = remote_only === "true";
  const minSalaryNum = min_salary ? parseInt(min_salary) : null;
  const maxSalaryNum = max_salary ? parseInt(max_salary) : null;

  const { location: normalizedLocation, country: userCountry } =
    await normalizeLocation(location);

  const allJobs = [];

  const headers = (host) => ({
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": host,
  });

  try {
    const adzuna = await makeRequestWithRetry(() =>
      axios.get(`https://api.adzuna.com/v1/api/jobs/gb/search/${pageInt}`, {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          what: title,
          where: normalizedLocation,
          results_per_page: limitInt,
        },
      })
    );
    allJobs.push(
      ...(adzuna.data.results || []).map((job) => ({
        title: job.title,
        company: job.company?.display_name || "N/A",
        location: job.location?.display_name || normalizedLocation,
        apply_link: job.redirect_url,
        source: "Adzuna",
        salary: job.salary_min || null,
        employment_type: job.contract_time || null,
      }))
    );
  } catch (err) {
    console.warn("Adzuna API error:", err.message);
  }

  try {
    const jooble = await makeRequestWithRetry(() =>
      axios.post(`https://api.jooble.org/api/${process.env.JOOBLE_KEY}`, {
        keywords: title,
        location: normalizedLocation,
        page: pageInt,
        ResultOnPage: limitInt,
      })
    );
    allJobs.push(
      ...(jooble.data.jobs || []).map((job) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        apply_link: job.link,
        source: "Jooble",
        salary: job.salary || null,
        employment_type: job.type || null,
      }))
    );
  } catch (err) {
    console.warn("Jooble API error:", err.message);
  }

  try {
    const remotive = await makeRequestWithRetry(() =>
      axios.get("https://remotive.com/api/remote-jobs", {
        params: {
          search: title,
          location: normalizedLocation,
          limit: limitInt,
        },
      })
    );
    allJobs.push(
      ...(remotive.data.jobs || []).map((job) => ({
        title: job.title,
        company: job.company_name || "N/A",
        location: job.candidate_required_location || "Remote",
        apply_link: job.url,
        source: "Remotive",
        salary: job.salary || null,
        employment_type: job.job_type || null,
      }))
    );
  } catch (err) {
    console.warn("Remotive API error:", err.message);
  }

  try {
    const intern = await makeRequestWithRetry(() =>
      axios.get("https://internships-api.p.rapidapi.com/active-jb-7d", {
        headers: headers("internships-api.p.rapidapi.com"),
      })
    );
    allJobs.push(
      ...(intern.data || []).map((job) => ({
        title: job.title,
        company: job.company || "N/A",
        location: job.location || "N/A",
        apply_link: job.job_apply_link || job.url || job.link || null,
        source: "Internships",
      }))
    );
  } catch (err) {
    console.warn("Internships API error:", err.message);
  }

  try {
    const yc = await makeRequestWithRetry(() =>
      axios.get(
        "https://free-y-combinator-jobs-api.p.rapidapi.com/active-jb-7d",
        {
          headers: headers("free-y-combinator-jobs-api.p.rapidapi.com"),
        }
      )
    );
    allJobs.push(
      ...(yc.data || []).map((job) => ({
        title: job.title,
        company: job.company || "N/A",
        location: job.location || "Remote",
        apply_link: job.job_apply_link || job.url || job.link || null,
        source: "Y Combinator",
      }))
    );
  } catch (err) {
    console.warn("Y Combinator API error:", err.message);
  }

  try {
    const rise = await makeRequestWithRetry(() =>
      axios.get("https://api.joinrise.io/api/v1/jobs/public", {
        params: {
          page: pageInt,
          limit: limitInt,
          query: title,
          location: normalizedLocation,
        },
      })
    );
    allJobs.push(
      ...(rise.data.jobs || []).map((job) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        apply_link: job.url,
        source: "Rhise",
      }))
    );
  } catch (err) {
    console.warn("Rhise API error:", err.message);
  }

  try {
    const ts = await makeRequestWithRetry(() =>
      axios.get("https://api.theirstack.com/jobs", {
        params: { query: title, location: normalizedLocation, limit: limitInt },
        headers: { Authorization: `Bearer ${process.env.THEIRSTACK_KEY}` },
      })
    );
    allJobs.push(
      ...(ts.data.jobs || []).map((job) => ({
        title: job.job_title,
        company: job.company,
        location: job.location,
        apply_link: job.url,
        source: "TheirStack",
      }))
    );
  } catch (err) {
    console.warn("TheirStack API error:", err.message);
  }

  const dedupedJobs = deduplicateJobs(allJobs);
  const filteredJobs = filterRelevantJobs(
    dedupedJobs,
    title,
    userCountry,
    remoteOnlyBool,
    minSalaryNum,
    maxSalaryNum,
    employment_type,
    experience_level
  );

  const response = {
    page: pageInt,
    count: filteredJobs.length,
    jobs: filteredJobs.slice(0, limitInt),
  };

  return res.json(response);
});

module.exports = router;