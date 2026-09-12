# SCRUM02-F002-UI-001: Admin Complaint Queue & Assignment Screen

## Overview
Administrative dashboard view displaying all open and unassigned complaints. Enables administrators to select a complaint, choose the responsible maintenance department from a dropdown, and dispatch the assignment with real-time UI status updates.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Departments**: `Electrical`, `Plumbing`, `IT Support`, `Carpentry`, `Facilities`.
2. **Reassignment**: Supports reassigning tickets already in `Assigned` state to another department if routed erroneously.
