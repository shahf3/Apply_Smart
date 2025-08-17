require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./database');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // keep folder lowercase
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const pdfParse = require('pdf-parse');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// routes
const coachRoutes = require('./routes/coachRoutes');
const jobRoutes = require('./routes/jobRoutes');
const geolocationRoutes = require('./routes/geolocationRoutes');
const coverLetterRoutes = require('./routes/coverLetterRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const newsRoutes = require('./routes/newsRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();

/* ----------------------------- Core middleware ---------------------------- */
app.set('trust proxy', 1); // for AWS/ELB/Amplify behind a proxy
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '4mb' }));

// CORS allow-list: localhost + your public client + *.amplifyapp.com
const allowList = [
  'http://localhost:3000',
  process.env.CLIENT_ORIGIN, // e.g. https://main-xxxx.amplifyapp.com
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow curl/postman
      if (allowList.includes(origin) || /\.amplifyapp\.com$/.test(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

/* --------------------------------- Health -------------------------------- */
app.get('/', (req, res) => res.send('OK'));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

/* ------------------------------- Gemini setup ----------------------------- */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Retry logic with exponential backoff
async function makeRequestWithRetry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 503 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms due to 503 error`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

async function getATSScore(resumeText, jobDescription) {
  const cleanedResume = resumeText
    .replace(/\s{2,}/g, ' ')
    .replace(/[\r\n]{2,}/g, '\n')
    .trim();

  const cleanedJD = jobDescription.trim();

  const prompt = `
You are an expert ATS (Applicant Tracking System) resume scoring engine.

Given the resume and job description below, perform the following:

1. **Score**: Assign a match score out of 100 based on relevance and keyword overlap.
2. **Summary**: Provide a concise, one-sentence summary explaining the match quality.
3. **Missing Keywords**: List 5 key terms, technologies, or skills from the job description missing or underrepresented in the resume.
4. **Strong Verbs**: Suggest 5 strong action verbs that should be used in the resume.
5. **Improvements**: Suggest 3 precise edits or additions that would improve the match.
6. **Resume Sentences**: Write 3 to 5 strong, tailored resume bullet points that:
   - Address missing skills
   - Use action verbs
   - Align with the job description

Return the response strictly in this JSON format:

{
  "score": <number>,
  "summary": "<text>",
  "missing_keywords": ["...", "..."],
  "action_words": ["...", "..."],
  "improvements": ["...", "..."],
  "resume_sentences": ["...", "..."]
}

Resume:
${cleanedResume}

Job Description:
${cleanedJD}
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await makeRequestWithRetry(() => model.generateContent(prompt));
    let output = result.response.text().trim();

    if (output.startsWith('```json')) {
      output = output.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (output.startsWith('```')) {
      output = output.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(output);
    return parsed;
  } catch (error) {
    console.error('Gemini API error or JSON parsing failed:', error);
    throw new Error(`Failed to generate ATS score: ${error.message}`);
  }
}

/* ---------------------------- Auth: Local & Google ------------------------ */
// Register (Local)
app.post('/register', async (req, res) => {
  try {
    const body = req.body || {};

    // normalize names from either style
    const firstname = body.firstname ?? body.firstName;
    const lastname  = body.lastname  ?? body.lastName;
    const { username, email, password } = body;

    // basic validation -> 400 instead of 500 when clients send wrong shape
    const missing = [];
    if (!username)  missing.push('username');
    if (!firstname) missing.push('firstname (or firstName)');
    if (!lastname)  missing.push('lastname (or lastName)');
    if (!email)     missing.push('email');
    if (!password)  missing.push('password');

    if (missing.length) {
      return res.status(400).json({
        message: 'Missing required fields',
        missing
      });
    }

    const userExists = await pool.query(
      'SELECT 1 FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (username, firstname, lastname, email, password)
       VALUES ($1, $2, $3, $4, $5)`,
      [username, firstname, lastname, email, hashedPassword]
    );

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    // keep response generic; details stay in logs
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login (Local)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user_id: user.id, user_name: user.firstname });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register (Google)
app.post('/register/google', async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';
    const username = email.split('@')[0];

    // Check if user already registered
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: 'User already registered. Please login instead.' });
    }

    await pool.query(
      `INSERT INTO users (username, firstname, lastname, email, google_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [username, firstName, lastName, email, googleId]
    );

    res.status(201).json({ message: 'Google user registered successfully' });
  } catch (error) {
    console.error('Google registration failed:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login (Google)
app.post('/auth/google', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const firstName = payload.given_name || '';
    const lastName  = payload.family_name || '';
    const username  = email.split('@')[0];

    let user = await pool.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    if (user.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (username, firstname, lastname, email, google_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [username, firstName, lastName, email, googleId]
      );
      user = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleId]
      );
    }

    const u = user.rows[0];
    const token = jwt.sign({ username: u.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user_id: u.id, user_name: u.firstname });
  } catch (error) {
    console.error('Google login failed:', error.message);
    res.status(401).json({ message: 'Login failed', error: error.message });
  }
});

/* ------------------------------- Profile APIs ----------------------------- */
// Get profile by user_id
app.get('/profile/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update profile
app.post('/profile', async (req, res) => {
  const { user_id, bio, experience, skills, education } = req.body;
  try {
    const existingProfile = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [
      user_id,
    ]);

    if (existingProfile.rows.length > 0) {
      await pool.query(
        'UPDATE profiles SET bio = $1, experience = $2, skills = $3, education = $4 WHERE user_id = $5',
        [bio, experience, skills, education, user_id]
      );
      return res.json({ message: 'Profile updated' });
    } else {
      await pool.query(
        'INSERT INTO profiles (user_id, bio, experience, skills, education) VALUES ($1, $2, $3, $4, $5)',
        [user_id, bio, experience, skills, education]
      );
      return res.status(201).json({ message: 'Profile created' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------------------------- Resume Upload/ATS --------------------------- */
// Upload resume and extract text
app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  const { user_id } = req.body;
  if (!req.file || !user_id) {
    return res.status(400).json({ message: 'No file uploaded or user_id missing' });
  }

  const filePath = req.file.path; // 'uploads/...'
  const fileName = req.file.originalname;

  try {
    const fileBuffer = await fsp.readFile(filePath);
    const parsed = await pdfParse(fileBuffer);

    await pool.query(
      'INSERT INTO resumes (user_id, filename, path, text_content) VALUES ($1, $2, $3, $4)',
      [user_id, fileName, filePath, parsed.text]
    );
    res.status(200).json({ message: 'Resume uploaded and extracted' });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  } finally {
    try {
      await fsp.unlink(filePath);
    } catch (unlinkErr) {
      console.error('Failed to delete uploaded file:', unlinkErr);
    }
  }
});

// Get resumes for a user
app.get('/resumes/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(
      'SELECT id, filename, path FROM resumes WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching resumes:', err);
    res.status(500).json({ error: 'Error fetching resumes' });
  }
});

// Update resume text content
app.put('/resumes/:resumeId', async (req, res) => {
  const { resumeId } = req.params;
  const { updatedText, userId } = req.body;

  try {
    const result = await pool.query(
      'UPDATE resumes SET text_content = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [updatedText, resumeId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Resume not found or not authorized' });
    }
    res.json({ message: 'Resume updated successfully' });
  } catch (err) {
    console.error('Error updating resume:', err);
    res.status(500).json({ error: 'Error updating resume' });
  }
});

// Fetch resume details
app.get('/resume-details/:resumeId', async (req, res) => {
  const { resumeId } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, filename, path, uploaded_at FROM resumes WHERE id = $1',
      [resumeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const filePath = result.rows[0].path;
    try {
      await fsp.access(filePath);
      console.log('File exists at path:', filePath);
    } catch {
      console.log('File NOT found at path:', filePath);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching resume details:', err);
    res.status(500).json({ error: 'Error fetching resume details' });
  }
});

// Serve static files (debug)
app.get('/test-static/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename); // lowercase

  console.log('Testing static file:', filePath);
  console.log('File exists:', fs.existsSync(filePath));

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Score resume
app.post('/score-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!req.body.jobDescription) {
      return res.status(400).json({ error: 'No job description provided' });
    }

    const fileBuffer = await fsp.readFile(req.file.path);
    const parsed = await pdfParse(fileBuffer);
    const score = await getATSScore(parsed.text, req.body.jobDescription);

    res.json({ score });
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded, please try again later.' });
    }
    console.error('Error in /score-resume:', err);
    res.status(500).json({ error: `Failed to parse PDF or calculate score: ${err.message}` });
  } finally {
    try {
      await fsp.unlink(req.file.path);
    } catch (unlinkErr) {
      console.error('Failed to delete uploaded file:', unlinkErr);
    }
  }
});

app.get('/health/db', async (_req, res) => {
  try {
    const r = await pool.query('SELECT 1 AS ok');
    res.json({ db: 'ok', result: r.rows[0] });
  } catch (e) {
    res.status(500).json({ db: 'down', error: e.message });
  }
});

app.get('/health/env', (_req, res) => {
  const url = process.env.DATABASE_URL || '';
  let safe = null;
  try {
    const u = new URL(url);
    safe = { host: u.hostname, port: u.port, db: u.pathname.slice(1) };
  } catch {}
  res.json({
    has_DATABASE_URL: !!url,
    database_url_safe: safe,
    has_JWT_SECRET: !!process.env.JWT_SECRET,
    client_origin: process.env.CLIENT_ORIGIN || null,
    node_env: process.env.NODE_ENV || null,
  });
});

/* --------------------------------- Routes -------------------------------- */
app.use('/api/jobs', jobRoutes);
app.use('/api', geolocationRoutes);
app.use('/api/cover-letter', coverLetterRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/news', newsRoutes);
app.use('/api', resumeRoutes);

app.use('/uploads', express.static('uploads')); // lowercase
app.use('/html', express.static(path.join(__dirname, 'public', 'html')));
app.use('/pdf', express.static(path.join(__dirname, 'public', 'pdf')));

app.use('/api/coach', coachRoutes);

/* ------------------------------ Error handling ---------------------------- */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/* --------------------------------- Server -------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
