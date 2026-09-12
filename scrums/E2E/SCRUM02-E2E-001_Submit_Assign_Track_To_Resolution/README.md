# SCRUM02-E2E-001: Student Submits, Admin Assigns, Tracked to Resolution

## Overview
Comprehensive end-to-end integration test simulating the entire primary lifecycle of a complaint across roles:
1. Student logs in with institutional credentials.
2. Student submits a new infrastructure complaint with photos and location.
3. Facility Admin reviews the queue and routes the complaint to the Electrical department.
4. Maintenance Technician logs in, accepts the work order, moves it to `In Progress`, and marks it `Resolved`.
5. Submitter receives real-time notification events throughout each milestone and inspects the chronological timeline.

## Standalone Setup & Testing
```bash
npm test
```
