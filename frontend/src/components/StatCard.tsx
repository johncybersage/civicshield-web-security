import React from 'react';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number | string;
  description?: string;
  iconColor?: string;
  iconBg?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  description,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-50',
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="w-16 h-4 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="w-12 h-8 rounded bg-slate-200 dark:bg-slate-700 mb-1" />
        <div className="w-24 h-3 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${iconBg} dark:bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-0.5">{value}</p>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  );
};

export default StatCard;
