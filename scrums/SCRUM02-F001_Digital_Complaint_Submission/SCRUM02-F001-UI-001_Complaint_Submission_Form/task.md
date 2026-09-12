# Task: SCRUM02-F001-UI-001 — Complaint submission form

## Objective
Enable authenticated students and campus staff to file infrastructure complaints digitally with category, description/photo, and location.

## User Story
> **As a student or staff member, I want to fill out a complaint form with category, photo, and location, so that I can report a campus issue digitally.**

## Acceptance Criteria
- **AC1**: Given a logged-in user opens the complaint form, when they fill all required fields and submit, then the complaint is created and a confirmation with a tracking reference is shown.
- **AC2**: Given a required field (e.g., category) is missing, when the user submits, then a validation message is shown and the complaint is not created.

## Dependencies
- Complaint Creation API (`SCRUM02-F001-BE-001`)
- Authentication Service (`SCRUM02-F001-UI-002` / `BE-002`)

## Open Questions & Technical Notes
- Tech note: Support JPG/PNG photo uploads.
- Open Question: Camera direct capture vs file select — implemented standard HTML5 multi-part file picker compatible with mobile camera capture and desktop file browsers.
