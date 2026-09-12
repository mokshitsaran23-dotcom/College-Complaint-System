const { test, describe } = require('node:test');
const assert = require('node:assert');
const { filterComplaintsForStaff } = require('../src/StaffQueueLogic');

describe('SCRUM02-F002-UI-002: Maintenance Staff Assigned-Complaints View Acceptance Criteria', () => {
  // AC1: Given a staff member logs in, when they open their queue, 
  // then only complaints assigned to their department are shown.
  test('AC1: Shows exclusively complaints assigned to the logged-in staff member department', () => {
    const electricalStaff = { collegeId: 'STF201', name: 'Mike Sparks', role: 'staff', department: 'Electrical' };
    
    const mockComplaints = [
      { id: '1', referenceId: 'CMP-01', assignedDepartment: 'Electrical', category: 'Electrical', location: 'Lab 304' },
      { id: '2', referenceId: 'CMP-02', assignedDepartment: 'Plumbing', category: 'Plumbing', location: 'Hostel B' },
      { id: '3', referenceId: 'CMP-03', assignedDepartment: 'Electrical', category: 'Electrical', location: 'Hostel A' },
      { id: '4', referenceId: 'CMP-04', assignedDepartment: 'IT Support', category: 'IT', location: 'Library' }
    ];

    const filtered = filterComplaintsForStaff(mockComplaints, electricalStaff);

    assert.strictEqual(filtered.length, 2);
    assert.strictEqual(filtered[0].assignedDepartment, 'Electrical');
    assert.strictEqual(filtered[1].assignedDepartment, 'Electrical');
    assert.strictEqual(filtered.some(c => c.assignedDepartment === 'Plumbing'), false);
    assert.strictEqual(filtered.some(c => c.assignedDepartment === 'IT Support'), false);
  });

  test('Returns empty queue if user has no assigned department', () => {
    const invalidStaff = { collegeId: 'STF999', name: 'No Dept', role: 'staff', department: null };
    const mockComplaints = [{ id: '1', assignedDepartment: 'Electrical' }];
    const filtered = filterComplaintsForStaff(mockComplaints, invalidStaff);
    assert.strictEqual(filtered.length, 0);
  });
});
