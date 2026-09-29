import { useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// Past this, a drop counts as "put it here"; within it, as changing your mind
// and dragging the button back home.
const CANCEL_DISTANCE = 40;

// The floating add button, after Things' Magic Plus: tap it to add at a
// default spot, or drag it into the list and drop it where the new todo
// should go. It only reports finger positions — working out what's under the
// finger is the list's job, since the list knows where its rows are.
export function MagicPlus({ onTap, onDragStart, onDragMove, onDrop }) {
  const offset = useRef(new Animated.ValueXY()).current;

  // runOnJS: plain JS callbacks rather than Reanimated worklets. It's one
  // button, and every callback here updates React state anyway.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(8)
    .onStart(() => onDragStart())
    .onUpdate((e) => {
      offset.setValue({ x: e.translationX, y: e.translationY });
      onDragMove(e.absoluteY);
    })
    // `success` is false when the system interrupts the drag (a call coming
    // in, say); treat that like dragging back home. Null means "no drop".
    .onEnd((e, success) => {
      const cancelled =
        !success ||
        Math.hypot(e.translationX, e.translationY) < CANCEL_DISTANCE;
      onDrop(cancelled ? null : e.absoluteY);
    })
    .onFinalize(() => {
      Animated.spring(offset, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((_e, success) => {
      if (success) onTap();
    });

  // Exclusive: a drag that goes past minDistance is a pan, otherwise a tap.
  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <Animated.View
        style={[styles.button, { transform: offset.getTranslateTransform() }]}
        accessibilityRole="button"
        accessibilityLabel="Add to-do"
      >
        <Text style={styles.text}>+</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a73e8',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  text: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 34,
  },
});
