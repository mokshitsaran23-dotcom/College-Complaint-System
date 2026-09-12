import React, { useState } from 'react';
import { Complaint, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';

interface StaffDashboardProps {
  user: User;
  complaints: Complaint[];
  onComplaintUpdated: (c: Complaint) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, complaints, onComplaintUpdated }) => {
  const [operationalNotes, setOperationalNotes] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notifBanners, setNotifBanners] = useState<Record<string, string>>({});

  // Filter complaints strictly for staff department
  const departmentComplaints = complaints.filter(
    (c) => c.assignedDepartment === user.department
  );

  const handleUpdateStatus = async (complaintId: string, nextStatus: string) => {
    setUpdatingId(complaintId);
    const note = operationalNotes[complaintId] || '';

    try {
      const updated = await api.updateStatus(complaintId, nextStatus, note);
      onComplaintUpdated(updated);
      setNotifBanners((prev) => ({
        ...prev,
        [complaintId]: `Status moved to '${nextStatus}'. Submitter notified in real-time!`
      }));
      setTimeout(() => {
        setNotifBanners((prev) => {
          const copy = { ...prev };
          delete copy[complaintId];
          return copy;
        });
      }, 4000);
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[11px] rounded-full uppercase tracking-wider">
              {user.department} Department
            </span>
            <span className="text-xs text-slate-400 font-mono">• Technician: {user.collegeId}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Assigned Operational Work Orders</h2>
          <p className="text-xs text-slate-500">
            Work orders assigned to your squad. Advance ticket status to automatically notify submitters.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
          Active Tickets: <span className="text-blue-600 font-bold">{departmentComplaints.length}</span>
        </div>
      </div>

      {departmentComplaints.length === 0 ? (
        <div className="p-12 glass-card rounded-2xl text-center">
          <div className="text-4xl mb-2">✨</div>
          <h3 className="font-bold text-slate-700 text-sm">All work orders clear</h3>
          <p className="text-xs text-slate-400 mt-1">No open work orders are currently routed to {user.department}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departmentComplaints.map((item) => (
            <div
              key={item.id}
              className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                    {item.referenceId}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <h4 className="font-bold text-slate-800 text-sm">{item.category}</h4>
                <p className="text-xs text-slate-600 mt-1">{item.description || 'No description provided'}</p>

                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] space-y-1">
                  <div className="flex items-center gap-1 text-slate-600">
                    <span className="font-semibold">📍 Location:</span>
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="font-semibold">👤 Submitter:</span>
                    <span>{item.submitter.name || item.submitter.collegeId}</span>
                  </div>
                </div>

                {item.photoUrls && item.photoUrls.length > 0 && (
                  <div className="mt-3">
                    <img
                      src={item.photoUrls[0]}
                      alt="Defect"
                      className="h-28 w-full object-cover rounded-xl border border-slate-200/60"
                    />
                  </div>
                )}
              </div>

              {/* Status Update Control */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                {notifBanners[item.id] && (
                  <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold animate-in fade-in">
                    ✓ {notifBanners[item.id]}
                  </div>
                )}

                {item.status === 'Resolved' ? (
                  <div className="p-2 bg-slate-100 rounded-lg text-center text-xs font-semibold text-slate-600">
                    ✓ Ticket Resolved & Closed
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Operational progress note (e.g. Dispatched squad)..."
                      value={operationalNotes[item.id] || ''}
                      onChange={(e) =>
                        setOperationalNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                    />

                    <div className="flex gap-2">
                      {item.status === 'Assigned' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'In Progress')}
                          disabled={updatingId === item.id}
                          className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-xs transition"
                        >
                          {updatingId === item.id ? 'Updating...' : 'Start Work (In Progress)'}
                        </button>
                      )}

                      {item.status === 'In Progress' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'Resolved')}
                          disabled={updatingId === item.id}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition"
                        >
                          {updatingId === item.id ? 'Closing...' : 'Mark Work Resolved ✓'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
