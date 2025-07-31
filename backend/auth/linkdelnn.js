const express = require('express');
const axios = require('axios');
const router = express.Router();

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:5000/auth/linkedin/callback';

// Step 1: Redirect user to LinkedIn for login
router.get('/auth/linkedin/login', (req, res) => {
  const scope = 'r_liteprofile r_emailaddress';
  const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;
  res.redirect(authURL);
});

// Step 2: Handle LinkedIn callback and fetch user profile
router.get('/auth/linkedin/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Authorization code not provided');

  try {
    // Exchange code for access token
    const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenRes.data.access_token;

    // Get profile
    const [profileRes, emailRes] = await Promise.all([
      axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ]);

    const firstName = profileRes.data.localizedFirstName || '';
    const lastName = profileRes.data.localizedLastName || '';
    const bio = `LinkedIn user: ${firstName} ${lastName}`;
    const email = emailRes.data.elements[0]['handle~'].emailAddress;

    const payload = {
      bio,
      skills: '',
      experience: '',
      education: ''
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    return res.redirect(`http://localhost:3000?data=${encoded}`);
  } catch (err) {
    console.error('LinkedIn OAuth error:', err.response?.data || err.message);
    res.status(500).send('OAuth failed');
  }
});

module.exports = router;
