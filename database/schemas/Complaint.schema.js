const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  referenceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  submitter: {
    collegeId: { type: String, required: true },
    name: { type: String },
    email: { type: String }
  },
  category: {
    type: String,
    required: true,
    enum: ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Sanitation', 'Facilities', 'Other']
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  photoUrls: [{
    type: String
  }],
  status: {
    type: String,
    enum: [
      'SUBMITTED',
      'UNDER_REVIEW',
      'ASSIGNED',
      'IN_PROGRESS',
      'WORK_COMPLETED',
      'ADMIN_REVIEW',
      'REWORK_REQUIRED',
      'RESOLVED',
      'Open',
      'Pending Approval'
    ],
    default: 'SUBMITTED',
    index: true
  },
  assignedDepartment: {
    type: String,
    enum: ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Facilities', 'Sanitation', null],
    default: null,
    index: true
  },
  assignedWorker: {
    collegeId: { type: String, default: null },
    name: { type: String, default: null }
  },
  assignedAt: {
    type: Date,
    default: null
  },
  assignedBy: {
    type: String,
    default: null
  },
  underReviewAt: {
    type: Date,
    default: null
  },
  completionPhotoUrl: {
    type: String,
    default: null
  },
  completionNotes: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedBy: {
    type: String,
    default: null
  },
  reworkReason: {
    type: String,
    default: null
  },
  reworkRequestedAt: {
    type: Date,
    default: null
  },
  reworkRequestedBy: {
    type: String,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: String,
    default: null
  },
  proofHistory: [{
    submissionNumber: { type: Number },
    workerCollegeId: { type: String },
    workerName: { type: String },
    notes: { type: String },
    photoUrl: { type: String },
    submittedAt: { type: Date },
    adminDecision: { type: String },
    adminReason: { type: String },
    reviewedAt: { type: Date }
  }],
  feedback: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

ComplaintSchema.index({ submitter: 1, createdAt: -1 });
ComplaintSchema.index({ assignedDepartment: 1, status: 1 });

module.exports = ComplaintSchema;
