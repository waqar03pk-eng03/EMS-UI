const mongoose = require('mongoose');
const Event = require('../models/Event');

const FIELDS = [
  'title', 'category', 'description', 'date', 'startTime', 'endTime',
  'venue', 'capacity', 'ticketPrice', 'organizerEmail',
];

// Only copy known fields so clients can't set _id, timestamps, etc.
function pick(body) {
  const out = {};
  FIELDS.forEach(f => {
    if (body[f] !== undefined) out[f] = body[f];
  });
  return out;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function checkId(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid event id.' });
    return false;
  }
  return true;
}

// GET /api/events?upcoming=true&category=Concert&q=dinner
exports.list = async (req, res) => {
  const filter = {};
  if (req.query.upcoming === 'true') filter.date = { $gte: todayISO() };
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(String(req.query.q)), 'i');
    filter.$or = [{ title: rx }, { venue: rx }];
  }
  const events = await Event.find(filter).sort({ date: 1, startTime: 1 });
  res.json(events);
};

// GET /api/events/:id
exports.get = async (req, res) => {
  if (!checkId(req, res)) return;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.json(event);
};

// POST /api/events
exports.create = async (req, res) => {
  const event = await Event.create(pick(req.body));
  res.status(201).json(event);
};

// PUT /api/events/:id
exports.update = async (req, res) => {
  if (!checkId(req, res)) return;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  event.set(pick(req.body));
  await event.save(); // runs all validators, including start/end time
  res.json(event);
};

// DELETE /api/events/:id
exports.remove = async (req, res) => {
  if (!checkId(req, res)) return;
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.status(204).end();
};
