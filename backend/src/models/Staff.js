const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  staffId: {
    type: String,
    required: [true, 'Staff ID is required'],
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
  designation: {
    type: String,
    required: [true, 'Designation is required'],
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
    default: 'staff',
    immutable: true
  }
}, {
  timestamps: true,
  collection: 'staff'
});

StaffSchema.pre('save', function (next) {
  if (!this.collegeId) {
    this.collegeId = this.staffId;
  }
  next();
});

module.exports = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
