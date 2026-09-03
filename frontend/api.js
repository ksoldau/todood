import { API_BASE_URL } from './config.js';
import { getToken } from './auth.js';

export async function apiFetch(path, options = {}) {
  const fullUrl = `${API_BASE_URL}${path}`;
  const token = await getToken();

  const body = options.body ? JSON.stringify(options.body) : undefined;

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const result = await fetch(fullUrl, {
    method: options.method,
    headers,
    body,
  });

  const data = await result.json();

  if (!result.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = result.status;
    throw err;
  }

  return data;
}
