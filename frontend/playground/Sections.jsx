import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { apiFetch } from '../api.js';

// Fixed buckets, in display order. Labels are what the user sees.
const BUCKETS = [
  { key: 'today', label: 'Today' },
  { key: 'soon', label: 'Soon' },
  { key: 'later', label: 'Later' },
];

// One flat list holds both headers and items, because a DraggableFlatList has
// no sections. Headers are fixed markers; items drag freely, and dragging one
// across a header is what moves it into that header's bucket.
function toRows(todos) {
  return BUCKETS.flatMap(({ key, label }) => [
    { type: 'header', key: `header-${key}`, bucket: key, label },
    ...todos
      .filter((todo) => todo.bucket === key)
      // Sort here rather than trusting the array's order: a local move
      // rewrites one todo's position in place without reordering the array,
      // so only sorting makes the screen agree with the server's ORDER BY.
      .sort((a, b) => a.position - b.position)
      .map((todo) => ({ type: 'item', key: `todo-${todo.id}`, todo })),
  ]);
}

// The bucket a dropped row lands in is the nearest header above it.
// Returns -1 when the row was dropped above the very first header.
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

export function Sections() {
  const [todos, setTodos] = useState(null); // null until first load
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch('/todos');
        if (active) setTodos(data);
      } catch (err) {
        if (active) setError(err.message);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleDragEnd = useCallback(
    async ({ data, to }) => {
      const moved = data[to];
      if (!moved || moved.type !== 'item') return;

      const headerIndex = headerIndexAbove(data, to);
      let bucket;
      let prev;
      let next;

      if (headerIndex === -1) {
        // Dropped above the first header, which reads as "put it at the very
        // top": keep it in the first bucket rather than rejecting the drag.
        bucket = BUCKETS[0].key;
        prev = null;
        const firstHeader = data.findIndex((row) => row.type === 'header');
        const after = data[firstHeader + 1];
        next = after && after.type === 'item' ? after.todo : null;
      } else {
        bucket = data[headerIndex].bucket;
        ({ prev, next } = neighbours(data, to));
      }

      const position = positionBetween(prev, next);
      if (moved.todo.bucket === bucket && moved.todo.position === position) {
        return; // dropped back where it started
      }

      // Move it locally first so the list settles under the finger, then let
      // the server confirm. The rows are derived from `todos`, so a wrong
      // position here is visible immediately as the row landing in the wrong
      // place rather than silently drifting out of sync.
      const before = todos;
      setTodos((current) =>
        current.map((todo) =>
          todo.id === moved.todo.id ? { ...todo, bucket, position } : todo
        )
      );

      try {
        const saved = await apiFetch(`/todos/${moved.todo.id}`, {
          method: 'PATCH',
          body: { bucket, position },
        });
        setTodos((current) =>
          current.map((todo) => (todo.id === saved.id ? saved : todo))
        );
      } catch (err) {
        setTodos(before); // put it back where the server still thinks it is
        setError(err.message);
      }
    },
    [todos]
  );

  const renderItem = ({ item, drag, isActive }) => {
    if (item.type === 'header') {
      return <Text style={styles.header}>{item.label}</Text>;
    }
    return (
      <ScaleDecorator>
        <Pressable
          style={[styles.item, isActive && styles.itemActive]}
          onLongPress={drag}
          disabled={isActive}
        >
          <Text style={styles.itemText}>{item.todo.title}</Text>
        </Pressable>
      </ScaleDecorator>
    );
  };

  if (error && todos === null) {
    return (
      <Text style={styles.message}>Couldn&apos;t load todos: {error}</Text>
    );
  }
  if (todos === null) {
    return <ActivityIndicator style={styles.message} />;
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <DraggableFlatList
        data={toRows(todos)}
        keyExtractor={(row) => row.key}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        containerStyle={styles.container}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    margin: 24,
  },
  error: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#b00020',
    backgroundColor: '#fde7ea',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: '#f2f2f2',
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  itemActive: {
    backgroundColor: '#e6f0ff',
  },
  itemText: {
    fontSize: 16,
  },
});
