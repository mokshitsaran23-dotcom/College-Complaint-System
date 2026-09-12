const jwt = require('./jwtHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'college-super-secret-key-2026';

function generateReferenceId() {
  const d = new Date();
  const ym = d.getFullYear().toString() + String(d.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return 'CMP-' + ym + '-' + rand;
}

class ComplaintService {
  constructor(db = []) {
    this.db = db;
  }

  async create(complaintData) {
    const record = {
      id: 'cmp_' + (this.db.length + 1),
      referenceId: generateReferenceId(),
      category: complaintData.category,
      description: complaintData.description || '',
      location: complaintData.location,
      photoUrls: complaintData.photoUrls || [],
      status: 'Open',
      submitter: complaintData.submitter,
      assignedDepartment: null,
      createdAt: new Date().toISOString()
    };
    this.db.push(record);
    return record;
  }
}

function createComplaintHandler(complaintService) {
  return async (req, res) => {
    // Auth Check
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token.' });
    }

    const { category, description, location, photoUrls } = req.body || {};
    if (!category || !location || (!description && (!photoUrls || photoUrls.length === 0))) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: category, location, and description or photo are required.'
      });
    }

    try {
      const created = await complaintService.create({
        category,
        description,
        location,
        photoUrls,
        submitter: {
          collegeId: user.collegeId,
          name: user.name,
          role: user.role
        }
      });
      return res.status(201).json({ success: true, complaint: created });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  };
}

module.exports = { ComplaintService, createComplaintHandler, JWT_SECRET, generateReferenceId, jwt };
