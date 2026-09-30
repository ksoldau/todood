// Due dates are whole days, compared in the viewer's local calendar. Storing
// and comparing as 'YYYY-MM-DD' strings keeps it timezone-free: that format
// sorts lexicographically the same as chronologically, so string comparison is
// date comparison.

// A Date (or date-like) as its local 'YYYY-MM-DD'. Uses local getters so the
// day matches what the user sees, not UTC.
export function toDateStr(dateLike) {
  const d = new Date(dateLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Today's local calendar day.
export function todayStr(now = new Date()) {
  return toDateStr(now);
}

// How a todo's due date reads right now:
//   'none'    - no due date
//   'future'  - due after today (calm)
//   'today'   - due today
//   'overdue' - due before today
// A completed todo is never overdue or urgent — finishing it clears the alarm.
export function dueState(todo, today = todayStr()) {
  if (!todo.due_date) return 'none';
  if (todo.completed_at) return 'future';
  if (todo.due_date < today) return 'overdue';
  if (todo.due_date === today) return 'today';
  return 'future';
}
