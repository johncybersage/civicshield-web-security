import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { PlusCircle, MapPin, Clock, AlertCircle } from 'lucide-react';

interface Complaint {
  id: number;
  tracking_id?: string;
  title: string;
  description: string;
  status: string;
  location: string;
  ai_priority?: string;
  created_at: string;
}

const CitizenList = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints/');
        setComplaints(res.data);
      } catch (err) {
        console.error("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
          <p className="text-slate-500">Track and manage your reported issues.</p>
        </div>
        <Link
          to="/citizen/create"
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Report</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading your complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="mx-auto h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No complaints reported</h3>
          <p className="text-slate-500 mt-1">You haven't reported any issues yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {complaints.map(complaint => (
            <div 
              key={complaint.id} 
              onClick={() => navigate(`/complaints/${complaint.tracking_id || complaint.id}`)}
              className="glass-panel p-6 rounded-2xl hover-lift transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{complaint.title}</h3>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                  complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {complaint.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-600 text-sm line-clamp-2 mb-4">{complaint.description}</p>
              
              <div className="space-y-2 mt-auto border-t border-slate-100 pt-4">
                {complaint.location && (
                  <div className="flex items-center text-xs text-slate-500">
                    <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                    {complaint.location}
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-slate-400" />
                    {complaint.created_at && !isNaN(new Date(complaint.created_at).getTime()) ? new Date(complaint.created_at).toLocaleDateString() : 'Unknown'}
                  </div>
                  <div className="text-primary-600 font-medium group-hover:text-primary-700 flex items-center">
                    View Details &rarr;
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import CreateComplaint from './CreateComplaint';

const CitizenDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<CitizenList />} />
      <Route path="/create" element={<CreateComplaint />} />
    </Routes>
  );
};

export default CitizenDashboard;
