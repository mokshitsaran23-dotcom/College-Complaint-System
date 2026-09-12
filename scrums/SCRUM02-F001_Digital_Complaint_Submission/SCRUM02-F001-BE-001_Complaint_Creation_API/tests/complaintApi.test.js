const { test, describe } = require('node:test');
const assert = require('node:assert');
const { ComplaintService, createComplaintHandler, JWT_SECRET, jwt } = require('../src/complaintController');

function createMockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };
  return res;
}

describe('SCRUM02-F001-BE-001: Complaint Creation API Acceptance Criteria', () => {
  // AC1: Given a valid complaint payload, when processed, then a record is created with status Open and a unique reference ID is returned.
  test('AC1: Processes valid complaint payload, returns HTTP 201 with status Open and reference ID', async () => {
    const service = new ComplaintService();
    const handler = createComplaintHandler(service);

    const validToken = jwt.sign({ collegeId: 'STU101', name: 'Jane Doe', role: 'student' }, JWT_SECRET);
    const req = {
      headers: {
        authorization: 'Bearer ' + validToken
      },
      body: {
        category: 'Electrical',
        location: 'Science Block Lab 304',
        description: 'Sparking switchboard with loose wires',
        photoUrls: ['https://assets.college.edu/sample.jpg']
      }
    };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.jsonData.success, true);
    assert.ok(res.jsonData.complaint.referenceId.startsWith('CMP-'));
    assert.strictEqual(res.jsonData.complaint.status, 'Open');
    assert.strictEqual(res.jsonData.complaint.category, 'Electrical');
    assert.strictEqual(res.jsonData.complaint.submitter.collegeId, 'STU101');
  });

  // AC2: Given an unauthenticated request, when processed, then it is rejected with HTTP 401.
  test('AC2: Rejects request with HTTP 401 when Authorization header is missing', async () => {
    const service = new ComplaintService();
    const handler = createComplaintHandler(service);

    const req = {
      headers: {},
      body: {
        category: 'Plumbing',
        location: 'Hostel A',
        description: 'Pipe leakage'
      }
    };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.error, /Unauthorized/);
  });

  test('AC2 (Invalid Token): Rejects request with HTTP 401 when token signature is invalid', async () => {
    const service = new ComplaintService();
    const handler = createComplaintHandler(service);

    const req = {
      headers: {
        authorization: 'Bearer invalid.token.value'
      },
      body: { category: 'IT', location: 'Lab 2', description: 'Network switch down' }
    };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 401);
  });
});
