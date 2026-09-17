import express from 'express';

import { pool } from '../db.js';

// Paths here are relative to where this router is mounted in index.js
const router = express.Router();

const BUCKETS = ['today', 'soon', 'later'];

// Get all of a user's todo items, ordered within each bucket.
router.get('/', async (req, res) => {
  const { userId } = req.auth;
  const result = await pool.query(
    `SELECT * FROM todos
     WHERE user_id = $1
     ORDER BY
       ARRAY_POSITION(ARRAY['today', 'soon', 'later']::text[], bucket),
       position`,
    [userId]
  );
  res.json(result.rows);
});

// Create a todo. Caller must state the bucket; the item goes to the end of it.
router.post('/', async (req, res) => {
  const { title, notes, bucket } = req.body;
  const { userId } = req.auth;

  if (!title) {
    return res.status(400).json({ error: 'Title must be defined.' });
  }

  if (!BUCKETS.includes(bucket)) {
    return res
      .status(400)
      .json({ error: 'Bucket must be today, soon, or later.' });
  }

  const result = await pool.query(
    `INSERT INTO todos (user_id, title, notes, bucket, position)
     VALUES (
       $1, $2, $3, $4,
       COALESCE(
         (SELECT MAX(position) + 1 FROM todos WHERE user_id = $1 AND bucket = $4),
         0
       )
     )
     RETURNING *`,
    [userId, title, notes, bucket]
  );

  // 201 = created
  res.status(201).json(result.rows[0]);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, notes, completed_at, bucket, position } = req.body;
  const { userId } = req.auth;

  if (bucket !== undefined && !BUCKETS.includes(bucket)) {
    return res.status(400).json({ error: 'Invalid bucket.' });
  }

  const result = await pool.query(
    `UPDATE todos
    SET title = COALESCE($1, title),
        notes = COALESCE($2, notes),
        completed_at = COALESCE($3, completed_at),
        bucket = COALESCE($4, bucket),
        position = COALESCE($5, position),
        updated_at = NOW()
    WHERE id = $6
    AND user_id = $7
    RETURNING *`,
    [title, notes, completed_at, bucket, position, id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.auth;

  const result = await pool.query(
    'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json({ success: true });
});

export default router;
