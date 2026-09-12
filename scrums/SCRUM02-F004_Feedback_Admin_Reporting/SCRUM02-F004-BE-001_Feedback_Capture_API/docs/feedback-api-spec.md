# API Contract: POST /api/complaints/:id/feedback
- **Body**: `{ "rating": 5, "comment": "Excellent prompt resolution" }`
- **Response 201 Created**:
  ```json
  { "success": true, "feedback": { "complaintId": "c1", "rating": 5, "comment": "..." } }
  ```
- **Response 400 Bad Request**:
  ```json
  { "success": false, "error": "Feedback can only be submitted for Resolved complaints." }
  ```
