const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false } // Render / production
    : false                          // Local PostgreSQL
});

pool.query("SELECT NOW()")
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.error("❌ DB error:", err.message));

module.exports = pool;
