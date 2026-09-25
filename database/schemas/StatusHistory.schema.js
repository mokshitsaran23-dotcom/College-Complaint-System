const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
    index: true
  },
  referenceId: {
    type: String,
    required: true,
    index: true
  },
  fromStatus: {
    type: String,
    default: null
  },
  toStatus: {
    type: String,
    required: true
  },
  changedBy: {
    type: String, // College ID of student, admin, or staff
    required: true
  },
  changedByRole: {
    type: String,
    enum: ['student', 'staff', 'worker', 'admin'],
    required: true
  },
  action: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  proofPhotoUrl: {
    type: String,
    default: null
  },
  reworkReason: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = StatusHistorySchema;
