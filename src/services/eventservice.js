// Talks to the Node/Express API in /server.
// In development, webpack-dev-server proxies "/api" to http://localhost:4000
// (see the devServer.proxy setting in webpack.config.js), so no CORS or full URL is needed.

const API_BASE = '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
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
    const err = new Error((data && data.message) || `Request failed (${res.status}).`);
    err.fields = data && data.errors;
    throw err;
  }
  return data;
}

export function getEvents() {
  return request('/events');
}

export function getEvent(id) {
  return request(`/events/${id}`);
}

export function createEvent(event) {
  return request('/events', { method: 'POST', body: JSON.stringify(event) });
}

export function updateEvent(id, event) {
  return request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(event) });
}

export function deleteEvent(id) {
  return request(`/events/${id}`, { method: 'DELETE' });
}
