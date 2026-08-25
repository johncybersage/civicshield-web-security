import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Filter, Loader2, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints/');
      // Sort newest first
      const sorted = res.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setComplaints(sorted);
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200',
      UNDER_REVIEW: 'bg-amber-100 text-amber-700 border-amber-200',
      ASSIGNED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      IN_PROGRESS: 'bg-purple-100 text-purple-700 border-purple-200',
      RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animation-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
          <p className="text-slate-600 mt-1">Track and manage your submitted issues.</p>
        </div>
        <button
          onClick={() => navigate('/citizen/report')}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 shadow-sm transition-all whitespace-nowrap"
        >
          + New Complaint
        </button>
      </div>

      <div className="glass-panel p-4 rounded-xl mb-6 flex flex-col sm:flex-row gap-4 relative z-10">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID or Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/70 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="relative min-w-[150px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-white/70 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-16 bg-white/50 border border-slate-200 rounded-2xl border-dashed">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No complaints found</h3>
          <p className="text-slate-500 mb-6">You haven't submitted any complaints matching this criteria.</p>
          <button
            onClick={() => navigate('/citizen/report')}
            className="text-primary-600 font-medium hover:text-primary-700"
          >
            Create your first report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map(complaint => (
            <div key={complaint.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-slate-500 tracking-wider bg-slate-100 px-2 py-1 rounded">
                  {complaint.tracking_id || `ID: ${complaint.id}`}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusBadge(complaint.status)}`}>
                  {complaint.status.replace(/_/g, ' ')}
                </span>
              </div>
              
              <h3 className="font-semibold text-slate-900 line-clamp-1 mb-1">{complaint.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{complaint.description}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{complaint.human_readable_address || 'Location provided'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {format(new Date(complaint.created_at), 'dd MMM yyyy')}
                  </span>
                  <button
                    onClick={() => navigate(`/complaints/${complaint.tracking_id || complaint.id}`)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View Details &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
