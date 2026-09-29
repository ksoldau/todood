import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

// A todo row opened up for editing, in place in the list — the same card for
// a new todo and an existing one.
//
// The text lives here rather than in the list's state, so typing re-renders
// this card and not every row. The parent still needs the latest text when
// the card closes from outside (a tap elsewhere in the list), so every change
// is also written to `valuesRef`, which the parent reads on close.
export function TodoEditor({ valuesRef, onDone }) {
  const [title, setTitle] = useState(valuesRef.current.title);
  const [notes, setNotes] = useState(valuesRef.current.notes);

  function changeTitle(text) {
    setTitle(text);
    valuesRef.current.title = text;
  }

  function changeNotes(text) {
    setNotes(text);
    valuesRef.current.notes = text;
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
});
