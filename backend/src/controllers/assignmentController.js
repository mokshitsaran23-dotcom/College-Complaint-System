const store = require('../data/store');
const { notifyWorkerAssigned } = require('../services/notificationService');

const validDepartments = ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Facilities', 'Sanitation'];

// Preset workers mapped by department or specific workers
const presetWorkers = {
  'WRK301': { collegeId: 'WRK301', name: 'Bob Worker (Electrical Crew)', department: 'Electrical' },
  'WRK302': { collegeId: 'WRK302', name: 'Charlie Worker (Plumbing Crew)', department: 'Plumbing' },
  'WRK303': { collegeId: 'WRK303', name: 'David Worker (Facilities Crew)', department: 'Facilities' },
  'WRK304': { collegeId: 'WRK304', name: 'Alex Tech (IT Support Crew)', department: 'IT Support' },
  'WRK305': { collegeId: 'WRK305', name: 'Edward Carpenter (Carpentry Crew)', department: 'Carpentry' },
  'WRK306': { collegeId: 'WRK306', name: 'Sam Cleaner (Sanitation Crew)', department: 'Sanitation' },
  'STF201': { collegeId: 'STF201', name: 'Mike Sparks (Electrical Tech)', department: 'Electrical' },
  'STF202': { collegeId: 'STF202', name: 'Dave Plumber (Plumbing Tech)', department: 'Plumbing' },
  'STF203': { collegeId: 'STF203', name: 'Sarah Byte (IT Specialist)', department: 'IT Support' }
};

async function assignComplaint(req, res) {
  const user = req.user;
  const { id } = req.params;
  const { department, workerId, workerName, assignmentNote } = req.body || {};

  const complaint = store.complaints.find(c => c.id === id || c.referenceId === id);
  if (!complaint) {
    return res.status(404).json({ success: false, error: 'Complaint not found.' });
  }

  // Derive department if workerId provided
  let assignedDept = department;
  let assignedWorkerObj = null;

  if (workerId && presetWorkers[workerId]) {
    const pw = presetWorkers[workerId];
    assignedWorkerObj = { collegeId: pw.collegeId, name: pw.name };
    if (!assignedDept) assignedDept = pw.department;
  } else if (workerId) {
    assignedWorkerObj = { collegeId: workerId, name: workerName || workerId };
  } else if (workerName) {
    assignedWorkerObj = { collegeId: 'WRK_' + Math.floor(100 + Math.random() * 900), name: workerName };
  }

  if (!assignedDept && assignedWorkerObj) {
    // try to match with complaint category
    if (validDepartments.includes(complaint.category)) {
      assignedDept = complaint.category;
    } else {
      assignedDept = 'Facilities';
    }
  }

  if (!assignedDept || !validDepartments.includes(assignedDept)) {
    return res.status(400).json({
      success: false,
      error: `Valid department selection is required. Allowed: [${validDepartments.join(', ')}]`
    });
  }

  const prevStatus = complaint.status;
  complaint.status = 'ASSIGNED';
  complaint.assignedDepartment = assignedDept;
  complaint.assignedWorker = assignedWorkerObj;
  complaint.assignedAt = new Date().toISOString();
  complaint.assignedBy = user.collegeId;

  const targetLabel = assignedWorkerObj
    ? `${assignedWorkerObj.name} (${assignedDept})`
    : `${assignedDept} Maintenance Crew`;

  const noteText = assignmentNote || `Assigned to ${targetLabel} by Admin`;

  // Append history
  store.statusHistory.push({
    id: 'sh_' + (store.statusHistory.length + 1) + '_' + Date.now(),
    complaintId: complaint.id,
    referenceId: complaint.referenceId,
    fromStatus: prevStatus,
    toStatus: 'ASSIGNED',
    changedBy: user.collegeId,
    changedByRole: 'admin',
    action: `Assigned to ${targetLabel}`,
    note: noteText,
    timestamp: new Date().toISOString()
  });

  // Step 2 notification: The assigned worker/crew must receive a notification.
  notifyWorkerAssigned(complaint, targetLabel);

  return res.status(200).json({ success: true, complaint });
}

module.exports = { assignComplaint, validDepartments, presetWorkers };
