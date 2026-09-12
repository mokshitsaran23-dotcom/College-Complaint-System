/**
 * Logic for Post-Resolution Feedback Form (SCRUM02-F004-UI-001)
 */
function isFeedbackAvailable(complaint) {
  return Boolean(complaint && complaint.status === 'Resolved');
}

async function submitFeedback(complaintId, rating, comment, apiService = null) {
  if (!rating || rating < 1 || rating > 5) {
    return { success: false, error: 'Rating must be between 1 and 5' };
  }

  const api = apiService || {
    post: async (url, data) => ({
      status: 201,
      data: {
        success: true,
        feedback: { complaintId, rating, comment, submittedAt: new Date().toISOString() }
      }
    })
  };

  const response = await api.post('/api/complaints/' + complaintId + '/feedback', { rating, comment });
  return {
    success: true,
    feedback: response.data.feedback,
    isReadOnly: true
  };
}

module.exports = { isFeedbackAvailable, submitFeedback };
