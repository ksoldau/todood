import { save, read, remove } from './storage.js';

const AUTH_KEY = 'authToken';

export async function saveToken(token) {
  await save(AUTH_KEY, token);
}

export async function getToken() {
  return await read(AUTH_KEY);
}

export async function removeToken() {
  await remove(AUTH_KEY);
}
