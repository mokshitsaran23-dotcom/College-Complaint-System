# EPIC: SCRUM02-F002 — Complaint Assignment & Routing

## Overview
Allows campus facility administrators to view incoming open complaints and route/assign each ticket to the designated maintenance department.

## Business Objective
Ensure complaints reach the correct responsible operational squad promptly without administrative bottlenecks.

## Actors
- **Admin**: Triages complaints and assigns departments.
- **Maintenance Staff**: Receives assigned work orders in departmental views.

## Child Stories in this Epic
1. `SCRUM02-F002-UI-001`: Admin complaint queue and assignment screen (React + TS + Tailwind)
2. `SCRUM02-F002-UI-002`: Maintenance staff assigned-complaints view (React + TS + Tailwind)
3. `SCRUM02-F002-BE-001`: Complaint assignment API (Node.js + Express)

## Key Technical Decisions & Assumptions
- **Reassignment Support**: Built with idempotent PATCH support so administrators can re-route complaints if mistakenly categorized.
- **Department Enums**: Fixed pre-configured department pool (`Electrical`, `Plumbing`, `IT`, `Carpentry`, `Civil`, `HVAC`).
