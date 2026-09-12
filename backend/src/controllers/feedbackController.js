const store = require('../data/store');

async function submitFeedback(req, res) {
  const user = req.user;
  const { id } = req.params;
  const { rating, comment } = req.body || {};

  const complaint = store.complaints.find(c => c.id === id || c.referenceId === id);
  if (!complaint) {
    return res.status(404).json({ success: false, error: 'Complaint not found.' });
  }

  // Precondition: Complaint must be Resolved
  if (complaint.status !== 'Resolved') {
    return res.status(400).json({
      success: false,
      error: 'Feedback can only be submitted for Resolved complaints.'
    });
  }

  // Submitter check
  if (user.role === 'student' && complaint.submitter.collegeId !== user.collegeId) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Only the original submitter may review this complaint.'
    });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5.' });
  }

  // Duplicate check
  const existing = store.feedbacks.find(f => f.complaintId === complaint.id || f.referenceId === complaint.referenceId);
  if (existing) {
    return res.status(409).json({ success: false, error: 'Feedback has already been submitted for this complaint.' });
  }

  const feedbackDoc = {
    id: 'fb_' + (store.feedbacks.length + 1),
    complaintId: complaint.id,
    referenceId: complaint.referenceId,
    submitterCollegeId: user.collegeId,
    rating,
    comment: comment || '',
    submittedAt: new Date().toISOString()
  };

  store.feedbacks.push(feedbackDoc);
  complaint.feedback = feedbackDoc;

  return res.status(201).json({ success: true, feedback: feedbackDoc });
}

module.exports = { submitFeedback };
