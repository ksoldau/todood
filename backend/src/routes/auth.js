import bcrypt from "bcrypt";
import express from "express";

import { pool } from "../db.js";
import { isValidEmail } from "../utils/validation.js";

const PG_UNIQUE_CONSTRAINT_VIOLATION_CODE = "23505";

// Paths here are relative to where this router is mounted in index.js
const router = express.Router();
router.post("/register", register)

async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedEmail = email?.toLowerCase();

  try {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [normalizedEmail, passwordHash],
    );

    respondWithCheckEmail()
  } catch (error) {
    if (error.code === PG_UNIQUE_CONSTRAINT_VIOLATION_CODE) {
      // Don't want to let bad actor know that someone already has this email.
      respondWithCheckEmail()
    } else {
      throw error;
    }
  }
}

function respondWithCheckEmail() {
  res.status(202).json({ message: "Check your email to finish signing up." });
}

export default router;