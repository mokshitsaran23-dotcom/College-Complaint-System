function aggregateComplaints(complaints, feedbacks = [], dateRange = {}) {
  const { startDate, endDate } = dateRange;

  let filtered = complaints;
  if (startDate) {
    filtered = filtered.filter(c => new Date(c.createdAt) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(c => new Date(c.createdAt) <= new Date(endDate));
  }

  const byCategory = {};
  const byStatus = {};
  const locationCounts = {};

  filtered.forEach(c => {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    locationCounts[c.location] = (locationCounts[c.location] || 0) + 1;
  });

  const byLocation = Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);

  let averageRating = 0;
  if (feedbacks.length > 0) {
    const totalStars = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    averageRating = Number((totalStars / feedbacks.length).toFixed(1));
  }

  return {
    totalComplaints: filtered.length,
    resolvedCount: byStatus['Resolved'] || 0,
    byCategory,
    byStatus,
    byLocation,
    averageRating
  };
}

function createReportingHandler(complaintsDb, feedbackDb = []) {
  return async (req, res) => {
    const { startDate, endDate } = req.query || {};
    const summary = aggregateComplaints(complaintsDb, feedbackDb, { startDate, endDate });
    return res.status(200).json({ success: true, summary });
  };
}

module.exports = { aggregateComplaints, createReportingHandler };
