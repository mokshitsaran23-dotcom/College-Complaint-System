const store = require('../data/store');

function generateReferenceId() {
  const d = new Date();
  const ym = d.getFullYear().toString() + String(d.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${ym}-${rand}`;
}

async function createComplaint(req, res) {
  const { category, description, location, photoUrls } = req.body || {};
  const user = req.user;

  if (!category || !location || (!description && (!photoUrls || photoUrls.length === 0))) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: category, location, and description or photo are required.'
    });
  }

  const newId = 'cmp_' + (store.complaints.length + 1);
  const refId = generateReferenceId();

  const complaint = {
    id: newId,
    referenceId: refId,
    category,
    description: description || '',
    location,
    photoUrls: photoUrls || [],
    status: 'Open',
    submitter: {
      collegeId: user.collegeId,
      name: user.name,
      email: user.email
    },
    assignedDepartment: null,
    createdAt: new Date().toISOString()
  };

  store.complaints.unshift(complaint);

  // Append initial history
  store.statusHistory.push({
    id: 'sh_' + (store.statusHistory.length + 1),
    complaintId: newId,
    referenceId: refId,
    fromStatus: null,
    toStatus: 'Open',
    changedBy: user.collegeId,
    changedByRole: user.role,
    note: 'Complaint submitted digitally',
    timestamp: new Date().toISOString()
  });

  return res.status(201).json({ success: true, complaint });
}

async function getComplaints(req, res) {
  const user = req.user;
  const { status, department, category } = req.query;

  let results = [...store.complaints];

  // RBAC scoping
  if (user.role === 'student') {
    results = results.filter(c => c.submitter.collegeId === user.collegeId);
  } else if (user.role === 'staff' || user.role === 'worker') {
    if (user.department) {
      results = results.filter(c => c.assignedDepartment === user.department);
    }
  }

  // Filters
  if (status) results = results.filter(c => c.status.toLowerCase() === status.toLowerCase());
  if (department) results = results.filter(c => c.assignedDepartment === department);
  if (category) results = results.filter(c => c.category.toLowerCase() === category.toLowerCase());

  return res.status(200).json({ success: true, complaints: results });
}

async function getComplaintById(req, res) {
  const { id } = req.params;
  const complaint = store.complaints.find(c => c.id === id || c.referenceId === id);

  if (!complaint) {
    return res.status(404).json({ success: false, error: 'Complaint not found.' });
  }

  const history = store.statusHistory
    .filter(h => h.complaintId === complaint.id || h.referenceId === complaint.referenceId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const feedback = store.feedbacks.find(f => f.complaintId === complaint.id || f.referenceId === complaint.referenceId) || null;

  return res.status(200).json({
    success: true,
    complaint,
    history,
    feedback
  });
}

module.exports = { createComplaint, getComplaints, getComplaintById };
