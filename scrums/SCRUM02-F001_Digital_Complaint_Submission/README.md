# EPIC: SCRUM02-F001 — Digital Complaint Submission

## Overview
Allows students and campus staff to log in using institutional college credentials and digitally report a campus issue with a designated category, supporting photographic evidence, and precise campus location.

## Business Objective
Replace informal, hard-to-track complaint channels (phone calls, unofficial WhatsApp groups, verbal reports) with an institutional, structured, and auditable digital lifecycle.

## Actors
- **Student**: Reports facilities/infrastructure issues.
- **Staff**: Reports departmental or laboratory issues.
- **System**: Enforces submission validation rules, stores photographic assets, and generates a unique tracking reference.

## Child Stories in this Epic
1. `SCRUM02-F001-UI-001`: Complaint submission form (React + TS + Tailwind)
2. `SCRUM02-F001-UI-002`: Login using college credentials (React + TS + Tailwind)
3. `SCRUM02-F001-BE-001`: Complaint creation API (Node.js + Express)
4. `SCRUM02-F001-BE-002`: Authentication integration service (Stubbed IdP + JWT)
5. `SCRUM02-F001-DB-001`: Complaint data store (MongoDB + Mongoose)

## Key Technical Decisions & Assumptions
- **Credential Source**: Built with a modular adapter to integrate with the college's existing LDAP/SSO identity provider.
- **Media Handling**: Photos are stored on a persistent file path/CDN reference rather than binary blobs in the database.
- **Validation**: Enforces category, location, and description or photo before persistence.
