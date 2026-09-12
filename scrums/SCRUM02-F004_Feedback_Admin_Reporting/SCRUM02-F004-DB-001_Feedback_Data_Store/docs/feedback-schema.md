# Schema Specification: Feedback
- `complaintId` (ObjectId / String, unique, indexed)
- `rating` (Number, min 1, max 5, required)
- `comment` (String)
- `submitterCollegeId` (String)
- `submittedAt` (Date, default Date.now)
