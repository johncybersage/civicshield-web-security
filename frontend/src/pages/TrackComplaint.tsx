import React, { useState } from 'react';
import { Search, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import ComplaintTimeline, { formatStatus, getStatusIcon } from '../components/ComplaintTimeline';
import { format } from 'date-fns';

const TrackComplaint = () => {
  const [trackingId, setTrackingId] = useState('');
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError('');
    setComplaint(null);

    try {
      const res = await api.get(`/complaints/track/${trackingId.trim()}`);
      setComplaint(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Complaint not found. Please check your Tracking ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animation-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Track Your Complaint</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">Enter the tracking ID provided during registration to check the current status and history of your issue.</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-10 shadow-sm relative z-10 mx-auto max-w-2xl">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="e.g., CIV-20260824-A7X9B2"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-4 py-3.5 bg-white/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-primary-500 focus:border-primary-500 text-lg uppercase tracking-wider font-medium dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !trackingId.trim()}
            className="bg-primary-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-primary-700 hover:shadow-md transition-all disabled:opacity-70 whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Track Now'}
          </button>
        </form>
        {error && (
          <div className="mt-4 flex items-start gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 p-3 rounded-lg border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {complaint && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm animation-fade-in">
          <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-6 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Tracking ID</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{complaint.tracking_id}</p>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                {getStatusIcon(complaint.status)}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatStatus(complaint.status)}</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{complaint.title}</h2>
            {complaint.category && (
              <span className="inline-block bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-medium px-2.5 py-1 rounded-md border border-primary-100 dark:border-primary-800">
                {complaint.category}
              </span>
            )}
          </div>
          
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Submitted</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200">{format(new Date(complaint.created_at), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Time</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200">{format(new Date(complaint.created_at), 'h:mm a')}</p>
                    </div>
                  </div>
                  {complaint.updated_at && (
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-primary-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last Updated</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">{format(new Date(complaint.updated_at), 'dd MMM yyyy, h:mm a')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Status Timeline</h3>
              <ComplaintTimeline history={complaint.history} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackComplaint;
