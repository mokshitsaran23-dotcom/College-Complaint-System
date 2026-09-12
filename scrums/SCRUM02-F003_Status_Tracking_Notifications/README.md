# EPIC: SCRUM02-F003 — Real-Time Status Tracking & Notifications

## Overview
Empowers submitters to track the real-time status of their complaints through clear visual milestones, while receiving instant in-app alerts whenever maintenance staff advances progress.

## Business Objective
Maximize operational transparency and eliminate redundant phone inquiries, follow-up emails, and office visits.

## Actors
- **Submitter**: Monitors progress via real-time timeline.
- **Maintenance Staff**: Updates state and provides resolution notes.
- **System**: Dispatches reactive Socket.io notifications and logs history.

## Child Stories in this Epic
1. `SCRUM02-F003-UI-001`: Complaint status tracking screen (React + TS + Tailwind)
2. `SCRUM02-F003-UI-002`: Maintenance staff status update control (React + TS + Tailwind)
3. `SCRUM02-F003-BE-001`: Complaint status update & notification trigger service (Node.js + Express + Socket.io)
4. `SCRUM02-F003-DB-001`: Complaint status history table (MongoDB + Mongoose)

## Key Technical Decisions & Assumptions
- **Lifecycle Sequence**: `Open` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`.
- **Notification Transport**: Socket.io in-app event streaming with delivery logging.
