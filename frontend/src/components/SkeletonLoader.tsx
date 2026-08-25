import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`skeleton ${className}`}>&nbsp;</div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-16 h-4 rounded" />
    </div>
    <Skeleton className="w-16 h-8 rounded mb-1" />
    <Skeleton className="w-24 h-3 rounded" />
  </div>
);

export const ComplaintCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
    <div className="flex justify-between items-start mb-3">
      <Skeleton className="w-28 h-5 rounded" />
      <Skeleton className="w-20 h-5 rounded-full" />
    </div>
    <Skeleton className="w-3/4 h-5 rounded mb-2" />
    <Skeleton className="w-full h-4 rounded mb-1" />
    <Skeleton className="w-2/3 h-4 rounded mb-4" />
    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
      <Skeleton className="w-40 h-3 rounded mb-3" />
      <div className="flex justify-between">
        <Skeleton className="w-24 h-3 rounded" />
        <Skeleton className="w-20 h-3 rounded" />
      </div>
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
    <Skeleton className="w-40 h-5 rounded mb-6" />
    <Skeleton className="w-full h-48 rounded-xl" />
  </div>
);

export const DetailSkeleton: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <Skeleton className="w-20 h-5 rounded mb-6" />
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-32 h-6 rounded" />
          <Skeleton className="w-24 h-6 rounded-full" />
        </div>
        <Skeleton className="w-3/4 h-8 rounded mb-4" />
        <div className="flex gap-4">
          <Skeleton className="w-24 h-4 rounded" />
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-28 h-4 rounded" />
        </div>
      </div>
      <div className="p-6 sm:p-8 border-t border-slate-200 dark:border-slate-700">
        <Skeleton className="w-full h-32 rounded-xl mb-6" />
        <Skeleton className="w-full h-48 rounded-xl" />
      </div>
    </div>
  </div>
);

export default Skeleton;
