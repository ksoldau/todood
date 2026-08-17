import express from "express";

import pgClient from "../db.js";

// Paths here are relative to where this router is mounted in server.js
const router = express.Router();

// Get all of a user's todo items
router.get("/", async (req, res) => {
  const userId = req.query["user-id"];
  const result = await pgClient.query(
    "SELECT * FROM todos WHERE user_id = $1",
    [userId],
  );
  res.json(result.rows);
});

// Create a todo
router.post("/", async (req, res) => {
  // TODO: get user from who's logged in.
  const { user_id, title, notes } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title must be defined." });
  }

  const result = await pgClient.query(
    "INSERT INTO todos (user_id, title, notes) VALUES ($1, $2, $3) RETURNING *",
    [user_id, title, notes],
  );

  // 201 = created
  res.status(201).json(result.rows[0]);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, notes, completed_at } = req.body;
  const result = await pgClient.query(
    `UPDATE todos
    SET title = COALESCE($1, title),
        notes = COALESCE($2, notes),
        completed_at = COALESCE($3, completed_at),
        updated_at = NOW()
    WHERE id = $4
    RETURNING *`,
    [title, notes, completed_at, id],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Todo not found" });
  }

  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pgClient.query(
    "DELETE FROM todos WHERE id = $1 RETURNING *",
    [id],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Todo not found" });
  }

  res.json({ success: true });
});

export default router;
