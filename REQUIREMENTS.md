# Functional Requirements

## Authentication

- Users can register with email and password
- Users can log in with email and password
- Users remain logged in (session/token persists)
- Users can log out

## Todos

- Users can only see their own todos
- Users can create a todo with:
  - Required: title
  - Optional: notes, due date
- Users can edit a todo's title and notes in place
- Users can delete a todo
- Users can mark a todo as completed or not completed
- Users can view their list of todos

### Buckets (time horizons)

- Every todo lives in one of three buckets: **Today**, **Soon**, **Later**.
- The bucket is chosen by the user and changed by dragging the todo between
  buckets (custom order within a bucket is preserved).
- Buckets are **not** affected by due dates for now — a due date only changes
  how the todo is flagged, never where it sits. (Auto-placing todos by due date
  is a future feature; see below.)

### Due dates

A todo may have an optional due date. For now this is **display only**: it
drives the flag and overdue styling, and does not move the todo between buckets.

**Flag states** (a flag icon shown on the todo):

- No due date → no flag.
- Has a due date, not yet due → **gray** flag.
- Due today → **red** flag.
- Overdue (due date in the past) → **red background** on the row, plus an
  **exclamation mark** next to the (red) flag.

**Setting the date:**

- A due date can be set when creating a todo and when editing one.

**Decisions:**

- A due date is a whole day (a `DATE`), not a timestamp — "due today / overdue"
  are day-based.
- Completing a todo clears the overdue styling (a done task isn't overdue).

## Future Features

- **Auto-place todos by due date** — due today → Today, due within 7 days →
  Soon, overdue → Today, 8+ days out → Later, overriding manual placement.
  Deferred because the bucket then depends on the current date and has to be
  recomputed as days pass (render-time computation or a scheduled re-bucket
  job), and a dated todo could no longer be dragged freely.
- Recurring todos
- Todo filtering and sorting
- Reminders / notifications
