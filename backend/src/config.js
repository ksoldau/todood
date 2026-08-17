import dotenv from "dotenv";

// Load secrets from .env.local before anything reads process.env.
// This module is imported by db.js and server.js, and ES modules always
// finish evaluating their dependencies first, so this runs before any
// other file in the app touches process.env.
if (process.env.NODE_ENV === "development") {
  console.log("Loading .env config");
  dotenv.config({ path: ".env.local" });
}

// TODO: Could add some helpful errors if missing any process.envs here

// Set in the package.json scripts
export const NODE_ENV = process.env.NODE_ENV;
export const SERVER_PORT = process.env.PORT;
export const POSTGRES_HOST = process.env.POSTGRES_HOST;
export const POSTGRES_PORT = process.env.POSTGRES_PORT;

// Set in .env.local
export const POSTGRES_USER = process.env.POSTGRES_USER;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
