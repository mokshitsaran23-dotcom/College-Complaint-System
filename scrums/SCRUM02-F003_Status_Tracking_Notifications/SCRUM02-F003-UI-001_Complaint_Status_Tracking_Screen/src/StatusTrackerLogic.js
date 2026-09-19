/**
 * Logic for Status Tracking Screen (SCRUM02-F003-UI-001)
 */
function buildTimelineModel(complaint, history = []) {
  if (!complaint) return null;
  const stages = ['Open', 'Assigned', 'In Progress', 'Resolved'];
  const currentIndex = stages.indexOf(complaint.status);

  return {
    referenceId: complaint.referenceId,
    currentStatus: complaint.status,
    category: complaint.category,
    location: complaint.location,
    timelineSteps: stages.map((stage, idx) => ({
      stage,
      isCompleted: idx <= currentIndex,
      isCurrent: idx === currentIndex
    })),
    historyEvents: history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  };
}

async function loadComplaintDetails(referenceId, apiService = null) {
  const api = apiService || {
    get: async (url) => ({
      status: 200,
      data: {
        complaint: { referenceId, status: 'Open', category: 'General', location: 'Campus' },
        history: [{ toStatus: 'Open', timestamp: new Date().toISOString(), note: 'Created' }]
      }
    })
  };
  const res = await api.get('/api/complaints/' + referenceId);
  return buildTimelineModel(res.data.complaint, res.data.history);
}

module.exports = { buildTimelineModel, loadComplaintDetails };
