# Epic Specification: SCRUM02-F001 Digital Complaint Submission

## Epic Description (from Jira Backlog)
Allows students/staff to log in and digitally report a campus issue with category, photo, and location.

- **Business Objective**: Replace informal, hard-to-track complaint channels (calls/WhatsApp) with a structured digital process.
- **Actors**: Student, Staff, System
- **Functional Requirements**: login via college credentials; select complaint category; upload one or more photos; select/enter issue location; system creates a trackable complaint record.
- **Business Rule**: a complaint must have category + description/photo + location before submission is allowed.
- **Dependency**: college authentication/credentials system (login).
- **Assumption**: "college credentials" = existing institutional login/SSO this app integrates with, not a new one.
- **Open Question**: source system for college credentials (LDAP/SSO/other) is unspecified — implement a stubbed/mock SSO adapter with a clearly documented interface.

## User Stories Breakdown
- `SCRUM02-F001-UI-001`: Complaint submission form
- `SCRUM02-F001-UI-002`: Login using college credentials
- `SCRUM02-F001-BE-001`: Complaint creation API
- `SCRUM02-F001-BE-002`: Authentication integration service
- `SCRUM02-F001-DB-001`: Complaint data store
