# Step 3: Express Backend Setup

## Learning Goals
- Understand how to initialize a Node.js project
- Learn the purpose of package.json and dependencies
- Understand how Express serves HTTP requests
- Learn project folder structure for a backend

## Tasks

### 1. Initialize Node.js project
Create `backend/package.json` with npm init.

### 2. Install Express
Install Express and related packages: `express`, `dotenv` (for environment variables).

Understand what npm install does: downloads packages from npm registry, creates `node_modules/`, updates `package-lock.json`.

### 3. Create basic server
Create `backend/src/index.js` with a minimal Express app:
- Import Express
- Create an app instance
- Define a health check route (GET /)
- Listen on port 3000

### 4. Create start scripts
Add npm scripts to package.json:
- `npm start` — run production server
- `npm run dev` — run development server with auto-reload (using nodemon)

Install nodemon as a dev dependency.

### 5. Test the server
Run `npm run dev` and verify:
- Server starts on port 3000
- Can curl or browser to http://localhost:3000 and get a response
- Nodemon restarts when you change files

## Output
Express server running on port 3000, responding to HTTP requests. Development setup with hot-reload ready for building routes.
