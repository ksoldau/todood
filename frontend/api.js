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

  const contentType = result.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!result.ok) {
    const message = isJson
      ? (await result.json()).error || 'Request failed'
      : `Server error (${result.status})`;
    const err = new Error(message);
    err.status = result.status;
    throw err;
  }

  if (!isJson) {
    throw new Error('Expected JSON response but got a non-JSON response');
  }

  return result.json();
}
