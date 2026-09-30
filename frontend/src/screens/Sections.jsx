import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { apiFetch } from '../lib/api.js';
import { dueState } from '../lib/dates.js';
import { MagicPlus } from './MagicPlus.jsx';
import { TodoEditor } from './TodoEditor.jsx';
import { BUCKETS, placeAt, placeInsertAt, rowKey, toRows } from './todoRows.js';

let lastClientKey = 0;
function newClientKey() {
  lastClientKey += 1;
  return `local-${lastClientKey}`;
}

// Given the rows measured when a drag of the add button began, the gap the
// finger is over: insert before the first row whose middle is below the
// finger, or after the last row. `y` is where to draw the insertion line.
function gapAt(snapshot, fingerY) {
  const items = [...snapshot.items].sort((a, b) => a.index - b.index);
  if (items.length === 0) return null;
  for (const item of items) {
    if (fingerY < item.y + item.height / 2) {
      return { index: item.index, y: item.y };
    }
  }
  const last = items[items.length - 1];
  return { index: last.index + 1, y: last.y + last.height };
}

// The due-date flag on a row: gray when a date is set and still ahead, red on
// the due day, and red with a leading "!" once overdue. Nothing when undated.
function DueFlag({ state }) {
  if (state === 'none') return null;
  const red = state === 'today' || state === 'overdue';
  return (
    <View style={styles.flagWrap}>
      {state === 'overdue' ? <Text style={styles.bang}>!</Text> : null}
      <Text style={[styles.flag, red ? styles.flagRed : styles.flagGray]}>
        ⚑
      </Text>
    </View>
  );
}

export function Sections({ onLogout }) {
  const [todos, setTodos] = useState(null); // null until first load
  const [error, setError] = useState(null);
  // A new todo being typed that hasn't been saved. It sits in the list like
  // any other row, at the spot it was dropped.
  const [draft, setDraft] = useState(null);
  // Row key of the todo currently open for editing, if any.
  const [editingKey, setEditingKey] = useState(null);
  // Where the insertion line is drawn while the add button is being dragged.
  const [insertLine, setInsertLine] = useState(null);

  // The open card's text. The card owns it; this is how the list reads it
  // when the card is closed from outside. See TodoEditor.
  const editorValues = useRef({ title: '', notes: '' });
  const listRef = useRef(null);
  const listArea = useRef(null);
  // Every rendered row's View, so an add-button drag can find the rows
  // under the finger.
  const rowViews = useRef(new Map());
  // Row positions measured when an add-button drag begins.
  const dragSnapshot = useRef(null);

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

  const rows = todos ? toRows(todos, draft) : [];

  // The keyboard listener is added once, so it reads the latest rows and
  // open card through refs rather than the values from its first render.
  const latest = useRef({ rows, editingKey });
  useEffect(() => {
    latest.current = { rows, editingKey };
  });

  // When the keyboard opens, scroll the open card clear of it. The
  // KeyboardAvoidingView shrinks the list; this makes sure the card is in
  // the part that's left.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      const { rows: current, editingKey: key } = latest.current;
      const index = current.findIndex((row) => row.key === key);
      if (index !== -1) {
        listRef.current?.scrollToIndex({ index, viewPosition: 0.3 });
      }
    });
    return () => sub.remove();
  }, []);

  function openEditor(todo) {
    editorValues.current = {
      title: todo.title,
      notes: todo.notes ?? '',
      due_date: todo.due_date ?? null,
    };
    setEditingKey(rowKey(todo));
  }

  function startDraft({ bucket, position }) {
    const clientKey = newClientKey();
    editorValues.current = { title: '', notes: '', due_date: null };
    setDraft({
      clientKey,
      id: null,
      title: '',
      notes: null,
      bucket,
      position,
      due_date: null,
    });
    setEditingKey(clientKey);
  }

  // Closing the card is what saves it. A new todo with no title is simply
  // dropped, like an empty to-do in Things.
  function closeEditor() {
    if (!editingKey) return;
    const { title, notes, due_date } = editorValues.current;
    setEditingKey(null);

    if (draft && editingKey === draft.clientKey) {
      setDraft(null);
      if (title.trim()) {
        createTodo({
          ...draft,
          title: title.trim(),
          notes: notes.trim() || null,
          due_date: due_date || null,
        });
      }
      return;
    }

    const todo = todos.find((t) => rowKey(t) === editingKey);
    if (todo) updateTodo(todo, title, notes, due_date);
  }

  async function createTodo(pending) {
    // Show it straight away. It keeps its clientKey (and so its row) until
    // the server answers, and can't be edited or dragged until it has an id.
    setTodos((current) => [...current, pending]);
    try {
      const saved = await apiFetch('/todos', {
        method: 'POST',
        body: {
          title: pending.title,
          notes: pending.notes ?? undefined,
          bucket: pending.bucket,
          position: pending.position,
          due_date: pending.due_date ?? undefined,
        },
      });
      // Swap in the server's copy: the real id, and the position it stored.
      setTodos((current) =>
        current.map((t) => (t.clientKey === pending.clientKey ? saved : t))
      );
      setError(null);
    } catch (err) {
      setTodos((current) =>
        current.filter((t) => t.clientKey !== pending.clientKey)
      );
      setError(err.message);
      // Reopen it so the typing isn't lost — unless another card has been
      // opened since, which shouldn't be yanked away.
      if (latest.current.editingKey === null) {
        editorValues.current = {
          title: pending.title,
          notes: pending.notes ?? '',
          due_date: pending.due_date ?? null,
        };
        setDraft(pending);
        setEditingKey(pending.clientKey);
      }
    }
  }

  async function updateTodo(todo, title, notes, dueDate) {
    // An emptied title keeps the old one: a todo can't be untitled. Emptied
    // notes are sent as null, meaning "clear them". Same for the due date.
    const nextTitle = title.trim() || todo.title;
    const nextNotes = notes.trim() || null;
    const nextDue = dueDate || null;
    if (
      nextTitle === todo.title &&
      nextNotes === (todo.notes ?? null) &&
      nextDue === (todo.due_date ?? null)
    ) {
      return; // opened and closed without changes
    }

    const edited = {
      ...todo,
      title: nextTitle,
      notes: nextNotes,
      due_date: nextDue,
    };
    setTodos((current) => current.map((t) => (t.id === todo.id ? edited : t)));
    try {
      const saved = await apiFetch(`/todos/${todo.id}`, {
        method: 'PATCH',
        body: { title: nextTitle, notes: nextNotes, due_date: nextDue },
      });
      setTodos((current) =>
        current.map((t) => (t.id === saved.id ? saved : t))
      );
    } catch (err) {
      setTodos((current) => current.map((t) => (t.id === todo.id ? todo : t)));
      setError(err.message);
    }
  }

  async function handleDragEnd({ data, to }) {
    const moved = data[to];
    if (!moved || moved.type !== 'item') return;

    const { bucket, position } = placeAt(data, to);
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
  }

  // Measure every row once, at the start of the drag. The list can't scroll
  // while the button is held, so the positions hold for the whole drag.
  function handlePlusDragStart() {
    const snapshot = { rows, items: [], top: 0 };
    dragSnapshot.current = snapshot;
    listArea.current?.measureInWindow((_x, y) => {
      snapshot.top = y;
    });
    rows.forEach((row, index) => {
      rowViews.current.get(row.key)?.measureInWindow((_x, y, _w, height) => {
        snapshot.items.push({ index, y, height });
      });
    });
  }

  function handlePlusDragMove(fingerY) {
    const snapshot = dragSnapshot.current;
    const gap = snapshot && gapAt(snapshot, fingerY);
    if (!gap) return;
    // Only re-render when the finger crosses into a different gap.
    setInsertLine((current) =>
      current && current.index === gap.index
        ? current
        : { index: gap.index, y: gap.y - snapshot.top }
    );
  }

  function handlePlusDrop(fingerY) {
    const snapshot = dragSnapshot.current;
    dragSnapshot.current = null;
    setInsertLine(null);
    if (fingerY === null || !snapshot) return;
    const gap = gapAt(snapshot, fingerY);
    if (gap) startDraft(placeInsertAt(snapshot.rows, gap.index));
  }

  // A plain tap adds to the end of the first bucket: just before the second
  // header.
  function handlePlusTap() {
    const secondHeader = rows.findIndex(
      (row) => row.type === 'header' && row.bucket !== BUCKETS[0].key
    );
    startDraft(placeInsertAt(rows, secondHeader));
  }

  const renderItem = ({ item, drag, isActive }) => {
    // Remember each row's View so a drag of the add button can measure it.
    // collapsable={false} stops Android optimising the View away.
    const register = (view) => {
      if (view) rowViews.current.set(item.key, view);
      else rowViews.current.delete(item.key);
    };

    if (item.type === 'header') {
      return (
        <View ref={register} collapsable={false}>
          <Pressable onPress={closeEditor} disabled={!editingKey}>
            <Text style={styles.header}>{item.label}</Text>
          </Pressable>
        </View>
      );
    }

    if (item.key === editingKey) {
      return (
        <View ref={register} collapsable={false}>
          <TodoEditor valuesRef={editorValues} onDone={closeEditor} />
        </View>
      );
    }

    const saving = item.todo.id == null;
    const due = dueState(item.todo);
    return (
      <View ref={register} collapsable={false}>
        <ScaleDecorator>
          <Pressable
            style={[
              styles.item,
              isActive && styles.itemActive,
              saving && styles.itemSaving,
              due === 'overdue' && styles.itemOverdue,
            ]}
            // While a card is open, tapping anywhere else closes it, the same
            // as in Things, rather than opening a second card.
            onPress={() => (editingKey ? closeEditor() : openEditor(item.todo))}
            onLongPress={editingKey ? undefined : drag}
            disabled={isActive || saving}
          >
            <Text style={styles.itemText}>{item.todo.title}</Text>
            <DueFlag state={due} />
          </Pressable>
        </ScaleDecorator>
      </View>
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
    // Shrinks to make room for the keyboard, so an open card near the bottom
    // can be scrolled above it. Android resizes the window itself, per Expo's
    // keyboard guide, so it needs no behavior.
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Text style={styles.brand}>todood</Text>
        <Pressable onPress={onLogout} hitSlop={8}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View ref={listArea} style={styles.container} collapsable={false}>
        <DraggableFlatList
          ref={listRef}
          data={rows}
          keyExtractor={(row) => row.key}
          renderItem={renderItem}
          // The rows read editingKey, which isn't part of `data`.
          extraData={editingKey}
          onDragEnd={handleDragEnd}
          containerStyle={styles.container}
          // Without this, the first tap on a row while the keyboard is up
          // only dismisses the keyboard, and the row never hears it.
          keyboardShouldPersistTaps="handled"
          onScrollToIndexFailed={() => {}}
          contentContainerStyle={styles.listContent}
          // Fills the rest of the screen below the last row: tapping that
          // empty space closes an open card, and it keeps the last row clear
          // of the add button.
          ListFooterComponent={
            <Pressable style={styles.footer} onPress={closeEditor} />
          }
          ListFooterComponentStyle={styles.footerContainer}
        />
        {insertLine ? (
          <View
            pointerEvents="none"
            style={[styles.insertLine, { top: insertLine.y - 1 }]}
          />
        ) : null}
      </View>
      {editingKey ? null : (
        <MagicPlus
          onTap={handlePlusTap}
          onDragStart={handlePlusDragStart}
          onDragMove={handlePlusDragMove}
          onDrop={handlePlusDrop}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  brand: {
    fontSize: 18,
    fontWeight: '700',
  },
  logout: {
    fontSize: 15,
    color: '#1a73e8',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  itemActive: {
    backgroundColor: '#e6f0ff',
  },
  itemOverdue: {
    backgroundColor: '#fde7ea',
  },
  flagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  flag: {
    fontSize: 16,
  },
  flagGray: {
    color: '#999',
  },
  flagRed: {
    color: '#d64545',
  },
  bang: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d64545',
  },
  itemSaving: {
    opacity: 0.5,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    flexGrow: 1,
  },
  footerContainer: {
    flexGrow: 1,
  },
  footer: {
    flexGrow: 1,
    // Room to scroll the last todo clear of the floating add button.
    minHeight: 100,
  },
  insertLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#1a73e8',
  },
});
