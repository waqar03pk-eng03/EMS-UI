// npm run seed
// Inserts default categories (only if there are none), replaces all events with two samples,
// and creates/updates an admin account when ADMIN_EMAIL and ADMIN_PASSWORD are set.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Event = require('./models/Event');
const User = require('./models/User');

const DEFAULT_CATEGORIES = ['Conference', 'Workshop', 'Concert', 'Wedding', 'Fundraiser', 'Meetup', 'Other'];

(async () => {
  await connectDB();

  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES.map(name => ({ name })));
    console.log(`Inserted ${DEFAULT_CATEGORIES.length} categories`);
  }
  const categories = await Category.find();
  const idOf = name => (categories.find(c => c.name === name) || categories[0])._id;

  let admin = null;
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    if (ADMIN_PASSWORD.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters.');
    admin = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL.trim().toLowerCase() },
      { $set: { name: ADMIN_NAME || 'Administrator', role: 'admin', passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Admin account ready: ${ADMIN_EMAIL}`);
  } else {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin account created.');
  }

  await Event.deleteMany({});
  await Event.insertMany([
    {
      title: 'Annual Developers Conference', category: idOf('Conference'),
      description: 'Two days of talks and workshops on web and cloud development.',
      date: '2026-11-14', startTime: '09:00', endTime: '17:00', venue: 'Expo Centre, Karachi',
      capacity: 400, ticketPrice: 25, organizerEmail: 'team@example.com',
      payment: { status: 'paid', method: 'card', amount: 50, currency: 'USD', reference: 'MOCK-CARD-SEED0001', paidAt: new Date() },
      createdBy: admin ? admin._id : undefined,
    },
    {
      title: 'Winter Charity Dinner', category: idOf('Fundraiser'),
      description: 'A seated dinner supporting local school scholarships.',
      date: '2026-12-05', startTime: '19:30', endTime: '22:30', venue: 'Grand Ballroom',
      capacity: 150, ticketPrice: 60, organizerEmail: 'dinner@example.com',
      payment: { status: 'unpaid', amount: 50, currency: 'USD' },
      createdBy: admin ? admin._id : undefined,
    },
  ]);
  console.log('Inserted 2 sample events');

  await mongoose.disconnect();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
