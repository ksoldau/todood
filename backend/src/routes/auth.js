import bcrypt from "bcrypt";
import express from "express";

import pgClient from "../db.js";

// Paths here are relative to where this router is mounted in server.js
const router = express.Router();

router.post("/register", async (req, res) => {
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

    // 201 = created
    res.status(201).json(result.rows[0]);
  } catch (error) {
    const pgUniqueConstraintViolationCode = "23505";
    if (error.code === pgUniqueConstraintViolationCode) {
      return res.status(409).json({ error: "Email is already registered." });
    }
    throw error;
  }
});

export default router;
