# Task: SCRUM02-F001-UI-002 — Login using college credentials

## Objective
Provide an authentication UI for students and staff to log in using college credentials, binding complaint submissions to verified identities.

## User Story
> **As a student or staff member, I want to log in with my college credentials, so that my complaints are tied to my identity for tracking.**

## Acceptance Criteria
- **AC1**: Given valid credentials, when submitted, then the user is authenticated and redirected to the complaint dashboard.
- **AC2**: Given invalid credentials, when submitted, then an error is shown and access is denied.

## Dependencies
- Backend authentication integration service (`SCRUM02-F001-BE-002`)

## Open Questions
- College SSO provider (SAML / OAuth2 / CAS) is unspecified — UI talks to unified login adapter contract.
