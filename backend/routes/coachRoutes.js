const express = require('express');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple per-IP rate limit for this feature
const coachLimiter = rateLimit({
  windowMs: Number(process.env.COACH_RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.COACH_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
});

// Zod schema to validate incoming payloads
const ContextSchema = z.object({
  title: z.string().max(300).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  publishedAt: z.string().max(100).optional().nullable(),
  link: z.string().max(500).optional().nullable(),
});

const BodySchema = z.object({
  prompt: z.string().min(1).max(6000),
  context: ContextSchema.nullable().optional(),
  userProfile: z
    .object({
      name: z.string().max(100).optional(),
      skills: z.array(z.string().max(60)).max(50).optional(),
      experience: z.array(z.string().max(300)).max(50).optional(),
      goals: z.string().max(500).optional(),
    })
    .optional(),
  resumeSummary: z.string().max(3000).optional(),
});

function sanitizeText(s = '', max = 3000) {
  return String(s)
    .replace(/\s{2,}/g, ' ')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, max);
}

// Builds a compact prompt for Gemini
function buildPrompt({ prompt, context, userProfile, resumeSummary }) {
  const lines = [];

  lines.push(
    [
      'You are a precise, practical career coach.',
      'Use simple language.',
      'Return short, structured guidance.',
      'Prioritize tangible actions and next steps.',
      'When article context is present, reference it briefly and extract actionable signals.',
      'When appropriate, include a 7 day plan with 3 to 5 bullet points.',
    ].join(' ')
  );

  if (userProfile) {
    lines.push('\nUser profile:');
    if (userProfile.name) lines.push(`Name: ${sanitizeText(userProfile.name, 100)}`);
    if (userProfile.skills?.length) lines.push(`Skills: ${userProfile.skills.slice(0, 20).join(', ')}`);
    if (userProfile.goals) lines.push(`Goals: ${sanitizeText(userProfile.goals, 300)}`);
  }

  if (resumeSummary) {
    lines.push('\nResume summary:');
    lines.push(sanitizeText(resumeSummary, 1500));
  }

  if (context) {
    lines.push('\nSelected article:');
    if (context.title) lines.push(`Title: ${sanitizeText(context.title, 300)}`);
    if (context.description) lines.push(`Description: ${sanitizeText(context.description, 1000)}`);
    if (context.source) lines.push(`Source: ${sanitizeText(context.source, 60)}`);
    if (context.publishedAt) lines.push(`Published At: ${sanitizeText(context.publishedAt, 60)}`);
  }

  lines.push('\nUser question:');
  lines.push(sanitizeText(prompt, 1000));

  lines.push(
    `
Respond in this structure:
1) Summary insight
2) Top skills to build now (3 bullets)
3) Quick wins for 7 days (numbered list, 3–5 items)
4) Resume tweaks (2–3 bullets)
5) Optional certifications (0–2)
`.trim()
  );

  return lines.join('\n');
}

async function callGemini(rawPrompt) {
  const model = genAI.getGenerativeModel({
    model: process.env.COACH_MODEL || 'gemini-1.5-flash',
  });

  const timeoutMs = Number(process.env.COACH_TIMEOUT_MS || 20000);
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(new Error('AI request timed out')), timeoutMs);

  try {
    const result = await model.generateContent(
      {
        contents: [{ role: 'user', parts: [{ text: rawPrompt }] }],
        generationConfig: {
          maxOutputTokens: Number(process.env.COACH_MAX_TOKENS || 1024),
          temperature: 0.6,
        },
        safetySettings: [
          // You can add explicit safety settings if you want to be strict
          // { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
      { signal: controller.signal }
    );

    const text = result?.response?.text?.() || result?.response?.text?.() || '';
    return text.trim() || 'No advice returned.';
  } finally {
    clearTimeout(t);
  }
}

// POST /api/coach/advise
router.post('/advise', coachLimiter, async (req, res) => {
  try {
    const parse = BodySchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid request', details: parse.error.format() });
    }

    const { prompt, context = null, userProfile, resumeSummary } = parse.data;

    const rawPrompt = buildPrompt({ prompt, context, userProfile, resumeSummary });

    const advice = await callGemini(rawPrompt);

    const clean = advice.replace(/^```(?:\w+)?\s*|\s*```$/g, '').trim();

    return res.json({ advice: clean });
  } catch (error) {
    // Handle explicit rate limits or timeouts with specific messages
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'The coaching request timed out. Please try again.' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    console.error('Coach advise error:', error);
    return res.status(500).json({ error: 'Advice generation failed. Please try again.' });
  }
});

module.exports = router;
