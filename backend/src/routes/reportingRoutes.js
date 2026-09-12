const express = require('express');
const router = express.Router();
const { getSummaryReport } = require('../controllers/reportingController');
const { authenticate, requireRole } = require('../middleware/auth');

// Admin reporting
router.get('/summary', authenticate, requireRole('admin'), getSummaryReport);

module.exports = router;
