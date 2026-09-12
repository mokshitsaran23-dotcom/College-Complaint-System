# System Architecture Specification

## 1. High-Level Architecture

The College Complaint System follows a decoupled, three-tier service-oriented architecture with real-time reactive event dispatching.

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|                                                                         |
|  +--------------------+  +---------------------+  +------------------+  |
|  | Student Web Portal |  | Maintenance Portal  |  |   Admin Portal   |  |
|  | - Submission Form  |  | - Dept Work Orders  |  | - Triage Queue   |  |
|  | - Status Timeline  |  | - Status Control    |  | - Analytics KPIs |  |
|  | - Feedback Modal   |  | - In-App Alerts     |  | - CSV Exports    |  |
|  +--------------------+  +---------------------+  +------------------+  |
|            |                        |                       |           |
+------------|------------------------|-----------------------|-----------+
             | REST Calls (HTTPS)     | REST + Socket.io      | REST
             v                        v                       v
+-------------------------------------------------------------------------+
|                        APPLICATION / API LAYER                          |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Express HTTP Server & Routing Router                              |  |
|  +-------------------------------------------------------------------+  |
|            |                             |                   |          |
|  +--------------------+        +--------------------+        |          |
|  | JWT & RBAC Guard   |        | Socket.io Engine   |        |          |
|  | Auth Middleware    |        | Real-time Dispatch |        |          |
|  +--------------------+        +--------------------+        |          |
|            |                             |                   |          |
|  +--------------------+        +--------------------+        |          |
|  | Controllers:       |        | Services:          |        |          |
|  | - Auth             | <----> | - IdP Mock Adapter | <------+          |
|  | - Complaint        |        | - Notification Svc |                   |
|  | - Assignment       |        | - Reporting Svc    |                   |
|  | - Status / History |        +--------------------+                   |
|  | - Feedback         |                                                 |
|  +--------------------+                                                 |
+------------|------------------------------------------------------------+
             | Mongoose ODM
             v
+-------------------------------------------------------------------------+
|                          PERSISTENCE LAYER                              |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | MongoDB 7.0 Document Database                                     |  |
|  |                                                                   |  |
|  | - complaints    : Core complaint documents with geo & photo refs  |  |
|  | - statushistory : Append-only audit log of all state transitions  |  |
|  | - feedbacks     : Ratings and satisfaction reviews                |  |
|  | - users         : College directory / institutional cached auth   |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

## 2. Component Interactions
1. **Complaint Submission Flow**:
   - Submitter sends `multipart/form-data` or JSON payload with category, description, location, and photo file URL.
   - API verifies authenticated JWT, assigns unique reference ID (`CMP-YYYYMMDD-XXXX`), sets status to `Open`, and persists the document.
2. **Assignment Flow**:
   - Admin fetches unassigned queue.
   - Admin assigns ticket to a maintenance department (`Electrical`, `Plumbing`, `IT`, `Carpentry`, `Civil`, `HVAC`).
   - Ticket transitions to `Assigned`.
3. **Progress & Notification Flow**:
   - Maintenance staff assigned to that department updates ticket to `In Progress` or `Resolved`.
   - `StatusHistory` document is created with timestamp, transition, and notes.
   - Backend triggers real-time Socket.io message targeted to the submitter's personal room (`user_<collegeId>`).
   - Submitter's UI displays a toast notification and live updates the progress bar.
4. **Resolution & Feedback Flow**:
   - Upon reaching `Resolved`, submitter is invited to rate work (1-5 stars) and submit comments.
   - Once submitted, feedback is linked to the complaint and marked immutable.
   - Aggregated metrics immediately update in the Admin Reporting view.
