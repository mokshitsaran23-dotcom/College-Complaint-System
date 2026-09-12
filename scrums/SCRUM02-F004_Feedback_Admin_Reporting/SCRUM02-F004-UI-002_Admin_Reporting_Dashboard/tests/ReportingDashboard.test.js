const { test, describe } = require('node:test');
const assert = require('node:assert');
const { fetchReportSummary } = require('../src/ReportingDashboardLogic');

describe('SCRUM02-F004-UI-002: Admin Reporting Dashboard Acceptance Criteria', () => {
  // AC1: Given an admin opens the dashboard, when it loads, then summary charts/tables of complaint data are displayed.
  test('AC1: Loads summary charts and tables of aggregated complaint metrics', async () => {
    const mockApi = {
      get: async (url) => {
        assert.strictEqual(url, '/api/reports/summary');
        return {
          status: 200,
          data: {
            summary: {
              totalComplaints: 25,
              resolvedCount: 20,
              pendingCount: 5,
              averageRating: 4.8,
              byCategory: { 'Electrical': 15, 'Plumbing': 10 },
              byLocation: [{ location: 'Science Block', count: 12 }]
            }
          }
        };
      }
    };

    const summary = await fetchReportSummary({}, mockApi);

    // Verify presence of summary metrics
    assert.strictEqual(summary.totalComplaints, 25);
    assert.strictEqual(summary.resolvedCount, 20);
    assert.strictEqual(summary.averageRating, 4.8);
    assert.strictEqual(summary.byCategory['Electrical'], 15);
    assert.strictEqual(summary.byLocation[0].location, 'Science Block');
  });
});
