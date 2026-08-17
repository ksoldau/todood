# Step 5: Authentication

## Learning Goals

- Understand why passwords are hashed, not encrypted or stored plainly
- Learn what bcrypt does and why it is deliberately slow
- Understand how a server proves who a caller is on later requests
- Learn what a JWT contains and what its signature does and does not protect
- Understand Express middleware and the `next()` handoff

## Learning Questions

- Why hash a password instead of encrypting it?
- What is a salt, and why does bcrypt generate one per password?
- Why does a slow hash function make the system safer?
- What is the difference between authentication and authorization?
- Where should a token live on the client, and what are the tradeoffs?
- Why do most APIs return 404 rather than 403 for another user's resource?

## Part A: Registration

### 1. Install bcrypt

Install `bcrypt` as a dependency.

Understand what it does: takes a plaintext password and returns a hash that
cannot be reversed. Verifying a password means hashing the attempt and
comparing hashes — never decrypting the stored value.

### 2. Create POST /register endpoint

Accept an email and password, hash the password, insert the user.

```
POST /register
Body: { email: "...", password: "..." }
Response: { id, email, created_at }
```

Requirements:

- Reject a request missing email or password with 400
- Hash the password with bcrypt before it touches the database
- Never return `password_hash` in the response
- Handle a duplicate email — the `users.email` column is `UNIQUE`, so a second
  registration with the same address raises a Postgres error. Return 409
  Conflict rather than letting it surface as a 500.

### 3. Test registration

Register a user with curl. Then verify in psql that the stored
`password_hash` is a bcrypt hash, not the password you sent.

Try registering the same email twice and confirm you get a 409.

## Part B: Login and Tokens

### 4. Install jsonwebtoken

Install `jsonwebtoken`. Add a `JWT_SECRET` to `.env.local` — this is the key
the server signs tokens with, and it is a secret in the same category as the
database password.

### 5. Create POST /login endpoint

Look up the user by email, compare the submitted password against the stored
hash with `bcrypt.compare`, and issue a signed JWT on success.

```
POST /login
Body: { email: "...", password: "..." }
Response: { token: "..." }
```

Return the same generic 401 for both a wrong password and an unknown email, so
the response cannot be used to discover which addresses are registered.

### 6. Write auth middleware

A function that runs before protected routes. It reads the `Authorization:
Bearer <token>` header, verifies the signature, and attaches the user id to
`req.user`. If the token is missing or invalid, it responds 401 and never calls
`next()`.

Understand `next()`: it is how one middleware hands control to the next
handler in the chain. Not calling it stops the request.

### 7. Protect the todo endpoints

Apply the middleware to every `/todos` route, then remove client-supplied
identity everywhere:

- `GET /todos` — drop the `user-id` query param, select on `req.user.id`
- `POST /todos` — drop `user_id` from the body, insert `req.user.id`
- `PATCH /todos/:id` and `DELETE /todos/:id` — add `AND user_id = $n` to the
  WHERE clause, so a todo belonging to someone else simply matches nothing and
  falls through to the existing 404

### 8. Test the whole flow

- Register, then log in, and keep the token
- Call `GET /todos` with no token — expect 401
- Call it with the token — expect only that user's todos
- Register a second user, create a todo as each, and confirm neither can read,
  patch, or delete the other's

## Output

Users can register and log in. Every todo endpoint requires a valid token and
operates only on the caller's own todos. No endpoint accepts a user id from the
client.

## Next: Frontend

With a working authenticated API, start the React Native app — login screen,
todo list, and token storage.
