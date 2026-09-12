# Epic Specification: SCRUM02-F003 Real-Time Status Tracking & Notifications

## Epic Description (from Jira Backlog)
Students track complaint status in real time and receive notifications as staff update progress.

- **Business Objective**: transparency, fewer repeat status-check calls.
- **Actors**: Submitter, Maintenance Staff.
- **Business Rule**: status must follow a defined lifecycle: Open → Assigned → In Progress → Resolved.
- **Dependency**: SCRUM02-F002 (assignment).
- **Assumption**: notification channel is in-app/push (SMS/email unspecified) — implement via Socket.io in-app notifications.
- **Open Question**: exact lifecycle stages not fully defined — use the four-stage lifecycle above as the implemented default.

## User Stories Breakdown
- `SCRUM02-F003-UI-001`: Complaint status tracking screen
- `SCRUM02-F003-UI-002`: Maintenance staff status update control
- `SCRUM02-F003-BE-001`: Complaint status update & notification trigger service
- `SCRUM02-F003-DB-001`: Complaint status history table
