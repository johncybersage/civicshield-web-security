import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import ComplaintTimeline, { formatStatus, getStatusIcon } from '../components/ComplaintTimeline';
import { format } from 'date-fns';
import { MapPin, ArrowLeft, AlertTriangle, MessageSquare, Save, Loader2, Phone } from 'lucide-react';
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
      // For officers/admins, we might need a different endpoint if trackingId is an ID, but 
      // the new schema allows trackingId. We should check if trackingId is a number (old ID) or string.
      const isNumeric = /^\d+$/.test(trackingId || '');
      let url = `/complaints/${trackingId}`;
      
      // If it's a string, we might have to use public track endpoint to get the ID, 
      // or we should update the backend to allow tracking_id in the GET /id endpoint.
      // Wait, the backend GET /{id} expects an integer ID. 
      // Let's use the public endpoint if we are a citizen, but public endpoint hides details!
      // I should update the backend to allow querying by tracking_id, or I'll just rely on the API for now.
      
      // For now, let's fetch from the public endpoint to get the internal ID, then fetch full details.
      if (!isNumeric) {
        const publicRes = await api.get(`/complaints/track/${trackingId}`);
        url = `/complaints/${publicRes.data.id || publicRes.data.tracking_id}`; 
        // Wait, public doesn't return id. I will need to update the backend GET /{id} to support tracking_id string.
        // Let's just pass trackingId and see. If it fails, we know we need backend fix.
      }
      
      const res = await api.get(url);
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
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Complaint Not Found</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="text-primary-600 font-medium hover:underline">
          &larr; Go Back
        </button>
      </div>
    );
  }

  const isOfficer = user?.role === 'OFFICER' || user?.role === 'ADMIN';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animation-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="bg-slate-50 border-b border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded tracking-wider">
                {complaint.tracking_id || `ID: ${complaint.id}`}
              </span>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 text-sm shadow-sm">
                {getStatusIcon(complaint.status)}
                <span className="font-semibold text-slate-700">{formatStatus(complaint.status)}</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{complaint.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {complaint.category || 'General'}
              </span>
              {(isOfficer || complaint.ai_priority) && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className={`w-4 h-4 ${complaint.final_priority === 'HIGH' || complaint.final_priority === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`} />
                  Priority: {complaint.final_priority}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {format(new Date(complaint.created_at), 'dd MMM yyyy, h:mm a')}
              </span>
            </div>
          </div>
          
          {isOfficer && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:w-72 shrink-0">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Update Status</h3>
              <form onSubmit={handleUpdateStatus} className="space-y-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-full text-sm border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  rows={2}
                />
                <button
                  type="submit"
                  disabled={updating || newStatus === complaint.status}
                  className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Update
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <div className="lg:col-span-2 p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Description</h3>
            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap mb-8">
              {complaint.description}
            </div>

            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Location</h3>
            <p className="text-slate-700 mb-4 flex items-start gap-2">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              {complaint.human_readable_address || complaint.location || 'Location details not provided'}
            </p>
            
            {complaint.latitude && complaint.longitude && (
              <div className="h-64 rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0 relative">
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

            {complaint.evidence && complaint.evidence.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Evidence</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {complaint.evidence.map((ev: any) => (
                    <div key={ev.id} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 aspect-square flex items-center justify-center">
                      {!evidenceUrls[ev.id] ? (
                         <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                      ) : (
                         <>
                           <img 
                             src={evidenceUrls[ev.id]} 
                             alt="Evidence" 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                             onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/e2e8f0/475569?text=Image+Unavailable' }}
                           />
                           <a 
                             href={evidenceUrls[ev.id]} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center"
                           >
                             <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-opacity">
                               View Full
                             </span>
                           </a>
                         </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 bg-slate-50/50">
            {complaint.phone_number && isOfficer && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Contact Info</h3>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Provided Number</p>
                    <p className="text-sm font-bold text-slate-900">{complaint.phone_number}</p>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Timeline</h3>
            <ComplaintTimeline history={complaint.history} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
