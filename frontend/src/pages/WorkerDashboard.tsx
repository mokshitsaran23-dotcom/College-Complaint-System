import React, { useState } from 'react';
import { Complaint, User, StatusHistoryItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
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
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Timeline / History modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [historyItems, setHistoryItems] = useState<StatusHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filter complaints strictly for this worker:
  // - Either assigned to worker's department
  // - Or assigned specifically to worker's collegeId
  const workerComplaints = complaints.filter((c) => {
    const isMyDept = user.department && c.assignedDepartment === user.department;
    const isMyWorker = c.assignedWorker && c.assignedWorker.collegeId === user.collegeId;
    return isMyDept || isMyWorker;
  });

  // Filtered by sub-tab
  const filteredList = workerComplaints.filter((c) => {
    const s = (c.status || '').toUpperCase().replace(/\s+/g, '_');
    if (activeFilter === 'all') return true;
    if (activeFilter === 'ASSIGNED') return s === 'ASSIGNED';
    if (activeFilter === 'IN_PROGRESS') return s === 'IN_PROGRESS';
    if (activeFilter === 'REWORK_REQUIRED') return s === 'REWORK_REQUIRED';
    if (activeFilter === 'WORK_COMPLETED') return s === 'WORK_COMPLETED' || s === 'PENDING_APPROVAL';
    if (activeFilter === 'RESOLVED') return s === 'RESOLVED';
    return true;
  });

  // Status counts for worker
  const counts = {
    all: workerComplaints.length,
    assigned: workerComplaints.filter(c => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'ASSIGNED').length,
    inProgress: workerComplaints.filter(c => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'IN_PROGRESS').length,
    reworkRequired: workerComplaints.filter(c => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'REWORK_REQUIRED').length,
    workCompleted: workerComplaints.filter(c => {
      const s = (c.status || '').toUpperCase().replace(/\s+/g, '_');
      return s === 'WORK_COMPLETED' || s === 'PENDING_APPROVAL';
    }).length,
    resolved: workerComplaints.filter(c => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'RESOLVED').length
  };

  const handlePhotoUpload = (complaintId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        setErrors((prev) => ({ ...prev, [complaintId]: 'Only JPG, PNG, and WebP proof images are allowed.' }));
        return;
      }

      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[complaintId];
        return copy;
      });

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPhotoPreviews((prev) => ({ ...prev, [complaintId]: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartWork = async (complaintId: string) => {
    setUpdatingId(complaintId);
    setErrors((prev) => { const copy = { ...prev }; delete copy[complaintId]; return copy; });

    try {
      const updated = await api.startWork(complaintId);
      onComplaintUpdated(updated);
      setSuccessMsg((prev) => ({ ...prev, [complaintId]: 'Work status changed to IN_PROGRESS.' }));
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

    // MANDATORY PROOF PHOTO VALIDATION ON FRONTEND
    if (!proofPhoto) {
      setErrors((prev) => ({
        ...prev,
        [complaintId]: 'Proof photo is required before submitting completed work.'
      }));
      return;
    }

    setUpdatingId(complaintId);
    setErrors((prev) => { const copy = { ...prev }; delete copy[complaintId]; return copy; });

    try {
      const updated = await api.submitCompletedWork(complaintId, notes, proofPhoto);
      onComplaintUpdated(updated);
      setSuccessMsg((prev) => ({
        ...prev,
        [complaintId]: 'Work completed! Proof photo uploaded and submitted to Admin for verification.'
      }));
      setTimeout(() => {
        setSuccessMsg((prev) => { const copy = { ...prev }; delete copy[complaintId]; return copy; });
      }, 5000);
    } catch (err: any) {
      // Catch backend validation rejections and show clearly
      setErrors((prev) => ({ ...prev, [complaintId]: err.message || 'Submission failed' }));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenTimeline = async (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setLoadingHistory(true);
    try {
      const data = await api.getComplaintById(complaint.id);
      setHistoryItems(data.history || []);
      if (data.complaint) setSelectedComplaint(data.complaint);
    } catch {
      setHistoryItems([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 p-6 rounded-2xl border border-amber-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[11px] rounded-full uppercase tracking-wider">
              👷 Worker Dashboard • {user.department || 'Maintenance'} Crew
            </span>
            <span className="text-xs text-slate-500 font-mono">• Worker ID: {user.collegeId}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Field Maintenance Task Orders</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Resolve issues, upload required completion proof photos, and submit for Admin verification.
          </p>
        </div>
        <div className="px-4 py-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
          Active Tasks: <span className="text-amber-700 font-bold">{workerComplaints.length}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'all'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Assigned ({counts.all})
        </button>

        <button
          onClick={() => setActiveFilter('ASSIGNED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'ASSIGNED'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          New Assignments ({counts.assigned})
        </button>

        <button
          onClick={() => setActiveFilter('IN_PROGRESS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'IN_PROGRESS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          In Progress ({counts.inProgress})
        </button>

        <button
          onClick={() => setActiveFilter('REWORK_REQUIRED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'REWORK_REQUIRED'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          ⚠️ Rework Required ({counts.reworkRequired})
        </button>

        <button
          onClick={() => setActiveFilter('WORK_COMPLETED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'WORK_COMPLETED'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Submitted / Under Review ({counts.workCompleted})
        </button>

        <button
          onClick={() => setActiveFilter('RESOLVED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeFilter === 'RESOLVED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Resolved ({counts.resolved})
        </button>
      </div>

      {filteredList.length === 0 ? (
        <div className="p-16 glass-card rounded-2xl text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="font-bold text-slate-700 text-sm">No tasks in this category</h3>
          <p className="text-xs text-slate-400 mt-1">There are no maintenance tasks currently matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredList.map((item) => {
            const sNorm = (item.status || '').toUpperCase().replace(/\s+/g, '_');
            const isAssigned = sNorm === 'ASSIGNED';
            const isInProgress = sNorm === 'IN_PROGRESS';
            const isRework = sNorm === 'REWORK_REQUIRED';
            const isCompleted = sNorm === 'WORK_COMPLETED' || sNorm === 'PENDING_APPROVAL' || sNorm === 'ADMIN_REVIEW';
            const isResolved = sNorm === 'RESOLVED';

            return (
              <div
                key={item.id}
                className={`glass-card p-6 rounded-2xl border shadow-md flex flex-col justify-between transition-all ${
                  isRework ? 'border-2 border-rose-400 bg-rose-50/20' : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono font-bold text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                      {item.referenceId}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} size="sm" />
                      <button
                        onClick={() => handleOpenTimeline(item)}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        History →
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base">{item.title || item.category}</h4>
                  <p className="text-xs text-slate-600 mt-1">{item.description || 'No description provided'}</p>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <span>📍 <strong className="text-slate-900">Location:</strong> {item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>👤 <strong className="text-slate-700">Reported By:</strong> {item.submitter?.name || item.submitter?.collegeId}</span>
                    </div>
                  </div>

                  {/* REWORK REQUIRED REASON CALLOUT */}
                  {isRework && (
                    <div className="mt-3 p-4 bg-rose-100/90 border-2 border-rose-300 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-rose-900 font-extrabold text-xs">
                        <span>⚠️</span>
                        <span>ADMIN REWORK REQUIRED</span>
                      </div>
                      <p className="text-xs text-rose-950 font-medium">
                        "{item.reworkReason || 'The submitted repair requires rework before approval.'}"
                      </p>
                      <p className="text-[10px] text-rose-800 pt-1">
                        Please resolve the physical issue again and upload a <strong>new proof photo</strong>.
                      </p>
                    </div>
                  )}

                  {/* Original Defect Photo */}
                  {item.photoUrls && item.photoUrls.length > 0 && (
                    <div className="mt-3">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Reported Issue Photo:
                      </span>
                      <img
                        src={item.photoUrls[0]}
                        alt="Initial defect"
                        className="h-32 w-full object-cover rounded-xl border border-slate-200 shadow-inner"
                      />
                    </div>
                  )}
                </div>

                {/* WORKER ACTION PANEL */}
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

                  {/* Resolved Banner & Feedback */}
                  {isResolved && (
                    <div className="space-y-2.5">
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800">
                        ✓ Task Verified & Marked RESOLVED by Admin
                      </div>

                      {item.feedback ? (
                        <div className="p-3.5 bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-white border border-amber-200 rounded-xl shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                              <span>⭐</span> User Resolution Review
                            </span>
                            <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full font-mono">
                              {'★'.repeat(item.feedback.rating)}{'☆'.repeat(5 - item.feedback.rating)} {item.feedback.rating}/5
                            </span>
                          </div>

                          {item.feedback.comment && (
                            <p className="text-xs text-slate-800 bg-white/90 p-2.5 rounded-lg border border-amber-100 font-medium">
                              "{item.feedback.comment}"
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                            <span>
                              Reviewed by:{' '}
                              <strong className="text-slate-700">
                                {item.feedback.submitterName || item.submitter?.name || item.submitter?.collegeId}
                              </strong>
                            </span>
                            <span className="font-mono">
                              {new Date(item.feedback.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-medium">
                          💬 Awaiting user satisfaction rating
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed / Awaiting Admin Review */}
                  {isCompleted && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <span>⏳</span>
                        <span>Submitted for Admin Verification</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        You have submitted completed work with proof photo. Final approval must be granted by Admin.
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

                  {/* Action Button: Start Work */}
                  {isAssigned && (
                    <button
                      onClick={() => handleStartWork(item.id)}
                      disabled={updatingId === item.id}
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {updatingId === item.id ? 'Updating...' : 'Start Work (Set to In Progress) ⚡'}
                    </button>
                  )}

                  {/* WORK COMPLETION SUBMISSION FORM (Active during IN_PROGRESS or REWORK_REQUIRED) */}
                  {(isInProgress || isRework) && (
                    <div className="space-y-3 bg-slate-50/90 p-4 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800">
                          {isRework ? 'Submit Revised Work' : 'Work Completion Submission'}
                        </span>
                        <span className="text-[10px] text-amber-800 font-extrabold bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                          Proof Photo Required *
                        </span>
                      </div>

                      {/* 1. Completion Description */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Completion Description <span className="text-slate-400 font-normal">(Notes on repair done)</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Replaced leaking valve, tested pressure for 10 minutes..."
                          value={operationalNotes[item.id] || ''}
                          onChange={(e) =>
                            setOperationalNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      {/* 2. Proof Photo Upload (Mandatory) */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Proof Photo <span className="text-red-500">* (REQUIRED)</span>
                        </label>
                        <div className="border-2 border-dashed border-amber-300 bg-amber-50/40 rounded-xl p-3 text-center hover:border-amber-500 transition">
                          <input
                            type="file"
                            id={`worker-photo-${item.id}`}
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={(e) => handlePhotoUpload(item.id, e)}
                            className="hidden"
                          />
                          {photoPreviews[item.id] ? (
                            <div className="relative inline-block w-full">
                              <img
                                src={photoPreviews[item.id]}
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
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs font-bold shadow flex items-center justify-center hover:bg-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <label htmlFor={`worker-photo-${item.id}`} className="cursor-pointer block py-3">
                              <div className="text-2xl mb-1">📸</div>
                              <span className="text-xs font-bold text-amber-850 hover:underline">
                                Click to Upload Proof Photo *
                              </span>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                JPG, PNG, or WebP proof of finished physical repair
                              </p>
                            </label>
                          )}
                        </div>
                      </div>

                      {/* 3. Submit Completed Work Button */}
                      <div className="pt-2">
                        <p className="text-[10px] text-slate-500 italic mb-2">
                          * A worker cannot mark complaints as Resolved directly. Submitting sends proof to Admin for verification.
                        </p>
                        <button
                          onClick={() => handleSubmitForApproval(item.id)}
                          disabled={updatingId === item.id}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                        >
                          {updatingId === item.id ? 'Submitting...' : 'Submit Completed Work 📤'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TIMELINE / HISTORY MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {selectedComplaint.referenceId}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-1">
                  {selectedComplaint.title || selectedComplaint.category}
                </h3>
                <p className="text-xs text-slate-500">📍 {selectedComplaint.location}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {selectedComplaint.feedback && (
              <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <span>⭐</span> User Resolution Review
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-mono">
                    {'★'.repeat(selectedComplaint.feedback.rating)}{'☆'.repeat(5 - selectedComplaint.feedback.rating)} {selectedComplaint.feedback.rating}/5
                  </span>
                </div>
                {selectedComplaint.feedback.comment && (
                  <p className="text-slate-800 bg-white p-2 rounded border border-amber-100 italic">
                    "{selectedComplaint.feedback.comment}"
                  </p>
                )}
                <div className="text-[10px] text-slate-500 text-right">
                  Reviewed by {selectedComplaint.feedback.submitterName || selectedComplaint.submitter?.name} on {new Date(selectedComplaint.feedback.submittedAt).toLocaleDateString()}
                </div>
              </div>
            )}

            {loadingHistory ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading audit trail...</div>
            ) : (
              <Timeline
                currentStatus={selectedComplaint.status}
                history={historyItems}
                createdAt={selectedComplaint.createdAt}
              />
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
