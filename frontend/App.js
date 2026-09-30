import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { setOnDeadSession } from './src/lib/api.js';
import { getToken, removeToken } from './src/lib/auth.js';
import { LoginScreen } from './src/screens/LoginScreen.jsx';
import { Sections } from './src/screens/Sections.jsx';

export default function App() {
  const [state, setState] = useState('loading'); // in | out | loading

  useEffect(() => {
    async function readToken() {
      const token = await getToken();
      setState(token ? 'in' : 'out');
    }

    readToken();

    // A dead session (a 401 on a request that carried a token) sends us back
    // to the login screen.
    setOnDeadSession(() => setState('out'));
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {state === 'loading' ? <Text>Loading...</Text> : null}
          {state === 'in' ? (
            <Sections
              onLogout={async () => {
                await removeToken();
                setState('out');
              }}
            />
          ) : null}
          {state === 'out' ? (
            <LoginScreen onSignedIn={() => setState('in')} />
          ) : null}
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
