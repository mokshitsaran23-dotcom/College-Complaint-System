# Task: SCRUM02-F003-BE-001 — Complaint status update & notification trigger service

## Objective
Update complaint lifecycle status and emit real-time notifications to submitters upon progress.

## User Story
> **As the system, I want to update complaint status and notify the submitter, so that they stay informed in real time.**

## Acceptance Criteria
- **AC1**: Given a status change is saved, when processed, then a notification event is dispatched to the submitter and delivery is logged.

## Assumptions
- In-app notification via Socket.io; push/SMS/email is future extension.
