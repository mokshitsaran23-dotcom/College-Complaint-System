const store = require('../data/store');
const { notifyAdminNewComplaint } = require('../services/notificationService');

function generateReferenceId() {
  const d = new Date();
  const ym = d.getFullYear().toString() + String(d.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${ym}-${rand}`;
}

function normalizeStatusFilter(status) {
  if (!status || status.toLowerCase() === 'all') return null;
  const s = status.trim().toUpperCase().replace(/\s+/g, '_');
  if (s === 'OPEN') return 'SUBMITTED';
  if (s === 'PENDING_APPROVAL') return 'WORK_COMPLETED';
  return s;
}

async function createComplaint(req, res) {
  const { title, category, description, location, photoUrls } = req.body || {};
  const user = req.user;

  if (!category || !location || (!title && !description && (!photoUrls || photoUrls.length === 0))) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: category, location, and complaint title or description are required.'
    });
  }

  const newId = 'cmp_' + (store.complaints.length + 1) + '_' + Date.now();
  const refId = generateReferenceId();
  const complaintTitle = title ? title.trim() : `${category} issue at ${location}`;

  const complaint = {
    id: newId,
    referenceId: refId,
    title: complaintTitle,
    category,
    description: description || '',
    location,
    photoUrls: photoUrls || [],
    status: 'SUBMITTED',
    submitter: {
      collegeId: user.collegeId,
      name: user.name,
      email: user.email,
      role: user.role
    },
    assignedDepartment: null,
    assignedWorker: null,
    proofHistory: [],
    createdAt: new Date().toISOString()
  };

  store.complaints.unshift(complaint);

  const actorRoleName = user.role === 'staff' ? 'Staff' : 'Student';
  // Append initial history
  store.statusHistory.push({
    id: 'sh_' + (store.statusHistory.length + 1) + '_' + Date.now(),
    complaintId: newId,
    referenceId: refId,
    fromStatus: null,
    toStatus: 'SUBMITTED',
    changedBy: user.collegeId,
    changedByRole: user.role,
    action: `Complaint submitted by ${actorRoleName}`,
    note: complaint.description || complaint.title,
    timestamp: new Date().toISOString()
  });

  // Step 1: An admin notification must be generated.
  notifyAdminNewComplaint(complaint);

  return res.status(201).json({ success: true, complaint });
}

async function getComplaints(req, res) {
  const user = req.user;
  const { status, department, category, q, scope } = req.query;

  let results = [...store.complaints];

  // RBAC scoping:
  // - Students see only their own complaints
  // - Staff can see their own complaints (or department if viewing squad queue)
  // - Workers see complaints assigned to their department or assigned to their worker collegeId
  // - Admins see all complaints
  if (user.role === 'student') {
    results = results.filter(c => c.submitter?.collegeId === user.collegeId);
  } else if (user.role === 'worker') {
    results = results.filter(c => {
      const matchDept = user.department && c.assignedDepartment === user.department;
      const matchWorker = c.assignedWorker && c.assignedWorker.collegeId === user.collegeId;
      return matchDept || matchWorker;
    });
  } else if (user.role === 'staff') {
    // If staff specifies my complaints or doesn't have a department, show their submitted complaints
    if (scope === 'my' || !user.department) {
      results = results.filter(c => c.submitter?.collegeId === user.collegeId);
    } else {
      // Supervisor view: show complaints in staff department + complaints submitted by staff
      results = results.filter(c => c.assignedDepartment === user.department || c.submitter?.collegeId === user.collegeId);
    results = results.filter(c => c.submitter.collegeId === user.collegeId);
  } else if (user.role === 'staff' || user.role === 'worker') {
    if (user.department) {
      results = results.filter(c => c.assignedDepartment === user.department);
    }
  }

  // Filters
  const normStatus = normalizeStatusFilter(status);
  if (normStatus) {
    results = results.filter(c => {
      const cStatus = (c.status || '').toUpperCase().replace(/\s+/g, '_');
      if (normStatus === 'SUBMITTED') return cStatus === 'SUBMITTED' || cStatus === 'OPEN';
      if (normStatus === 'WORK_COMPLETED') return cStatus === 'WORK_COMPLETED' || cStatus === 'PENDING_APPROVAL';
      return cStatus === normStatus;
    });
  }

  if (department) {
    results = results.filter(c => c.assignedDepartment && c.assignedDepartment.toLowerCase() === department.toLowerCase());
  }

  if (category) {
    results = results.filter(c => c.category && c.category.toLowerCase() === category.toLowerCase());
  }

  if (q && q.trim()) {
    const search = q.trim().toLowerCase();
    results = results.filter(c =>
      (c.referenceId && c.referenceId.toLowerCase().includes(search)) ||
      (c.title && c.title.toLowerCase().includes(search)) ||
      (c.description && c.description.toLowerCase().includes(search)) ||
      (c.location && c.location.toLowerCase().includes(search)) ||
      (c.category && c.category.toLowerCase().includes(search)) ||
      (c.submitter?.name && c.submitter.name.toLowerCase().includes(search)) ||
      (c.submitter?.collegeId && c.submitter.collegeId.toLowerCase().includes(search))
    );
  }

  const enhancedResults = results.map(c => {
    const fb = c.feedback || store.feedbacks.find(f => f.complaintId === c.id || f.referenceId === c.referenceId) || null;
    return { ...c, feedback: fb };
  });

  return res.status(200).json({ success: true, complaints: enhancedResults });
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

  const feedback = complaint.feedback || store.feedbacks.find(f => f.complaintId === complaint.id || f.referenceId === complaint.referenceId) || null;
  const complaintWithFb = { ...complaint, feedback };

  return res.status(200).json({
    success: true,
    complaint: complaintWithFb,
    history,
    feedback
  });
}

module.exports = { createComplaint, getComplaints, getComplaintById };
