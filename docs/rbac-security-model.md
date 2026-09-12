# Role-Based Access Control (RBAC) & Security Model

## 1. System Roles

1. **Student (`student`)**:
   - Represents enrolled students.
   - Allowed to submit new complaints, upload issue photos, view real-time status of their own complaints, and submit satisfaction feedback upon resolution.
2. **Maintenance Staff (`staff`)**:
   - Belongs to a specific campus maintenance department (e.g. `Electrical`, `Plumbing`, `IT`, `Carpentry`, `Civil`).
   - Allowed to view queue of work orders assigned to their department, update complaint status (`Assigned` ➔ `In Progress` ➔ `Resolved`), and add operational notes.
3. **Administrator (`admin`)**:
   - Campus facilities manager / administrator.
   - Allowed to view all complaints, assign/reassign complaints to departments, access system-wide reporting and analytics, and manage configurations.

---

## 2. Permissions Matrix

| Resource / Endpoint | Method | Student | Staff | Admin | Rule Details |
|---|---|:---:|:---:|:---:|---|
| `/api/auth/login` | POST | Allow | Allow | Allow | Authenticates with college credentials |
| `/api/complaints` | POST | Allow | Allow | Allow | Must provide category, description/photo, location |
| `/api/complaints` | GET | Self | Dept | All | Role-scoped visibility |
| `/api/complaints/:id` | GET | Self | Dept | All | Accesses details and status history |
| `/api/complaints/:id/assign` | PATCH | Deny | Deny | Allow | Admin-only triage & routing |
| `/api/complaints/:id/status` | PATCH | Deny | Dept Only | Allow | Staff must match assigned department |
| `/api/complaints/:id/feedback` | POST | Submitter | Deny | Deny | Only submitter can rate, requires `Resolved` status |
| `/api/reports/summary` | GET | Deny | Deny | Allow | Admin-only metrics and aggregations |

---

## 3. JWT Token Security
- Claims: `{ id, collegeId, name, role, department }`
- Sign Algorithm: HMAC-SHA256
- Expiry: 8 hours
- Transport: `Authorization: Bearer <token>`
