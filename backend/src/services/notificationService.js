let ioInstance = null;
const notificationHistory = [];

function initSocket(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log('[Socket.io] Client connected:', socket.id);

    socket.on('join_user_room', (collegeId) => {
      const room = `user_${collegeId}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined room ${room}`);
    });

    socket.on('join_dept_room', (department) => {
      const room = `dept_${department}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined department room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Client disconnected:', socket.id);
    });
  });
}

function notifySubmitterStatusUpdate(complaint, fromStatus, toStatus, note) {
  const eventPayload = {
    complaintId: complaint.id,
    referenceId: complaint.referenceId,
    category: complaint.category,
    location: complaint.location,
    fromStatus,
    toStatus,
    note,
    timestamp: new Date().toISOString()
  };

  const room = `user_${complaint.submitter.collegeId}`;
  if (ioInstance) {
    ioInstance.to(room).emit('complaint:status_updated', eventPayload);
    // Also broadcast to public status watchers if open
    ioInstance.emit('global:complaint_updated', eventPayload);
  }

  const logEntry = {
    id: 'notif_' + (notificationHistory.length + 1),
    recipient: complaint.submitter.collegeId,
    event: 'complaint:status_updated',
    status: 'DELIVERED',
    payload: eventPayload,
    timestamp: new Date().toISOString()
  };
  notificationHistory.push(logEntry);
  console.log(`[Notification] Dispatched to ${room}: ${toStatus}`);
  return logEntry;
}

module.exports = { initSocket, notifySubmitterStatusUpdate, notificationHistory };
