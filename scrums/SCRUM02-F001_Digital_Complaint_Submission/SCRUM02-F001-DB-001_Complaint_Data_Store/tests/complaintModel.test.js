const { test, describe } = require('node:test');
const assert = require('node:assert');
const { InMemoryComplaintStore } = require('../src/ComplaintSchema');

describe('SCRUM02-F001-DB-001: Complaint Data Store Acceptance Criteria', () => {
  // AC1: Given a complaint is created, when saved, then all submitted fields are retrievable exactly as entered.
  test('AC1: Persists and accurately retrieves all submitted fields exactly as entered', async () => {
    const store = new InMemoryComplaintStore();
    const payload = {
      referenceId: 'CMP-202609-9901',
      category: 'Electrical',
      description: 'Burned out bulb in lecture hall A',
      location: 'Academic Block 1, Room 101',
      photoUrls: ['https://cdn.college.edu/photos/bulb-101.jpg'],
      status: 'Open',
      submitter: {
        collegeId: 'STU101',
        name: 'Jane Doe',
        email: 'jane.doe@college.edu'
      },
      assignedDepartment: null
    };

    const saved = await store.save(payload);
    assert.ok(saved);

    const retrieved = await store.findByReferenceId('CMP-202609-9901');
    assert.strictEqual(retrieved.referenceId, payload.referenceId);
    assert.strictEqual(retrieved.category, payload.category);
    assert.strictEqual(retrieved.description, payload.description);
    assert.strictEqual(retrieved.location, payload.location);
    assert.deepStrictEqual(retrieved.photoUrls, payload.photoUrls);
    assert.strictEqual(retrieved.status, 'Open');
    assert.strictEqual(retrieved.submitter.collegeId, payload.submitter.collegeId);
    assert.strictEqual(retrieved.submitter.name, payload.submitter.name);
    assert.strictEqual(retrieved.assignedDepartment, null);
  });
});
