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
    enum: ['student', 'staff', 'admin'],
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = StatusHistorySchema;
