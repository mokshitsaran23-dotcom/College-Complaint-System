const express = require('express');
const router = express.Router();
const {
  login,
  registerUnified,
  registerStudent,
  registerStaff,
  registerWorker,
  getMe
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Authentication endpoints
router.post('/login', login);
router.post('/register', registerUnified);
router.post('/register/student', registerStudent);
router.post('/register/staff', registerStaff);
router.post('/register/worker', registerWorker);
router.get('/me', authenticate, getMe);

module.exports = router;
