import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import ComplaintTimeline, { formatStatus, getStatusIcon } from '../components/ComplaintTimeline';
import AIAnalysisCard from '../components/AIAnalysisCard';
import EvidenceGallery from '../components/EvidenceGallery';
import FeedbackForm from '../components/FeedbackForm';
import ComplaintConversation from '../components/ComplaintConversation';
import DownloadReportButton from '../components/DownloadReportButton';
import { DetailSkeleton } from '../components/SkeletonLoader';
import { format, formatDistanceToNow } from 'date-fns';
import { MapPin, ArrowLeft, AlertTriangle, Save, Loader2, Phone, Clock, Calendar, Tag, CheckCircle, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'SUBMITTED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'UNDER_REVIEW': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'ASSIGNED': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'REJECTED': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
  }
};

const ComplaintDetail = () => {
  const { trackingId } = useParams<{ trackingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Officer update state
  const [newStatus, setNewStatus] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Store secure blob URLs for evidence
  const [evidenceUrls, setEvidenceUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchComplaint();
  }, [trackingId]);

  const fetchComplaint = async () => {
    try {
      let url = `/complaints/${trackingId}`;
      
      const res = await api.get(url);
      
      // Also fetch comments
      try {
        const commentsRes = await api.get(`/complaints/${res.data.id}/comments`);
        res.data.comments = commentsRes.data;
      } catch(e) {
        console.error('Failed to load comments');
        res.data.comments = [];
      }

      setComplaint(res.data);
      setNewStatus(res.data.status);
      
      // Fetch secure evidence images
      if (res.data.evidence && res.data.evidence.length > 0) {
        res.data.evidence.forEach(async (ev: any) => {
          try {
            const imageRes = await api.get(`/complaints/evidence/${ev.id}`, { responseType: 'blob' });
            const blobUrl = URL.createObjectURL(imageRes.data);
            setEvidenceUrls(prev => ({ ...prev, [ev.id]: blobUrl }));
          } catch (e) {
            console.error('Failed to load evidence image', e);
          }
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus || newStatus === complaint.status) return;
    
    setUpdating(true);
    try {
      await api.patch(`/complaints/${complaint.id}`, {
        status: newStatus,
        note: updateNote
      });
      setUpdateNote('');
      await fetchComplaint();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center animation-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Complaint Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            &larr; Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOfficer = user?.role === 'OFFICER' || user?.role === 'ADMIN';

  // Safe date formatting
  const createdDate = complaint?.created_at && !isNaN(new Date(complaint.created_at).getTime())
    ? format(new Date(complaint.created_at), 'dd MMM yyyy, h:mm a')
    : 'Unknown Date';
  const createdAgo = complaint?.created_at && !isNaN(new Date(complaint.created_at).getTime())
    ? formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })
    : '';
  const updatedAgo = complaint?.updated_at && !isNaN(new Date(complaint.updated_at).getTime())
    ? formatDistanceToNow(new Date(complaint.updated_at), { addSuffix: true })
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animation-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        {complaint && <DownloadReportButton complaint={complaint} />}
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded tracking-wider">
                  {complaint.tracking_id || `ID: ${complaint.id}`}
                </span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm shadow-sm ${getStatusBadgeColor(complaint?.status)}`}>
                  {getStatusIcon(complaint?.status)}
                  <span className="font-semibold">{formatStatus(complaint?.status)}</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">{complaint?.title || 'Untitled Complaint'}</h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                {complaint.category && (
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" /> {complaint.category}
                  </span>
                )}
                <span className="flex items-center gap-1.5" title={createdDate}>
                  <Calendar className="w-4 h-4" /> {createdAgo || createdDate}
                </span>
                {updatedAgo && (
                  <span className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                    <Clock className="w-4 h-4" /> Updated {updatedAgo}
                  </span>
                )}
              </div>
            </div>
            
            {/* Officer Update Panel */}
            {isOfficer && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm md:w-72 shrink-0">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Update Status</h3>
                <form onSubmit={handleUpdateStatus} className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <textarea
                    placeholder="Add a note (optional, visible to citizen)"
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    className="w-full text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    rows={2}
                  />
                  <button
                    type="submit"
                    disabled={updating || newStatus === complaint.status}
                    className="w-full flex justify-center items-center gap-2 bg-slate-900 dark:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Update
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-700">
          {/* Main Content */}
          <div className="lg:col-span-2 p-6 sm:p-8 space-y-8">
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Description</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {complaint?.description || 'No description provided.'}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Location</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                {complaint.human_readable_address || complaint.location || 'Location details not provided'}
              </p>
              
              {complaint.latitude && complaint.longitude && (
                <div className="h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner z-0 relative">
                  <MapContainer 
                    center={[complaint.latitude, complaint.longitude]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[complaint.latitude, complaint.longitude]}>
                      <Popup>{complaint.title}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>

            {/* Evidence Gallery */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Evidence</h3>
              <EvidenceGallery
                evidence={complaint.evidence || []}
                evidenceUrls={evidenceUrls}
              />
            </div>

            {/* Conversation */}
            <div className="pt-4">
              <ComplaintConversation 
                complaintId={complaint.id} 
                citizenId={complaint.citizen_id}
                comments={complaint.comments || []}
                status={complaint.status}
              />
            </div>

            {/* Feedback */}
            {complaint.status === 'RESOLVED' && !complaint.feedback && complaint.citizen_id === user?.id && (
              <FeedbackForm 
                complaintId={complaint.id} 
                onSuccess={(feedback) => {
                  setComplaint({ ...complaint, feedback });
                }} 
              />
            )}

            {complaint.feedback && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Citizen Feedback
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= complaint.feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                    />
                  ))}
                </div>
                {complaint.feedback.comment && (
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 italic">
                    "{complaint.feedback.comment}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="p-6 sm:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-800/30">
            {/* AI Analysis */}
            <AIAnalysisCard
              aiPriority={complaint.ai_priority}
              aiCategory={complaint.ai_category}
              finalPriority={complaint.final_priority}
              aiSummary={complaint.ai_summary}
              aiDepartment={complaint.ai_department}
              aiNextAction={complaint.ai_next_action}
            />

            {/* Contact Info */}
            {complaint.phone_number && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Contact Info</h3>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Provided Number</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{complaint.phone_number}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Timeline</h3>
              <ComplaintTimeline history={complaint?.history || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
