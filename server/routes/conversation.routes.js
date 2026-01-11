const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

// Get or create conversation
router.get("/:userOne/:userTwo", async (req, res) => {
    const { userOne, userTwo } = req.params;

    try {
        // 1️⃣ Check existing conversation
        const existing = await pool.query(
            `
      SELECT id FROM conversations
      WHERE (user_one_id = $1 AND user_two_id = $2)
         OR (user_one_id = $2 AND user_two_id = $1)
      `,
            [userOne, userTwo]
        );

        if (existing.rows.length > 0) {
            return res.json(existing.rows[0]);
        }

        // 2️⃣ Create new conversation
        const created = await pool.query(
            `
      INSERT INTO conversations (user_one_id, user_two_id)
      VALUES ($1, $2)
      RETURNING id
      `,
            [userOne, userTwo]
        );

        return res.json(created.rows[0]);

    } catch (err) {
        console.error("Conversation error:", err);
        return res.status(500).json({ error: "Conversation failed" });
    }
});

module.exports = router;
