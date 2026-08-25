import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle, Send, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface FeedbackFormProps {
  complaintId: number;
  onSuccess: (feedback: any) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ complaintId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [resolvedConfirmed, setResolvedConfirmed] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please provide a rating from 1 to 5 stars.');
      return;
    }
    if (resolvedConfirmed === null) {
      setError('Please confirm if your issue was resolved.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/complaints/${complaintId}/feedback`, {
        rating,
        resolved_confirmed: resolvedConfirmed,
        comment
      });
      onSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit feedback. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animation-fade-in mt-8">
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          Feedback & Rating
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Your issue has been marked as resolved. Please let us know how we did!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Was your issue successfully resolved?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setResolvedConfirmed(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
                resolvedConfirmed === true 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-300 ring-2 ring-emerald-500/20' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" /> Yes
            </button>
            <button
              type="button"
              onClick={() => setResolvedConfirmed(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
                resolvedConfirmed === false 
                  ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-900/30 dark:border-rose-500 dark:text-rose-300 ring-2 ring-rose-500/20' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
            How satisfied are you with the resolution?
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 transition-transform hover:scale-110 focus:outline-none"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-600'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
            Additional Feedback (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more about your experience..."
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow dark:text-white"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-all shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
