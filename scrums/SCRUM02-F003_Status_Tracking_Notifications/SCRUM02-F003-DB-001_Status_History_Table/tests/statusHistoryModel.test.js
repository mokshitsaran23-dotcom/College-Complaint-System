const { test, describe } = require('node:test');
const assert = require('node:assert');
const { StatusHistoryStore } = require('../src/StatusHistoryStore');

describe('SCRUM02-F003-DB-001: Complaint Status History Table Acceptance Criteria', () => {
  // AC1: Given a status change occurs, when saved, 
  // then a new history row is appended without overwriting prior history.
  test('AC1: Appends new status history rows sequentially preserving all prior history', async () => {
    const store = new StatusHistoryStore();

    // 1st transition: Submission
    await store.append({
      complaintId: 'cmp_100',
      fromStatus: null,
      toStatus: 'Open',
      changedBy: 'STU101',
      changedByRole: 'student',
      note: 'Complaint filed'
    });

    // 2nd transition: Assignment
    await store.append({
      complaintId: 'cmp_100',
      fromStatus: 'Open',
      toStatus: 'Assigned',
      changedBy: 'ADM001',
      changedByRole: 'admin',
      note: 'Assigned to Electrical Dept'
    });

    // 3rd transition: In Progress
    await store.append({
      complaintId: 'cmp_100',
      fromStatus: 'Assigned',
      toStatus: 'In Progress',
      changedBy: 'STF201',
      changedByRole: 'staff',
      note: 'Starting repair work'
    });

    const timeline = await store.getTimeline('cmp_100');

    // Verify all 3 rows exist and none were overwritten
    assert.strictEqual(timeline.length, 3);
    assert.strictEqual(timeline[0].toStatus, 'Open');
    assert.strictEqual(timeline[1].toStatus, 'Assigned');
    assert.strictEqual(timeline[2].toStatus, 'In Progress');
    assert.strictEqual(timeline[0].changedBy, 'STU101');
    assert.strictEqual(timeline[1].changedBy, 'ADM001');
    assert.strictEqual(timeline[2].changedBy, 'STF201');
  });
});
