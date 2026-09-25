import React, { useState } from 'react';
import { Complaint, Department, ReportSummary, User, StatusHistoryItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { api } from '../services/api';

interface AdminDashboardProps {
  user: User;
  complaints: Complaint[];
  reportSummary: ReportSummary | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onComplaintUpdated: (c: Complaint) => void;
}

const DEPARTMENTS: Department[] = ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Facilities', 'Sanitation'];

const WORKER_CREWS = [
  { id: 'WRK301', name: 'Bob Worker (Electrical Crew)', dept: 'Electrical' },
  { id: 'WRK302', name: 'Charlie Worker (Plumbing Crew)', dept: 'Plumbing' },
  { id: 'WRK303', name: 'David Worker (Facilities Crew)', dept: 'Facilities' },
  { id: 'WRK304', name: 'Alex Tech (IT Support Crew)', dept: 'IT Support' },
  { id: 'WRK305', name: 'Edward Carpenter (Carpentry Crew)', dept: 'Carpentry' },
  { id: 'WRK306', name: 'Sam Cleaner (Sanitation Crew)', dept: 'Sanitation' },
  { id: 'STF201', name: 'Mike Sparks (Electrical Tech)', dept: 'Electrical' },
  { id: 'STF202', name: 'Dave Plumber (Plumbing Tech)', dept: 'Plumbing' },
  { id: 'STF203', name: 'Sarah Byte (IT Specialist)', dept: 'IT Support' }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  complaints,
  reportSummary,
  activeTab,
  setActiveTab,
  onComplaintUpdated
}) => {
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Department & Worker Assignment State per complaint
  const [selectedDepts, setSelectedDepts] = useState<Record<string, Department>>({});
  const [selectedWorkers, setSelectedWorkers] = useState<Record<string, string>>({});
  const [assignmentNotes, setAssignmentNotes] = useState<Record<string, string>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<Record<string, string>>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Approval / Rework State
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reworkModalComplaint, setReworkModalComplaint] = useState<Complaint | null>(null);
  const [reworkReasonInput, setReworkReasonInput] = useState<string>('');
  const [reworkError, setReworkError] = useState<string | null>(null);

  // Complaint Details Modal State
  const [detailModalComplaint, setDetailModalComplaint] = useState<Complaint | null>(null);
  const [complaintHistory, setComplaintHistory] = useState<StatusHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filter complaints for "Awaiting Verification" (WORK_COMPLETED / ADMIN_REVIEW)
  const pendingVerificationComplaints = complaints.filter(c => {
    const s = (c.status || '').toUpperCase().replace(/\s+/g, '_');
    return s === 'WORK_COMPLETED' || s === 'PENDING_APPROVAL' || s === 'ADMIN_REVIEW';
  });

  // Filter complaints based on statusFilter and searchQuery
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pendingApprovalComplaints = complaints.filter(c => c.status === 'Pending Approval');

  const filteredComplaints = complaints.filter(c => {
    const s = (c.status || '').toUpperCase().replace(/\s+/g, '_');

    // Status filter
    if (statusFilter !== 'all') {
      const targetNorm = statusFilter.toUpperCase().replace(/\s+/g, '_');
      if (targetNorm === 'SUBMITTED' && s !== 'SUBMITTED' && s !== 'OPEN') return false;
      if (targetNorm === 'WORK_COMPLETED' && s !== 'WORK_COMPLETED' && s !== 'PENDING_APPROVAL') return false;
      if (s !== targetNorm) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = c.referenceId?.toLowerCase().includes(q);
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchLoc = c.location?.toLowerCase().includes(q);
      const matchCat = c.category?.toLowerCase().includes(q);
      const matchSubmitter = c.submitter?.name?.toLowerCase().includes(q) || c.submitter?.collegeId?.toLowerCase().includes(q);
      return matchRef || matchTitle || matchDesc || matchLoc || matchCat || matchSubmitter;
    }

    return true;
  });

  // Counts by status
  const counts = {
    all: complaints.length,
    submitted: complaints.filter(c => {
      const s = (c.status || '').toUpperCase().replace(/\s+/g, '_');
      return s === 'SUBMITTED' || s === 'OPEN';
    }).length,
    underReview: complaints.filter(c => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'UNDER_REVIEW').length,
    assigned: complaints.filter(c => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'ASSIGNED').length,
    inProgress: complaints.filter(c => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'IN_PROGRESS').length,
    workCompleted: pendingVerificationComplaints.length,
    reworkRequired: complaints.filter(c => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'REWORK_REQUIRED').length,
    resolved: complaints.filter(c => (c.status || '').toUpperCase().replace(/\s+/g, '_') === 'RESOLVED').length
  };

  const handleOpenDetails = async (complaint: Complaint) => {
    setDetailModalComplaint(complaint);
    setLoadingHistory(true);
    try {
      const data = await api.getComplaintById(complaint.id);
      setComplaintHistory(data.history || []);
      if (data.complaint) {
        setDetailModalComplaint(data.complaint);
      }
    } catch {
      setComplaintHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleReviewComplaint = async (complaintId: string) => {
    setProcessingId(complaintId);
    try {
      const updated = await api.reviewComplaint(complaintId);
      onComplaintUpdated(updated);
      if (detailModalComplaint?.id === complaintId) {
        setDetailModalComplaint(updated);
      }
      setActionSuccess(`Complaint #${updated.referenceId} marked as UNDER_REVIEW.`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to mark under review');
    } finally {
      setProcessingId(null);
  const handleApproveResolution = async (complaintId: string) => {
    setApprovingId(complaintId);
    try {
      const updated = await api.updateStatus(complaintId, 'Resolved', 'Approved and verified by Admin.');
      onComplaintUpdated(updated);
      setAssignSuccess(`Ticket ${updated.referenceId} has been verified and marked as Resolved!`);
      setTimeout(() => setAssignSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRequestRework = async (complaintId: string) => {
    setApprovingId(complaintId);
    try {
      const updated = await api.updateStatus(complaintId, 'In Progress', 'Admin requested rework on completed task.');
      onComplaintUpdated(updated);
      setAssignSuccess(`Ticket ${updated.referenceId} returned to worker crew for rework.`);
      setTimeout(() => setAssignSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Rework request failed');
    } finally {
      setApprovingId(null);
    }
  };

  const handleAssign = async (complaintId: string) => {
    const chosenDept = selectedDepts[complaintId];
    const chosenWorkerId = selectedWorkers[complaintId];
    const chosenWorker = WORKER_CREWS.find(w => w.id === chosenWorkerId);
    const note = assignmentNotes[complaintId];

    const targetDept = chosenDept || chosenWorker?.dept;

    if (!targetDept) {
      setAssignError(prev => ({ ...prev, [complaintId]: 'Please select a department or worker crew.' }));
      return;
    }

    setAssigningId(complaintId);
    setAssignError(prev => { const n = { ...prev }; delete n[complaintId]; return n; });

    try {
      const updated = await api.assignComplaint(
        complaintId,
        targetDept,
        chosenWorker?.id,
        chosenWorker?.name,
        note
      );
      onComplaintUpdated(updated);
      if (detailModalComplaint?.id === complaintId) {
        setDetailModalComplaint(updated);
      }
      setActionSuccess(`Ticket #${updated.referenceId} assigned to ${chosenWorker ? chosenWorker.name : targetDept + ' Crew'} successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setAssignError(prev => ({ ...prev, [complaintId]: err.message || 'Assignment failed' }));
    } finally {
      setAssigningId(null);
    }
  };

  const handleApproveResolution = async (complaintId: string) => {
    setProcessingId(complaintId);
    try {
      const updated = await api.approveWork(complaintId, 'Admin verified proof photo and approved completed work.');
      onComplaintUpdated(updated);
      if (detailModalComplaint?.id === complaintId) {
        setDetailModalComplaint(updated);
      }
      setActionSuccess(`Ticket #${updated.referenceId} approved and marked RESOLVED! Submitter notified.`);
      setTimeout(() => setActionSuccess(null), 4500);
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReworkModal = (complaint: Complaint) => {
    setReworkModalComplaint(complaint);
    setReworkReasonInput('');
    setReworkError(null);
  };

  const handleSubmitRework = async () => {
    if (!reworkModalComplaint) return;
    if (!reworkReasonInput.trim()) {
      setReworkError('Please enter a specific rework reason or instructions for the worker.');
      return;
    }

    setProcessingId(reworkModalComplaint.id);
    setReworkError(null);

    try {
      const updated = await api.requestRework(reworkModalComplaint.id, reworkReasonInput.trim());
      onComplaintUpdated(updated);
      if (detailModalComplaint?.id === reworkModalComplaint.id) {
        setDetailModalComplaint(updated);
      }
      setActionSuccess(`Complaint #${updated.referenceId} marked for rework. Assigned worker notified with your message.`);
      setReworkModalComplaint(null);
      setTimeout(() => setActionSuccess(null), 4500);
    } catch (err: any) {
      setReworkError(err.message || 'Rework request failed');
    } finally {
      setProcessingId(null);
    }
  };

  const downloadReportCsv = () => {
    if (!reportSummary) return;
    let csv = 'Metric,Value\n';
    csv += `Total Complaints,${reportSummary.totalComplaints}\n`;
    csv += `Resolved Count,${reportSummary.resolvedCount}\n`;
    csv += `Average Rating,${reportSummary.averageRating}\n`;
    csv += `Avg Resolution Duration (Hours),${reportSummary.averageResolutionHours}\n\n`;
    csv += 'Category,Count\n';
    Object.entries(reportSummary.byCategory).forEach(([k, v]) => {
      csv += `${k},${v}\n`;
    });
    csv += '\nLocation,Incidents\n';
    reportSummary.byLocation.forEach(loc => {
      csv += `"${loc.location}",${loc.count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Banner */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl animate-in fade-in flex items-center gap-2 shadow-xs">
          <span>✓</span>
          <span>{actionSuccess}</span>
      {assignSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl animate-in fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{assignSuccess}</span>
        </div>
      )}

      {activeTab === 'queue' ? (
        <div className="space-y-6">
          {/* Top KPI Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <button
              onClick={() => setStatusFilter('all')}
              className={`p-3 rounded-xl border text-left transition ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">All Tickets</div>
              <div className="text-xl font-extrabold mt-1">{counts.all}</div>
            </button>

            <button
              onClick={() => setStatusFilter('SUBMITTED')}
              className={`p-3 rounded-xl border text-left transition ${
                statusFilter.toUpperCase() === 'SUBMITTED'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-sky-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">New Submitted</div>
              <div className="text-xl font-extrabold mt-1">{counts.submitted}</div>
            </button>

            <button
              onClick={() => setStatusFilter('UNDER_REVIEW')}
              className={`p-3 rounded-xl border text-left transition ${
                statusFilter.toUpperCase() === 'UNDER_REVIEW'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Under Review</div>
              <div className="text-xl font-extrabold mt-1">{counts.underReview}</div>
            </button>

            <button
              onClick={() => setStatusFilter('ASSIGNED')}
              className={`p-3 rounded-xl border text-left transition ${
                statusFilter.toUpperCase() === 'ASSIGNED'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Assigned</div>
              <div className="text-xl font-extrabold mt-1">{counts.assigned}</div>
            </button>

            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`p-3 rounded-xl border text-left transition ${
                statusFilter.toUpperCase() === 'IN_PROGRESS'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">In Progress</div>
              <div className="text-xl font-extrabold mt-1">{counts.inProgress}</div>
            </button>

            <button
              onClick={() => setStatusFilter('WORK_COMPLETED')}
              className={`p-3 rounded-xl border text-left transition ${
                statusFilter.toUpperCase() === 'WORK_COMPLETED'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Verify Proof</div>
              <div className="text-xl font-extrabold mt-1">{counts.workCompleted}</div>
            </button>

            <button
              onClick={() => setStatusFilter('REWORK_REQUIRED')}
              className={`p-3 rounded-xl border text-left transition ${
                statusFilter.toUpperCase() === 'REWORK_REQUIRED'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Rework</div>
              <div className="text-xl font-extrabold mt-1">{counts.reworkRequired}</div>
            </button>
          </div>

          {/* STEP 5: WORK COMPLETED / AWAITING VERIFICATION PANEL */}
          {pendingVerificationComplaints.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border-2 border-amber-300 bg-amber-50/50 shadow-lg animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <h3 className="text-base font-extrabold text-amber-950">
                    📸 Completed Work Awaiting Admin Verification ({pendingVerificationComplaints.length})
                  </h3>
                </div>
                <span className="text-xs bg-amber-200 text-amber-900 font-bold px-3 py-1 rounded-full">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-800 mb-4">
                Workers have completed physical repairs and uploaded mandatory proof photos. Review before approving or requesting rework.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {pendingVerificationComplaints.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-md flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <span className="font-mono font-bold text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            {item.referenceId}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{item.title || item.category}</h4>
                        </div>
                        <StatusBadge status={item.status} size="sm" />
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 mb-3">
                        <div><strong>📍 Location:</strong> {item.location}</div>
                        <div><strong>👤 Submitter:</strong> {item.submitter?.name || item.submitter?.collegeId}</div>
                        <div><strong>👷 Assigned Crew:</strong> {item.assignedWorker?.name || item.assignedDepartment + ' Crew'}</div>
                      </div>

                      {item.completionNotes && (
                        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-slate-800 mb-3">
                          <strong className="text-amber-900 font-bold block mb-0.5">👷 Worker's Completion Description:</strong>
                          "{item.completionNotes}"
                        </div>
                      )}

                      {/* Side-by-side Proof Photos: Original Defect vs Worker Completion Proof */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Original Defect Photo
                          </span>
                          {item.photoUrls && item.photoUrls.length > 0 ? (
                            <img
                              src={item.photoUrls[0]}
                              alt="Original defect"
                              className="h-32 w-full object-cover rounded-xl border border-slate-200 shadow-inner"
                            />
                          ) : (
                            <div className="h-32 w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                              No original photo
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-1">
                            Worker Proof Photo (Mandatory)
                          </span>
                          {item.completionPhotoUrl ? (
                            <img
                              src={item.completionPhotoUrl}
                              alt="Worker completion proof"
                              className="h-32 w-full object-cover rounded-xl border-2 border-emerald-400 shadow-sm cursor-pointer hover:opacity-95"
                              onClick={() => handleOpenDetails(item)}
                            />
                          ) : (
                            <div className="h-32 w-full bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-red-600 text-xs font-semibold">
                              ⚠️ No Proof Photo
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Decision Controls */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleApproveResolution(item.id)}
                        disabled={processingId === item.id}
                        className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <span>✓</span>
                        <span>{processingId === item.id ? 'Approving...' : 'Approve & Mark Resolved'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenReworkModal(item)}
                        disabled={processingId === item.id}
                        className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <span>✕</span>
                        <span>Request Rework</span>
                      </button>

                      <button
                        onClick={() => handleOpenDetails(item)}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                      >
                        History →
          {/* Pending Approval Verification Panel */}
          {pendingApprovalComplaints.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border-2 border-amber-300 bg-amber-50/40 shadow-lg animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-base font-extrabold text-amber-900">
                  ⚠️ Pending Worker Resolution Approvals ({pendingApprovalComplaints.length})
                </h3>
              </div>
              <p className="text-xs text-amber-800 mb-4">
                Workers have uploaded completion proof photos and submitted these work orders for final Admin verification.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApprovalComplaints.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono font-bold text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {item.referenceId}
                        </span>
                        <StatusBadge status={item.status} size="sm" />
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm">{item.category} • {item.location}</h4>
                      <p className="text-xs text-slate-600 mt-1 italic">"{item.description}"</p>

                      {item.completionNotes && (
                        <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-700">
                          <strong className="text-amber-800">Worker Notes:</strong> {item.completionNotes}
                        </div>
                      )}

                      {/* Display Worker Proof Photo Side-by-Side */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {item.photoUrls && item.photoUrls.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Issue Reported Photo</span>
                            <img src={item.photoUrls[0]} alt="Original defect" className="h-28 w-full object-cover rounded-lg border border-slate-200" />
                          </div>
                        )}
                        {item.completionPhotoUrl && (
                          <div className={!item.photoUrls || item.photoUrls.length === 0 ? 'col-span-2' : ''}>
                            <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Worker Proof Photo</span>
                            <img src={item.completionPhotoUrl} alt="Worker proof" className="h-28 w-full object-cover rounded-lg border-2 border-emerald-400 shadow-xs" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => handleApproveResolution(item.id)}
                        disabled={approvingId === item.id}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
                      >
                        {approvingId === item.id ? 'Approving...' : 'Approve & Mark Resolved ✓'}
                      </button>
                      <button
                        onClick={() => handleRequestRework(item.id)}
                        disabled={approvingId === item.id}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition disabled:opacity-50"
                      >
                        Request Rework ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAIN COMPLAINTS TRIAGE QUEUE */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Master Complaints Queue</h2>
                <p className="text-xs text-slate-500">
                  Review incoming complaints, assign worker crews, and manage the campus maintenance workflow.
                </p>
              </div>

              {/* Search & Status Filter Controls */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search ID, title, location, submitter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-white font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All States ({complaints.length})</option>
                  <option value="SUBMITTED">Submitted ({counts.submitted})</option>
                  <option value="UNDER_REVIEW">Under Review ({counts.underReview})</option>
                  <option value="ASSIGNED">Assigned ({counts.assigned})</option>
                  <option value="IN_PROGRESS">In Progress ({counts.inProgress})</option>
                  <option value="WORK_COMPLETED">Work Completed ({counts.workCompleted})</option>
                  <option value="REWORK_REQUIRED">Rework Required ({counts.reworkRequired})</option>
                  <option value="RESOLVED">Resolved ({counts.resolved})</option>
          {/* Triage Queue */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Departmental Triage & Assignment Queue</h2>
                <p className="text-xs text-slate-500">
                  Review submitted issues and dispatch work orders to responsible maintenance teams.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All States ({complaints.length})</option>
                  <option value="open">Open Only</option>
                  <option value="assigned">Assigned</option>
                  <option value="in progress">In Progress</option>
                  <option value="pending approval">Pending Approval ({pendingApprovalComplaints.length})</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Ticket Ref</th>
                    <th className="py-3 px-3">Complaint Title & Description</th>
                    <th className="py-3 px-3">Location & Category</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Assigned Crew / Worker</th>
                    <th className="py-3 px-3 text-right">Actions & Routing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                        No complaints match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((item) => {
                      const sNorm = (item.status || '').toUpperCase().replace(/\s+/g, '_');
                      const isSubmitted = sNorm === 'SUBMITTED' || sNorm === 'OPEN';
                      const isUnderReview = sNorm === 'UNDER_REVIEW';
                      const isAwaitingVerification = sNorm === 'WORK_COMPLETED' || sNorm === 'PENDING_APPROVAL' || sNorm === 'ADMIN_REVIEW';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-blue-600 align-top">
                            <button
                              onClick={() => handleOpenDetails(item)}
                              className="hover:underline text-left"
                            >
                              {item.referenceId}
                            </button>
                            <div className="text-[10px] text-slate-400 font-normal font-sans">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                              By: {item.submitter?.name || item.submitter?.collegeId}
                            </div>
                          </td>

                          <td className="py-3 px-3 align-top max-w-xs">
                            <div className="font-bold text-slate-900">{item.title || item.category}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{item.description}</div>
                            {item.reworkReason && (
                              <div className="mt-1 text-[10px] text-rose-700 bg-rose-50 p-1 rounded font-semibold border border-rose-200">
                                ⚠️ Rework Reason: {item.reworkReason}
                              </div>
                            )}
                            {item.feedback && (
                              <div className="mt-1.5 text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold w-fit">
                                <span>⭐</span>
                                <span className="font-mono">{item.feedback.rating}/5</span>
                                {item.feedback.comment && (
                                  <span className="text-slate-600 truncate max-w-[130px] italic">"{item.feedback.comment}"</span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 align-top">
                            <div className="font-semibold text-slate-800">{item.location}</div>
                            <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                              {item.category}
                            </span>
                          </td>

                          <td className="py-3 px-3 align-top">
                            <StatusBadge status={item.status} size="sm" />
                          </td>

                          <td className="py-3 px-3 align-top">
                            {/* Department / Worker Assignment Dropdowns */}
                            <div className="space-y-1.5 w-44">
                              <select
                                value={selectedDepts[item.id] || item.assignedDepartment || ''}
                                onChange={(e) =>
                                  setSelectedDepts((prev) => ({ ...prev, [item.id]: e.target.value as Department }))
                                }
                                className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>

                              <select
                                value={selectedWorkers[item.id] || item.assignedWorker?.collegeId || ''}
                                onChange={(e) =>
                                  setSelectedWorkers((prev) => ({ ...prev, [item.id]: e.target.value }))
                                }
                                className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">Select Worker/Crew</option>
                                {(() => {
                                  const curDept = selectedDepts[item.id] || item.assignedDepartment;
                                  const relevant = curDept ? WORKER_CREWS.filter(w => w.dept === curDept) : WORKER_CREWS;
                                  const listToRender = relevant.length > 0 ? relevant : WORKER_CREWS;
                                  return listToRender.map((w) => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.dept})</option>
                                  ));
                                })()}
                              </select>

                              {assignError[item.id] && (
                                <div className="text-[10px] text-red-600 font-semibold">{assignError[item.id]}</div>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right align-top space-y-1">
                            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5">
                              {isSubmitted && (
                                <button
                                  onClick={() => handleReviewComplaint(item.id)}
                                  disabled={processingId === item.id}
                                  className="px-2.5 py-1 text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition"
                                >
                                  Review
                                </button>
                              )}

                              <button
                                onClick={() => handleAssign(item.id)}
                                disabled={assigningId === item.id}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition disabled:opacity-50"
                              >
                                {assigningId === item.id ? 'Assigning...' : (item.assignedDepartment ? 'Re-Assign' : 'Assign Crew')}
                              </button>

                              <button
                                onClick={() => handleOpenDetails(item)}
                                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                              >
                                Details →
                              </button>
                            </div>

                            {isAwaitingVerification && (
                              <div className="flex justify-end gap-1 pt-1">
                                <button
                                  onClick={() => handleApproveResolution(item.id)}
                                  className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700"
                                >
                                  Approve ✓
                                </button>
                                <button
                                  onClick={() => handleOpenReworkModal(item)}
                                  className="px-2 py-0.5 text-[10px] bg-rose-100 text-rose-800 font-bold rounded hover:bg-rose-200"
                                >
                                  Rework ✕
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ANALYTICS & REPORTS TAB */
      </div>
    ) : (
        /* Analytics & Reporting Tab */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Operational Analytics & KPI Dashboard</h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time compliance, resolution velocities, and departmental resolution performance.
              </p>
            </div>
            <button
              onClick={downloadReportCsv}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <span>📥</span>
              <span>Export CSV Audit Report</span>
            </button>
          </div>

          {reportSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Logged Tickets</span>
                <div className="text-2xl font-extrabold text-slate-800 mt-1">{reportSummary.totalComplaints}</div>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-emerald-600 uppercase">Resolved & Verified</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">{reportSummary.resolvedCount}</div>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-amber-600 uppercase">Average Submitter Rating</span>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">★ {reportSummary.averageRating} / 5.0</div>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-blue-600 uppercase">Avg Resolution Time</span>
                <div className="text-2xl font-extrabold text-blue-600 mt-1">{reportSummary.averageResolutionHours} Hours</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REWORK MODAL: Admin enters required reason */}
      {reworkModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {reworkModalComplaint.referenceId}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">Request Rework on Completed Work</h3>
                <p className="text-xs text-slate-500">
                  Assigned Crew: {reworkModalComplaint.assignedWorker?.name || reworkModalComplaint.assignedDepartment + ' Crew'}
                </p>
              </div>
              <button
                onClick={() => setReworkModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {reworkError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                ⚠️ {reworkError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Reason for Rework / Required Fixes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. The issue has not been completely resolved. Water is still leaking from the valve joint. Please reseal connection."
                  value={reworkReasonInput}
                  onChange={(e) => setReworkReasonInput(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This message will be dispatched immediately as an alert to the assigned worker/crew.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReworkModalComplaint(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRework}
                  disabled={processingId === reworkModalComplaint.id}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {processingId === reworkModalComplaint.id ? 'Sending...' : 'Send Rework Request to Worker 📤'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLAINT DETAILS & AUDIT TIMELINE MODAL */}
      {detailModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full p-6 max-h-[92vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {detailModalComplaint.referenceId}
                  </span>
                  <StatusBadge status={detailModalComplaint.status} size="sm" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {detailModalComplaint.title || detailModalComplaint.category}
                </h3>
                <p className="text-xs text-slate-500">📍 {detailModalComplaint.location} • Category: {detailModalComplaint.category}</p>
              </div>
              <button
                onClick={() => setDetailModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Description & Metadata */}
            <div className="text-xs text-slate-700 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div><strong className="text-slate-900">Description:</strong> {detailModalComplaint.description}</div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                <div><strong>Submitter:</strong> {detailModalComplaint.submitter?.name} ({detailModalComplaint.submitter?.collegeId})</div>
                <div><strong>Assigned To:</strong> {detailModalComplaint.assignedWorker?.name || detailModalComplaint.assignedDepartment || 'Unassigned'}</div>
              </div>
            </div>

            {/* Submitter Feedback Display */}
            {detailModalComplaint.feedback && (
              <div className="p-3.5 bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-white border border-amber-200 rounded-xl space-y-2 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs">
                    <span>⭐</span> Submitter Satisfaction Review
                  </span>
                  <span className="font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full font-mono text-xs">
                    {'★'.repeat(detailModalComplaint.feedback.rating)}{'☆'.repeat(5 - detailModalComplaint.feedback.rating)} {detailModalComplaint.feedback.rating}/5 Stars
                  </span>
                </div>
                {detailModalComplaint.feedback.comment && (
                  <p className="text-slate-800 italic bg-white/90 p-2.5 rounded-lg border border-amber-100 text-[11px]">
                    "{detailModalComplaint.feedback.comment}"
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>
                    Submitted by: <strong className="text-slate-700">{detailModalComplaint.feedback.submitterName || detailModalComplaint.submitter?.name}</strong>
                  </span>
                  {detailModalComplaint.feedback.workerName && (
                    <span>
                      Serviced Worker: <strong className="text-slate-700">{detailModalComplaint.feedback.workerName}</strong>
                    </span>
                  )}
                  {detailModalComplaint.feedback.submittedAt && (
                    <span className="font-mono text-slate-400">
                      {new Date(detailModalComplaint.feedback.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Photos Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Original Defect Photo
                </span>
                {detailModalComplaint.photoUrls && detailModalComplaint.photoUrls.length > 0 ? (
                  <img
                    src={detailModalComplaint.photoUrls[0]}
                    alt="Original defect"
                    className="h-36 w-full object-cover rounded-xl border border-slate-200 shadow-inner"
                  />
                ) : (
                  <div className="h-36 w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                    No initial photo
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  Worker Proof Photo
                </span>
                {detailModalComplaint.completionPhotoUrl ? (
                  <img
                    src={detailModalComplaint.completionPhotoUrl}
                    alt="Worker proof"
                    className="h-36 w-full object-cover rounded-xl border-2 border-emerald-400 shadow-inner"
                  />
                ) : (
                  <div className="h-36 w-full bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-center text-amber-700 text-xs">
                    Awaiting worker completion
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Component with entire History */}
            <div>
              {loadingHistory ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading audit history...</div>
              ) : (
                <Timeline
                  currentStatus={detailModalComplaint.status}
                  history={complaintHistory}
                  createdAt={detailModalComplaint.createdAt}
                />
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                Created on {new Date(detailModalComplaint.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                {detailModalComplaint.status === 'WORK_COMPLETED' && (
                  <>
                    <button
                      onClick={() => {
                        const c = detailModalComplaint;
                        setDetailModalComplaint(null);
                        handleOpenReworkModal(c);
                      }}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 hover:bg-rose-100"
                    >
                      Request Rework
                    </button>
                    <button
                      onClick={() => handleApproveResolution(detailModalComplaint.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-xs"
                    >
                      Approve & Resolve ✓
                    </button>
                  </>
                )}
                <button
                  onClick={() => setDetailModalComplaint(null)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
