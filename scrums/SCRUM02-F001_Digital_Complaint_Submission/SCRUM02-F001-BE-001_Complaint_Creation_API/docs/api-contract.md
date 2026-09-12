# API Contract: POST /api/complaints
- **Headers**: `Authorization: Bearer <jwt>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "category": "Electrical",
    "description": "Loose wiring sparking in Lab 304",
    "location": "Science Block, Lab 304",
    "photoUrls": ["https://assets.college.edu/sample.jpg"]
  }
  ```
- **Response 201 Created**:
  ```json
  {
    "success": true,
    "complaint": {
      "referenceId": "CMP-202609-8472",
      "status": "Open",
      "category": "Electrical",
      "submitter": { "collegeId": "STU101" }
    }
  }
  ```
- **Response 401 Unauthorized**:
  ```json
  { "error": "Unauthorized: Access token is missing or invalid" }
  ```
