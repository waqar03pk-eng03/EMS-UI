const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Compared against when the email is unknown, so "no such user" and "wrong password" take similar time.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });
}

const text = v => (typeof v === 'string' ? v.trim() : '');

// POST /api/auth/register  { name, email, password }
exports.register = async (req, res) => {
  const name = text(req.body.name);
  const email = text(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (password.length < 8 || password.length > 72) {
    const message = 'Password must be 8 to 72 characters.';
    return res.status(400).json({ message, errors: { password: message } });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // The role is never taken from the request: new accounts are always plain users.
  const user = await User.create({ name, email, passwordHash, role: 'user' });
  res.status(201).json({ token: signToken(user), user });
};

// POST /api/auth/login  { email, password }
exports.login = async (req, res) => {
  const email = text(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ message: 'Invalid email or password.' });

  res.json({ token: signToken(user), user });
};

// GET /api/auth/me
exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: 'Account no longer exists.' });
  res.json(user);
};
