# Epic Specification: SCRUM02-F004 Feedback & Ratings and Admin Reporting

## Epic Description (from Jira Backlog)
Submitters rate/give feedback after resolution; admins generate reports on recurring issues.

- **Business Objective**: close the feedback loop, support data-driven maintenance planning.
- **Actors**: Submitter, Admin.
- **Business Rule**: feedback can only be submitted once a complaint is Resolved.
- **Dependency**: SCRUM02-F003 provides the Resolved trigger.
- **Assumption**: reports viewed in-app; export formats (PDF/Excel) unspecified — implement in-app charts/tables first, structure the reporting API so CSV/PDF export can be added later.
- **Open Question**: specific report metrics/KPIs undefined — default to counts by category, by location, and by time period (weekly/monthly), and document this as the assumed metric set.

## User Stories Breakdown
- `SCRUM02-F004-UI-001`: Post-resolution feedback form
- `SCRUM02-F004-UI-002`: Admin reporting dashboard
- `SCRUM02-F004-BE-001`: Feedback capture API
- `SCRUM02-F004-BE-002`: Reporting/aggregation API
- `SCRUM02-F004-DB-001`: Feedback data store
