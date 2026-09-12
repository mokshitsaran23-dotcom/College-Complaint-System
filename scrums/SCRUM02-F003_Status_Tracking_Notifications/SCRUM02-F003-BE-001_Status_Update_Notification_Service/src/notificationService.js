class MockSocketServer {
  constructor() {
    this.emittedEvents = [];
  }
  to(room) {
    return {
      emit: (event, payload) => {
        this.emittedEvents.push({ room, event, payload, timestamp: new Date().toISOString() });
      }
    };
  }
}

class StatusUpdateNotificationService {
  constructor(socketServer = new MockSocketServer()) {
    this.socket = socketServer;
    this.deliveryLogs = [];
  }

  async processStatusUpdate(complaint, newStatus, changedBy, note = '') {
    const fromStatus = complaint.status;
    complaint.status = newStatus;
    complaint.updatedAt = new Date().toISOString();
    if (newStatus === 'Resolved') {
      complaint.resolvedAt = new Date().toISOString();
    }

    const eventPayload = {
      complaintId: complaint.id,
      referenceId: complaint.referenceId,
      fromStatus,
      toStatus: newStatus,
      changedBy: changedBy.collegeId,
      note,
      timestamp: new Date().toISOString()
    };

    // Dispatch real-time Socket.io event to submitter room
    const targetRoom = 'user_' + complaint.submitter.collegeId;
    this.socket.to(targetRoom).emit('complaint:status_updated', eventPayload);

    // Record delivery log
    const logEntry = {
      id: 'log_' + (this.deliveryLogs.length + 1),
      recipientCollegeId: complaint.submitter.collegeId,
      event: 'complaint:status_updated',
      status: 'DELIVERED',
      payload: eventPayload,
      deliveredAt: new Date().toISOString()
    };
    this.deliveryLogs.push(logEntry);

    return {
      complaint,
      notificationDispatched: true,
      deliveryLog: logEntry
    };
  }
}

module.exports = { StatusUpdateNotificationService, MockSocketServer };
