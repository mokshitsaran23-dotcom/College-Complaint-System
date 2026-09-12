# API Contract: PATCH /api/complaints/:id/assign
- **Headers**: `Authorization: Bearer <admin-jwt>`
- **Body**:
  ```json
  { "department": "Electrical" }
  ```
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "complaint": {
      "id": "cmp_1",
      "status": "Assigned",
      "assignedDepartment": "Electrical",
      "assignedAt": "2026-09-12T10:45:00.000Z"
    }
  }
  ```
