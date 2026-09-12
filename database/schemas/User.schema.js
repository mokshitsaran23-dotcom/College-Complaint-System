const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  collegeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    required: true,
    default: 'student'
  },
  department: {
    type: String,
    enum: ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Facilities', 'Administration', null],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = UserSchema;
