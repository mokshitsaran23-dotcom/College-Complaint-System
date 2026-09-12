# SCRUM02-F003-UI-002: Maintenance Staff Status Update Control

## Overview
Control panel embedded inside the maintenance staff dashboard that allows technicians to transition a complaint's status (`In Progress`, `Resolved`) and trigger automatic notification dispatch to the submitter.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Valid Transitions**: Staff can advance `Assigned` ➔ `In Progress` ➔ `Resolved`.
2. **Notification Dispatch**: UI provides a notification indicator confirming dispatch upon successful update.
