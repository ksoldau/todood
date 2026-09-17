-- Goal: let todos be organized into fixed time-horizon buckets and ordered within each.
-- Why: support drag-to-reorder across three hardcoded buckets (today / soon / later).

-- Which bucket a todo lives in. Hardcoded set for now; a CHECK keeps bad values out.
-- The DEFAULT exists only so the NOT NULL column can be added to existing rows; it is
-- dropped at the end so every INSERT must state a bucket explicitly (a missing bucket
-- is a bug, not a silent 'today').
ALTER TABLE todos
ADD COLUMN bucket TEXT NOT NULL DEFAULT 'today'
    CHECK (bucket IN ('today', 'soon', 'later'));

-- Ordering within a (user_id, bucket) group. Fractional positions so a single-row
-- update can drop an item between two others: new pos = (prev + next) / 2.
ALTER TABLE todos
ADD COLUMN position DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Backfill existing rows: give each a distinct position within its bucket,
-- preserving current creation order.
WITH ordered AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, bucket
            ORDER BY created_at, id
        ) AS rn
    FROM todos
)
UPDATE todos
SET position = ordered.rn
FROM ordered
WHERE todos.id = ordered.id;

-- Now that existing rows are populated, drop the default so future inserts must be explicit.
ALTER TABLE todos
ALTER COLUMN bucket DROP DEFAULT;

-- Speeds up the common read: a user's todos, ordered within each bucket.
CREATE INDEX todos_user_bucket_position_idx
    ON todos (user_id, bucket, position);
