# SCRUM02-F003-DB-001: Complaint Status History Table

## Overview
Append-only immutable audit log table in MongoDB. Every state transition appends a new record storing from-status, to-status, modifier ID/role, operational notes, and exact timestamp.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Append-Only**: Records are never updated or deleted; provides audit integrity.
