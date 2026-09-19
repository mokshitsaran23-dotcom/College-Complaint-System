const { test, describe } = require('node:test');
const assert = require('node:assert');
const { FeedbackStore } = require('../src/FeedbackStore');

describe('SCRUM02-F004-DB-001: Feedback Data Store Acceptance Criteria', () => {
  // AC1: Given feedback is saved, when queried, then it is retrievable linked to the correct complaint.
  test('AC1: Saves feedback and accurately retrieves it linked to the designated complaint', async () => {
    const store = new FeedbackStore();

    const entry = {
      complaintId: 'cmp_1001',
      rating: 5,
      comment: 'Very professional electrician. Fixed within 15 minutes.'
    };

    const saved = await store.save(entry);
    assert.ok(saved);

    const retrieved = await store.findByComplaintId('cmp_1001');
    assert.strictEqual(retrieved.complaintId, 'cmp_1001');
    assert.strictEqual(retrieved.rating, 5);
    assert.strictEqual(retrieved.comment, entry.comment);
    assert.ok(retrieved.submittedAt);
  });
});
