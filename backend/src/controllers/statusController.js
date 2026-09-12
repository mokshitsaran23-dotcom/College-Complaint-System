const store = require('../data/store');
const { notifySubmitterStatusUpdate } = require('../services/notificationService');

const validTransitions = {
  'Open': ['Assigned'],
  'Assigned': ['In Progress'],
  'In Progress': ['Resolved'],
  'Resolved': [] // Terminal state
};

async function updateStatus(req, res) {
  const user = req.user;
  const { id } = req.params;
  const { status: targetStatus, note } = req.body || {};

  const complaint = store.complaints.find(c => c.id === id || c.referenceId === id);
  if (!complaint) {
    return res.status(404).json({ success: false, error: 'Complaint not found.' });
  }

  // RBAC check: staff can only update complaints assigned to their department
  if (user.role === 'staff' && user.department && complaint.assignedDepartment !== user.department) {
    return res.status(403).json({
      success: false,
      error: `Forbidden: You can only update tickets assigned to ${user.department}.`
    });
  }

  // Validate state machine lifecycle
  const allowed = validTransitions[complaint.status] || [];
  if (!allowed.includes(targetStatus)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status transition: Cannot move from '${complaint.status}' to '${targetStatus}'. Allowed: [${allowed.join(', ')}]`
    });
  }

  const prevStatus = complaint.status;
  complaint.status = targetStatus;
  complaint.updatedAt = new Date().toISOString();

  if (targetStatus === 'Resolved') {
    complaint.resolvedAt = new Date().toISOString();
    complaint.resolvedBy = user.collegeId;
  }

  // Append history
  const statusNote = note || `Status updated to ${targetStatus} by ${user.name}`;
  store.statusHistory.push({
    id: 'sh_' + (store.statusHistory.length + 1),
    complaintId: complaint.id,
    referenceId: complaint.referenceId,
    fromStatus: prevStatus,
    toStatus: targetStatus,
    changedBy: user.collegeId,
    changedByRole: user.role,
    note: statusNote,
    timestamp: new Date().toISOString()
  });

  // Real-time notification
  notifySubmitterStatusUpdate(complaint, prevStatus, targetStatus, statusNote);

  return res.status(200).json({
    success: true,
    complaint,
    notificationDispatched: true
  });
}

module.exports = { updateStatus };
