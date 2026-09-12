# SCRUM02-F004-BE-002: Reporting & Aggregation API

## Overview
Express endpoint `GET /api/reports/summary` generating aggregated statistics for campus complaints. Filters by date range and groups totals by status, category, location, and satisfaction ratings.

## Standalone Setup & Testing
```bash
npm test
```

## Assumptions Made
1. **Date Range Filter**: Supports `startDate` and `endDate` query parameters.
2. **Aggregations**: Computes totals, category distributions, location hot spots, and average ratings.
