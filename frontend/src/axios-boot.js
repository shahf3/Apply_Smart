// frontend/src/axios-boot.js
import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
const DEV_API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

axios.defaults.withCredentials = true;
// In dev: talk to local backend. In prod: use relative URLs (proxied by vercel.json)
axios.defaults.baseURL = isProd ? '' : DEV_API;

axios.interceptors.request.use((config) => {
  let url = String(config.url || '');

  // If it's an absolute URL…
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // …but the old local URL was hardcoded, strip it and treat as relative
    if (isProd && url.startsWith('http://localhost:5000')) {
      url = url.replace('http://localhost:5000', '');
      // fall through so we can add "/api"
    } else {
      // leave true external URLs (3rd-party) alone
      return config;
    }
  }

  // Now it's relative: normalize and ensure "/api" prefix
  if (!url.startsWith('/')) url = '/' + url;
  if (!url.startsWith('/api/')) url = '/api' + url;

  config.url = url;
  return config;
});
