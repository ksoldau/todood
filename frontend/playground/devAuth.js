import { apiFetch } from '../api.js';
import { saveToken } from '../auth.js';

// TEMPORARY dev-only login. There's no login screen yet, so App bootstraps a
// session as a fixed dev user. Remove this file once real auth lands.
// Read from .env.local, which is gitignored, so the credentials stay out of
// git history. EXPO_PUBLIC_* vars are inlined into the bundle at build time,
// so this is not a runtime secret — it only keeps them out of the repo.
const DEV_CREDENTIALS = {
  email: process.env.EXPO_PUBLIC_DEV_EMAIL,
  password: process.env.EXPO_PUBLIC_DEV_PASSWORD,
};

// Logs in as the dev user, stores the token, and returns it. Throws when the
// credentials are unset; App treats that as signed out and shows the login
// placeholder, which is the right outcome on a fresh checkout.
export async function devLogin() {
  if (!DEV_CREDENTIALS.email || !DEV_CREDENTIALS.password) {
    throw new Error('No dev credentials in .env.local');
  }

  const { token } = await apiFetch('/login', {
    method: 'POST',
    body: DEV_CREDENTIALS,
  });
  await saveToken(token);
  return token;
}
