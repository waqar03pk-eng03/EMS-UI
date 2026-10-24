// Temporary data layer. Events are kept in the browser's localStorage so the UI
// works before your Node/Mongo API exists. Every function returns a Promise,
// so later you only need to replace the bodies with fetch() calls and the
// components will not change.

const STORAGE_KEY = 'ems.events';
// const API_BASE = 'http://localhost:4000/api'; // use this when your API is ready

const seed = [
  {
    id: 'seed-1',
    title: 'Annual Developers Conference',
    category: 'Conference',
    description: 'Two days of talks and workshops on web and cloud development.',
    date: '2026-11-14',
    startTime: '09:00',
    endTime: '17:00',
    venue: 'Expo Centre, Karachi',
    capacity: 400,
    ticketPrice: 25,
    organizerEmail: 'team@example.com',
  },
  {
    id: 'seed-2',
    title: 'Winter Charity Dinner',
    category: 'Fundraiser',
    description: 'A seated dinner supporting local school scholarships.',
    date: '2026-12-05',
    startTime: '19:30',
    endTime: '22:30',
    venue: 'Grand Ballroom',
    capacity: 150,
    ticketPrice: 60,
    organizerEmail: 'dinner@example.com',
  },
];

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* storage unavailable or corrupt: fall back to seed data */
  }
  return seed;
}

function write(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    /* ignore */
  }
}

export function getEvents() {
  // return fetch(`${API_BASE}/events`).then(r => r.json());
  const sorted = [...read()].sort((a, b) => a.date.localeCompare(b.date));
  return Promise.resolve(sorted);
}

export function createEvent(event) {
  // return fetch(`${API_BASE}/events`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event),
  // }).then(r => r.json());
  const created = { ...event, id: String(Date.now()) };
  write([...read(), created]);
  return Promise.resolve(created);
}

export function deleteEvent(id) {
  // return fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
  write(read().filter(e => e.id !== id));
  return Promise.resolve();
}