/**
 * Logic for filtering staff view by assigned department (SCRUM02-F002-UI-002)
 */
function filterComplaintsForStaff(allComplaints, staffUser) {
  if (!staffUser || !staffUser.department) {
    return [];
  }
  return allComplaints.filter(c => c.assignedDepartment === staffUser.department);
}

async function fetchStaffQueue(staffUser, apiService = null) {
  const api = apiService || {
    get: async (url, config) => {
      // Mock returns filtered results
      return { status: 200, data: [] };
    }
  };

  const response = await api.get('/api/complaints', {
    params: { department: staffUser.department }
  });
  return response.data;
}

module.exports = { filterComplaintsForStaff, fetchStaffQueue };
