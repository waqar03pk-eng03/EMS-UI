const express = require('express');
const ctrl = require('../controllers/eventController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.use(requireAuth); // every events route needs a valid token

router.get('/', asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.get));
router.post('/', asyncHandler(ctrl.create));
router.put('/:id', requireAdmin, asyncHandler(ctrl.update));
router.delete('/:id', requireAdmin, asyncHandler(ctrl.remove));

module.exports = router;
