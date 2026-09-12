# API Contract: GET /api/reports/summary
- **Query Params**: `?startDate=2026-09-01&endDate=2026-09-30`
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "summary": {
      "totalComplaints": 12,
      "byCategory": { "Electrical": 7, "Plumbing": 5 },
      "byLocation": [{ "location": "Science Block", "count": 8 }],
      "averageRating": 4.7
    }
  }
  ```
