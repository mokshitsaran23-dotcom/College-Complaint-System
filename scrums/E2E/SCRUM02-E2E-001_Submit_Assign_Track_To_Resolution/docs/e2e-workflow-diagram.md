# E2E Workflow Diagram: Flow 1
```
[Student: STU101]
       |
       | 1. POST /api/complaints
       v
  (State: Open)
       |
       | 2. Admin (ADM001) PATCH /api/complaints/:id/assign (Dept: Electrical)
       v
(State: Assigned) ------> [Socket Notification to STU101]
       |
       | 3. Staff (STF201) PATCH /api/complaints/:id/status (Status: In Progress)
       v
(State: In Progress) ---> [Socket Notification to STU101]
       |
       | 4. Staff (STF201) PATCH /api/complaints/:id/status (Status: Resolved)
       v
(State: Resolved) ------> [Socket Notification to STU101]
```
