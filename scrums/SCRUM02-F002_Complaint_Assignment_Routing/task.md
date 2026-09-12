# Epic Specification: SCRUM02-F002 Complaint Assignment & Routing

## Epic Description (from Jira Backlog)
Administrators assign submitted complaints to the appropriate maintenance department.

- **Business Objective**: ensure complaints reach the correct responsible team promptly.
- **Actors**: Admin, Maintenance Staff.
- **Business Rule**: only Admin may assign/reassign complaints.
- **Dependency**: SCRUM02-F001 provides the source records.
- **Assumption**: departments/maintenance teams are pre-defined and admin-managed.
- **Open Question**: whether a complaint can be reassigned after initial assignment — implement reassignment support (idempotent PATCH) since it's the safer superset, and note the assumption.

## User Stories Breakdown
- `SCRUM02-F002-UI-001`: Admin complaint queue and assignment screen
- `SCRUM02-F002-UI-002`: Maintenance staff assigned-complaints view
- `SCRUM02-F002-BE-001`: Complaint assignment API
