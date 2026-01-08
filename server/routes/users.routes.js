import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get("/:currentUserId", async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id, username, avatar_url FROM users WHERE id != $1",
      [req.params.currentUserId]
    );
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
