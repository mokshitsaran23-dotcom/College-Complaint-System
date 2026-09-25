const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    index: true
  },
  referenceId: {
    type: String,
    required: true,
    index: true
  },
  submitterCollegeId: {
    type: String,
    required: true,
    index: true
  },
  submitterName: {
    type: String,
    default: ''
  },
  workerCollegeId: {
    type: String,
    default: null,
    index: true
  },
  workerName: {
    type: String,
    default: null
  },
  department: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = FeedbackSchema;
