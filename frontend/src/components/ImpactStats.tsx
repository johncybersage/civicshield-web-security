import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { TrendingUp, Users, CheckCircle2, Shield } from 'lucide-react';

interface Stats {
  total_complaints: number;
  resolved_complaints: number;
  resolution_rate: number;
  average_resolution_days: number;
}

const ImpactStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/complaints/aggregate-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch aggregate stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 animate-pulse h-32"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="relative py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">Civic Impact</h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Our Community by the Numbers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-center hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.total_complaints.toLocaleString()}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Reports Submitted</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-center hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.resolved_complaints.toLocaleString()}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Issues Resolved</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-center hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.resolution_rate.toFixed(1)}%</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resolution Rate</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-center hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.average_resolution_days > 0 ? `${stats.average_resolution_days.toFixed(1)} days` : 'N/A'}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Resolution Time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactStats;
