# Notification Event Specification
- **Event Name**: `complaint:status_updated`
- **Payload**:
  ```json
  {
    "complaintId": "cmp-101",
    "referenceId": "CMP-202609-1001",
    "fromStatus": "Assigned",
    "toStatus": "In Progress",
    "timestamp": "2026-09-12T11:00:00Z",
    "note": "Work order started"
  }
  ```
- **Delivery Log Record**: `{ eventId, recipientCollegeId, deliveredAt, status: 'DELIVERED' }`
