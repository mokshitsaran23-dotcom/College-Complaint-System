const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, getComplaintById } = require('../controllers/complaintController');
const { assignComplaint } = require('../controllers/assignmentController');
const { updateStatus } = require('../controllers/statusController');
const { submitFeedback } = require('../controllers/feedbackController');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, createComplaint);
router.get('/', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaintById);

// Admin-only routing
router.patch('/:id/assign', authenticate, requireRole('admin'), assignComplaint);

// Staff or Admin status updates
router.patch('/:id/status', authenticate, requireRole('staff', 'admin'), updateStatus);

// Post-resolution feedback (Submitter only)
router.post('/:id/feedback', authenticate, submitFeedback);

module.exports = router;
