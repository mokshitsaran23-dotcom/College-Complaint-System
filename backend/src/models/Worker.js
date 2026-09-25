const mongoose = require('mongoose');

const categoryToDeptMap = {
  'Electrician': 'Electrical',
  'Plumber': 'Plumbing',
  'Carpenter': 'Carpentry',
  'Cleaner': 'Sanitation',
  'IT': 'IT Support',
  'IT Support': 'IT Support',
  'Others': 'Facilities',
  'Facilities': 'Facilities'
};

const WorkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  workerId: {
    type: String,
    required: [true, 'Worker ID is required'],
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
  category: {
    type: String,
    required: [true, 'Maintenance category is required'],
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    default: 'worker',
    immutable: true
  }
}, {
  timestamps: true,
  collection: 'workers'
});

WorkerSchema.pre('save', function (next) {
  if (!this.collegeId) {
    this.collegeId = this.workerId;
  }
  if (!this.department && this.category) {
    this.department = categoryToDeptMap[this.category] || this.category;
  }
  next();
});

module.exports = mongoose.models.Worker || mongoose.model('Worker', WorkerSchema);
