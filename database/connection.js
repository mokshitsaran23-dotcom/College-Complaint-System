const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_complaints';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('[Database] Connected to MongoDB at', MONGODB_URI);
  } catch (err) {
    console.warn('[Database] MongoDB connection warning:', err.message);
    console.warn('[Database] Backend and standalone test suites will utilize resilient in-memory fallbacks.');
  }
}

module.exports = { connectDB, mongoose, MONGODB_URI };
