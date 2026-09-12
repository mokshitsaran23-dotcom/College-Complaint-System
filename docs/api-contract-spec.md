# API Contract Specification

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /auth/login`
Authenticates a user against the College Identity Provider (LDAP/SSO adapter) and issues a signed JWT.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "collegeId": "STU101",
    "password": "student123"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "60d0fe4f5311236168a109ca",
        "collegeId": "STU101",
        "name": "Jane Doe",
        "email": "jane.doe@college.edu",
        "role": "student",
        "department": null
      }
    }
    ```
  - `401 Unauthorized`:
    ```json
    {
      "success": false,
      "error": "Invalid college credentials."
    }
    ```

### `GET /auth/me`
Retrieves authenticated user profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` with user object.

---

## 2. Complaint Endpoints

### `POST /complaints`
Creates a new complaint. Requires valid student or staff token.

- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "category": "Electrical",
    "description": "Short circuit sparks observed in Physics Lab Room 304 switchboard.",
    "location": "Science Block, 3rd Floor, Lab 304",
    "photos": ["https://assets.college.edu/uploads/complaint-photo-1.jpg"]
  }
  ```
- **Responses**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "complaint": {
        "id": "60d0fe4f5311236168a109cb",
        "referenceId": "CMP-202609-8472",
        "category": "Electrical",
        "description": "Short circuit sparks observed in Physics Lab Room 304 switchboard.",
        "location": "Science Block, 3rd Floor, Lab 304",
        "photos": ["https://assets.college.edu/uploads/complaint-photo-1.jpg"],
        "status": "Open",
        "submitter": {
          "collegeId": "STU101",
          "name": "Jane Doe",
          "email": "jane.doe@college.edu"
        },
        "assignedDepartment": null,
        "createdAt": "2026-09-12T10:00:00.000Z"
      }
    }
    ```
  - `400 Bad Request`:
    ```json
    {
      "success": false,
      "error": "Validation Error: category, description/photos, and location are required."
    }
    ```
  - `401 Unauthorized`:
    ```json
    {
      "success": false,
      "error": "Authentication required."
    }
    ```

### `GET /complaints`
Retrieves complaints filtered by role and query params.
- **Query Parameters**:
  - `status` (optional): `Open`, `Assigned`, `In Progress`, `Resolved`
  - `department` (optional): department filter
  - `category` (optional): category filter
- **Role Scoping**:
  - Students see only their submitted complaints.
  - Staff see complaints assigned to their department.
  - Admins see all complaints.

### `GET /complaints/:id`
Retrieves full complaint record, including status transition timeline and feedback (if resolved).

---

## 3. Assignment Endpoints

### `PATCH /complaints/:id/assign`
Assigns or reassigns an open/assigned complaint to a maintenance department. Restricted to **Admin** role.

- **Request Body**:
  ```json
  {
    "department": "Electrical",
    "assignmentNote": "Assigned to primary electrical squad on duty."
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "complaint": {
        "id": "60d0fe4f5311236168a109cb",
        "referenceId": "CMP-202609-8472",
        "status": "Assigned",
        "assignedDepartment": "Electrical",
        "assignedAt": "2026-09-12T10:15:00.000Z"
      }
    }
    ```
  - `400 Bad Request`: `Missing department selection.`
  - `403 Forbidden`: `Only administrators may assign complaints.`

---

## 4. Status Update Endpoints

### `PATCH /complaints/:id/status`
Updates status along the lifecycle (`Assigned` ➔ `In Progress` ➔ `Resolved`). Restricted to **Maintenance Staff** or **Admin**.

- **Request Body**:
  ```json
  {
    "status": "In Progress",
    "note": "Technician dispatched to replace burnt MCB switch."
  }
  ```
- **Responses**:
  - `200 OK`: Complaint updated, status history row inserted, and real-time Socket.io event dispatched.
  - `400 Bad Request`: `Invalid lifecycle transition.`

---

## 5. Feedback Endpoints

### `POST /complaints/:id/feedback`
Submits post-resolution feedback (rating + comments). Restricted to the original submitter.

- **Request Body**:
  ```json
  {
    "rating": 5,
    "comment": "Prompt service, fixed within 2 hours of report."
  }
  ```
- **Responses**:
  - `201 Created`: Feedback persisted and linked to complaint.
  - `400 Bad Request`: `Feedback can only be submitted for Resolved complaints.`
  - `409 Conflict`: `Feedback has already been submitted for this complaint.`

---

## 6. Reporting Endpoints

### `GET /reports/summary`
Returns aggregated analytics for complaints. Restricted to **Admin**.

- **Query Parameters**:
  - `startDate` (optional, ISO string)
  - `endDate` (optional, ISO string)
- **Response**:
  ```json
  {
    "success": true,
    "summary": {
      "totalComplaints": 42,
      "byStatus": { "Open": 5, "Assigned": 7, "In Progress": 12, "Resolved": 18 },
      "byCategory": { "Electrical": 16, "Plumbing": 10, "IT": 8, "Facilities": 8 },
      "byLocation": [
        { "location": "Science Block", "count": 14 },
        { "location": "Hostel B", "count": 12 }
      ],
      "averageRating": 4.6,
      "averageResolutionHours": 4.2
    }
  }
  ```
