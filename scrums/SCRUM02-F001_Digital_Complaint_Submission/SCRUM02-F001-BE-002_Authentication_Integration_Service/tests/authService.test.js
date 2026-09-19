const { test, describe } = require('node:test');
const assert = require('node:assert');
const { AuthService, CollegeIdentityProvider, JWT_SECRET, jwt } = require('../src/authService');

describe('SCRUM02-F001-BE-002: Authentication Integration Service Acceptance Criteria', () => {
  // AC1: Given valid credentials, when verified against the identity source, then a session/token (JWT) is issued.
  test('AC1: Issues valid signed JWT session token upon verifying valid credentials with identity source', async () => {
    const idp = new CollegeIdentityProvider();
    const service = new AuthService(idp);

    const result = await service.login('STU101', 'student123');

    assert.ok(result.token);
    assert.strictEqual(result.user.collegeId, 'STU101');
    assert.strictEqual(result.user.role, 'student');

    // Verify token validity and claims
    const decoded = jwt.verify(result.token, JWT_SECRET);
    assert.strictEqual(decoded.collegeId, 'STU101');
    assert.strictEqual(decoded.role, 'student');
  });

  test('Fails to issue token when credentials do not match identity source', async () => {
    const idp = new CollegeIdentityProvider();
    const service = new AuthService(idp);

    await assert.rejects(
      async () => service.login('STU101', 'wrongpassword'),
      /Invalid college credentials/
    );
  });
});
