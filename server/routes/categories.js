const express = require('express');
const ctrl = require('../controllers/categoryController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(ctrl.list));                        // any logged-in user (needed by the event form)
router.post('/', requireAdmin, asyncHandler(ctrl.create));
router.put('/:id', requireAdmin, asyncHandler(ctrl.update));
router.delete('/:id', requireAdmin, asyncHandler(ctrl.remove));

module.exports = router;
