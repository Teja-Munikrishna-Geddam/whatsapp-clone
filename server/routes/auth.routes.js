const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "Username & email required" });
  }

  try {
    // 1️⃣ Check email
    const emailCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      // ✅ EXISTING USER → RETURN & STOP
      return res.json(emailCheck.rows[0]);
    }

    // 2️⃣ Check username
    const usernameCheck = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      // ❌ USERNAME TAKEN → RETURN & STOP
      return res.status(409).json({ error: "Username already taken" });
    }

    // 3️⃣ Create new user
    const newUser = await pool.query(
      "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *",
      [username, email]
    );

    // ✅ NEW USER CREATED
    return res.json(newUser.rows[0]);

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;