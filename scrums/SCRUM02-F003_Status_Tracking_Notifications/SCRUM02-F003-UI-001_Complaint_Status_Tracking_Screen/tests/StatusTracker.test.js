const { test, describe } = require('node:test');
const assert = require('node:assert');
const { buildTimelineModel, loadComplaintDetails } = require('../src/StatusTrackerLogic');

describe('SCRUM02-F003-UI-001: Complaint Status Tracking Screen Acceptance Criteria', () => {
  // AC1: Given a submitter opens their complaint, when the page loads, 
  // then current status and a history timeline are displayed.
  test('AC1: Displays current status and history timeline when page loads', async () => {
    const mockComplaint = {
      referenceId: 'CMP-202609-1001',
      status: 'In Progress',
      category: 'Electrical',
      location: 'Science Block Lab 304'
    };

    const mockHistory = [
      { fromStatus: null, toStatus: 'Open', timestamp: '2026-09-12T08:00:00Z', note: 'Created' },
      { fromStatus: 'Open', toStatus: 'Assigned', timestamp: '2026-09-12T08:30:00Z', note: 'Assigned' },
      { fromStatus: 'Assigned', toStatus: 'In Progress', timestamp: '2026-09-12T09:15:00Z', note: 'Work started' }
    ];

    const mockApi = {
      get: async (url) => {
        assert.strictEqual(url, '/api/complaints/CMP-202609-1001');
        return {
          status: 200,
          data: { complaint: mockComplaint, history: mockHistory }
        };
      }
    };

    const result = await loadComplaintDetails('CMP-202609-1001', mockApi);

    // Assert current status displayed
    assert.strictEqual(result.currentStatus, 'In Progress');
    assert.strictEqual(result.referenceId, 'CMP-202609-1001');

    // Assert history timeline
    assert.strictEqual(result.historyEvents.length, 3);
    assert.strictEqual(result.historyEvents[2].toStatus, 'In Progress');
    assert.strictEqual(result.historyEvents[2].note, 'Work started');

    // Assert timeline step progress
    assert.strictEqual(result.timelineSteps[0].isCompleted, true); // Open
    assert.strictEqual(result.timelineSteps[1].isCompleted, true); // Assigned
    assert.strictEqual(result.timelineSteps[2].isCompleted, true); // In Progress
    assert.strictEqual(result.timelineSteps[3].isCompleted, false); // Resolved
  });
});
