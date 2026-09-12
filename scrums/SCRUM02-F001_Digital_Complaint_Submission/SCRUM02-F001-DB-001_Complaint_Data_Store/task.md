# Task: SCRUM02-F001-DB-001 — Complaint data store

## Objective
Persist complaint records ensuring all submitted fields are stored accurately and retrievable throughout their lifecycle.

## User Story
> **As the system, I need to persist complaint records (category, photos, location, status, submitter), so complaints can be tracked over their lifecycle.**

## Acceptance Criteria
- **AC1**: Given a complaint is created, when saved, then all submitted fields are retrievable exactly as entered.

## Tech Notes
- Photo storage approach (file store vs. blob) is resolved to storing file references (path/URL) rather than binary blobs.
