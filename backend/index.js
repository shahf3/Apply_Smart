const axios = require('axios');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./database');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 
require('dotenv').config();
const fs = require('fs');
const pdfParse = require('pdf-parse');
const jobRoutes = require('./routes/jobRoutes');
const OpenAI = require("openai");

const openapi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getATSScore(resumeText, jobDescription) {
  const prompt = `
You are an ATS resume scoring system.
Compare this resume and job description, and give a score out of 100 based on keyword match, relevant experience, and skills.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return only the numeric score and one sentence summary.
`;

  try {
    const response = await openapi.chat.completions.create({
      model: "gpt-3.5-turbo", // Use this for your current API key
      messages: [{ role: "user", content: prompt }],
    });

    // ✅ Correct usage with OpenAI SDK – no `.data`
    const output = response.choices[0].message.content;

    const scoreMatch = output.match(/\d{1,3}/);
    return {
      raw: output,
      score: scoreMatch ? parseInt(scoreMatch[0]) : 0,
    };
  } catch (error) {
    console.error("Error in getATSScore:", error);
    throw error;
  }
}


const app = express();
app.use(cors());
app.use(express.json());

// Register
app.post('/register', async (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;

  try {
    const userExists = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
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

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

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

    res.json({ token, user_id: user.id }); // also send user_id so frontend can store it
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

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
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Create or update profile
app.post('/profile', async (req, res) => {
  const { user_id, bio, experience, skills, education } = req.body;
  try {
    const existingProfile = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user_id]);

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
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/test', (req, res) => res.send('Backend is working'));

// file upload endpoint

app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  console.log('Received upload request');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);

  const { user_id } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  try {
    await pool.query(
      'INSERT INTO resumes (user_id, filename, path) VALUES ($1, $2, $3)',
      [user_id, fileName, filePath]
    );
    res.status(200).json({ message: 'Resume uploaded successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Upload failed');
  }
});


app.get('/resumes/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(
      'SELECT id, filename FROM resumes WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching resumes');
  }
});

app.post('/score-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).send('No file uploaded');
    }
    if (!req.body.jobDescription) {
      console.error("No jobDescription provided");
      return res.status(400).send('No job description provided');
    }

    console.log('Uploaded file:', req.file);
    console.log('Job description:', req.body.jobDescription);

    const fileBuffer = fs.readFileSync(req.file.path);
    const parsed = await pdfParse(fileBuffer);

    console.log('Parsed PDF text length:', parsed.text.length);

    const score = await getATSScore(parsed.text, req.body.jobDescription);

    console.log('Score response:', score);

    res.json({ score });
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).send('Rate limit exceeded, please try again later.');
    }
    console.error("Error in /score-resume:", err);
    res.status(500).send('Failed to parse PDF or calculate score');
  }
});

// Endpoint to fetch LinkedIn jobs via RapidAPI
app.use('/api/', jobRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
