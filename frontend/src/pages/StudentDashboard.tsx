import React, { useState } from 'react';
import { Complaint, User, StatusHistoryItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import { FeedbackModal } from '../components/FeedbackModal';
import { api } from '../services/api';

interface StudentDashboardProps {
  user: User;
  complaints: Complaint[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onComplaintCreated: (c: Complaint) => void;
  onComplaintUpdated: (c: Complaint) => void;
}

const CATEGORIES = ['Electrical', 'Plumbing', 'IT Support', 'Carpentry', 'Sanitation', 'Facilities', 'Other'];
const BUILDINGS = ['Science Block', 'Academic Block A', 'Academic Block B', 'Hostel Block A', 'Hostel Block B', 'Central Library', 'Auditorium 1', 'Sports Complex', 'Cafeteria'];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  complaints,
  activeTab,
  setActiveTab,
  onComplaintCreated,
  onComplaintUpdated
}) => {
  // Submission Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electrical');
  const [building, setBuilding] = useState('Science Block');
  const [roomDetail, setRoomDetail] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Search & Filter in My Complaints
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal & History State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintHistory, setComplaintHistory] = useState<StatusHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [feedbackModalComplaint, setFeedbackModalComplaint] = useState<Complaint | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Complaint title is required';
    if (!category) errors.category = 'Category is required';
    if (!roomDetail.trim()) errors.location = 'Specific room/location detail is required';
    if (!description.trim() && !photoPreview) {
      errors.content = 'Either an issue description or a photo must be provided';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const fullLocation = `${building}, ${roomDetail.trim()}`;
      const newComplaint = await api.createComplaint({
        title: title.trim(),
        category,
        location: fullLocation,
        description: description.trim(),
        photoUrls: photoPreview ? [photoPreview] : [],
        submitter: { collegeId: user.collegeId, name: user.name, email: user.email, role: user.role }
      });

      onComplaintCreated(newComplaint);
      setSubmittedComplaint(newComplaint);
      setTitle('');
      setDescription('');
      setRoomDetail('');
      setPhotoPreview(null);
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetailModal = async (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setLoadingHistory(true);
    try {
      const data = await api.getComplaintById(complaint.id);
      setComplaintHistory(data.history || []);
      if (data.complaint) setSelectedComplaint(data.complaint);
    } catch {
      setComplaintHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filter complaints for this user
  const userComplaints = complaints.filter(c => c.submitter?.collegeId === user.collegeId);

  const filteredComplaints = userComplaints.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.referenceId?.toLowerCase().includes(q) ||
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q)
    );
  });

  const isStaffRole = user.role === 'staff';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* View Switcher: Submit New vs My Complaints */}
      {activeTab === 'submit' ? (
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-8 border border-slate-200/80 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                📝
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  {isStaffRole ? 'Submit Campus Maintenance Request' : 'Report a Campus Issue'}
                </h2>
                <p className="text-xs text-slate-500">
                  Submissions are routed directly to campus administration and assigned to specialized maintenance crews.
                </p>
              </div>
            </div>

            {submittedComplaint ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 text-2xl flex items-center justify-center mx-auto">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-900">Complaint Submitted Successfully!</h3>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your complaint tracking reference ID is{' '}
                    <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {submittedComplaint.referenceId}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-1">
                    Status: <strong>SUBMITTED</strong> • Admin has been notified and will review your ticket.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setSubmittedComplaint(null)}
                    className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl hover:bg-emerald-100/50"
                  >
                    Submit Another Issue
                  </button>
                  <button
                    onClick={() => {
                      setSubmittedComplaint(null);
                      setActiveTab('my_complaints');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 shadow-sm"
                  >
                    View in My Complaints →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formErrors.submit && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
                    ⚠️ {formErrors.submit}
                  </div>
                )}

                {/* Complaint Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Complaint Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Water leakage in Block A restroom"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                  />
                  {formErrors.title && (
                    <p className="text-red-600 text-[11px] mt-1">{formErrors.title}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Issue Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Building / Zone *</label>
                    <select
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      {BUILDINGS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Room / Specific Spot *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2nd Floor, Restroom 204"
                      value={roomDetail}
                      onChange={(e) => setRoomDetail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                    />
                    {formErrors.location && (
                      <p className="text-red-600 text-[11px] mt-1">{formErrors.location}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific details about the issue to help technicians bring the right tools..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                  />
                  {formErrors.content && (
                    <p className="text-red-600 text-[11px] mt-1">{formErrors.content}</p>
                  )}
                </div>

                {/* Photo Attachment */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Image / Attachment <span className="text-slate-400 font-normal">(Optional but recommended)</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 rounded-xl p-4 text-center transition">
                    <input
                      type="file"
                      id="complaint-photo-file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    {photoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-32 object-cover rounded-lg border border-slate-200 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoPreview(null)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs font-bold shadow flex items-center justify-center hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="complaint-photo-file" className="cursor-pointer block py-2">
                        <div className="text-2xl mb-1">📷</div>
                        <span className="text-xs font-bold text-blue-600 hover:underline">
                          Upload Photo of the Issue
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 10MB</p>
                      </label>
                    )}
                  </div>
                  {formErrors.file && (
                    <p className="text-red-600 text-[11px] mt-1">{formErrors.file}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering Ticket...' : 'Submit Complaint Digitally 📤'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* MY COMPLAINTS VIEW */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                {isStaffRole ? 'My Staff Service Requests' : 'My Registered Complaints'}
              </h2>
              <p className="text-xs text-slate-500">
                Track status progression in real time, view resolution proofs, and submit feedback.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search my complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => setActiveTab('submit')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition shrink-0"
              >
                + New Complaint
              </button>
            </div>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="p-16 glass-card rounded-2xl text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="font-bold text-slate-700 text-sm">No complaints found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery ? 'No complaints match your search query.' : "You haven't reported any campus issues yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredComplaints.map((item) => {
                const isResolved = (item.status || '').toUpperCase() === 'RESOLVED';

                return (
                  <div
                    key={item.id}
                    className="glass-card p-5 rounded-2xl border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                          {item.referenceId}
                        </span>
                        <StatusBadge status={item.status} size="sm" />
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mt-1">{item.title || item.category}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description || 'No description provided'}</p>

                      <div className="text-[11px] text-slate-500 mt-2.5 flex items-center gap-1.5">
                        <span>📍</span>
                        <span>{item.location}</span>
                      </div>

                      {item.assignedDepartment && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          Routed to: <span className="font-semibold text-slate-700">{item.assignedDepartment} Squad</span>
                        </div>
                      )}

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

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        {isResolved && (
                          <button
                            onClick={() => setFeedbackModalComplaint(item)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                              item.feedback
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                            }`}
                          >
                            {item.feedback ? `★ ${item.feedback.rating}/5 Rated` : '★ Rate Service'}
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenDetailModal(item)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                        >
                          Track Progress →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DETAIL & AUDIT TIMELINE MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 max-h-[92vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedComplaint.referenceId}
                  </span>
                  <StatusBadge status={selectedComplaint.status} size="sm" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
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

            {/* RESOLUTION DETAILS & APPROVED PROOF PHOTO (Step 5.A Requirement) */}
            {(selectedComplaint.status || '').toUpperCase() === 'RESOLVED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                  <span>✓</span>
                  <span>Complaint Resolved Successfully</span>
                </div>
                <p className="text-xs text-emerald-800">
                  The campus maintenance crew has completed the required physical work and the administrator has verified and approved the resolution.
                </p>
                {selectedComplaint.resolvedAt && (
                  <div className="text-[11px] text-emerald-700">
                    <strong>Resolved Date & Time:</strong> {new Date(selectedComplaint.resolvedAt).toLocaleString()}
                  </div>
                )}
                {selectedComplaint.completionPhotoUrl && (
                  <div className="pt-2">
                    <span className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">
                      📸 Verified Maintenance Proof Photo:
                    </span>
                    <img
                      src={selectedComplaint.completionPhotoUrl}
                      alt="Verified resolution proof"
                      className="h-36 w-full object-cover rounded-xl border-2 border-emerald-400 shadow-sm"
                    />
                  </div>
                )}
                {selectedComplaint.feedback && (
                  <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-900 flex items-center gap-1 text-[11px]">
                        <span>⭐</span> Your Submitted Review
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

            {/* Photos Display: Initial Defect vs Proof */}
            {(selectedComplaint.status || '').toUpperCase() !== 'RESOLVED' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedComplaint.photoUrls && selectedComplaint.photoUrls.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reported Defect Photo</span>
                    <img
                      src={selectedComplaint.photoUrls[0]}
                      alt="Original Issue"
                      className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-inner"
                    />
                  </div>
                )}
                {selectedComplaint.completionPhotoUrl && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Worker Proof Photo</span>
                    <img
                      src={selectedComplaint.completionPhotoUrl}
                      alt="Worker Completion Proof"
                      className="w-full h-32 object-cover rounded-xl border-2 border-emerald-400 shadow-inner"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Timeline Component with Real History */}
            <div>
              {loadingHistory ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading tracking history...</div>
              ) : (
                <Timeline
                  currentStatus={selectedComplaint.status}
                  history={complaintHistory}
                  createdAt={selectedComplaint.createdAt}
                />
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-mono">
                Filed on {new Date(selectedComplaint.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                {(selectedComplaint.status || '').toUpperCase() === 'RESOLVED' && (
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
