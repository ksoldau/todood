import { Pool } from 'pg';

import { DATABASE_URL, NODE_ENV } from './config.js';

// A pool opens connections lazily, one per query, so there's nothing to
// connect at startup — and nothing left dangling when a connection drops.
const pool = new Pool({
  connectionString: DATABASE_URL,
  // Local Docker Postgres doesn't speak SSL.
  ssl: NODE_ENV === 'development' ? false : { rejectUnauthorized: false },
});

export { pool };
