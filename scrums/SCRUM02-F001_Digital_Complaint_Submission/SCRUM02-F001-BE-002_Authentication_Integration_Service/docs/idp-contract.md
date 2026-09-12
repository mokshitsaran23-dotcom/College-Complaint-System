# IdP Service Contract
- **Interface**: `IdentityProvider.verifyCredentials(collegeId, password)`
- **Output**: User object `{ id, collegeId, name, email, role, department }` or null
- **Token Output**: Signed JWT with standard claims.
