# SCRUM02-F004-UI-001: Post-Resolution Feedback Form

## Overview
Feedback card and modal presented to students/submitters once their complaint reaches the `Resolved` state. Captures a 1-5 star rating and comments, locking the form into a read-only state upon successful submission.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Resolved Requirement**: The form remains hidden or disabled if complaint status is `Open`, `Assigned`, or `In Progress`.
2. **Read-Only Lock**: Once feedback is saved, inputs are permanently disabled with an acknowledgement banner.
