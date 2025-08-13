// frontend/src/axios-boot.js
import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
const DEV_API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Send cookies if you ever use them
axios.defaults.withCredentials = true;
// In dev, talk to your local backend. In prod, we'll use relative URLs.
axios.defaults.baseURL = isProd ? '' : DEV_API;

/**
 * Interceptor rules:
 * - In prod: rewrite any hardcoded "http://localhost:5000/..." to relative "/..."
 * - In both dev & prod: if you call a path like "score-resume" (no leading /api),
 *   we automatically prefix "/api" so you don’t have to change every call.
 * - We never touch absolute https:// URLs (3rd party APIs).
 */
axios.interceptors.request.use((config) => {
  const url = String(config.url || '');

  // Never touch absolute URLs to other services
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Special case: if dev URL was hardcoded, strip it in prod
    if (isProd && url.startsWith('http://localhost:5000/')) {
      config.url = url.replace('http://localhost:5000', '');
    }
    return config;
  }

  // Make sure it starts with a slash
  let next = url.startsWith('/') ? url : `/${url}`;

  // If it doesn't start with /api, prefix it so your backend routes match
  if (!next.startsWith('/api/')) next = `/api${next}`;

  config.url = next;
  return config;
});
