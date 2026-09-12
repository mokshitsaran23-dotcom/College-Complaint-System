const { test, describe } = require('node:test');
const assert = require('node:assert');
const { validateAssignment, assignDepartment } = require('../src/AdminQueueLogic');

describe('SCRUM02-F002-UI-001: Admin Complaint Queue Acceptance Criteria', () => {
  // AC1: Given an admin selects a complaint and a department, when they assign it, 
  // then the complaint is marked Assigned and linked to that department.
  test('AC1: Successfully marks complaint Assigned and links chosen department', async () => {
    const mockApi = {
      patch: async (url, data) => {
        assert.strictEqual(url, '/api/complaints/cmp-101/assign');
        assert.strictEqual(data.department, 'Electrical');
        return {
          status: 200,
          data: {
            id: 'cmp-101',
            referenceId: 'CMP-202609-1001',
            status: 'Assigned',
            assignedDepartment: 'Electrical',
            assignedAt: '2026-09-12T10:30:00.000Z'
          }
        };
      }
    };

    const res = await assignDepartment('cmp-101', 'Electrical', mockApi);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.complaint.status, 'Assigned');
    assert.strictEqual(res.complaint.assignedDepartment, 'Electrical');
  });

  // AC2: Given no department is selected, when assignment is attempted, 
  // then a validation message is shown.
  test('AC2: Prevents assignment and triggers validation error when no department is selected', async () => {
    const validation = validateAssignment('cmp-101', '');
    assert.strictEqual(validation.isValid, false);
    assert.strictEqual(validation.error, 'Please select a maintenance department');

    let apiInvoked = false;
    const mockApi = { patch: async () => { apiInvoked = true; } };

    const res = await assignDepartment('cmp-101', '', mockApi);
    assert.strictEqual(res.success, false);
    assert.strictEqual(apiInvoked, false);
    assert.strictEqual(res.error, 'Please select a maintenance department');
  });
});
