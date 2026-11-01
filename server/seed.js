// Optional: npm run seed  (clears the events collection and inserts sample data)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Event = require('./models/Event');

const samples = [
  {
    title: 'Annual Developers Conference', category: 'Conference',
    description: 'Two days of talks and workshops on web and cloud development.',
    date: '2026-11-14', startTime: '09:00', endTime: '17:00', venue: 'Expo Centre, Karachi',
    capacity: 400, ticketPrice: 25, organizerEmail: 'team@example.com',
  },
  {
    title: 'Winter Charity Dinner', category: 'Fundraiser',
    description: 'A seated dinner supporting local school scholarships.',
    date: '2026-12-05', startTime: '19:30', endTime: '22:30', venue: 'Grand Ballroom',
    capacity: 150, ticketPrice: 60, organizerEmail: 'dinner@example.com',
  },
];

(async () => {
  await connectDB();
  await Event.deleteMany({});
  await Event.insertMany(samples);
  console.log(`Inserted ${samples.length} events`);
  await mongoose.disconnect();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
