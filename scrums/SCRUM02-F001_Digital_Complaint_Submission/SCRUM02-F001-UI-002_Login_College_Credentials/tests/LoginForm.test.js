const { test, describe } = require('node:test');
const assert = require('node:assert');
const { authenticateUser } = require('../src/LoginLogic');

describe('SCRUM02-F001-UI-002: Login Using College Credentials Acceptance Criteria', () => {
  // AC1: Given valid credentials, when submitted, then the user is authenticated and redirected to the complaint dashboard.
  test('AC1: Authenticates user and returns redirect URL when valid credentials are submitted', async () => {
    const mockAuthService = {
      login: async (id, pwd) => {
        assert.strictEqual(id, 'STU101');
        assert.strictEqual(pwd, 'student123');
        return {
          status: 200,
          data: {
            token: 'valid-jwt-token-12345',
            user: { collegeId: 'STU101', name: 'Jane Doe', role: 'student' }
          }
        };
      }
    };

    const res = await authenticateUser('STU101', 'student123', mockAuthService);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.token, 'valid-jwt-token-12345');
    assert.strictEqual(res.user.role, 'student');
    assert.strictEqual(res.redirectUrl, '/student/dashboard');
  });

  // AC2: Given invalid credentials, when submitted, then an error is shown and access is denied.
  test('AC2: Rejects authentication and surfaces error message on invalid credentials', async () => {
    const mockAuthService = {
      login: async () => {
        throw { status: 401, error: 'Invalid college credentials. Access denied.' };
      }
    };

    const res = await authenticateUser('STU101', 'wrong-pass', mockAuthService);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Invalid college credentials. Access denied.');
    assert.strictEqual(res.token, undefined);
  });
});
