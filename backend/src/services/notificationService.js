let ioInstance = null;
const notificationHistory = [
  {
    id: 'notif_init_1',
    recipient: 'ADM001',
    recipientRole: 'admin',
    title: 'New Complaint Received',
    message: 'New complaint received: "Water leakage in Block A restroom."',
    referenceId: 'CMP-202609-1006',
    status: 'DELIVERED',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 'notif_init_2',
    recipient: 'ADM001',
    recipientRole: 'admin',
    title: 'Work Completed Awaiting Verification',
    message: 'Complaint #CMP-202609-1002 has been completed by the Plumbing Crew. Please review the submitted proof.',
    referenceId: 'CMP-202609-1002',
    status: 'DELIVERED',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 'notif_init_3',
    recipient: 'WRK302',
    recipientRole: 'worker',
    recipientDept: 'Plumbing',
    title: 'Rework Required',
    message: 'Your submitted work requires rework. Reason: The issue has not been completely resolved. Water is still slowly dripping from the valve stem when pressure is turned on. Please replace the valve washer or valve assembly completely.',
    referenceId: 'CMP-202609-1003',
    status: 'DELIVERED',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    read: false
  },
  {
    id: 'notif_init_4',
    recipient: 'STU101',
    recipientRole: 'student',
    title: 'Complaint Resolved',
    message: 'Your complaint #CMP-202609-1001 has been resolved successfully. The maintenance team has completed the required work.',
    referenceId: 'CMP-202609-1001',
    status: 'DELIVERED',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    read: false
  }
];

function initSocket(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log('[Socket.io] Client connected:', socket.id);

    socket.on('join_user_room', (collegeId) => {
      if (!collegeId) return;
      const room = `user_${collegeId.toUpperCase()}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined user room ${room}`);
    });

    socket.on('join_role_room', (role) => {
      if (!role) return;
      const room = `role_${role.toLowerCase()}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined role room ${room}`);
    });

    socket.on('join_dept_room', (department) => {
      if (!department) return;
      const room = `dept_${department}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined department room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Client disconnected:', socket.id);
    });
  });
}

function recordAndEmitNotification({
  recipient,
  recipientRole,
  recipientDept,
  title,
  message,
  referenceId,
  event = 'notification:new',
  extraData = {}
}) {
  const logEntry = {
    id: 'notif_' + (notificationHistory.length + 1) + '_' + Date.now(),
    recipient: recipient ? recipient.toUpperCase() : null,
    recipientRole: recipientRole ? recipientRole.toLowerCase() : null,
    recipientDept: recipientDept || null,
    title,
    message,
    referenceId,
    timestamp: new Date().toISOString(),
    read: false,
    extraData
  };

  notificationHistory.unshift(logEntry);

  if (ioInstance) {
    const payload = {
      ...logEntry,
      time: 'Just now'
    };

    // Emit to specific user room if set
    if (recipient) {
      ioInstance.to(`user_${recipient.toUpperCase()}`).emit(event, payload);
      ioInstance.to(`user_${recipient.toUpperCase()}`).emit('notification:new', payload);
    }

    // Emit to role room if set
    if (recipientRole) {
      ioInstance.to(`role_${recipientRole.toLowerCase()}`).emit(event, payload);
      ioInstance.to(`role_${recipientRole.toLowerCase()}`).emit('notification:new', payload);
    }

    // Emit to department room if set
    if (recipientDept) {
      ioInstance.to(`dept_${recipientDept}`).emit(event, payload);
      ioInstance.to(`dept_${recipientDept}`).emit('notification:new', payload);
    }

    // Also broadcast globally so active dashboards refresh
    ioInstance.emit('global:complaint_event', {
      referenceId,
      title,
      message,
      event,
      timestamp: logEntry.timestamp
    });
  }

  console.log(`[Notification Engine] Dispatched: "${title}" -> ${message}`);
  return logEntry;
}

// 1. Student/Staff Creates Complaint -> Notify Admin
function notifyAdminNewComplaint(complaint) {
  const title = 'New Complaint Received';
  const message = `New complaint received: "${complaint.title || complaint.description || complaint.category}".`;
  return recordAndEmitNotification({
    recipientRole: 'admin',
    title,
    message,
    referenceId: complaint.referenceId,
    event: 'complaint:created',
    extraData: { complaintId: complaint.id }
  });
}

// 2. Admin Assigns Complaint -> Notify Assigned Worker / Crew
function notifyWorkerAssigned(complaint, assignedWorkerOrDept) {
  const target = assignedWorkerOrDept || complaint.assignedWorker?.name || complaint.assignedDepartment || 'Maintenance Crew';
  const title = 'New Complaint Assigned';
  const message = `New complaint assigned to you: ${complaint.title || complaint.category} at ${complaint.location}.`;
  return recordAndEmitNotification({
    recipient: complaint.assignedWorker?.collegeId || null,
    recipientRole: 'worker',
    recipientDept: complaint.assignedDepartment,
    title,
    message,
    referenceId: complaint.referenceId,
    event: 'complaint:assigned',
    extraData: { assignedTo: target, complaintId: complaint.id }
  });
}

// 3. Worker Submits Completed Work -> Notify Admin
function notifyAdminWorkCompleted(complaint, workerNameOrCrew) {
  const crew = workerNameOrCrew || (complaint.assignedDepartment ? `${complaint.assignedDepartment} Maintenance Crew` : 'Assigned Worker');
  const title = 'Work Completed Awaiting Verification';
  const message = `Complaint #${complaint.referenceId} has been completed by the ${crew}. Please review the submitted proof.`;
  return recordAndEmitNotification({
    recipientRole: 'admin',
    title,
    message,
    referenceId: complaint.referenceId,
    event: 'complaint:work_completed',
    extraData: { complaintId: complaint.id, completionPhotoUrl: complaint.completionPhotoUrl }
  });
}

// 4. Admin Approves Work -> Notify Student/Staff Submitter
function notifySubmitterWorkApproved(complaint) {
  const title = 'Complaint Resolved';
  const message = `Your complaint #${complaint.referenceId} has been resolved successfully. The maintenance team has completed the required work.`;
  return recordAndEmitNotification({
    recipient: complaint.submitter.collegeId,
    recipientRole: 'student',
    title,
    message,
    referenceId: complaint.referenceId,
    event: 'complaint:resolved',
    extraData: {
      complaintId: complaint.id,
      resolutionPhotoUrl: complaint.completionPhotoUrl,
      resolvedAt: complaint.resolvedAt
    }
  });
}

// 5. Admin Rejects / Requests Rework -> Notify Assigned Worker / Crew
function notifyWorkerReworkRequested(complaint, reason) {
  const title = 'Rework Required';
  const message = `Your submitted work requires rework. Reason: ${reason}`;
  return recordAndEmitNotification({
    recipient: complaint.assignedWorker?.collegeId || null,
    recipientRole: 'worker',
    recipientDept: complaint.assignedDepartment,
    title,
    message,
    referenceId: complaint.referenceId,
    event: 'complaint:rework_required',
    extraData: { complaintId: complaint.id, reason }
  });
}

// Backward-compatible generic status notifier
function notifySubmitterStatusUpdate(complaint, fromStatus, toStatus, note) {
  const title = `Status Updated to ${toStatus}`;
  const message = note || `Complaint #${complaint.referenceId} status moved from ${fromStatus || 'Start'} to ${toStatus}.`;
  return recordAndEmitNotification({
    recipient: complaint.submitter.collegeId,
    title,
    message,
    referenceId: complaint.referenceId,
    event: 'complaint:status_updated',
    extraData: { fromStatus, toStatus, note }
  });
}

function getUserNotifications(collegeId, role, department) {
  const cId = collegeId ? collegeId.toUpperCase() : null;
  const r = role ? role.toLowerCase() : null;

  return notificationHistory.filter(n => {
    // Exact user match
    if (cId && n.recipient && n.recipient.toUpperCase() === cId) return true;
    // Role match (e.g. admin sees admin notifications)
    if (r && n.recipientRole && n.recipientRole.toLowerCase() === r) return true;
    // Department match for staff/workers
    if (department && n.recipientDept && n.recipientDept.toLowerCase() === department.toLowerCase()) return true;
    return false;
  });
}

module.exports = {
  initSocket,
  notifyAdminNewComplaint,
  notifyWorkerAssigned,
  notifyAdminWorkCompleted,
  notifySubmitterWorkApproved,
  notifyWorkerReworkRequested,
  notifySubmitterStatusUpdate,
  getUserNotifications,
  notificationHistory
};
