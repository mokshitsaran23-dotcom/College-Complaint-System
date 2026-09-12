# EPIC: SCRUM02-F004 — Feedback & Ratings and Admin Reporting

## Overview
Enables submitters to rate the quality and timeliness of maintenance resolutions, while providing campus administrators with actionable aggregated metrics, bottleneck identification, and trend reporting.

## Business Objective
Close the service feedback loop, quantify departmental SLA compliance, and support data-driven preventative campus maintenance planning.

## Actors
- **Submitter**: Submits 1-5 star ratings and qualitative comments on resolved issues.
- **Admin**: Analyzes reports on complaint volumes, recurring categories, locations, and satisfaction scores.

## Child Stories in this Epic
1. `SCRUM02-F004-UI-001`: Post-resolution feedback form (React + TS + Tailwind)
2. `SCRUM02-F004-UI-002`: Admin reporting dashboard (React + TS + Tailwind)
3. `SCRUM02-F004-BE-001`: Feedback capture API (Node.js + Express)
4. `SCRUM02-F004-BE-002`: Reporting/aggregation API (Node.js + Express)
5. `SCRUM02-F004-DB-001`: Feedback data store (MongoDB + Mongoose)

## Key Technical Decisions & Assumptions
- **Precondition**: Feedback submission is strictly blocked until a complaint reaches `Resolved` status.
- **Metrics Set**: Defaults to volume by category, department distribution, hot-spot locations, and average resolution time.
- **Exporting**: In-app charts and table with structured JSON/CSV export capabilities.
