// Standalone complaint schema definition & validation validator
const validCategories = ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Sanitation', 'Facilities', 'Other'];
const validStatuses = ['Open', 'Assigned', 'In Progress', 'Resolved'];

function validateComplaintDoc(doc) {
  const errors = [];
  if (!doc.referenceId) errors.push('referenceId is required');
  if (!doc.category || !validCategories.includes(doc.category)) errors.push('Invalid category: ' + doc.category);
  if (!doc.location) errors.push('location is required');
  if (!doc.status || !validStatuses.includes(doc.status)) errors.push('Invalid status: ' + doc.status);
  if (!doc.submitter || !doc.submitter.collegeId) errors.push('submitter with collegeId is required');
  return {
    isValid: errors.length === 0,
    errors
  };
}

class InMemoryComplaintStore {
  constructor() {
    this.store = new Map();
  }

  async save(doc) {
    const val = validateComplaintDoc(doc);
    if (!val.isValid) {
      throw new Error('Schema Validation Error: ' + val.errors.join(', '));
    }
    const cloned = JSON.parse(JSON.stringify(doc));
    cloned.createdAt = cloned.createdAt || new Date().toISOString();
    this.store.set(doc.referenceId, cloned);
    return cloned;
  }

  async findByReferenceId(refId) {
    const found = this.store.get(refId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }
}

module.exports = { validateComplaintDoc, InMemoryComplaintStore, validCategories, validStatuses };
