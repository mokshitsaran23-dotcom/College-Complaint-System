const mongoose = require('mongoose');
const { connectDB, MONGODB_URI } = require('../connection');
const UserSchema = require('../schemas/User.schema');
const ComplaintSchema = require('../schemas/Complaint.schema');
const StatusHistorySchema = require('../schemas/StatusHistory.schema');
const FeedbackSchema = require('../schemas/Feedback.schema');

const User = mongoose.model('User', UserSchema);
const Complaint = mongoose.model('Complaint', ComplaintSchema);
const StatusHistory = mongoose.model('StatusHistory', StatusHistorySchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);

const sampleUsers = [
  { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu', role: 'student', department: null },
  { collegeId: 'STU102', name: 'Alex Smith', email: 'alex.smith@college.edu', role: 'student', department: null },
  { collegeId: 'ADM001', name: 'Campus Director (Admin)', email: 'admin@college.edu', role: 'admin', department: 'Facilities Management' },
  { collegeId: 'WRK301', name: 'Bob Worker (Electrical Crew)', email: 'bob.worker@college.edu', role: 'worker', department: 'Electrical' },
  { collegeId: 'WRK302', name: 'Charlie Worker (Plumbing Crew)', email: 'charlie.worker@college.edu', role: 'worker', department: 'Plumbing' },
  { collegeId: 'WRK303', name: 'David Worker (Facilities Crew)', email: 'david.worker@college.edu', role: 'worker', department: 'Facilities' },
  { collegeId: 'WRK304', name: 'Alex Tech (IT Support Crew)', email: 'alex.tech@college.edu', role: 'worker', department: 'IT Support' },
  { collegeId: 'WRK305', name: 'Edward Carpenter (Carpentry Crew)', email: 'edward.carpenter@college.edu', role: 'worker', department: 'Carpentry' },
  { collegeId: 'WRK306', name: 'Sam Cleaner (Sanitation Crew)', email: 'sam.cleaner@college.edu', role: 'worker', department: 'Sanitation' },
  { collegeId: 'STF201', name: 'Prof. Mike Sparks', email: 'mike.sparks@college.edu', role: 'staff', department: 'Electrical' }
];

async function seedDatabase() {
  console.log('[Seed] Connecting to database...');
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.log('[Seed] MongoDB not reachable. Saving seed fixtures to JSON for standalone mode.');
    return;
  }

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Complaint.deleteMany({}),
    StatusHistory.deleteMany({}),
    Feedback.deleteMany({})
  ]);

  console.log('[Seed] Creating demo users...');
  const users = await User.insertMany(sampleUsers);

  console.log('[Seed] Creating sample complaints across lifecycle...');
  const complaintsData = [
    {
      referenceId: 'CMP-202609-1006',
      title: 'Water leakage in Block A restroom',
      category: 'Plumbing',
      description: 'Severe water leakage in Block A 2nd floor restroom near washbasin 3.',
      location: 'Block A, 2nd Floor, Restroom 204',
      photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600'],
      status: 'SUBMITTED',
      submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
      assignedDepartment: null
    },
    {
      referenceId: 'CMP-202609-1005',
      title: 'Auditorium projector power unit tripped',
      category: 'Electrical',
      description: 'Main ceiling projector power trip during seminar',
      location: 'Auditorium 1, Main Stage',
      photoUrls: ['https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600'],
      status: 'ASSIGNED',
      submitter: { collegeId: 'STU102', name: 'Alex Smith', email: 'alex.smith@college.edu' },
      assignedDepartment: 'Electrical',
      assignedWorker: { collegeId: 'WRK301', name: 'Bob Worker (Electrical Crew)' },
      assignedAt: new Date(Date.now() - 3 * 3600 * 1000),
      assignedBy: 'ADM001'
    },
    {
      referenceId: 'CMP-202609-1002',
      title: 'Drainage pipe blockage in Hostel cafeteria',
      category: 'Plumbing',
      description: 'Severe water pipe burst under bathroom sink',
      location: 'Hostel Block B, 2nd Floor, Room 214',
      photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600'],
      status: 'WORK_COMPLETED',
      submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
      assignedDepartment: 'Plumbing',
      assignedWorker: { collegeId: 'WRK302', name: 'Charlie Worker (Plumbing Crew)' },
      assignedAt: new Date(Date.now() - 10 * 3600 * 1000),
      assignedBy: 'ADM001',
      completionNotes: 'Cleared the main drainage trap, replaced degraded sealing ring.',
      completionPhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
      completedAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
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
      assignedAt: new Date(Date.now() - 48 * 3600 * 1000),
      assignedBy: 'ADM001',
      completionNotes: 'Replaced faulty MCB circuit breaker, verified line under load.',
      completionPhotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
      completedAt: new Date(Date.now() - 26 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 24 * 3600 * 1000),
      resolvedBy: 'ADM001'
    }
  ];

  const createdComplaints = await Complaint.insertMany(complaintsData);

  console.log('[Seed] Appending status history records...');
  const c1 = createdComplaints[3]; // CMP-1001
  await StatusHistory.insertMany([
    {
      complaintId: c1._id,
      referenceId: c1.referenceId,
      fromStatus: null,
      toStatus: 'SUBMITTED',
      changedBy: 'STU101',
      changedByRole: 'student',
      action: 'Complaint submitted by Student',
      note: 'Complaint digitally submitted with photo',
      timestamp: new Date(Date.now() - 50 * 3600 * 1000)
    },
    {
      complaintId: c1._id,
      referenceId: c1.referenceId,
      fromStatus: 'SUBMITTED',
      toStatus: 'ASSIGNED',
      changedBy: 'ADM001',
      changedByRole: 'admin',
      action: 'Assigned to Electrical Crew',
      note: 'Assigned to Bob Worker (Electrical Crew)',
      timestamp: new Date(Date.now() - 48 * 3600 * 1000)
    },
    {
      complaintId: c1._id,
      referenceId: c1.referenceId,
      fromStatus: 'ASSIGNED',
      toStatus: 'IN_PROGRESS',
      changedBy: 'WRK301',
      changedByRole: 'worker',
      action: 'Worker started work',
      note: 'Electrician on site with replacement MCB and switch unit',
      timestamp: new Date(Date.now() - 30 * 3600 * 1000)
    },
    {
      complaintId: c1._id,
      referenceId: c1.referenceId,
      fromStatus: 'IN_PROGRESS',
      toStatus: 'WORK_COMPLETED',
      changedBy: 'WRK301',
      changedByRole: 'worker',
      action: 'Worker submitted completed work',
      note: 'Replaced charred wiring, tested circuit breaker, load nominal',
      proofPhotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
      timestamp: new Date(Date.now() - 26 * 3600 * 1000)
    },
    {
      complaintId: c1._id,
      referenceId: c1.referenceId,
      fromStatus: 'WORK_COMPLETED',
      toStatus: 'RESOLVED',
      changedBy: 'ADM001',
      changedByRole: 'admin',
      action: 'Admin approved work — Marked as RESOLVED',
      note: 'Verified and approved by Admin',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000)
    }
  ]);

  console.log('[Seed] Creating post-resolution feedback...');
  await Feedback.create({
    complaintId: c1._id,
    referenceId: c1.referenceId,
    submitterCollegeId: 'STU101',
    rating: 5,
    comment: 'Super fast turnaround! Technician was courteous and left the lab certified safe.',
    submittedAt: new Date(Date.now() - 20 * 3600 * 1000)
  });

  console.log('✅ [Seed] Database successfully seeded with demo users, tickets, history, and feedback!');
  await mongoose.disconnect();
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase, sampleUsers };
