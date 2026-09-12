const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  referenceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
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
    enum: ['Open', 'Assigned', 'In Progress', 'Resolved'],
    default: 'Open',
    index: true
  },
  assignedDepartment: {
    type: String,
    enum: ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Facilities', null],
    default: null,
    index: true
  },
  assignedAt: {
    type: Date,
    default: null
  },
  assignedBy: {
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
  }
}, {
  timestamps: true
});

ComplaintSchema.index({ submitter: 1, createdAt: -1 });
ComplaintSchema.index({ assignedDepartment: 1, status: 1 });

module.exports = ComplaintSchema;
