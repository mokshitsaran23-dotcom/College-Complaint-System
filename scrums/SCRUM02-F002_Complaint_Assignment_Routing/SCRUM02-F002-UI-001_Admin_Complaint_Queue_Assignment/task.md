# Task: SCRUM02-F002-UI-001 — Admin complaint queue and assignment screen

## Objective
Provide an administrative view to monitor open complaints and assign them to responsible maintenance departments.

## User Story
> **As an admin, I want to view all open complaints and assign each to a maintenance department, so that issues are routed for resolution.**

## Acceptance Criteria
- **AC1**: Given an admin selects a complaint and a department, when they assign it, then the complaint is marked Assigned and linked to that department.
- **AC2**: Given no department is selected, when assignment is attempted, then a validation message is shown.

## Dependencies
- Assignment API (`SCRUM02-F002-BE-001`)
