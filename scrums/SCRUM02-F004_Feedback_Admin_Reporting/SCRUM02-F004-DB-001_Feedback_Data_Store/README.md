# SCRUM02-F004-DB-001: Feedback Data Store

## Overview
Mongoose schema and persistence module for submitter feedback. Enforces 1:1 linkage to resolved complaints, rating boundary validations (1-5), and submission timestamps.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Unique Index**: Enforces a unique index on `complaintId` preventing duplicate feedback submissions.
