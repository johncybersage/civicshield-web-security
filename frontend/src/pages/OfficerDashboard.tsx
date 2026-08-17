import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ClipboardList, CheckCircle } from 'lucide-react';

interface Complaint {
  id: number;
  title: string;
  description: string;
  status: string;
  category?: string;
  ai_priority?: string;
  final_priority: string;
  created_at: string;
}

const OfficerDashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

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

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/complaints/${id}`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      console.error("Update failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Officer Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Manage and resolve community incidents.</p>
        </div>
        <div className="bg-primary-100 rounded-full p-3">
          <ClipboardList className="h-6 w-6 text-primary-600" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-slate-200">
          <ul className="divide-y divide-slate-200">
            {complaints.map((complaint) => (
              <li key={complaint.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-primary-600 truncate">{complaint.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {complaint.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-slate-500">
                        {complaint.description}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0 gap-4">
                      {complaint.ai_priority && (
                         <span className="text-purple-600 font-medium text-xs border border-purple-200 bg-purple-50 px-2 py-1 rounded">
                           AI Priority: {complaint.ai_priority}
                         </span>
                      )}
                      
                      {complaint.status !== 'RESOLVED' && (
                        <select 
                          className="text-xs border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500"
                          value={complaint.status}
                          onChange={(e) => updateStatus(complaint.id, e.target.value)}
                        >
                          <option value="SUBMITTED">SUBMITTED</option>
                          <option value="UNDER_REVIEW">UNDER REVIEW</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      )}
                      {complaint.status === 'RESOLVED' && (
                        <CheckCircle className="text-green-500 h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
