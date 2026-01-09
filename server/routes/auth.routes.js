const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "Username & email required" });
  }

  try {
    const emailCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.json(emailCheck.rows[0]);
    }

    const usernameCheck = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const newUser = await pool.query(
      "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *",
      [username, email]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
