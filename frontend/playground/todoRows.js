// Pure helpers for laying todos out as list rows and working out where a row
// belongs. No React here, so the placement rules can be read (and one day
// tested) on their own.

// Fixed buckets, in display order. Labels are what the user sees.
export const BUCKETS = [
  { key: 'today', label: 'Today' },
  { key: 'soon', label: 'Soon' },
  { key: 'later', label: 'Later' },
];

// A todo that only exists on this device so far — a new one being typed, or
// one whose POST hasn't come back yet — has no id, so it carries a clientKey
// instead. The row key has to stay the same for the life of the row: if it
// changed mid-edit, React would remount the row and the input would lose focus.
export function rowKey(todo) {
  return todo.clientKey ?? `todo-${todo.id}`;
}

// One flat list holds both headers and items, because a DraggableFlatList has
// no sections. Headers are fixed markers; items drag freely, and dragging one
// across a header is what moves it into that header's bucket. `draft` is the
// new, unsaved todo being typed, if there is one.
export function toRows(todos, draft) {
  const all = draft ? [...todos, draft] : todos;
  return BUCKETS.flatMap(({ key, label }) => [
    { type: 'header', key: `header-${key}`, bucket: key, label },
    ...all
      .filter((todo) => todo.bucket === key)
      // Sort here rather than trusting the array's order: a local move
      // rewrites one todo's position in place without reordering the array,
      // so only sorting makes the screen agree with the server's ORDER BY.
      .sort((a, b) => a.position - b.position)
      .map((todo) => ({ type: 'item', key: rowKey(todo), todo })),
  ]);
}

// The bucket a row lands in is the nearest header above it.
// Returns -1 when the row sits above the very first header.
function headerIndexAbove(rows, index) {
  for (let i = index; i >= 0; i--) {
    if (rows[i].type === 'header') return i;
  }
  return -1;
}

// The items directly above and below `index` that share its bucket. A header
// in either direction means the bucket ends there, so there is no neighbour.
function neighbours(rows, index) {
  const above = rows[index - 1];
  const below = rows[index + 1];
  return {
    prev: above && above.type === 'item' ? above.todo : null,
    next: below && below.type === 'item' ? below.todo : null,
  };
}

// `position` is a float precisely so a move only has to rewrite the row that
// moved: land it halfway between its new neighbours and every other row in
// the bucket keeps the position it already had.
function positionBetween(prev, next) {
  if (!prev && !next) return 0;
  if (!prev) return next.position - 1;
  if (!next) return prev.position + 1;
  return (prev.position + next.position) / 2;
}

// Where the row at `index` belongs: its bucket, and a position between its
// neighbours. Shared by dragging a todo and dropping the add button, so both
// follow the same rules.
export function placeAt(rows, index) {
  const headerIndex = headerIndexAbove(rows, index);
  if (headerIndex === -1) {
    // Above the first header reads as "put it at the very top": keep it in
    // the first bucket rather than rejecting the drop.
    const firstHeader = rows.findIndex((row) => row.type === 'header');
    const after = rows[firstHeader + 1];
    const next = after && after.type === 'item' ? after.todo : null;
    return { bucket: BUCKETS[0].key, position: positionBetween(null, next) };
  }
  const { prev, next } = neighbours(rows, index);
  return {
    bucket: rows[headerIndex].bucket,
    position: positionBetween(prev, next),
  };
}

// Where a new todo would go if inserted before `rows[index]` (or at the very
// end when `index === rows.length`). A stand-in row is spliced in so
// `placeAt` sees the same shape it gets after a drag.
export function placeInsertAt(rows, index) {
  const withGap = [
    ...rows.slice(0, index),
    { type: 'item', key: 'insert', todo: {} },
    ...rows.slice(index),
  ];
  return placeAt(withGap, index);
}
