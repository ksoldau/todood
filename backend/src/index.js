import express from "express";

import { NODE_ENV, SERVER_PORT } from "./config.js";
import { pool } from "./db.js";
import authRouter from "./routes/auth.js";
import todosRouter from "./routes/todos.js";

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "You made a get request." });
});

// ROUTERS
// The prefix lives here, so the route files only
// know their own paths ("/", "/:id").
app.use("/todos", todosRouter);
app.use("/", authRouter);

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

if (NODE_ENV === "development") {
  app.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
  })
}

export default app;
