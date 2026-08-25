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

  const currentStatus = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].new_status : 'SUBMITTED';
  const STANDARD_FLOW = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
  const currentIndex = STANDARD_FLOW.indexOf(currentStatus);
  
  let futureSteps: string[] = [];
  if (currentIndex !== -1 && currentStatus !== 'RESOLVED' && currentStatus !== 'REJECTED') {
    futureSteps = STANDARD_FLOW.slice(currentIndex + 1);
  }

  return (
    <div className="relative border-l-2 border-slate-200 ml-3 py-2 space-y-8">
      {/* Processed (History) Events */}
      {sortedHistory.map((event, index) => {
        const isCurrent = index === sortedHistory.length - 1;
        return (
          <div key={event.id} className="relative pl-6">
            <span className={`absolute -left-[13px] top-1 bg-white rounded-full p-0.5 border ${isCurrent ? 'border-primary-500 shadow-md' : 'border-slate-200 shadow-sm'}`}>
              {getStatusIcon(event.new_status)}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
              <h3 className={`font-semibold ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                {formatStatus(event.new_status)}
              </h3>
              <time className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md mt-1 sm:mt-0">
                {event.created_at && !isNaN(new Date(event.created_at).getTime()) ? format(new Date(event.created_at), 'dd MMM yyyy, h:mm a') : 'Unknown Date'}
              </time>
            </div>
            {event.note && (
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                {event.note}
              </p>
            )}
          </div>
        );
      })}

      {/* Pending (Future) Events */}
      {futureSteps.map((status, index) => (
        <div key={`future-${status}`} className="relative pl-6 opacity-40 grayscale">
          <span className="absolute -left-[13px] top-1 bg-white rounded-full p-0.5 border border-slate-200 shadow-sm">
            {getStatusIcon(status)}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
            <h3 className="font-semibold text-slate-500">
              {formatStatus(status)}
            </h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md mt-1 sm:mt-0 uppercase tracking-wider">
              Pending
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplaintTimeline;
