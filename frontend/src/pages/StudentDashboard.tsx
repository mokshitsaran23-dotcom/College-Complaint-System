import React, { useState } from 'react';
import { Complaint, Feedback, User } from '../types';
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

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  complaints,
  activeTab,
  setActiveTab,
  onComplaintCreated,
  onComplaintUpdated
}) => {
  // Submission Form State
  const [category, setCategory] = useState('Electrical');
  const [building, setBuilding] = useState('Science Block');
  const [roomDetail, setRoomDetail] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);

  // Detail Modal & Feedback State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [feedbackModalComplaint, setFeedbackModalComplaint] = useState<Complaint | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setFormErrors(prev => ({ ...prev, file: 'Only JPG and PNG images are supported.' }));
        return;
      }
      setFormErrors(prev => { const n = { ...prev }; delete n.file; return n; });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
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
    try {
      const fullLocation = `${building}, ${roomDetail.trim()}`;
      const newComplaint = await api.createComplaint({
        category,
        location: fullLocation,
        description,
        photoUrls: photoPreview ? [photoPreview] : [],
        submitter: { collegeId: user.collegeId, name: user.name, email: user.email }
      });

      onComplaintCreated(newComplaint);
      setSubmittedRefId(newComplaint.referenceId);
      setDescription('');
      setRoomDetail('');
      setPhotoPreview(null);
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <h2 className="text-xl font-extrabold text-slate-800">Report a Campus Issue</h2>
                <p className="text-xs text-slate-500">
                  Submissions are routed directly to campus maintenance squads with an auditable reference ID.
                </p>
              </div>
            </div>

            {submittedRefId ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 text-2xl flex items-center justify-center mx-auto">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-900">Complaint Logged Successfully!</h3>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your tracking reference ID is{' '}
                    <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {submittedRefId}
                    </span>
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSubmittedRefId(null);
                    }}
                    className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl hover:bg-emerald-100/50"
                  >
                    Submit Another
                  </button>
                  <button
                    onClick={() => {
                      setSubmittedRefId(null);
                      setActiveTab('my_complaints');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 shadow-sm"
                  >
                    View in My Complaints
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formErrors.submit && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {formErrors.submit}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Electrical">Electrical (Fans, Lights, Switchboards, AC)</option>
                    <option value="Plumbing">Plumbing (Water Leaks, Faucets, Washrooms)</option>
                    <option value="IT Support">IT Support (WiFi, Ethernet, Lab PCs)</option>
                    <option value="Carpentry">Carpentry (Desks, Chairs, Doors, Locks)</option>
                    <option value="Sanitation">Sanitation / Cleanliness</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Building / Zone *</label>
                    <select
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      <option value="Science Block">Science Block</option>
                      <option value="Engineering Block">Engineering Block</option>
                      <option value="Central Library">Central Library</option>
                      <option value="Hostel Block A">Hostel Block A</option>
                      <option value="Hostel Block B">Hostel Block B</option>
                      <option value="Auditorium 1">Auditorium 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Room / Specific Location *</label>
                    <input
                      type="text"
                      placeholder="e.g. 3rd Floor, Lab 304"
                      value={roomDetail}
                      onChange={(e) => setRoomDetail(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                    {formErrors.location && (
                      <p className="text-red-600 text-[11px] mt-1">{formErrors.location}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the defect, sparks, noise, or urgency..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {formErrors.content && (
                    <p className="text-red-600 text-[11px] mt-1">{formErrors.content}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Attach Photo (JPG/PNG)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition bg-slate-50/50">
                    <input
                      type="file"
                      id="complaint-photo"
                      accept="image/png, image/jpeg"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    {photoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={photoPreview}
                          alt="Upload Preview"
                          className="h-36 w-auto rounded-lg object-cover border shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoPreview(null)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="complaint-photo" className="cursor-pointer">
                        <div className="text-2xl mb-1">📷</div>
                        <span className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                          Click to upload photographic evidence
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">JPG or PNG up to 10MB</p>
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
                  {isSubmitting ? 'Registering Ticket...' : 'Submit Complaint Digitally'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* My Complaints View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">My Registered Complaints</h2>
              <p className="text-xs text-slate-500">
                Track status progression in real time and submit resolution feedback.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('submit')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm"
            >
              + File New Complaint
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="p-12 glass-card rounded-2xl text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="font-bold text-slate-700 text-sm">No complaints logged</h3>
              <p className="text-xs text-slate-400 mt-1">You haven't reported any campus issues yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints.map((item) => (
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

                    <h4 className="font-bold text-slate-800 text-sm mt-1">{item.category}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description || 'No description provided'}</p>
                    <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <span>📍</span>
                      <span>{item.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      {item.status === 'Resolved' && (
                        <button
                          onClick={() => setFeedbackModalComplaint(item)}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                            item.feedback
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                          }`}
                        >
                          {item.feedback ? `★ ${item.feedback.rating}/5 Rated` : '★ Rate Service'}
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedComplaint(item)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                      >
                        Track Progress →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">{selectedComplaint.referenceId}</span>
                <h3 className="text-lg font-extrabold text-slate-800">{selectedComplaint.category} Issue</h3>
                <p className="text-xs text-slate-500">{selectedComplaint.location}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {selectedComplaint.photoUrls && selectedComplaint.photoUrls.length > 0 && (
              <div className="mb-4">
                <img
                  src={selectedComplaint.photoUrls[0]}
                  alt="Issue"
                  className="w-full h-44 object-cover rounded-xl border border-slate-100 shadow-inner"
                />
              </div>
            )}

            <Timeline
              currentStatus={selectedComplaint.status}
              history={[
                {
                  id: 'h1',
                  complaintId: selectedComplaint.id,
                  referenceId: selectedComplaint.referenceId,
                  fromStatus: null,
                  toStatus: 'Open',
                  changedBy: selectedComplaint.submitter.collegeId,
                  changedByRole: 'student',
                  note: 'Digitally submitted with details',
                  timestamp: selectedComplaint.createdAt
                },
                ...(selectedComplaint.assignedAt
                  ? [
                      {
                        id: 'h2',
                        complaintId: selectedComplaint.id,
                        referenceId: selectedComplaint.referenceId,
                        fromStatus: 'Open' as any,
                        toStatus: 'Assigned' as any,
                        changedBy: selectedComplaint.assignedBy || 'Admin',
                        changedByRole: 'admin' as any,
                        note: `Routed to ${selectedComplaint.assignedDepartment} Department`,
                        timestamp: selectedComplaint.assignedAt
                      }
                    ]
                  : []),
                ...(selectedComplaint.resolvedAt
                  ? [
                      {
                        id: 'h3',
                        complaintId: selectedComplaint.id,
                        referenceId: selectedComplaint.referenceId,
                        fromStatus: 'In Progress' as any,
                        toStatus: 'Resolved' as any,
                        changedBy: selectedComplaint.resolvedBy || 'Technician',
                        changedByRole: 'staff' as any,
                        note: 'Issue verified and resolved successfully',
                        timestamp: selectedComplaint.resolvedAt
                      }
                    ]
                  : [])
              ]}
              createdAt={selectedComplaint.createdAt}
            />

            {selectedComplaint.status === 'Resolved' && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    const c = selectedComplaint;
                    setSelectedComplaint(null);
                    setFeedbackModalComplaint(c);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs"
                >
                  {selectedComplaint.feedback ? 'View Submitted Rating' : '★ Submit Feedback & Rating'}
                </button>
              </div>
            )}
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
