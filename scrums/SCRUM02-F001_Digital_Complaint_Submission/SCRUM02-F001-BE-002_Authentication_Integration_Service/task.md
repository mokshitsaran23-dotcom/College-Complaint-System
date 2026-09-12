# Task: SCRUM02-F001-BE-002 — Authentication integration service

## Objective
Validate user credentials against institutional identity source and issue secure JWT tokens.

## User Story
> **As the system, I want to validate a user's college credentials against the institutional identity source, so that only verified members can submit complaints.**

## Acceptance Criteria
- **AC1**: Given valid credentials, when verified against the identity source, then a session/token (JWT) is issued.

## Assumptions
- An existing institutional identity provider exists — built against an extensible stubbed IdP adapter interface.
