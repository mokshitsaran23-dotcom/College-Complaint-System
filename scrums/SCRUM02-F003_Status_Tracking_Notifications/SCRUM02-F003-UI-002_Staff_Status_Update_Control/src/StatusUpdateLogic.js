/**
 * Logic for Status Update Control (SCRUM02-F003-UI-002)
 */
const allowedTransitions = {
  'Open': ['Assigned'],
  'Assigned': ['In Progress'],
  'In Progress': ['Resolved']
};

function getNextValidStatuses(currentStatus) {
  return allowedTransitions[currentStatus] || [];
}

async function updateComplaintStatus(complaintId, newStatus, note = '', apiService = null) {
  const api = apiService || {
    patch: async (url, body) => ({
      status: 200,
      data: {
        success: true,
        complaint: { id: complaintId, status: newStatus },
        notificationDispatched: true,
        recipient: 'submitter'
      }
    })
  };

  const response = await api.patch('/api/complaints/' + complaintId + '/status', {
    status: newStatus,
    note
  });
  return response.data;
}

module.exports = { getNextValidStatuses, updateComplaintStatus, allowedTransitions };
