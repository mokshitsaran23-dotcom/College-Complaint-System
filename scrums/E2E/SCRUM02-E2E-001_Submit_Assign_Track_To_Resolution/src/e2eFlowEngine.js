class E2EFlowEngine {
  constructor() {
    this.complaints = new Map();
    this.statusHistory = [];
    this.notificationsReceivedBySubmitter = [];
  }

  // 1. Submit
  async submitComplaint(student, payload) {
    if (!payload.category || !payload.location) {
      throw new Error('Validation failed: category and location required');
    }
    const id = 'cmp_' + (this.complaints.size + 1);
    const complaint = {
      id,
      referenceId: 'CMP-202609-' + Math.floor(1000 + Math.random() * 9000),
      category: payload.category,
      description: payload.description,
      location: payload.location,
      photoUrls: payload.photoUrls || [],
      status: 'Open',
      submitter: { collegeId: student.collegeId },
      assignedDepartment: null,
      createdAt: new Date().toISOString()
    };
    this.complaints.set(id, complaint);
    this.statusHistory.push({
      complaintId: id,
      fromStatus: null,
      toStatus: 'Open',
      changedBy: student.collegeId,
      timestamp: new Date().toISOString()
    });
    return complaint;
  }

  // 2. Assign
  async assignDepartment(admin, complaintId, department) {
    if (admin.role !== 'admin') {
      throw new Error('Unauthorized: Only admin can assign');
    }
    const complaint = this.complaints.get(complaintId);
    if (!complaint) throw new Error('Complaint not found');
    if (!department) throw new Error('Department required');

    const prevStatus = complaint.status;
    complaint.status = 'Assigned';
    complaint.assignedDepartment = department;

    this.statusHistory.push({
      complaintId,
      fromStatus: prevStatus,
      toStatus: 'Assigned',
      changedBy: admin.collegeId,
      note: 'Assigned to ' + department,
      timestamp: new Date().toISOString()
    });

    this.notificationsReceivedBySubmitter.push({
      recipient: complaint.submitter.collegeId,
      event: 'complaint:status_updated',
      status: 'Assigned',
      note: 'Assigned to ' + department
    });
    return complaint;
  }

  // 3. Update Status
  async updateStatus(staff, complaintId, targetStatus, note = '') {
    const complaint = this.complaints.get(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    if (staff.role === 'staff' && complaint.assignedDepartment && staff.department !== complaint.assignedDepartment) {
      throw new Error('Staff does not belong to assigned department');
    }

    const validNext = {
      'Open': ['Assigned'],
      'Assigned': ['In Progress'],
      'In Progress': ['Resolved']
    };

    if (!validNext[complaint.status] || !validNext[complaint.status].includes(targetStatus)) {
      throw new Error('Invalid status transition from ' + complaint.status + ' to ' + targetStatus);
    }

    const prev = complaint.status;
    complaint.status = targetStatus;
    if (targetStatus === 'Resolved') {
      complaint.resolvedAt = new Date().toISOString();
    }

    this.statusHistory.push({
      complaintId,
      fromStatus: prev,
      toStatus: targetStatus,
      changedBy: staff.collegeId,
      note,
      timestamp: new Date().toISOString()
    });

    this.notificationsReceivedBySubmitter.push({
      recipient: complaint.submitter.collegeId,
      event: 'complaint:status_updated',
      status: targetStatus,
      note
    });

    return complaint;
  }
}

module.exports = { E2EFlowEngine };
