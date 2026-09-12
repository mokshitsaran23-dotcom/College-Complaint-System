/**
 * Admin Queue Assignment Logic (SCRUM02-F002-UI-001)
 */
function validateAssignment(complaintId, department) {
  if (!complaintId) {
    return { isValid: false, error: 'A complaint must be selected' };
  }
  if (!department || !department.trim()) {
    return { isValid: false, error: 'Please select a maintenance department' };
  }
  return { isValid: true, error: null };
}

async function assignDepartment(complaintId, department, apiService = null) {
  const validation = validateAssignment(complaintId, department);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const api = apiService || {
    patch: async (url, data) => ({
      status: 200,
      data: {
        id: complaintId,
        status: 'Assigned',
        assignedDepartment: data.department,
        assignedAt: new Date().toISOString()
      }
    })
  };

  const response = await api.patch('/api/complaints/' + complaintId + '/assign', { department });
  return {
    success: true,
    complaint: response.data
  };
}

module.exports = { validateAssignment, assignDepartment };
