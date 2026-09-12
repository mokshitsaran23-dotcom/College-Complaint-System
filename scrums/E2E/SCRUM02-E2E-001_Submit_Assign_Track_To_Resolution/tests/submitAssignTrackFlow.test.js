const { test, describe } = require('node:test');
const assert = require('node:assert');
const { E2EFlowEngine } = require('../src/e2eFlowEngine');

describe('SCRUM02-E2E-001: Student Submits -> Admin Assigns -> Tracked to Resolution Acceptance Criteria', () => {
  // AC1: Given a student submits a valid complaint, when an admin assigns it and staff progress it to Resolved, 
  // then the student sees each status change reflected and receives notifications throughout.
  test('AC1: Full happy path: Student submits -> Admin assigns -> Staff progresses to Resolved with notifications', async () => {
    const engine = new E2EFlowEngine();
    const student = { collegeId: 'STU101', role: 'student' };
    const admin = { collegeId: 'ADM001', role: 'admin' };
    const staff = { collegeId: 'STF201', role: 'staff', department: 'Electrical' };

    // Step 1: Student submits complaint
    const complaint = await engine.submitComplaint(student, {
      category: 'Electrical',
      location: 'Science Block Lab 304',
      description: 'Switchboard sparking violently',
      photoUrls: ['https://cdn.college.edu/switchboard.jpg']
    });

    assert.ok(complaint.id);
    assert.strictEqual(complaint.status, 'Open');
    assert.strictEqual(complaint.assignedDepartment, null);

    // Step 2: Admin assigns complaint to Electrical department
    const assignedComplaint = await engine.assignDepartment(admin, complaint.id, 'Electrical');
    assert.strictEqual(assignedComplaint.status, 'Assigned');
    assert.strictEqual(assignedComplaint.assignedDepartment, 'Electrical');

    // Verify student received notification
    assert.strictEqual(engine.notificationsReceivedBySubmitter.length, 1);
    assert.strictEqual(engine.notificationsReceivedBySubmitter[0].status, 'Assigned');

    // Step 3: Maintenance staff moves complaint to In Progress
    const inProgressComplaint = await engine.updateStatus(staff, complaint.id, 'In Progress', 'Technician on-site');
    assert.strictEqual(inProgressComplaint.status, 'In Progress');
    assert.strictEqual(engine.notificationsReceivedBySubmitter.length, 2);
    assert.strictEqual(engine.notificationsReceivedBySubmitter[1].status, 'In Progress');

    // Step 4: Maintenance staff moves complaint to Resolved
    const resolvedComplaint = await engine.updateStatus(staff, complaint.id, 'Resolved', 'Burnt relay replaced');
    assert.strictEqual(resolvedComplaint.status, 'Resolved');
    assert.ok(resolvedComplaint.resolvedAt);
    assert.strictEqual(engine.notificationsReceivedBySubmitter.length, 3);
    assert.strictEqual(engine.notificationsReceivedBySubmitter[2].status, 'Resolved');

    // Verify chronological audit history length (Open -> Assigned -> In Progress -> Resolved)
    const history = engine.statusHistory.filter(h => h.complaintId === complaint.id);
    assert.strictEqual(history.length, 4);
  });

  // Error Path: if assignment or status update fails, the complaint remains in its last valid state and an error is surfaced
  test('Error Path: Complaint remains in last valid state when invalid status transition is attempted', async () => {
    const engine = new E2EFlowEngine();
    const student = { collegeId: 'STU101', role: 'student' };
    const staff = { collegeId: 'STF201', role: 'staff', department: 'Electrical' };

    const complaint = await engine.submitComplaint(student, {
      category: 'Electrical',
      location: 'Lab 304',
      description: 'Wires loose'
    });

    // Attempt illegal transition: Open -> Resolved directly without Assignment
    await assert.rejects(
      async () => engine.updateStatus(staff, complaint.id, 'Resolved'),
      /Invalid status transition/
    );

    // Verify state remained unchanged at 'Open'
    assert.strictEqual(complaint.status, 'Open');
  });
});
