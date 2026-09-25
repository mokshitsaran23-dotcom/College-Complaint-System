/**
 * Resilient Data Store supporting both local MongoDB and rapid standalone execution.
 * Aligned with the Smart Complaint Management System Lifecycle:
 * SUBMITTED -> UNDER_REVIEW -> ASSIGNED -> IN_PROGRESS -> WORK_COMPLETED -> ADMIN_REVIEW -> (RESOLVED | REWORK_REQUIRED)
 */

class DataStore {
  constructor() {
    this.complaints = [
      {
        id: 'cmp_1006',
        referenceId: 'CMP-202609-1006',
        title: 'Water leakage in Block A restroom',
        category: 'Plumbing',
        description: 'Severe water leakage from the main pipeline in the 2nd floor restroom of Block A.',
        location: 'Block A, 2nd Floor, Restroom 204',
        photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600'],
        status: 'SUBMITTED',
        submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
        assignedDepartment: null,
        assignedWorker: null,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'cmp_1007',
        referenceId: 'CMP-202609-1007',
        title: 'Faulty ceiling fan and wiring sparking',
        category: 'Electrical',
        description: 'Ceiling fan makes loud grinding noise and sparking occurred near switch regulator.',
        location: 'Academic Block B, Room 108',
        photoUrls: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'],
        status: 'UNDER_REVIEW',
        submitter: { collegeId: 'STF201', name: 'Prof. Mike Sparks', email: 'mike.sparks@college.edu' },
        assignedDepartment: null,
        assignedWorker: null,
        underReviewAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1005',
        referenceId: 'CMP-202609-1005',
        title: 'Auditorium projector power unit tripped',
        category: 'Electrical',
        description: 'Auditorium 1 ceiling projector won’t turn on; circuit breaker keeps tripping.',
        location: 'Auditorium 1, Main Stage',
        photoUrls: ['https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600'],
        status: 'ASSIGNED',
        submitter: { collegeId: 'STU102', name: 'Alex Smith', email: 'alex.smith@college.edu' },
        assignedDepartment: 'Electrical',
        assignedWorker: { collegeId: 'WRK301', name: 'Bob Worker (Electrical Crew)' },
        assignedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1004',
        referenceId: 'CMP-202609-1004',
        title: 'Central Library research terminal network offline',
        category: 'IT Support',
        description: 'Ethernet wall port dead, terminals 9-12 cannot reach research repository.',
        location: 'Central Library, Research Wing, Desk 12',
        photoUrls: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600'],
        status: 'IN_PROGRESS',
        submitter: { collegeId: 'STU102', name: 'Alex Smith', email: 'alex.smith@college.edu' },
        assignedDepartment: 'IT Support',
        assignedWorker: { collegeId: 'WRK301', name: 'Sarah Byte (IT Crew)' },
        assignedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1002',
        referenceId: 'CMP-202609-1002',
        title: 'Drainage pipe blockage in Hostel cafeteria',
        category: 'Plumbing',
        description: 'Drain line under the washing bay is backed up and water is pooling on the kitchen floor.',
        location: 'Hostel Dining Hall, Washing Bay 2',
        photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600'],
        status: 'WORK_COMPLETED',
        submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
        assignedDepartment: 'Plumbing',
        assignedWorker: { collegeId: 'WRK302', name: 'Charlie Worker (Plumbing Crew)' },
        assignedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        completionNotes: 'Cleared the main drainage trap, flushed line with high-pressure hose, and replaced degraded sealing ring. Clean flow restored.',
        completionPhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
        completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completedBy: 'WRK302',
        proofHistory: [
          {
            submissionNumber: 1,
            workerCollegeId: 'WRK302',
            workerName: 'Charlie Worker (Plumbing Crew)',
            notes: 'Cleared the main drainage trap, flushed line with high-pressure hose, and replaced degraded sealing ring.',
            photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
            submittedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1003',
        referenceId: 'CMP-202609-1003',
        title: 'Water valve leak under chemistry lab sink',
        category: 'Plumbing',
        description: 'Water leaking steadily from shutoff valve under Chemistry Lab sink 4.',
        location: 'Science Block, 1st Floor, Chem Lab 104',
        photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600'],
        status: 'REWORK_REQUIRED',
        submitter: { collegeId: 'STF201', name: 'Prof. Mike Sparks', email: 'mike.sparks@college.edu' },
        assignedDepartment: 'Plumbing',
        assignedWorker: { collegeId: 'WRK302', name: 'Charlie Worker (Plumbing Crew)' },
        assignedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        completionNotes: 'Tightened compression coupling and dried the cabinet floor.',
        completionPhotoUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600',
        completedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        completedBy: 'WRK302',
        reworkReason: 'The issue has not been completely resolved. Water is still slowly dripping from the valve stem when pressure is turned on. Please replace the valve washer or valve assembly completely.',
        reworkRequestedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        reworkRequestedBy: 'ADM001',
        proofHistory: [
          {
            submissionNumber: 1,
            workerCollegeId: 'WRK302',
            workerName: 'Charlie Worker (Plumbing Crew)',
            notes: 'Tightened compression coupling and dried the cabinet floor.',
            photoUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600',
            submittedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
            adminDecision: 'REWORK_REQUIRED',
            adminReason: 'The issue has not been completely resolved. Water is still slowly dripping from the valve stem when pressure is turned on. Please replace the valve washer or valve assembly completely.',
            reviewedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        title: 'Switchboard sparking violently in Lab 304',
        category: 'Electrical',
        description: 'Switchboard sparking violently in Lab 304 switch array',
        location: 'Science Block, 3rd Floor, Lab 304',
        photoUrls: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'],
        status: 'RESOLVED',
        submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
        assignedDepartment: 'Electrical',
        assignedWorker: { collegeId: 'WRK301', name: 'Bob Worker (Electrical Crew)' },
        assignedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        completionNotes: 'Replaced faulty MCB circuit breaker, re-terminated frayed neutral cables, and tested line under load.',
        completionPhotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
        completedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
        completedBy: 'WRK301',
        resolvedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        resolvedBy: 'ADM001',
        proofHistory: [
          {
            submissionNumber: 1,
            workerCollegeId: 'WRK301',
            workerName: 'Bob Worker (Electrical Crew)',
            notes: 'Replaced faulty MCB circuit breaker, re-terminated frayed neutral cables, and tested line under load.',
            photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
            submittedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
            adminDecision: 'RESOLVED',
            reviewedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1008',
        referenceId: 'CMP-202609-1008',
        title: 'Broken wooden door latch and hinges in Seminar Hall 2',
        category: 'Carpentry',
        description: 'Main acoustic wooden door hinges are loose and latch does not shut properly.',
        location: 'Academic Block A, Ground Floor, Seminar Hall 2',
        photoUrls: ['https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=600'],
        status: 'ASSIGNED',
        submitter: { collegeId: 'STF201', name: 'Prof. Mike Sparks', email: 'mike.sparks@college.edu' },
        assignedDepartment: 'Carpentry',
        assignedWorker: { collegeId: 'WRK305', name: 'Edward Carpenter (Carpentry Crew)' },
        assignedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1009',
        referenceId: 'CMP-202609-1009',
        title: 'Sanitation and waste bin clearance in Block C courtyard',
        category: 'Sanitation',
        description: 'Overfilled recycling containers and debris requiring urgent sanitation in central courtyard.',
        location: 'Block C Courtyard, South Wing',
        photoUrls: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600'],
        status: 'ASSIGNED',
        submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
        assignedDepartment: 'Sanitation',
        assignedWorker: { collegeId: 'WRK306', name: 'Sam Cleaner (Sanitation Crew)' },
        assignedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1010',
        referenceId: 'CMP-202609-1010',
        title: 'Loose ceiling tile and window latch in Facilities Office',
        category: 'Facilities',
        description: 'Acoustic ceiling panel sagging and window fastener jammed in Facilities admin wing.',
        location: 'Administrative Block, 1st Floor, Room 102',
        photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600'],
        status: 'ASSIGNED',
        submitter: { collegeId: 'ADM001', name: 'Campus Director (Admin)', email: 'admin@college.edu' },
        assignedDepartment: 'Facilities',
        assignedWorker: { collegeId: 'WRK303', name: 'David Worker (Facilities Crew)' },
        assignedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
      },
      {
        id: 'cmp_1011',
        referenceId: 'CMP-202609-1011',
        title: 'Main server room switch port flapping',
        category: 'IT Support',
        description: 'Rack 3 core switch port is experiencing flapping connections impacting lab computers.',
        location: 'Computer Center, 2nd Floor, Server Room A',
        photoUrls: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600'],
        status: 'ASSIGNED',
        submitter: { collegeId: 'STF201', name: 'Prof. Mike Sparks', email: 'mike.sparks@college.edu' },
        assignedDepartment: 'IT Support',
        assignedWorker: { collegeId: 'WRK304', name: 'Alex Tech (IT Support Crew)' },
        assignedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        assignedBy: 'ADM001',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ];

    this.statusHistory = [
      // History for CMP-1001 (Resolved)
      {
        id: 'sh_101',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: null,
        toStatus: 'SUBMITTED',
        changedBy: 'STU101',
        changedByRole: 'student',
        action: 'Complaint submitted by Student',
        note: 'Switchboard sparking violently in Lab 304 switch array',
        timestamp: new Date(Date.now() - 50 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_102',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: 'SUBMITTED',
        toStatus: 'UNDER_REVIEW',
        changedBy: 'ADM001',
        changedByRole: 'admin',
        action: 'Admin reviewed complaint',
        note: 'High hazard risk flagged. Preparing Electrical squad assignment.',
        timestamp: new Date(Date.now() - 49 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_103',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: 'UNDER_REVIEW',
        toStatus: 'ASSIGNED',
        changedBy: 'ADM001',
        changedByRole: 'admin',
        action: 'Assigned to Electrical Maintenance Crew',
        note: 'Assigned to Bob Worker (Electrical Crew)',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_104',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: 'ASSIGNED',
        toStatus: 'IN_PROGRESS',
        changedBy: 'WRK301',
        changedByRole: 'worker',
        action: 'Worker started work',
        note: 'On site at Lab 304 with replacement breaker assembly and safety gear',
        timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_105',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: 'IN_PROGRESS',
        toStatus: 'WORK_COMPLETED',
        changedBy: 'WRK301',
        changedByRole: 'worker',
        action: 'Worker submitted completed work',
        note: 'Replaced faulty MCB circuit breaker, re-terminated frayed neutral cables. Tested line under load.',
        proofPhotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
        timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_106',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: 'WORK_COMPLETED',
        toStatus: 'ADMIN_REVIEW',
        changedBy: 'ADM001',
        changedByRole: 'admin',
        action: 'Admin reviewed proof',
        note: 'Reviewing photo proof of replaced breaker assembly.',
        timestamp: new Date(Date.now() - 25 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_107',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        fromStatus: 'ADMIN_REVIEW',
        toStatus: 'RESOLVED',
        changedBy: 'ADM001',
        changedByRole: 'admin',
        action: 'Admin approved work — Complaint marked RESOLVED',
        note: 'Work verified and approved. Submitter notified.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },

      // History for CMP-1003 (Rework loop demonstration)
      {
        id: 'sh_301',
        complaintId: 'cmp_1003',
        referenceId: 'CMP-202609-1003',
        fromStatus: null,
        toStatus: 'SUBMITTED',
        changedBy: 'STF201',
        changedByRole: 'staff',
        action: 'Complaint submitted by Staff',
        note: 'Water leaking steadily from shutoff valve under Chemistry Lab sink 4.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_302',
        complaintId: 'cmp_1003',
        referenceId: 'CMP-202609-1003',
        fromStatus: 'SUBMITTED',
        toStatus: 'ASSIGNED',
        changedBy: 'ADM001',
        changedByRole: 'admin',
        action: 'Assigned to Plumbing Crew',
        note: 'Assigned to Charlie Worker (Plumbing Crew)',
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_303',
        complaintId: 'cmp_1003',
        referenceId: 'CMP-202609-1003',
        fromStatus: 'ASSIGNED',
        toStatus: 'IN_PROGRESS',
        changedBy: 'WRK302',
        changedByRole: 'worker',
        action: 'Worker started work',
        note: 'Dispatched to Science Block Room 104 with tools.',
        timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_304',
        complaintId: 'cmp_1003',
        referenceId: 'CMP-202609-1003',
        fromStatus: 'IN_PROGRESS',
        toStatus: 'WORK_COMPLETED',
        changedBy: 'WRK302',
        changedByRole: 'worker',
        action: 'Worker submitted completed work',
        note: 'Tightened compression coupling and dried the cabinet floor.',
        proofPhotoUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
      },
      {
        id: 'sh_305',
        complaintId: 'cmp_1003',
        referenceId: 'CMP-202609-1003',
        fromStatus: 'WORK_COMPLETED',
        toStatus: 'REWORK_REQUIRED',
        changedBy: 'ADM001',
        changedByRole: 'admin',
        action: 'Admin requested rework',
        note: 'The issue has not been completely resolved. Water is still slowly dripping from the valve stem when pressure is turned on. Please replace the valve washer or valve assembly completely.',
        reworkReason: 'The issue has not been completely resolved. Water is still slowly dripping from the valve stem when pressure is turned on. Please replace the valve washer or valve assembly completely.',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ];

    this.feedbacks = [
      {
        id: 'fb_1',
        complaintId: 'cmp_1001',
        referenceId: 'CMP-202609-1001',
        submitterCollegeId: 'STU101',
        rating: 5,
        comment: 'Outstanding response time! Technician replaced the faulty MCB rapidly and left the switchboard clean and certified safe.',
        submittedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString()
      }
    ];
  }
}

module.exports = new DataStore();
