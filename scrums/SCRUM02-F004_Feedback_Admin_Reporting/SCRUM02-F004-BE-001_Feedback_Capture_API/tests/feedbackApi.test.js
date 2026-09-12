const { test, describe } = require('node:test');
const assert = require('node:assert');
const { createFeedbackHandler } = require('../src/feedbackController');

function createMockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.jsonData = data; return this; }
  };
  return res;
}

describe('SCRUM02-F004-BE-001: Feedback Capture API Acceptance Criteria', () => {
  // AC1: Given feedback is submitted for a Resolved complaint, when processed, 
  // then it is stored and linked to the complaint record.
  test('AC1: Stores feedback and links to complaint when complaint is Resolved', async () => {
    const complaintsDb = [
      { id: 'cmp_1', referenceId: 'CMP-001', status: 'Resolved' }
    ];
    const feedbackDb = [];
    const handler = createFeedbackHandler(complaintsDb, feedbackDb);

    const req = {
      params: { id: 'cmp_1' },
      body: { rating: 5, comment: 'Fixed flawlessly' }
    };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.feedback.complaintId, 'cmp_1');
    assert.strictEqual(res.jsonData.feedback.rating, 5);
    assert.strictEqual(feedbackDb.length, 1);
    assert.strictEqual(complaintsDb[0].feedback.rating, 5);
  });

  // AC2: Given feedback is submitted for a non-Resolved complaint, when processed, 
  // then the request is rejected.
  test('AC2: Rejects feedback submission with HTTP 400 when complaint is Open or In Progress', async () => {
    const complaintsDb = [
      { id: 'cmp_2', referenceId: 'CMP-002', status: 'In Progress' }
    ];
    const feedbackDb = [];
    const handler = createFeedbackHandler(complaintsDb, feedbackDb);

    const req = {
      params: { id: 'cmp_2' },
      body: { rating: 4, comment: 'Nice work so far' }
    };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.error, /Resolved/);
    assert.strictEqual(feedbackDb.length, 0);
  });
});
