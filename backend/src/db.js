import { Pool, types } from 'pg';

import { DATABASE_URL, NODE_ENV } from './config.js';

// 1082 is Postgres's OID for DATE. Keep the raw
// 'YYYY-MM-DD' string — a due date is a day, not a timestamp.
types.setTypeParser(1082, (val) => val);

// A pool opens connections lazily, one per query, so there's nothing to
// connect at startup — and nothing left dangling when a connection drops.
const pool = new Pool({
  connectionString: DATABASE_URL,
  // Local Docker Postgres doesn't speak SSL.
  ssl: NODE_ENV === 'development' ? false : { rejectUnauthorized: false },
});

export { pool };
