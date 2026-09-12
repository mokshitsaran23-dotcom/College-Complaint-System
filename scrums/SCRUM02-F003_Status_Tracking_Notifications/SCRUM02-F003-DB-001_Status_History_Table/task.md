# Task: SCRUM02-F003-DB-001 — Complaint status history table

## Objective
Persist an immutable history of status changes per complaint for timeline display and auditing.

## User Story
> **As the system, I need to persist a history of status changes per complaint, so a timeline can be displayed and audited.**

## Acceptance Criteria
- **AC1**: Given a status change occurs, when saved, then a new history row is appended without overwriting prior history.

## Dependencies
- Complaint data store (`SCRUM02-F001-DB-001`)
