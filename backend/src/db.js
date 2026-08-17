import { Client as PGClient } from "pg";

import {
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
} from "./config.js";

// Node caches modules, so every file that imports this gets the same
// client — one connection, not one per route file.
const pgClient = new PGClient({
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  database: "todood",
});

export default pgClient;
