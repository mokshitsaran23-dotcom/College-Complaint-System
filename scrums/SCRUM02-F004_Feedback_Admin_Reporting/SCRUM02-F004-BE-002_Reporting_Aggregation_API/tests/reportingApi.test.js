const { test, describe } = require('node:test');
const assert = require('node:assert');
const { aggregateComplaints, createReportingHandler } = require('../src/reportingController');

function createMockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.jsonData = data; return this; }
  };
  return res;
}

describe('SCRUM02-F004-BE-002: Reporting Aggregation API Acceptance Criteria', () => {
  // AC1: Given a report request with a date range, when processed, 
  // then aggregated statistics for that range are returned.
  test('AC1: Returns aggregated statistics filtered by given date range', async () => {
    const complaints = [
      { id: '1', category: 'Electrical', location: 'Science Block', status: 'Resolved', createdAt: '2026-09-05T10:00:00Z' },
      { id: '2', category: 'Electrical', location: 'Science Block', status: 'Resolved', createdAt: '2026-09-10T10:00:00Z' },
      { id: '3', category: 'Plumbing', location: 'Hostel A', status: 'Open', createdAt: '2026-09-11T10:00:00Z' },
      { id: '4', category: 'IT', location: 'Library', status: 'Open', createdAt: '2026-08-15T10:00:00Z' } // outside Sept range
    ];
    const feedbacks = [
      { complaintId: '1', rating: 5 },
      { complaintId: '2', rating: 4 }
    ];

    const handler = createReportingHandler(complaints, feedbacks);

    const req = {
      query: { startDate: '2026-09-01T00:00:00Z', endDate: '2026-09-30T23:59:59Z' }
    };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    const s = res.jsonData.summary;

    assert.strictEqual(s.totalComplaints, 3); // excluding August
    assert.strictEqual(s.byCategory['Electrical'], 2);
    assert.strictEqual(s.byCategory['Plumbing'], 1);
    assert.strictEqual(s.resolvedCount, 2);
    assert.strictEqual(s.averageRating, 4.5);
    assert.strictEqual(s.byLocation[0].location, 'Science Block');
    assert.strictEqual(s.byLocation[0].count, 2);
  });
});
