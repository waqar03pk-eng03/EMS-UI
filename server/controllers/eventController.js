const mongoose = require('mongoose');
const Event = require('../models/Event');
const Category = require('../models/Category');
const { getBilling } = require('../config/billing');
const { charge } = require('../services/paymentService');

// Payment fields are deliberately NOT in this list: clients can't mark an event as paid.
const FIELDS = [
  'title', 'category', 'description', 'date', 'startTime', 'endTime',
  'venue', 'capacity', 'ticketPrice', 'organizerEmail',
];
const PAYMENT_CHOICES = ['paypal', 'card', 'later'];

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

// Returns true when the category is missing from the request (the schema reports that) or exists.
async function checkCategory(value, res) {
  if (value === undefined) return true;
  if (!mongoose.isValidObjectId(value) || !(await Category.exists({ _id: value }))) {
    const message = 'Choose a valid category.';
    res.status(400).json({ message, errors: { category: message } });
    return false;
  }
  return true;
}

// GET /api/events?upcoming=true&category=<id>&q=dinner
exports.list = async (req, res) => {
  const filter = {};
  if (req.query.upcoming === 'true') filter.date = { $gte: todayISO() };
  if (req.query.category && mongoose.isValidObjectId(String(req.query.category))) {
    filter.category = String(req.query.category);
  }
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(String(req.query.q)), 'i');
    filter.$or = [{ title: rx }, { venue: rx }];
  }
  const events = await Event.find(filter).populate('category', 'name').sort({ date: 1, startTime: 1 });
  res.json(events);
};

// GET /api/events/:id
exports.get = async (req, res) => {
  if (!checkId(req, res)) return;
  const event = await Event.findById(req.params.id).populate('category', 'name');
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.json(event);
};

// POST /api/events   body: event fields + paymentMethod ("paypal" | "card" | "later")
exports.create = async (req, res) => {
  const method = req.body.paymentMethod === undefined ? 'later' : req.body.paymentMethod;
  if (!PAYMENT_CHOICES.includes(method)) {
    const message = 'Choose PayPal, credit card, or pay later.';
    return res.status(400).json({ message, errors: { paymentMethod: message } });
  }

  const data = pick(req.body);
  if (!(await checkCategory(data.category, res))) return;

  const { bookingFee, currency } = getBilling();
  const event = new Event({
    ...data,
    createdBy: req.user.id,
    payment: { status: 'unpaid', amount: bookingFee, currency },
  });

  await event.validate(); // validate first so nobody is charged for an invalid event

  if (method !== 'later') {
    const result = await charge({ method, amount: bookingFee, currency });
    event.payment = {
      status: result.status,
      method: result.method,
      amount: result.amount,
      currency: result.currency,
      reference: result.reference,
      paidAt: result.paidAt,
    };
  }

  await event.save();
  await event.populate('category', 'name');
  res.status(201).json(event);
};

// PUT /api/events/:id   (admin)
exports.update = async (req, res) => {
  if (!checkId(req, res)) return;
  const data = pick(req.body);
  if (!(await checkCategory(data.category, res))) return;

  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  event.set(data);
  await event.save();
  await event.populate('category', 'name');
  res.json(event);
};

// DELETE /api/events/:id   (admin)
exports.remove = async (req, res) => {
  if (!checkId(req, res)) return;
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.status(204).end();
};
