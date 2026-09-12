# Task: SCRUM02-F001-BE-001 — Complaint creation API

## Objective
Provide a robust backend API to receive, validate, persist, and index submitted complaints.

## User Story
> **As the complaint submission UI, I want to send complaint details to a backend service, so that the complaint is persisted and assigned a tracking status.**

## Acceptance Criteria
- **AC1**: Given a valid complaint payload, when processed, then a record is created with status Open and a unique reference ID is returned.
- **AC2**: Given an unauthenticated request, when processed, then it is rejected with HTTP 401.

## Dependencies
- Complaint data store (`SCRUM02-F001-DB-001`)
- Authentication service (`SCRUM02-F001-BE-002`)
