# SCRUM02-F002-UI-002: Maintenance Staff Assigned-Complaints View

## Overview
Specialized portal view for campus maintenance staff (e.g. Electrical, Plumbing). Automatically scopes and filters the complaints list to show only tickets assigned to the logged-in technician's department.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Department Binding**: Staff identity contains assigned department (e.g. `staffUser.department = 'Electrical'`).
2. **Filtering**: Frontend and backend both enforce department scoping.
