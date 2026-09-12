# Schema Specification: StatusHistory
- `complaintId` (ObjectId / String, indexed)
- `fromStatus` (String, nullable for initial creation)
- `toStatus` (String, required)
- `changedBy` (String: collegeId)
- `changedByRole` (String: student, admin, staff)
- `note` (String)
- `timestamp` (Date, default now)
