const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const https = require("https");
const querystring = require("querystring");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pdfParse = require("pdf-parse");

//api/interview/generate-questions
router.post("/generate-questions", upload.fields([{ name: "resume" }, { name: "jobDescriptionFile" }]), async (req, res) => {
  try {
    // Get job description (from text or file)
    let jobDescription = req.body.jobDescription || "";
    if (req.files && req.files.jobDescriptionFile && req.files.jobDescriptionFile[0]) {
      const jdBuffer = fs.readFileSync(req.files.jobDescriptionFile[0].path);
      if (req.files.jobDescriptionFile[0].mimetype === "application/pdf") {
        jobDescription = (await pdfParse(jdBuffer)).text;
      } else {
        jobDescription = jdBuffer.toString();
      }
    }

    // Get resume text
    let resumeText = "";
    if (req.files && req.files.resume && req.files.resume[0]) {
      const resumeBuffer = fs.readFileSync(req.files.resume[0].path);
      if (req.files.resume[0].mimetype === "application/pdf") {
        resumeText = (await pdfParse(resumeBuffer)).text;
      } else {
        resumeText = resumeBuffer.toString();
      }
    }

    // Compose prompt for AI
    const prompt = `
You are an expert technical interviewer. Given the following candidate resume and job description, generate 15 tailored interview questions that would be likely asked in a real interview for this job.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return ONLY a JSON array of questions, e.g.:
["Question 1...", "Question 2...", ...]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let questions = result.response.text().trim();

    // Clean up code block if present
    if (questions.startsWith("```json")) {
      questions = questions.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (questions.startsWith("```")) {
      questions = questions.replace(/^```/, "").replace(/```$/, "").trim();
    }
    questions = JSON.parse(questions);

    res.json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// Add this to interviewRoutes.js

router.post("/evaluate-answer", async (req, res) => {
  try {
    const { answer, question, jobDescription, resume } = req.body;

    const prompt = `
You are an expert interview coach. Given the following job description, resume, interview question, and candidate's answer, do the following:
1. Give a rating from 1 to 10 based on how well the answer would perform in a real interview.
2. Write a short summary explaining the strengths and weaknesses of the answer.
3. Suggest 2 to 3 specific tips to improve the response.
4. Provide feedback in valid JSON format only. Do not add any explanations or Markdown code blocks.

Job Description:
${jobDescription}

Resume:
${resume || ""}

Question:
${question}

Answer:
${answer}

Respond strictly in the following JSON structure:
{
  "score": <number between 1 and 10>,
  "feedback": "<1–2 sentence summary>",
  "tips": ["<tip1>", "<tip2>", "<tip3>"]
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let feedback = result.response.text().trim();

    // Clean up code block if present
    if (feedback.startsWith("```json")) {
      feedback = feedback.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (feedback.startsWith("```")) {
      feedback = feedback.replace(/^```/, "").replace(/```$/, "").trim();
    }
    res.json(JSON.parse(feedback));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
});

router.post("/evaluate-video-answer", upload.single("video"), async (req, res) => {
  try {
    // 1. Transcribe video to text (use your existing Whisper API logic)
    const videoPath = req.file.path;
    const videoData = fs.readFileSync(videoPath).toString("base64");
    const formData = querystring.stringify({ audio: videoData }); // Whisper expects audio, but you can try with video/webm

    const options = {
      method: "POST",
      hostname: "chatgpt-42.p.rapidapi.com",
      port: null,
      path: "/whisperv3",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      const chunks = [];
      apiRes.on("data", (chunk) => chunks.push(chunk));
      apiRes.on("end", async () => {
        const body = Buffer.concat(chunks).toString();
        try {
          const parsed = JSON.parse(body);
          const transcript = parsed.text;

          // Evaluate answer with Gemini
          const prompt = `
You are an expert interview coach. Given the following job description, interview question, and candidate's answer, do the following:
1. Give a rating from 1 to 10 based on how well the answer would perform in a real interview.
2. Write a short summary explaining the strengths and weaknesses of the answer.
3. Suggest 2 to 3 specific tips to improve the response.
4. Provide feedback in valid JSON format only. Do not add any explanations or Markdown code blocks.

Job Description:
${req.body.jobDescription}

Question:
${req.body.question}

Answer:
${transcript}

Respond strictly in the following JSON structure:
{
  "score": <number between 1 and 10>,
  "feedback": "<1–2 sentence summary>",
  "tips": ["<tip1>", "<tip2>", "<tip3>"]
}
          `;

          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(prompt);
          let feedback = result.response.text().trim();

          // Clean up code block if present
          if (feedback.startsWith("```json")) {
            feedback = feedback.replace(/^```json/, "").replace(/```$/, "").trim();
          } else if (feedback.startsWith("```")) {
            feedback = feedback.replace(/^```/, "").replace(/```$/, "").trim();
          }
          res.json(JSON.parse(feedback));
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to process video" });
        }
      });
    });

    apiReq.on("error", (err) => {
      console.error("RapidAPI Whisper error:", err);
      res.status(500).json({ error: "Speech-to-text API error" });
    });

    apiReq.write(formData);
    apiReq.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to evaluate video answer" });
  }
});
// Upload voice answer and get transcription + evaluation
router.post("/mock-interview", upload.single("audio"), async (req, res) => {
  const audioPath = req.file.path;

  const audioData = fs.readFileSync(audioPath).toString("base64");
  const formData = querystring.stringify({ audio: audioData });

  const options = {
    method: "POST",
    hostname: "chatgpt-42.p.rapidapi.com",
    port: null,
    path: "/whisperv3",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    const chunks = [];
    apiRes.on("data", (chunk) => chunks.push(chunk));
    apiRes.on("end", async () => {
      const body = Buffer.concat(chunks).toString();
      try {
        const parsed = JSON.parse(body);
        const transcript = parsed.text;

        // Evaluate answer with Gemini
        const prompt = `
You are a mock interview assistant. Here is a candidate's answer:
"${transcript}"

1. Rate the quality from 1 to 10.
2. Suggest 2–3 improvements.
3. Mention how well it matches a typical job interview expectation.
Return a JSON response like:
{ "score": 8, "feedback": "Good clarity...", "tips": ["Be more concise", "Include measurable results"] }
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const feedback = result.response.text().trim();
        if (feedback.startsWith("```json")) {
          feedback = feedback
            .replace(/^```json/, "")
            .replace(/```$/, "")
            .trim();
        } else if (feedback.startsWith("```")) {
          feedback = feedback.replace(/^```/, "").replace(/```$/, "").trim();
        }
        res.json({ transcript, evaluation: feedback });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to process audio" });
      }
    });
  });

  apiReq.on("error", (err) => {
    console.error("RapidAPI Whisper error:", err);
    res.status(500).json({ error: "Speech-to-text API error" });
  });

  apiReq.write(formData);
  apiReq.end();
});

module.exports = router;
