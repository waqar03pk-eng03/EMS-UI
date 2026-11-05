// One place that talks to the API: adds the JWT header and turns errors into Error objects.
const API_BASE = '/api';
const TOKEN_KEY = 'ems.token';

let onUnauthorized = null;

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    /* storage unavailable */
  }
}

// AuthContext registers a callback here so an expired token logs the user out everywhere.
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (e) {
    throw new Error('Can’t reach the server. Check that the API is running.');
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* non-JSON response */
  }

  if (!res.ok) {
    if (res.status === 401 && token && !path.startsWith('/auth/')) {
      setToken(null);
      if (onUnauthorized) onUnauthorized();
    }
    const err = new Error((data && data.message) || `Request failed (${res.status}).`);
    err.status = res.status;
    err.fields = data && data.errors;
    throw err;
  }
  return data;
}
