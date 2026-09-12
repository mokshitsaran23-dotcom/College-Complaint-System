# Task: SCRUM02-F004-BE-001 — Feedback capture API

## Objective
Record submitter rating and qualitative review for resolved complaints.

## User Story
> **As the feedback UI, I want to submit a rating and comment for a resolved complaint, so that it is recorded against that complaint.**

## Acceptance Criteria
- **AC1**: Given feedback is submitted for a Resolved complaint, when processed, then it is stored and linked to the complaint record.
- **AC2**: Given feedback is submitted for a non-Resolved complaint, when processed, then the request is rejected.

## Dependencies
- Complaint data store (`SCRUM02-F001-DB-001`)
- Feedback data store (`SCRUM02-F004-DB-001`)
