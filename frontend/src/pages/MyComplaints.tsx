import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Filter, Loader2, MapPin, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import EmptyState from '../components/EmptyState';
import { ComplaintCardSkeleton } from '../components/SkeletonLoader';
import ConfirmationModal from '../components/ConfirmationModal';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDeleteClick = (complaint: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setComplaintToDelete(complaint);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!complaintToDelete) return;
    setIsDeleting(true);
    try {
      const idToDelete = complaintToDelete.tracking_id || complaintToDelete.id;
      await api.delete(`/complaints/${idToDelete}`);
      setComplaints(prev => prev.filter(c => c.id !== complaintToDelete.id));
      setIsModalOpen(false);
      setComplaintToDelete(null);
    } catch (error) {
      console.error('Failed to delete complaint', error);
      alert('Failed to delete the complaint. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      UNDER_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      ASSIGNED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    };
    return styles[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animation-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Complaints</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track and manage your submitted issues.</p>
        </div>
        <button
          onClick={() => navigate('/citizen/create')}
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
            className="w-full pl-10 pr-4 py-2 bg-white/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:text-white"
          />
        </div>
        <div className="relative min-w-[150px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-white/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 appearance-none dark:text-white"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <ComplaintCardSkeleton key={i} />)}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl border-dashed">
          <EmptyState
            icon={complaints.length === 0 ? AlertCircle : Search}
            title={complaints.length === 0 ? 'No complaints yet' : 'No complaints found'}
            description={complaints.length === 0 ? "You haven't submitted any complaints yet. Report your first civic issue." : 'Try adjusting your search or filter criteria.'}
            actionLabel={complaints.length === 0 ? 'Create your first report' : undefined}
            onAction={complaints.length === 0 ? () => navigate('/citizen/create') : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map(complaint => (
            <div 
              key={complaint.id} 
              onClick={() => navigate(`/complaints/${complaint.tracking_id || complaint.id}`)}
              className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group hover:border-primary-200 dark:hover:border-primary-800"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {complaint.tracking_id || `ID: ${complaint.id}`}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusBadge(complaint.status)}`}>
                  {complaint.status.replace(/_/g, ' ')}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(complaint, e)}
                  className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete Complaint"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1">{complaint.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow">{complaint.description}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{complaint.human_readable_address || 'Location provided'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {complaint.created_at && !isNaN(new Date(complaint.created_at).getTime())
                      ? format(new Date(complaint.created_at), 'dd MMM yyyy')
                      : 'Unknown'}
                  </span>
                  <div className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:text-primary-700 transition-colors">
                    View Details &rarr;
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Delete Complaint?"
        message={`Are you sure you want to permanently delete this complaint${complaintToDelete?.tracking_id ? ` (${complaintToDelete.tracking_id})` : ''}? This action cannot be undone. Please confirm that you are deleting this complaint intentionally.`}
        confirmText="Delete Complaint"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsModalOpen(false);
          setComplaintToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MyComplaints;
