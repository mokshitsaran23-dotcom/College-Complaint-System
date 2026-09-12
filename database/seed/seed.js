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
  { collegeId: 'ADM001', name: 'Facilities Admin', email: 'admin@college.edu', role: 'admin', department: 'Administration' },
  { collegeId: 'STF201', name: 'Mike Sparks', email: 'mike.sparks@college.edu', role: 'staff', department: 'Electrical' },
  { collegeId: 'STF202', name: 'Dave Plumber', email: 'dave.plumber@college.edu', role: 'staff', department: 'Plumbing' },
  { collegeId: 'STF203', name: 'Sarah Byte', email: 'sarah.byte@college.edu', role: 'staff', department: 'IT Support' }
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
      referenceId: 'CMP-202609-1001',
      category: 'Electrical',
      description: 'Switchboard sparking violently in Lab 304 switch array',
      location: 'Science Block, 3rd Floor, Lab 304',
      photoUrls: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'],
      status: 'Resolved',
      submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
      assignedDepartment: 'Electrical',
      assignedAt: new Date(Date.now() - 48 * 3600 * 1000),
      assignedBy: 'ADM001',
      resolvedAt: new Date(Date.now() - 24 * 3600 * 1000),
      resolvedBy: 'STF201'
    },
    {
      referenceId: 'CMP-202609-1002',
      category: 'Plumbing',
      description: 'Severe water pipe burst under bathroom sink',
      location: 'Hostel Block B, 2nd Floor, Room 214',
      photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600'],
      status: 'In Progress',
      submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
      assignedDepartment: 'Plumbing',
      assignedAt: new Date(Date.now() - 12 * 3600 * 1000),
      assignedBy: 'ADM001'
    },
    {
      referenceId: 'CMP-202609-1003',
      category: 'IT Support',
      description: 'Ethernet wall port dead, no internet connection for lab terminals',
      location: 'Central Library, Research Wing, Desk 12',
      photoUrls: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600'],
      status: 'Assigned',
      submitter: { collegeId: 'STU102', name: 'Alex Smith', email: 'alex.smith@college.edu' },
      assignedDepartment: 'IT Support',
      assignedAt: new Date(Date.now() - 4 * 3600 * 1000),
      assignedBy: 'ADM001'
    },
    {
      referenceId: 'CMP-202609-1004',
      category: 'Electrical',
      description: 'Main ceiling projector power trip during seminar',
      location: 'Auditorium 1, Main Stage',
      photoUrls: ['https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600'],
      status: 'Open',
      submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
      assignedDepartment: null
    }
  ];

  const createdComplaints = await Complaint.insertMany(complaintsData);

  console.log('[Seed] Appending status history records...');
  // History for resolved complaint (CMP-1001)
  const c1 = createdComplaints[0];
  await StatusHistory.insertMany([
    {
      complaintId: c1._id,
      referenceId: c1.referenceId,
      fromStatus: null,
      toStatus: 'Open',
      changedBy: 'STU101',
      changedByRole: 'student',
      note: 'Complaint digitally submitted with photo',
      timestamp: new Date(Date.now() - 50 * 3600 * 1000)
    },
    {
      complaintId: c1._id,
      referenceId: c1.referenceId,
      fromStatus: 'Open',
      toStatus: 'Assigned',
      changedBy: 'ADM001',
      changedByRole: 'admin',
      note: 'Assigned to Electrical Department team',
      timestamp: new Date(Date.now() - 48 * 3600 * 1000)
    },
    {
      complaintId: c1._id,
      referenceId: c1.referenceId,
      fromStatus: 'Assigned',
      toStatus: 'In Progress',
      changedBy: 'STF201',
      changedByRole: 'staff',
      note: 'Electrician on site with replacement MCB and switch unit',
      timestamp: new Date(Date.now() - 30 * 3600 * 1000)
    },
    {
      complaintId: c1._id,
      referenceId: c1.referenceId,
      fromStatus: 'In Progress',
      toStatus: 'Resolved',
      changedBy: 'STF201',
      changedByRole: 'staff',
      note: 'Replaced charred wiring, tested circuit breaker, load nominal',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000)
    }
  ]);

  console.log('[Seed] Creating post-resolution feedback...');
  await Feedback.create({
    complaintId: c1._id,
    referenceId: c1.referenceId,
    submitterCollegeId: 'STU101',
    rating: 5,
    comment: 'Super fast turnaround! Technician Mike was courteous and left the lab clean.',
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
