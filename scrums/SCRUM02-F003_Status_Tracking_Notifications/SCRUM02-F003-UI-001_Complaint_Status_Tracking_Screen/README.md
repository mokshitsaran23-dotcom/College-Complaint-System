# SCRUM02-F003-UI-001: Complaint Status Tracking Screen

## Overview
Submitter-facing tracking portal displaying real-time current status badge and a vertical step history timeline (Open ➔ Assigned ➔ In Progress ➔ Resolved).

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Milestones**: Visual step bar displays the 4 lifecycle stages with date-stamped completion.
2. **Timeline Items**: Shows immutable audit trail items with notes added by maintenance staff.
