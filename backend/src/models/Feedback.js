const mongoose = require('mongoose');
const FeedbackSchema = require('../../../database/schemas/Feedback.schema');

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
