import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { setOnDeadSession } from './api.js';
import { getToken } from './auth.js';

export default function App() {
  const [state, setState] = useState('loading'); // in | out | loading

  useEffect(() => {
    async function readToken() {
      const token = await getToken();
      if (token) {
        setState('in');
      } else {
        setState('out');
      }
    }

    readToken();

    setOnDeadSession(() => setState('out'));
  }, []);

  return (
    <View style={styles.container}>
      {state === 'loading' ? <Text>Loading...</Text> : null}
      {state === 'in' ? <Text>logged in app</Text> : null}
      {state === 'out' ? <Text>login screen</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
