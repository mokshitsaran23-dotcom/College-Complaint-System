import React, { useState } from 'react';
import { isFeedbackAvailable, submitFeedback } from './FeedbackFormLogic';

export interface FeedbackFormProps {
  complaint: { id: string; status: string; referenceId: string };
  existingFeedback?: { rating: number; comment: string } | null;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ complaint, existingFeedback = null }) => {
  const [rating, setRating] = useState<number>(existingFeedback ? existingFeedback.rating : 5);
  const [comment, setComment] = useState<string>(existingFeedback ? existingFeedback.comment : '');
  const [isReadOnly, setIsReadOnly] = useState<boolean>(Boolean(existingFeedback));
  const [submitted, setSubmitted] = useState<boolean>(Boolean(existingFeedback));

  if (!isFeedbackAvailable(complaint)) {
    return (
      <div data-testid="feedback-unavailable" className="p-4 bg-gray-50 border rounded text-gray-500 text-sm">
        Feedback is only available once this complaint is marked Resolved.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitFeedback(complaint.id, rating, comment);
    if (result.success) {
      setIsReadOnly(true);
      setSubmitted(true);
    }
  };

  return (
    <div data-testid="feedback-form-container" className="p-6 bg-white rounded-lg border shadow-sm max-w-md">
      <h3 className="font-bold text-gray-800 text-lg mb-2">Resolution Satisfaction Feedback</h3>
      {submitted && (
        <div data-testid="feedback-success-banner" className="mb-3 p-2.5 bg-green-50 text-green-800 text-sm rounded">
          Thank you! Your feedback has been recorded.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <div data-testid="star-rating" className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                type="button"
                key={star}
                data-testid={"star-" + star}
                disabled={isReadOnly}
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${isReadOnly ? 'cursor-default' : 'hover:scale-110'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <textarea
            data-testid="feedback-comment-input"
            rows={3}
            disabled={isReadOnly}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="How was the resolution quality?"
            className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
          />
        </div>

        {!isReadOnly && (
          <button
            data-testid="submit-feedback-btn"
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2 rounded text-sm hover:bg-blue-700"
          >
            Submit Feedback
          </button>
        )}
      </form>
    </div>
  );
};
