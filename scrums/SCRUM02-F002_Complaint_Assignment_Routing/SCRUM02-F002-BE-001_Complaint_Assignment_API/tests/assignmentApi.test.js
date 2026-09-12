const { test, describe } = require('node:test');
const assert = require('node:assert');
const { createAssignmentHandler } = require('../src/assignmentController');

function createMockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.jsonData = data; return this; }
  };
  return res;
}

describe('SCRUM02-F002-BE-001: Complaint Assignment API Acceptance Criteria', () => {
  // AC1: Given a valid assignment request, when processed, then complaint status becomes Assigned and the owning department is recorded.
  test('AC1: Updates complaint status to Assigned and records owning department', async () => {
    const db = [
      { id: 'cmp_100', referenceId: 'CMP-202609-100', status: 'Open', assignedDepartment: null }
    ];
    const handler = createAssignmentHandler(db);

    const req = {
      params: { id: 'cmp_100' },
      user: { collegeId: 'ADM001', role: 'admin' },
      body: { department: 'Electrical' }
    };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.complaint.status, 'Assigned');
    assert.strictEqual(res.jsonData.complaint.assignedDepartment, 'Electrical');
    assert.ok(res.jsonData.complaint.assignedAt);
  });

  test('Rejects assignment if non-admin attempts to assign', async () => {
    const db = [{ id: 'cmp_100', status: 'Open' }];
    const handler = createAssignmentHandler(db);

    const req = {
      params: { id: 'cmp_100' },
      user: { collegeId: 'STU101', role: 'student' },
      body: { department: 'Electrical' }
    };
    const res = createMockRes();

    await handler(req, res);
    assert.strictEqual(res.statusCode, 403);
  });
});
