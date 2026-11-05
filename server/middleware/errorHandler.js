const mongoose = require('mongoose');

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Wrap async route handlers so rejected promises reach errorHandler.
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = {};
    Object.keys(err.errors).forEach(k => (errors[k] = err.errors[k].message));
    return res.status(400).json({ message: Object.values(errors)[0] || 'Validation failed.', errors });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Invalid id or value.' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const message =
      field === 'email' ? 'An account with this email already exists.'
      : field === 'name' ? 'A category with this name already exists.'
      : 'That value already exists.';
    return res.status(409).json({ message, errors: field ? { [field]: message } : undefined });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
}

module.exports = { notFound, asyncHandler, errorHandler };
