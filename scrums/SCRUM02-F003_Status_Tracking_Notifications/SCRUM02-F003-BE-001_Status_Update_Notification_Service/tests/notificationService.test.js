const { test, describe } = require('node:test');
const assert = require('node:assert');
const { StatusUpdateNotificationService, MockSocketServer } = require('../src/notificationService');

describe('SCRUM02-F003-BE-001: Complaint Status Update & Notification Service Acceptance Criteria', () => {
  // AC1: Given a status change is saved, when processed, 
  // then a notification event is dispatched to the submitter and delivery is logged.
  test('AC1: Dispatches real-time notification to submitter and logs delivery confirmation', async () => {
    const socketMock = new MockSocketServer();
    const service = new StatusUpdateNotificationService(socketMock);

    const complaint = {
      id: 'cmp_100',
      referenceId: 'CMP-202609-100',
      status: 'Assigned',
      submitter: { collegeId: 'STU101', name: 'Jane Doe' }
    };
    const operator = { collegeId: 'STF201', name: 'Mike Sparks', role: 'staff' };

    const result = await service.processStatusUpdate(complaint, 'In Progress', operator, 'Technician dispatched');

    // Assert complaint status was updated
    assert.strictEqual(result.complaint.status, 'In Progress');

    // Assert Socket.io event dispatched to submitter room
    assert.strictEqual(socketMock.emittedEvents.length, 1);
    const dispatched = socketMock.emittedEvents[0];
    assert.strictEqual(dispatched.room, 'user_STU101');
    assert.strictEqual(dispatched.event, 'complaint:status_updated');
    assert.strictEqual(dispatched.payload.toStatus, 'In Progress');
    assert.strictEqual(dispatched.payload.fromStatus, 'Assigned');

    // Assert delivery log created
    assert.strictEqual(service.deliveryLogs.length, 1);
    const log = service.deliveryLogs[0];
    assert.strictEqual(log.recipientCollegeId, 'STU101');
    assert.strictEqual(log.status, 'DELIVERED');
    assert.ok(log.deliveredAt);
  });
});
