# SCRUM02-F004-BE-001: Feedback Capture API

## Overview
Express endpoint `POST /api/complaints/:id/feedback`. Stores satisfaction rating (1-5) and comments linked to the complaint. Strictly rejects feedback attempts on non-Resolved complaints with HTTP 400.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Precondition**: Requires complaint status to be strictly `Resolved`.
2. **Duplicate Prevention**: Rejects second feedback submission with HTTP 409 Conflict.
