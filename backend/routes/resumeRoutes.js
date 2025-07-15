const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool(); // configure with your DB credentials
const puppeteer = require('puppeteer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a new resume
router.post('/resumes', async (req, res) => {
  const { user_id, title } = req.body;
  const result = await pool.query(
    'INSERT INTO resumes (user_id, title) VALUES ($1, $2) RETURNING *',
    [user_id, title]
  );
  res.json(result.rows[0]);
});

// Add/update a section
router.post('/resumes/:resumeId/sections', async (req, res) => {
  const { section_type, content, position } = req.body;
  const { resumeId } = req.params;
  const result = await pool.query(
    `INSERT INTO resume_sections (resume_id, section_type, content, position)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (resume_id, section_type)
     DO UPDATE SET content = $3, position = $4
     RETURNING *`,
    [resumeId, section_type, content, position]
  );
  res.json(result.rows[0]);
});

// Get a resume with all sections
router.get('/resumes/:resumeId', async (req, res) => {
  const { resumeId } = req.params;
  const resume = await pool.query('SELECT * FROM resumes WHERE id = $1', [resumeId]);
  const sections = await pool.query(
    'SELECT * FROM resume_sections WHERE resume_id = $1 ORDER BY position',
    [resumeId]
  );
  res.json({ ...resume.rows[0], sections: sections.rows });
});

// Delete a resume
router.delete('/resumes/:resumeId', async (req, res) => {
  await pool.query('DELETE FROM resumes WHERE id = $1', [req.params.resumeId]);
  res.json({ success: true });
});

// PDF export (using Puppeteer)
router.post('/resumes/:resumeId/export', async (req, res) => {
  const { html } = req.body; // frontend sends rendered HTML
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  res.set({ 'Content-Type': 'application/pdf' });
  res.send(pdfBuffer);
});

// AI suggestion (Gemini)
router.post('/resumes/ai-suggest', async (req, res) => {
  const { sectionType, content, jobTitle } = req.body;
  const prompt = `
You are a resume writing assistant. Improve the following ${sectionType} section for a ${jobTitle} role. Make it concise, impactful, and use strong action verbs. Return only the improved text.

Original:
${content}
  `;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  res.json({ suggestion: result.response.text().trim() });
});

module.exports = router;