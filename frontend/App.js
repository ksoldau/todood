import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { API_BASE_URL } from './config';
import { useEffect, useState } from 'react';

export default function App() {
  const [res, setRes] = useState(null);
  useEffect(() => {
    fetch(`${API_BASE_URL}/healthz`)
      .then((response) => response.json())
      .then((data) => setRes(data));
  }, []);

  return (
    <View style={styles.container}>
      <Text>{JSON.stringify(res)}</Text>
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
