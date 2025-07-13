const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

router.get("/job-news", async (req, res) => {
  const cacheKey = "job-news";
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    console.log("Serving from cache");
    return res.json({ articles: cachedData });
  }

  try {
    const response = await axios.get("https://newsdata.io/api/1/news", {
      params: {
        apikey: process.env.NEWSDATA_API_KEY,
        q: "job market OR employment OR hiring OR graduate jobs OR tech jobs OR technology OR careers", // Simplified query
        language: "en",
        category: "technology, education",
        country: "ie, gb, us",
        size: 10,
      },
      timeout: 10000,
    });

    if (!response.data || !response.data.results) {
      throw new Error("Invalid response from news API");
    }

    const articles = response.data.results.map((article) => ({
      title: article.title || "No title available",
      description: article.description || "No description available",
      link: article.link || "#",
      image_url: article.image_url || null,
      pubDate: article.pubDate || null,
      source_id: article.source_id || "News",
      category: article.category?.[0] || "Business",
    }));

    cache.set(cacheKey, articles);
    res.json({ articles });
  } catch (error) {
    console.error("NewsData fetch error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    }

    const fallbackArticles = [
      {
        title: "Job Market Trends: What to Expect in 2024",
        description: "The job market continues to evolve with remote work, AI integration, and changing skill requirements. Stay ahead of the curve with these insights.",
        link: "#",
        image_url: null,
        pubDate: new Date().toISOString(),
        source_id: "ApplySmart",
        category: "Business",
      },
      {
        title: "Top Skills Employers Are Looking For",
        description: "Discover the most in-demand skills across various industries and how to develop them to boost your career prospects.",
        link: "#",
        image_url: null,
        pubDate: new Date().toISOString(),
        source_id: "ApplySmart",
        category: "Career",
      },
      {
        title: "Remote Work: The New Normal",
        description: "How remote work is reshaping the job market and what it means for job seekers and employers alike.",
        link: "#",
        image_url: null,
        pubDate: new Date().toISOString(),
        source_id: "ApplySmart",
        category: "Workplace",
      },
    ];

    res.json({ articles: fallbackArticles });
  }
});

module.exports = router;