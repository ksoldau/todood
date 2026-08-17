import express from "express";

import { SERVER_PORT } from "./config.js";
import pgClient from "./db.js";
import authRouter from "./routes/auth.js";
import todosRouter from "./routes/todos.js";

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "You made a get request." });
});

// Mount the routers. The prefix lives here, so the route files only
// know their own paths ("/", "/:id").
app.use("/todos", todosRouter);
app.use("/", authRouter);

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
