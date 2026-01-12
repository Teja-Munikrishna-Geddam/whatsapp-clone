router.get("/:userOne/:userTwo", async (req, res) => {
  const u1 = Number(req.params.userOne);
  const u2 = Number(req.params.userTwo);

  const a = Math.min(u1, u2);
  const b = Math.max(u1, u2);

  try {
    const existing = await pool.query(
      "SELECT id FROM conversations WHERE user_one_id=$1 AND user_two_id=$2",
      [a, b]
    );

    if (existing.rows.length) {
      return res.json(existing.rows[0]);
    }

    const created = await pool.query(
      "INSERT INTO conversations (user_one_id, user_two_id) VALUES ($1,$2) RETURNING id",
      [a, b]
    );

    res.json(created.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Conversation error" });
  }
});
