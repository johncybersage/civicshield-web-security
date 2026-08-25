import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUBMITTED': return 'border-blue-500 bg-blue-500';
    case 'UNDER_REVIEW': return 'border-amber-500 bg-amber-500';
    case 'ASSIGNED': return 'border-indigo-500 bg-indigo-500';
    case 'IN_PROGRESS': return 'border-purple-500 bg-purple-500';
    case 'RESOLVED': return 'border-emerald-500 bg-emerald-500';
    case 'REJECTED': return 'border-rose-500 bg-rose-500';
    default: return 'border-slate-400 bg-slate-400';
  }
};

const ComplaintTimeline: React.FC<TimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">No timeline history available</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Updates will appear here as the complaint progresses</p>
      </div>
    );
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
    <div className="relative ml-1 py-2 space-y-0">
      {/* Processed (History) Events */}
      {sortedHistory.map((event, index) => {
        const isCurrent = index === sortedHistory.length - 1;
        const statusColor = getStatusColor(event.new_status);
        const timeAgo = event.created_at && !isNaN(new Date(event.created_at).getTime())
          ? formatDistanceToNow(new Date(event.created_at), { addSuffix: true })
          : '';
        const exactTime = event.created_at && !isNaN(new Date(event.created_at).getTime())
          ? format(new Date(event.created_at), 'dd MMM yyyy, h:mm a')
          : 'Unknown Date';

        return (
          <div key={event.id} className="relative pl-8 pb-8 last:pb-0 group">
            {/* Connector line */}
            {(index < sortedHistory.length - 1 || futureSteps.length > 0) && (
              <div className="absolute left-[11px] top-8 w-0.5 h-full bg-slate-200 dark:bg-slate-700" />
            )}
            
            {/* Step indicator */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
              isCurrent 
                ? `${statusColor} shadow-md ring-4 ring-opacity-20 ${statusColor.includes('blue') ? 'ring-blue-500' : statusColor.includes('amber') ? 'ring-amber-500' : statusColor.includes('indigo') ? 'ring-indigo-500' : statusColor.includes('purple') ? 'ring-purple-500' : statusColor.includes('emerald') ? 'ring-emerald-500' : statusColor.includes('rose') ? 'ring-rose-500' : 'ring-slate-500'}`
                : `${statusColor}`
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>

            {/* Content */}
            <div className={`${isCurrent ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <h3 className={`font-semibold text-sm ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {formatStatus(event.new_status)}
                </h3>
                <time 
                  className="text-xs text-slate-500 dark:text-slate-400" 
                  title={exactTime}
                >
                  {timeAgo || exactTime}
                </time>
              </div>
              {event.note && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-600">
                  {event.note}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Pending (Future) Events */}
      {futureSteps.map((status, index) => (
        <div key={`future-${status}`} className="relative pl-8 pb-8 last:pb-0">
          {/* Connector line */}
          {index < futureSteps.length - 1 && (
            <div className="absolute left-[11px] top-8 w-0.5 h-full bg-slate-200 dark:bg-slate-700 opacity-40" />
          )}
          
          {/* Empty step indicator */}
          <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 opacity-50" />

          <div className="opacity-40">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-500">
                {formatStatus(status)}
              </h3>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                Pending
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplaintTimeline;
