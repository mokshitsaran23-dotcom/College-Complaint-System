const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const complaintRoutes = require('./complaintRoutes');
const reportingRoutes = require('./reportingRoutes');
const notificationRoutes = require('./notificationRoutes');

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/reports', reportingRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
