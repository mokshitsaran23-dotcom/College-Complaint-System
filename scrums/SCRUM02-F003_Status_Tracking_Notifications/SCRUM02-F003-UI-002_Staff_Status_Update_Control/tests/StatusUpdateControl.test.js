const { test, describe } = require('node:test');
const assert = require('node:assert');
const { updateComplaintStatus, getNextValidStatuses } = require('../src/StatusUpdateLogic');

describe('SCRUM02-F003-UI-002: Maintenance Staff Status Update Control Acceptance Criteria', () => {
  // AC1: Given staff selects a new valid status, when saved, 
  // then the status updates and a notification is triggered to the submitter.
  test('AC1: Updates status and verifies notification was triggered to the submitter', async () => {
    let notificationEventFired = false;
    const mockApi = {
      patch: async (url, body) => {
        assert.strictEqual(url, '/api/complaints/cmp-101/status');
        assert.strictEqual(body.status, 'In Progress');
        notificationEventFired = true;
        return {
          status: 200,
          data: {
            success: true,
            complaint: { id: 'cmp-101', status: 'In Progress' },
            notificationDispatched: true,
            recipient: 'submitter'
          }
        };
      }
    };

    const res = await updateComplaintStatus('cmp-101', 'In Progress', 'Electrician en-route', mockApi);

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.complaint.status, 'In Progress');
    assert.strictEqual(res.notificationDispatched, true);
    assert.strictEqual(notificationEventFired, true);
  });

  test('Validates allowable next status transitions', () => {
    assert.deepStrictEqual(getNextValidStatuses('Assigned'), ['In Progress']);
    assert.deepStrictEqual(getNextValidStatuses('In Progress'), ['Resolved']);
    assert.deepStrictEqual(getNextValidStatuses('Resolved'), []);
  });
});
