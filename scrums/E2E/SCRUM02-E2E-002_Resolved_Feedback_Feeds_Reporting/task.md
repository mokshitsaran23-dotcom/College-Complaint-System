# Task: SCRUM02-E2E-002 — Resolved complaint collects feedback that feeds admin reporting

## Objective
Verify that resolved complaints collect feedback which directly aggregates into executive administrative reporting.

## User Story / Business Journey
> **Complaint reaches Resolved → submitter provides rating/feedback → admin views aggregated reports reflecting the resolved complaint and its category.**

## Acceptance Criteria
- **AC1**: Given a complaint is Resolved and feedback is submitted, when the admin opens the reporting dashboard, then the complaint and its feedback are reflected in the relevant aggregated counts.
- **Error Path**: Feedback attempts on non-Resolved complaints are blocked with a clear message.

## Covers
- SCRUM02-F003 (Status Tracking & Notifications)
- SCRUM02-F004 (Feedback & Admin Reporting)
