# SCRUM02-F001-BE-001: Complaint Creation API

## Overview
Express REST API endpoint `POST /api/complaints` that processes complaint submission payloads from the frontend. Enforces JWT authentication, validates category, description/photo, and location, assigns a unique tracking reference (`CMP-YYYYMM-XXXX`), sets initial status to `Open`, and persists the complaint.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Initial Status**: Defaults to `Open`.
2. **Reference ID Format**: `CMP-` followed by year, month, and 4-digit unique sequence.
3. **Authentication**: Enforces Bearer JWT verification; returns HTTP 401 if missing/invalid.
