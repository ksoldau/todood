import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiFetch } from '../lib/api.js';
import { saveToken } from '../lib/auth.js';

// Sign-in / sign-up. One screen, two modes toggled by `mode`. Calls onSignedIn
// once a token is stored, which is the caller's cue to show the app.
export function LoginScreen({ onSignedIn }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';
  const canSubmit = email.trim() !== '' && password !== '' && !busy;

  function switchMode() {
    setMode(isRegister ? 'login' : 'register');
    setError(null);
  }

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    const creds = { email: email.trim(), password };
    try {
      // Register returns { id, email } but no token, so after a successful
      // register we fall through to the same /login call to get one.
      if (isRegister) {
        await apiFetch('/register', { method: 'POST', body: creds });
      }
      const { token } = await apiFetch('/login', {
        method: 'POST',
        body: creds,
      });
      await saveToken(token);
      onSignedIn();
    } catch (err) {
      setError(err.message);
      setBusy(false); // stay on the screen; keep what they typed
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>todood</Text>
        <Text style={styles.subtitle}>
          {isRegister ? 'Create an account' : 'Sign in to your todos'}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          editable={!busy}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          editable={!busy}
          onSubmitEditing={submit}
          returnKeyType={isRegister ? 'next' : 'go'}
        />

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={submit}
          disabled={!canSubmit}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegister ? 'Sign up' : 'Sign in'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={switchMode} disabled={busy} hitSlop={8}>
          <Text style={styles.switch}>
            {isRegister
              ? 'Already have an account? Sign in'
              : 'New here? Create an account'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    gap: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  error: {
    color: '#b00020',
    backgroundColor: '#fde7ea',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  button: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switch: {
    marginTop: 8,
    textAlign: 'center',
    color: '#1a73e8',
    fontSize: 14,
  },
});
