import React from 'react';
import { AlertCircle, Eye, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface SimilarComplaintCardProps {
  duplicates: any[];
  onCancel: () => void;
  onContinue: (e: React.FormEvent) => void;
}

const SimilarComplaintCard: React.FC<SimilarComplaintCardProps> = ({ duplicates, onCancel, onContinue }) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-sm animation-fade-in overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-amber-100 dark:border-amber-800/50 flex gap-4">
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400">Similar Reports Found Nearby</h3>
          <p className="text-sm text-amber-700 dark:text-amber-500/80 mt-1">
            We found {duplicates.length} similar report{duplicates.length > 1 ? 's' : ''} in this area. To help us process issues faster, please check if your issue has already been reported.
          </p>
        </div>
      </div>
      
      <div className="bg-white/50 dark:bg-slate-900/50 p-4 sm:p-6 space-y-3">
        {duplicates.map(d => (
          <div key={d.tracking_id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                  {d.tracking_id}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                  {(d.status || '').replace(/_/g, ' ')}
                </span>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{d.title}</h4>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {d.human_readable_address || 'Nearby'}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(d.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            <a 
              href={`/track?id=${d.tracking_id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shrink-0"
            >
              <Eye className="w-4 h-4" /> View Details
            </a>
          </div>
        ))}
      </div>
      
      <div className="p-4 sm:p-6 border-t border-amber-100 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors font-medium shadow-sm text-sm text-center"
        >
          Yes, this is my issue. Cancel report.
        </button>
        <button
          type="button"
          onClick={(e) => onContinue(e)}
          className="flex-1 bg-amber-600 text-white px-4 py-2.5 rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-sm text-sm text-center"
        >
          No, my issue is different. Continue submitting.
        </button>
      </div>
    </div>
  );
};

export default SimilarComplaintCard;
