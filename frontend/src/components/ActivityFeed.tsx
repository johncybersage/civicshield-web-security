import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Clock, MapPin, PlayCircle, XCircle, User, FileImage, Activity } from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  complaintTitle?: string;
}

interface ActivityFeedProps {
  complaints: any[];
  maxItems?: number;
}

const getEventConfig = (type: string) => {
  switch (type) {
    case 'SUBMITTED':
      return { icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/40', dotColor: 'bg-blue-500' };
    case 'UNDER_REVIEW':
      return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40', dotColor: 'bg-amber-500' };
    case 'ASSIGNED':
      return { icon: User, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/40', dotColor: 'bg-indigo-500' };
    case 'IN_PROGRESS':
      return { icon: PlayCircle, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/40', dotColor: 'bg-purple-500' };
    case 'RESOLVED':
      return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40', dotColor: 'bg-emerald-500' };
    case 'REJECTED':
      return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/40', dotColor: 'bg-rose-500' };
    case 'EVIDENCE':
      return { icon: FileImage, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/40', dotColor: 'bg-cyan-500' };
    default:
      return { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', dotColor: 'bg-slate-400' };
  }
};

const buildActivityEvents = (complaints: any[]): ActivityEvent[] => {
  const events: ActivityEvent[] = [];

  complaints.forEach(complaint => {
    // Add "submitted" event from created_at
    if (complaint.created_at) {
      events.push({
        id: `created-${complaint.id}`,
        type: 'SUBMITTED',
        title: 'Complaint submitted',
        description: complaint.title,
        timestamp: complaint.created_at,
        complaintTitle: complaint.title,
      });
    }

    // Add events from history
    if (complaint.history && Array.isArray(complaint.history)) {
      complaint.history.forEach((h: any) => {
        if (h.new_status && h.new_status !== 'SUBMITTED') {
          events.push({
            id: `history-${h.id}`,
            type: h.new_status,
            title: `Status changed to ${(h.new_status || '').replace(/_/g, ' ').toLowerCase()}`,
            description: h.note || complaint.title,
            timestamp: h.created_at,
            complaintTitle: complaint.title,
          });
        }
      });
    }

    // Add evidence event if evidence exists
    if (complaint.evidence && complaint.evidence.length > 0) {
      const latestEvidence = complaint.evidence[complaint.evidence.length - 1];
      events.push({
        id: `evidence-${complaint.id}`,
        type: 'EVIDENCE',
        title: 'Evidence attached',
        description: complaint.title,
        timestamp: latestEvidence.uploaded_at || complaint.created_at,
        complaintTitle: complaint.title,
      });
    }
  });

  // Sort newest first
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events;
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ complaints, maxItems = 8 }) => {
  const events = buildActivityEvents(complaints).slice(0, maxItems);

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Activity will appear here as you submit and track complaints</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {events.map((event, index) => {
        const config = getEventConfig(event.type);
        const Icon = config.icon;
        const timeAgo = event.timestamp && !isNaN(new Date(event.timestamp).getTime())
          ? formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })
          : 'Unknown time';

        return (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{event.title}</p>
              {event.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{event.description}</p>
              )}
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0 mt-0.5" title={event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}>
              {timeAgo}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
