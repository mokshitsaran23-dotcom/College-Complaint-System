import React, { useState } from 'react';
import { Complaint, Feedback } from '../types';
import { api } from '../services/api';

interface FeedbackModalProps {
  complaint: Complaint;
  onClose: () => void;
  onFeedbackSaved: (feedback: Feedback) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ complaint, onClose, onFeedbackSaved }) => {
  const [rating, setRating] = useState<number>(complaint.feedback ? complaint.feedback.rating : 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(complaint.feedback ? complaint.feedback.comment : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReadOnly = Boolean(complaint.feedback);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const fb = await api.submitFeedback(complaint.id, rating, comment);
      onFeedbackSaved(fb);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider">
              {complaint.referenceId}
            </span>
            <h3 className="text-lg font-bold text-slate-800">
              {isReadOnly ? 'Submitted Resolution Feedback' : 'Rate Your Resolution Experience'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            ✕
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Overall Satisfaction (1 = Poor, 5 = Excellent)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    type="button"
                    key={star}
                    disabled={isReadOnly}
                    onMouseEnter={() => !isReadOnly && setHoverRating(star)}
                    onMouseLeave={() => !isReadOnly && setHoverRating(0)}
                    onClick={() => !isReadOnly && setRating(star)}
                    className={`text-3xl transition-transform ${
                      active ? 'text-amber-400' : 'text-slate-200'
                    } ${isReadOnly ? 'cursor-default' : 'hover:scale-115 active:scale-95'}`}
                  >
                    ★
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-bold text-slate-600">{rating} / 5 Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback Comments</label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the punctuality, cleanliness, and fix quality?"
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {isReadOnly ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <span>✓</span>
              <span>This review has been submitted and verified into admin reporting metrics.</span>
            </div>
          ) : (
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
