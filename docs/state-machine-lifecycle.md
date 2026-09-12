# Complaint State Machine & Lifecycle Specification

## 1. Lifecycle States & Strict Transitions

Complaints follow an audited, forward-progressing lifecycle. Any attempted transition outside the allowed matrix is rejected with HTTP 400 Bad Request.

```
       [Student Submits Form]
                 |
                 v
             +-------+
             | Open  |
             +-------+
                 |
                 | [Admin assigns department]
                 v
           +----------+  [Admin reassigns department]
           | Assigned | <-----------------------------+
           +----------+                               |
                 |                                    |
                 | [Maintenance staff begins work]    |
                 v                                    |
          +-------------+                             |
          | In Progress |                             |
          +-------------+                             |
                 |                                    |
                 | [Maintenance staff resolves issue] |
                 v                                    |
           +----------+                               |
           | Resolved | ------------------------------+
           +----------+ (Reopening allowed only via supervisor action)
                 |
                 v
        [Submitter Rates & Provides Feedback]
```

## 2. Transition Matrix

| Current State | Target State | Permitted Actors | Side Effects / Side Events |
|---|---|---|---|
| *(none)* | `Open` | Student, Staff | - Reference ID generated<br>- Initial status history record created |
| `Open` | `Assigned` | Admin | - Assigned department recorded<br>- Status history row logged<br>- Notification sent to department |
| `Assigned` | `Assigned` *(Reassignment)* | Admin | - Department updated<br>- Reassignment note logged in history |
| `Assigned` | `In Progress` | Staff (Assigned Dept), Admin | - Status history row logged<br>- Real-time Socket.io event to Submitter |
| `In Progress` | `Resolved` | Staff (Assigned Dept), Admin | - `resolvedAt` timestamp saved<br>- Socket.io event triggers Feedback prompt to Submitter |
| `Resolved` | *(Feedback)* | Submitter | - Rating (1-5) and feedback recorded<br>- Complaint locked from further modification |

## 3. Invariants & Business Rules
- **Rule 1**: A complaint cannot be deleted once created; only resolved.
- **Rule 2**: Only Admin users may set or modify the `assignedDepartment`.
- **Rule 3**: Staff members can only update complaints assigned to their designated department.
- **Rule 4**: Feedback cannot be submitted unless the complaint status is strictly `Resolved`.
