# Step 1: Docker + Postgres Setup

## Learning Questions
- Why Docker instead of installing Postgres directly on the machine?
- What does docker-compose do, and why use it instead of raw Docker commands?
- What Postgres configuration options matter (password, database name, ports, volumes) and why?
- How to verify Postgres is actually running and ready to accept connections?

**Answers: [Step 1 Learnings](../learnings/step-1.md)**

## Tasks

### 1. Create docker-compose.yml
Create `backend/docker-compose.yml` defining a Postgres service. Include:
- Postgres 17 image
- Environment variables for password and default database name
- Port mapping (Postgres default port is 5432)
- A named volume for data persistence

Understand each line — what does it do and why is it there?

### 2. Create .env.local
Create `backend/.env.local` with database connection details (password, host, port, database name). This stores secrets only for local development — should NOT be committed to git.

Add `.env.local` to `.gitignore`.

### 3. Start the container
Run `docker-compose up` in `backend/`. Watch the output carefully. The log messages indicate when Postgres is ready to accept connections.

### 4. Verify the connection
Connect to the running Postgres using `psql` CLI or a GUI tool. Verify:
- Connection to the database works with specified credentials
- The `todood` database exists
- Basic SQL queries execute

## Output
Postgres running on `localhost:5432`, `todood` database exists and is accessible.
