# SCRUM02-F002-BE-001: Complaint Assignment API

## Overview
Express REST endpoint `PATCH /api/complaints/:id/assign` allowing administrators to route complaints to maintenance departments. Updates ticket status to `Assigned`, records department ownership, and stamps assignment timestamp.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Admin Authorization**: Enforces role verification (`user.role === 'admin'`).
2. **Reassignment**: Idempotent PATCH allows reassigning an already assigned ticket if department was misclassified.
