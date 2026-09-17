class StatusHistoryStore {
  constructor() {
    this.records = [];
  }

  async append(entry) {
    if (!entry.complaintId) throw new Error('complaintId is required');
    if (!entry.toStatus) throw new Error('toStatus is required');

    const row = {
      id: 'sh_' + (this.records.length + 1),
      complaintId: entry.complaintId,
      fromStatus: entry.fromStatus || null,
      toStatus: entry.toStatus,
      changedBy: entry.changedBy || 'system',
      changedByRole: entry.changedByRole || 'system',
      note: entry.note || '',
      timestamp: entry.timestamp || new Date().toISOString()
    };
    this.records.push(row);
    return row;
  }

  async getTimeline(complaintId) {
    return this.records
      .filter(r => r.complaintId === complaintId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
}

module.exports = { StatusHistoryStore };
