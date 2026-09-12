const store = require('../data/store');
const { notifySubmitterStatusUpdate } = require('../services/notificationService');

const validDepartments = ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Facilities', 'Sanitation'];

async function assignComplaint(req, res) {
  const user = req.user;
  const { id } = req.params;
  const { department, assignmentNote } = req.body || {};

  if (!department || !validDepartments.includes(department)) {
    return res.status(400).json({ success: false, error: 'Valid department selection is required.' });
  }

  const complaint = store.complaints.find(c => c.id === id || c.referenceId === id);
  if (!complaint) {
    return res.status(404).json({ success: false, error: 'Complaint not found.' });
  }

  const prevStatus = complaint.status;
  complaint.status = 'Assigned';
  complaint.assignedDepartment = department;
  complaint.assignedAt = new Date().toISOString();
  complaint.assignedBy = user.collegeId;

  // Append history
  const noteText = assignmentNote || `Assigned to ${department} Department by Admin`;
  store.statusHistory.push({
    id: 'sh_' + (store.statusHistory.length + 1),
    complaintId: complaint.id,
    referenceId: complaint.referenceId,
    fromStatus: prevStatus,
    toStatus: 'Assigned',
    changedBy: user.collegeId,
    changedByRole: 'admin',
    note: noteText,
    timestamp: new Date().toISOString()
  });

  notifySubmitterStatusUpdate(complaint, prevStatus, 'Assigned', noteText);

  return res.status(200).json({ success: true, complaint });
}

module.exports = { assignComplaint, validDepartments };
