const { test, describe } = require('node:test');
const assert = require('node:assert');
const idpService = require('../src/services/idpService');
const { sign, verify } = require('../src/config/jwt');
const store = require('../src/data/store');

describe('Backend Core Services & Logic Tests', () => {
  test('IdP Service validates correct credentials and rejects incorrect ones', async () => {
    const student = await idpService.authenticate('STU101', 'student123');
    assert.ok(student);
    assert.strictEqual(student.collegeId, 'STU101');
    assert.strictEqual(student.role, 'student');

    const invalid = await idpService.authenticate('STU101', 'wrongpass');
    assert.strictEqual(invalid, null);
  });

  test('JWT Config correctly signs and verifies tokens', () => {
    const payload = { collegeId: 'ADM001', role: 'admin' };
    const token = sign(payload);
    assert.ok(token);

    const decoded = verify(token);
    assert.strictEqual(decoded.collegeId, 'ADM001');
    assert.strictEqual(decoded.role, 'admin');
  });

  test('DataStore contains initialized sample complaints across categories', () => {
    assert.ok(store.complaints.length >= 4);
    assert.ok(store.complaints.some(c => c.status === 'Resolved'));
    assert.ok(store.complaints.some(c => c.status === 'Open'));
    assert.ok(store.statusHistory.length >= 4);
    assert.ok(store.feedbacks.length >= 1);
  });

  test('IdP authenticates worker WRK301 with role worker', async () => {
    const worker = await idpService.authenticate('WRK301', 'worker123');
    assert.ok(worker);
    assert.strictEqual(worker.collegeId, 'WRK301');
    assert.strictEqual(worker.role, 'worker');
    assert.strictEqual(worker.department, 'Electrical');
  });
});
