# Task: SCRUM02-E2E-001 — Student submits, admin assigns, and status is tracked to resolution

## Objective
Validate the complete multi-actor journey from initial report submission through departmental assignment and technical resolution.

## User Story / Business Journey
> **Student logs in → submits complaint with photo/location → admin assigns to department → maintenance staff updates status → student is notified and sees status change in real time.**

## Acceptance Criteria
- **AC1**: Given a student submits a valid complaint, when an admin assigns it and staff progress it to Resolved, then the student sees each status change reflected and receives notifications throughout.
- **Error Path**: If assignment or status update fails, the complaint remains in its last valid state and an error is surfaced to the actor performing the action.

## Covers
- SCRUM02-F001 (Digital Complaint Submission)
- SCRUM02-F002 (Complaint Assignment & Routing)
- SCRUM02-F003 (Status Tracking & Notifications)
