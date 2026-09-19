const { test, describe } = require('node:test');
const assert = require('node:assert');
const { E2EReportingEngine } = require('../src/e2eReportingEngine');

describe('SCRUM02-E2E-002: Resolved Complaint Feeds Reporting Acceptance Criteria', () => {
  // AC1: Given a complaint is Resolved and feedback is submitted, when the admin opens the reporting dashboard, 
  // then the complaint and its feedback are reflected in the relevant aggregated counts.
  test('AC1: Reflects newly resolved complaint and its 5-star feedback in aggregated admin reporting', () => {
    const engine = new E2EReportingEngine();

    // Setup base state
    engine.addComplaint({ id: 'c1', category: 'Plumbing', status: 'Resolved' });
    engine.submitFeedback('c1', 4, 'Good job');

    const initialReport = engine.getAdminReport();
    assert.strictEqual(initialReport.totalComplaints, 1);
    assert.strictEqual(initialReport.averageRating, 4.0);

    // Resolve a new Electrical complaint and submit 5-star rating
    engine.addComplaint({ id: 'c2', category: 'Electrical', status: 'Resolved' });
    engine.submitFeedback('c2', 5, 'Exceptional electrical repair');

    // Admin opens reporting dashboard
    const updatedReport = engine.getAdminReport();

    // Verify aggregated metrics updated
    assert.strictEqual(updatedReport.totalComplaints, 2);
    assert.strictEqual(updatedReport.resolvedCount, 2);
    assert.strictEqual(updatedReport.byCategory['Electrical'], 1);
    assert.strictEqual(updatedReport.byCategory['Plumbing'], 1);
    assert.strictEqual(updatedReport.feedbacksCount, 2);
    assert.strictEqual(updatedReport.averageRating, 4.5); // (4 + 5) / 2
  });

  // Error path: feedback attempts on non-Resolved complaints are blocked with a clear message.
  test('Error Path: Blocks feedback submission on an Open or In Progress complaint with clear message', () => {
    const engine = new E2EReportingEngine();
    engine.addComplaint({ id: 'c_open', category: 'IT', status: 'Open' });
    engine.addComplaint({ id: 'c_progress', category: 'IT', status: 'In Progress' });

    assert.throws(
      () => engine.submitFeedback('c_open', 5, 'Trying to submit early'),
      /Feedback can only be submitted for Resolved complaints/
    );

    assert.throws(
      () => engine.submitFeedback('c_progress', 5, 'Trying to submit early'),
      /Feedback can only be submitted for Resolved complaints/
    );
  });
});
