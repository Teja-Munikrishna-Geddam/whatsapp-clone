const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

/**
 * Get messages for ONE conversation only
 */
router.get("/:conversationId", async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await pool.query(
      `
      SELECT id, sender_id, message_text, created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      `,
      [conversationId]
    );

    res.json(messages.rows);
  } catch (err) {
    console.error("Message fetch error:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

module.exports = router;
