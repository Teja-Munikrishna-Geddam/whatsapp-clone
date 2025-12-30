const { Pool } = require('pg');

const pool = new Pool({
  // This line is the key: it uses the Render URL if available, 
  // or falls back to your local DB for development.
  connectionString: process.env.DATABASE_URL,
  
  // RENDER REQUIREMENT: SSL must be enabled for hosted databases
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✅ Connected to the PostgreSQL database successfully');
});

module.exports = pool;