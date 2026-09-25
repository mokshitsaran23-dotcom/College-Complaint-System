const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, getComplaintById } = require('../controllers/complaintController');
const { assignComplaint } = require('../controllers/assignmentController');
const { updateStatus, markUnderReview } = require('../controllers/statusController');
const { submitFeedback } = require('../controllers/feedbackController');
const { authenticate, requireRole } = require('../middleware/auth');

// Submitter (Student or Staff) complaint creation
router.post('/', authenticate, createComplaint);
router.get('/', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaintById);

// Admin-only review and routing
router.patch('/:id/review', authenticate, requireRole('admin'), markUnderReview);
router.patch('/:id/assign', authenticate, requireRole('admin'), assignComplaint);

// Status updates across workflow (Worker starts/completes work, Admin approves/rejects)
router.patch('/:id/status', authenticate, requireRole('worker', 'staff', 'admin'), updateStatus);

// Post-resolution feedback (Submitter only)
router.post('/:id/feedback', authenticate, submitFeedback);

module.exports = router;
