# SCRUM02-F001-BE-002: Authentication Integration Service

## Overview
Connects to institutional identity provider (LDAP / SSO adapter) to verify student and staff credentials, issuing standard JWT tokens with identity claims and role assignments.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Stubbed IdP Provider**: Implements `CollegeIdentityProvider` adapter with built-in directory mocks for Student, Staff (Electrical, Plumbing, IT), and Admin accounts.
2. **Token TTL**: 8 hours default expiry.
