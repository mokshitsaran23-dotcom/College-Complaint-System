function createFeedbackHandler(complaintsDb, feedbackDb = []) {
  return async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body || {};

    const complaint = complaintsDb.find(c => c.id === id || c.referenceId === id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    // AC2: Non-Resolved complaint rejection
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        error: 'Feedback can only be submitted for Resolved complaints.'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5.' });
    }

    // Check duplicate
    const existing = feedbackDb.find(f => f.complaintId === complaint.id);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Feedback already submitted for this complaint.' });
    }

    // AC1: Save feedback linked to complaint
    const record = {
      id: 'fb_' + (feedbackDb.length + 1),
      complaintId: complaint.id,
      referenceId: complaint.referenceId,
      rating,
      comment: comment || '',
      submittedAt: new Date().toISOString()
    };
    feedbackDb.push(record);
    complaint.feedback = record;

    return res.status(201).json({ success: true, feedback: record });
  };
}

module.exports = { createFeedbackHandler };
