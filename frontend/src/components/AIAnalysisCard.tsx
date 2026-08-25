import React from 'react';
import { Brain, AlertTriangle, Tag, Shield } from 'lucide-react';

interface AIAnalysisCardProps {
  aiPriority?: string | null;
  aiCategory?: string | null;
  finalPriority?: string | null;
  aiSummary?: string | null;
  aiDepartment?: string | null;
  aiNextAction?: string | null;
}

const getPriorityConfig = (priority: string | null | undefined) => {
  switch (priority?.toUpperCase()) {
    case 'CRITICAL':
      return { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/30', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500', label: 'Critical' };
    case 'HIGH':
      return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500', label: 'High' };
    case 'MEDIUM':
      return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', label: 'Medium' };
    case 'LOW':
      return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500', label: 'Low' };
    default:
      return { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', dot: 'bg-slate-400', label: priority || 'Unknown' };
  }
};

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ 
  aiPriority, 
  aiCategory, 
  finalPriority,
  aiSummary,
  aiDepartment,
  aiNextAction
}) => {
  // If no AI data available at all, show graceful fallback
  if (!aiPriority && !aiCategory && !finalPriority) {
    return null; // Silently hide if no AI data
  }

  const priorityConfig = getPriorityConfig(aiPriority || finalPriority);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Civic Analysis</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Google Gemini</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Priority */}
        {(aiPriority || finalPriority) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Priority Level</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${priorityConfig.bg} border ${priorityConfig.border}`}>
              <span className={`w-2 h-2 rounded-full ${priorityConfig.dot}`} />
              <span className={`text-sm font-bold ${priorityConfig.color}`}>
                {priorityConfig.label}
              </span>
            </div>
          </div>
        )}

        {/* AI Category */}
        {aiCategory && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Tag className="w-4 h-4" />
              <span className="font-medium">Issue Category</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
              {aiCategory}
            </span>
          </div>
        )}

        {/* AI Department */}
        {aiDepartment && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 mt-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span className="font-medium">Assigned Dept.</span>
            </div>
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 text-right max-w-[50%]">
              {aiDepartment}
            </span>
          </div>
        )}

        {/* AI Summary */}
        {aiSummary && (
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3 mt-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">AI Summary</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic">
              "{aiSummary}"
            </p>
          </div>
        )}

        {/* AI Next Action */}
        {aiNextAction && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mt-3">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-1">Recommended Action</h4>
            <p className="text-sm text-amber-900 dark:text-amber-300 font-medium">
              {aiNextAction}
            </p>
          </div>
        )}

        {/* Confidence indicator - only show if we have actual AI priority (meaning AI was used) */}
        {aiPriority && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Analysis performed by AI classification engine</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisCard;
