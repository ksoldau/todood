# Step 2: Database Schema & Migrations

## Learning Goals
- Learn how migrations work (version-controlled database changes)
- Understand relationships between tables (foreign keys)
- Learn how to create and manage schema changes safely

## Tasks

### 1. Create migrations directory
Create `backend/db/migrations/` folder.

Create first migration file: `001-create-users-table.sql`. Reference `backend/db/SCHEMA.md` for column definitions (types, NOT NULL constraints, defaults).

### 2. Create second migration
Create `002-create-todos-table.sql`. Reference `backend/db/SCHEMA.md` for column definitions and the foreign key constraint.

### 3. Run migrations manually
Connect to Postgres using `psql` and run the SQL from both migration files to create the tables.

Verify tables exist:
- `\dt` in psql shows all tables
- `\d users` and `\d todos` show table structure

## Output
Database schema created in Postgres. Users and todos tables exist with proper columns, types, and relationships. Ready for backend to query.
