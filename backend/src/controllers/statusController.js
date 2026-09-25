const store = require('../data/store');
const {
  notifyAdminWorkCompleted,
  notifySubmitterWorkApproved,
  notifyWorkerReworkRequested,
  notifySubmitterStatusUpdate
} = require('../services/notificationService');

const validTransitions = {
  'SUBMITTED': ['UNDER_REVIEW', 'ASSIGNED'],
  'UNDER_REVIEW': ['ASSIGNED'],
  'ASSIGNED': ['IN_PROGRESS'],
  'IN_PROGRESS': ['WORK_COMPLETED'],
  'WORK_COMPLETED': ['ADMIN_REVIEW', 'RESOLVED', 'REWORK_REQUIRED'],
  'ADMIN_REVIEW': ['RESOLVED', 'REWORK_REQUIRED'],
  'REWORK_REQUIRED': ['IN_PROGRESS', 'WORK_COMPLETED'],
  'RESOLVED': [] // Terminal state
  'Open': ['Assigned'],
  'Assigned': ['In Progress'],
  'In Progress': ['Pending Approval'],
  'Pending Approval': ['Resolved', 'In Progress'],
  'Resolved': [] // Terminal state
};

function normalizeStatus(s) {
  if (!s) return '';
  const clean = s.trim().toUpperCase().replace(/\s+/g, '_');
  if (clean === 'OPEN') return 'SUBMITTED';
  if (clean === 'PENDING_APPROVAL') return 'WORK_COMPLETED';
  return clean;
}

async function updateStatus(req, res) {
  const user = req.user;
  const { id } = req.params;
  const rawTargetStatus = req.body?.status;
  const { note, completionPhotoUrl, completionNotes, reworkReason, reason } = req.body || {};

  if (!rawTargetStatus) {
    return res.status(400).json({ success: false, error: 'Target status is required.' });
  }

  const targetStatus = normalizeStatus(rawTargetStatus);
  const { status: targetStatus, note, completionPhotoUrl, completionNotes } = req.body || {};

  const complaint = store.complaints.find(c => c.id === id || c.referenceId === id);
  if (!complaint) {
    return res.status(404).json({ success: false, error: 'Complaint not found.' });
  }

  const currentStatus = normalizeStatus(complaint.status);

  // 1. CRITICAL RULE: Workers CANNOT approve work or mark complaint as Resolved! Only Admin can approve!
  if (targetStatus === 'RESOLVED') {
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Only the admin can approve completed work and mark a complaint as Resolved.'
      });
    }
  }

  // 2. Only Admin can request rework
  if (targetStatus === 'REWORK_REQUIRED') {
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Only the admin can request rework.'
      });
    }
  }

  // 3. RBAC check: Workers/Staff can only update complaints assigned to their department or assigned to their collegeId
  if (user.role === 'worker' || (user.role === 'staff' && targetStatus !== 'RESOLVED' && targetStatus !== 'REWORK_REQUIRED')) {
    const isAssignedToMe = complaint.assignedWorker && complaint.assignedWorker.collegeId === user.collegeId;
    const isAssignedToMyDept = user.department && complaint.assignedDepartment === user.department;
    if (!isAssignedToMe && !isAssignedToMyDept) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You can only update tickets assigned to your squad (${user.department || user.collegeId}).`
      });
    }
  }

  // 4. Validate state machine lifecycle
  const allowed = validTransitions[currentStatus] || [];
  // RBAC check: staff/worker can only update complaints assigned to their department
  if ((user.role === 'staff' || user.role === 'worker') && user.department && complaint.assignedDepartment !== user.department) {
    return res.status(403).json({
      success: false,
      error: `Forbidden: You can only update tickets assigned to ${user.department}.`
    });
  }

  // Worker cannot mark as Resolved directly!
  if (targetStatus === 'Resolved' && user.role === 'worker') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Workers cannot mark complaints as Resolved directly. Work must be submitted for Admin approval.'
    });
  }

  // Moving to Pending Approval REQUIRES completion photo proof from worker
  if (targetStatus === 'Pending Approval') {
    const photoToSave = completionPhotoUrl || req.body?.photoUrl;
    if (!photoToSave && !complaint.completionPhotoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: Photographic proof of completed work is required before requesting Admin approval.'
      });
    }
    if (photoToSave) complaint.completionPhotoUrl = photoToSave;
    if (completionNotes) complaint.completionNotes = completionNotes;
    complaint.pendingApprovalAt = new Date().toISOString();
    complaint.pendingApprovalBy = user.collegeId;
  }

  // Validate state machine lifecycle
  const allowed = validTransitions[complaint.status] || [];
  if (!allowed.includes(targetStatus)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status transition: Cannot move from '${complaint.status}' to '${rawTargetStatus}'. Allowed: [${allowed.join(', ')}]`
    });
  }

  // 5. CRITICAL VALIDATION: WORK_COMPLETED REQUIRES A PROOF PHOTO!
  // Mandatory Proof Photo Validation:
  // "A worker MUST NOT be allowed to submit the work as completed without uploading a proof photo.
  // The validation must happen on the backend as well as the frontend.
  // If there is no photo: Proof photo is required before submitting completed work.
  // Do not allow the request/API to mark the complaint as completed."
  if (targetStatus === 'WORK_COMPLETED') {
    const photo = completionPhotoUrl || req.body?.photoUrl;
    if (!photo || typeof photo !== 'string' || !photo.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Proof photo is required before submitting completed work.'
      });
    }

    const desc = completionNotes || note || req.body?.description || 'Work completed by technician with proof photo.';

    complaint.completionPhotoUrl = photo.trim();
    complaint.completionNotes = desc.trim();
    complaint.completedAt = new Date().toISOString();
    complaint.completedBy = user.collegeId;

    if (!complaint.proofHistory) complaint.proofHistory = [];
    complaint.proofHistory.push({
      submissionNumber: complaint.proofHistory.length + 1,
      workerCollegeId: user.collegeId,
      workerName: user.name,
      notes: desc.trim(),
      photoUrl: photo.trim(),
      submittedAt: complaint.completedAt
    });
  }

  // 6. Admin Rejection / Rework Reason Validation
  let finalReworkReason = null;
  if (targetStatus === 'REWORK_REQUIRED') {
    finalReworkReason = (reworkReason || reason || note || '').trim();
    if (!finalReworkReason) {
      return res.status(400).json({
        success: false,
        error: 'Admin rejection reason is required before requesting rework.'
      });
    }

    complaint.reworkReason = finalReworkReason;
    complaint.reworkRequestedAt = new Date().toISOString();
    complaint.reworkRequestedBy = user.collegeId;

    if (complaint.proofHistory && complaint.proofHistory.length > 0) {
      const lastEntry = complaint.proofHistory[complaint.proofHistory.length - 1];
      lastEntry.adminDecision = 'REWORK_REQUIRED';
      lastEntry.adminReason = finalReworkReason;
      lastEntry.reviewedAt = complaint.reworkRequestedAt;
    }
  }

  // 7. Admin Approval / Resolution
  if (targetStatus === 'RESOLVED') {
    complaint.resolvedAt = new Date().toISOString();
    complaint.resolvedBy = user.collegeId;

    if (complaint.proofHistory && complaint.proofHistory.length > 0) {
      const lastEntry = complaint.proofHistory[complaint.proofHistory.length - 1];
      lastEntry.adminDecision = 'RESOLVED';
      lastEntry.reviewedAt = complaint.resolvedAt;
    }
  }

  // 8. Admin Under Review
  if (targetStatus === 'UNDER_REVIEW') {
    complaint.underReviewAt = new Date().toISOString();
  }

  const prevStatus = complaint.status;
  complaint.status = targetStatus;
  complaint.updatedAt = new Date().toISOString();

  // 9. Append Status History Audit Trail
  let actionText = '';
  let noteText = note || '';

  if (targetStatus === 'UNDER_REVIEW') {
    actionText = 'Admin reviewed complaint';
    noteText = noteText || 'Admin is reviewing complaint details';
  } else if (targetStatus === 'IN_PROGRESS') {
    actionText = prevStatus === 'REWORK_REQUIRED' ? 'Worker started rework' : 'Worker started work';
    noteText = noteText || (prevStatus === 'REWORK_REQUIRED' ? 'Worker commenced rework operations.' : 'Worker started repair operations.');
  } else if (targetStatus === 'WORK_COMPLETED') {
    actionText = prevStatus === 'REWORK_REQUIRED' ? 'Worker resubmitted work (New proof photo)' : 'Worker submitted completed work';
    noteText = complaint.completionNotes;
  } else if (targetStatus === 'ADMIN_REVIEW') {
    actionText = 'Admin reviewing proof photo';
    noteText = noteText || 'Admin is inspecting submitted work and proof photo';
  } else if (targetStatus === 'RESOLVED') {
    actionText = 'Admin approved work — Marked as RESOLVED';
    noteText = noteText || 'Resolution verified and approved by Admin';
  } else if (targetStatus === 'REWORK_REQUIRED') {
    actionText = 'Admin requested rework';
    noteText = finalReworkReason;
  }

  store.statusHistory.push({
    id: 'sh_' + (store.statusHistory.length + 1) + '_' + Date.now(),
    complaintId: complaint.id,
    referenceId: complaint.referenceId,
    fromStatus: prevStatus,
    toStatus: targetStatus,
    changedBy: user.collegeId,
    changedByRole: user.role,
    action: actionText,
    note: noteText,
    proofPhotoUrl: targetStatus === 'WORK_COMPLETED' ? complaint.completionPhotoUrl : null,
    reworkReason: targetStatus === 'REWORK_REQUIRED' ? finalReworkReason : null,
    timestamp: new Date().toISOString()
  });

  // 10. Notifications Dispatch based on workflow step
  if (targetStatus === 'WORK_COMPLETED') {
    const isRework = prevStatus === 'REWORK_REQUIRED';
    notifyAdminWorkCompleted(complaint, user.name || complaint.assignedDepartment, isRework);
  } else if (targetStatus === 'RESOLVED') {
    notifySubmitterWorkApproved(complaint);
  } else if (targetStatus === 'REWORK_REQUIRED') {
    notifyWorkerReworkRequested(complaint, finalReworkReason);
  } else {
    notifySubmitterStatusUpdate(complaint, prevStatus, targetStatus, noteText);
  }

  return res.status(200).json({
    success: true,
    complaint,
    notificationDispatched: true
  });
}

async function markUnderReview(req, res) {
  const user = req.user;
  const { id } = req.params;

  const complaint = store.complaints.find(c => c.id === id || c.referenceId === id);
  if (!complaint) {
    return res.status(404).json({ success: false, error: 'Complaint not found.' });
  }

  const currentStatus = normalizeStatus(complaint.status);
  if (currentStatus !== 'SUBMITTED') {
    return res.status(400).json({
      success: false,
      error: `Complaint cannot be moved to UNDER_REVIEW from status '${complaint.status}'.`
    });
  }

  const prevStatus = complaint.status;
  complaint.status = 'UNDER_REVIEW';
  complaint.underReviewAt = new Date().toISOString();

  store.statusHistory.push({
    id: 'sh_' + (store.statusHistory.length + 1) + '_' + Date.now(),
    complaintId: complaint.id,
    referenceId: complaint.referenceId,
    fromStatus: prevStatus,
    toStatus: 'UNDER_REVIEW',
    changedBy: user.collegeId,
    changedByRole: 'admin',
    action: 'Admin reviewed complaint',
    note: 'Admin opened and reviewed complaint details',
    timestamp: new Date().toISOString()
  });

  return res.status(200).json({ success: true, complaint });
}

module.exports = { updateStatus, markUnderReview, validTransitions, normalizeStatus };
