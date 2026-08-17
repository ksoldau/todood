import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import { Client as PGClient } from "pg";

// Set these env variables in package.json commands
const SERVER_PORT = process.env.PORT;
const POSTGRES_HOST = process.env.POSTGRES_HOST;
const POSTGRES_PORT = process.env.POSTGRES_PORT;
const NODE_ENV = process.env.NODE_ENV;

// TODO: Could add some helpful errors if missing any process.envs here

if (NODE_ENV === "development") {
  console.log("Loading .env config");
  dotenv.config({ path: ".env.local" });
}

// These env variables are from the .env file specified in package.json
const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;

const app = express();
app.use(express.json());

const pgClient = new PGClient({
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  database: "todood",
});

// GET
app.get("/", (req, res) => {
  res.json({ message: "You made a get request." });
});

// Get all of a user's todo items
app.get("/todos", async (req, res) => {
  const userId = req.query["user-id"];
  const result = await pgClient.query(
    "SELECT * FROM todos WHERE user_id = $1",
    [userId],
  );
  res.json(result.rows);
});

// Create a todo
app.post("/todos", async (req, res) => {
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

app.patch("/todos/:id", async (req, res) => {
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

app.delete("/todos/:id", async (req, res) => {
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

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pgClient.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, passwordHash],
    );
  } catch (error) {
    const pgUniqueConstraintViolationCode = "23505";
    if (error.code === pgUniqueConstraintViolationCode) {
      return res.status(409).json({ error: "Email is already registered." });
    }
    throw error;
  }

  res.status(201).json(result.rows[0]);
});

(async () => {
  try {
    await pgClient.connect();
    console.log("Connected to DB");
    // RUN SERVER
    app.listen(SERVER_PORT, () => {
      console.log(`Server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
})();
