const express = require('express');
const axios = require('axios');
const router = express.Router();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

router.get('/login', (req, res) => {
  const redirect_uri = 'http://localhost:5000/auth/github/callback';
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&scope=user:email`);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const emailRes = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const email = emailRes.data.find((e) => e.primary && e.verified)?.email;

    const userData = {
      bio: userRes.data.bio || '',
      skills: '',
      experience: `GitHub public repos: ${userRes.data.public_repos}`,
      education: '',
      email: email || '',
      name: userRes.data.name || '',
    };

    const base64Data = Buffer.from(JSON.stringify(userData)).toString('base64');
    const cleanData = base64Data.split('#')[0]; // Prevent hash fragment

    res.redirect(`http://localhost:3000/import?data=${cleanData}`);
  } catch (err) {
    console.error('GitHub Auth Error:', err.message);
    res.status(500).send('Authentication failed.');
  }
});

module.exports = router;
