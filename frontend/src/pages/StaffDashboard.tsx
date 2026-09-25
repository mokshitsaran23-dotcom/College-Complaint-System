import React, { useState } from 'react';
import { Complaint, User, StatusHistoryItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { FeedbackModal } from '../components/FeedbackModal';
import { api } from '../services/api';

interface StaffDashboardProps {
  user: User;
  complaints: Complaint[];
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onComplaintCreated?: (c: Complaint) => void;
  onComplaintUpdated: (c: Complaint) => void;
}

const CATEGORIES = ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Sanitation', 'Facilities', 'Other'];
const BUILDINGS = ['Academic Block A', 'Academic Block B', 'Science Block', 'Staff Quarters', 'Central Library', 'Auditorium 1', 'Administrative Block'];

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  user,
  complaints,
  onComplaintCreated,
  onComplaintUpdated
}) => {
  const [internalTab, setInternalTab] = useState<'my_complaints' | 'create_complaint' | 'dept_orders'>('my_complaints');

  // Create Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IT Support');
  const [building, setBuilding] = useState('Academic Block A');
  const [roomDetail, setRoomDetail] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Department Work Orders State
  const [operationalNotes, setOperationalNotes] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notifBanners, setNotifBanners] = useState<Record<string, string>>({});

  // History & Detail Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintHistory, setComplaintHistory] = useState<StatusHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [feedbackModalComplaint, setFeedbackModalComplaint] = useState<Complaint | null>(null);

  // Complaints submitted by this staff member
  const myComplaints = complaints.filter(
    (c) =>
      c.submitter?.collegeId === user.collegeId ||
      c.submitter?.email === user.email ||
      (c.submitter?.collegeId && user.staffId && c.submitter.collegeId === user.staffId)
  );

  // Complaints routed to this staff member's department
  const departmentComplaints = complaints.filter(
    (c) => c.assignedDepartment === user.department
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        setFormErrors(prev => ({ ...prev, file: 'Only JPG, PNG, and WebP images are supported.' }));
        return;
      }
      setFormErrors(prev => { const n = { ...prev }; delete n.file; return n; });

      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (description.trim().length < 10) errors.description = 'Please provide at least 10 characters describing the issue';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const location = `${building}${roomDetail.trim() ? ', ' + roomDetail.trim() : ''}`;
      const payload = {
        title: title.trim(),
        category,
        location,
        description: description.trim(),
        photoUrls: photoPreview ? [photoPreview] : [],
        submitter: {
          collegeId: user.collegeId || user.staffId || 'STAFF',
          name: user.name,
          email: user.email,
          role: 'staff'
        }
      };

      const newComplaint = await api.createComplaint(payload);
      if (onComplaintCreated) onComplaintCreated(newComplaint);
      setSubmittedComplaint(newComplaint);

      // Reset form
      setTitle('');
      setDescription('');
      setRoomDetail('');
      setPhotoPreview(null);
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Failed to submit staff complaint' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetailsModal = async (c: Complaint) => {
    setSelectedComplaint(c);
    setLoadingHistory(true);
    try {
      const data = await api.getComplaintById(c.id);
      setComplaintHistory(data.history || []);
      if (data.complaint) {
        setSelectedComplaint(data.complaint);
      }
    } catch {
      setComplaintHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

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
      
      {/* Staff Profile & Header Banner */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/90 shadow-sm bg-gradient-to-r from-indigo-50/50 via-white to-blue-50/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-500/20">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800">{user.name}</h2>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                  Staff / Faculty Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff ID: <span className="font-mono font-semibold text-slate-700">{user.collegeId || user.staffId}</span> • 
                Dept: <span className="font-semibold text-slate-700">{user.department || 'Academic Affairs'}</span> • 
                Designation: <span className="font-semibold text-slate-700">{user.designation || 'Faculty Member'}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-3 text-xs">
            <div className="px-3.5 py-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">My Tickets</div>
              <div className="text-lg font-black text-indigo-600">{myComplaints.length}</div>
            </div>
            <div className="px-3.5 py-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Dept Orders</div>
              <div className="text-lg font-black text-blue-600">{departmentComplaints.length}</div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-200/60">
          <button
            type="button"
            onClick={() => setInternalTab('my_complaints')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              internalTab === 'my_complaints'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>📋</span>
            <span>My Submitted Complaints ({myComplaints.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setInternalTab('create_complaint')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              internalTab === 'create_complaint'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>➕</span>
            <span>Report New Staff Issue</span>
          </button>

          <button
            type="button"
            onClick={() => setInternalTab('dept_orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              internalTab === 'dept_orders'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>🏢</span>
            <span>Department Work Orders ({departmentComplaints.length})</span>
          </button>
        </div>
      </div>

      {/* ----------------- TAB: MY SUBMITTED COMPLAINTS ----------------- */}
      {internalTab === 'my_complaints' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-800">
              Complaints Raised by You
            </h3>
            <button
              onClick={() => setInternalTab('create_complaint')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              + Submit Issue
            </button>
          </div>

          {myComplaints.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center border border-slate-200/80">
              <div className="text-3xl mb-2">📋</div>
              <h4 className="font-bold text-slate-700 text-sm">No complaints submitted yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Need maintenance for laboratory equipment, office electricals, or departmental infrastructure?
              </p>
              <button
                onClick={() => setInternalTab('create_complaint')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-700 transition"
              >
                Log First Staff Complaint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myComplaints.map((item) => {
                const isResolved = (item.status || '').toUpperCase().replace(/\s+/g, '_') === 'RESOLVED';
                return (
                  <div
                    key={item.id}
                    onClick={() => openDetailsModal(item)}
                    className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {item.referenceId}
                        </span>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                      <div className="mt-3 text-[11px] text-slate-600 flex items-center gap-1">
                        <span>📍</span>
                        <span className="font-medium">{item.location}</span>
                      </div>

                      {item.assignedDepartment && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          Routed to: <span className="font-semibold text-slate-700">{item.assignedDepartment} Squad</span>
                        </div>
                      )}

                      {/* Submitted Review Display */}
                      {isResolved && item.feedback && (
                        <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs space-y-1.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-amber-900 text-[11px] flex items-center gap-1">
                              <span>⭐</span> Your Submitted Review
                            </span>
                            <span className="text-xs font-bold text-amber-800 font-mono">
                              {'★'.repeat(item.feedback.rating)}{'☆'.repeat(5 - item.feedback.rating)} {item.feedback.rating}/5
                            </span>
                          </div>
                          {item.feedback.comment && (
                            <p className="text-slate-800 italic bg-white/80 p-2 rounded-lg border border-amber-100/80 text-[11px]">
                              "{item.feedback.comment}"
                            </p>
                          )}
                          {item.assignedWorker?.name && (
                            <div className="text-[10px] text-slate-500">
                              Serviced by: <strong className="text-slate-700">{item.assignedWorker.name}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        {isResolved && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFeedbackModalComplaint(item);
                            }}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                              item.feedback
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                            }`}
                          >
                            {item.feedback ? `★ ${item.feedback.rating}/5 Rated` : '★ Rate Service'}
                          </button>
                        )}
                        <span className="text-indigo-600 font-semibold hover:underline">View Workflow ➔</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB: CREATE COMPLAINT ----------------- */}
      {internalTab === 'create_complaint' && (
        <div className="max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm bg-white">
          <div className="text-center mb-6">
            <h3 className="text-lg font-black text-slate-800">Submit Staff / Departmental Complaint</h3>
            <p className="text-xs text-slate-500 mt-1">
              Issues submitted here immediately trigger institutional notification to Campus Admin with status <span className="font-bold text-blue-600">SUBMITTED</span>.
            </p>
          </div>

          {submittedComplaint && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-800">
              <div>
                <p className="font-bold text-sm">Complaint Submitted Successfully!</p>
                <p className="mt-1">
                  Reference: <strong className="font-mono">{submittedComplaint.referenceId}</strong>. Real-time admin notification has been dispatched.
                </p>
              </div>
              <button
                onClick={() => setSubmittedComplaint(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {formErrors.submit && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
              {formErrors.submit}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Complaint Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Broken Projector in Computer Science Seminar Hall"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              {formErrors.title && <p className="text-[11px] text-rose-500 mt-1">{formErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campus Building <span className="text-rose-500">*</span>
                </label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room / Specific Location</label>
              <input
                type="text"
                placeholder="e.g. Lab 304, HOD Office, 2nd Floor Corridor"
                value={roomDetail}
                onChange={(e) => setRoomDetail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the issue in detail to assist workers in troubleshooting..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              {formErrors.description && <p className="text-[11px] text-rose-500 mt-1">{formErrors.description}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Attach Issue Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {photoPreview && (
                <div className="mt-2 relative inline-block">
                  <img src={photoPreview} alt="Preview" className="h-24 rounded-xl border border-slate-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/25 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Staff Ticket...' : 'Submit Staff Complaint ➔'}
            </button>
          </form>
        </div>
      )}

      {/* ----------------- TAB: DEPARTMENT WORK ORDERS ----------------- */}
      {internalTab === 'dept_orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Department Work Orders ({user.department || 'General'})
              </h3>
              <p className="text-xs text-slate-500">
                Tickets assigned to the {user.department || 'facilities'} squad.
              </p>
            </div>
          </div>

          {departmentComplaints.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center border border-slate-200/80">
              <div className="text-3xl mb-2">✨</div>
              <h4 className="font-bold text-slate-700 text-sm">All department work orders clear</h4>
              <p className="text-xs text-slate-400 mt-1">No open issues are currently routed to {user.department}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departmentComplaints.map((item) => {
                const s = (item.status || '').toUpperCase().replace(/\s+/g, '_');
                const isResolved = s === 'RESOLVED';
                const isAssigned = s === 'ASSIGNED';

                return (
                  <div
                    key={item.id}
                    className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                          {item.referenceId}
                        </span>
                        <StatusBadge status={item.status} size="sm" />
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{item.description}</p>

                      <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] space-y-1">
                        <div className="flex items-center gap-1 text-slate-600">
                          <span className="font-semibold">📍 Location:</span>
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className="font-semibold">👤 Submitter:</span>
                          <span>{item.submitter?.name || item.submitter?.collegeId}</span>
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

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      {notifBanners[item.id] && (
                        <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold">
                          ✓ {notifBanners[item.id]}
                        </div>
                      )}

                      {isResolved ? (
                        <div className="space-y-2">
                          <div className="p-2 bg-emerald-50 rounded-lg text-center text-xs font-semibold text-emerald-800 border border-emerald-200">
                            ✓ Ticket Verified & Resolved by Admin
                          </div>
                          {item.feedback && (
                            <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                                  <span>⭐</span> Submitter Review
                                </span>
                                <span className="text-amber-800 font-mono font-bold text-xs">
                                  {'★'.repeat(item.feedback.rating)}{'☆'.repeat(5 - item.feedback.rating)} {item.feedback.rating}/5
                                </span>
                              </div>
                              {item.feedback.comment && (
                                <p className="italic text-slate-700 bg-white/80 p-1.5 rounded text-[11px]">
                                  "{item.feedback.comment}"
                                </p>
                              )}
                              <div className="text-[10px] text-slate-500">
                                Submitter: <strong className="text-slate-700">{item.feedback.submitterName || item.submitter?.name}</strong>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Operational progress note..."
                            value={operationalNotes[item.id] || ''}
                            onChange={(e) =>
                              setOperationalNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                          />

                          <div className="flex gap-2">
                            {isAssigned && (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'IN_PROGRESS')}
                                disabled={updatingId === item.id}
                                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition"
                              >
                                {updatingId === item.id ? 'Updating...' : 'Start Work (IN_PROGRESS)'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail / Timeline Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {selectedComplaint.referenceId}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">{selectedComplaint.title}</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedComplaint.status} size="md" />
                <span className="text-xs text-slate-400">
                  Created {new Date(selectedComplaint.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div><strong>Category:</strong> {selectedComplaint.category}</div>
                <div><strong>Location:</strong> {selectedComplaint.location}</div>
                <div><strong>Description:</strong> {selectedComplaint.description}</div>
              </div>

              {/* RESOLUTION DETAILS & SUBMITTER REVIEW */}
              {(selectedComplaint.status || '').toUpperCase() === 'RESOLVED' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                    <span>✓</span>
                    <span>Complaint Resolved Successfully</span>
                  </div>
                  {selectedComplaint.resolvedAt && (
                    <div className="text-[11px] text-emerald-700">
                      <strong>Resolved Date:</strong> {new Date(selectedComplaint.resolvedAt).toLocaleString()}
                    </div>
                  )}
                  {selectedComplaint.completionPhotoUrl && (
                    <div className="pt-1">
                      <span className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">
                        📸 Verified Maintenance Proof Photo:
                      </span>
                      <img
                        src={selectedComplaint.completionPhotoUrl}
                        alt="Verified resolution proof"
                        className="h-36 w-full object-cover rounded-xl border border-emerald-300 shadow-xs"
                      />
                    </div>
                  )}
                  {selectedComplaint.feedback && (
                    <div className="mt-2 p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-900 flex items-center gap-1 text-[11px]">
                          <span>⭐</span> Submitter Review
                        </span>
                        <span className="font-bold text-amber-800 font-mono text-xs">
                          {'★'.repeat(selectedComplaint.feedback.rating)}{'☆'.repeat(5 - selectedComplaint.feedback.rating)} {selectedComplaint.feedback.rating}/5
                        </span>
                      </div>
                      {selectedComplaint.feedback.comment && (
                        <p className="text-slate-800 italic bg-white/90 p-2 rounded-lg border border-amber-100 text-[11px]">
                          "{selectedComplaint.feedback.comment}"
                        </p>
                      )}
                      {selectedComplaint.assignedWorker?.name && (
                        <div className="text-[10px] text-slate-600">
                          Resolved by: <strong className="text-slate-800">{selectedComplaint.assignedWorker.name}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Complaint Lifecycle & Audit Timeline
                </h4>
                {loadingHistory ? (
                  <p className="text-xs text-slate-400">Loading audit history...</p>
                ) : (
                  <Timeline
                    history={complaintHistory}
                    currentStatus={selectedComplaint.status}
                    createdAt={selectedComplaint.createdAt}
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-mono">
                  Ref: {selectedComplaint.referenceId}
                </span>
                <div className="flex gap-2">
                  {(selectedComplaint.status || '').toUpperCase() === 'RESOLVED' &&
                    (selectedComplaint.submitter?.collegeId === user.collegeId || selectedComplaint.submitter?.email === user.email) && (
                    <button
                      onClick={() => {
                        const c = selectedComplaint;
                        setSelectedComplaint(null);
                        setFeedbackModalComplaint(c);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs"
                    >
                      {selectedComplaint.feedback ? '★ View Rating' : '★ Rate Resolution'}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-1.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalComplaint && (
        <FeedbackModal
          complaint={feedbackModalComplaint}
          onClose={() => setFeedbackModalComplaint(null)}
          onFeedbackSaved={(fb) => {
            const updated = { ...feedbackModalComplaint, feedback: fb };
            onComplaintUpdated(updated);
            setFeedbackModalComplaint(null);
          }}
        />
      )}

    </div>
  );
};
