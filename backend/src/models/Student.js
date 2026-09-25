const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  registerNumber: {
    type: String,
    required: [true, 'Register number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  collegeId: {
    type: String,
    trim: true,
    uppercase: true,
    index: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Year is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'College email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    default: 'student',
    immutable: true
  }
}, {
  timestamps: true,
  collection: 'students'
});

StudentSchema.pre('save', function (next) {
  if (!this.collegeId) {
    this.collegeId = this.registerNumber;
  }
  next();
});

module.exports = mongoose.models.Student || mongoose.model('Student', StudentSchema);
