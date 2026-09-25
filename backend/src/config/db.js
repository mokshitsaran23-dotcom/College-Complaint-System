const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_complaints';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`🌿 Database: Connected to MongoDB at ${MONGODB_URI}`);
    return true;
  } catch (err) {
    console.warn(`⚠️  Database: MongoDB not reachable (${err.message}). Resilient store is active.`);
    return false;
  }
}

module.exports = { connectDB, MONGODB_URI, mongoose };
