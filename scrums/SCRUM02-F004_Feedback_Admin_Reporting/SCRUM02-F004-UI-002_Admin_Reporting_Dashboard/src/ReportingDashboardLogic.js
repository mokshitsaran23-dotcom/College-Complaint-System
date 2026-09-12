/**
 * Logic for Admin Reporting Dashboard (SCRUM02-F004-UI-002)
 */
async function fetchReportSummary(dateRange = {}, apiService = null) {
  const api = apiService || {
    get: async (url, config) => ({
      status: 200,
      data: {
        summary: {
          totalComplaints: 40,
          resolvedCount: 30,
          pendingCount: 10,
          averageRating: 4.6,
          byCategory: { 'Electrical': 18, 'Plumbing': 12, 'IT Support': 10 },
          byLocation: [
            { location: 'Science Block', count: 16 },
            { location: 'Hostel Block C', count: 14 },
            { location: 'Central Library', count: 10 }
          ]
        }
      }
    })
  };

  const response = await api.get('/api/reports/summary', { params: dateRange });
  return response.data.summary;
}

module.exports = { fetchReportSummary };
