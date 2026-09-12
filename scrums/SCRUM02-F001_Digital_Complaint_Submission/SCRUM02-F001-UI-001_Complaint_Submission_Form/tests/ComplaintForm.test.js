const { test, describe } = require('node:test');
const assert = require('node:assert');
const { validateComplaintForm, submitComplaint } = require('../src/ComplaintFormLogic');

describe('SCRUM02-F001-UI-001: Complaint Submission Form Acceptance Criteria', () => {
  // AC1: Given a logged-in user opens the complaint form, when they fill all required fields and submit, 
  // then the complaint is created and a confirmation with a tracking reference is shown.
  test('AC1: Successfully creates complaint and returns tracking reference when all required fields are filled', async () => {
    const validFormData = {
      category: 'Electrical',
      location: 'Science Block Lab 304',
      description: 'Ceiling fan regulator sparking and loose wires',
      photoUrls: ['https://assets.college.edu/sample.jpg'],
      submitterId: 'STU101'
    };

    const mockApi = {
      post: async (url, payload) => {
        assert.strictEqual(url, '/api/complaints');
        assert.strictEqual(payload.category, 'Electrical');
        return {
          status: 201,
          data: {
            referenceId: 'CMP-202609-1001',
            status: 'Open',
            ...payload
          }
        };
      }
    };

    const result = await submitComplaint(validFormData, mockApi);
    assert.strictEqual(result.success, true);
    assert.ok(result.referenceId.startsWith('CMP-'));
    assert.strictEqual(result.complaint.status, 'Open');
  });

  // AC2: Given a required field (e.g., category) is missing, when the user submits, 
  // then a validation message is shown and the complaint is not created.
  test('AC2: Fails validation and prevents submission when category is missing', async () => {
    const missingCategoryData = {
      category: '',
      location: 'Science Block Lab 304',
      description: 'Loose wires'
    };

    const validation = validateComplaintForm(missingCategoryData);
    assert.strictEqual(validation.isValid, false);
    assert.strictEqual(validation.errors.category, 'Category is required');

    let apiCalled = false;
    const mockApi = {
      post: async () => {
        apiCalled = true;
      }
    };

    const result = await submitComplaint(missingCategoryData, mockApi);
    assert.strictEqual(result.success, false);
    assert.strictEqual(apiCalled, false);
    assert.strictEqual(result.referenceId, null);
    assert.strictEqual(result.errors.category, 'Category is required');
  });

  test('AC2 (Additional): Rejects invalid file format (non JPG/PNG)', () => {
    const invalidFileData = {
      category: 'IT Support',
      location: 'Library',
      description: 'Printer offline',
      file: { type: 'application/pdf', name: 'document.pdf' }
    };
    const validation = validateComplaintForm(invalidFileData);
    assert.strictEqual(validation.isValid, false);
    assert.strictEqual(validation.errors.file, 'Only JPG and PNG images are supported');
  });
});
