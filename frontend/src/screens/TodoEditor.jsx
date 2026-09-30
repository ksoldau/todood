import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import { toDateStr } from '../lib/dates.js';

// Turn a stored 'YYYY-MM-DD' into a local Date the calendar can highlight, and
// a friendly label. Parsing with an explicit local midnight avoids the UTC
// shift a bare `new Date('2026-10-05')` would introduce.
function parseDue(due) {
  return due ? new Date(due + 'T00:00:00') : undefined;
}
function dueLabel(due) {
  if (!due) return 'Add due date';
  return parseDue(due).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// A todo row opened up for editing, in place in the list — the same card for
// a new todo and an existing one.
//
// The text lives here rather than in the list's state, so typing re-renders
// this card and not every row. The parent still needs the latest values when
// the card closes from outside (a tap elsewhere in the list), so every change
// is also written to `valuesRef`, which the parent reads on close.
export function TodoEditor({ valuesRef, onDone }) {
  const [title, setTitle] = useState(valuesRef.current.title);
  const [notes, setNotes] = useState(valuesRef.current.notes);
  const [due, setDue] = useState(valuesRef.current.due_date ?? null);
  const [showCalendar, setShowCalendar] = useState(false);
  const defaultStyles = useDefaultStyles();

  function changeTitle(text) {
    setTitle(text);
    valuesRef.current.title = text;
  }

  function changeNotes(text) {
    setNotes(text);
    valuesRef.current.notes = text;
  }

  function changeDue(next) {
    setDue(next);
    valuesRef.current.due_date = next;
  }

  return (
    <View style={styles.card}>
      <TextInput
        style={styles.title}
        value={title}
        onChangeText={changeTitle}
        placeholder="New To-Do"
        autoFocus
        returnKeyType="done"
        // Return closes the card. Take the text from the event, not state: on
        // native, keystrokes reach state asynchronously, so a fast last letter
        // followed by Return would otherwise be dropped.
        onSubmitEditing={(e) => {
          valuesRef.current.title = e.nativeEvent.text;
          onDone();
        }}
      />
      <TextInput
        style={styles.notes}
        value={notes}
        onChangeText={changeNotes}
        placeholder="Notes"
        multiline
      />

      <View style={styles.dueRow}>
        <Pressable
          style={styles.dueButton}
          onPress={() => setShowCalendar((v) => !v)}
        >
          <Text style={[styles.flag, due && styles.flagSet]}>⚑</Text>
          <Text style={[styles.dueText, !due && styles.duePlaceholder]}>
            {dueLabel(due)}
          </Text>
        </Pressable>
      </View>

      {showCalendar ? (
        <View>
          <DateTimePicker
            mode="single"
            date={parseDue(due) ?? new Date()}
            onChange={({ date }) => {
              changeDue(toDateStr(date));
              setShowCalendar(false);
            }}
            styles={defaultStyles}
          />
          {due ? (
            <Pressable
              style={styles.clearButton}
              onPress={() => {
                changeDue(null);
                setShowCalendar(false);
              }}
              hitSlop={8}
            >
              <Text style={styles.clear}>Clear due date</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 8,
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
    // Lifts the card off the list so it reads as "open".
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 16,
    paddingVertical: 2,
  },
  notes: {
    fontSize: 14,
    color: '#555',
    minHeight: 40,
    maxHeight: 160,
    paddingVertical: 2,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  flag: {
    fontSize: 16,
    color: '#bbb',
  },
  flagSet: {
    color: '#1a73e8',
  },
  dueText: {
    fontSize: 14,
    color: '#1a73e8',
  },
  duePlaceholder: {
    color: '#888',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  clear: {
    fontSize: 14,
    color: '#d64545',
  },
});
