const mongoose = require('mongoose');
const ComplaintSchema = require('../../../database/schemas/Complaint.schema');

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
