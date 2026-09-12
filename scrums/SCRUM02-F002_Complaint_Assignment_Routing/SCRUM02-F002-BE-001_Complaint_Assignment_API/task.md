# Task: SCRUM02-F002-BE-001 — Complaint assignment API

## Objective
Provide a secure backend endpoint for administrators to assign or reassign complaints to departments.

## User Story
> **As the admin UI, I want to assign a complaint to a department, so that the correct team is notified of the work.**

## Acceptance Criteria
- **AC1**: Given a valid assignment request, when processed, then complaint status becomes Assigned and the owning department is recorded.

## Dependencies
- Complaint data store (`SCRUM02-F001-DB-001`)
