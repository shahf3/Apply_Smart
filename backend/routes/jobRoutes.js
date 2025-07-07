const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.get('/search-jobs', async (req, res) => {
  const { title = '', location = '', page = 1, limit = 10 } = req.query;
  const allJobs = [];
  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);

  const headers = (host) => ({
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': host
  });

  /*try {
    const linkedIn = await axios.get('https://linkedin-job-search-api.p.rapidapi.com/active-jb-24h', {
      params: {
        limit: limitInt,
        offset: (pageInt - 1) * limitInt,
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
  }*/

  try {
    const adzunaRes = await axios.get(`https://api.adzuna.com/v1/api/jobs/gb/search/${pageInt}`, {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_APP_KEY,
        what: title,
        where: location,
        results_per_page: limitInt
      }
    });
    (adzunaRes.data.results || []).forEach(job => {
      allJobs.push({
        title: job.title,
        company: job.company?.display_name || 'N/A',
        location: job.location?.display_name || location,
        apply_link: job.redirect_url,
        source: 'Adzuna'
      });
    });
  } catch (err) {
    console.warn('Adzuna API failed:', err.message);
  }

  try {
    const yc = await axios.get('https://free-y-combinator-jobs-api.p.rapidapi.com/active-jb-7d', {
      headers: headers('free-y-combinator-jobs-api.p.rapidapi.com')
    });
    (yc.data || []).forEach(job => {
      allJobs.push({
        title: job.title,
        company: job.company || job.company_name || 'N/A',
        location: job.location || job.country || job.city || 'N/A',
        apply_link: job.job_apply_link || job.url || job.link || null,
        source: 'Y Combinator'
      });
    });
  } catch (err) {
    console.warn('Y Combinator API failed:', err.message);
  }

  try {
    const intern = await axios.get('https://internships-api.p.rapidapi.com/active-jb-7d', {
      headers: headers('internships-api.p.rapidapi.com')
    });
    (intern.data || []).forEach(job => {
      allJobs.push({
        title: job.title,
        company: job.company || job.company_name || 'N/A',
        location: job.location || job.country || job.city || 'N/A',
        apply_link: job.job_apply_link || job.url || job.link || null,
        source: 'Internships'
      });
    });
  } catch (err) {
    console.warn('Internships API failed:', err.message);
  }

  /*try {
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
  }*/

  try {
  const remotiveRes = await axios.get('https://remotive.com/api/remote-jobs', {
    params: {
      search: title,
      limit: limitInt
    }
  });

  (remotiveRes.data.jobs || []).forEach(job => {
    allJobs.push({
      title: job.title,
      company: job.company_name || 'N/A',
      location: job.candidate_required_location || 'Remote',
      apply_link: job.url,
      source: 'Remotive'
    });
  });
  } catch (err) {
    console.warn('Remotive API failed:', err.message);
  }


  return res.json({ page: pageInt, count: allJobs.length, jobs: allJobs });
});

module.exports = router;