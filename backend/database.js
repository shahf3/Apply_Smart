// File: backend/database.js
// This code sets up a connection pool to a PostgreSQL database using the 'pg' library.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
