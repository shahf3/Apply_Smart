const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/geolocation', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: `${lat}+${lon}`,
        key: process.env.OPENCAGE_API_KEY
      }
    });

    const components = response.data.results[0]?.components || {};
    const location = {
      country: components.country || '',
      city: components.city || components.town || components.village || '',
      state: components.state || ''
    };

    res.json(location);
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    res.status(500).json({ message: 'Failed to get location data' });
  }
});

module.exports = router;
