const pool = require("./pool");

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_one_id INTEGER REFERENCES users(id),
        user_two_id INTEGER REFERENCES users(id)
      );
    `);

    // ✅ UNIQUE INDEX FOR PAIR (ORDER-INDEPENDENT)
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_conversation_pair
      ON conversations (
        LEAST(user_one_id, user_two_id),
        GREATEST(user_one_id, user_two_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id),
        sender_id INTEGER REFERENCES users(id),
        message_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ DB init error:", err.message);
  }
}

module.exports = initDB;
