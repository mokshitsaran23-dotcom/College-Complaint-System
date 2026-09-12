class FeedbackStore {
  constructor() {
    this.store = new Map();
  }

  async save(feedbackDoc) {
    if (!feedbackDoc.complaintId) throw new Error('complaintId is required');
    if (!feedbackDoc.rating || feedbackDoc.rating < 1 || feedbackDoc.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    if (this.store.has(feedbackDoc.complaintId)) {
      throw new Error('Feedback already exists for this complaint');
    }

    const doc = {
      id: 'fb_' + (this.store.size + 1),
      complaintId: feedbackDoc.complaintId,
      rating: feedbackDoc.rating,
      comment: feedbackDoc.comment || '',
      submittedAt: feedbackDoc.submittedAt || new Date().toISOString()
    };
    this.store.set(feedbackDoc.complaintId, doc);
    return doc;
  }

  async findByComplaintId(complaintId) {
    return this.store.get(complaintId) || null;
  }
}

module.exports = { FeedbackStore };
