require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { getBilling } = require('./config/billing');
const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const eventRoutes = require('./routes/events');
const { notFound, errorHandler } = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is missing or too short (use at least 32 characters). See .env.example.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ status: 'ok', database: states[mongoose.connection.readyState] });
});

app.use('/api/auth', authRoutes);
app.get('/api/config', requireAuth, (req, res) => res.json(getBilling()));
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => app.listen(PORT, () => console.log(`EMS API listening on http://localhost:${PORT}`)))
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
