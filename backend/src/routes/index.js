const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const complaintRoutes = require('./complaintRoutes');
const reportingRoutes = require('./reportingRoutes');

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/reports', reportingRoutes);

module.exports = router;
