const validDepartments = ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Facilities', 'HVAC'];

function createAssignmentHandler(complaintsDb) {
  return async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden: Only administrators may assign complaints.' });
    }

    const { id } = req.params;
    const { department } = req.body || {};

    if (!department || !validDepartments.includes(department)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing department.' });
    }

    const complaint = complaintsDb.find(c => c.id === id || c.referenceId === id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    complaint.status = 'Assigned';
    complaint.assignedDepartment = department;
    complaint.assignedAt = new Date().toISOString();
    complaint.assignedBy = user.collegeId;

    return res.status(200).json({
      success: true,
      complaint
    });
  };
}

module.exports = { createAssignmentHandler, validDepartments };
