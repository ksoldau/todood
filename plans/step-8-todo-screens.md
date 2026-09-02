# Step 8: Todo Screens and the Full Flow

## Learning Goals

- Understand why the client never sends a user id, even when it knows one
- Learn to model a boolean-looking state stored as a nullable timestamp
- Understand what logging out means when the server holds no session

## Learning Questions

- The client knows the user id — it is in the token. Why must it still not send
  it with a request?
- `completed_at` is a timestamp, not a boolean. What does that buy, and what
  does it cost the UI?
- Logging out tells the server nothing at all. Why is that safe here, and when
  would it stop being safe?

## Tasks

### 1. Todo list screen

Fetch and render the caller's todos through the API client from step 7.

No user id anywhere in the client. The server takes it from the token — if a
screen seems to need one, something is wrong. This is the whole payoff of the
work in step 5: the client proves who it is and the server decides what that
means.

### 2. Create a todo

Title required, notes optional — matching the 400 the API already returns for a
missing title. Validate in the UI too, but treat the server as the authority.

### 3. Toggle completion

Set or clear `completed_at`. The database stores a nullable timestamp rather
than a boolean, so the UI reads "completed" as "`completed_at` is not null" and
writing means sending a timestamp or a null, not `true` / `false`.

### 4. Log out

Clear the token, return to login. That is the whole feature — there is nothing
to tell the server, since the token is stateless and dies on its own
(DECISIONS #10).

### 5. Test the full flow on both targets

- Two accounts, each with todos, confirm neither sees the other's
- Hand-expire a token in storage and confirm the app returns to login rather
  than showing an error screen
- Create, complete, and un-complete a todo; reload and confirm it persisted
- Run all of it on web as well as iOS

The two-account case is the one worth the effort. Everything else mostly proves
the happy path works; that one proves the server is enforcing ownership and the
client is not quietly relying on itself to filter.

## Output

A working app on iOS and web: register, log in, stay logged in, and manage your
own todos. No user id ever leaves the client. REQUIREMENTS' functional list is
satisfied end to end.

## Next: Whatever REQUIREMENTS still lists

Future features are already enumerated there — categories, due dates,
recurring, ordering, filtering, edit and delete. Pick by what teaches something
new rather than by the order in the list.

Also open by this point, and worth deciding before building more: whether the
Express API survives a move to Supabase Auth at all, or whether the client
talks to Postgres directly with RLS doing enforcement. That reshapes everything
here, so it is worth settling before adding features on top.
