# Task: SCRUM02-F003-UI-002 — Maintenance staff status update control

## Objective
Allow maintenance staff to advance ticket lifecycle and dispatch submitter notifications.

## User Story
> **As a maintenance staff member, I want to update a complaint's progress status, so that the submitter and admin stay informed.**

## Acceptance Criteria
- **AC1**: Given staff selects a new valid status, when saved, then the status updates and a notification is triggered to the submitter.

## Dependencies
- Status-update API & notification service (`SCRUM02-F003-BE-001`)
