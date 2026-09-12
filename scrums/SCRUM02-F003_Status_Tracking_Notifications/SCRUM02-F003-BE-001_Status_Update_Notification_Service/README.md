# SCRUM02-F003-BE-001: Complaint Status Update & Notification Trigger Service

## Overview
Express endpoint `PATCH /api/complaints/:id/status` and backend event service. Manages status transitions, appends an immutable record into `StatusHistory`, and dispatches real-time Socket.io notifications to the complaint submitter with logged delivery confirmation.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **In-App Notification via Socket.io**: Sends event `complaint:status_updated` targeted to the room `user_<collegeId>`.
2. **Delivery Log**: Persists delivery receipt in notification log array.
