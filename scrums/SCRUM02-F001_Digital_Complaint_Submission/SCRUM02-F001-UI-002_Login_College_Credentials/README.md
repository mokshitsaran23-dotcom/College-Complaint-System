# SCRUM02-F001-UI-002: Login Using College Credentials

## Overview
Provides institutional login interface for students, maintenance staff, and facility administrators. Integrates with the backend authentication service (`SCRUM02-F001-BE-002`), securely stores the JWT token upon verification, and routes the authenticated user to their role-specific dashboard.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Credentials Format**: College ID (`STU*`, `STF*`, `ADM*`) paired with institutional password.
2. **Session Persistence**: JWT stored in localStorage and Authorization header injected.
3. **Role Routing**: Automatically redirects Students to `/student`, Staff to `/staff`, and Admins to `/admin`.
