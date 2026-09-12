/**
 * Resilient Data Store supporting both local MongoDB and rapid standalone execution.
 */

class DataStore {
  constructor() {
    this.complaints = [
      {
        id: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        category: 'Electrical',
        description: 'Switchboard sparking violently in Lab 304 switch array',
        location: 'Science Block, 3rd Floor, Lab 304',
        photoUrls: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'],
        status: 'Resolved',
        submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
        assignedDepartment: 'Electrical',
        assignedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        resolvedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        resolvedBy: 'STF201',
        createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1002',
        referenceId: 'CMP-202609-1002',
        category: 'Plumbing',
        description: 'Severe water pipe burst under washroom sink',
        location: 'Hostel Block B, 2nd Floor, Room 214',
        photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600'],
        status: 'In Progress',
        submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
        assignedDepartment: 'Plumbing',
        assignedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1003',
        referenceId: 'CMP-202609-1003',
        category: 'IT Support',
        description: 'Ethernet wall port dead, research terminals offline',
        location: 'Central Library, Research Wing, Desk 12',
        photoUrls: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600'],
        status: 'Assigned',
        submitter: { collegeId: 'STU102', name: 'Alex Smith', email: 'alex.smith@college.edu' },
        assignedDepartment: 'IT Support',
        assignedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1004',
        referenceId: 'CMP-202609-1004',
        category: 'Electrical',
        description: 'Auditorium ceiling projector power unit trip',
        location: 'Auditorium 1, Main Stage',
        photoUrls: ['https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600'],
        status: 'Open',
        submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
        assignedDepartment: null,
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      }
    ];

    this.statusHistory = [
      {
        id: 'sh_1',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: null,
        toStatus: 'Open',
        changedBy: 'STU101',
        changedByRole: 'student',
        note: 'Complaint filed digitally',
        timestamp: new Date(Date.now() - 50 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_2',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: 'Open',
        toStatus: 'Assigned',
        changedBy: 'ADM001',
        changedByRole: 'admin',
        note: 'Assigned to Electrical Department',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_3',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: 'Assigned',
        toStatus: 'In Progress',
        changedBy: 'STF201',
        changedByRole: 'staff',
        note: 'Technician on-site with parts',
        timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_4',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: 'In Progress',
        toStatus: 'Resolved',
        changedBy: 'STF201',
        changedByRole: 'staff',
        note: 'Replaced MCB circuit breaker',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      }
    ];

    this.feedbacks = [
      {
        id: 'fb_1',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        submitterCollegeId: 'STU101',
        rating: 5,
        comment: 'Outstanding response time! Technician Mike was polite and fixed the issue quickly.',
        submittedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString()
      }
    ];
  }
}

module.exports = new DataStore();
