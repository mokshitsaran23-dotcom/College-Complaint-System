# SCRUM02-F001-DB-001: Complaint Data Store

## Overview
Defines the Mongoose database schema and persistence layer for complaints. Stores reference ID, category, description, photo references, location, status lifecycle, and submitter metadata.

## Standalone Setup & Testing
```bash
npm install
npm test
```

## Assumptions Made
1. **Photo Storage**: URLs / file references stored (e.g. `https://cdn.college.edu/...`), avoiding binary blob overhead in MongoDB.
2. **Indexing**: Unique index on `referenceId`, compound index on `status` + `createdAt`.
