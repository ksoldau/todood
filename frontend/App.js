import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { setOnDeadSession } from './api.js';
import { getToken } from './auth.js';
import { devLogin } from './playground/devAuth.js';
import { Sections } from './playground/Sections.jsx';

export default function App() {
  const [state, setState] = useState('loading'); // in | out | loading

  useEffect(() => {
    async function readToken() {
      let token = await getToken();
      // TEMP: no login screen yet, so bootstrap a dev session when signed out.
      if (!token) {
        try {
          token = await devLogin();
        } catch {
          token = null;
        }
      }
      setState(token ? 'in' : 'out');
    }

    readToken();

    setOnDeadSession(() => setState('out'));
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {state === 'loading' ? <Text>Loading...</Text> : null}
          {state === 'in' ? <Sections /> : null}
          {state === 'out' ? <Text>login screen</Text> : null}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
