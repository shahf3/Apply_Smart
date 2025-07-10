const axios = require("axios");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./database");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
require("dotenv").config();
const fs = require("fs");
const pdfParse = require("pdf-parse");
const jobRoutes = require("./routes/jobRoutes");
const geolocationRoutes = require("./routes/geolocationRoutes");
/*const OpenAI = require("openai");
const openapi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});*/

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getATSScore(resumeText, jobDescription) {
  const prompt = `You are an ATS resume scoring system.

Compare the resume below against the job description. Do the following:

1. Give a match score out of 100.
2. Give a one-sentence summary of the match quality.
3. List the top 5 missing or weak keywords the resume should include.
4. List 5 strong action verbs the resume should use.
5. Suggest 2–3 specific improvements to increase compatibility.
6. resume_sentences: Suggest 3 to 5 strong, relevant, and tailored sentences that the candidate can add to their resume. These should:
   - Match the job description
   - Use action verbs
   - Integrate the missing keywords naturally

Resume:
${resumeText}

Job Description:
${jobDescription}

Return your response in this JSON format:

{
  "score": <number>,
  "summary": "<text>",
  "missing_keywords": ["...", "..."],
  "action_words": ["...", "..."],
  "improvements": ["...", "..."],
  "resume_sentences": ["...", "..."]
}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let output = result.response.text();

    output = output.trim();
    if (output.startsWith("```json")) {
      output = output
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();
    } else if (output.startsWith("```")) {
      output = output.replace(/^```/, "").replace(/```$/, "").trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch (err) {
      console.error("Gemini output could not be parsed as JSON:", output);
      throw new Error("Invalid AI format. Please try again.");
    }

    return parsed;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Register
app.post("/register", async (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, firstname, lastname, email, password) 
       VALUES ($1, $2, $3, $4, $5)`,
      [username, firstname, lastname, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token, user_id: user.id }); // also send user_id so frontend can store it
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get profile by user_id
app.get("/profile/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(
      "SELECT * FROM profiles WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Create or update profile
app.post("/profile", async (req, res) => {
  const { user_id, bio, experience, skills, education } = req.body;
  try {
    const existingProfile = await pool.query(
      "SELECT * FROM profiles WHERE user_id = $1",
      [user_id]
    );

    if (existingProfile.rows.length > 0) {
      await pool.query(
        "UPDATE profiles SET bio = $1, experience = $2, skills = $3, education = $4 WHERE user_id = $5",
        [bio, experience, skills, education, user_id]
      );
      return res.json({ message: "Profile updated" });
    } else {
      await pool.query(
        "INSERT INTO profiles (user_id, bio, experience, skills, education) VALUES ($1, $2, $3, $4, $5)",
        [user_id, bio, experience, skills, education]
      );
      return res.status(201).json({ message: "Profile created" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

//app.get("/test", (req, res) => res.send("Backend is working"));

// Upload resume and extract text
app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  const { user_id } = req.body;
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(fileBuffer);

    await pool.query(
      "INSERT INTO resumes (user_id, filename, path, text_content) VALUES ($1, $2, $3, $4)",
      [user_id, fileName, filePath, parsed.text]
    );
    res.status(200).json({ message: "Resume uploaded and extracted" });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).send("Upload failed");
  }
});

app.get("/resumes/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(
      "SELECT id, filename, path FROM resumes WHERE user_id = $1 ORDER BY uploaded_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching resumes");
  }
});

// Update resume text content
app.put("/resumes/:resumeId", async (req, res) => {
  const { resumeId } = req.params;
  const { updatedText, userId } = req.body;

  try {
    const result = await pool.query(
      "UPDATE resumes SET text_content = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [updatedText, resumeId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Resume not found or not authorized");
    }
    res.json({ message: "Resume updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating resume");
  }
});

// Fetch resume details including path
app.get("/resume-details/:resumeId", async (req, res) => {
  const { resumeId } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, filename, path, uploaded_at FROM resumes WHERE id = $1",
      [resumeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Resume not found" });
    }

    console.log("Resume details from DB:", result.rows[0]); // DEBUG
    
    // Check if file exists
    const fs = require('fs');
    const path = require('path');
    const filePath = result.rows[0].path;
    
    if (fs.existsSync(filePath)) {
      console.log("File exists at path:", filePath); // DEBUG
    } else {
      console.log("File NOT found at path:", filePath); // DEBUG
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching resume details:", err);
    res.status(500).send("Error fetching resume details");
  }
});

app.get('/test-static/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  console.log("Testing static file:", filePath);
  console.log("File exists:", fs.existsSync(filePath));
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});
// Fetch text content of a specific resume
app.get("/resume-content/:resumeId", async (req, res) => {
  const { resumeId } = req.params;

  try {
    const result = await pool.query(
      "SELECT text_content FROM resumes WHERE id = $1",
      [resumeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching resume content:", err);
    res.status(500).send("Error fetching resume content");
  }
});

app.post("/score-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).send("No file uploaded");
    }
    if (!req.body.jobDescription) {
      console.error("No jobDescription provided");
      return res.status(400).send("No job description provided");
    }

    console.log("Uploaded file:", req.file);
    console.log("Job description:", req.body.jobDescription);

    const fileBuffer = fs.readFileSync(req.file.path);
    const parsed = await pdfParse(fileBuffer);
    
    console.log("Parsed PDF text length:", parsed.text.length);

    const score = await getATSScore(parsed.text, req.body.jobDescription);

    console.log("Score response:", score);

    res.json({ score });
  } catch (err) {
    if (err.status === 429) {
      return res
        .status(429)
        .send("Rate limit exceeded, please try again later.");
    }
    console.error("Error in /score-resume:", err);
    res.status(500).send("Failed to parse PDF or calculate score");
  }
});

// Endpoint to fetch LinkedIn jobs via RapidAPI
app.use("/api/jobs", jobRoutes);
app.use("/api", geolocationRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
