import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import {
  PlusCircle, MapPin, Clock, AlertCircle, FileText,
  CheckCircle2, Loader2, AlertTriangle, TrendingUp, BarChart3, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { StatCardSkeleton, ComplaintCardSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import ActivityFeed from '../components/ActivityFeed';
import ConfirmationModal from '../components/ConfirmationModal';

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Complaint {
  id: number;
  tracking_id?: string;
  title: string;
  description: string;
  status: string;
  category?: string;
  ai_priority?: string;
  final_priority?: string;
  latitude?: number;
  longitude?: number;
  human_readable_address?: string;
  location?: string;
  evidence?: any[];
  history?: any[];
  created_at: string;
  updated_at?: string;
}

// Status colors for charts
const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#f59e0b',
  ASSIGNED: '#6366f1',
  IN_PROGRESS: '#8b5cf6',
  RESOLVED: '#10b981',
  REJECTED: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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

const CitizenHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints/');
        setComplaints(res.data || []);
      } catch (err) {
        console.error('Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleDeleteClick = (complaint: Complaint, e: React.MouseEvent) => {
    e.preventDefault();
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

  // Compute statistics
  const totalCount = complaints.length;
  const submittedCount = complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
  const highPriorityCount = complaints.filter(c => {
    const p = (c.final_priority || c.ai_priority || '').toUpperCase();
    return p === 'HIGH' || p === 'CRITICAL';
  }).length;

  // Status distribution for pie chart
  const statusData = Object.entries(
    complaints.reduce((acc, c) => {
      const s = c.status || 'UNKNOWN';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: STATUS_LABELS[name] || name, value, key: name }));

  // Category distribution for bar chart
  const categoryData = Object.entries(
    complaints.reduce((acc, c) => {
      const cat = c.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Activity over time — group by date
  const activityData = Object.entries(
    complaints.reduce((acc, c) => {
      if (c.created_at && !isNaN(new Date(c.created_at).getTime())) {
        const date = format(new Date(c.created_at), 'MMM dd');
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([date, count]) => ({ date, count }));

  // Complaints with valid coordinates for map
  const mappableComplaints = complaints.filter(c => c.latitude && c.longitude);

  // Recent complaints (latest 6)
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animation-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {getGreeting()}, {user?.name || 'Citizen'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track your civic reports and see how CivicShield is improving your community.
          </p>
        </div>
        <Link
          to="/citizen/create"
          className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap self-start"
        >
          <PlusCircle className="w-5 h-5" />
          New Report
        </Link>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={FileText} title="Total" value={totalCount} description="All complaints" iconColor="text-primary-600" iconBg="bg-primary-50" />
            <StatCard icon={Clock} title="Open" value={submittedCount} description="Awaiting review" iconColor="text-blue-600" iconBg="bg-blue-50" />
            <StatCard icon={TrendingUp} title="In Progress" value={inProgressCount} description="Being addressed" iconColor="text-purple-600" iconBg="bg-purple-50" />
            <StatCard icon={CheckCircle2} title="Resolved" value={resolvedCount} description="Successfully closed" iconColor="text-emerald-600" iconBg="bg-emerald-50" />
            <StatCard icon={AlertTriangle} title="High Priority" value={highPriorityCount} description="Requires attention" iconColor="text-rose-600" iconBg="bg-rose-50" />
          </>
        )}
      </div>

      {/* Analytics Row */}
      {!loading && complaints.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 animate-stagger-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-500" />
              Status Distribution
            </h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tw-bg-opacity, 1)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '13px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">No data</div>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {statusData.map((entry) => (
                <div key={entry.key} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.key] || '#94a3b8' }} />
                  <span className="text-slate-600 dark:text-slate-400">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 animate-stagger-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              By Category
            </h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">No data</div>
            )}
          </div>

          {/* Activity Over Time */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 animate-stagger-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Activity Timeline
            </h3>
            {activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={activityData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '13px',
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#colorCount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">No data</div>
            )}
          </div>
        </div>
      )}

      {/* Map & Activity Row */}
      {!loading && complaints.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complaint Map */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                Complaint Map
              </h3>
            </div>
            {mappableComplaints.length > 0 ? (
              <div className="h-72 relative z-0">
                <MapContainer
                  center={[mappableComplaints[0].latitude!, mappableComplaints[0].longitude!]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {mappableComplaints.map(c => (
                    <Marker key={c.id} position={[c.latitude!, c.longitude!]}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{c.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{c.category || 'General'} • {(c.status || '').replace(/_/g, ' ')}</p>
                          <button
                            onClick={() => navigate(`/complaints/${c.tracking_id || c.id}`)}
                            className="text-primary-600 text-xs font-medium mt-2 hover:underline"
                          >
                            View Details →
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center px-6">
                <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Location Insights</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                  Geographic complaint visualization becomes available when location information is provided during report submission.
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Recent Activity
              </h3>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto custom-scrollbar">
              <ActivityFeed complaints={complaints} maxItems={10} />
            </div>
          </div>
        </div>
      )}

      {/* Recent Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Complaints</h2>
          {complaints.length > 6 && (
            <Link to="/my-complaints" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View all →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(3).fill(0).map((_, i) => <ComplaintCardSkeleton key={i} />)}
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No complaints yet"
            description="Report your first civic issue and help improve your community."
            actionLabel="New Report"
            onAction={() => navigate('/citizen/create')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentComplaints.map(complaint => (
              <Link
                to={`/complaints/${complaint.tracking_id || complaint.id}`}
                key={complaint.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group hover:border-primary-200 dark:hover:border-primary-800 no-underline"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {complaint.tracking_id || `ID: ${complaint.id}`}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusBadge(complaint.status)}`}>
                    {(complaint.status || '').replace(/_/g, ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(complaint, e)}
                    className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors relative z-10"
                    title="Delete Complaint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {complaint.title}
                </h3>
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
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:text-primary-700 transition-colors">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

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

import CreateComplaint from './CreateComplaint';

const CitizenDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<CitizenHome />} />
      <Route path="/create" element={<CreateComplaint />} />
    </Routes>
  );
};

export default CitizenDashboard;
