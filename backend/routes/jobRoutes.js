const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.get('/search-jobs', async (req, res) => {
  const { title = '', location = '' } = req.query;
  const allJobs = [];

  const headers = (host) => ({
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': host
  });

  try {
    // LinkedIn API
    const linkedIn = await axios.get('https://linkedin-job-search-api.p.rapidapi.com/active-jb-24h', {
      params: {
        limit: 10,
        offset: 0,
        title_filter: `"${title}"`,
        location_filter: `"${location}"`
      },
      headers: headers('linkedin-job-search-api.p.rapidapi.com')
    });
    (linkedIn.data.jobs || []).forEach(job => {
      allJobs.push({
        title: job.title,
        company: job.company_name,
        location: job.location,
        apply_link: job.job_apply_link,
        source: 'LinkedIn'
      });
    });
  } catch (err) {
    console.warn('LinkedIn API failed:', err.message);
  }

  try {
    // Y Combinator Jobs API
    const yc = await axios.get('https://free-y-combinator-jobs-api.p.rapidapi.com/active-jb-7d', {
      headers: headers('free-y-combinator-jobs-api.p.rapidapi.com')
    });
    (yc.data || []).forEach(job => {
      allJobs.push({
        title: job.title,
        company: job.company_name,
        location: job.location,
        apply_link: job.job_apply_link,
        source: 'Y Combinator'
      });
    });
  } catch (err) {
    console.warn('Y Combinator API failed:', err.message);
  }

  try {
    // Internships API
    const intern = await axios.get('https://internships-api.p.rapidapi.com/active-jb-7d', {
      headers: headers('internships-api.p.rapidapi.com')
    });
    (intern.data || []).forEach(job => {
      allJobs.push({
        title: job.title,
        company: job.company_name,
        location: job.location,
        apply_link: job.job_apply_link,
        source: 'Internships'
      });
    });
  } catch (err) {
    console.warn('Internships API failed:', err.message);
  }

  try {
    // Upwork Freelance Jobs API
    const upwork = await axios.get('https://upwork-jobs-api2.p.rapidapi.com/active-freelance-1h?limit=10', {
      headers: headers('upwork-jobs-api2.p.rapidapi.com')
    });
    (upwork.data || []).forEach(job => {
      allJobs.push({
        title: job.title,
        company: job.client_name || 'N/A',
        location: job.location || 'Remote',
        apply_link: job.url,
        source: 'Upwork'
      });
    });
  } catch (err) {
    console.warn('Upwork API failed:', err.message);
  }

  return res.json({ total: allJobs.length, jobs: allJobs });
});

module.exports = router;
