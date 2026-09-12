# SCRUM02-E2E-002: Resolved Complaint Collects Feedback That Feeds Admin Reporting

## Overview
Second end-to-end integration flow verifying post-resolution analytics:
1. Submitter accesses a `Resolved` complaint and submits satisfaction rating & comment.
2. Non-resolved feedback attempts are blocked.
3. Facility Admin opens the Reporting Dashboard and confirms that the resolved complaint and its rating are immediately reflected in aggregate statistics.

## Standalone Setup & Testing
```bash
npm test
```
