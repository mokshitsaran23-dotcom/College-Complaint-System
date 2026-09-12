const { test, describe } = require('node:test');
const assert = require('node:assert');
const { isFeedbackAvailable, submitFeedback } = require('../src/FeedbackFormLogic');

describe('SCRUM02-F004-UI-001: Post-Resolution Feedback Form Acceptance Criteria', () => {
  // AC1: Given complaint status is Resolved, when the submitter opens it, then a feedback form is available.
  test('AC1: Feedback form is available if complaint status is Resolved, unavailable otherwise', () => {
    assert.strictEqual(isFeedbackAvailable({ id: 'c1', status: 'Resolved' }), true);
    assert.strictEqual(isFeedbackAvailable({ id: 'c2', status: 'Open' }), false);
    assert.strictEqual(isFeedbackAvailable({ id: 'c3', status: 'In Progress' }), false);
  });

  // AC2: Given the submitter submits a rating, when processed, then feedback is saved and the form becomes read-only.
  test('AC2: Saves submitted rating and returns read-only state', async () => {
    const mockApi = {
      post: async (url, body) => {
        assert.strictEqual(url, '/api/complaints/cmp-101/feedback');
        assert.strictEqual(body.rating, 5);
        assert.strictEqual(body.comment, 'Excellent service');
        return {
          status: 201,
          data: {
            success: true,
            feedback: { complaintId: 'cmp-101', rating: 5, comment: 'Excellent service' }
          }
        };
      }
    };

    const result = await submitFeedback('cmp-101', 5, 'Excellent service', mockApi);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.isReadOnly, true);
    assert.strictEqual(result.feedback.rating, 5);
  });
});
