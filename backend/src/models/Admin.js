const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    default: 'Campus Administrator'
  },
  adminId: {
    type: String,
    required: [true, 'Admin ID is required'],
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
  email: {
    type: String,
    required: [true, 'Admin email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    default: 'admin',
    immutable: true
  },
  department: {
    type: String,
    default: 'Facilities Management'
  }
}, {
  timestamps: true,
  collection: 'admins'
});

AdminSchema.pre('save', function (next) {
  if (!this.collegeId) {
    this.collegeId = this.adminId;
  }
  next();
});

module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
