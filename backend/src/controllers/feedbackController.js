const store = require('../data/store');
const { Feedback, Complaint } = require('../models');
const { mongoose } = require('../config/db');

async function submitFeedback(req, res) {
  const user = req.user;
  const { id } = req.params;
  const { rating, comment } = req.body || {};

  // Find complaint in store or MongoDB
  let complaint = store.complaints.find(c => c.id === id || c.referenceId === id);

  if (!complaint && mongoose.connection.readyState === 1) {
    try {
      const dbComplaint = await Complaint.findOne({
        $or: [
          { referenceId: id },
          ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])
        ]
      });
      if (dbComplaint) {
        complaint = dbComplaint.toObject ? dbComplaint.toObject() : dbComplaint;
        if (!store.complaints.some(c => c.referenceId === complaint.referenceId)) {
          store.complaints.push(complaint);
        }
      }
    } catch (e) {
      console.warn('⚠️ [FeedbackController] Error fetching complaint from DB:', e.message);
    }
  }

  if (!complaint) {
    return res.status(404).json({ success: false, error: 'Complaint not found.' });
  }

  // Precondition: Complaint must be Resolved (case-insensitive check)
  const normStatus = (complaint.status || '').toUpperCase().replace(/\s+/g, '_');
  if (normStatus !== 'RESOLVED') {
    return res.status(400).json({
      success: false,
      error: 'Feedback can only be submitted for Resolved complaints.'
    });
  }

  // Submitter check: only original submitter (student or staff) may submit feedback
  const submitterCollegeId = (complaint.submitter?.collegeId || '').toUpperCase().trim();
  const submitterEmail = (complaint.submitter?.email || '').toLowerCase().trim();
  const currentCollegeId = (user.collegeId || user.staffId || '').toUpperCase().trim();
  const currentUserEmail = (user.email || '').toLowerCase().trim();

  const idMatches = submitterCollegeId && currentCollegeId && submitterCollegeId === currentCollegeId;
  const emailMatches = submitterEmail && currentUserEmail && submitterEmail === currentUserEmail;

  if (submitterCollegeId || submitterEmail) {
    if (!idMatches && !emailMatches) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Only the original submitter may review this complaint.'
      });
    }
  }

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    return res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5.' });
  }

  // Duplicate check
  const existing = store.feedbacks.find(
    f => f.complaintId === complaint.id || f.referenceId === complaint.referenceId
  );
  if (existing) {
    return res.status(409).json({
      success: false,
      error: 'Feedback has already been submitted for this complaint.'
    });
  }

  const feedbackDoc = {
    id: 'fb_' + (store.feedbacks.length + 1) + '_' + Date.now(),
    complaintId: complaint.id,
    referenceId: complaint.referenceId,
    submitterCollegeId: user.collegeId,
    submitterName: user.name || complaint.submitter?.name || 'Submitter',
    submitterRole: user.role,
    workerCollegeId: complaint.assignedWorker?.collegeId || null,
    workerName: complaint.assignedWorker?.name || null,
    assignedWorker: complaint.assignedWorker ? { ...complaint.assignedWorker } : null,
    department: complaint.assignedDepartment || null,
    rating: numRating,
    comment: (comment || '').trim(),
    submittedAt: new Date().toISOString()
  };

  // Save to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await Feedback.findOneAndUpdate(
        { referenceId: complaint.referenceId },
        feedbackDoc,
        { upsert: true, new: true }
      );
      await Complaint.findOneAndUpdate(
        { $or: [{ referenceId: complaint.referenceId }, ...(mongoose.isValidObjectId(complaint.id) ? [{ _id: complaint.id }] : [])] },
        { $set: { feedback: feedbackDoc } }
      );
    } catch (err) {
      console.warn('⚠️ [FeedbackController] MongoDB feedback save warning:', err.message);
    }
  }

  store.feedbacks.push(feedbackDoc);
  complaint.feedback = feedbackDoc;

  // Also update in store.complaints if complaint was cloned
  const storeC = store.complaints.find(c => c.id === complaint.id || c.referenceId === complaint.referenceId);
  if (storeC) {
    storeC.feedback = feedbackDoc;
  }

  return res.status(201).json({ success: true, feedback: feedbackDoc });
}

module.exports = { submitFeedback };
