import React, { useState } from 'react';
import { getNextValidStatuses, updateComplaintStatus } from './StatusUpdateLogic';

export const StatusUpdateControl: React.FC<{
  complaintId: string;
  currentStatus: string;
  onStatusUpdated?: (newStatus: string) => void;
}> = ({ complaintId, currentStatus, onStatusUpdated }) => {
  const validNext = getNextValidStatuses(currentStatus);
  const [selectedStatus, setSelectedStatus] = useState(validNext[0] || '');
  const [note, setNote] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!selectedStatus) return;
    setLoading(true);
    const res = await updateComplaintStatus(complaintId, selectedStatus, note);
    setLoading(false);

    if (res.success && res.notificationDispatched) {
      setNotificationSent(true);
      if (onStatusUpdated) onStatusUpdated(selectedStatus);
    }
  };

  if (validNext.length === 0) {
    return <span className="text-gray-400 text-sm italic">Complaint is {currentStatus} (Terminal State)</span>;
  }

  return (
    <div data-testid="status-update-control" className="p-3 border rounded bg-gray-50 flex items-center gap-3">
      <select
        data-testid="status-select"
        value={selectedStatus}
        onChange={e => setSelectedStatus(e.target.value)}
        className="p-1.5 border rounded text-sm bg-white"
      >
        {validNext.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <input
        type="text"
        data-testid="note-input"
        placeholder="Add progress note..."
        value={note}
        onChange={e => setNote(e.target.value)}
        className="p-1.5 border rounded text-sm flex-1 bg-white"
      />
      <button
        data-testid="save-status-btn"
        onClick={handleUpdate}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded"
      >
        {loading ? 'Saving...' : 'Update Status'}
      </button>
      {notificationSent && (
        <span data-testid="notification-badge" className="text-xs text-green-700 font-semibold">
          ✓ Submitter Notified
        </span>
      )}
    </div>
  );
};
