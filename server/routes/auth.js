const express = require('express');
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// The only routes that work without a token.
router.post('/register', asyncHandler(ctrl.register));
router.post('/login', asyncHandler(ctrl.login));

router.get('/me', requireAuth, asyncHandler(ctrl.me));

module.exports = router;
