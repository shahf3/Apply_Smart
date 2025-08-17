// backend/database.js
const { Pool } = require('pg');
const cs = process.env.DATABASE_URL;

const needsSSL =
  !!cs && (
    cs.includes('amazonaws.com') ||
    cs.includes('supabase.co') ||
    cs.includes('neon.tech') ||
    /\bsslmode=require\b/i.test(cs)
  );

const pool = new Pool({
  connectionString: cs,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
