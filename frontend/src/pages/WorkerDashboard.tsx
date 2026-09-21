import React, { useState } from 'react';
import { Complaint, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';

interface WorkerDashboardProps {
  user: User;
  complaints: Complaint[];
  onComplaintUpdated: (c: Complaint) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ user, complaints, onComplaintUpdated }) => {
  const [operationalNotes, setOperationalNotes] = useState<Record<string, string>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<Record<string, string>>({});

  // Filter complaints strictly for worker department
  const workerComplaints = complaints.filter(
    (c) => c.assignedDepartment === user.department
  );

  const handlePhotoUpload = (complaintId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setErrors((prev) => ({ ...prev, [complaintId]: 'Only JPG and PNG proof images are allowed.' }));
        return;
      }
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[complaintId];
        return copy;
      });
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreviews((prev) => ({ ...prev, [complaintId]: objectUrl }));
    }
  };

  const handleStartWork = async (complaintId: string) => {
    setUpdatingId(complaintId);
    setErrors((prev) => { const copy = { ...prev }; delete copy[complaintId]; return copy; });
    try {
      const updated = await api.updateStatus(complaintId, 'In Progress', 'Worker started repair operations.');
      onComplaintUpdated(updated);
      setSuccessMsg((prev) => ({ ...prev, [complaintId]: 'Work status changed to In Progress.' }));
      setTimeout(() => {
        setSuccessMsg((prev) => { const copy = { ...prev }; delete copy[complaintId]; return copy; });
      }, 3500);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, [complaintId]: err.message || 'Failed to update status' }));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSubmitForApproval = async (complaintId: string) => {
    const proofPhoto = photoPreviews[complaintId];
    const notes = operationalNotes[complaintId] || '';

    if (!proofPhoto) {
      setErrors((prev) => ({
        ...prev,
        [complaintId]: '⚠️ Photographic proof of completed work is REQUIRED before submitting for Admin approval.'
      }));
      return;
    }

    setUpdatingId(complaintId);
    setErrors((prev) => { const copy = { ...prev }; delete copy[complaintId]; return copy; });

    try {
      const updated = await api.updateStatus(
        complaintId,
        'Pending Approval',
        notes || 'Work finished by technician. Submitted for Admin approval.',
        proofPhoto,
        notes
      );
      onComplaintUpdated(updated);
      setSuccessMsg((prev) => ({
        ...prev,
        [complaintId]: 'Work proof uploaded! Submitted to Admin for final verification & resolution approval.'
      }));
      setTimeout(() => {
        setSuccessMsg((prev) => { const copy = { ...prev }; delete copy[complaintId]; return copy; });
      }, 5000);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, [complaintId]: err.message || 'Submission failed' }));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 p-6 rounded-2xl border border-amber-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[11px] rounded-full uppercase tracking-wider">
              👷 Worker Dashboard • {user.department} Crew
            </span>
            <span className="text-xs text-slate-500 font-mono">• Worker ID: {user.collegeId}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Field Maintenance Task List</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Execute assigned tasks, take photo proof upon completion, and submit to Admin for final resolution approval.
          </p>
        </div>
        <div className="px-4 py-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
          Assigned Tasks: <span className="text-amber-700 font-bold">{workerComplaints.length}</span>
        </div>
      </div>

      {workerComplaints.length === 0 ? (
        <div className="p-12 glass-card rounded-2xl text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="font-bold text-slate-700 text-sm">No active worker tasks</h3>
          <p className="text-xs text-slate-400 mt-1">There are no maintenance tasks currently assigned to {user.department}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workerComplaints.map((item) => (
            <div
              key={item.id}
              className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    {item.referenceId}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <h4 className="font-extrabold text-slate-800 text-base">{item.category} Issue</h4>
                <p className="text-xs text-slate-600 mt-1">{item.description || 'No description provided'}</p>

                <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <span>📍 <strong className="text-slate-900">Location:</strong> {item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span>👤 <strong className="text-slate-700">Reported By:</strong> {item.submitter.name || item.submitter.collegeId}</span>
                  </div>
                </div>

                {/* Original Defect Photo */}
                {item.photoUrls && item.photoUrls.length > 0 && (
                  <div className="mt-3">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Original Defect Photo:
                    </span>
                    <img
                      src={item.photoUrls[0]}
                      alt="Initial defect"
                      className="h-32 w-full object-cover rounded-xl border border-slate-200 shadow-inner"
                    />
                  </div>
                )}
              </div>

              {/* Worker Action Control Panel */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                {successMsg[item.id] && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold animate-in fade-in flex items-center gap-2">
                    <span>✓</span>
                    <span>{successMsg[item.id]}</span>
                  </div>
                )}

                {errors[item.id] && (
                  <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold animate-in fade-in flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{errors[item.id]}</span>
                  </div>
                )}

                {item.status === 'Resolved' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800">
                    ✓ Task Verified & Marked Resolved by Admin
                  </div>
                )}

                {item.status === 'Pending Approval' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <span>⏳</span>
                      <span>Submitted for Admin Verification & Approval</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      You have uploaded the completion proof photo. Final approval must be granted by the Admin.
                    </p>
                    {(item.completionPhotoUrl || photoPreviews[item.id]) && (
                      <div className="mt-2">
                        <span className="block text-[10px] font-bold uppercase text-amber-700 mb-1">Your Submitted Proof Photo:</span>
                        <img
                          src={item.completionPhotoUrl || photoPreviews[item.id]}
                          alt="Completion proof"
                          className="h-28 w-full object-cover rounded-lg border border-amber-300"
                        />
                      </div>
                    )}
                  </div>
                )}

                {item.status === 'Assigned' && (
                  <button
                    onClick={() => handleStartWork(item.id)}
                    disabled={updatingId === item.id}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {updatingId === item.id ? 'Updating...' : 'Start Work (Set to In Progress)'}
                  </button>
                )}

                {item.status === 'In Progress' && (
                  <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">Worker Completion Evidence</span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">Photo Required</span>
                    </div>

                    {/* Completion Photo Upload */}
                    <div className="border-2 border-dashed border-amber-300 bg-amber-50/40 rounded-xl p-3 text-center hover:border-amber-500 transition">
                      <input
                        type="file"
                        id={`worker-photo-${item.id}`}
                        accept="image/png, image/jpeg"
                        onChange={(e) => handlePhotoUpload(item.id, e)}
                        className="hidden"
                      />
                      {photoPreviews[item.id] || item.completionPhotoUrl ? (
                        <div className="relative inline-block w-full">
                          <img
                            src={photoPreviews[item.id] || item.completionPhotoUrl}
                            alt="Worker completion proof"
                            className="h-36 w-full object-cover rounded-lg border border-amber-300 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreviews((prev) => {
                                const copy = { ...prev };
                                delete copy[item.id];
                                return copy;
                              });
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs font-bold shadow flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label htmlFor={`worker-photo-${item.id}`} className="cursor-pointer block py-2">
                          <div className="text-2xl mb-1">📸</div>
                          <span className="text-xs font-bold text-amber-800 hover:underline">
                            Upload Photo Proof of Finished Work
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5">JPG or PNG (e.g., fixed wiring/pipe)</p>
                        </label>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Work Done Summary / Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Replaced faulty MCB unit and verified voltage output..."
                        value={operationalNotes[item.id] || ''}
                        onChange={(e) =>
                          setOperationalNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="pt-1">
                      <p className="text-[10px] text-slate-500 italic mb-2">
                        * Note: Workers cannot approve tickets directly as "Resolved". Submitting sends proof to Admin for approval.
                      </p>
                      <button
                        onClick={() => handleSubmitForApproval(item.id)}
                        disabled={updatingId === item.id}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                      >
                        {updatingId === item.id ? 'Submitting...' : 'Submit Work for Admin Approval 📤'}
                      </button>
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
