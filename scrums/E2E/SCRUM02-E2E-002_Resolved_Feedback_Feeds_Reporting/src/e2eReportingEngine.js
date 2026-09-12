class E2EReportingEngine {
  constructor() {
    this.complaints = [];
    this.feedbacks = [];
  }

  addComplaint(c) {
    this.complaints.push(c);
  }

  submitFeedback(complaintId, rating, comment) {
    const complaint = this.complaints.find(c => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    // Error path: feedback attempts on non-Resolved complaints are blocked
    if (complaint.status !== 'Resolved') {
      throw new Error('Feedback can only be submitted for Resolved complaints.');
    }

    const fb = {
      id: 'fb_' + (this.feedbacks.length + 1),
      complaintId,
      rating,
      comment,
      submittedAt: new Date().toISOString()
    };
    this.feedbacks.push(fb);
    complaint.feedback = fb;
    return fb;
  }

  getAdminReport() {
    const byCategory = {};
    let resolvedCount = 0;

    this.complaints.forEach(c => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      if (c.status === 'Resolved') resolvedCount++;
    });

    let averageRating = 0;
    if (this.feedbacks.length > 0) {
      const sum = this.feedbacks.reduce((acc, f) => acc + f.rating, 0);
      averageRating = Number((sum / this.feedbacks.length).toFixed(1));
    }

    return {
      totalComplaints: this.complaints.length,
      resolvedCount,
      byCategory,
      feedbacksCount: this.feedbacks.length,
      averageRating
    };
  }
}

module.exports = { E2EReportingEngine };
