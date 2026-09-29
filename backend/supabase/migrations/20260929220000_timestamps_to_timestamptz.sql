-- Store an absolute instant instead of a bare wall-clock time, so timestamps
-- round-trip correctly regardless of the server's timezone. The old
-- `timestamp without time zone` columns read back through the process's local
-- zone, shifting every value by that offset.
--
-- USING ... AT TIME ZONE 'UTC' declares the existing bare values as UTC. That
-- is right for rows written by the DB default (session TZ is UTC); any dev
-- rows written by the app in another zone are throwaway.

ALTER TABLE users
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE todos
  ALTER COLUMN completed_at TYPE timestamptz USING completed_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at   TYPE timestamptz USING created_at   AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at   TYPE timestamptz USING updated_at   AT TIME ZONE 'UTC';
