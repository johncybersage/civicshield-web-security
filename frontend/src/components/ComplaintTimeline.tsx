import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Clock, MapPin, AlertCircle, PlayCircle, XCircle, User } from 'lucide-react';

interface TimelineEvent {
  id: number;
  new_status: string;
  note?: string;
  created_at: string;
}

interface TimelineProps {
  history: TimelineEvent[];
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
      return <MapPin className="w-5 h-5 text-blue-500" />;
    case 'UNDER_REVIEW':
      return <Clock className="w-5 h-5 text-amber-500" />;
    case 'ASSIGNED':
      return <User className="w-5 h-5 text-indigo-500" />;
    case 'IN_PROGRESS':
      return <PlayCircle className="w-5 h-5 text-purple-500" />;
    case 'RESOLVED':
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'REJECTED':
      return <XCircle className="w-5 h-5 text-rose-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-slate-400" />;
  }
};

export const formatStatus = (status: string) => {
  if (!status) return 'Unknown';
  return String(status).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const ComplaintTimeline: React.FC<TimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <div className="text-slate-500 italic py-4">No timeline history available.</div>;
  }

  // Ensure chronological order (oldest first)
  const sortedHistory = [...history].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 py-2 space-y-8">
      {sortedHistory.map((event, index) => {
        const isLast = index === sortedHistory.length - 1;
        return (
          <div key={event.id} className="relative pl-6">
            <span className="absolute -left-[13px] top-1 bg-white dark:bg-slate-900 rounded-full p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm">
              {getStatusIcon(event.new_status)}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
              <h3 className={`font-semibold ${isLast ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {formatStatus(event.new_status)}
              </h3>
              <time className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md mt-1 sm:mt-0">
                {event.created_at && !isNaN(new Date(event.created_at).getTime()) ? format(new Date(event.created_at), 'dd MMM yyyy, h:mm a') : 'Unknown Date'}
              </time>
            </div>
            {event.note && (
              <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 mt-2">
                {event.note}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintTimeline;
