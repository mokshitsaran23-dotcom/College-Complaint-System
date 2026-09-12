# Database Schema & Entity-Relationship Model

Database Engine: MongoDB 7.0 (Mongoose ODM)

---

## 1. Entity Relationship Diagram

```
+------------------------------------+
|               USERS                |
+------------------------------------+
| _id            : ObjectId (PK)     |
| collegeId      : String (Unique)   |
| name           : String            |
| email          : String            |
| role           : Enum [student,    |
|                        staff,      |
|                        admin]      |
| department     : String (Nullable) |
| createdAt      : Date              |
+------------------------------------+
          |
          | 1:N (Submitter)
          v
+------------------------------------+             1:N             +------------------------------------+
|            COMPLAINTS              |---------------------------->|           STATUS_HISTORY           |
+------------------------------------+                             +------------------------------------+
| _id            : ObjectId (PK)     |                             | _id         : ObjectId (PK)        |
| referenceId    : String (Unique)   |                             | complaintId : ObjectId (FK)       |
| submitterId    : ObjectId (FK)     |                             | fromStatus  : String               |
| submitterCollegeId : String        |                             | toStatus    : String               |
| category       : Enum              |                             | changedBy   : ObjectId (FK)        |
| description    : String            |                             | changedByRole: String              |
| location       : String            |                             | note        : String               |
| photoUrls      : [String]          |                             | timestamp   : Date                 |
| status         : Enum [Open,       |                             +------------------------------------+
|                        Assigned,   |
|                        In Progress,|
|                        Resolved]   |
| assignedDepartment: String (Null)  |
| assignedAt     : Date              |
| resolvedAt     : Date              |
| createdAt      : Date              |
| updatedAt      : Date              |
+------------------------------------+
          |
          | 1:1
          v
+------------------------------------+
|             FEEDBACK               |
+------------------------------------+
| _id            : ObjectId (PK)     |
| complaintId    : ObjectId (FK-Uniq)|
| submitterId    : ObjectId (FK)     |
| rating         : Number (1-5)      |
| comment        : String            |
| submittedAt    : Date              |
+------------------------------------+
```

---

## 2. Indexing Strategy

1. **`complaints` collection**:
   - `{ referenceId: 1 }` (Unique) — Fast lookup by student tracking reference.
   - `{ submitterCollegeId: 1, createdAt: -1 }` — Fast query of user's complaint history.
   - `{ assignedDepartment: 1, status: 1 }` — Fast maintenance staff queue queries.
   - `{ status: 1, createdAt: -1 }` — Fast admin triage queries.

2. **`statushistory` collection**:
   - `{ complaintId: 1, timestamp: 1 }` — Ordered timeline retrieval.

3. **`feedbacks` collection**:
   - `{ complaintId: 1 }` (Unique) — Ensures only one feedback per complaint.
   - `{ rating: 1 }` — Fast aggregation of satisfaction scores.

4. **`users` collection**:
   - `{ collegeId: 1 }` (Unique) — Fast authentication lookup.
