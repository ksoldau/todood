import express from 'express';

import { pool } from '../db.js';

// Paths here are relative to where this router is mounted in index.js
const router = express.Router();

const BUCKETS = ['today', 'soon', 'later'];
const PATCHABLE = ['title', 'notes', 'completed_at', 'bucket', 'position'];

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

  // A missing key (undefined) means "leave it alone"; null means "clear it".
  const fields = PATCHABLE.filter((field) => req.body[field] !== undefined);

  // Validations
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update.' });
  }
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'Title must be a non-empty string.' });
  }
  if (bucket !== undefined && !BUCKETS.includes(bucket)) {
    return res.status(400).json({ error: 'Invalid bucket.' });
  }
  if (position !== undefined && !Number.isFinite(position)) {
    return res.status(400).json({ error: 'Position must be a number.' });
  }
  if (
    completed_at !== undefined &&
    completed_at !== null &&
    (typeof completed_at !== 'string' || Number.isNaN(Date.parse(completed_at)))
  ) {
    return res
      .status(400)
      .json({ error: 'completed_at must be a date or null' });
  }

  const changes = fields.map((field, i) => {
    return { assignment: `${field} = $${i + 1}`, value: req.body[field] };
  });

  const assignments = changes.map((change) => change.assignment);
  const values = changes.map((change) => change.value);

  const result = await pool.query(
    `UPDATE todos
    SET ${assignments.join(', ')}, updated_at = NOW()
    WHERE id = $${values.length + 1}
    AND user_id = $${values.length + 2}
    RETURNING *`,
    [...values, id, userId]
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
