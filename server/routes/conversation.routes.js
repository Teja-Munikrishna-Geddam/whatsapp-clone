const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

/**
 * Get or create a private conversation between two users
 * Conversation is UNIQUE per user pair (order-independent)
 */
router.get("/:userOne/:userTwo", async (req, res) => {
  const u1 = Number(req.params.userOne);
  const u2 = Number(req.params.userTwo);

  if (!u1 || !u2) {
    return res.status(400).json({ error: "Invalid user IDs" });
  }

  // normalize order (VERY IMPORTANT)
  const a = Math.min(u1, u2);
  const b = Math.max(u1, u2);

  try {
    // 1️⃣ Check if conversation already exists
    const existing = await pool.query(
      "SELECT id FROM conversations WHERE user_one_id = $1 AND user_two_id = $2",
      [a, b]
    );

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }

    // 2️⃣ Create new conversation
    const created = await pool.query(
      "INSERT INTO conversations (user_one_id, user_two_id) VALUES ($1, $2) RETURNING id",
      [a, b]
    );

    return res.json(created.rows[0]);

  } catch (err) {
    console.error("Conversation route error:", err);
    return res.status(500).json({ error: "Conversation failed" });
  }
});

module.exports = router;
