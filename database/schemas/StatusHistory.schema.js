const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
    immutable: true,
    index: true
  },

  referenceId: {
    type: String,
    required: true,
    immutable: true,
    index: true,
    trim: true
  },

  fromStatus: {
    type: String,
    default: null,
    immutable: true
  },

  toStatus: {
    type: String,
    required: true,
    immutable: true,
    enum: ['Open', 'Assigned', 'In Progress', 'Resolved']
  },

  changedBy: {
    type: String,
    required: true,
    immutable: true,
    trim: true
  },

  changedByRole: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    required: true,
    immutable: true
  },

  note: {
    type: String,
    default: '',
    immutable: true
  },

  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  }
});

// Status history is append-only.
// Existing history records must not be updated or deleted.
StatusHistorySchema.pre(
  ['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne'],
  function () {
    throw new Error('StatusHistory records are immutable and cannot be updated.');
  }
);

StatusHistorySchema.pre(
  ['deleteOne', 'deleteMany', 'findOneAndDelete', 'findOneAndRemove'],
  function () {
    throw new Error('StatusHistory records are immutable and cannot be deleted.');
  }
);

module.exports = StatusHistorySchema;
