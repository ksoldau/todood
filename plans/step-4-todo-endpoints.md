# Step 4: Todo API Endpoints

## Learning Goals

- Understand REST API patterns (GET, POST, PUT, DELETE)
- Learn how to query database from Express
- Understand request/response handling
- Learn CRUD operations (Create, Read, Update, Delete)

## Tasks

### 1. Add test user to database

Connect to Postgres and insert a test user manually:

```sql
INSERT INTO users (email, password_hash) VALUES ('test@example.com', 'fake_hash_123');
```

Note the `id` returned. Use this user_id in subsequent requests.

### 2. Create GET /todos endpoint

Create route that returns all todos for a hardcoded user_id (from step 1).

```
GET /todos
Response: [{ id, user_id, title, notes, completed_at, ... }, ...]
```

Query the database and return the todos as JSON.

### 3. Create POST /todos endpoint

Accept JSON body with title and notes, insert into database.

```
POST /todos
Body: { title: "...", notes: "..." }
Response: { id, user_id, title, notes, completed_at, created_at, updated_at }
```

### 4. Create PUT /todos/:id endpoint

Update a todo (mark as completed or edit title/notes).

```
PUT /todos/1
Body: { title: "...", notes: "...", completed_at: "2026-08-14T..." }
Response: updated todo object
```

### 5. Create DELETE /todos/:id endpoint

Delete a todo by id.

```
DELETE /todos/1
Response: { success: true }
```

### 6. Test all endpoints

Use curl or Postman to test each endpoint. Verify data is persisted in database.

## Output

All CRUD endpoints working. Can create, read, update, delete todos via API. Data is stored in database correctly.

## Next: Authentication

After this works, add auth middleware to lock todos to the logged-in user instead of hardcoding user_id.
